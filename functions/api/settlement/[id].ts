/**
 * Settlement Detail API
 * 정산 상세 조회 및 상태 변경
 */

interface Env {
  DB: D1Database;
}

// GET /api/settlement/[id] - 정산 상세 조회
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const settlementId = params.id as string;

  if (!settlementId) {
    return new Response(JSON.stringify({ error: 'Settlement ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 정산 기본 정보 조회
    const summaryQuery = `
      SELECT s.*
      FROM settlements s
      WHERE s.id = ?
    `;

    const { results: summaryResults } = await env.DB.prepare(summaryQuery).bind(settlementId).all();

    const summary = summaryResults?.[0];

    if (!summary) {
      return new Response(JSON.stringify({ error: 'Settlement not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 정산 상세 항목 조회
    const itemsQuery = `
      SELECT
        si.*,
        b.status as booking_status,
        c.name as course_name,
        t.date as tee_date,
        t.time as tee_time,
        m.name as manager_name
      FROM settlement_items si
      JOIN bookings b ON si.booking_id = b.id
      JOIN tee_times t ON b.tee_time_id = t.id
      JOIN golf_courses c ON t.course_id = c.id
      LEFT JOIN managers m ON t.manager_id = m.id
      WHERE si.settlement_id = ?
      ORDER BY t.date, t.time
    `;

    const { results: items } = await env.DB.prepare(itemsQuery).bind(settlementId).all();

    // 일자별 breakdown
    const dateBreakdownQuery = `
      SELECT
        t.date,
        COUNT(*) as booking_count,
        SUM(si.amount) as total_amount,
        SUM(si.net_amount) as net_amount
      FROM settlement_items si
      JOIN bookings b ON si.booking_id = b.id
      JOIN tee_times t ON b.tee_time_id = t.id
      WHERE si.settlement_id = ?
      GROUP BY t.date
      ORDER BY t.date
    `;

    const { results: dateBreakdown } = await env.DB.prepare(dateBreakdownQuery)
      .bind(settlementId)
      .all();

    // 골프장별 breakdown
    const courseBreakdownQuery = `
      SELECT
        c.id as course_id,
        c.name as course_name,
        COUNT(*) as booking_count,
        SUM(si.amount) as total_amount,
        SUM(si.commission) as commission,
        SUM(si.net_amount) as net_amount
      FROM settlement_items si
      JOIN bookings b ON si.booking_id = b.id
      JOIN tee_times t ON b.tee_time_id = t.id
      JOIN golf_courses c ON t.course_id = c.id
      WHERE si.settlement_id = ?
      GROUP BY c.id, c.name
      ORDER BY net_amount DESC
    `;

    const { results: courseBreakdown } = await env.DB.prepare(courseBreakdownQuery)
      .bind(settlementId)
      .all();

    return new Response(
      JSON.stringify({
        summary,
        items,
        breakdown: {
          byDate: dateBreakdown,
          byCourse: courseBreakdown,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Settlement:Detail] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/settlement/[id] - 정산 상태 변경
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const settlementId = params.id as string;

  if (!settlementId) {
    return new Response(JSON.stringify({ error: 'Settlement ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      action: 'confirm' | 'transfer' | 'complete' | 'recalculate';
      notes?: string;
    };

    // 현재 정산 상태 조회
    const currentQuery = `SELECT id, status FROM settlements WHERE id = ?`;
    const { results } = await env.DB.prepare(currentQuery).bind(settlementId).all();
    const current = results?.[0] as { id: string; status: string } | undefined;

    if (!current) {
      return new Response(JSON.stringify({ error: 'Settlement not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let newStatus: string;
    let updateField: string;

    switch (body.action) {
      case 'confirm':
        if (current.status !== 'CALCULATED') {
          return new Response(
            JSON.stringify({ error: 'Can only confirm CALCULATED settlements' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        newStatus = 'CONFIRMED';
        updateField = 'confirmed_at';
        break;

      case 'transfer':
        if (current.status !== 'CONFIRMED') {
          return new Response(
            JSON.stringify({ error: 'Can only transfer CONFIRMED settlements' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        newStatus = 'TRANSFERRED';
        updateField = 'transferred_at';
        break;

      case 'complete':
        if (current.status !== 'TRANSFERRED') {
          return new Response(
            JSON.stringify({ error: 'Can only complete TRANSFERRED settlements' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        newStatus = 'COMPLETED';
        updateField = 'completed_at';
        break;

      case 'recalculate':
        if (!['CALCULATED', 'CONFIRMED'].includes(current.status)) {
          return new Response(
            JSON.stringify({ error: 'Can only recalculate CALCULATED or CONFIRMED settlements' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        newStatus = 'PENDING';
        updateField = 'updated_at';
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // 상태 업데이트
    const updateQuery = `
      UPDATE settlements
      SET status = ?, ${updateField} = datetime('now'), notes = COALESCE(?, notes)
      WHERE id = ?
    `;

    await env.DB.prepare(updateQuery)
      .bind(newStatus, body.notes || null, settlementId)
      .run();

    console.warn(`[Settlement] Status changed: ${settlementId} -> ${newStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Settlement ${body.action} successful`,
        newStatus,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Settlement:Update] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
