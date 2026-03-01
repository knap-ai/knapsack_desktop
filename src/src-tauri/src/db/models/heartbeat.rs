use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeartbeatConfig {
    pub id: Option<u64>,
    pub enabled: bool,
    pub interval_minutes: i64,
    pub check_emails: bool,
    pub check_calendar: bool,
    pub check_documents: bool,
    pub quiet_hours_start: Option<String>,
    pub quiet_hours_end: Option<String>,
    pub last_run_at: Option<i64>,
    pub created_at: Option<i64>,
    pub updated_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeartbeatLog {
    pub id: Option<u64>,
    pub run_at: i64,
    pub context_summary: Option<String>,
    pub decision: String,
    pub notification_sent: bool,
    pub notification_content: Option<String>,
    pub created_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateHeartbeatConfigRequest {
    pub enabled: Option<bool>,
    pub interval_minutes: Option<i64>,
    pub check_emails: Option<bool>,
    pub check_calendar: Option<bool>,
    pub check_documents: Option<bool>,
    pub quiet_hours_start: Option<String>,
    pub quiet_hours_end: Option<String>,
}

impl HeartbeatConfig {
    /// Get the current heartbeat configuration (there should always be exactly one row).
    pub fn get_config() -> Result<HeartbeatConfig, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, enabled, interval_minutes, check_emails, check_calendar, check_documents, \
             quiet_hours_start, quiet_hours_end, last_run_at, created_at, updated_at \
             FROM heartbeat_config LIMIT 1",
        )?;

        let config = stmt.query_row([], |row| {
            let enabled_val: i64 = row.get(1)?;
            let check_emails_val: i64 = row.get(3)?;
            let check_calendar_val: i64 = row.get(4)?;
            let check_documents_val: i64 = row.get(5)?;
            Ok(HeartbeatConfig {
                id: Some(row.get(0)?),
                enabled: enabled_val != 0,
                interval_minutes: row.get(2)?,
                check_emails: check_emails_val != 0,
                check_calendar: check_calendar_val != 0,
                check_documents: check_documents_val != 0,
                quiet_hours_start: row.get(6)?,
                quiet_hours_end: row.get(7)?,
                last_run_at: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?;

        Ok(config)
    }

    /// Update the heartbeat configuration. Only provided fields are updated.
    pub fn update_config(req: &UpdateHeartbeatConfigRequest) -> Result<HeartbeatConfig, Error> {
        let connection = get_db_conn();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        // Build the update dynamically based on provided fields
        let mut set_clauses = Vec::new();
        let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

        if let Some(enabled) = req.enabled {
            set_clauses.push("enabled = ?");
            param_values.push(Box::new(enabled as i64));
        }
        if let Some(interval) = req.interval_minutes {
            set_clauses.push("interval_minutes = ?");
            param_values.push(Box::new(interval));
        }
        if let Some(check_emails) = req.check_emails {
            set_clauses.push("check_emails = ?");
            param_values.push(Box::new(check_emails as i64));
        }
        if let Some(check_calendar) = req.check_calendar {
            set_clauses.push("check_calendar = ?");
            param_values.push(Box::new(check_calendar as i64));
        }
        if let Some(check_documents) = req.check_documents {
            set_clauses.push("check_documents = ?");
            param_values.push(Box::new(check_documents as i64));
        }
        if let Some(ref quiet_start) = req.quiet_hours_start {
            set_clauses.push("quiet_hours_start = ?");
            param_values.push(Box::new(quiet_start.clone()));
        }
        if let Some(ref quiet_end) = req.quiet_hours_end {
            set_clauses.push("quiet_hours_end = ?");
            param_values.push(Box::new(quiet_end.clone()));
        }

        // Always update updated_at
        set_clauses.push("updated_at = ?");
        param_values.push(Box::new(now));

        if !set_clauses.is_empty() {
            let sql = format!(
                "UPDATE heartbeat_config SET {} WHERE id = (SELECT id FROM heartbeat_config LIMIT 1)",
                set_clauses.join(", ")
            );
            let params_ref: Vec<&dyn rusqlite::types::ToSql> =
                param_values.iter().map(|p| p.as_ref()).collect();
            connection.execute(&sql, params_ref.as_slice())?;
        }

        Self::get_config()
    }

    /// Update the last_run_at timestamp to now.
    pub fn update_last_run_at() -> Result<(), Error> {
        let connection = get_db_conn();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        connection.execute(
            "UPDATE heartbeat_config SET last_run_at = ? WHERE id = (SELECT id FROM heartbeat_config LIMIT 1)",
            params![now],
        )?;
        Ok(())
    }
}

impl HeartbeatLog {
    /// Create a new heartbeat log entry.
    pub fn create(
        context_summary: Option<String>,
        decision: &str,
        notification_sent: bool,
        notification_content: Option<String>,
    ) -> Result<HeartbeatLog, Error> {
        let connection = get_db_conn();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        connection.execute(
            "INSERT INTO heartbeat_logs (run_at, context_summary, decision, notification_sent, notification_content, created_at) \
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                now,
                context_summary,
                decision,
                notification_sent as i64,
                notification_content,
                now,
            ],
        )?;

        let id = connection.last_insert_rowid() as u64;
        Ok(HeartbeatLog {
            id: Some(id),
            run_at: now,
            context_summary,
            decision: decision.to_string(),
            notification_sent,
            notification_content,
            created_at: Some(now),
        })
    }

    /// Get the most recent heartbeat logs.
    pub fn get_recent_logs(limit: i64) -> Result<Vec<HeartbeatLog>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, run_at, context_summary, decision, notification_sent, notification_content, created_at \
             FROM heartbeat_logs ORDER BY run_at DESC LIMIT ?1",
        )?;

        let rows = stmt.query_map(params![limit], |row| {
            let notification_sent_val: i64 = row.get(4)?;
            Ok(HeartbeatLog {
                id: Some(row.get(0)?),
                run_at: row.get(1)?,
                context_summary: row.get(2)?,
                decision: row.get(3)?,
                notification_sent: notification_sent_val != 0,
                notification_content: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        Ok(results)
    }
}
