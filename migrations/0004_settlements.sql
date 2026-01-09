-- Migration number: 0004   2026-01-10T00:00:00.000Z
-- Settlement (정산) management tables

-- 1. Settlements 테이블 (정산 요약)
CREATE TABLE IF NOT EXISTS settlements (
    id TEXT PRIMARY KEY,
    period TEXT NOT NULL, -- DAILY, WEEKLY, MONTHLY
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    course_id TEXT, -- NULL이면 전체 정산
    course_name TEXT,
    manager_id TEXT,
    manager_name TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, CALCULATED, CONFIRMED, TRANSFERRED, COMPLETED

    -- 금액 요약
    total_bookings INTEGER DEFAULT 0,
    total_amount INTEGER DEFAULT 0, -- 총 예약금
    total_pg_fee INTEGER DEFAULT 0, -- 총 PG 수수료
    total_commission INTEGER DEFAULT 0, -- 총 플랫폼 수수료
    total_vat INTEGER DEFAULT 0, -- 총 부가세
    total_net_amount INTEGER DEFAULT 0, -- 총 정산 금액

    -- 환불/취소
    refunded_bookings INTEGER DEFAULT 0,
    refunded_amount INTEGER DEFAULT 0,

    -- 노쇼 관련
    noshow_count INTEGER DEFAULT 0,
    noshow_penalty_amount INTEGER DEFAULT 0,
    noshow_penalty_paid INTEGER DEFAULT 0,

    -- 메모
    notes TEXT,

    -- 타임스탬프
    created_at TEXT DEFAULT (datetime('now')),
    confirmed_at TEXT,
    transferred_at TEXT,
    completed_at TEXT,
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (course_id) REFERENCES golf_courses(id),
    FOREIGN KEY (manager_id) REFERENCES managers(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_settlements_period ON settlements(period);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_dates ON settlements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_settlements_course ON settlements(course_id);

-- 2. Settlement Items 테이블 (정산 상세 항목)
CREATE TABLE IF NOT EXISTS settlement_items (
    id TEXT PRIMARY KEY,
    settlement_id TEXT NOT NULL,
    booking_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- 예약금
    pg_fee INTEGER DEFAULT 0,
    commission INTEGER DEFAULT 0,
    vat INTEGER DEFAULT 0,
    net_amount INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (settlement_id) REFERENCES settlements(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (course_id) REFERENCES golf_courses(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_settlement_items_settlement ON settlement_items(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_booking ON settlement_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_course ON settlement_items(course_id);

-- 3. Settlement Policies 테이블 (정산 정책)
CREATE TABLE IF NOT EXISTS settlement_policies (
    id TEXT PRIMARY KEY,
    course_id TEXT, -- NULL이면 기본 정책
    commission_rate REAL DEFAULT 5.0, -- 수수료율 (%)
    min_commission INTEGER DEFAULT 1000, -- 최소 수수료
    pg_fee_rate REAL DEFAULT 2.5, -- PG 수수료율 (%)
    vat_rate REAL DEFAULT 10.0, -- 부가세율 (%)
    settlement_delay INTEGER DEFAULT 1, -- T+N 정산
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (course_id) REFERENCES golf_courses(id)
);

-- Default policy
INSERT OR IGNORE INTO settlement_policies (id, course_id, commission_rate, min_commission, pg_fee_rate, vat_rate, settlement_delay)
VALUES ('default_policy', NULL, 5.0, 1000, 2.5, 10.0, 1);

-- Index
CREATE INDEX IF NOT EXISTS idx_settlement_policies_course ON settlement_policies(course_id);

-- 4. Add SETTLEMENT_READY to notification types
-- (This is for documentation - the type is used in notifications table's type column)
-- Valid notification types: ..., SETTLEMENT_READY
