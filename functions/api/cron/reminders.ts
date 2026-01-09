/**
 * Reminder Cron Job
 * 매시 정각 실행 - 라운드 리마인더 생성 및 발송
 */

interface Env {
  DB: D1Database;
  KAKAO_REST_API_KEY?: string;
  KAKAO_SENDER_KEY?: string;
}

interface UpcomingBooking {
  id: string;
  user_id: string;
  user_phone: string;
  tee_time_id: string;
  course_name: string;
  tee_date: string;
  tee_time: string;
  amount: number;
}

// Cloudflare Cron Trigger Handler
export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const results = await processReminders(env);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron:Reminders] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * 리마인더 처리 메인 로직
 */
async function processReminders(env: Env): Promise<{
  d1Reminders: number;
  d0Reminders: number;
  pendingSent: number;
}> {
  const now = new Date();
  const results = {
    d1Reminders: 0,
    d0Reminders: 0,
    pendingSent: 0,
  };

  // 1. D-1 리마인더 생성 (내일 라운딩 예약)
  // 매일 18:00에 내일 예약에 대한 리마인더 생성
  if (now.getHours() === 18) {
    results.d1Reminders = await createD1Reminders(env);
  }

  // 2. D-0 리마인더 생성 (2시간 후 티타임)
  results.d0Reminders = await createD0Reminders(env);

  // 3. 대기 중인 알림 발송
  results.pendingSent = await sendPendingNotifications(env);

  console.log(
    `[Cron:Reminders] Processed: D-1=${results.d1Reminders}, D-0=${results.d0Reminders}, Sent=${results.pendingSent}`
  );

  return results;
}

/**
 * D-1 리마인더 생성 (내일 라운딩)
 */
async function createD1Reminders(env: Env): Promise<number> {
  // 내일 날짜 계산
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // 내일 라운딩 예약 중 아직 D-1 리마인더가 없는 건 조회
  const query = `
    SELECT
      b.id,
      b.user_id,
      u.phone as user_phone,
      b.tee_time_id,
      c.name as course_name,
      t.date as tee_date,
      t.time as tee_time,
      b.amount
    FROM bookings b
    JOIN tee_times t ON b.tee_time_id = t.id
    JOIN golf_courses c ON t.course_id = c.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.status = 'CONFIRMED'
    AND t.date = ?
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.booking_id = b.id AND n.type = 'ROUND_REMINDER_D1'
    )
  `;

  const { results } = await env.DB.prepare(query).bind(tomorrowStr).all();
  const bookings = results as UpcomingBooking[];

  let created = 0;

  for (const booking of bookings) {
    const notificationId = `notif_d1_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const templateData = JSON.stringify({
      userPhone: booking.user_phone,
      courseName: booking.course_name,
      date: booking.tee_date,
      time: booking.tee_time,
      amount: booking.amount,
    });

    const insertQuery = `
      INSERT INTO notifications (id, booking_id, type, status, scheduled_at, template_data, created_at)
      VALUES (?, ?, 'ROUND_REMINDER_D1', 'PENDING', datetime('now'), ?, datetime('now'))
    `;

    await env.DB.prepare(insertQuery).bind(notificationId, booking.id, templateData).run();

    created++;
  }

  return created;
}

/**
 * D-0 리마인더 생성 (2시간 후 티타임)
 */
async function createD0Reminders(env: Env): Promise<number> {
  // 현재 시간 + 2시간 범위의 예약 조회
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const todayStr = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  const targetTime = twoHoursLater.toTimeString().slice(0, 5);

  // 2시간 후 티타임인 예약 중 아직 D-0 리마인더가 없는 건 조회
  const query = `
    SELECT
      b.id,
      b.user_id,
      u.phone as user_phone,
      b.tee_time_id,
      c.name as course_name,
      t.date as tee_date,
      t.time as tee_time,
      b.amount
    FROM bookings b
    JOIN tee_times t ON b.tee_time_id = t.id
    JOIN golf_courses c ON t.course_id = c.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.status = 'CONFIRMED'
    AND t.date = ?
    AND t.time > ? AND t.time <= ?
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.booking_id = b.id AND n.type = 'ROUND_REMINDER_D0'
    )
  `;

  const { results } = await env.DB.prepare(query).bind(todayStr, currentTime, targetTime).all();
  const bookings = results as UpcomingBooking[];

  let created = 0;

  for (const booking of bookings) {
    const notificationId = `notif_d0_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const templateData = JSON.stringify({
      userPhone: booking.user_phone,
      courseName: booking.course_name,
      date: booking.tee_date,
      time: booking.tee_time,
    });

    const insertQuery = `
      INSERT INTO notifications (id, booking_id, type, status, scheduled_at, template_data, created_at)
      VALUES (?, ?, 'ROUND_REMINDER_D0', 'PENDING', datetime('now'), ?, datetime('now'))
    `;

    await env.DB.prepare(insertQuery).bind(notificationId, booking.id, templateData).run();

    created++;
  }

  return created;
}

/**
 * 대기 중인 알림 발송
 */
async function sendPendingNotifications(env: Env): Promise<number> {
  const query = `
    SELECT id, booking_id, type, template_data
    FROM notifications
    WHERE status = 'PENDING'
    AND scheduled_at <= datetime('now')
    ORDER BY scheduled_at ASC
    LIMIT 50
  `;

  const { results } = await env.DB.prepare(query).all();
  const notifications = results as { id: string; type: string; template_data: string }[];

  let sent = 0;

  for (const notification of notifications) {
    const templateData = JSON.parse(notification.template_data || '{}');

    // MVP: 실제 발송 대신 로깅
    console.log(`[Notification] Sending ${notification.type} to ${templateData.userPhone}`);

    // TODO: 카카오 알림톡 실제 발송 구현
    // if (env.KAKAO_REST_API_KEY && templateData.userPhone) {
    //   await sendKakaoAlimtalk(...)
    // }

    // 상태 업데이트
    const updateQuery = `
      UPDATE notifications
      SET status = 'SENT', sent_at = datetime('now')
      WHERE id = ?
    `;

    await env.DB.prepare(updateQuery).bind(notification.id).run();
    sent++;
  }

  return sent;
}
