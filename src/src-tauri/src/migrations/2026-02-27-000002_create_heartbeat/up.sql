CREATE TABLE IF NOT EXISTS heartbeat_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enabled INTEGER NOT NULL DEFAULT 1,
    interval_minutes INTEGER NOT NULL DEFAULT 30,
    check_emails INTEGER NOT NULL DEFAULT 1,
    check_calendar INTEGER NOT NULL DEFAULT 1,
    check_documents INTEGER NOT NULL DEFAULT 0,
    quiet_hours_start TEXT,
    quiet_hours_end TEXT,
    last_run_at INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS heartbeat_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_at INTEGER NOT NULL,
    context_summary TEXT,
    decision TEXT NOT NULL,
    notification_sent INTEGER NOT NULL DEFAULT 0,
    notification_content TEXT,
    created_at INTEGER
);

-- Insert default config
INSERT INTO heartbeat_config (enabled, interval_minutes, check_emails, check_calendar)
VALUES (1, 30, 1, 1);
