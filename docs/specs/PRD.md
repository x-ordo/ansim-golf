# PRD: 안심골프 (Ansim Golf)

## 1. Executive Summary
안심골프는 골프 부킹 시장의 고질적인 문제인 '노쇼(No-Show)'와 '금전 사고(먹튀)'를 에스크로(Escrow) 결제와 AI 기술로 해결하는 신뢰 기반 부킹 플랫폼입니다.

## 2. Target Audience
- **Golfer**: 안전한 결제와 투명한 예약을 원하는 일반 사용자.
- **Manager**: 예약 관리 효율화와 노쇼 리스크 제거를 원하는 전문 매니저.

## 3. User Stories & RICE Prioritization

| ID | User Story | Reach | Impact | Confidence | Effort | RICE Score |
|----|------------|-------|--------|------------|--------|------------|
| US.1 | 사용자는 에스크로 결제를 통해 라운딩 전까지 대금을 안전하게 보호받을 수 있다. | 10 | 3 | 100% | 3 | **10.0** |
| US.2 | 매니저는 텍스트 복사만으로 티타임을 인벤토리에 자동 등록할 수 있다. | 5 | 3 | 90% | 2 | **6.75** |
| US.3 | 사용자는 AI 챗봇에게 자연어로 원하는 조건의 티타임을 추천받을 수 있다. | 8 | 2 | 80% | 3 | **4.27** |
| US.4 | 매니저는 노쇼 발생 시 등록된 빌링키를 통해 위약금을 즉시 청구할 수 있다. | 5 | 3 | 70% | 4 | **2.63** |

## 4. Key Functional Requirements
- **F.1 에스크로 결제 시스템**: Toss Payments 연동, 라운딩 완료 후 정산 트리거.
- **F.2 AI 인벤토리 파서**: Gemini API를 이용한 비정형 텍스트(카톡/엑셀) 데이터 추출.
- **F.3 실시간 덤핑 엔진**: 잔여 시간 기반 자동 가격 할인 제안 및 반영.
- **F.4 AI 컨시어지**: RAG 기반 티타임 검색 및 매칭 챗봇.

## 5. Non-Functional Requirements
- **Security**: 모든 결제 데이터는 PG사 표준 준수, 민감 데이터 암호화 저장.
- **Availability**: 피크 타임(오전 9시) 동시 접속자 10,000명 이상 수용.
- **Performance**: LCP(Largest Contentful Paint) 2.5s 이내.
