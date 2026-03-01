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
}

impl Workspace {
    pub fn create(name: String, description: Option<String>, icon: Option<String>) -> Result<Workspace, Error> {
        let connection = get_db_conn();
        let uuid = Uuid::new_v4().to_string();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        connection.execute(
            "INSERT INTO workspaces (uuid, name, description, icon, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
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
        })
    }

    /// Fetch all workspaces with their documents in 2 queries (avoids N+1).
    pub fn find_all_with_documents() -> Result<Vec<Workspace>, Error> {
        let connection = get_db_conn();

        // Query 1: all workspaces
        let mut ws_stmt = connection.prepare(
            "SELECT id, uuid, name, description, icon, created_at, updated_at FROM workspaces ORDER BY created_at DESC",
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
            "SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at FROM workspace_documents ORDER BY created_at DESC",
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
            "SELECT id, uuid, name, description, icon, created_at, updated_at FROM workspaces ORDER BY created_at DESC",
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
            "SELECT id, uuid, name, description, icon, created_at, updated_at FROM workspaces WHERE uuid = ?1",
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
        let connection = get_db_conn();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        connection.execute(
            "INSERT INTO workspace_documents (workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6)",
            params![workspace_uuid, document_name, document_path, document_type, content_hash, now],
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
        })
    }

    pub fn find_by_workspace(workspace_uuid: String) -> Result<Vec<WorkspaceDocument>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, workspace_uuid, document_name, document_path, document_type, content_hash, embedded, created_at FROM workspace_documents WHERE workspace_uuid = ?1 ORDER BY created_at DESC",
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
            })
        })?;

        let mut documents = Vec::new();
        for row in rows {
            documents.push(row?);
        }
        Ok(documents)
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
