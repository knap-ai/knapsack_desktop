use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct User {
  pub id: Option<u64>,
  pub email: String,
  pub uuid: Option<String>,
}

impl User {
  pub fn find_by_email(email: String) -> Result<User> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT id, email, uuid FROM users WHERE email = ?1")?;
    let user = stmt.query_row(params![email], |row| {
      Ok(User {
        id: row.get(0)?,
        email: row.get(1)?,
        uuid: row.get(2)?,
      })
    })?;

    Ok(user)
  }

  pub fn create(&self) -> Result<(), Error> {
    if self.id.is_some() {
      return Err(Error::KSError(
        "Cannot create User; User already exists.".into(),
      ));
    }
    let connection = get_db_conn();

    connection.execute(
      "INSERT INTO users (email, uuid) VALUES (?1, ?2)",
      params![self.email, self.uuid],
    )?;

    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update User; User does not exist.".into(),
      ));
    }
    let connection = get_db_conn();

    connection.execute(
      "UPDATE users SET uuid = ?1 WHERE id = ?2",
      params![self.uuid, self.id],
    )?;

    Ok(())
  }
}
