/**
 * Notification Service - 알림 발송 통합 서비스
 * 카카오 알림톡, SMS, 푸시 알림 등을 통합 관리
 */

// 알림 유형
export type NotificationType =
  | 'BOOKING_CONFIRMED' // 예약 확정
  | 'PAYMENT_PENDING' // 입금 대기
  | 'PAYMENT_REMINDER' // 입금 리마인더
  | 'ROUND_REMINDER_D1' // 라운드 D-1 리마인더
  | 'ROUND_REMINDER_D0' // 라운드 당일 리마인더
  | 'NOSHOW_WARNING' // 노쇼 경고
  | 'NOSHOW_CHARGED' // 노쇼 위약금 청구 완료
  | 'BOOKING_CANCELED' // 예약 취소
  | 'PRICE_DROPPED'; // 관심 티타임 가격 인하

// 알림 상태
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELED';

// 알림 데이터 인터페이스
export interface NotificationData {
  id: string;
  bookingId?: string;
  teeTimeId?: string;
  userId?: string;
  type: NotificationType;
  status: NotificationStatus;
  scheduledAt: string;
  sentAt?: string;
  templateData: NotificationTemplateData;
  errorMessage?: string;
}

// 템플릿 데이터
export interface NotificationTemplateData {
  userPhone?: string;
  userName?: string;
  courseName?: string;
  date?: string;
  time?: string;
  amount?: number;
  penaltyAmount?: number;
  originalPrice?: number;
  newPrice?: number;
  managerName?: string;
  refundPolicy?: string;
}

// 카카오 알림톡 템플릿 ID (실제 승인된 템플릿 ID로 교체 필요)
export const ALIMTALK_TEMPLATES: Record<NotificationType, string> = {
  BOOKING_CONFIRMED: 'TPL_BOOKING_CONFIRMED',
  PAYMENT_PENDING: 'TPL_PAYMENT_PENDING',
  PAYMENT_REMINDER: 'TPL_PAYMENT_REMINDER',
  ROUND_REMINDER_D1: 'TPL_ROUND_REMINDER_D1',
  ROUND_REMINDER_D0: 'TPL_ROUND_REMINDER_D0',
  NOSHOW_WARNING: 'TPL_NOSHOW_WARNING',
  NOSHOW_CHARGED: 'TPL_NOSHOW_CHARGED',
  BOOKING_CANCELED: 'TPL_BOOKING_CANCELED',
  PRICE_DROPPED: 'TPL_PRICE_DROPPED',
};

// 알림톡 메시지 생성
export function generateAlimtalkMessage(
  type: NotificationType,
  data: NotificationTemplateData
): string {
  const formatPrice = (price?: number) => (price ? `${price.toLocaleString()}원` : '');

  switch (type) {
    case 'BOOKING_CONFIRMED':
      return `[안심골프] 예약이 확정되었습니다.

골프장: ${data.courseName}
일시: ${data.date} ${data.time}
결제금액: ${formatPrice(data.amount)}

즐거운 라운딩 되세요!`;

    case 'PAYMENT_PENDING':
      return `[안심골프] 입금을 기다리고 있습니다.

골프장: ${data.courseName}
일시: ${data.date} ${data.time}
결제금액: ${formatPrice(data.amount)}

가상계좌로 입금해주세요.`;

    case 'PAYMENT_REMINDER':
      return `[안심골프] 입금 확인이 필요합니다.

골프장: ${data.courseName}
일시: ${data.date} ${data.time}
결제금액: ${formatPrice(data.amount)}

입금 후 자동으로 예약이 확정됩니다.`;

    case 'ROUND_REMINDER_D1':
      return `[안심골프] 내일 라운딩 일정이 있습니다.

골프장: ${data.courseName}
일시: ${data.date} ${data.time}

매너 플레이로 즐거운 라운딩 되세요!`;

    case 'ROUND_REMINDER_D0':
      return `[안심골프] 오늘 라운딩 2시간 전입니다.

골프장: ${data.courseName}
티타임: ${data.time}

안전 운전하세요!`;

    case 'NOSHOW_WARNING':
      return `[안심골프] 체크인을 확인해주세요.

골프장: ${data.courseName}
예약시간: ${data.time}

체크인 미확인 시 노쇼 처리될 수 있습니다.`;

    case 'NOSHOW_CHARGED':
      return `[안심골프] 노쇼 위약금이 청구되었습니다.

골프장: ${data.courseName}
예약일시: ${data.date} ${data.time}
위약금: ${formatPrice(data.penaltyAmount)}

문의: 고객센터 02-2003-2005`;

    case 'BOOKING_CANCELED':
      return `[안심골프] 예약이 취소되었습니다.

골프장: ${data.courseName}
일시: ${data.date} ${data.time}

환불은 ${data.refundPolicy || '정책에 따라'} 처리됩니다.`;

    case 'PRICE_DROPPED':
      return `[안심골프] 관심 티타임 가격이 인하되었습니다!

골프장: ${data.courseName}
일시: ${data.date} ${data.time}
기존가: ${formatPrice(data.originalPrice)}
할인가: ${formatPrice(data.newPrice)}

지금 바로 예약하세요!`;

    default:
      return '';
  }
}

/**
 * 카카오 알림톡 발송 API 호출
 */
export async function sendKakaoAlimtalk(
  apiKey: string,
  senderKey: string,
  phoneNumber: string,
  templateId: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // 전화번호 포맷 정리
  const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');

  try {
    const response = await fetch('https://apis.aligo.in/akv10/alimtalk/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apikey: apiKey,
        userid: 'ansimgolf', // 알리고 사용자 ID
        senderkey: senderKey,
        tpl_code: templateId,
        sender: '02-2003-2005', // 발신번호
        receiver_1: formattedPhone,
        subject_1: '안심골프 알림',
        message_1: message,
      }),
    });

    const result = await response.json();

    if (result.result_code === '1') {
      return { success: true, messageId: result.msg_id };
    } else {
      return { success: false, error: result.message || 'Unknown error' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * 리마인더 스케줄 계산
 * @param teeTimeDate 티타임 날짜 (YYYY-MM-DD)
 * @param teeTimeTime 티타임 시간 (HH:mm)
 * @returns 리마인더 발송 시각 목록
 */
export function calculateReminderSchedules(
  teeTimeDate: string,
  teeTimeTime: string
): { type: NotificationType; scheduledAt: Date }[] {
  const teeTime = new Date(`${teeTimeDate}T${teeTimeTime}:00`);
  const reminders: { type: NotificationType; scheduledAt: Date }[] = [];

  // D-1 리마인더 (전날 18:00)
  const d1Reminder = new Date(teeTime);
  d1Reminder.setDate(d1Reminder.getDate() - 1);
  d1Reminder.setHours(18, 0, 0, 0);

  if (d1Reminder > new Date()) {
    reminders.push({
      type: 'ROUND_REMINDER_D1',
      scheduledAt: d1Reminder,
    });
  }

  // D-0 리마인더 (티타임 2시간 전)
  const d0Reminder = new Date(teeTime);
  d0Reminder.setHours(d0Reminder.getHours() - 2);

  if (d0Reminder > new Date()) {
    reminders.push({
      type: 'ROUND_REMINDER_D0',
      scheduledAt: d0Reminder,
    });
  }

  return reminders;
}

/**
 * 알림 ID 생성
 */
export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
