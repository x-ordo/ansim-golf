/**
 * Dumping Check Cron Job
 * 15분마다 실행 - 덤핑 규칙에 따른 자동 가격 조정
 */

interface Env {
  DB: D1Database;
}

interface TeeTimeRecord {
  id: string;
  course_id: string;
  date: string;
  time: string;
  price: number;
  original_price: number;
  type: string;
  status: string;
}

// 덤핑 규칙 (서비스에서 가져옴)
interface DumpingRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: {
    hoursBeforeTeeTime?: number;
    maxHoursBeforeTeeTime?: number;
    minOccupancyRate?: number;
    dayOfWeek?: number[];
  };
  action: {
    discountPercent: number;
    minPrice: number;
  };
}

// 기본 덤핑 규칙
const DUMPING_RULES: DumpingRule[] = [
  {
    id: 'rule_urgent_6h',
    name: '당일 긴급 덤핑 (6시간 전)',
    enabled: true,
    priority: 1,
    conditions: { hoursBeforeTeeTime: 6, maxHoursBeforeTeeTime: 0 },
    action: { discountPercent: 30, minPrice: 70000 },
  },
  {
    id: 'rule_urgent_12h',
    name: '당일 덤핑 (12시간 전)',
    enabled: true,
    priority: 2,
    conditions: { hoursBeforeTeeTime: 12, maxHoursBeforeTeeTime: 6 },
    action: { discountPercent: 20, minPrice: 80000 },
  },
  {
    id: 'rule_tomorrow',
    name: '내일 덤핑 (24시간 전)',
    enabled: true,
    priority: 3,
    conditions: { hoursBeforeTeeTime: 24, maxHoursBeforeTeeTime: 12 },
    action: { discountPercent: 15, minPrice: 90000 },
  },
];

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const results = await processDumping(env);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron:Dumping] Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * 덤핑 처리 메인 로직
 */
async function processDumping(env: Env): Promise<{
  checked: number;
  updated: number;
  updates: Array<{ id: string; oldPrice: number; newPrice: number; rule: string }>;
}> {
  // 48시간 이내 AVAILABLE 티타임 조회
  const query = `
    SELECT id, course_id, date, time, price, original_price, type, status
    FROM tee_times
    WHERE status = 'AVAILABLE'
    AND datetime(date || ' ' || time) <= datetime('now', '+48 hours')
    AND datetime(date || ' ' || time) > datetime('now')
    ORDER BY date ASC, time ASC
  `;

  const { results } = await env.DB.prepare(query).all();
  const teeTimes = results as TeeTimeRecord[];

  const updates: Array<{ id: string; oldPrice: number; newPrice: number; rule: string }> = [];

  for (const teeTime of teeTimes) {
    const result = applyDumping(teeTime);

    if (result.priceChanged) {
      // 가격 업데이트
      const updateQuery = `
        UPDATE tee_times
        SET price = ?, updated_at = datetime('now')
        WHERE id = ?
      `;

      await env.DB.prepare(updateQuery).bind(result.newPrice, teeTime.id).run();

      // 덤핑 로그 기록
      const logId = `dump_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const logQuery = `
        INSERT INTO dumping_logs (id, tee_time_id, previous_price, new_price, rule_id, applied_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `;

      try {
        await env.DB.prepare(logQuery)
          .bind(logId, teeTime.id, teeTime.price, result.newPrice, result.appliedRule)
          .run();
      } catch {
        // 로그 테이블이 없어도 계속 진행
        console.warn('[Dumping] Log table might not exist');
      }

      updates.push({
        id: teeTime.id,
        oldPrice: teeTime.price,
        newPrice: result.newPrice,
        rule: result.appliedRule,
      });

      console.log(
        `[Dumping] Updated ${teeTime.id}: ${teeTime.price} -> ${result.newPrice} (${result.appliedRule})`
      );
    }
  }

  console.log(`[Cron:Dumping] Checked: ${teeTimes.length}, Updated: ${updates.length}`);

  return {
    checked: teeTimes.length,
    updated: updates.length,
    updates,
  };
}

/**
 * 티타임에 덤핑 규칙 적용
 */
function applyDumping(teeTime: TeeTimeRecord): {
  newPrice: number;
  appliedRule: string;
  priceChanged: boolean;
} {
  const hoursUntil = calculateHoursUntilTeeTime(teeTime.date, teeTime.time);
  const dayOfWeek = new Date(teeTime.date).getDay();

  // 우선순위 순으로 규칙 확인
  const sortedRules = DUMPING_RULES.filter((r) => r.enabled).sort(
    (a, b) => a.priority - b.priority
  );

  for (const rule of sortedRules) {
    const { conditions } = rule;

    // 시간 조건 확인
    if (conditions.hoursBeforeTeeTime !== undefined) {
      if (hoursUntil > conditions.hoursBeforeTeeTime) continue;
    }

    if (conditions.maxHoursBeforeTeeTime !== undefined) {
      if (hoursUntil < conditions.maxHoursBeforeTeeTime) continue;
    }

    // 요일 조건 확인
    if (conditions.dayOfWeek && conditions.dayOfWeek.length > 0) {
      if (!conditions.dayOfWeek.includes(dayOfWeek)) continue;
    }

    // 규칙 적용
    const newPrice = calculateDumpingPrice(teeTime.original_price, rule);

    return {
      newPrice,
      appliedRule: rule.id,
      priceChanged: newPrice !== teeTime.price,
    };
  }

  return {
    newPrice: teeTime.price,
    appliedRule: 'none',
    priceChanged: false,
  };
}

/**
 * 티타임까지 남은 시간 계산
 */
function calculateHoursUntilTeeTime(date: string, time: string): number {
  const teeDateTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  const diffMs = teeDateTime.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * 덤핑 가격 계산
 */
function calculateDumpingPrice(originalPrice: number, rule: DumpingRule): number {
  const { discountPercent, minPrice } = rule.action;

  const discountAmount = Math.floor(originalPrice * (discountPercent / 100));
  let newPrice = originalPrice - discountAmount;

  if (newPrice < minPrice) {
    newPrice = minPrice;
  }

  return Math.floor(newPrice / 1000) * 1000;
}
