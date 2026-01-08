# Master Plan: Ansim Golf

**Status**: Phase 1 (Foundation) in progress.

## Phase 1: Foundation (Current)
- [x] **Context & Standards**: Define PRD, Constitution, Context. (`docs/`)
- [x] **Project Skeleton**: React + Vite + TypeScript setup.
- [ ] **Design System**: Establish core Tailwind theme (Colors, Typography) and base UI components.
- [ ] **CI/CD Setup**: Basic build verification on commit.

## Phase 2: Core Specifications (Next)
- [ ] **Data Model**: Define `TeeTime`, `Manager`, `Booking` schemas in TypeScript.
- [ ] **API Spec**: Define Cloudflare Worker endpoints for `chat`, `booking`, `payment`.
- [ ] **Mocking**: robust mock data generation for dev velocity.

## Phase 3: MVP Implementation (Feature Tracks)
### Track A: Golfer Experience (B2C)
- [ ] **Home & Search**: Date picker, Region filter, List/Card toggle.
- [ ] **Detail & Chat**: Connection to Gemini AI for Q&A.
- [ ] **Booking & Payment**: Toss Payments integration (Escrow mode).

### Track B: Manager Experience (B2B SaaS)
- [ ] **Dashboard**: Vital stats (Occupancy, Revenue).
- [ ] **Inventory Ops**: Text parsing input -> Structured DB entry.
- [ ] **Dumping Engine**: Logic for auto-pricing.

## Phase 4: Quality & Security
- [ ] **Testing**: Unit tests for parsers, E2E for booking flow.
- [ ] **Security Audit**: Review payment flows and data privacy.
- [ ] **Performance**: LightHouse score optimization.

## Phase 5: Launch & Operations
- [ ] **Deployment**: Cloudflare Pages production deploy.
- [ ] **Monitoring**: Error tracking and usage analytics.
- [ ] **Documentation**: User guides and API docs.
