-- Migration number: 0003   2026-01-10T00:00:00.000Z
-- No-Show management tables

-- 1. Noshows table
CREATE TABLE IF NOT EXISTS noshows (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    tee_time_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING_CHECK', -- PENDING_CHECK, WARNING_SENT, MANAGER_REVIEW, CONFIRMED, PENALTY_NOTIFIED, PENALTY_PAID, DISPUTED, WAIVED
    penalty_amount INTEGER DEFAULT 0,
    detected_at TEXT,
    confirmed_at TEXT,
    confirmed_by TEXT, -- manager_id who confirmed
    notified_at TEXT,
    paid_at TEXT,
    paid_amount INTEGER,
    dispute_reason TEXT,
    waive_reason TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (tee_time_id) REFERENCES tee_times(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (confirmed_by) REFERENCES managers(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_noshows_booking ON noshows(booking_id);
CREATE INDEX IF NOT EXISTS idx_noshows_status ON noshows(status);
CREATE INDEX IF NOT EXISTS idx_noshows_detected ON noshows(detected_at);
CREATE INDEX IF NOT EXISTS idx_noshows_user ON noshows(user_id);

-- 2. Add NOSHOW_CLAIMED and NOSHOW_PAID to booking status
-- (This is for documentation - SQLite CHECK constraints would need to be recreated)
-- Valid booking statuses: READY, PAID, CONFIRMED, CANCELLED, REFUNDED, NOSHOW_CLAIMED, NOSHOW_PAID, COMPLETED

-- 3. Noshow policy settings table (for future customization per course)
CREATE TABLE IF NOT EXISTS noshow_policies (
    id TEXT PRIMARY KEY,
    course_id TEXT,  -- NULL means default policy
    grace_minutes INTEGER DEFAULT 30,
    penalty_percent INTEGER DEFAULT 30,
    min_penalty INTEGER DEFAULT 30000,
    max_penalty INTEGER DEFAULT 100000,
    account_bank TEXT DEFAULT '토스뱅크',
    account_number TEXT DEFAULT '1234-5678-9012',
    account_holder TEXT DEFAULT '안심골프',
    payment_deadline_days INTEGER DEFAULT 7,
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (course_id) REFERENCES golf_courses(id)
);

-- Default policy
INSERT OR IGNORE INTO noshow_policies (id, course_id, grace_minutes, penalty_percent, min_penalty, max_penalty, payment_deadline_days)
VALUES ('default_policy', NULL, 30, 30, 30000, 100000, 7);

-- Index
CREATE INDEX IF NOT EXISTS idx_noshow_policies_course ON noshow_policies(course_id);
