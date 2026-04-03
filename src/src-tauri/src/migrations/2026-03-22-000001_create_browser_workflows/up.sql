CREATE TABLE IF NOT EXISTS browser_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    start_url TEXT NOT NULL,
    steps_json TEXT NOT NULL DEFAULT '[]',
    browser_profile TEXT NOT NULL DEFAULT 'openclaw',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS browser_workflow_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_uuid TEXT NOT NULL,
    automation_run_id INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at INTEGER,
    completed_at INTEGER,
    result_json TEXT,
    error_message TEXT,
    screenshot_path TEXT,
    FOREIGN KEY (workflow_uuid) REFERENCES browser_workflows(uuid)
);
