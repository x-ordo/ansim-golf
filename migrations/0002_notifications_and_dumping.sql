-- Migration number: 0002   2026-01-10T00:00:00.000Z
-- Notifications and Dumping automation tables

-- 1. Users table (for notification recipients)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    name TEXT,
    email TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    booking_id TEXT,
    tee_time_id TEXT,
    user_id TEXT,
    type TEXT NOT NULL, -- BOOKING_CONFIRMED, PAYMENT_PENDING, PAYMENT_REMINDER, ROUND_REMINDER_D1, ROUND_REMINDER_D0, NOSHOW_WARNING, NOSHOW_CHARGED, BOOKING_CANCELED, PRICE_DROPPED
    status TEXT DEFAULT 'PENDING', -- PENDING, SENT, FAILED, CANCELED
    scheduled_at TEXT NOT NULL,
    sent_at TEXT,
    template_data TEXT, -- JSON
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (tee_time_id) REFERENCES tee_times(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_notifications_booking ON notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type_status ON notifications(type, status);

-- 3. Dumping logs table
CREATE TABLE IF NOT EXISTS dumping_logs (
    id TEXT PRIMARY KEY,
    tee_time_id TEXT NOT NULL,
    previous_price INTEGER NOT NULL,
    new_price INTEGER NOT NULL,
    rule_id TEXT NOT NULL,
    applied_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (tee_time_id) REFERENCES tee_times(id)
);

CREATE INDEX IF NOT EXISTS idx_dumping_logs_teetime ON dumping_logs(tee_time_id);
CREATE INDEX IF NOT EXISTS idx_dumping_logs_applied ON dumping_logs(applied_at);

-- 4. Add updated_at column to tee_times if not exists
-- Note: SQLite doesn't support IF NOT EXISTS for columns, so this may fail on re-run
-- ALTER TABLE tee_times ADD COLUMN updated_at TEXT DEFAULT (datetime('now'));

-- 5. Add billing_key to bookings for no-show charging
-- ALTER TABLE bookings ADD COLUMN billing_key TEXT;
