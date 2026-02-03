use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};
use std::str::FromStr;

use crate::error::Error;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ThreadType {
  Chat,
  MeetingNotes,
}

impl FromStr for ThreadType {
  type Err = Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s.to_uppercase().as_str() {
      "CHAT" => Ok(ThreadType::Chat),
      "MEETING NOTES" => Ok(ThreadType::MeetingNotes),
      _ => Err(Error::KSError("Invalid thread type".into())),
    }
  }
}

impl ToString for ThreadType {
  fn to_string(&self) -> String {
    match self {
      ThreadType::Chat => "CHAT".to_string(),
      ThreadType::MeetingNotes => "MEETING NOTES".to_string(),
    }
  }
}

use crate::db::{db::get_db_conn, models::message::Message};

// add FeedItem ID, title and subtile
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Thread {
  pub id: Option<u64>,
  pub timestamp: Option<i64>,
  pub hide_follow_up: Option<bool>,
  pub feed_item_id: Option<u64>,
  pub title: Option<String>,
  pub subtitle: Option<String>,
  pub thread_type: ThreadType,
  pub recorded: Option<bool>,
  pub saved_transcript: Option<String>,
  pub prompt_template: Option<String>,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ThreadWithMessages {
  pub thread: Thread,
  pub messages: Vec<Message>,
}

impl Default for ThreadWithMessages {
  fn default() -> Self {
    ThreadWithMessages {
      thread: Thread::default(),
      messages: Vec::new(),
    }
  }
}

impl Default for Thread {
  fn default() -> Self {
    Thread {
      id: None,
      timestamp: None,
      hide_follow_up: Some(false),
      feed_item_id: None,
      title: None,
      subtitle: None,
      thread_type: ThreadType::Chat,
      recorded: Some(false),
      saved_transcript: None,
      prompt_template: None
    }
  }
}

impl Thread {
  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    let thread_type_str: String = row.get(6)?;
    let thread_type = match ThreadType::from_str(&thread_type_str) {
      Ok(t) => t,
      Err(_) => ThreadType::Chat,
    };
    Ok(Thread {
      id: Some(row.get(0)?),
      timestamp: row.get(1)?,
      title: row.get(2)?,
      subtitle: row.get(3)?,
      hide_follow_up: Some(row.get(4)?),
      feed_item_id: Some(row.get(5)?),
      thread_type,
      recorded: row.get(7)?,
      saved_transcript: row.get(8)?,
      prompt_template: row.get(9)?,
    })
  }

  pub fn find_by_id(id: u64) -> Result<Option<Thread>, Error> {
    let connection = get_db_conn();
    let mut stmt =
      connection.prepare("SELECT t.id, t.timestamp, t.title, t.subtitle, t.hideFollowUp, t.feed_item_id, t.thread_type, t.recorded, t.saved_transcript, t.prompt_template FROM threads as t WHERE id = ?1")?;
    let thread = stmt.query_row([id], |row| Thread::build_struct_from_row(row));

    match thread {
      Ok(thread) => Ok(Some(thread)),
      Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
      Err(err) => Err(err.into()),
    }
  }

  pub fn find_all() -> Result<Vec<Thread>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT t.id, t.timestamp, t.title, t.subtitle, t.hideFollowUp, t.feed_item_id, t.thread_type, t.recorded, t.saved_transcript, t.prompt_template FROM threads as t ORDER BY timestamp DESC")?;
    let thread_iter = stmt.query_map([], |row| Thread::build_struct_from_row(row))?;

    let mut threads = Vec::new();
    for thread in thread_iter {
      threads.push(thread?);
    }
    Ok(threads)
  }

  pub fn find_all_with_messages() -> Result<Vec<ThreadWithMessages>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT t.id, t.timestamp, t.title, t.subtitle, t.hideFollowUp, t.feed_item_id, t.thread_type, t.recorded, t.saved_transcript, t.prompt_template FROM threads AS t
         ORDER BY t.timestamp DESC",
    )?;
    let thread_iter = stmt.query_map([], |row| Thread::build_struct_from_row(row))?;

    let mut threads_with_messages = Vec::new();
    for thread_result in thread_iter {
      let thread = thread_result?;
      let messages = Message::find_by_thread_id(thread.id.unwrap())?;
      let thread_with_messages = ThreadWithMessages { thread, messages };
      threads_with_messages.push(thread_with_messages);
    }
    Ok(threads_with_messages)
  }

  pub fn find_by_id_with_messages(id: u64) -> Result<ThreadWithMessages, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT t.id, t.timestamp, t.title, t.subtitle, t.hideFollowUp, t.feed_item_id, t.thread_type, t.recorded, t.saved_transcript, t.prompt_template FROM threads AS t
         WHERE id = ?1",
    )?;
    let thread = stmt.query_row([id], |row| Thread::build_struct_from_row(row))?;
    let messages = Message::find_by_thread_id(thread.id.unwrap())?;
    let thread_with_messages = ThreadWithMessages { thread, messages };
    Ok(thread_with_messages)
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();

    if self.hide_follow_up.is_none() {
      return Err(Error::KSError(
        "Cannot create a Thread; Hide Follow Up is missing.".into(),
      ));
    }

    if self.id.is_some() {
      if let Some(_) = Thread::find_by_id(self.id.unwrap())? {
        println!("Thread with ID {} already exists.", self.id.unwrap());
        return Ok(());
      }
    }

    if self.id.is_none() && self.timestamp.is_none() {
      let mut stmt = connection.prepare(
        "INSERT INTO threads (timestamp, hideFollowUp, feed_item_id, thread_type, title, subtitle, prompt_template) VALUES (strftime('%s','now'), ?1, ?2, ?3, ?4, ?5, ?6)",
      )?;
      stmt.execute((self.hide_follow_up, self.feed_item_id, self.thread_type.to_string().clone(), self.title.clone(), self.subtitle.clone(), self.prompt_template.clone()))?;
    } else if self.id.is_some() && self.timestamp.is_none() {
      let mut stmt = connection.prepare(
        "INSERT INTO threads (id, timestamp, hideFollowUp, feed_item_id, thread_type, title, subtitle, prompt_template) VALUES (?1, strftime('%s','now'), ?2, ?3, ?4, ?5, ?6, ?7)",
      )?;
      stmt.execute((&self.id, &self.hide_follow_up, self.feed_item_id, self.thread_type.to_string(), self.title.clone(), self.subtitle.clone(), self.prompt_template.clone()))?;
    } else {
      let mut stmt = connection.prepare(
        "INSERT INTO threads (timestamp, hideFollowUp, feed_item_id, thread_type, title, subtitle, prompt_template) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
      )?;
      stmt.execute((&self.timestamp, &self.hide_follow_up, self.feed_item_id, self.thread_type.to_string(), self.title.clone(), self.subtitle.clone(), self.prompt_template.clone()))?;
    }

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update Thread; Thread does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    let mut stmt =
      connection.prepare("UPDATE threads SET timestamp = ?2, hideFollowUp = ?3, thread_type = ?4, title = ?5, subtitle = ?6, recorded = ?7, saved_transcript = ?8, prompt_template = ?9 WHERE id = ?1")?;
    stmt.execute(params![self.id, self.timestamp, self.hide_follow_up, self.thread_type.to_string(), self.title, self.subtitle, self.recorded, self.saved_transcript, self.prompt_template])?;
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete Thread; Thread does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    let mut stmt = connection.prepare("DELETE FROM threads WHERE id = ?1")?;
    stmt.execute([self.id])?;
    Ok(())
  }

  pub fn find_by_feed_item_id(id: u64) -> Result<Option<Vec<ThreadWithMessages>>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
        "SELECT t.id, t.timestamp, t.title, t.subtitle, t.hideFollowUp, t.feed_item_id, t.thread_type, t.recorded, t.saved_transcript, t.prompt_template FROM threads AS t
         WHERE feed_item_id = ?1",
    )?;

    let thread_iter = stmt.query_map(params![id], |row| Thread::build_struct_from_row(row))?;

    let mut threads_with_messages = Vec::new();
    for thread_result in thread_iter {
      let thread = thread_result?;
      let messages = Message::find_by_thread_id(thread.id.unwrap())?;
      let thread_with_messages = ThreadWithMessages { thread, messages };
      threads_with_messages.push(thread_with_messages);
    }

    if threads_with_messages.is_empty() {
      Ok(None)
    } else {
      Ok(Some(threads_with_messages))
    }
  }
}
