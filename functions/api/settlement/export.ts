/**
 * Settlement Export API
 * 정산 리포트 CSV 다운로드
 */

interface Env {
  DB: D1Database;
}

// GET /api/settlement/export?id=xxx - CSV 다운로드
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const url = new URL(context.request.url);
  const settlementId = url.searchParams.get('id');

  if (!settlementId) {
    return new Response(JSON.stringify({ error: 'Settlement ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 정산 기본 정보 조회
    const summaryQuery = `
      SELECT * FROM settlements WHERE id = ?
    `;

    const { results: summaryResults } = await env.DB.prepare(summaryQuery).bind(settlementId).all();

    const summary = summaryResults?.[0] as {
      id: string;
      period: string;
      start_date: string;
      end_date: string;
    } | null;

    if (!summary) {
      return new Response(JSON.stringify({ error: 'Settlement not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 정산 상세 항목 조회
    const itemsQuery = `
      SELECT
        si.booking_id,
        c.name as course_name,
        m.name as manager_name,
        t.date as tee_date,
        t.time as tee_time,
        si.amount as booking_amount,
        si.pg_fee,
        si.commission,
        si.vat,
        si.net_amount,
        b.status as booking_status
      FROM settlement_items si
      JOIN bookings b ON si.booking_id = b.id
      JOIN tee_times t ON b.tee_time_id = t.id
      JOIN golf_courses c ON t.course_id = c.id
      LEFT JOIN managers m ON t.manager_id = m.id
      WHERE si.settlement_id = ?
      ORDER BY t.date, t.time
    `;

    const { results: items } = await env.DB.prepare(itemsQuery).bind(settlementId).all();

    // CSV 생성
    const headers = [
      '예약ID',
      '골프장',
      '담당자',
      '티타임일자',
      '티타임',
      '예약금',
      'PG수수료',
      '플랫폼수수료',
      '부가세',
      '정산금액',
      '상태',
    ];

    const rows = (items as Record<string, unknown>[]).map((item) =>
      [
        item.booking_id,
        item.course_name,
        item.manager_name || '',
        item.tee_date,
        item.tee_time,
        item.booking_amount,
        item.pg_fee,
        item.commission,
        item.vat,
        item.net_amount,
        item.booking_status,
      ].join(',')
    );

    // BOM 추가 (Excel 한글 호환)
    const bom = '\uFEFF';
    const csv = bom + [headers.join(','), ...rows].join('\n');

    const filename = `settlement_${summary.period.toLowerCase()}_${summary.start_date}_${summary.end_date}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Settlement:Export] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
