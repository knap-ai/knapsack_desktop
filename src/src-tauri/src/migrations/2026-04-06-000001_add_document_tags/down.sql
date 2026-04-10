-- SQLite doesn't support DROP COLUMN before 3.35.0, so we recreate the table
CREATE TABLE workspace_documents_backup AS
    SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at
    FROM workspace_documents;

DROP TABLE workspace_documents;

CREATE TABLE workspace_documents (
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

INSERT INTO workspace_documents (id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at)
    SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at
    FROM workspace_documents_backup;

DROP TABLE workspace_documents_backup;

CREATE INDEX IF NOT EXISTS idx_workspace_documents_workspace_uuid
    ON workspace_documents(workspace_uuid);
