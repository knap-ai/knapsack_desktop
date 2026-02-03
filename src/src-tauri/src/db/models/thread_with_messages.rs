use rusqlite::{params, Result};

use crate::error::Error;

use crate::db::db::get_db_conn;

#[derive(Debug, Clone)]
pub struct Thread {
  pub id: Option<u64>,
  pub timestamp: Option<u64>,
}

impl Thread {
  pub fn find_by_id(id: u64) -> Result<Option<Thread>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, timestamp FROM threads WHERE id = ?1")?;
    let thread = stmt.query_row([id], |row| {
      Ok(Thread {
        id: Some(row.get(0)?),
        timestamp: row.get(1)?,
      })
    });

    match thread {
      Ok(thread) => Ok(Some(thread)),
      Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
      Err(err) => Err(err.into()),
    }
  }

  pub fn find_all() -> Result<Vec<Thread>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, timestamp FROM threads ORDER BY timestamp DESC")?;
    let thread_iter = stmt.query_map([], |row| {
      Ok(Thread {
        id: Some(row.get(0)?),
        timestamp: row.get(1)?,
      })
    })?;

    let mut threads = Vec::new();
    for thread in thread_iter {
      threads.push(thread?);
    }
    Ok(threads)
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    if self.id.is_none() && self.timestamp.is_none() {
      let mut stmt = connection
        .prepare("INSERT INTO threads (timestamp) VALUES (CURRENT_TIMESTAMP)")?;
      stmt.execute([])?;
    } else if self.id.is_some() && self.timestamp.is_none() {
      let mut stmt = connection
        .prepare("INSERT INTO threads (id, timestamp) VALUES (?1, CURRENT_TIMESTAMP)")?;
      stmt.execute([self.id])?;
    } else {
      let mut stmt = connection
        .prepare("INSERT INTO threads (timestamp) VALUES (?1)")?;
      stmt.execute([self.timestamp])?;
    }

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError("Cannot update Thread; Thread does not exist.".into()));
    }
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("UPDATE threads SET timestamp = ?2 WHERE id = ?1")?;
    stmt.execute(params![self.id, self.timestamp])?;
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError("Cannot delete Thread; Thread does not exist.".into()));
    }
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("DELETE FROM threads WHERE id = ?1")?;
    stmt.execute([self.id])?;
    Ok(())
  }
}
