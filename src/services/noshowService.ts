/**
 * No-Show Service - 노쇼 관리 및 위약금 청구 서비스
 * 기본: 계좌번호 전달 방식 (빌링키 자동 청구 아님)
 */

// 노쇼 정책 설정
export interface NoshowPolicy {
  graceMinutes: number; // 티타임 후 대기 시간 (분)
  penaltyPercent: number; // 위약금 비율 (%)
  minPenalty: number; // 최소 위약금
  maxPenalty: number; // 최대 위약금
  accountBank: string; // 입금 은행
  accountNumber: string; // 입금 계좌번호
  accountHolder: string; // 예금주
  paymentDeadlineDays: number; // 입금 기한 (일)
}

// 기본 노쇼 정책
export const DEFAULT_NOSHOW_POLICY: NoshowPolicy = {
  graceMinutes: 30, // 티타임 30분 후까지 대기
  penaltyPercent: 30, // 예약금의 30%
  minPenalty: 30000, // 최소 3만원
  maxPenalty: 100000, // 최대 10만원
  accountBank: '토스뱅크',
  accountNumber: '1234-5678-9012',
  accountHolder: '안심골프',
  paymentDeadlineDays: 7, // 7일 이내 입금
};

// 노쇼 상태
export type NoshowStatus =
  | 'PENDING_CHECK' // 체크인 확인 대기
  | 'WARNING_SENT' // 경고 알림 발송됨
  | 'MANAGER_REVIEW' // 매니저 검토 중
  | 'CONFIRMED' // 노쇼 확정
  | 'PENALTY_NOTIFIED' // 위약금 안내 발송됨
  | 'PENALTY_PAID' // 위약금 입금 완료
  | 'DISPUTED' // 이의 제기
  | 'WAIVED'; // 면제

// 노쇼 기록 인터페이스
export interface NoshowRecord {
  id: string;
  bookingId: string;
  teeTimeId: string;
  userId: string;
  status: NoshowStatus;
  penaltyAmount: number;
  detectedAt: string;
  confirmedAt?: string;
  confirmedBy?: string; // manager_id
  notifiedAt?: string;
  paidAt?: string;
  paidAmount?: number;
  disputeReason?: string;
  waiveReason?: string;
  notes?: string;
}

// 노쇼 대상 예약 정보
export interface NoshowCandidate {
  bookingId: string;
  teeTimeId: string;
  userId: string;
  userPhone?: string;
  userName?: string;
  courseName: string;
  courseId: string;
  managerId: string;
  managerPhone?: string;
  teeDate: string;
  teeTime: string;
  amount: number;
  minutesPastTeeTime: number;
}

/**
 * 위약금 계산
 */
export function calculatePenalty(
  bookingAmount: number,
  policy: NoshowPolicy = DEFAULT_NOSHOW_POLICY
): number {
  const { penaltyPercent, minPenalty, maxPenalty } = policy;

  let penalty = Math.floor(bookingAmount * (penaltyPercent / 100));

  // 최소/최대 제한 적용
  if (penalty < minPenalty) {
    penalty = minPenalty;
  }
  if (penalty > maxPenalty) {
    penalty = maxPenalty;
  }

  // 1000원 단위로 반올림
  return Math.floor(penalty / 1000) * 1000;
}

/**
 * 위약금 입금 기한 계산
 */
export function calculatePaymentDeadline(policy: NoshowPolicy = DEFAULT_NOSHOW_POLICY): string {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + policy.paymentDeadlineDays);
  return deadline.toISOString().split('T')[0];
}

/**
 * 티타임 경과 시간 계산 (분)
 */
