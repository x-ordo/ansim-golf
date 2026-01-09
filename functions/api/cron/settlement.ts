/**
 * Settlement Cron Job
 * 매일 06:00 실행 - 일간 정산 리포트 자동 생성
 * 매주 월요일 06:00 - 주간 정산 리포트 생성
 * 매월 1일 06:00 - 월간 정산 리포트 생성
 */

interface Env {
  DB: D1Database;
  KAKAO_REST_API_KEY?: string;
  KAKAO_SENDER_KEY?: string;
}

// 정산 정책
const SETTLEMENT_POLICY = {
  commissionRate: 5, // 5%
  minCommission: 1000,
  pgFeeRate: 2.5, // 2.5%
  vatRate: 10, // 10%
  settlementDelay: 1, // T+1
};

type SettlementPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface BookingForSettlement {
  id: string;
  tee_time_id: string;
  course_id: string;
  course_name: string;
  manager_id: string;
  manager_name: string | null;
  tee_date: string;
  tee_time: string;
  amount: number;
  status: string;
}

interface NoshowForSettlement {
  course_id: string;
  noshow_count: number;
  penalty_amount: number;
  paid_amount: number;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const now = new Date();
    const results = {
      daily: null as { created: boolean; id?: string } | null,
      weekly: null as { created: boolean; id?: string } | null,
      monthly: null as { created: boolean; id?: string } | null,
    };

    // 1. 일간 정산 (매일)
    results.daily = await createDailySettlement(env, now);

    // 2. 주간 정산 (월요일만)
    if (now.getDay() === 1) {
      results.weekly = await createWeeklySettlement(env, now);
    }

    // 3. 월간 정산 (1일만)
    if (now.getDate() === 1) {
      results.monthly = await createMonthlySettlement(env, now);
    }

    console.warn(`[Cron:Settlement] Results: ${JSON.stringify(results)}`);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron:Settlement] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * 일간 정산 생성 (어제 완료된 예약)
 */
async function createDailySettlement(
  env: Env,
  now: Date
): Promise<{ created: boolean; id?: string }> {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  return await createSettlement(env, 'DAILY', dateStr, dateStr);
}

/**
 * 주간 정산 생성 (지난주 월~일)
 */
async function createWeeklySettlement(
  env: Env,
  now: Date
): Promise<{ created: boolean; id?: string }> {
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const { startDate, endDate } = getWeeklyPeriod(lastWeek);
  return await createSettlement(env, 'WEEKLY', startDate, endDate);
}

/**
 * 월간 정산 생성 (지난달)
 */
async function createMonthlySettlement(
  env: Env,
  now: Date
): Promise<{ created: boolean; id?: string }> {
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const { startDate, endDate } = getMonthlyPeriod(lastMonth);
  return await createSettlement(env, 'MONTHLY', startDate, endDate);
}

/**
 * 정산 생성 메인 로직
 */
