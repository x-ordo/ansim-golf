# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ansim Golf (안심골프)** - A golf tee time booking platform with AI-powered recommendations and a manager SaaS dashboard. The platform enables real-time tee time discovery, escrow-protected transactions, and partner inventory management.

## Development Commands

```bash
# Start development server (Vite + React)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run all tests
npx vitest

# Run single test file
npx vitest tests/unit/services/bookingService.test.ts

# Run tests in watch mode
npx vitest --watch

# Run Cloudflare Workers locally (requires wrangler)
npx wrangler pages dev dist

# Apply D1 database migrations
npx wrangler d1 migrations apply ansim-golf-db --local
```

## Architecture

### Frontend (React + Vite)

**Entry Point:** `index.tsx` → `App.tsx`

The app uses three view modes controlled by `viewMode` state:
- `BOARD`: Real-time tee time list view (BoardListItem components)
- `PRO`: Card-based recommended tee times (BookingCard components)
- `SAAS`: Partner dashboard for managers (ManagerSaaS component)

**Data Flow:**
- `src/hooks/useTeeTimes.ts` fetches tee times via `src/services/bookingService.ts`
- Zod schemas in `src/models/TeeTime.ts` validate API responses
- `types.ts` re-exports model types and defines additional interfaces

**Key Components:**
- `AIChatDrawer`: Floating AI assistant using Gemini for tee time recommendations
- `ManagerSaaS`: Partner dashboard with AI text parsing for bulk inventory upload
- `ChatRoomDrawer`: Direct messaging with managers
- `PaymentDrawer`: Toss Payments escrow integration

### Backend (Cloudflare Pages Functions)

API routes live in `functions/api/`:
- `chat.ts`: AI chat endpoint using Gemini 1.5 Flash with D1 database context
- `manager/parse.ts`: AI-powered text extraction for booking data from KakaoTalk/Excel

**Environment bindings (wrangler.toml):**
- `DB`: Cloudflare D1 database
- `GEMINI_API_KEY`: Google Gemini API key

### Database (Cloudflare D1)

Schema in `migrations/0001_init.sql`:
- `golf_courses`: Course catalog
- `managers`: Partner manager profiles
- `tee_times`: Available tee time inventory (status: AVAILABLE → PENDING → CONFIRMED → COMPLETED)
- `bookings`: User reservation records with payment tracking

### Testing

- **Framework:** Vitest with jsdom environment
- **Setup:** `tests/setup.ts` configures MSW for API mocking
- **Mocks:** `tests/mocks/server.ts` defines handlers for `/api/chat` and tee times API
- **Structure:** `tests/unit/` for isolated tests, `tests/integration/` for component tests

## Key Patterns

**Type Safety:** Zod schemas (`src/models/`) validate runtime data. The `validateTeeTime()` function filters invalid API responses rather than throwing.

**API Calls:** Frontend services (`src/services/`) call `/api/*` routes which proxy to Cloudflare Functions in production.

**Styling:** Tailwind CSS v4 with Vite plugin. Custom gradient class `bg-golfmon-gradient` defined in styles.

**Monitoring:** Sentry integration in `src/utils/logger.ts` - logs to console in dev, captures to Sentry in production.

## Korean Language Context

This is a Korean-language application. User-facing strings, component names, and some comments are in Korean. Key terms:
- 티타임 (tee time), 골프장 (golf course), 매니저 (manager)
- 조인 (JOIN type - shared booking), 양도 (TRANSFER type)
- 에스크로 (escrow), 위약금 (penalty fee), 노쇼 (no-show)
