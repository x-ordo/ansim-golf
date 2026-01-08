# 안심골프 기술 사양서 (Technical Specification)

## 1. 시스템 아키텍처

```mermaid
graph TD
    Client[React SPA (Vite)] -->|API Request| CF[Cloudflare Workers (Functions)]
    Client -->|WebSocket| Chat[Chat Service]
    Client -->|Payment SDK| Toss[Toss Payments]
    
    CF -->|ORM| DB[(Database / KV)]
    CF -->|LLM| Gemini[Google Gemini API]
    
    subgraph Frontend
        App[App.tsx]
        Router[View Router]
        State[React State / Context]
    end
    
    subgraph Backend Services
        Auth[Auth Service]
        Booking[Booking Service]
        Manager[Manager SaaS API]
        Dumping[Dumping Engine]
    end
```

## 2. 기술 스택 (Tech Stack)

### 2.1. Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (PostCSS)
- **UI Components**: Custom Components (No heavy UI library dependency)
- **Icons**: SVG Inline / Heroicons style

### 2.2. Backend & Infrastructure
- **Runtime**: Cloudflare Workers (Serverless)
- **Functions**: `/functions` 디렉토리 내 API 엔드포인트 구현.
- **Database**: 
    - Prototype: In-memory / Mock Data (`constants.ts`)
    - Production (Planned): Cloudflare D1 (SQLite) or Supabase (PostgreSQL).
- **Hosting**: Cloudflare Pages.

### 2.3. External Services
- **AI**: Google Gemini API (`@google/genai`) - 챗봇 및 데이터 파싱.
- **Payment**: Toss Payments SDK.
- **Maps/Location**: (추후 도입) Naver/Kakao Map API.

## 3. 데이터 모델 (Data Model - TypeScript Interfaces)

### 3.1. TeeTime (티타임 핵심 엔티티)
```typescript
interface TeeTime {
  id: string;               // UUID
  course: GolfCourse;       // 골프장 정보 객체
  date: string;             // YYYY-MM-DD
  time: string;             // HH:mm
  price: number;            // 판매가
  originalPrice: number;    // 정상가 (할인율 계산용)
  type: BookingType;        // JOIN | TRANSFER | SPECIAL ...
  manager: Manager;         // 담당 매니저
  status: 'AVAILABLE' | 'DEPOSIT_PENDING' | 'CONFIRMED' | 'NOSHOW_CLAIMED';
  escrowEnabled: boolean;   // 에스크로 결제 가능 여부
  // ... 기타 속성
}
```

### 3.2. GolfCourse (골프장 정보)
```typescript
interface GolfCourse {
  id: string;
  name: string;
  region: RegionId;         // 지역 코드
  image: string;            // 썸네일 URL
  holesCount: number;
  // ... 상세 제원
}
```

### 3.3. Manager (파트너/매니저)
```typescript
interface Manager {
  id: string;
  name: string;
  companyName: string;
  stats: {
    totalBookings: number;
    responseTime: number;   // 평균 응답 시간
  };
  isVerified: boolean;      // 신원 인증 여부
}
```

## 4. API 명세 (Draft)

| Method | Endpoint | Description | Auth Required |
|:---:|:---:|:---|:---:|
| GET | `/api/teetimes` | 티타임 목록 조회 (필터링 포함) | No |
| GET | `/api/teetimes/:id` | 티타임 상세 조회 | No |
| POST | `/api/bookings` | 예약 요청 생성 | Yes |
| POST | `/api/chat/message` | AI 챗봇 메시지 전송 | No |
| POST | `/api/manager/parse` | (SaaS) 텍스트 파싱 요청 | Yes (Manager) |
| POST | `/api/payments/confirm` | 결제 승인 처리 (Webhook) | System |

## 5. 보안 및 규정 준수 (Security & Compliance)
- **HTTPS**: 전 구간 SSL 암호화 통신.
- **Data Privacy**: 개인정보 최소 수집 원칙. 민감 정보(전화번호 등) 마스킹 처리.
- **Payment**: PG사 표준 연동 규격 준수 (카드 정보 서버 미저장).
- **Auth**: JWT (JSON Web Token) 기반 인증 세션 관리.
