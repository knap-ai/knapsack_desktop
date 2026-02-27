CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS workspace_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_uuid TEXT NOT NULL,
    document_name TEXT NOT NULL,
    document_path TEXT,
    document_type TEXT,
    content_hash TEXT,
    embedded INTEGER DEFAULT 0,
    created_at INTEGER,
    FOREIGN KEY (workspace_uuid) REFERENCES workspaces(uuid)
);
