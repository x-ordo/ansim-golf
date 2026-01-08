# Architecture Design: Ansim Golf

## 1. System Overview
Cloudflare Workers를 활용한 Edge-Native Serverless 아키텍처를 채택하여 글로벌 확장성과 비용 효율성을 극대화합니다.

## 2. Technology Stack
- **Frontend**: React 19 + Vite (Cloudflare Pages)
- **Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite-based distributed DB)
- **Cache**: Cloudflare KV (Session, Rate Limiting)
- **AI**: Google Gemini Pro 1.5 (via API)
- **Payment**: Toss Payments (Widget & API)

## 3. ADR (Architecture Decision Records)

### ADR.1: Serverless (Cloudflare Workers) 채택
- **Context**: 초기 PoC 단계에서 운영 비용 절감 및 빠른 배포 필요.
- **Decision**: Node.js 서버 대신 CF Workers 사용.
- **Consequence**: 저지연 응답 가능하나, 50MB 코드 크기 제한 준수 필요.

### ADR.2: CSS Framework (Tailwind v4)
- **Context**: 빠른 UI 프로토타이핑 및 일관된 디자인 시스템 필요.
- **Decision**: Tailwind v4 도입.
- **Consequence**: 유틸리티 클래스 기반으로 번들 크기 최적화.

## 4. Component Structure
```
src/
├── components/         # Atomic UI Components
├── hooks/              # Shared React Hooks
├── services/           # External API Clients (Gemini, Toss)
├── store/              # State Management (Zustand or Context)
└── utils/              # Pure Functions
```

## 5. Security Architecture
- **JWT Authentication**: Edge에서 토큰 검증.
- **Input Validation**: Zod를 사용한 Schema-first validation.
- **Rate Limiting**: IP 기반 요청 제한 (CF KV 활용).
