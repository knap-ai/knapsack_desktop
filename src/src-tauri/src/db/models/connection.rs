use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Connection {
  pub id: Option<u64>,
  pub scope: String,
  pub provider: String,
}

impl Connection {
  pub fn find_by_scope(scope: String) -> Result<Connection> {
    let connection = get_db_conn();
    let mut stmt =
      connection.prepare("SELECT id, scope, provider FROM connections WHERE scope = ?1")?;
    let connection_instance = stmt.query_row(params![scope], |row| {
      Ok(Connection {
        id: row.get(0)?,
        scope: row.get(1)?,
        provider: row.get(2)?,
      })
    })?;

    Ok(connection_instance)
  }

  pub fn create(self) -> Result<(), Error> {
    if self.id.is_some() {
      return Err(Error::KSError(
        "Cannot create Connection; Connection already exists.".into(),
      ));
    }
    let connection = get_db_conn();
    connection.execute(
      "INSERT INTO connections (scope, provider) VALUES (?1, ?2)",
      (&self.scope, &self.provider),
    )?;
    Ok(())
  }

  pub fn find_connections_from_user_email(email: String) -> Result<Vec<Self>, Error> {
    let mut connections: Vec<Connection> = vec![];
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT
        connections.id,
        connections.scope,
        connections.provider,
        user_connections.connection_id,
        users.email
      FROM connections
      LEFT JOIN user_connections on connection_id = connections.id
      LEFT JOIN users on user_id = users.id
      WHERE users.email = ?1",
    )?;
    let rows = stmt.query_map(params![email], |row| {
      Ok((
        row.get::<_, u64>(0)?,
        row.get::<_, String>(1)?,
        row.get::<_, String>(2)?,
      ))
    })?;
    for row in rows {
      let (connection_id, scope, provider) = row.unwrap();
      connections.push(Connection {
        id: Some(connection_id),
        scope,
        provider,
      })
    }
    Ok(connections)
  }
}
