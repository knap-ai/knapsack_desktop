use chrono::Utc;
use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;
use crate::db::models::connection::Connection;
use crate::error::Error;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncedSince {
  pub emails_synced_since: Option<u64>,
  pub local_files_synced_since: Option<u64>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserConnection {
  pub id: Option<u64>,
  pub user_id: u64,
  pub connection_id: u64,
  pub token: String,
  pub refresh_token: Option<String>,
  pub connection: Option<Connection>,
  pub last_synced: Option<u64>,
}

impl UserConnection {
  pub fn upsert(self) -> Result<(), Error> {
    if self.id.is_some() {
      return Err(Error::KSError(
        "Cannot create UserConnection; UserConnection already exists.".into(),
      ));
    }
    let connection = get_db_conn();

    connection.execute(
      "INSERT INTO user_connections (user_id, connection_id, token, refresh_token) VALUES (?1, ?2, ?3, ?4) ON CONFLICT (user_id, connection_id) DO UPDATE SET token = ?3",
      (&self.user_id, &self.connection_id, &self.token, &self.refresh_token),
    )?;
    Ok(())
  }

  pub fn update(&mut self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update user_connection because it is not persisted".into(),
      ));
    }
    let connection = get_db_conn();

    connection.execute(
      "UPDATE user_connections SET token = ?2, refresh_token = ?3 WHERE id = ?1",
      (&self.id, &self.token, &self.refresh_token),
    )?;

    Ok(())
  }

  pub fn delete(self) -> Result<(), Error> {
    if self.id == None {
      return Err(Error::KSError(
        "Cannot delete user_connection because it is not persisted".into(),
      ));
    }
    let connection = get_db_conn();
    connection.execute("DELETE FROM user_connections where id = ?1", [&self.id])?;
    Ok(())
  }

  pub fn find_by_user_email_and_scope(
    user_email: String,
    scope: String,
  ) -> Result<UserConnection, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "
      SELECT
        user_connections.id,
        user_connections.user_id,
        user_connections.connection_id,
        user_connections.token,
        user_connections.refresh_token,
        user_connections.last_synced,
        scope,
        provider,
        email
      FROM user_connections
      LEFT JOIN connections on connection_id = connections.id
      LEFT JOIN users on user_id = users.id
      WHERE users.email = ?1 and scope = ?2",
    )?;
    let row = stmt.query_row(params![user_email, scope], |row| {
      Ok((
        row.get::<_, u64>(0)?,
        row.get::<_, u64>(1)?,
        row.get::<_, u64>(2)?,
        row.get::<_, String>(3)?,
        row.get::<_, Option<String>>(4)?,
        row.get::<_, Option<u64>>(5)?,
        row.get::<_, String>(6)?,
        row.get::<_, String>(7)?,
        row.get::<_, String>(8)?,
      ))
    })?;
    let (
      user_connections_id,
      user_id,
      connection_id,
      token,
      refresh_token,
      last_synced,
      scope,
      provider,
      _email,
    ) = row;
    let connection_instance = Connection {
      id: Some(connection_id),
      scope,
      provider,
    };
    let user_connection = UserConnection {
      id: Some(user_connections_id),
      user_id,
      connection_id,
      token,
      refresh_token,
      connection: Some(connection_instance),
      last_synced: last_synced,
    };
    Ok(user_connection)
  }

  pub fn update_last_sync_by_id(
    id: u64,
    last_synced_date: chrono::DateTime<Utc>,
  ) -> Result<(), Error> {
    let date = last_synced_date.timestamp() as u64;
    let connection = get_db_conn();
    connection.execute(
      "UPDATE user_connections SET last_synced = ?1 WHERE id = ?2",
      (&date, &id),
    )?;
    Ok(())
  }

  pub fn find_by_user_email(user_email: String) -> Result<Vec<UserConnection>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "
      SELECT
        user_connections.id,
        user_connections.user_id,
        user_connections.connection_id,
        user_connections.token,
        user_connections.last_synced,
        scope,
        provider,
        user_connections.refresh_token
      FROM user_connections
      LEFT JOIN connections on connection_id = connections.id
      LEFT JOIN users on user_id = users.id
      WHERE users.email = ?1",
    )?;
    let user_connections = stmt.query_map(params![user_email], |row| {
      let user_connections_id = row.get::<_, u64>(0)?;
      let user_id = row.get::<_, u64>(1)?;
      let connection_id = row.get::<_, u64>(2)?;
      let token = row.get::<_, String>(3)?;
      let last_synced = row.get::<_, Option<u64>>(4)?;
      let scope = row.get::<_, String>(5)?;
      let provider = row.get::<_, String>(6)?;
      let refresh_token = row.get::<_, Option<String>>(7)?;

      let connection_instance = Connection {
        id: Some(connection_id),
        scope,
        provider,
      };

      Ok(UserConnection {
        id: Some(user_connections_id),
        user_id,
        connection_id,
        token,
        refresh_token,
        connection: Some(connection_instance),
        last_synced: last_synced,
      })
    })?;
    let result = user_connections.into_iter().collect::<Result<_, _>>()?;
    Ok(result)
  }

  pub fn get_synced_since() -> Result<SyncedSince, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT
        (SELECT MIN(emails.date) FROM emails) as emails_synced_since,
        (SELECT MIN(local_files.date_created) FROM local_files) as local_files_synced_since",
    )?;

    let row = stmt.query_row([], |row| {
      Ok(SyncedSince {
        emails_synced_since: row.get(0)?,
        local_files_synced_since: row.get(1)?,
      })
    })?;

    Ok(row)
  }

  pub fn find_by_id(id: u64) -> Result<UserConnection, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "
      SELECT
        user_connections.id,
        user_connections.user_id,
        user_connections.connection_id,
        user_connections.token,
        user_connections.refresh_token,
        user_connections.last_synced,
        scope,
        provider,
        email
      FROM user_connections
      LEFT JOIN connections on connection_id = connections.id
      LEFT JOIN users on user_id = users.id
      WHERE user_connections.id = ?1",
    )?;
    let row = stmt.query_row(params![id], |row| {
      Ok((
        row.get::<_, u64>(0)?,
        row.get::<_, u64>(1)?,
        row.get::<_, u64>(2)?,
        row.get::<_, String>(3)?,
        row.get::<_, Option<String>>(4)?,
        row.get::<_, Option<u64>>(5)?,
        row.get::<_, String>(6)?,
        row.get::<_, String>(7)?,
        row.get::<_, String>(8)?,
      ))
    })?;
    let (
      user_connections_id,
      user_id,
      connection_id,
      token,
      refresh_token,
      last_synced,
      scope,
      provider,
      _email,
    ) = row;
    let connection_instance = Connection {
      id: Some(connection_id),
      scope,
      provider,
    };
    let user_connection = UserConnection {
      id: Some(user_connections_id),
      user_id,
      connection_id,
      token,
      refresh_token,
      connection: Some(connection_instance),
      last_synced: last_synced,
    };
    Ok(user_connection)
  }
}
