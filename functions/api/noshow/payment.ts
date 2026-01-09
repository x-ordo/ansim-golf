/**
 * No-Show Payment API
 * 위약금 입금 확인 처리
 */

interface Env {
  DB: D1Database;
}

interface PaymentRequest {
  noshowId: string;
  paidAmount: number;
  managerId: string;
  notes?: string;
}

// POST /api/noshow/payment - 위약금 입금 확인
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body: PaymentRequest = await request.json();

    if (!body.noshowId || !body.paidAmount || !body.managerId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: noshowId, paidAmount, managerId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await confirmPayment(env, body);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Noshow:Payment] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * 위약금 입금 확인 처리
 */
async function confirmPayment(
  env: Env,
  request: PaymentRequest
): Promise<{ success: boolean; message: string }> {
  // 노쇼 기록 조회
  const noshowQuery = `
    SELECT n.*, b.user_id, u.phone as user_phone, c.name as course_name
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
        user_phone: string | null;
        course_name: string;
      }
    | undefined;

  if (!noshow) {
    return { success: false, message: 'No-show record not found' };
  }

  // 상태 검증
  if (!['CONFIRMED', 'PENALTY_NOTIFIED'].includes(noshow.status)) {
    return {
      success: false,
      message: `Cannot mark payment for no-show in status: ${noshow.status}`,
    };
  }

  // 입금액 검증 (일부 입금도 허용)
  if (request.paidAmount <= 0) {
    return { success: false, message: 'Invalid payment amount' };
  }

  // 노쇼 상태 업데이트
  const updateQuery = `
    UPDATE noshows
    SET status = 'PENALTY_PAID',
        paid_at = datetime('now'),
        paid_amount = ?,
        notes = ?
    WHERE id = ?
  `;

  await env.DB.prepare(updateQuery)
    .bind(request.paidAmount, request.notes || null, request.noshowId)
    .run();

  // 예약 상태 업데이트
  const bookingUpdateQuery = `
    UPDATE bookings
    SET status = 'NOSHOW_PAID'
    WHERE id = ?
  `;

  await env.DB.prepare(bookingUpdateQuery).bind(noshow.booking_id).run();

  // 입금 확인 알림 생성 (고객용)
  const notificationId = `notif_paid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const templateData = JSON.stringify({
    userPhone: noshow.user_phone,
    courseName: noshow.course_name,
    paidAmount: request.paidAmount,
  });

  const notifQuery = `
    INSERT INTO notifications (
      id, booking_id, type, status, scheduled_at, template_data, created_at
    )
    VALUES (?, ?, 'PENALTY_PAID_CONFIRM', 'PENDING', datetime('now'), ?, datetime('now'))
  `;

  try {
    await env.DB.prepare(notifQuery).bind(notificationId, noshow.booking_id, templateData).run();
  } catch {
    // 알림 생성 실패해도 계속 진행
    console.warn('[Noshow:Payment] Failed to create notification');
  }

  console.warn(`[Noshow:Payment] Confirmed: ${request.noshowId}, amount: ${request.paidAmount}`);

  return {
    success: true,
    message: `Payment of ${request.paidAmount.toLocaleString()}원 confirmed for no-show ${request.noshowId}`,
  };
}

// GET /api/noshow/payment?noshowId=xxx - 위약금 상태 조회
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const url = new URL(context.request.url);
  const noshowId = url.searchParams.get('noshowId');

  if (!noshowId) {
    return new Response(JSON.stringify({ error: 'Missing noshowId parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const query = `
      SELECT n.*, c.name as course_name, t.date as tee_date, t.time as tee_time,
             u.name as user_name, u.phone as user_phone
      FROM noshows n
      JOIN tee_times t ON n.tee_time_id = t.id
      JOIN golf_courses c ON t.course_id = c.id
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.id = ?
    `;

    const { results } = await env.DB.prepare(query).bind(noshowId).all();
    const noshow = results?.[0];

    if (!noshow) {
      return new Response(JSON.stringify({ error: 'No-show record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(noshow), {
      status: 200,
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
