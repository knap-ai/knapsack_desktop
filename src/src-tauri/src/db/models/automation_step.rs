use serde::{Deserialize, Serialize};
use rusqlite::{params, OptionalExtension, Result};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AutomationStep {
  pub id: Option<u64>,
  pub automation_uuid: String,
  pub name: String,
  pub ordering: u64,
  pub args_json: Option<String>,
}

impl AutomationStep {
  pub fn find_by_id(id: u64) -> Result<Option<AutomationStep>> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT * FROM automation_steps WHERE id = ?1")?;
    let step = stmt.query_row(params![id], |row| {
      Ok(AutomationStep {
        id: Some(row.get(0)?),
        automation_uuid: row.get(1)?,
        name: row.get(2)?,
        ordering: row.get(3)?,
        args_json: row.get(4)?,
      })
    }).optional()?;

    Ok(step)
  }

  pub fn find_by_ids(ids: Vec<u64>) -> Result<Vec<AutomationStep>> {
    let connection = get_db_conn();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!("SELECT * FROM automation_steps WHERE id IN ({})", placeholders);
    let mut stmt = connection.prepare(&query)?;

    let id_refs: Vec<&u64> = ids.iter().collect();
    let rows = stmt.query_map(rusqlite::params_from_iter(id_refs), |row| {
        Ok(AutomationStep {
            id: Some(row.get(0)?),
            automation_uuid: row.get(1)?,
            name: row.get(2)?,
            ordering: row.get(3)?,
            args_json: row.get(4)?,
        })
    })?;

    let mut steps = Vec::new();
    for step in rows {
        steps.push(step?);
    }
    Ok(steps)
  }

  pub fn find_all() -> Vec<AutomationStep> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT * FROM automation_steps ORDER BY ordering")
      .expect("could not prepare query get automation steps");
    let rows = stmt
      .query_map([], |row| {
        Ok(AutomationStep {
          id: Some(row.get(0)?),
          automation_uuid: row.get(1)?,
          name: row.get(2)?,
          ordering: row.get(3)?,
          args_json: row.get(4)?,
        })
      })
    .expect("Could not execute query");
    rows.filter_map(Result::ok).collect()
  }

  pub fn create(&mut self) -> Result<(), Error> {
    if self.id.is_some() {
      return Err(Error::KSError(
        "Cannot create AutomationStep; AutomationStep already exists.".into()));
    }
    let connection = get_db_conn();
    connection
      .execute(
        "INSERT INTO automation_steps (automation_uuid, name, ordering, args_json) VALUES (?1, ?2, ?3, ?4)",
        (&self.automation_uuid, &self.name, &self.ordering, &self.args_json),
      )
      .expect("Could not insert automation step");

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update AutomationStep; AutomationStep does not exist.".into()));
    }
    let connection = get_db_conn();
    connection
      .execute(
        "UPDATE automation_steps SET automation_uuid = ?1, name = ?2, ordering = ?3, args_json = ?4 WHERE id = ?5",
        (&self.automation_uuid, &self.name, &self.ordering, &self.args_json, &self.id),
        )
      .expect("Could not update automation step");
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete AutomationStep; AutomationStep does not exist.".into()));
    }
    let connection = get_db_conn();
    connection
      .execute(
        "DELETE FROM automation_steps WHERE id = ?1",
        [self.id],
        )
      .expect("Could not delete automation step");
    Ok(())
  }
}
