# Definition of Done (DoD)

> 기능이 '완료'되었다고 선언하고 배포하기 위해 반드시 통과해야 하는 품질 게이트입니다.

## 1. Code Quality
- [ ] **Lint & Format**: 프로젝트 표준 린트 규칙(ESLint/Prettier)을 에러 없이 통과했는가?
- [ ] **Type Check**: TypeScript 컴파일 에러가 없는가? (`noEmit`)
- [ ] **Clean Code**: 중복 코드가 제거되고, 함수/변수명이 명확한가?

## 2. Testing (Quality > Speed)
- [ ] **Unit Test**: 비즈니스 로직 커버리지 80% 이상 달성했는가?
- [ ] **Integration Test**: 주요 컴포넌트 간 연동이 검증되었는가? (MSW 활용)
- [ ] **Success/Fail Cases**: 정상 동작뿐 아니라 에러 케이스(네트워크 실패 등)도 테스트했는가?

## 3. Review & Documentation
- [ ] **Code Review**: 1명 이상의 리뷰어로부터 승인(Approve)을 받았는가?
- [ ] **Comments**: 복잡한 로직에 대한 'Why' 주석이 작성되었는가?
- [ ] **Docs Update**: API 변경 시 관련 문서(API Spec)가 업데이트되었는가?

## 4. Security & Operations
- [ ] **Secrets**: 하드코딩된 비밀 키가 없는가? (.env 사용 확인)
- [ ] **Input Validation**: 모든 사용자 입력에 Zod 검증이 적용되었는가?
- [ ] **Local Build**: 로컬에서 프로덕션 빌드(`npm run build`)가 성공하는가?
