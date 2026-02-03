use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageFeedback {
  pub id: Option<u64>,
  pub user_id: u64,
  pub message_id: u64,
  pub feedback: i32,
  pub timestamp: u64,
}

impl MessageFeedback {
  pub fn find_by_id(id: u64) -> Result<Option<MessageFeedback>> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, user_id, message_id, feedback, timestamp FROM message_feedbacks WHERE id = ?1",
    )?;
    let feedback = stmt
      .query_row(params![id], |row| {
        MessageFeedback::build_struct_from_row(row)
      })
      .optional()?;

    Ok(feedback)
  }

  pub fn find_by_user_id(user_id: u64) -> Result<Vec<MessageFeedback>> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, user_id, message_id, feedback, timestamp FROM message_feedbacks where user_id = ?1")?;
    let rows = stmt.query_map([user_id], |row| MessageFeedback::build_struct_from_row(row))?;

    let mut feedbacks = Vec::new();
    for feedback in rows {
      feedbacks.push(feedback?);
    }
    Ok(feedbacks)
  }

  pub fn find_by_ids(ids: Vec<u64>) -> Result<Vec<MessageFeedback>> {
    let connection = get_db_conn();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
      "SELECT id, user_id, message_id, feedback, timestamp FROM message_feedbacks WHERE id IN ({})",
      placeholders
    );
    let mut stmt = connection.prepare(&query)?;

    let id_refs: Vec<&u64> = ids.iter().collect();
    let rows = stmt.query_map(rusqlite::params_from_iter(id_refs), |row| {
      MessageFeedback::build_struct_from_row(row)
    })?;

    let mut feedbacks = Vec::new();
    for feedback in rows {
      feedbacks.push(feedback?);
    }
    Ok(feedbacks)
  }

  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    Ok(MessageFeedback {
      id: Some(row.get(0)?),
      // automation_name: row.get(1)?,
      user_id: row.get(1)?,
      message_id: row.get(2)?,
      feedback: row.get(3)?,
      timestamp: row.get(4)?,
    })
  }

  pub fn find_all() -> Vec<Self> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, user_id, message_id, feedback, timestamp FROM message_feedbacks ORDER BY date DESC")
      .expect("could not prepare query get automation feedbacks");
    let rows = stmt
      .query_map([], |row| MessageFeedback::build_struct_from_row(row))
      .expect("Could not execute query");
    rows.filter_map(Result::ok).collect()
  }

  pub fn create(&mut self) -> Result<(), Error> {
    if self.id.is_some() {
      return Err(Error::KSError(
        "Cannot create MessageFeedbacks; MessageFeedbacks already exists.".into(),
      ));
    }
    let connection = get_db_conn();

    connection
      .execute(
        "INSERT INTO message_feedbacks (user_id, message_id, feedback) VALUES (?1, ?2, ?3)",
        (&self.user_id, &self.message_id, &self.feedback),
      )
      .expect("Could not insert automation feedback");

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update MessageFeedbacks; MessageFeedbacks does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
      .execute(
        "UPDATE message_feedbacks SET feedback = ?1 WHERE id = ?2",
        (&self.feedback, &self.id),
      )
      .expect("Could not update automation feedback");
    Ok(())
  }

  pub fn upsert(user_id: u64, message_id: u64, feedback: i32) -> Result<(), Error> {
    let connection = get_db_conn();
    connection
      .execute(
        "INSERT INTO message_feedbacks (user_id, message_id, feedback) VALUES (?1, ?2, ?3) ON CONFLICT (user_id, message_id) DO UPDATE SET feedback = ?3",
        (&user_id, &message_id, &feedback),
      )
      .expect("Could not upsert automation feedback");
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete MessageFeedbacks; MessageFeedbacks does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    connection
      .execute("DELETE FROM message_feedbacks WHERE id = ?1", [self.id])
      .expect("Could not delete automation feedback");
    Ok(())
  }
}
