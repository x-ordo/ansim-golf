/**
 * No-Show Billing Cron Job
 * 30분마다 실행 - 노쇼 체크 및 위약금 안내
 * 기본: 계좌번호 전달 방식
 */

interface Env {
  DB: D1Database;
  KAKAO_REST_API_KEY?: string;
  KAKAO_SENDER_KEY?: string;
}

// 노쇼 정책
const NOSHOW_POLICY = {
  graceMinutes: 30,
  penaltyPercent: 30,
  minPenalty: 30000,
  maxPenalty: 100000,
  accountBank: '토스뱅크',
  accountNumber: '1234-5678-9012',
  accountHolder: '안심골프',
  paymentDeadlineDays: 7,
};

interface NoshowCandidate {
  booking_id: string;
  tee_time_id: string;
  user_id: string;
  user_phone: string | null;
  user_name: string | null;
  course_name: string;
  course_id: string;
  manager_id: string;
  manager_phone: string | null;
  tee_date: string;
  tee_time: string;
  amount: number;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const results = await processNoshowCheck(env);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron:Noshow] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * 노쇼 체크 메인 로직
 */
async function processNoshowCheck(env: Env): Promise<{
  checked: number;
  warningsSent: number;
  penaltiesNotified: number;
}> {
  const results = {
    checked: 0,
    warningsSent: 0,
    penaltiesNotified: 0,
  };

  // 1. 노쇼 후보 조회 (티타임 30분 경과, 24시간 이내, CONFIRMED 상태)
  const candidates = await findNoshowCandidates(env);
  results.checked = candidates.length;

  for (const candidate of candidates) {
    // 2. 이미 노쇼 처리된 건인지 확인
    const existingNoshow = await checkExistingNoshow(env, candidate.booking_id);

    if (!existingNoshow) {
      // 3. 새로운 노쇼 후보 - 매니저에게 경고 발송
      await createNoshowWarning(env, candidate);
      results.warningsSent++;
    } else if (existingNoshow.status === 'CONFIRMED') {
      // 4. 확정된 노쇼 - 아직 위약금 안내 안 됐으면 발송
      if (!existingNoshow.notified_at) {
        await sendPenaltyNotification(env, candidate, existingNoshow);
        results.penaltiesNotified++;
      }
    }
  }

  console.warn(
    `[Cron:Noshow] Checked: ${results.checked}, Warnings: ${results.warningsSent}, Penalties: ${results.penaltiesNotified}`
  );

  return results;
}

/**
 * 노쇼 후보 조회
 */
async function findNoshowCandidates(env: Env): Promise<NoshowCandidate[]> {
  // 티타임이 30분~24시간 전에 지났고, CONFIRMED 상태인 예약
  const query = `
    SELECT
      b.id as booking_id,
      b.tee_time_id,
      b.user_id,
      u.phone as user_phone,
      u.name as user_name,
      c.name as course_name,
      c.id as course_id,
      t.manager_id,
      m.phone as manager_phone,
      t.date as tee_date,
      t.time as tee_time,
      b.amount
    FROM bookings b
    JOIN tee_times t ON b.tee_time_id = t.id
    JOIN golf_courses c ON t.course_id = c.id
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN managers m ON t.manager_id = m.id
    WHERE b.status = 'CONFIRMED'
    AND t.status = 'CONFIRMED'
    AND datetime(t.date || ' ' || t.time) <= datetime('now', '-30 minutes')
    AND datetime(t.date || ' ' || t.time) > datetime('now', '-24 hours')
    ORDER BY t.date ASC, t.time ASC
  `;

  const { results } = await env.DB.prepare(query).all();
  return results as NoshowCandidate[];
}

/**
 * 기존 노쇼 기록 확인
 */
async function checkExistingNoshow(
  env: Env,
  bookingId: string
): Promise<{ id: string; status: string; notified_at: string | null } | null> {
  const query = `
    SELECT id, status, notified_at
    FROM noshows
    WHERE booking_id = ?
  `;

  const { results } = await env.DB.prepare(query).bind(bookingId).all();
  return (results?.[0] as { id: string; status: string; notified_at: string | null }) || null;
}

