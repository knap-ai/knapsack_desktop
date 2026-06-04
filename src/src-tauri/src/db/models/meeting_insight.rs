use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MeetingInsight {
  pub id: Option<u64>,
  pub thread_id: u64,
  pub elapsed_minutes: i64,
  pub insight: String,
  pub created_at: i64,
}

impl MeetingInsight {
  pub fn create(
    thread_id: u64,
    elapsed_minutes: i64,
    insight: &str,
  ) -> Result<MeetingInsight, Error> {
    let connection = get_db_conn();
    let now = SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .unwrap()
      .as_secs() as i64;

    connection.execute(
      "INSERT INTO meeting_insights (thread_id, elapsed_minutes, insight, created_at) \
       VALUES (?1, ?2, ?3, ?4)",
      params![thread_id as i64, elapsed_minutes, insight, now],
    )?;

    let id = connection.last_insert_rowid() as u64;
    Ok(MeetingInsight {
      id: Some(id),
      thread_id,
      elapsed_minutes,
      insight: insight.to_string(),
      created_at: now,
    })
  }

  pub fn find_by_thread_id(thread_id: u64) -> Result<Vec<MeetingInsight>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, thread_id, elapsed_minutes, insight, created_at \
       FROM meeting_insights \
       WHERE thread_id = ?1 \
       ORDER BY elapsed_minutes ASC",
    )?;

    let insights = stmt
      .query_map(params![thread_id as i64], |row| {
        Ok(MeetingInsight {
          id: Some(row.get::<_, i64>(0)? as u64),
          thread_id: row.get::<_, i64>(1)? as u64,
          elapsed_minutes: row.get(2)?,
          insight: row.get(3)?,
          created_at: row.get(4)?,
        })
      })?
      .filter_map(|r| r.ok())
      .collect();

    Ok(insights)
  }
}
