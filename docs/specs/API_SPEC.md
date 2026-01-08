# API Specification: Ansim Golf

## 1. Base URL
`https://api.ansimgolf.com/v1`

## 2. Common Response Format
```json
{
  "success": true,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## 3. Endpoints

### 3.1. TeeTime API
- **GET /teetimes**
  - Query Params: `date`, `region`, `type`
  - Desc: 필터링된 티타임 목록 조회
- **GET /teetimes/:id**
  - Desc: 특정 티타임 상세 정보 조회

### 3.2. Booking & Payment
- **POST /bookings**
  - Body: `{ teeTimeId: string }`
  - Desc: 예약 생성 (READY 상태)
- **POST /payments/confirm**
  - Body: `{ paymentKey: string, orderId: string, amount: number }`
  - Desc: 토스 결제 승인 후 에스크로 예치 완료 처리

### 3.3. Manager SaaS
- **POST /manager/inventory/parse**
  - Body: `{ rawText: string }`
  - Desc: AI를 통한 티타임 데이터 파싱 및 가등록
- **PATCH /manager/inventory/:id/status**
  - Body: `{ status: string }`
  - Desc: 티타임 상태 변경 (판매중 -> 중단 등)

### 3.4. AI Concierge
- **POST /chat/message**
  - Body: `{ message: string, sessionId?: string }`
  - Desc: AI 챗봇 대화

## 4. Error Codes
| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 인증이 필요한 요청 | 401 |
| `INVALID_INPUT` | 입력 데이터 검증 실패 | 400 |
| `INVENTORY_EXHAUSTED` | 이미 판매 완료된 티타임 | 409 |
| `PAYMENT_FAILED` | PG 결제 승인 실패 | 402 |
| `INTERNAL_ERROR` | 서버 내부 오류 | 500 |
