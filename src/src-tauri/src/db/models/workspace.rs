use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Workspace {
    pub id: Option<u64>,
    pub uuid: String,
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub created_at: Option<i64>,
    pub updated_at: Option<i64>,
    pub documents: Option<Vec<WorkspaceDocument>>,
    /// 0/1 — true when this workspace was created by the library curator.
    pub auto_curated: Option<i32>,
    /// 'person' | 'project' | None (None == manual collection).
    pub entity_type: Option<String>,
    /// Canonical identifier — email address for people, slug for projects.
    pub entity_key: Option<String>,
    /// Last time the curator successfully ran for this collection.
    pub last_curated_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceDocument {
    pub id: Option<u64>,
    pub workspace_uuid: String,
    pub document_name: String,
    pub document_path: Option<String>,
    pub document_type: Option<String>,
    pub content_hash: Option<String>,
    pub embedded: Option<i32>,
    pub created_at: Option<i64>,
    pub tags: Option<String>,
    pub auto_tags: Option<String>,
    pub summary: Option<String>,
    /// 'email' | 'calendar' | 'meeting' | 'drive' | 'local_file' | 'chat_output' | 'manual' | None.
    pub source_type: Option<String>,
    /// Stable id from the originating row (e.g. email.id) used for dedupe.
    pub source_id: Option<String>,
}

impl WorkspaceDocument {
    /// Parse tags JSON string into a Vec<String>.
    pub fn get_tags(&self) -> Vec<String> {
        self.tags
            .as_ref()
            .and_then(|t| serde_json::from_str(t).ok())
            .unwrap_or_default()
    }

    /// Parse auto_tags JSON string into a Vec<String>.
    pub fn get_auto_tags(&self) -> Vec<String> {
        self.auto_tags
            .as_ref()
            .and_then(|t| serde_json::from_str(t).ok())
            .unwrap_or_default()
    }
}

// ── Workspace CRUD ──────────────────────────────────────────────────────

impl Workspace {
    pub fn create(name: String, description: Option<String>, icon: Option<String>) -> Result<Workspace, Error> {
        let connection = get_db_conn();
        let uuid = Uuid::new_v4().to_string();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        connection.execute(
            "INSERT INTO workspaces (uuid, name, description, icon, created_at, updated_at, auto_curated) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0)",
            params![uuid, name, description, icon, now, now],
        )?;

        let id = connection.last_insert_rowid() as u64;

        Ok(Workspace {
            id: Some(id),
            uuid,
            name,
            description,
            icon,
            created_at: Some(now),
            updated_at: Some(now),
            documents: None,
            auto_curated: Some(0),
            entity_type: None,
            entity_key: None,
            last_curated_at: None,
        })
    }

    /// Find an auto-curated workspace by entity (person email or project slug).
    pub fn find_by_entity(entity_type: &str, entity_key: &str) -> Result<Option<Workspace>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, uuid, name, description, icon, created_at, updated_at, auto_curated, entity_type, entity_key, last_curated_at
             FROM workspaces WHERE entity_type = ?1 AND entity_key = ?2",
        )?;
        let workspace = stmt
            .query_row(params![entity_type, entity_key], |row| {
                Ok(Workspace {
                    id: Some(row.get(0)?),
                    uuid: row.get(1)?,
                    name: row.get(2)?,
                    description: row.get(3)?,
                    icon: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                    documents: None,
                    auto_curated: row.get(7)?,
                    entity_type: row.get(8)?,
                    entity_key: row.get(9)?,
                    last_curated_at: row.get(10)?,
                })
            })
            .optional()?;
        Ok(workspace)
    }

    /// Insert-or-update an auto-curated collection. If a collection already exists for the
    /// given (entity_type, entity_key), update its name/description and bump last_curated_at.
    /// Skips collections that have been promoted to manual (auto_curated=0).
    pub fn upsert_auto_collection(
        entity_type: &str,
        entity_key: &str,
        name: &str,
        description: Option<&str>,
        icon: Option<&str>,
    ) -> Result<Workspace, Error> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        if let Some(existing) = Self::find_by_entity(entity_type, entity_key)? {
            // If user promoted this to manual, leave it alone.
            if existing.auto_curated.unwrap_or(0) == 0 {
                return Ok(existing);
            }
            let connection = get_db_conn();
            connection.execute(
                "UPDATE workspaces SET name = ?1, description = COALESCE(?2, description), icon = COALESCE(?3, icon), updated_at = ?4, last_curated_at = ?4 WHERE uuid = ?5",
                params![name, description, icon, now, existing.uuid],
            )?;
            return Self::find_by_uuid(existing.uuid.clone()).map(|opt| opt.unwrap_or(existing));
        }

        let connection = get_db_conn();
        let uuid = Uuid::new_v4().to_string();
        connection.execute(
            "INSERT INTO workspaces (uuid, name, description, icon, created_at, updated_at, auto_curated, entity_type, entity_key, last_curated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?5, 1, ?6, ?7, ?5)",
            params![uuid, name, description, icon, now, entity_type, entity_key],
        )?;
        let id = connection.last_insert_rowid() as u64;
        Ok(Workspace {
            id: Some(id),
            uuid,
            name: name.to_string(),
            description: description.map(|s| s.to_string()),
            icon: icon.map(|s| s.to_string()),
            created_at: Some(now),
            updated_at: Some(now),
            documents: None,
            auto_curated: Some(1),
            entity_type: Some(entity_type.to_string()),
            entity_key: Some(entity_key.to_string()),
            last_curated_at: Some(now),
        })
    }

    /// Promote an auto-curated collection to manual — clears the auto flag so the curator
    /// won't overwrite it on the next pass.
    pub fn promote_to_manual(uuid: &str) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute(
            "UPDATE workspaces SET auto_curated = 0 WHERE uuid = ?1",
            params![uuid],
        )?;
        Ok(())
    }

    /// Wipe all auto-curated workspaces and their documents. Returns the number of
    /// workspaces deleted.
    /// Delete auto-curated project workspaces whose entity_key (slug) is NOT in
    /// the provided keep set. Used by the project detector to prune stale
    /// duplicates that arise when the LLM generates a slightly different slug
    /// for semantically-equivalent projects across runs.
    /// Only affects `auto_curated = 1` projects — pinned/manual ones are left alone.
    pub fn delete_stale_auto_projects(keep_slugs: &std::collections::HashSet<String>) -> Result<usize, Error> {
        let connection = get_db_conn();

        // Gather all auto-curated project workspaces first.
        let mut existing: Vec<(String, Option<String>)> = Vec::new();
        {
            let mut stmt = connection.prepare(
                "SELECT uuid, entity_key FROM workspaces \
                 WHERE auto_curated = 1 AND entity_type = 'project'",
            )?;
            let rows = stmt.query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, Option<String>>(1)?))
            })?;
            for r in rows.flatten() {
                existing.push(r);
            }
        }

        let stale_uuids: Vec<String> = existing
            .into_iter()
            .filter(|(_, key)| match key {
                Some(k) => !keep_slugs.contains(k),
                None => true,
            })
            .map(|(uuid, _)| uuid)
            .collect();

        if stale_uuids.is_empty() {
            return Ok(0);
        }

        connection.execute_batch("BEGIN")?;
        let result = (|| -> Result<usize, rusqlite::Error> {
            let mut n = 0;
            for uuid in &stale_uuids {
                connection.execute(
                    "DELETE FROM workspace_documents WHERE workspace_uuid = ?1",
                    [uuid],
                )?;
                n += connection.execute(
                    "DELETE FROM workspaces WHERE uuid = ?1 AND auto_curated = 1 AND entity_type = 'project'",
                    [uuid],
                )?;
            }
            Ok(n)
        })();
        match result {
            Ok(n) => {
                connection.execute_batch("COMMIT")?;
                Ok(n)
            }
            Err(e) => {
                let _ = connection.execute_batch("ROLLBACK");
                Err(e.into())
            }
        }
    }

    pub fn wipe_auto_curated() -> Result<usize, Error> {
        let connection = get_db_conn();
        connection.execute_batch("BEGIN")?;
        let result = (|| -> Result<usize, rusqlite::Error> {
            connection.execute(
                "DELETE FROM workspace_documents WHERE workspace_uuid IN (SELECT uuid FROM workspaces WHERE auto_curated = 1)",
                [],
            )?;
            let n = connection.execute(
                "DELETE FROM workspaces WHERE auto_curated = 1",
                [],
            )?;
            Ok(n)
        })();
        match result {
            Ok(n) => {
                connection.execute_batch("COMMIT")?;
                Ok(n)
            }
            Err(e) => {
                let _ = connection.execute_batch("ROLLBACK");
                Err(e.into())
            }
        }
    }

    /// Fetch all workspaces with their documents in 2 queries (avoids N+1).
    pub fn find_all_with_documents() -> Result<Vec<Workspace>, Error> {
        let connection = get_db_conn();

        // Query 1: all workspaces
        let mut ws_stmt = connection.prepare(
            "SELECT id, uuid, name, description, icon, created_at, updated_at, auto_curated, entity_type, entity_key, last_curated_at FROM workspaces ORDER BY created_at DESC",
        )?;
        let ws_rows = ws_stmt.query_map([], |row| {
            Ok(Workspace {
                id: Some(row.get(0)?),
                uuid: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                icon: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                documents: Some(Vec::new()),
                auto_curated: row.get(7)?,
                entity_type: row.get(8)?,
                entity_key: row.get(9)?,
                last_curated_at: row.get(10)?,
            })
        })?;

        let mut workspaces: Vec<Workspace> = Vec::new();
        let mut uuid_to_index: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
        for row in ws_rows {
            let ws = row?;
            uuid_to_index.insert(ws.uuid.clone(), workspaces.len());
            workspaces.push(ws);
        }

        if workspaces.is_empty() {
            return Ok(workspaces);
        }

        // Query 2: all documents, grouped by workspace
        let mut doc_stmt = connection.prepare(
            "SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at, tags, auto_tags, summary, source_type, source_id FROM workspace_documents ORDER BY created_at DESC",
        )?;
        let doc_rows = doc_stmt.query_map([], |row| {
            Ok(WorkspaceDocument {
                id: Some(row.get(0)?),
                workspace_uuid: row.get(1)?,
                document_name: row.get(2)?,
                document_path: row.get(3)?,
                document_type: row.get(4)?,
                content_hash: row.get(5)?,
                embedded: row.get(6)?,
                created_at: row.get(7)?,
                tags: row.get(8)?,
                auto_tags: row.get(9)?,
                summary: row.get(10)?,
                source_type: row.get(11)?,
                source_id: row.get(12)?,
            })
        })?;

        for row in doc_rows {
            let doc = row?;
            if let Some(&idx) = uuid_to_index.get(&doc.workspace_uuid) {
                if let Some(ref mut docs) = workspaces[idx].documents {
                    docs.push(doc);
                }
            }
        }

        Ok(workspaces)
    }

    pub fn find_all() -> Result<Vec<Workspace>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, uuid, name, description, icon, created_at, updated_at, auto_curated, entity_type, entity_key, last_curated_at FROM workspaces ORDER BY created_at DESC",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(Workspace {
                id: Some(row.get(0)?),
                uuid: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                icon: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                documents: None,
                auto_curated: row.get(7)?,
                entity_type: row.get(8)?,
                entity_key: row.get(9)?,
                last_curated_at: row.get(10)?,
            })
        })?;

        let mut workspaces = Vec::new();
        for row in rows {
            workspaces.push(row?);
        }
        Ok(workspaces)
    }

    pub fn find_by_uuid(uuid: String) -> Result<Option<Workspace>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, uuid, name, description, icon, created_at, updated_at, auto_curated, entity_type, entity_key, last_curated_at FROM workspaces WHERE uuid = ?1",
        )?;

        let workspace = stmt
            .query_row(params![uuid], |row| {
                Ok(Workspace {
                    id: Some(row.get(0)?),
                    uuid: row.get(1)?,
                    name: row.get(2)?,
                    description: row.get(3)?,
                    icon: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                    documents: None,
                    auto_curated: row.get(7)?,
                    entity_type: row.get(8)?,
                    entity_key: row.get(9)?,
                    last_curated_at: row.get(10)?,
                })
            })
            .optional()?;

        Ok(workspace)
    }

    pub fn update(uuid: String, name: String, description: Option<String>, icon: Option<String>) -> Result<(), Error> {
        let connection = get_db_conn();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        connection.execute(
            "UPDATE workspaces SET name = ?1, description = ?2, icon = ?3, updated_at = ?4 WHERE uuid = ?5",
            params![name, description, icon, now, uuid],
        )?;

        Ok(())
    }

    /// Delete a workspace and all its documents atomically.
    pub fn delete(uuid: String) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute_batch("BEGIN")?;
        let result = (|| -> Result<(), rusqlite::Error> {
            connection.execute(
                "DELETE FROM workspace_documents WHERE workspace_uuid = ?1",
                params![uuid],
            )?;
            connection.execute(
                "DELETE FROM workspaces WHERE uuid = ?1",
                params![uuid],
            )?;
            Ok(())
        })();
        match result {
            Ok(()) => {
                connection.execute_batch("COMMIT")?;
                Ok(())
            }
            Err(e) => {
                let _ = connection.execute_batch("ROLLBACK");
                Err(e.into())
            }
        }
    }
}

