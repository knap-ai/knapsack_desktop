use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CadenceTrigger {
  pub id: Option<u64>,
  pub automation_uuid: String,
  pub cadence_type: String,
  pub day_of_week: Option<String>,
  pub time: Option<String>,
}

impl CadenceTrigger {
  pub fn find_by_id(id: u64) -> Result<Option<CadenceTrigger>> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT * FROM cadence_triggers WHERE id = ?1")?;
    let cadence = stmt
      .query_row(params![id], |row| {
        Ok(CadenceTrigger {
          id: Some(row.get(0)?),
          automation_uuid: row.get(1)?,
          cadence_type: row.get(2)?,
          day_of_week: row.get(3)?,
          time: row.get(4)?,
        })
      })
      .optional()?;

    Ok(cadence)
  }

  pub fn find_by_ids(ids: Vec<u64>) -> Result<Vec<CadenceTrigger>> {
    let connection = get_db_conn();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
      "SELECT * FROM cadence_triggers WHERE id IN ({})",
      placeholders
    );
    let mut stmt = connection.prepare(&query)?;

    let id_refs: Vec<&u64> = ids.iter().collect();
    let rows = stmt.query_map(rusqlite::params_from_iter(id_refs), |row| {
      Ok(CadenceTrigger {
        id: Some(row.get(0)?),
        automation_uuid: row.get(1)?,
        cadence_type: row.get(2)?,
        day_of_week: row.get(3)?,
        time: row.get(4)?,
      })
    })?;

    let mut cadences = Vec::new();
    for cadence in rows {
      cadences.push(cadence?);
    }
    Ok(cadences)
  }

  pub fn find_all() -> Vec<CadenceTrigger> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT * FROM cadence_triggers")
      .expect("could not prepare query get automation cadences");
    let rows = stmt
      .query_map([], |row| {
        Ok(CadenceTrigger {
          id: Some(row.get(0)?),
          automation_uuid: row.get(1)?,
          cadence_type: row.get(2)?,
          day_of_week: row.get(3)?,
          time: row.get(4)?,
        })
      })
      .expect("Could not execute query");
    rows.filter_map(Result::ok).collect()
  }

  pub fn create(&mut self) -> Result<(), Error> {
    if self.id.is_some() {
      return Err(Error::KSError(
        "Cannot create CadenceTrigger; CadenceTrigger already exists.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
      .execute(
        "INSERT INTO cadence_triggers (automation_uuid, cadence_type, day_of_week, time) VALUES (?1, ?2, ?3, ?4)",
        (&self.automation_uuid, &self.cadence_type, &self.day_of_week, &self.time),
      )
      .expect("Could not insert automation cadence");

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update CadenceTrigger; CadenceTrigger does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
      .execute(
        "UPDATE cadence_triggers SET automation_id = ?1, cadence_type = ?2, day_of_week = ?3, time = ?4 WHERE id = ?5",
        (&self.automation_uuid, &self.cadence_type, &self.day_of_week, &self.time, &self.id),
      )
      .expect("Could not update automation cadence");
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete CadenceTrigger; CadenceTrigger does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
      .execute("DELETE FROM cadence_triggers WHERE id = ?1", [self.id])
      .expect("Could not delete automation cadence");
    Ok(())
  }
}