export function calculateMinutesPastTeeTime(teeDate: string, teeTime: string): number {
  const teeDateTime = new Date(`${teeDate}T${teeTime}:00`);
  const now = new Date();
  const diffMs = now.getTime() - teeDateTime.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * 노쇼 체크 대상 여부 확인
 */
export function isNoshowCheckTarget(
  teeDate: string,
  teeTime: string,
  policy: NoshowPolicy = DEFAULT_NOSHOW_POLICY
): boolean {
  const minutesPast = calculateMinutesPastTeeTime(teeDate, teeTime);
  // grace period 지났고, 너무 오래되지 않았을 때 (24시간 이내)
  return minutesPast >= policy.graceMinutes && minutesPast <= 24 * 60;
}

/**
 * 노쇼 경고 메시지 생성 (매니저용)
 */
export function generateNoshowWarningMessage(
  candidate: NoshowCandidate,
  policy: NoshowPolicy = DEFAULT_NOSHOW_POLICY
): string {
  const penalty = calculatePenalty(candidate.amount, policy);

  return `[안심골프 매니저] 노쇼 의심 예약

골프장: ${candidate.courseName}
예약일시: ${candidate.teeDate} ${candidate.teeTime}
고객: ${candidate.userName || '미등록'}
연락처: ${candidate.userPhone || '없음'}
예약금: ${candidate.amount.toLocaleString()}원
예상 위약금: ${penalty.toLocaleString()}원

티타임 ${candidate.minutesPastTeeTime}분 경과
체크인 확인 후 노쇼 처리해주세요.`;
}

/**
 * 노쇼 위약금 안내 메시지 생성 (고객용)
 * 계좌번호 전달 방식
 */
export function generatePenaltyNoticeMessage(
  candidate: NoshowCandidate,
  penaltyAmount: number,
  policy: NoshowPolicy = DEFAULT_NOSHOW_POLICY
): string {
  const deadline = calculatePaymentDeadline(policy);

  return `[안심골프] 노쇼 위약금 안내

고객님의 예약이 노쇼 처리되었습니다.

골프장: ${candidate.courseName}
예약일시: ${candidate.teeDate} ${candidate.teeTime}

위약금: ${penaltyAmount.toLocaleString()}원

■ 입금 안내
은행: ${policy.accountBank}
계좌: ${policy.accountNumber}
예금주: ${policy.accountHolder}
입금기한: ${deadline}

입금 시 예약자명으로 입금해주세요.
문의: 고객센터 02-2003-2005`;
}

/**
 * 노쇼 확정 후 알림 메시지 (매니저용)
 */
export function generateNoshowConfirmedMessage(
  candidate: NoshowCandidate,
  penaltyAmount: number
): string {
  return `[안심골프] 노쇼 확정 완료

골프장: ${candidate.courseName}
예약일시: ${candidate.teeDate} ${candidate.teeTime}
고객: ${candidate.userName || '미등록'} (${candidate.userPhone || '연락처 없음'})
위약금: ${penaltyAmount.toLocaleString()}원

고객에게 위약금 안내 알림이 발송되었습니다.`;
}

/**
 * 노쇼 입금 확인 메시지 (고객용)
 */
export function generatePenaltyPaidMessage(courseName: string, paidAmount: number): string {
  return `[안심골프] 위약금 입금 확인

${courseName} 노쇼 위약금 ${paidAmount.toLocaleString()}원이 정상 입금되었습니다.

이용해주셔서 감사합니다.`;
}

/**
 * 노쇼 ID 생성
 */
export function generateNoshowId(): string {
  return `noshow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 노쇼 상태 전이 검증
 */
export function canTransitionTo(currentStatus: NoshowStatus, newStatus: NoshowStatus): boolean {
  const allowedTransitions: Record<NoshowStatus, NoshowStatus[]> = {
    PENDING_CHECK: ['WARNING_SENT', 'WAIVED'],
    WARNING_SENT: ['MANAGER_REVIEW', 'WAIVED'],
    MANAGER_REVIEW: ['CONFIRMED', 'WAIVED', 'DISPUTED'],
    CONFIRMED: ['PENALTY_NOTIFIED', 'WAIVED', 'DISPUTED'],
    PENALTY_NOTIFIED: ['PENALTY_PAID', 'DISPUTED', 'WAIVED'],
    PENALTY_PAID: [], // 최종 상태
    DISPUTED: ['CONFIRMED', 'WAIVED'],
    WAIVED: [], // 최종 상태
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * 노쇼 통계 인터페이스
 */
export interface NoshowStats {
  totalNoshows: number;
  confirmedNoshows: number;
  pendingPenalties: number;
  paidPenalties: number;
  waivedNoshows: number;
  totalPenaltyAmount: number;
  paidPenaltyAmount: number;
}