impl WorkspaceDocument {
    pub fn create(
        workspace_uuid: String,
        document_name: String,
        document_path: Option<String>,
        document_type: Option<String>,
        content_hash: Option<String>,
    ) -> Result<WorkspaceDocument, Error> {
        Self::create_with_source(
            workspace_uuid,
            document_name,
            document_path,
            document_type,
            content_hash,
            None,
            None,
        )
    }

    /// Create a workspace document with optional source-tracking fields. Used by the
    /// library curator to dedupe re-runs via the (workspace_uuid, source_type, source_id)
    /// unique index — INSERT OR IGNORE returns Ok(None) if the row already exists.
    pub fn create_with_source(
        workspace_uuid: String,
        document_name: String,
        document_path: Option<String>,
        document_type: Option<String>,
        content_hash: Option<String>,
        source_type: Option<String>,
        source_id: Option<String>,
    ) -> Result<WorkspaceDocument, Error> {
        let connection = get_db_conn();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        connection.execute(
            "INSERT OR IGNORE INTO workspace_documents (workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at, source_type, source_id) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7, ?8)",
            params![workspace_uuid, document_name, document_path, document_type, content_hash, now, source_type, source_id],
        )?;

        let id = connection.last_insert_rowid() as u64;

        Ok(WorkspaceDocument {
            id: Some(id),
            workspace_uuid,
            document_name,
            document_path,
            document_type,
            content_hash,
            embedded: Some(0),
            created_at: Some(now),
            tags: None,
            auto_tags: None,
            summary: None,
            source_type,
            source_id,
        })
    }

