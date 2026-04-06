-- SQLite doesn't support DROP COLUMN before 3.35.0, so we recreate the tables.

DROP INDEX IF EXISTS idx_workspaces_entity;
DROP INDEX IF EXISTS idx_workspace_doc_source;

CREATE TABLE workspaces_backup AS
    SELECT id, uuid, name, description, icon, created_at, updated_at
    FROM workspaces;

DROP TABLE workspaces;

CREATE TABLE workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

INSERT INTO workspaces (id, uuid, name, description, icon, created_at, updated_at)
    SELECT id, uuid, name, description, icon, created_at, updated_at
    FROM workspaces_backup;

DROP TABLE workspaces_backup;

CREATE TABLE workspace_documents_backup AS
    SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at, tags, auto_tags, summary
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
    tags TEXT,
    auto_tags TEXT,
    summary TEXT,
    FOREIGN KEY (workspace_uuid) REFERENCES workspaces(uuid)
);

INSERT INTO workspace_documents (id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at, tags, auto_tags, summary)
    SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at, tags, auto_tags, summary
    FROM workspace_documents_backup;

DROP TABLE workspace_documents_backup;

CREATE INDEX IF NOT EXISTS idx_workspace_documents_workspace_uuid
    ON workspace_documents(workspace_uuid);
