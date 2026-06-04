use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;

/// A single recorded browser action within a workflow.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordedAction {
  pub action_type: String, // "navigate", "click", "type", "select", "scroll", "submit", "wait"
  pub url: Option<String>, // For navigate actions
  pub value: Option<String>, // For type/select actions
  pub timestamp_ms: u64,   // Relative to recording start
  pub selector: Option<ElementSelector>,
}

/// Multi-strategy element selector for resilient playback.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementSelector {
  pub tag_name: Option<String>,
  pub id: Option<String>,
  pub class_name: Option<String>,
  pub text_content: Option<String>,
  pub aria_label: Option<String>,
  pub aria_role: Option<String>,
  pub placeholder: Option<String>,
  pub name: Option<String>,
  pub css_selector: Option<String>,
  pub xpath: Option<String>,
  pub outer_html_preview: Option<String>, // First ~200 chars of outerHTML for LLM fallback
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserWorkflow {
  pub id: Option<u64>,
  pub uuid: String,
  pub name: String,
  pub description: String,
  pub start_url: String,
  pub steps_json: String,
  pub browser_profile: String,
  pub is_active: bool,
  pub created_at: i64,
  pub updated_at: i64,
}

impl BrowserWorkflow {
  pub fn find_by_uuid(uuid: &str) -> Result<Option<BrowserWorkflow>> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
            "SELECT id, uuid, name, description, start_url, steps_json, browser_profile, is_active, created_at, updated_at FROM browser_workflows WHERE uuid = ?1",
        )?;
    let workflow = stmt
      .query_row(params![uuid], |row| BrowserWorkflow::from_row(row))
      .optional()?;
    Ok(workflow)
  }

  pub fn find_by_id(id: u64) -> Result<Option<BrowserWorkflow>> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
            "SELECT id, uuid, name, description, start_url, steps_json, browser_profile, is_active, created_at, updated_at FROM browser_workflows WHERE id = ?1",
        )?;
    let workflow = stmt
      .query_row(params![id], |row| BrowserWorkflow::from_row(row))
      .optional()?;
    Ok(workflow)
  }

  pub fn find_all() -> Vec<BrowserWorkflow> {
    let connection = get_db_conn();
    let mut stmt = connection
            .prepare(
                "SELECT id, uuid, name, description, start_url, steps_json, browser_profile, is_active, created_at, updated_at FROM browser_workflows ORDER BY created_at DESC",
            )
            .expect("could not prepare query get browser_workflows");
    let rows = stmt
      .query_map([], |row| BrowserWorkflow::from_row(row))
      .expect("Could not execute query");
    rows.filter_map(Result::ok).collect()
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    connection
            .execute(
                "INSERT INTO browser_workflows (uuid, name, description, start_url, steps_json, browser_profile, is_active, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    &self.uuid,
                    &self.name,
                    &self.description,
                    &self.start_url,
                    &self.steps_json,
                    &self.browser_profile,
                    &self.is_active,
                    &self.created_at,
                    &self.updated_at,
                ],
            )
            .map_err(|e| Error::KSError(format!("Could not insert browser workflow: {}", e)))?;
    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update BrowserWorkflow; workflow does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
            .execute(
                "UPDATE browser_workflows SET name = ?1, description = ?2, start_url = ?3, steps_json = ?4, browser_profile = ?5, is_active = ?6, updated_at = ?7 WHERE id = ?8",
                params![
                    &self.name,
                    &self.description,
                    &self.start_url,
                    &self.steps_json,
                    &self.browser_profile,
                    &self.is_active,
                    &self.updated_at,
                    &self.id,
                ],
            )
            .map_err(|e| Error::KSError(format!("Could not update browser workflow: {}", e)))?;
    Ok(())
  }

  pub fn delete(id: u64) -> Result<(), Error> {
    let connection = get_db_conn();
    connection
      .execute("DELETE FROM browser_workflows WHERE id = ?1", params![id])
      .map_err(|e| Error::KSError(format!("Could not delete browser workflow: {}", e)))?;
    connection
            .execute(
                "DELETE FROM browser_workflow_runs WHERE workflow_uuid = (SELECT uuid FROM browser_workflows WHERE id = ?1)",
                params![id],
            )
            .ok();
    Ok(())
  }

  fn from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    let is_active_val: i64 = row.get(7)?;
    Ok(BrowserWorkflow {
      id: Some(row.get(0)?),
      uuid: row.get(1)?,
      name: row.get(2)?,
      description: row.get(3)?,
      start_url: row.get(4)?,
      steps_json: row.get(5)?,
      browser_profile: row.get(6)?,
      is_active: is_active_val != 0,
      created_at: row.get(8)?,
      updated_at: row.get(9)?,
    })
  }

  pub fn get_steps(&self) -> Result<Vec<RecordedAction>, Error> {
    serde_json::from_str(&self.steps_json)
      .map_err(|e| Error::KSError(format!("Could not parse workflow steps: {}", e)))
  }
}
