/**
 * No-Show Confirm API
 * 매니저가 노쇼를 확정하거나 면제 처리
 */

interface Env {
  DB: D1Database;
  KAKAO_REST_API_KEY?: string;
  KAKAO_SENDER_KEY?: string;
}

interface ConfirmRequest {
  noshowId: string;
  action: 'confirm' | 'waive';
  managerId: string;
  reason?: string;
}

// 노쇼 정책
const NOSHOW_POLICY = {
  penaltyPercent: 30,
  minPenalty: 30000,
  maxPenalty: 100000,
  accountBank: '토스뱅크',
  accountNumber: '1234-5678-9012',
  accountHolder: '안심골프',
  paymentDeadlineDays: 7,
};

// POST /api/noshow/confirm - 노쇼 확정/면제
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body: ConfirmRequest = await request.json();

    if (!body.noshowId || !body.action || !body.managerId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: noshowId, action, managerId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'confirm') {
      const result = await confirmNoshow(env, body);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (body.action === 'waive') {
      const result = await waiveNoshow(env, body);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "confirm" or "waive"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Noshow:Confirm] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * 노쇼 확정
 */
async function confirmNoshow(
  env: Env,
  request: ConfirmRequest
): Promise<{ success: boolean; message: string; penaltyAmount?: number }> {
  // 노쇼 기록 조회
  const noshowQuery = `
    SELECT n.*, b.amount, b.user_id, u.phone as user_phone, u.name as user_name,
           c.name as course_name, t.date as tee_date, t.time as tee_time
    FROM noshows n
    JOIN bookings b ON n.booking_id = b.id
    JOIN tee_times t ON n.tee_time_id = t.id
    JOIN golf_courses c ON t.course_id = c.id
    LEFT JOIN users u ON n.user_id = u.id
    WHERE n.id = ?
  `;

  const { results } = await env.DB.prepare(noshowQuery).bind(request.noshowId).all();
  const noshow = results?.[0] as
    | {
        id: string;
        booking_id: string;
        status: string;
        penalty_amount: number;
        amount: number;
        user_id: string;
        user_phone: string | null;
        user_name: string | null;
        course_name: string;
        tee_date: string;
        tee_time: string;
      }
    | undefined;

  if (!noshow) {
    return { success: false, message: 'No-show record not found' };
  }

  // 상태 검증
  if (!['WARNING_SENT', 'MANAGER_REVIEW', 'DISPUTED'].includes(noshow.status)) {
    return {
      success: false,
      message: `Cannot confirm no-show in status: ${noshow.status}`,
    };
  }

  const penaltyAmount = noshow.penalty_amount || calculatePenalty(noshow.amount);
  const deadline = calculatePaymentDeadline();

  // 노쇼 상태 업데이트
  const updateQuery = `
    UPDATE noshows
    SET status = 'CONFIRMED',
        confirmed_at = datetime('now'),
        confirmed_by = ?,
        penalty_amount = ?
    WHERE id = ?
  `;

  await env.DB.prepare(updateQuery).bind(request.managerId, penaltyAmount, request.noshowId).run();

  // 예약 상태 업데이트
  const bookingUpdateQuery = `
    UPDATE bookings
    SET status = 'NOSHOW_CLAIMED'
    WHERE id = ?
  `;

  await env.DB.prepare(bookingUpdateQuery).bind(noshow.booking_id).run();

  // 고객 위약금 안내 알림 생성
  const notificationId = `notif_penalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const templateData = JSON.stringify({
    userPhone: noshow.user_phone,
    userName: noshow.user_name,
    courseName: noshow.course_name,
    teeDate: noshow.tee_date,
    teeTime: noshow.tee_time,
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

  await env.DB.prepare(notifQuery).bind(notificationId, noshow.booking_id, templateData).run();

  // 노쇼 알림 발송 시간 기록
  const notifiedUpdateQuery = `
    UPDATE noshows
    SET status = 'PENALTY_NOTIFIED', notified_at = datetime('now')
    WHERE id = ?
  `;

  await env.DB.prepare(notifiedUpdateQuery).bind(request.noshowId).run();

  console.warn(`[Noshow] Confirmed: ${request.noshowId} by manager ${request.managerId}`);

  return {
    success: true,
    message: `No-show confirmed. Penalty notification sent to customer.`,
    penaltyAmount,
  };
}

/**
 * 노쇼 면제
 */
async function waiveNoshow(
  env: Env,
  request: ConfirmRequest
): Promise<{ success: boolean; message: string }> {
  // 노쇼 기록 조회
  const noshowQuery = `
    SELECT id, booking_id, status
    FROM noshows
    WHERE id = ?
  `;

  const { results } = await env.DB.prepare(noshowQuery).bind(request.noshowId).all();
  const noshow = results?.[0] as { id: string; booking_id: string; status: string } | undefined;

  if (!noshow) {
    return { success: false, message: 'No-show record not found' };
  }

  // 이미 최종 상태면 변경 불가
  if (['PENALTY_PAID', 'WAIVED'].includes(noshow.status)) {
    return {
      success: false,
      message: `Cannot waive no-show in final status: ${noshow.status}`,
    };
  }

  // 노쇼 면제 처리
  const updateQuery = `
    UPDATE noshows
    SET status = 'WAIVED',
        waive_reason = ?,
        confirmed_by = ?,
        confirmed_at = datetime('now')
    WHERE id = ?
  `;

  await env.DB.prepare(updateQuery)
    .bind(request.reason || 'Manager waived', request.managerId, request.noshowId)
    .run();

  // 예약 상태 복원 (CONFIRMED → COMPLETED로 처리)
  const bookingUpdateQuery = `
    UPDATE bookings
    SET status = 'COMPLETED'
    WHERE id = ?
  `;

  await env.DB.prepare(bookingUpdateQuery).bind(noshow.booking_id).run();

  console.warn(`[Noshow] Waived: ${request.noshowId} by manager ${request.managerId}`);

  return {
    success: true,
    message: 'No-show waived. Booking marked as completed.',
  };
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
