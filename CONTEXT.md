# Project Context: Ansim Golf (안심골프)

## 1. Mission Statement
To revolutionize the golf booking market by eliminating "No-Show" and "Fraud" (Eat-and-Run) risks through an AI-powered, escrow-based platform that guarantees transparency and safety for both Golfers and Managers.

## 2. Problem Domain
- **Asymmetric Information**: The golf booking market is opaque; price and availability are often hidden in closed chat rooms (KakaoTalk, Band).
- **Trust Deficit**:
    - **Golfers**: Fear of transferring money to anonymous managers who might disappear (Fraud).
    - **Managers**: Fear of golfers canceling last minute without penalty (No-Show), leading to revenue loss ("Dead Time").
- **Inefficiency**: Manual booking processes (phone, text) are slow, error-prone, and unscalable.

## 3. Solution Overview
**Ansim Golf** is a dual-sided platform:
- **B2C (Golfer)**: A mobile-first web app for searching, reserving, and safely paying for tee times using Escrow. Features an AI Concierge for natural language discovery.
- **B2B (Manager)**: A SaaS dashboard (`ManagerSaaS`) for inventory management, text-parsing automation, and automated dumping (yield management).

## 4. Key Terminology
- **Escrow (안심결제)**: Payment is held by the platform (PG) and released to the manager only after the round is successfully completed.
- **Dumping (덤핑)**: Automating price reductions for expiring inventory to minimize dead time.
- **Join (조인)**: Matching individual golfers to form a 4-person team.
- **Parsing (파싱)**: Extracting structured data (Date, Time, Course, Price) from unstructured text messages used by managers.

## 5. Strategic Constraints
- **Platform**: Web-first (React/Vite/Cloudflare), designed for mobile viewports.
- **Compliance**: Must adhere to Korean E-Commerce laws (Escrow) and Location Information protection.
- **Performance**: High availability for "Time Attack" booking scenarios.
