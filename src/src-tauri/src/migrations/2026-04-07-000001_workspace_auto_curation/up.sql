ALTER TABLE workspaces ADD COLUMN auto_curated INTEGER DEFAULT 0;
ALTER TABLE workspaces ADD COLUMN entity_type TEXT DEFAULT NULL;
ALTER TABLE workspaces ADD COLUMN entity_key TEXT DEFAULT NULL;
ALTER TABLE workspaces ADD COLUMN last_curated_at INTEGER DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_entity
    ON workspaces(entity_type, entity_key)
    WHERE entity_type IS NOT NULL;

ALTER TABLE workspace_documents ADD COLUMN source_type TEXT DEFAULT NULL;
ALTER TABLE workspace_documents ADD COLUMN source_id TEXT DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_doc_source
    ON workspace_documents(workspace_uuid, source_type, source_id)
    WHERE source_type IS NOT NULL;
