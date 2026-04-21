use rusqlite::{params, OptionalExtension, Result};
use serde_json;
use serde::{Deserialize, Serialize};

use crate::db::db::get_db_conn;

use crate::error::Error;
use crate::utils::log::knap_log_error;

#[derive(Debug, Clone, Serialize)]
pub struct CalendarEvent {
  pub id: Option<u64>,
  pub event_id: String,
  pub title: Option<String>,
  pub description: Option<String>,
  pub creator_email: Option<String>,
  pub attendees_json: Option<String>,
  pub location: Option<String>,
  pub start: Option<i64>,
  pub end: Option<i64>,
  pub google_meet_url: Option<String>,
  pub recurrence_json: Option<String>,
  pub recurrence_id: Option<String>,
  /// The Google account email whose calendar this event was synced from.
  pub calendar_account_email: String,
}

#[derive(Debug, Deserialize)]
struct Participant {
    email: String,
    name: String,
}

const SELECT_COLS: &str = "id, event_id, title, description, creator_email, \
  attendees_json, location, start, end, google_meet_url, recurrence_json, \
  recurrence_id, calendar_account_email";

// table calendar_events
impl CalendarEvent {
  pub fn find_by_id(id: u64) -> Result<Option<CalendarEvent>, Error> {
    let connection = get_db_conn();
    let query = format!(
      "SELECT {} FROM calendar_events WHERE id = ?1",
      SELECT_COLS
    );
    let mut stmt = connection.prepare(&query)?;
    let calendar_event = stmt
      .query_row(params![id], |row| {
        CalendarEvent::build_struct_from_row(row)
      })
      .optional()?;

    Ok(calendar_event)
  }

  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    Ok(CalendarEvent {
      id: Some(row.get(0)?),
      event_id: row.get(1)?,
      title: row.get(2)?,
      description: row.get(3)?,
      creator_email: row.get(4)?,
      attendees_json: row.get(5)?,
      location: row.get(6)?,
      start: row.get(7)?,
      end: row.get(8)?,
      google_meet_url: row.get(9)?,
      recurrence_json: row.get(10)?,
      recurrence_id: row.get(11)?,
      calendar_account_email: row.get::<_, Option<String>>(12)?.unwrap_or_default(),
    })
  }

  pub fn get_event_participants_str(event_id: u64) -> Result<String, Error> {
    let calendar_event = match CalendarEvent::find_by_id(event_id) {
      Ok(Some(calendar_event)) => calendar_event,
      Ok(None) => {
        log::error!("Couldn't find calendar event for event_id: {}", event_id);
        return Ok("".to_string());
      },
      Err(_) => {
        log::error!("Couldn't find calendar event because of db error.");
        return Ok("".to_string());
      }
    };
    let participants = calendar_event.attendees_json.unwrap();
    let participants_json: Vec<Participant> = serde_json::from_str(&participants).unwrap();
    let emails: Vec<String> = participants_json
      .iter()
      .map(|participant| participant.email.clone())
      .collect();

    Ok(format!("Participants: {}", emails.join(", ")))
  }

  pub fn find_by_ids(ids: Vec<String>) -> Result<Vec<CalendarEvent>> {
    let connection = get_db_conn();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
      "SELECT {} FROM calendar_events WHERE id IN ({})",
      SELECT_COLS, placeholders
    );
    let mut stmt = connection.prepare(&query)?;

    let id_refs: Vec<&str> = ids.iter().map(AsRef::as_ref).collect();
    let rows = stmt.query_map(rusqlite::params_from_iter(id_refs), |row| {
      CalendarEvent::build_struct_from_row(row)
    })?;

    let mut events = Vec::new();
    for event in rows {
      events.push(event?);
    }
    Ok(events)
  }

  pub fn find_all() -> Vec<CalendarEvent> {
    let connection = get_db_conn();
    let query = format!(
      "SELECT {} FROM calendar_events ORDER BY start",
      SELECT_COLS
    );
    let mut stmt = connection
      .prepare(&query)
      .expect("could not prepare query get calendar events");
    let rows = stmt
      .query_map([], |row| CalendarEvent::build_struct_from_row(row))
      .expect("Could not execute query");
    rows.filter_map(Result::ok).collect()
  }

  pub fn count() -> Result<u64> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT count(*) FROM calendar_events")?;
    let count = stmt.query_row(params![], |row| Ok(row.get::<_, u64>(0)?))?;

    Ok(count)
  }

  pub fn find_by_timestamp_range(start: u64, end: u64) -> Vec<CalendarEvent> {
    let connection = get_db_conn();
    let query = format!(
      "SELECT {} FROM calendar_events WHERE start >= ?1 AND start <= ?2 ORDER BY start",
      SELECT_COLS
    );
    let mut stmt = connection
      .prepare(&query)
      .expect("could not prepare query get calendar events");
    let rows = stmt
      .query_map([start, end], |row| {
        CalendarEvent::build_struct_from_row(row)
      })
      .expect("Could not execute query");
    rows.filter_map(Result::ok).collect()
  }

  pub fn find_by_run_params(run_params: Option<String>) -> Result<Option<CalendarEvent>, Error> {
    if let Some(run_params) = run_params {
      let params = match serde_json::from_str::<std::collections::HashMap<String, u64>>(&run_params) {
        Ok(p) => p,
        Err(e) => {
          log::debug!("Error getting calendar_event.id from run_params: {:?}", e.to_string());
          return Err(Error::KSError(e.to_string()));
        }
      };

      if let Some(calendar_event_id) = params.get("event_id") {
        return CalendarEvent::find_by_id(*calendar_event_id);
      }
    }
    Ok(None)
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    let result = connection
      .execute(
        "INSERT INTO calendar_events \
          (id, event_id, title, description, creator_email, attendees_json, location, \
           start, end, google_meet_url, recurrence_json, recurrence_id, calendar_account_email) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13) \
         ON CONFLICT(event_id, calendar_account_email) DO UPDATE SET \
           title = ?3, description = ?4, creator_email = ?5, attendees_json = ?6, \
           location = ?7, start = ?8, end = ?9, google_meet_url = ?10",
        (
          &self.id, &self.event_id, &self.title, &self.description, &self.creator_email,
          &self.attendees_json, &self.location, &self.start, &self.end, &self.google_meet_url,
          &self.recurrence_json, &self.recurrence_id, &self.calendar_account_email,
        ),
      )
      .map_err(|e| e.into());
    match result {
      Ok(_) => Ok(()),
      Err(e) => Err(e),
    }
  }

  pub fn update(&self) -> Result<(), Error> {
    let connection = get_db_conn();
    connection
      .execute(
        "UPDATE calendar_events SET event_id = ?2, title = ?3, description = ?4, \
         creator_email = ?5, attendees_json = ?6, location = ?7, start = ?8, end = ?9, \
         google_meet_url = ?10, recurrence_json = ?11, recurrence_id = ?12, \
         calendar_account_email = ?13 WHERE id = ?1",
        (
          &self.id, &self.event_id, &self.title, &self.description, &self.creator_email,
          &self.attendees_json, &self.location, &self.start, &self.end, &self.google_meet_url,
          &self.recurrence_json, &self.recurrence_id, &self.calendar_account_email,
        ),
      )
      .expect("Could not update calendar event");
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    let connection = get_db_conn();
    connection
      .execute("DELETE FROM calendar_events WHERE id = ?1", [&self.id])
      .expect("Could not delete calendar event");
    Ok(())
  }

  pub fn filter_calendar_events_by_timestamp(
    from_timestamp: i64,
    to_timestamp: i64,
  ) -> Result<Vec<CalendarEvent>, Error> {
    let connection = get_db_conn();
    let query = format!(
      "SELECT {} FROM calendar_events WHERE start >= ?1 and start <= ?2 ORDER BY start ASC",
      SELECT_COLS
    );
    let mut stmt = connection
      .prepare(&query)
      .map_err(|error| {
        log::error!("Failed to prepare calendar events query: {:?}", error);
        Error::KSError(format!(
          "Failed to prepare calendar events query: {:?}",
          error
        ))
      })?;

    let rows = stmt
      .query_map([&from_timestamp, &to_timestamp], |row| {
        CalendarEvent::build_struct_from_row(row)
      })?;
    let mut calendar_events = Vec::new();
    for calendar_event_result in rows {
      let calendar_event = match calendar_event_result {
        Ok(c) => c,
        Err(e) => {
          knap_log_error(
            "Failed to get calendar event row: {:?}".to_string(),
            Some(Error::KSError(e.to_string())),
            None,
          );
          continue;
        },
      };
      calendar_events.push(calendar_event);
    }
    Ok(calendar_events)
  }

  pub fn get_recent_calendar_events(limit: usize) -> Vec<CalendarEvent> {
    let _ = Self::cleanup_stale_events();
    let connection = get_db_conn();
    let now_epoch = std::time::SystemTime::now()
      .duration_since(std::time::UNIX_EPOCH)
      .unwrap()
      .as_secs() as i64;
    let query = format!(
      "SELECT {} FROM calendar_events WHERE start > ?1 ORDER BY start ASC LIMIT ?2",
      SELECT_COLS
    );
    let mut stmt = connection
      .prepare(&query)
      .expect("could not prepare query emails");
    let rows = stmt
      .query_map(rusqlite::params![now_epoch, limit], |row| {
        CalendarEvent::build_struct_from_row(row)
      })
      .expect("could not execute query");
    rows.filter_map(Result::ok).collect()
  }

  /// Delete events for a specific calendar account that were not returned in the
  /// latest sync. Events from other accounts are left untouched.
  pub fn delete_calendar_events_removed(
    event_ids: Vec<String>,
    calendar_account_email: &str,
  ) -> Result<(), Error> {
    let connection = get_db_conn();

    if event_ids.is_empty() {
      // No events synced — remove all events for this account.
      connection
        .execute(
          "DELETE FROM calendar_events WHERE calendar_account_email = ?1",
          params![calendar_account_email],
        )
        .map_err(|e| {
          log::error!("Failed to delete all events for account {}: {:?}", calendar_account_email, e);
          Error::KSError(format!("Failed to delete calendar events: {:?}", e))
        })?;
      return Ok(());
    }

    let id_list = event_ids
      .iter()
      .map(|id| format!("\"{}\"", id))
      .collect::<Vec<String>>()
      .join(",");
    let query = format!(
      "DELETE FROM calendar_events WHERE calendar_account_email = ?1 AND event_id NOT IN ({})",
      id_list
    );
    connection
      .execute(&query, params![calendar_account_email])
      .map_err(|e| {
        log::error!("Failed to batch delete removed calendar events: {:?}", e);
        Error::KSError(format!("Failed to delete removed calendar events: {:?}", e))
      })?;

    Ok(())
  }

  /// Delete calendar events whose end time is more than 24 hours in the past.
  pub fn cleanup_stale_events() -> Result<usize, Error> {
    let connection = get_db_conn();
    let cutoff = std::time::SystemTime::now()
      .duration_since(std::time::UNIX_EPOCH)
      .unwrap()
      .as_secs() as i64
      - 86400;
    let deleted = connection
      .execute(
        "DELETE FROM calendar_events WHERE end IS NOT NULL AND end < ?1",
        rusqlite::params![cutoff],
      )
      .map_err(|e| {
        log::error!("Failed to cleanup stale calendar events: {:?}", e);
        Error::KSError(format!("Failed to cleanup stale calendar events: {:?}", e))
      })?;
    if deleted > 0 {
      log::info!("Cleaned up {} stale calendar events (ended before {})", deleted, cutoff);
    }
    Ok(deleted)
  }

  pub fn get_calendar_event_by_recurrence_id(recurrence_id: String) -> Vec<CalendarEvent> {
    let connection = get_db_conn();
    let query = format!(
      "SELECT {} FROM calendar_events WHERE recurrence_id = ?1",
      SELECT_COLS
    );
    let mut stmt = connection
      .prepare(&query)
      .expect("could not prepare query emails");
    let rows = stmt
      .query_map([recurrence_id], |row| {
        CalendarEvent::build_struct_from_row(row)
      })
      .expect("could not execute query");
    rows.filter_map(Result::ok).collect()
  }
}
