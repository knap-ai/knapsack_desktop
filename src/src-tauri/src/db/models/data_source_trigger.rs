use rusqlite::Result;
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DataSourceTrigger {
  pub id: Option<u64>,
  pub automation_uuid: String,
  pub data_source: String,
  pub offset_minutes: i64,
}

impl DataSourceTrigger {
  fn build_struct_from_row(row: &rusqlite::Row) -> Result<DataSourceTrigger> {
    Ok(DataSourceTrigger {
      id: Some(row.get(0)?),
      automation_uuid: row.get(1)?,
      data_source: row.get(2)?,
      offset_minutes: row.get(3)?,
    })
  }

  pub fn create(&mut self) -> Result<(), Error> {
    if self.id.is_some() {
      return Err(Error::KSError(
        "Cannot create DataSourceTrigger; DataSourceTrigger already exists.".into(),
      ));
    }
    let connection = get_db_conn();

    connection
      .execute(
        "INSERT INTO data_source_trigger (automation_uuid, data_source, offset_minutes) VALUES (?1, ?2, ?3)",
        (&self.automation_uuid, &self.data_source, &self.offset_minutes),
      )
      .expect("Could not insert automation data_source trigger");

    self.id = Some(connection.last_insert_rowid() as u64);

    Ok(())
  }
}
