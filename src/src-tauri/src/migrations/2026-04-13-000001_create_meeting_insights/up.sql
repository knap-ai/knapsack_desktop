CREATE TABLE IF NOT EXISTS meeting_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    elapsed_minutes INTEGER NOT NULL,
    insight TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
