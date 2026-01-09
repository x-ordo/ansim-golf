/**
 * Dumping Service - 동적 가격 조정 엔진
 * 티타임 잔여 시간, 점유율 등을 기반으로 자동 가격 조정
 */

// 덤핑 규칙 인터페이스
export interface DumpingRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number; // 낮을수록 우선 적용
  conditions: DumpingConditions;
  action: DumpingAction;
}

// 덤핑 조건
export interface DumpingConditions {
  hoursBeforeTeeTime?: number; // 티타임 N시간 전
  maxHoursBeforeTeeTime?: number; // 최대 N시간 전까지만 적용
  minOccupancyRate?: number; // 점유율 N% 미만일 때
  dayOfWeek?: number[]; // 특정 요일만 (0=일, 1=월, ...)
  courseIds?: string[]; // 특정 골프장만
  bookingTypes?: string[]; // 특정 예약 유형만
}

// 덤핑 액션
export interface DumpingAction {
  discountPercent: number; // 할인율 (%)
  minPrice: number; // 최저가 제한
  maxDiscount?: number; // 최대 할인 금액
}

// 기본 덤핑 규칙
export const DEFAULT_DUMPING_RULES: DumpingRule[] = [
  {
    id: 'rule_urgent_6h',
    name: '당일 긴급 덤핑 (6시간 전)',
    enabled: true,
    priority: 1,
    conditions: {
      hoursBeforeTeeTime: 6,
      maxHoursBeforeTeeTime: 0,
    },
    action: {
      discountPercent: 30,
      minPrice: 70000,
    },
  },
  {
    id: 'rule_urgent_12h',
    name: '당일 덤핑 (12시간 전)',
    enabled: true,
    priority: 2,
    conditions: {
      hoursBeforeTeeTime: 12,
      maxHoursBeforeTeeTime: 6,
    },
    action: {
      discountPercent: 20,
      minPrice: 80000,
    },
  },
  {
    id: 'rule_tomorrow',
    name: '내일 덤핑 (24시간 전)',
    enabled: true,
    priority: 3,
    conditions: {
      hoursBeforeTeeTime: 24,
      maxHoursBeforeTeeTime: 12,
    },
    action: {
      discountPercent: 15,
      minPrice: 90000,
    },
  },
  {
    id: 'rule_weekday_low_occupancy',
    name: '평일 저점유 덤핑',
    enabled: true,
    priority: 4,
    conditions: {
      hoursBeforeTeeTime: 48,
      dayOfWeek: [1, 2, 3, 4, 5], // 월~금
      minOccupancyRate: 50,
    },
    action: {
      discountPercent: 10,
      minPrice: 100000,
    },
  },
];

// 티타임 정보 인터페이스
export interface TeeTimeForDumping {
  id: string;
  courseId: string;
  date: string;
  time: string;
  price: number;
  originalPrice: number;
  type: string;
  status: string;
}

/**
 * 티타임까지 남은 시간 계산 (시간 단위)
 */
export function calculateHoursUntilTeeTime(teeDate: string, teeTime: string): number {
  const teeDateTime = new Date(`${teeDate}T${teeTime}:00`);
  const now = new Date();
  const diffMs = teeDateTime.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * 적용 가능한 덤핑 규칙 찾기
 */
export function findApplicableRule(
  teeTime: TeeTimeForDumping,
  rules: DumpingRule[],
  occupancyRate?: number
): DumpingRule | null {
  const hoursUntil = calculateHoursUntilTeeTime(teeTime.date, teeTime.time);
  const dayOfWeek = new Date(teeTime.date).getDay();

  // 우선순위 순으로 정렬된 규칙 확인
  const sortedRules = [...rules].filter((r) => r.enabled).sort((a, b) => a.priority - b.priority);

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

    // 점유율 조건 확인
    if (conditions.minOccupancyRate !== undefined && occupancyRate !== undefined) {
      if (occupancyRate >= conditions.minOccupancyRate) continue;
    }

    // 골프장 조건 확인
    if (conditions.courseIds && conditions.courseIds.length > 0) {
      if (!conditions.courseIds.includes(teeTime.courseId)) continue;
    }

    // 예약 유형 조건 확인
    if (conditions.bookingTypes && conditions.bookingTypes.length > 0) {
      if (!conditions.bookingTypes.includes(teeTime.type)) continue;
    }

    // 모든 조건을 만족하면 이 규칙 반환
    return rule;
  }

  return null;
}

/**
 * 덤핑 가격 계산
 */
export function calculateDumpingPrice(originalPrice: number, rule: DumpingRule): number {
  const { discountPercent, minPrice, maxDiscount } = rule.action;

  // 할인 금액 계산
  let discountAmount = Math.floor(originalPrice * (discountPercent / 100));

  // 최대 할인 제한 적용
  if (maxDiscount && discountAmount > maxDiscount) {
    discountAmount = maxDiscount;
  }

  // 새 가격 계산
  let newPrice = originalPrice - discountAmount;

  // 최저가 제한 적용
  if (newPrice < minPrice) {
    newPrice = minPrice;
  }

  // 1000원 단위로 반올림
  return Math.floor(newPrice / 1000) * 1000;
}

/**
 * 덤핑 적용 결과 인터페이스
 */
export interface DumpingResult {
  teeTimeId: string;
  originalPrice: number;
  newPrice: number;
  discountPercent: number;
  appliedRule: string;
  priceChanged: boolean;
}

/**
 * 티타임에 덤핑 규칙 적용
 */
export function applyDumping(
  teeTime: TeeTimeForDumping,
  rules: DumpingRule[] = DEFAULT_DUMPING_RULES,
  occupancyRate?: number
): DumpingResult {
  const rule = findApplicableRule(teeTime, rules, occupancyRate);

  if (!rule) {
    return {
      teeTimeId: teeTime.id,
      originalPrice: teeTime.originalPrice,
      newPrice: teeTime.price,
      discountPercent: 0,
      appliedRule: 'none',
      priceChanged: false,
    };
  }

  const newPrice = calculateDumpingPrice(teeTime.originalPrice, rule);
  const actualDiscount = Math.round(
    ((teeTime.originalPrice - newPrice) / teeTime.originalPrice) * 100
  );

  return {
    teeTimeId: teeTime.id,
    originalPrice: teeTime.originalPrice,
    newPrice,
    discountPercent: actualDiscount,
    appliedRule: rule.id,
    priceChanged: newPrice !== teeTime.price,
  };
}

/**
 * 덤핑 로그 인터페이스
 */
export interface DumpingLog {
  id: string;
  teeTimeId: string;
  previousPrice: number;
  newPrice: number;
  ruleId: string;
  appliedAt: string;
}

/**
 * 덤핑 로그 ID 생성
 */
export function generateDumpingLogId(): string {
  return `dump_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
