/**
 * Toss Payments Webhook Handler
 * 결제 상태 변경 시 자동으로 예약 상태 업데이트 및 알림 발송
 */

interface Env {
  DB: D1Database;
  TOSS_SECRET_KEY: string;
  TOSS_WEBHOOK_SECRET: string;
  KAKAO_REST_API_KEY?: string;
  KAKAO_SENDER_KEY?: string;
}

interface TossWebhookPayload {
  eventType: 'PAYMENT_STATUS_CHANGED';
  createdAt: string;
  data: {
    paymentKey: string;
    orderId: string;
    status: string;
    transactionKey?: string;
  };
}

interface BookingInfo {
  id: string;
  tee_time_id: string;
  user_id: string;
  user_phone?: string;
  amount: number;
  course_name?: string;
  tee_date?: string;
  tee_time?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // 1. Webhook 서명 검증 (Production에서는 HMAC 검증 필요)
    // TODO: request.headers.get('Toss-Signature')로 HMAC 검증 구현
    if (!env.TOSS_WEBHOOK_SECRET) {
      console.warn('TOSS_WEBHOOK_SECRET not configured');
    }

    // 2. Payload 파싱
    const payload: TossWebhookPayload = await request.json();

    if (payload.eventType !== 'PAYMENT_STATUS_CHANGED') {
      return new Response(JSON.stringify({ message: 'Event type not handled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { paymentKey, orderId, status } = payload.data;

    console.log(`[Webhook] Payment status changed: ${orderId} -> ${status}`);

    // 3. 예약 정보 조회
    const bookingQuery = `
      SELECT
        b.id,
        b.tee_time_id,
        b.user_id,
        b.amount,
        u.phone as user_phone,
        c.name as course_name,
        t.date as tee_date,
        t.time as tee_time
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN tee_times t ON b.tee_time_id = t.id
      LEFT JOIN golf_courses c ON t.course_id = c.id
      WHERE b.order_id = ?
    `;

    const { results } = await env.DB.prepare(bookingQuery).bind(orderId).all();
    const booking = results?.[0] as BookingInfo | undefined;

    if (!booking) {
      console.warn(`[Webhook] Booking not found for order: ${orderId}`);
      return new Response(JSON.stringify({ message: 'Booking not found' }), {
        status: 200, // Return 200 to prevent webhook retry
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. 결제 상태에 따른 처리
    let newBookingStatus: string;
    let newTeeTimeStatus: string;
    let shouldNotify = false;
    let notificationType: string | null = null;

    switch (status) {
      case 'DONE':
        // 결제 완료 → 예약 확정
        newBookingStatus = 'CONFIRMED';
        newTeeTimeStatus = 'CONFIRMED';
        shouldNotify = true;
        notificationType = 'BOOKING_CONFIRMED';
        break;

      case 'WAITING_FOR_DEPOSIT':
        // 가상계좌 입금 대기
        newBookingStatus = 'DEPOSIT_PENDING';
        newTeeTimeStatus = 'DEPOSIT_PENDING';
        shouldNotify = true;
        notificationType = 'PAYMENT_PENDING';
        break;

      case 'CANCELED':
      case 'PARTIAL_CANCELED':
      case 'ABORTED':
      case 'EXPIRED':
        // 결제 취소/실패 → 예약 취소, 티타임 재노출
        newBookingStatus = 'CANCELED';
        newTeeTimeStatus = 'AVAILABLE';
        shouldNotify = true;
        notificationType = 'BOOKING_CANCELED';
        break;

      default:
        console.log(`[Webhook] Unhandled payment status: ${status}`);
        return new Response(JSON.stringify({ message: 'Status not handled' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // 5. DB 업데이트 (트랜잭션)
    const updateBookingQuery = `
      UPDATE bookings
      SET status = ?, payment_key = ?, updated_at = datetime('now')
      WHERE id = ?
    `;

    const updateTeeTimeQuery = `
      UPDATE tee_times
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `;

    await env.DB.batch([
      env.DB.prepare(updateBookingQuery).bind(newBookingStatus, paymentKey, booking.id),
      env.DB.prepare(updateTeeTimeQuery).bind(newTeeTimeStatus, booking.tee_time_id),
    ]);

    console.log(`[Webhook] Updated booking ${booking.id} to ${newBookingStatus}`);

    // 6. 알림 스케줄 등록
    if (shouldNotify && notificationType) {
      const insertNotificationQuery = `
        INSERT INTO notifications (id, booking_id, type, status, scheduled_at, template_data, created_at)
        VALUES (?, ?, ?, 'PENDING', datetime('now'), ?, datetime('now'))
      `;

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const templateData = JSON.stringify({
        courseName: booking.course_name,
        date: booking.tee_date,
        time: booking.tee_time,
        amount: booking.amount,
        userPhone: booking.user_phone,
      });

      await env.DB.prepare(insertNotificationQuery)
        .bind(notificationId, booking.id, notificationType, templateData)
        .run();

      console.log(
        `[Webhook] Scheduled notification: ${notificationType} for booking ${booking.id}`
      );

      // 7. 즉시 알림 발송 시도 (비동기)
      // MVP: 알림톡 대신 콘솔 로그
      // Production: 카카오 알림톡 API 호출
      if (env.KAKAO_REST_API_KEY && env.KAKAO_SENDER_KEY) {
        // TODO: 카카오 알림톡 발송 구현
        console.log(`[Notification] Would send ${notificationType} to ${booking.user_phone}`);
      }
    }

    // 8. 취소 시 덤핑 로직 트리거
    if (newTeeTimeStatus === 'AVAILABLE') {
      // 티타임 재노출 시 덤핑 규칙 적용 검토
      console.log(
        `[Dumping] TeeTime ${booking.tee_time_id} is now available - check dumping rules`
      );
      // TODO: 덤핑 서비스 호출
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Booking ${booking.id} updated to ${newBookingStatus}`,
        notificationScheduled: shouldNotify,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Webhook] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
