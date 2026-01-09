/**
 * No-Show List API
 * 노쇼 목록 조회 (매니저/관리자용)
 */

interface Env {
  DB: D1Database;
}

// GET /api/noshow/list - 노쇼 목록 조회
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const url = new URL(context.request.url);

  // 쿼리 파라미터
  const status = url.searchParams.get('status'); // 상태 필터
  const managerId = url.searchParams.get('managerId'); // 매니저 필터
  const courseId = url.searchParams.get('courseId'); // 골프장 필터
  const startDate = url.searchParams.get('startDate'); // 시작일
  const endDate = url.searchParams.get('endDate'); // 종료일
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  try {
    // 동적 쿼리 빌드
    let query = `
      SELECT
        n.id,
        n.booking_id,
        n.tee_time_id,
        n.user_id,
        n.status,
        n.penalty_amount,
        n.detected_at,
        n.confirmed_at,
        n.confirmed_by,
        n.notified_at,
        n.paid_at,
        n.paid_amount,
        n.waive_reason,
        n.notes,
        b.amount as booking_amount,
        c.name as course_name,
        c.id as course_id,
        t.date as tee_date,
        t.time as tee_time,
        t.manager_id,
        u.name as user_name,
        u.phone as user_phone,
        m.name as manager_name
      FROM noshows n
      JOIN bookings b ON n.booking_id = b.id
      JOIN tee_times t ON n.tee_time_id = t.id
      JOIN golf_courses c ON t.course_id = c.id
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN managers m ON n.confirmed_by = m.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (status) {
      query += ` AND n.status = ?`;
      params.push(status);
    }

    if (managerId) {
      query += ` AND t.manager_id = ?`;
      params.push(managerId);
    }

    if (courseId) {
      query += ` AND c.id = ?`;
      params.push(courseId);
    }

    if (startDate) {
      query += ` AND t.date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND t.date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY n.detected_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    // 통계 조회
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'WARNING_SENT' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('CONFIRMED', 'PENALTY_NOTIFIED') THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'PENALTY_PAID' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'WAIVED' THEN 1 ELSE 0 END) as waived,
        SUM(CASE WHEN status IN ('CONFIRMED', 'PENALTY_NOTIFIED') THEN penalty_amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status = 'PENALTY_PAID' THEN paid_amount ELSE 0 END) as paid_amount
      FROM noshows n
      JOIN tee_times t ON n.tee_time_id = t.id
      WHERE 1=1
      ${managerId ? 'AND t.manager_id = ?' : ''}
      ${courseId ? 'AND t.course_id = ?' : ''}
    `;

    const statsParams: string[] = [];
    if (managerId) statsParams.push(managerId);
    if (courseId) statsParams.push(courseId);

    const { results: statsResults } = await env.DB.prepare(statsQuery)
      .bind(...statsParams)
      .all();
    const stats = statsResults?.[0] || {};

    return new Response(
      JSON.stringify({
        noshows: results,
        stats,
        pagination: {
          limit,
          offset,
          total: (stats as { total?: number }).total || 0,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Noshow:List] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
