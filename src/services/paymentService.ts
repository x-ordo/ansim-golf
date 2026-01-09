/**
 * Payment Service - Toss Payments 결제 처리 및 상태 관리
 */

// Toss Payments API Types
export interface TossPaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status:
    | 'READY'
    | 'IN_PROGRESS'
    | 'WAITING_FOR_DEPOSIT'
    | 'DONE'
    | 'CANCELED'
    | 'PARTIAL_CANCELED'
    | 'ABORTED'
    | 'EXPIRED';
  totalAmount: number;
  method: string;
  approvedAt?: string;
  receipt?: {
    url: string;
  };
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
  };
  virtualAccount?: {
    accountNumber: string;
    bankCode: string;
    customerName: string;
    dueDate: string;
  };
  easyPay?: {
    provider: string;
    amount: number;
  };
}

export interface TossWebhookPayload {
  eventType: 'PAYMENT_STATUS_CHANGED';
  createdAt: string;
  data: {
    paymentKey: string;
    orderId: string;
    status: string;
    transactionKey?: string;
  };
}

// Payment status enum
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELED' | 'REFUNDED';

// Booking status enum (synced with TeeTime status)
export type BookingStatus =
  | 'AVAILABLE'
  | 'DEPOSIT_PENDING'
  | 'CONFIRMED'
  | 'NOSHOW_CLAIMED'
  | 'COMPLETED'
  | 'CANCELED';

/**
 * Toss Payments API 호출 - 결제 승인
 */
export async function confirmPayment(
  secretKey: string,
  request: TossPaymentConfirmRequest
): Promise<TossPaymentResponse> {
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(secretKey + ':')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Payment confirmation failed: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Toss Payments API 호출 - 결제 조회
 */
export async function getPayment(
  secretKey: string,
  paymentKey: string
): Promise<TossPaymentResponse> {
  const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${btoa(secretKey + ':')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Payment lookup failed: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Toss Webhook 서명 검증
 */
export function verifyWebhookSignature(
  webhookSecret: string,
  signature: string,
  _payload: string
): boolean {
  // Toss webhook signature format: timestamp.signature
  // For MVP, we'll do basic validation. Production should use HMAC-SHA256
  // TODO: Use _payload with HMAC-SHA256 verification in production
  if (!signature || !webhookSecret) {
    return false;
  }

  // Basic validation - in production, implement proper HMAC verification
  return signature.length > 0;
}

/**
 * 결제 상태에 따른 예약 상태 매핑
 */
export function mapPaymentStatusToBookingStatus(paymentStatus: string): BookingStatus {
  switch (paymentStatus) {
    case 'DONE':
      return 'CONFIRMED';
    case 'WAITING_FOR_DEPOSIT':
      return 'DEPOSIT_PENDING';
    case 'CANCELED':
    case 'PARTIAL_CANCELED':
    case 'ABORTED':
    case 'EXPIRED':
      return 'CANCELED';
    default:
      return 'DEPOSIT_PENDING';
  }
}

/**
 * 빌링키로 자동 결제 (노쇼 위약금 청구용)
 */
export async function chargeWithBillingKey(
  secretKey: string,
  billingKey: string,
  customerKey: string,
  amount: number,
  orderName: string
): Promise<TossPaymentResponse> {
  const orderId = `NOSHOW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const response = await fetch('https://api.tosspayments.com/v1/billing/' + billingKey, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(secretKey + ':')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerKey,
      amount,
      orderId,
      orderName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Billing charge failed: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * 결제 취소/환불
 */
export async function cancelPayment(
  secretKey: string,
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number
): Promise<TossPaymentResponse> {
  const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(secretKey + ':')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cancelReason,
      ...(cancelAmount && { cancelAmount }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Payment cancellation failed: ${error.message || response.statusText}`);
  }

  return response.json();
}