/**
 * 노쇼 경고 생성 및 매니저 알림
 */
async function createNoshowWarning(env: Env, candidate: NoshowCandidate): Promise<void> {
  const noshowId = `noshow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const penaltyAmount = calculatePenalty(candidate.amount);

  // 노쇼 기록 생성
  const insertQuery = `
    INSERT INTO noshows (
      id, booking_id, tee_time_id, user_id, status,
      penalty_amount, detected_at, created_at
    )
    VALUES (?, ?, ?, ?, 'WARNING_SENT', ?, datetime('now'), datetime('now'))
  `;

  await env.DB.prepare(insertQuery)
    .bind(noshowId, candidate.booking_id, candidate.tee_time_id, candidate.user_id, penaltyAmount)
    .run();

  // 매니저 알림 생성
  const notificationId = `notif_noshow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const templateData = JSON.stringify({
    managerPhone: candidate.manager_phone,
    courseName: candidate.course_name,
    teeDate: candidate.tee_date,
    teeTime: candidate.tee_time,
    userName: candidate.user_name,
    userPhone: candidate.user_phone,
    amount: candidate.amount,
    penaltyAmount,
    noshowId,
  });

  const notifQuery = `
    INSERT INTO notifications (
      id, booking_id, type, status, scheduled_at, template_data, created_at
    )
    VALUES (?, ?, 'NOSHOW_WARNING', 'PENDING', datetime('now'), ?, datetime('now'))
  `;

  await env.DB.prepare(notifQuery).bind(notificationId, candidate.booking_id, templateData).run();

  console.warn(
    `[Noshow] Warning created for booking ${candidate.booking_id}, noshow_id: ${noshowId}`
  );
}

/**
 * 위약금 알림 발송
 */
async function sendPenaltyNotification(
  env: Env,
  candidate: NoshowCandidate,
  noshow: { id: string; status: string }
): Promise<void> {
  const penaltyAmount = calculatePenalty(candidate.amount);
  const deadline = calculatePaymentDeadline();

  // 고객 알림 생성
  const notificationId = `notif_penalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const templateData = JSON.stringify({
    userPhone: candidate.user_phone,
    courseName: candidate.course_name,
    teeDate: candidate.tee_date,
    teeTime: candidate.tee_time,
    penaltyAmount,
    accountBank: NOSHOW_POLICY.accountBank,
    accountNumber: NOSHOW_POLICY.accountNumber,
    accountHolder: NOSHOW_POLICY.accountHolder,
    deadline,
  });

  const notifQuery = `
    INSERT INTO notifications (
      id, booking_id, type, status, scheduled_at, template_data, created_at
    )
    VALUES (?, ?, 'NOSHOW_CHARGED', 'PENDING', datetime('now'), ?, datetime('now'))
  `;

  await env.DB.prepare(notifQuery).bind(notificationId, candidate.booking_id, templateData).run();

  // 노쇼 상태 업데이트
  const updateQuery = `
    UPDATE noshows
    SET status = 'PENALTY_NOTIFIED', notified_at = datetime('now')
    WHERE id = ?
  `;

  await env.DB.prepare(updateQuery).bind(noshow.id).run();

  // 예약 상태 업데이트
  const bookingUpdateQuery = `
    UPDATE bookings
    SET status = 'NOSHOW_CLAIMED'
    WHERE id = ?
  `;

  await env.DB.prepare(bookingUpdateQuery).bind(candidate.booking_id).run();

  console.warn(`[Noshow] Penalty notification sent for booking ${candidate.booking_id}`);
}

/**
 * 위약금 계산
 */
function calculatePenalty(amount: number): number {
  const { penaltyPercent, minPenalty, maxPenalty } = NOSHOW_POLICY;

  let penalty = Math.floor(amount * (penaltyPercent / 100));

  if (penalty < minPenalty) penalty = minPenalty;
  if (penalty > maxPenalty) penalty = maxPenalty;

  return Math.floor(penalty / 1000) * 1000;
}

/**
 * 입금 기한 계산
 */
function calculatePaymentDeadline(): string {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + NOSHOW_POLICY.paymentDeadlineDays);
  return deadline.toISOString().split('T')[0];
}
