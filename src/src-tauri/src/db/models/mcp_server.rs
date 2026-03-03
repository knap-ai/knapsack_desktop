use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpServer {
    pub id: Option<u64>,
    pub uuid: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub command: String,
    pub args: Option<String>,
    pub env_vars: Option<String>,
    pub icon: Option<String>,
    pub author: Option<String>,
    pub version: Option<String>,
    pub source_url: Option<String>,
    pub is_installed: bool,
    pub is_enabled: bool,
    pub config_json: Option<String>,
    pub installed_at: Option<i64>,
    pub created_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewMcpServer {
    pub uuid: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub command: String,
    pub args: Option<String>,
    pub env_vars: Option<String>,
    pub icon: Option<String>,
    pub author: Option<String>,
    pub version: Option<String>,
    pub source_url: Option<String>,
    pub config_json: Option<String>,
}

impl McpServer {
    fn from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
        let is_installed_val: i64 = row.get(12)?;
        let is_enabled_val: i64 = row.get(13)?;
        Ok(McpServer {
            id: Some(row.get(0)?),
            uuid: row.get(1)?,
            name: row.get(2)?,
            description: row.get(3)?,
            category: row.get(4)?,
            command: row.get(5)?,
            args: row.get(6)?,
            env_vars: row.get(7)?,
            icon: row.get(8)?,
            author: row.get(9)?,
            version: row.get(10)?,
            source_url: row.get(11)?,
            is_installed: is_installed_val != 0,
            is_enabled: is_enabled_val != 0,
            config_json: row.get(14)?,
            installed_at: row.get(15)?,
            created_at: row.get(16)?,
        })
    }

    const SELECT_COLS: &'static str =
        "id, uuid, name, description, category, command, args, env_vars, icon, author, version, source_url, is_installed, is_enabled, config_json, installed_at, created_at";

    pub fn get_all_servers() -> Result<Vec<McpServer>, Error> {
        let connection = get_db_conn();
        let sql = format!("SELECT {} FROM mcp_servers ORDER BY name", Self::SELECT_COLS);
        let mut stmt = connection.prepare(&sql)?;
        let rows = stmt.query_map([], |row| McpServer::from_row(row))?;
        let mut servers = Vec::new();
        for row in rows {
            servers.push(row?);
        }
        Ok(servers)
    }

    pub fn get_servers_by_category(category: &str) -> Result<Vec<McpServer>, Error> {
        let connection = get_db_conn();
        let sql = format!(
            "SELECT {} FROM mcp_servers WHERE category = ?1 ORDER BY name",
            Self::SELECT_COLS
        );
        let mut stmt = connection.prepare(&sql)?;
        let rows = stmt.query_map(params![category], |row| McpServer::from_row(row))?;
        let mut servers = Vec::new();
        for row in rows {
            servers.push(row?);
        }
        Ok(servers)
    }

    pub fn get_server_by_uuid(uuid: &str) -> Result<Option<McpServer>, Error> {
        let connection = get_db_conn();
        let sql = format!(
            "SELECT {} FROM mcp_servers WHERE uuid = ?1",
            Self::SELECT_COLS
        );
        let mut stmt = connection.prepare(&sql)?;
        let server = stmt
            .query_row(params![uuid], |row| McpServer::from_row(row))
            .optional()?;
        Ok(server)
    }

    pub fn get_installed_servers() -> Result<Vec<McpServer>, Error> {
        let connection = get_db_conn();
        let sql = format!(
            "SELECT {} FROM mcp_servers WHERE is_installed = 1 AND is_enabled = 1 ORDER BY name",
            Self::SELECT_COLS
        );
        let mut stmt = connection.prepare(&sql)?;
        let rows = stmt.query_map([], |row| McpServer::from_row(row))?;
        let mut servers = Vec::new();
        for row in rows {
            servers.push(row?);
        }
        Ok(servers)
    }

    pub fn install_server(uuid: &str) -> Result<(), Error> {
        let connection = get_db_conn();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        connection.execute(
            "UPDATE mcp_servers SET is_installed = 1, is_enabled = 1, installed_at = ?1 WHERE uuid = ?2",
            params![now, uuid],
        )?;
        Ok(())
    }

    pub fn uninstall_server(uuid: &str) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute(
            "UPDATE mcp_servers SET is_installed = 0, is_enabled = 0, installed_at = NULL WHERE uuid = ?1",
            params![uuid],
        )?;
        Ok(())
    }

    pub fn enable_server(uuid: &str) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute(
            "UPDATE mcp_servers SET is_enabled = 1 WHERE uuid = ?1 AND is_installed = 1",
            params![uuid],
        )?;
        Ok(())
    }

    pub fn disable_server(uuid: &str) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute(
            "UPDATE mcp_servers SET is_enabled = 0 WHERE uuid = ?1",
            params![uuid],
        )?;
        Ok(())
    }

    pub fn update_server_config(uuid: &str, config_json: &str) -> Result<(), Error> {
        let connection = get_db_conn();
        connection.execute(
            "UPDATE mcp_servers SET config_json = ?1 WHERE uuid = ?2",
            params![config_json, uuid],
        )?;
        Ok(())
    }

    pub fn add_custom_server(server: &NewMcpServer) -> Result<McpServer, Error> {
        let connection = get_db_conn();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        connection.execute(
            "INSERT INTO mcp_servers (uuid, name, description, category, command, args, env_vars, icon, author, version, source_url, config_json, is_installed, is_enabled, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, 0, 0, ?13)",
            params![
                server.uuid,
                server.name,
                server.description,
                server.category,
                server.command,
                server.args,
                server.env_vars,
                server.icon,
                server.author,
                server.version,
                server.source_url,
                server.config_json,
                now,
            ],
        )?;

        let id = connection.last_insert_rowid() as u64;
        Ok(McpServer {
            id: Some(id),
            uuid: server.uuid.clone(),
            name: server.name.clone(),
            description: server.description.clone(),
            category: server.category.clone(),
            command: server.command.clone(),
            args: server.args.clone(),
            env_vars: server.env_vars.clone(),
            icon: server.icon.clone(),
            author: server.author.clone(),
            version: server.version.clone(),
            source_url: server.source_url.clone(),
            is_installed: false,
            is_enabled: false,
            config_json: server.config_json.clone(),
            installed_at: None,
            created_at: Some(now),
        })
    }
}
