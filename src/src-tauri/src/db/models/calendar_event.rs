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
}

#[derive(Debug, Deserialize)]
struct Participant {
    email: String,
    name: String,
}

// table calendar_events
impl CalendarEvent {
  pub fn find_by_id(id: u64) -> Result<Option<CalendarEvent>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id FROM calendar_events WHERE id = ?1")?;
    let calendar_event = stmt
      .query_row(params![id], |row| {
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
        })
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
    })
  }

  pub fn get_event_participants_str(event_id: u64) -> Result<(String), Error> {
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
      "SELECT id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id FROM calendar_events WHERE id IN ({})",
      placeholders
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
    let mut stmt = connection
      .prepare("SELECT id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id FROM calendar_events ORDER BY start")
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
    let mut stmt = connection
      .prepare("SELECT id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id FROM calendar_events WHERE start >= ?1 AND end <= ?2 ORDER BY start")
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
        "INSERT INTO calendar_events (id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12) ON CONFLICT(event_id) DO UPDATE SET title = ?3, description = ?4, creator_email = ?5, attendees_json = ?6, location = ?7, start = ?8, end = ?9, google_meet_url = ?10",
        (&self.id, &self.event_id, &self.title, &self.description, &self.creator_email, &self.attendees_json, &self.location, &self.start, &self.end, &self.google_meet_url, &self.recurrence_json, &self.recurrence_id),
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
        "UPDATE calendar_events SET event_id = ?2, title = ?3, description = ?4, creator_email = ?5, attendees_json = ?6, location = ?7, start = ?8, end = ?9, google_meet_url = ?10, recurrence_json =11?, recurrence_id =12? WHERE id = ?1",
        (&self.id, &self.event_id, &self.title, &self.description, &self.creator_email, &self.attendees_json, &self.location, &self.start, &self.end, &self.google_meet_url, &self.recurrence_json, &self.recurrence_id),
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
    let mut stmt = connection
      .prepare("SELECT id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id FROM calendar_events WHERE start >= ?1 and start <= ?2  ORDER BY start ASC")
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
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id FROM calendar_events WHERE start > strftime('%s', 'now') ORDER BY start ASC LIMIT ?1")
      .expect("could not prepare query emails");
    let rows = stmt
      .query_map([limit], |row| {
        Ok((
          row.get::<_, u64>(0),
          row.get::<_, String>(1),
          row.get::<_, Option<String>>(2),
          row.get::<_, Option<String>>(3),
          row.get::<_, Option<String>>(4),
          row.get::<_, Option<String>>(5),
          row.get::<_, Option<String>>(6),
          row.get::<_, Option<i64>>(7),
          row.get::<_, Option<i64>>(8),
          row.get::<_, Option<String>>(9),
          row.get::<_, Option<String>>(10),
          row.get::<_, Option<String>>(11),
        ))
      })
      .expect("could not execute query");
    let mut calendar_events = Vec::new();
    for row in rows {
      let (
        id,
        event_id,
        title,
        description,
        creator_email,
        attendees_json,
        location,
        start,
        end,
        google_meet_url,
        recurrence_json,
        recurrence_id,
      ) = row.unwrap();
      calendar_events.push(CalendarEvent {
        id: Some(id.unwrap()),
        event_id: event_id.unwrap(),
        title: title.unwrap(),
        description: description.unwrap(),
        creator_email: creator_email.unwrap(),
        attendees_json: attendees_json.unwrap(),
        location: location.unwrap(),
        start: start.unwrap(),
        end: end.unwrap(),
        google_meet_url: google_meet_url.unwrap(),
        recurrence_json: recurrence_json.unwrap(),
        recurrence_id: recurrence_id.unwrap(),
      });
    }
    return calendar_events;
  }

  pub fn delete_calendar_events_removed(calendar_events: Vec<String>) -> Result<(), Error> {
    let connection = get_db_conn();

    let id_list = calendar_events
      .iter()
      .map(|id| format!("\"{}\"", id))
      .collect::<Vec<String>>()
      .join(",");
    let query = format!(
      "SELECT id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id
         FROM calendar_events
         WHERE event_id NOT IN ({})",
      id_list
    );
    let mut stmt = connection
      .prepare(&query)
      .expect("could not prepare query for filtered calendar events");

    let rows = stmt
      .query_map([], |row| {
        Ok((
          row.get::<_, u64>(0),
          row.get::<_, String>(1),
          row.get::<_, Option<String>>(2),
          row.get::<_, Option<String>>(3),
          row.get::<_, Option<String>>(4),
          row.get::<_, Option<String>>(5),
          row.get::<_, Option<String>>(6),
          row.get::<_, Option<i64>>(7),
          row.get::<_, Option<i64>>(8),
          row.get::<_, Option<String>>(9),
          row.get::<_, Option<String>>(10),
          row.get::<_, Option<String>>(11),
        ))
      })
      .expect("could not execute query");

    for row in rows {
      let (
        id,
        event_id,
        title,
        description,
        creator_email,
        attendees_json,
        location,
        start,
        end,
        google_meet_url,
        recurrence_json,
        recurrence_id,
      ) = row.unwrap();
      let event = CalendarEvent {
        id: Some(id.unwrap()),
        event_id: event_id.unwrap(),
        title: title.unwrap(),
        description: description.unwrap(),
        creator_email: creator_email.unwrap(),
        attendees_json: attendees_json.unwrap(),
        location: location.unwrap(),
        start: start.unwrap(),
        end: end.unwrap(),
        google_meet_url: google_meet_url.unwrap(),
        recurrence_json: recurrence_json.unwrap(),
        recurrence_id: recurrence_id.unwrap(),
      };
      event.delete()?;
    }
    Ok(())
  }

  pub fn get_calendar_event_by_recurrence_id(recurrence_id: String) -> Vec<CalendarEvent> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, event_id, title, description, creator_email, attendees_json, location, start, end, google_meet_url, recurrence_json, recurrence_id FROM calendar_events WHERE recurrence_id = ?1")
      .expect("could not prepare query emails");
    let rows = stmt
      .query_map([recurrence_id], |row| {
        Ok((
          row.get::<_, u64>(0),
          row.get::<_, String>(1),
          row.get::<_, Option<String>>(2),
          row.get::<_, Option<String>>(3),
          row.get::<_, Option<String>>(4),
          row.get::<_, Option<String>>(5),
          row.get::<_, Option<String>>(6),
          row.get::<_, Option<i64>>(7),
          row.get::<_, Option<i64>>(8),
          row.get::<_, Option<String>>(9),
          row.get::<_, Option<String>>(10),
          row.get::<_, Option<String>>(11),
        ))
      })
      .expect("could not execute query");

    let mut calendar_events = Vec::new();
    for row in rows {
      let (
        id,
        event_id,
        title,
        description,
        creator_email,
        attendees_json,
        location,
        start,
        end,
        google_meet_url,
        recurrence_json,
        recurrence_id,
      ) = row.unwrap();
      calendar_events.push(CalendarEvent {
        id: Some(id.unwrap()),
        event_id: event_id.unwrap(),
        title: title.unwrap(),
        description: description.unwrap(),
        creator_email: creator_email.unwrap(),
        attendees_json: attendees_json.unwrap(),
        location: location.unwrap(),
        start: start.unwrap(),
        end: end.unwrap(),
        google_meet_url: google_meet_url.unwrap(),
        recurrence_json: recurrence_json.unwrap(),
        recurrence_id: recurrence_id.unwrap(),
      });
    }
    return calendar_events;
  }
}
