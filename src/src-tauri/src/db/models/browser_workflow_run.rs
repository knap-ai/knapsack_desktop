use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserWorkflowRun {
  pub id: Option<u64>,
  pub workflow_uuid: String,
  pub automation_run_id: Option<u64>,
  pub status: String, // "pending", "running", "completed", "failed"
  pub started_at: Option<i64>,
  pub completed_at: Option<i64>,
  pub result_json: Option<String>,
  pub error_message: Option<String>,
  pub screenshot_path: Option<String>,
}

impl BrowserWorkflowRun {
  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    connection
            .execute(
                "INSERT INTO browser_workflow_runs (workflow_uuid, automation_run_id, status, started_at, completed_at, result_json, error_message, screenshot_path) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    &self.workflow_uuid,
                    &self.automation_run_id,
                    &self.status,
                    &self.started_at,
                    &self.completed_at,
                    &self.result_json,
                    &self.error_message,
                    &self.screenshot_path,
                ],
            )
            .map_err(|e| Error::KSError(format!("Could not insert workflow run: {}", e)))?;
    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update run; run does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
            .execute(
                "UPDATE browser_workflow_runs SET status = ?1, started_at = ?2, completed_at = ?3, result_json = ?4, error_message = ?5, screenshot_path = ?6 WHERE id = ?7",
                params![
                    &self.status,
                    &self.started_at,
                    &self.completed_at,
                    &self.result_json,
                    &self.error_message,
                    &self.screenshot_path,
                    &self.id,
                ],
            )
            .map_err(|e| Error::KSError(format!("Could not update workflow run: {}", e)))?;
    Ok(())
  }

  pub fn find_by_workflow_uuid(workflow_uuid: &str) -> Vec<BrowserWorkflowRun> {
    let connection = get_db_conn();
    let mut stmt = connection
            .prepare(
                "SELECT id, workflow_uuid, automation_run_id, status, started_at, completed_at, result_json, error_message, screenshot_path FROM browser_workflow_runs WHERE workflow_uuid = ?1 ORDER BY started_at DESC LIMIT 50",
            )
            .expect("could not prepare query");
    let rows = stmt
      .query_map(params![workflow_uuid], |row| {
        Ok(BrowserWorkflowRun {
          id: Some(row.get(0)?),
          workflow_uuid: row.get(1)?,
          automation_run_id: row.get(2)?,
          status: row.get(3)?,
          started_at: row.get(4)?,
          completed_at: row.get(5)?,
          result_json: row.get(6)?,
          error_message: row.get(7)?,
          screenshot_path: row.get(8)?,
        })
      })
      .expect("Could not execute query");
    rows.filter_map(Result::ok).collect()
  }
}
