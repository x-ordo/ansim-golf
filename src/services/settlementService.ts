/**
 * Settlement Service - 정산 자동화 서비스
 * 일간/주간/월간 정산 리포트 생성 및 관리
 */

// 정산 주기
export type SettlementPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

// 정산 상태
export type SettlementStatus =
  | 'PENDING' // 정산 대기
  | 'CALCULATED' // 계산 완료
  | 'CONFIRMED' // 확정
  | 'TRANSFERRED' // 송금 완료
  | 'COMPLETED'; // 완료

// 정산 정책
export interface SettlementPolicy {
  commissionRate: number; // 수수료율 (%)
  minCommission: number; // 최소 수수료
  pgFeeRate: number; // PG 수수료율 (%)
  vatRate: number; // 부가세율 (%)
  settlementDelay: number; // 정산 지연일 (T+N)
}

// 기본 정산 정책
export const DEFAULT_SETTLEMENT_POLICY: SettlementPolicy = {
  commissionRate: 5, // 5% 수수료
  minCommission: 1000, // 최소 1,000원
  pgFeeRate: 2.5, // PG 수수료 2.5%
  vatRate: 10, // 부가세 10%
  settlementDelay: 1, // T+1 정산
};

// 정산 항목
export interface SettlementItem {
  bookingId: string;
  teeTimeId: string;
  courseId: string;
  courseName: string;
  managerId: string;
  managerName?: string;
  teeDate: string;
  teeTime: string;
  bookingAmount: number; // 예약금
  pgFee: number; // PG 수수료
  commission: number; // 플랫폼 수수료
  vat: number; // 부가세
  netAmount: number; // 정산 금액
  status: string; // 예약 상태
}

// 정산 요약
export interface SettlementSummary {
  id: string;
  period: SettlementPeriod;
  startDate: string;
  endDate: string;
  courseId?: string;
  courseName?: string;
  managerId?: string;
  managerName?: string;
  status: SettlementStatus;

  // 금액 요약
  totalBookings: number; // 총 예약 건수
  totalAmount: number; // 총 예약금
  totalPgFee: number; // 총 PG 수수료
  totalCommission: number; // 총 플랫폼 수수료
  totalVat: number; // 총 부가세
  totalNetAmount: number; // 총 정산 금액

  // 환불/취소 금액
  refundedBookings: number;
  refundedAmount: number;

  // 노쇼 관련
  noshowCount: number;
  noshowPenaltyAmount: number;
  noshowPenaltyPaid: number;

  createdAt: string;
  confirmedAt?: string;
  transferredAt?: string;
}

// 정산 상세 리포트
export interface SettlementReport {
  summary: SettlementSummary;
  items: SettlementItem[];
  breakdown: {
    byDate: DateBreakdown[];
    byCourse?: CourseBreakdown[];
    byManager?: ManagerBreakdown[];
  };
}

// 일자별 내역
export interface DateBreakdown {
  date: string;
  bookingCount: number;
  totalAmount: number;
  netAmount: number;
}

// 골프장별 내역
export interface CourseBreakdown {
  courseId: string;
  courseName: string;
  bookingCount: number;
  totalAmount: number;
  commission: number;
  netAmount: number;
}

// 매니저별 내역
export interface ManagerBreakdown {
  managerId: string;
  managerName: string;
  bookingCount: number;
  totalAmount: number;
  commission: number;
  netAmount: number;
}

/**
 * PG 수수료 계산
 */
export function calculatePgFee(
  amount: number,
  policy: SettlementPolicy = DEFAULT_SETTLEMENT_POLICY
): number {
  return Math.floor(amount * (policy.pgFeeRate / 100));
}

/**
 * 플랫폼 수수료 계산
 */
export function calculateCommission(
  amount: number,
  policy: SettlementPolicy = DEFAULT_SETTLEMENT_POLICY
): number {
  const commission = Math.floor(amount * (policy.commissionRate / 100));
  return Math.max(commission, policy.minCommission);
}

/**
 * 부가세 계산 (수수료에 대한 VAT)
 */
export function calculateVat(
  commission: number,
  policy: SettlementPolicy = DEFAULT_SETTLEMENT_POLICY
): number {
  return Math.floor(commission * (policy.vatRate / 100));
}

/**
 * 정산 금액 계산 (골프장 수령액)
 */
export function calculateNetAmount(
  bookingAmount: number,
  policy: SettlementPolicy = DEFAULT_SETTLEMENT_POLICY
): {
  pgFee: number;
  commission: number;
  vat: number;
  netAmount: number;
} {
  const pgFee = calculatePgFee(bookingAmount, policy);
  const commission = calculateCommission(bookingAmount, policy);
  const vat = calculateVat(commission, policy);
  const netAmount = bookingAmount - pgFee - commission - vat;

  return {
    pgFee,
    commission,
    vat,
    netAmount: Math.max(netAmount, 0),
  };
}

