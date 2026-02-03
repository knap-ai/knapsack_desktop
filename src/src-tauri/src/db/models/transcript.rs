use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Transcript {
  pub id: Option<u64>,
  pub thread_id: Option<u64>,
  pub filename: String,
  pub start_time: Option<i64>,
  pub end_time: Option<i64>,
  pub timestamp: Option<i64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptWithContent {
  #[serde(flatten)]
  pub transcript: Transcript,
  pub content: String,
  pub filename: String,
  pub start_time: Option<i64>,
  pub end_time: Option<i64>,
  pub participants: Option<String>,
  pub thread_id: Option<u64>,
}

impl Default for Transcript {
  fn default() -> Self {
    Transcript {
      id: None,
      thread_id: None,
      filename: String::new(),
      start_time: None,
      end_time: None,
      timestamp: None,
    }
  }
}

impl Transcript {
  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    Ok(Transcript {
      id: Some(row.get(0)?),
      thread_id: row.get(1)?,
      filename: row.get(2)?,
      start_time: row.get(3)?,
      end_time: row.get(4)?,
      timestamp: row.get(5)?,
    })
  }

  pub fn find_by_id(id: u64) -> Result<Option<Transcript>, Error> {
    let connection = get_db_conn();
    let mut stmt =
      connection.prepare("SELECT id, thread_id, filename, start_time, end_time, timestamp FROM transcripts WHERE id = ?1")?;
    let thread = stmt.query_row([id], |row| Transcript::build_struct_from_row(row));

    match thread {
      Ok(thread) => Ok(Some(thread)),
      Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
      Err(err) => Err(err.into()),
    }
  }

  pub fn find_by_thread_id(thread_id: u64) -> Result<Option<Transcript>, Error> {
    let connection = get_db_conn();
    let mut stmt =
      connection.prepare("SELECT id, thread_id, filename, start_time, end_time, timestamp FROM transcripts WHERE thread_id = ?1")?;
    let thread = stmt.query_row([thread_id], |row| Transcript::build_struct_from_row(row));

    match thread {
      Ok(thread) => Ok(Some(thread)),
      Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
      Err(err) => Err(err.into()),
    }
  }

  pub fn find_all() -> Result<Vec<Transcript>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, thread_id, filename, start_time, end_time, timestamp FROM transcripts ORDER BY timestamp DESC")?;
    let thread_iter = stmt.query_map([], |row| Transcript::build_struct_from_row(row))?;

    let mut threads = Vec::new();
    for thread in thread_iter {
      threads.push(thread?);
    }
    Ok(threads)
  }

  /// Find transcripts created since the given Unix timestamp (seconds).
  pub fn find_recent(since_timestamp: i64) -> Result<Vec<Transcript>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, thread_id, filename, start_time, end_time, timestamp FROM transcripts WHERE timestamp >= ?1 ORDER BY timestamp DESC")?;
    let iter = stmt.query_map(params![since_timestamp], |row| Transcript::build_struct_from_row(row))?;

    let mut results = Vec::new();
    for item in iter {
      results.push(item?);
    }
    Ok(results)
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();

    if self.filename.is_empty() {
      return Err(Error::KSError(
        "Cannot create a Transcript; filename is missing.".into(),
      ));
    }

    if self.id.is_some() {
      if let Some(_) = Transcript::find_by_id(self.id.unwrap())? {
        println!("Transcript with ID {} already exists.", self.id.unwrap());
        return Ok(());
      }
    }

    let current_timestamp = chrono::Utc::now().timestamp();
    let timestamp = self.timestamp.unwrap_or(current_timestamp);

    let mut stmt = connection.prepare(
      "INSERT INTO transcripts (thread_id, filename, start_time, end_time, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)",
    )?;
    stmt.execute(params![
      self.thread_id,
      self.filename,
      self.start_time,
      self.end_time,
      timestamp,
    ])?;

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update Transcript; Transcript does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    let mut stmt =
      connection.prepare("UPDATE transcripts SET thread_id = ?2, filename = ?3, start_time = ?4, end_time = ?5, timestamp = ?6 WHERE id = ?1")?;
    stmt.execute(params![
      self.id,
      self.thread_id,
      self.filename,
      self.start_time,
      self.end_time,
      self.timestamp,
    ])?;
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete Transcript; Transcript does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    let mut stmt = connection.prepare("DELETE FROM transcripts WHERE id = ?1")?;
    stmt.execute([self.id])?;
    Ok(())
  }
}
