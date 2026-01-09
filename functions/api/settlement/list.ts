/**
 * Settlement List API
 * 정산 목록 조회
 */

interface Env {
  DB: D1Database;
}

// GET /api/settlement/list - 정산 목록 조회
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const url = new URL(context.request.url);

  // 쿼리 파라미터
  const period = url.searchParams.get('period'); // DAILY, WEEKLY, MONTHLY
  const status = url.searchParams.get('status'); // PENDING, CALCULATED, CONFIRMED, etc.
  const courseId = url.searchParams.get('courseId');
  const managerId = url.searchParams.get('managerId');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  try {
    let query = `
      SELECT
        s.*,
        (SELECT COUNT(*) FROM settlement_items si WHERE si.settlement_id = s.id) as item_count
      FROM settlements s
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (period) {
      query += ` AND s.period = ?`;
      params.push(period);
    }

    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    if (courseId) {
      query += ` AND s.course_id = ?`;
      params.push(courseId);
    }

    if (managerId) {
      query += ` AND s.manager_id = ?`;
      params.push(managerId);
    }

    if (startDate) {
      query += ` AND s.start_date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND s.end_date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    // 총 정산 금액 통계
    const statsQuery = `
      SELECT
        COUNT(*) as total_count,
        SUM(total_amount) as sum_amount,
        SUM(total_net_amount) as sum_net_amount,
        SUM(total_commission) as sum_commission
      FROM settlements
      WHERE status IN ('CALCULATED', 'CONFIRMED', 'TRANSFERRED', 'COMPLETED')
    `;

    const { results: statsResults } = await env.DB.prepare(statsQuery).all();
    const stats = statsResults?.[0] || {};

    return new Response(
      JSON.stringify({
        settlements: results,
        stats,
        pagination: {
          limit,
          offset,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Settlement:List] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
