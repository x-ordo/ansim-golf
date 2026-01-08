# TDD Guide: Ansim Golf

## 1. TDD Philosophy
**"Test behavior, not implementation detail."**
우리는 코드를 작성하기 전에 **반드시** 실패하는 테스트를 먼저 작성합니다. 이는 결함을 예방하고, 설계 결함을 조기에 발견하며, 리팩토링의 안전망을 제공합니다.

## 2. The TDD Cycle (Red-Green-Refactor)

### Step 1: RED (Write a failing test)
- 요구사항(Spec)을 기반으로 테스트 케이스를 작성합니다.
- 컴파일 에러가 나지 않을 정도의 최소한의 인터페이스(함수, 컴포넌트 껍데기)만 만듭니다.
- 테스트를 실행하여 **실패(FAIL)**함을 확인합니다.

### Step 2: GREEN (Make it pass)
- 테스트를 통과시키기 위한 **최소한의 코드**만 작성합니다.
- 우아한 패턴이나 최적화는 잠시 미룹니다. "죄악(Sin)"을 저질러서라도 일단 통과시킵니다 (e.g., 하드코딩 반환).
- 테스트를 실행하여 **성공(PASS)**함을 확인합니다.

### Step 3: REFACTOR (Improve code quality)
- 중복 제거, 가독성 향상, 구조 개선을 수행합니다.
- **중요**: 이 단계에서 테스트는 항상 **초록불(PASS)**이어야 합니다.
- 기능을 변경하지 않고 구조만 다듬습니다 (Tidy).

## 3. Naming Conventions
테스트 이름은 **B-D-D (Behavior-Driven Development)** 스타일을 따릅니다.

```typescript
// ❌ Bad
test('login', () => { ... });

// ✅ Good (Standard)
test('should return auth token when credentials are valid', () => { ... });

// ✅ Good (Alternative)
it('throws error if password is less than 8 characters', () => { ... });
```

## 4. Tools & Libraries
- **Unit/Integration**: `Vitest` (Fast, compatible with Vite).
- **UI Component**: `React Testing Library` (Test from user perspective).
- **E2E**: `Playwright` (Cross-browser, reliable).
- **Mocking**: `vi` (Vitest native mocks).

## 5. Mocking Strategy
- **External Services**: 외부 API (Toss, Gemini)는 **반드시** Mocking 합니다.
- **Database**: Unit 테스트에서는 In-memory Mock을 사용하거나 순수 함수 로직만 테스트합니다.
- **Don't Mock Types**: Zod Schema 등 데이터 구조는 실제 객체를 사용합니다.

## 6. Example: Date Parser

```typescript
// 1. RED
describe('parseBookingDate', () => {
  it('should return null for invalid date format', () => {
    const result = parseBookingDate('invalid-date');
    expect(result).toBeNull();
  });
});

// 2. GREEN
export function parseBookingDate(input: string): Date | null {
  if (isNaN(Date.parse(input))) return null;
  return new Date(input);
}

// 3. REFACTOR (If needed)
// ... use date-fns for robustness
```
