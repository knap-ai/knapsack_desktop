use rusqlite::{params, params_from_iter, OptionalExtension, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;
use serde_json::Value;
use crate::db::models::feed_item::FeedItem;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AutomationRun {
  pub id: Option<u64>,
  pub automation_uuid: String,
  pub user_id: u64,
  pub thread_id: Option<u64>,
  pub schedule_timestamp: Option<i64>,
  pub execution_timestamp: Option<i64>,
  pub run_params: Option<String>,
  pub feed_item_id: Option<u64>,
}

impl AutomationRun {
  pub fn find_run_by_calendar_event(
    event_id: u64,
    timestamp: i64,
    automation_uuid: &str,
    user_id: u64
) -> Result<Option<Self>, Error> {
    let conn = get_db_conn();
    let mut stmt = conn.prepare(
      "SELECT id, automation_uuid, user_id, thread_id, 
        schedule_timestamp, execution_timestamp, run_params, feed_item_id
        FROM automation_runs
        WHERE automation_uuid = ?1
        AND user_id = ?2
        AND json_extract(run_params, '$.event_id') = ?3
        AND json_extract(run_params, '$.timestamp') = ?4"
    ).map_err(|e| Error::KSError(e.to_string()))?;

    stmt.query_row(
      params![automation_uuid, user_id, event_id, timestamp],
      |row| Self::build_struct_from_row(row)
    ).optional().map_err(|e| Error::KSError(e.to_string()))
  }

  pub fn find_by_id(id: u64) -> Result<Option<AutomationRun>> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, automation_uuid, user_id, thread_id, schedule_timestamp, execution_timestamp, run_params, feed_item_id FROM automation_runs WHERE id = ?1",
    )?;
    let run = stmt
      .query_row(params![id], |row| AutomationRun::build_struct_from_row(row))
      .optional()?;

    Ok(run)
  }

  pub fn find_by_ids(ids: Vec<u64>) -> Result<Vec<AutomationRun>> {
    let connection = get_db_conn();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
      "SELECT id, automation_uuid, user_id, thread_id, schedule_timestamp, execution_timestamp, run_params, feed_item_id FROM automation_runs WHERE id IN ({})",
      placeholders
    );
    let mut stmt = connection.prepare(&query)?;

    let id_refs: Vec<&u64> = ids.iter().collect();
    let rows = stmt.query_map(rusqlite::params_from_iter(id_refs), |row| {
      AutomationRun::build_struct_from_row(row)
    })?;

    let mut runs = Vec::new();
    for run in rows {
      runs.push(run?);
    }
    Ok(runs)
  }

  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    Ok(AutomationRun {
      id: Some(row.get(0)?),
      automation_uuid: row.get(1)?,
      user_id: row.get(2)?,
      thread_id: row.get(3)?,
      schedule_timestamp: row.get(4)?,
      execution_timestamp: row.get(5)?,
      run_params: row.get(6)?,
      feed_item_id: row.get(7)?,
    })
  }

  pub fn find_all() -> Vec<AutomationRun> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, automation_uuid, user_id, thread_id, schedule_timestamp, execution_timestamp, run_params, feed_item_id FROM automation_runs ORDER BY date DESC")
      .expect("could not prepare query get automation runs");
    let rows = stmt
      .query_map([], |row| AutomationRun::build_struct_from_row(row))
      .expect("Could not execute query");
    rows.filter_map(Result::ok).collect()
  }

  pub fn create(&mut self) -> Result<(), Error> {
    if self.id.is_some() {
      return Err(Error::KSError(
        "Cannot create AutomationRun; AutomationRun already exists.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
      .execute(
        "INSERT INTO automation_runs (automation_uuid, user_id, thread_id, schedule_timestamp, execution_timestamp, run_params, feed_item_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (&self.automation_uuid, &self.user_id,  &self.thread_id, &self.schedule_timestamp, &self.execution_timestamp, &self.run_params,  &self.feed_item_id),
        )
      .expect("Could not insert automation run");

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    connection
      .execute(
        "UPDATE automation_runs SET automation_uuid = ?2, user_id = ?3, thread_id = ?4, schedule_timestamp = ?5, execution_timestamp = ?6, run_params = ?7, feed_item_id = ?8 WHERE id = ?1",
        (&self.id, &self.automation_uuid, &self.user_id,  &self.thread_id, &self.schedule_timestamp, &self.execution_timestamp, &self.run_params,  &self.feed_item_id),
        )
      .expect("Could not insert automation run");

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn upsert_schedule(&mut self) -> Result<AutomationRun, Error> {
    let (event_id, timestamp) = match &self.run_params {
      Some(params) => {
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(params) {
          let event_id = json.get("event_id").and_then(|v| v.as_u64());
          let timestamp = json.get("timestamp").and_then(|v| v.as_i64());
          
          match (event_id, timestamp) {
            (Some(e), Some(t)) => (e, t),
            _ => return Err(Error::KSError("Missing event_id or timestamp in run_params".into()))
          }
        } else {
          return Err(Error::KSError("Invalid JSON in run_params".into()));
        }
      },
      None => return Err(Error::KSError("Missing run_params".into()))
    };
  
    let maybe_instance = AutomationRun::find_run_by_calendar_event(
      event_id,
      timestamp,
      &self.automation_uuid,
      self.user_id,
    )?;
  
    match maybe_instance {
      Some(instance) => {
        self.id = instance.id;
        self.execution_timestamp = instance.execution_timestamp;
        self.thread_id = instance.thread_id;
        self.update()?;
        Ok(self.clone())
      }
      None => {
        self.create()?;
        Ok(self.clone())
      }
    }
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete AutomationRun; AutomationRun does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
      .execute("DELETE FROM automation_runs WHERE id = ?1", [self.id])
      .expect("Could not delete automation run");
    Ok(())
  }

  pub fn delete_outdated_calendar_runs(calendar_event_ids: &[u64], from_timestamp: i64) -> Result<(), Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "
        SELECT id, run_params, feed_item_id
        FROM automation_runs
        WHERE run_params IS NOT NULL
        AND schedule_timestamp >= ?1
    ",
    )?;

    let rows = stmt.query_map([from_timestamp], |row| {
      Ok((row.get::<_, u64>(0)?, row.get::<_, String>(1)?, row.get::<_, Option<u64>>(2)?))
    })?;

    let mut ids_to_delete = Vec::new();
    let mut feed_item_ids_to_delete = Vec::new();

    for row in rows {
      let (id, run_params, feed_item_id_option) = row?;

      if let Ok(params_value) = serde_json::from_str::<Value>(&run_params) {
        if let Some(event_id) = params_value.get("event_id").and_then(|v| v.as_u64()) {
          if !calendar_event_ids.contains(&event_id) {
            ids_to_delete.push(id);
            if let Some(feed_item_id) = feed_item_id_option {
              feed_item_ids_to_delete.push(feed_item_id);
            }
          }
        }
      }
    }

    if !ids_to_delete.is_empty() {
      let placeholders = vec!["?"; ids_to_delete.len()].join(",");
      let delete_query = format!("DELETE FROM automation_runs WHERE id IN ({})", placeholders);

      let mut delete_stmt = connection.prepare(&delete_query)?;
      match delete_stmt.execute(params_from_iter(ids_to_delete)){
        Ok(_) => {},
        Err(e) => return Err(Error::KSError(format!("Error deleting automation runs: {:?}", e))),
      };
    }

    if !feed_item_ids_to_delete.is_empty() {
      let placeholders = vec!["?"; feed_item_ids_to_delete.len()].join(",");
      let update_query = format!("UPDATE feed_items SET deleted = \"true\" WHERE id IN ({})", placeholders);

      let mut update_stmt = connection.prepare(&update_query)?;
      match update_stmt.execute(params_from_iter(feed_item_ids_to_delete)){
        Ok(_) => {},
        Err(e) => return Err(Error::KSError(format!("Error deleting feed items: {:?}", e))),
      };
    }

    Ok(())
  }

  pub fn find_by_feed_item_id(id: u64) -> Result<Option<AutomationRun>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, automation_uuid, user_id, thread_id, schedule_timestamp, execution_timestamp, run_params, feed_item_id FROM automation_runs WHERE feed_item_id = ?1",
    )?;
    let row = stmt
      .query_row(params![id], |row| AutomationRun::build_struct_from_row(row))
      .optional()?;
    Ok(row)
  }
}
