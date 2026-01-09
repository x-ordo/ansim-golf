/**
 * Notification Send API
 * 대기 중인 알림을 발송하고 상태를 업데이트
 */

interface Env {
  DB: D1Database;
  KAKAO_REST_API_KEY?: string;
  KAKAO_SENDER_KEY?: string;
}

interface NotificationRecord {
  id: string;
  booking_id: string;
  type: string;
  status: string;
  scheduled_at: string;
  template_data: string;
}

// POST /api/notifications/send - 특정 알림 즉시 발송
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = (await request.json()) as { notificationId?: string; sendPending?: boolean };

    if (body.notificationId) {
      // 특정 알림 발송
      const result = await sendNotification(env, body.notificationId);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (body.sendPending) {
      // 대기 중인 알림 일괄 발송
      const results = await sendPendingNotifications(env);
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * 특정 알림 발송
 */
async function sendNotification(
  env: Env,
  notificationId: string
): Promise<{ success: boolean; message: string }> {
  // 알림 정보 조회
  const query = `
    SELECT n.*, b.user_id
    FROM notifications n
    LEFT JOIN bookings b ON n.booking_id = b.id
    WHERE n.id = ? AND n.status = 'PENDING'
  `;

  const { results } = await env.DB.prepare(query).bind(notificationId).all();
  const notification = results?.[0] as NotificationRecord | undefined;

  if (!notification) {
    return { success: false, message: 'Notification not found or already sent' };
  }

  // 템플릿 데이터 파싱
  const templateData = JSON.parse(notification.template_data || '{}');

  // MVP: 실제 알림톡 대신 로깅
  console.log(`[Notification] Sending ${notification.type} to ${templateData.userPhone}`);
  console.log(`[Notification] Template data:`, templateData);

  // TODO: 실제 카카오 알림톡 발송
  // if (env.KAKAO_REST_API_KEY && env.KAKAO_SENDER_KEY && templateData.userPhone) {
  //   const message = generateAlimtalkMessage(notification.type, templateData);
  //   const result = await sendKakaoAlimtalk(
  //     env.KAKAO_REST_API_KEY,
  //     env.KAKAO_SENDER_KEY,
  //     templateData.userPhone,
  //     ALIMTALK_TEMPLATES[notification.type],
  //     message
  //   );
  //   ...
  // }

  // 상태 업데이트
  const updateQuery = `
    UPDATE notifications
    SET status = 'SENT', sent_at = datetime('now')
    WHERE id = ?
  `;

  await env.DB.prepare(updateQuery).bind(notificationId).run();

  return { success: true, message: `Notification ${notificationId} sent` };
}

/**
 * 대기 중인 알림 일괄 발송
 */
async function sendPendingNotifications(
  env: Env
): Promise<{ sent: number; failed: number; errors: string[] }> {
  // 발송 시각이 지난 대기 알림 조회
  const query = `
    SELECT id
    FROM notifications
    WHERE status = 'PENDING'
    AND scheduled_at <= datetime('now')
    ORDER BY scheduled_at ASC
    LIMIT 100
  `;

  const { results } = await env.DB.prepare(query).all();
  const notifications = results as { id: string }[];

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const notification of notifications) {
    const result = await sendNotification(env, notification.id);
    if (result.success) {
      sent++;
    } else {
      failed++;
      errors.push(`${notification.id}: ${result.message}`);
    }
  }

  return { sent, failed, errors };
}