/**
 * 정산 기간 계산 (T+N)
 */
export function calculateSettlementDate(
  bookingDate: string,
  policy: SettlementPolicy = DEFAULT_SETTLEMENT_POLICY
): string {
  const date = new Date(bookingDate);
  date.setDate(date.getDate() + policy.settlementDelay);
  return date.toISOString().split('T')[0];
}

/**
 * 주간 정산 기간 계산 (월요일 ~ 일요일)
 */
export function getWeeklyPeriod(date: Date): { startDate: string; endDate: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정

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
export function getMonthlyPeriod(date: Date): { startDate: string; endDate: string } {
  const year = date.getFullYear();
  const month = date.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // 해당 월의 마지막 날

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * 일간 정산 기간 계산 (어제)
 */
export function getDailyPeriod(date: Date): { startDate: string; endDate: string } {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  return {
    startDate: dateStr,
    endDate: dateStr,
  };
}

/**
 * 정산 ID 생성
 */
export function generateSettlementId(
  period: SettlementPeriod,
  startDate: string,
  entityId?: string
): string {
  const prefix = period.toLowerCase().slice(0, 1); // d, w, m
  const dateStr = startDate.replace(/-/g, '');
  const suffix = entityId ? `_${entityId.slice(-6)}` : '';
  return `stl_${prefix}_${dateStr}${suffix}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * 정산 상태 전이 검증
 */
export function canTransitionTo(
  currentStatus: SettlementStatus,
  newStatus: SettlementStatus
): boolean {
  const allowedTransitions: Record<SettlementStatus, SettlementStatus[]> = {
    PENDING: ['CALCULATED'],
    CALCULATED: ['CONFIRMED', 'PENDING'], // 재계산 가능
    CONFIRMED: ['TRANSFERRED'],
    TRANSFERRED: ['COMPLETED'],
    COMPLETED: [], // 최종 상태
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * 정산 리포트 이메일 메시지 생성
 */
export function generateSettlementEmailContent(summary: SettlementSummary): string {
  const periodLabel =
    summary.period === 'DAILY' ? '일간' : summary.period === 'WEEKLY' ? '주간' : '월간';

  return `[안심골프] ${periodLabel} 정산 리포트

정산 기간: ${summary.startDate} ~ ${summary.endDate}
${summary.courseName ? `골프장: ${summary.courseName}` : ''}
${summary.managerName ? `담당자: ${summary.managerName}` : ''}

■ 예약 현황
- 총 예약: ${summary.totalBookings}건
- 총 예약금: ${summary.totalAmount.toLocaleString()}원
- 환불: ${summary.refundedBookings}건 (${summary.refundedAmount.toLocaleString()}원)

■ 수수료 내역
- PG 수수료: ${summary.totalPgFee.toLocaleString()}원
- 플랫폼 수수료: ${summary.totalCommission.toLocaleString()}원
- 부가세: ${summary.totalVat.toLocaleString()}원

■ 정산 금액
${summary.totalNetAmount.toLocaleString()}원

${
  summary.noshowCount > 0
    ? `
■ 노쇼 현황
- 노쇼 건수: ${summary.noshowCount}건
- 위약금 청구: ${summary.noshowPenaltyAmount.toLocaleString()}원
- 위약금 입금: ${summary.noshowPenaltyPaid.toLocaleString()}원
`
    : ''
}

상세 내역은 관리자 페이지에서 확인하세요.
문의: 02-2003-2005`;
}

/**
 * 정산 알림톡 메시지 생성
 */
export function generateSettlementAlimtalkMessage(summary: SettlementSummary): string {
  const periodLabel =
    summary.period === 'DAILY' ? '일간' : summary.period === 'WEEKLY' ? '주간' : '월간';

  return `[안심골프] ${periodLabel} 정산 안내

기간: ${summary.startDate} ~ ${summary.endDate}
예약: ${summary.totalBookings}건
정산금액: ${summary.totalNetAmount.toLocaleString()}원

상세 내역은 관리자 페이지에서 확인하세요.`;
}

/**
 * CSV 리포트 생성
 */
export function generateSettlementCsv(report: SettlementReport): string {
  const headers = [
    '예약ID',
    '골프장',
    '티타임일자',
    '티타임',
    '예약금',
    'PG수수료',
    '플랫폼수수료',
    '부가세',
    '정산금액',
    '상태',
  ];

  const rows = report.items.map((item) =>
    [
      item.bookingId,
      item.courseName,
      item.teeDate,
      item.teeTime,
      item.bookingAmount,
      item.pgFee,
      item.commission,
      item.vat,
      item.netAmount,
      item.status,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
