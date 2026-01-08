# Engineering Constitution

## 1. Operating Principles
**`Quality > Security > Speed > Cost > Token`**

1.  **Quality**: Code must be robust, readable, and maintainable. No "quick hacks" without a documented technical debt plan.
2.  **Security**: User data and financial transactions (Escrow) are sacred. Zero tolerance for exposed secrets or insecure data handling.
3.  **Speed**: Optimize for end-user latency (LCP, FID) and developer velocity (CI/CD).
4.  **Cost**: Use serverless and edge computing (Cloudflare) to minimize infrastructure overhead.
5.  **Token**: Be concise and efficient in AI interactions and prompt engineering.

## 2. Technical Standards

### 2.1. Code Style
- **Language**: TypeScript (Strict Mode).
- **Framework**: React 19 (Functional Components, Hooks).
- **State Management**: Local state first, Context for global, avoid Redux unless necessary.
- **Styling**: Tailwind CSS (Utility-first).
- **Comments**: Explain *Why*, not *What*. JSDoc for public interfaces.

### 2.2. Git Conventions
- **Commit Messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`).
    - Example: `feat(booking): implement escrow payment gateway integration`
- **Branching**: Feature-branch workflow. `main` is protected and deployable.

### 2.3. Testing Strategy
- **Unit**: Vitest for utility functions and hooks.
- **Component**: React Testing Library for UI components.
- **E2E**: Playwright for critical user journeys (Booking Flow, Payment).

## 3. Architecture Guidelines
- **Directory Structure**: Feature-based or Domain-based over Type-based.
- **Components**:
    - **Presentational**: UI only, no logic.
    - **Container**: Business logic, data fetching.
- **API**: Type-safe interfaces shared between frontend and backend (or Edge Functions).

## 4. Security Mandates
- **Secrets**: Never commit `.env` files. Use environment variable injection.
- **Validation**: Validate all inputs at the edge/server (Zod).
- **Payments**: Never handle raw card numbers. Use PG SDK (Toss Payments) strictly.