    pub fn find_by_workspace(workspace_uuid: String) -> Result<Vec<WorkspaceDocument>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at, tags, auto_tags, summary, source_type, source_id FROM workspace_documents WHERE workspace_uuid = ?1 ORDER BY created_at DESC",
        )?;

        let rows = stmt.query_map(params![workspace_uuid], |row| {
            Ok(WorkspaceDocument {
                id: Some(row.get(0)?),
                workspace_uuid: row.get(1)?,
                document_name: row.get(2)?,
                document_path: row.get(3)?,
                document_type: row.get(4)?,
                content_hash: row.get(5)?,
                embedded: row.get(6)?,
                created_at: row.get(7)?,
                tags: row.get(8)?,
                auto_tags: row.get(9)?,
                summary: row.get(10)?,
                source_type: row.get(11)?,
                source_id: row.get(12)?,
            })
        })?;

        let mut documents = Vec::new();
        for row in rows {
            documents.push(row?);
        }
        Ok(documents)
    }

    /// Check whether a source document is already attached to a workspace.
    pub fn exists_for_source(workspace_uuid: &str, source_type: &str, source_id: &str) -> Result<bool, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT 1 FROM workspace_documents WHERE workspace_uuid = ?1 AND source_type = ?2 AND source_id = ?3 LIMIT 1",
        )?;
        let exists = stmt
            .query_row(params![workspace_uuid, source_type, source_id], |_| Ok(()))
            .optional()?
            .is_some();
        Ok(exists)
    }

    /// Find documents whose `auto_tags` is null — used by the curator to enqueue
    /// auto-tagging for stale rows.
    pub fn find_untagged(limit: i64) -> Result<Vec<WorkspaceDocument>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at, tags, auto_tags, summary, source_type, source_id FROM workspace_documents WHERE auto_tags IS NULL ORDER BY created_at DESC LIMIT ?1",
        )?;
        let rows = stmt.query_map(params![limit], |row| {
            Ok(WorkspaceDocument {
                id: Some(row.get(0)?),
                workspace_uuid: row.get(1)?,
                document_name: row.get(2)?,
                document_path: row.get(3)?,
                document_type: row.get(4)?,
                content_hash: row.get(5)?,
                embedded: row.get(6)?,
                created_at: row.get(7)?,
                tags: row.get(8)?,
                auto_tags: row.get(9)?,
                summary: row.get(10)?,
                source_type: row.get(11)?,
                source_id: row.get(12)?,
            })
        })?;
        let mut docs = Vec::new();
        for r in rows { docs.push(r?); }
        Ok(docs)
    }

    /// Count documents whose `auto_tags` is null — used to detect first-run scenarios.
    pub fn count_untagged() -> Result<i64, Error> {
        let connection = get_db_conn();
        let count: i64 = connection.query_row(
            "SELECT COUNT(*) FROM workspace_documents WHERE auto_tags IS NULL",
            [],
            |row| row.get(0),
        )?;
        Ok(count)
    }

    /// Update tags for a document.
    pub fn update_tags(id: u64, tags: Option<String>) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute(
            "UPDATE workspace_documents SET tags = ?1 WHERE id = ?2",
            params![tags, id],
        )?;
        Ok(())
    }

    /// Update auto-generated tags and summary for a document.
    pub fn update_auto_tags(id: u64, auto_tags: Option<String>, summary: Option<String>) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute(
            "UPDATE workspace_documents SET auto_tags = ?1, summary = ?2 WHERE id = ?3",
            params![auto_tags, summary, id],
        )?;
        Ok(())
    }

    /// Delete a document, but only if it belongs to the given workspace (authorization check).
    pub fn delete_scoped(id: u64, workspace_uuid: &str) -> Result<bool, Error> {
        let connection = get_db_conn();
        let affected = connection.execute(
            "DELETE FROM workspace_documents WHERE id = ?1 AND workspace_uuid = ?2",
            params![id, workspace_uuid],
        )?;
        Ok(affected > 0)
    }

    pub fn delete(id: u64) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute(
            "DELETE FROM workspace_documents WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }
}
