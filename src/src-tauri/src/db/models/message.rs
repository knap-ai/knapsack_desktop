use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;

use super::message_feedback::MessageFeedback;
use crate::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Message {
  pub id: Option<u64>,
  pub timestamp: i64,
  pub thread_id: u64,
  pub user_id: Option<u64>,
  pub content: String,
  pub content_facade: Option<String>,
  pub feedbacks: Option<Vec<MessageFeedback>>,
  pub document_ids: Option<Vec<u64>>,
}
impl Message {
  pub fn find_by_id(id: u64) -> Result<Option<Message>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, timestamp, thread_id, user_id, content, content_facade FROM messages WHERE id = ?1",
    )?;
    let message = stmt.query_row([id], |row| Message::build_struct_from_row(row));

    match message {
      Ok(message) => Ok(Some(message)),
      Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
      Err(err) => Err(err.into()),
    }
  }

  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    let document_ids: Option<Vec<u64>> = row
      .get::<_, Option<String>>(6)?
      .map(|s| s.split(',').filter_map(|id| id.parse().ok()).collect());

    let mut message = Message {
      id: Some(row.get(0)?),
      timestamp: row.get(1)?,
      thread_id: row.get(2)?,
      user_id: row.get(3)?,
      content: row.get(4)?,
      content_facade: row.get(5)?,
      feedbacks: None,
      document_ids,
    };

    Ok(message)
  }

  pub fn find_all() -> Result<Vec<Message>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, timestamp, thread_id, user_id, content, content_facade, document_ids FROM messages ORDER BY timestamp DESC",
    )?;
    let message_iter = stmt.query_map([], |row| Message::build_struct_from_row(row))?;

    let mut messages = Vec::new();
    for message in message_iter {
      messages.push(message?);
    }
    Ok(messages)
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "INSERT INTO messages (timestamp, thread_id, user_id, content, content_facade, document_ids) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    )?;

    let document_ids_str = self.document_ids.as_ref().map(|ids| {
      ids
        .iter()
        .map(|id| id.to_string())
        .collect::<Vec<String>>()
        .join(",")
    });

    stmt.execute(params![
      self.timestamp,
      self.thread_id,
      self.user_id,
      self.content,
      self.content_facade,
      document_ids_str,
    ])?;

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn create_once(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "INSERT INTO messages (id, timestamp, thread_id, user_id, content, content_facade, document_ids) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
    )?;

    let document_ids_str = self.document_ids.as_ref().map(|ids| {
      ids
        .iter()
        .map(|id| id.to_string())
        .collect::<Vec<String>>()
        .join(",")
    });

    let result = stmt.execute(params![
      self.id,
      self.timestamp,
      self.thread_id,
      self.user_id,
      self.content,
      self.content_facade,
      document_ids_str,
    ]);

    if let Ok(_) = result {
      self.id = Some(connection.last_insert_rowid() as u64);
    }

    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update Message; Message does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    let mut stmt = connection
        .prepare("UPDATE messages SET timestamp = ?2, thread_id = ?3, user_id = ?4, content = ?5, content_facade = ?6, document_ids = ?7 WHERE id = ?1")?;

    let document_ids_str = self.document_ids.as_ref().map(|ids| {
      ids
        .iter()
        .map(|id| id.to_string())
        .collect::<Vec<String>>()
        .join(",")
    });

    stmt.execute(params![
      self.id,
      self.timestamp,
      self.thread_id,
      self.user_id,
      self.content,
      self.content_facade,
      document_ids_str,
    ])?;
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete Message; Message does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    let mut stmt = connection.prepare("DELETE FROM messages WHERE id = ?1")?;
    stmt.execute([self.id])?;
    Ok(())
  }

  pub fn find_by_thread_id(thread_id: u64) -> Result<Vec<Message>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, timestamp, thread_id, user_id, content, content_facade, document_ids FROM messages WHERE thread_id = ?1 ORDER BY id ASC")?;
    let message_iter = stmt.query_map([thread_id], |row| Message::build_struct_from_row(row))?;

    let mut messages = Vec::new();
    for message in message_iter {
      messages.push(message?);
    }
    Ok(messages)
  }
}