async function createSettlement(
  env: Env,
  period: SettlementPeriod,
  startDate: string,
  endDate: string
): Promise<{ created: boolean; id?: string }> {
  // 1. 이미 생성된 정산이 있는지 확인
  const existingQuery = `
    SELECT id FROM settlements
    WHERE period = ? AND start_date = ? AND end_date = ?
    AND course_id IS NULL
  `;

  const { results: existing } = await env.DB.prepare(existingQuery)
    .bind(period, startDate, endDate)
    .all();

  if (existing && existing.length > 0) {
    return { created: false, id: (existing[0] as { id: string }).id };
  }

  // 2. 해당 기간 완료된 예약 조회
  const bookingsQuery = `
    SELECT
      b.id,
      b.tee_time_id,
      c.id as course_id,
      c.name as course_name,
      t.manager_id,
      m.name as manager_name,
      t.date as tee_date,
      t.time as tee_time,
      b.amount,
      b.status
    FROM bookings b
    JOIN tee_times t ON b.tee_time_id = t.id
    JOIN golf_courses c ON t.course_id = c.id
    LEFT JOIN managers m ON t.manager_id = m.id
    WHERE t.date >= ? AND t.date <= ?
    AND b.status IN ('CONFIRMED', 'COMPLETED', 'NOSHOW_PAID')
    ORDER BY t.date, t.time
  `;

  const { results: bookings } = await env.DB.prepare(bookingsQuery).bind(startDate, endDate).all();

  const bookingList = bookings as BookingForSettlement[];

  // 3. 노쇼 현황 조회
  const noshowQuery = `
    SELECT
      c.id as course_id,
      COUNT(*) as noshow_count,
      SUM(n.penalty_amount) as penalty_amount,
      SUM(COALESCE(n.paid_amount, 0)) as paid_amount
    FROM noshows n
    JOIN tee_times t ON n.tee_time_id = t.id
    JOIN golf_courses c ON t.course_id = c.id
    WHERE t.date >= ? AND t.date <= ?
    AND n.status IN ('CONFIRMED', 'PENALTY_NOTIFIED', 'PENALTY_PAID')
    GROUP BY c.id
  `;

  const { results: noshows } = await env.DB.prepare(noshowQuery).bind(startDate, endDate).all();

  const noshowMap = new Map<string, NoshowForSettlement>();
  for (const ns of noshows as NoshowForSettlement[]) {
    noshowMap.set(ns.course_id, ns);
  }

  // 4. 환불 현황 조회
  const refundQuery = `
    SELECT
      COUNT(*) as refund_count,
      SUM(b.amount) as refund_amount
    FROM bookings b
    JOIN tee_times t ON b.tee_time_id = t.id
    WHERE t.date >= ? AND t.date <= ?
    AND b.status IN ('CANCELLED', 'REFUNDED')
  `;

  const { results: refunds } = await env.DB.prepare(refundQuery).bind(startDate, endDate).all();

  const refundData = (refunds?.[0] as { refund_count: number; refund_amount: number }) || {
    refund_count: 0,
    refund_amount: 0,
  };

  // 5. 정산 금액 계산
  let totalAmount = 0;
  let totalPgFee = 0;
  let totalCommission = 0;
  let totalVat = 0;
  let totalNetAmount = 0;
  let totalNoshowCount = 0;
  let totalNoshowPenalty = 0;
  let totalNoshowPaid = 0;

  const settlementItems: Array<{
    booking_id: string;
    course_id: string;
    amount: number;
    pg_fee: number;
    commission: number;
    vat: number;
    net_amount: number;
  }> = [];

  for (const booking of bookingList) {
    const { pgFee, commission, vat, netAmount } = calculateNetAmount(booking.amount);

    totalAmount += booking.amount;
    totalPgFee += pgFee;
    totalCommission += commission;
    totalVat += vat;
    totalNetAmount += netAmount;

    settlementItems.push({
      booking_id: booking.id,
      course_id: booking.course_id,
      amount: booking.amount,
      pg_fee: pgFee,
      commission,
      vat,
      net_amount: netAmount,
    });
  }

  // 노쇼 합계
  for (const [, ns] of noshowMap) {
    totalNoshowCount += ns.noshow_count;
    totalNoshowPenalty += ns.penalty_amount || 0;
    totalNoshowPaid += ns.paid_amount || 0;
  }

  // 6. 정산 레코드 생성
  const settlementId = generateSettlementId(period, startDate);

  const insertQuery = `
    INSERT INTO settlements (
      id, period, start_date, end_date, status,
      total_bookings, total_amount, total_pg_fee,
      total_commission, total_vat, total_net_amount,
      refunded_bookings, refunded_amount,
      noshow_count, noshow_penalty_amount, noshow_penalty_paid,
      created_at
    )
    VALUES (?, ?, ?, ?, 'CALCULATED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;

  await env.DB.prepare(insertQuery)
    .bind(
      settlementId,
      period,
      startDate,
      endDate,
      bookingList.length,
      totalAmount,
      totalPgFee,
      totalCommission,
      totalVat,
      totalNetAmount,
      refundData.refund_count || 0,
      refundData.refund_amount || 0,
      totalNoshowCount,
      totalNoshowPenalty,
      totalNoshowPaid
    )
    .run();

  // 7. 정산 상세 항목 저장
  for (const item of settlementItems) {
    const itemId = `stl_item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const itemQuery = `
      INSERT INTO settlement_items (
        id, settlement_id, booking_id, course_id,
        amount, pg_fee, commission, vat, net_amount, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    try {
      await env.DB.prepare(itemQuery)
        .bind(
          itemId,
          settlementId,
          item.booking_id,
          item.course_id,
          item.amount,
          item.pg_fee,
          item.commission,
          item.vat,
          item.net_amount
        )
        .run();
    } catch {
      // 상세 항목 저장 실패해도 계속 진행
      console.warn(`[Settlement] Failed to save item for booking ${item.booking_id}`);
    }
  }

  // 8. 매니저에게 알림 생성 (일간 정산만)
  if (period === 'DAILY' && bookingList.length > 0) {
    await createSettlementNotification(env, settlementId, startDate, endDate, totalNetAmount);
  }

  console.warn(
    `[Settlement] Created ${period} settlement: ${settlementId}, bookings: ${bookingList.length}, net: ${totalNetAmount}`
  );

  return { created: true, id: settlementId };
}

/**
 * 정산 알림 생성
 */
async function createSettlementNotification(
  env: Env,
  settlementId: string,
  startDate: string,
  endDate: string,
  netAmount: number
): Promise<void> {
  const notificationId = `notif_stl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const templateData = JSON.stringify({
    settlementId,
    startDate,
    endDate,
    netAmount,
  });

  const query = `
    INSERT INTO notifications (
      id, type, status, scheduled_at, template_data, created_at
    )
    VALUES (?, 'SETTLEMENT_READY', 'PENDING', datetime('now'), ?, datetime('now'))
  `;

  try {
    await env.DB.prepare(query).bind(notificationId, templateData).run();
  } catch {
    console.warn('[Settlement] Failed to create notification');
  }
}

/**
 * 정산 금액 계산
 */
function calculateNetAmount(amount: number): {
  pgFee: number;
  commission: number;
  vat: number;
  netAmount: number;
} {
  const pgFee = Math.floor(amount * (SETTLEMENT_POLICY.pgFeeRate / 100));
  const commission = Math.max(
    Math.floor(amount * (SETTLEMENT_POLICY.commissionRate / 100)),
    SETTLEMENT_POLICY.minCommission
  );
  const vat = Math.floor(commission * (SETTLEMENT_POLICY.vatRate / 100));
  const netAmount = amount - pgFee - commission - vat;

  return {
    pgFee,
    commission,
    vat,
    netAmount: Math.max(netAmount, 0),
  };
}

/**
 * 주간 정산 기간 계산
 */
function getWeeklyPeriod(date: Date): { startDate: string; endDate: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  const startDate = new Date(d.setDate(diff));
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * 월간 정산 기간 계산
 */
function getMonthlyPeriod(date: Date): { startDate: string; endDate: string } {
  const year = date.getFullYear();
  const month = date.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * 정산 ID 생성
 */
function generateSettlementId(period: SettlementPeriod, startDate: string): string {
  const prefix = period.toLowerCase().slice(0, 1);
  const dateStr = startDate.replace(/-/g, '');
  return `stl_${prefix}_${dateStr}_${Math.random().toString(36).substr(2, 6)}`;
}
