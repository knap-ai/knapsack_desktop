use rusqlite::{params, params_from_iter, Result};
use serde::{Deserialize, Serialize};

use crate::error::Error;

use crate::db::db::get_db_conn;
use crate::utils::log::knap_log_error;
use crate::db::models::automation::Automation;
use crate::db::models::automation_run::AutomationRun;
use crate::db::models::calendar_event::CalendarEvent;
use crate::db::models::thread::Thread;
use crate::db::models::thread::ThreadWithMessages;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FeedItem {
  pub id: Option<u64>,
  pub title: Option<String>,
  pub timestamp: Option<i64>,
  pub deleted: Option<bool>,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FeedItemComplete {
  pub feed_item: FeedItem,
  pub threads: Option<Vec<ThreadWithMessages>>,
  pub run: Option<AutomationRun>,
  pub automation: Option<Automation>,
  pub calendar_event: Option<CalendarEvent>,
}

impl Default for FeedItemComplete {
  fn default() -> Self {
    FeedItemComplete {
      feed_item: FeedItem::default(),
      threads: None,
      run: None,
      automation: None,
      calendar_event: None,
    }
  }
}

impl Default for FeedItem {
  fn default() -> Self {
    FeedItem {
      id: None,
      title: None,
      timestamp: None,
      deleted: None,
    }
  }
}

impl FeedItem {
  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    Ok(FeedItem {
      id: Some(row.get(0)?),
      title: Some(row.get(1)?),
      timestamp: Some(row.get(2)?),
      deleted: row
      .get::<_, Option<i64>>(3)?
      .map(|v| v != 0),
    })
  }

  pub fn find_by_id(id: u64) -> Result<Option<FeedItem>, Error> {
    let connection = get_db_conn();
    let mut stmt =
      connection.prepare("SELECT f.id, f.title, f.timestamp, f.deleted FROM feed_items AS f WHERE (deleted is NULL OR deleted = 0) AND id = ?1")?;
    let feed_item = stmt.query_row([id], |row| FeedItem::build_struct_from_row(row));

    match feed_item {
      Ok(feed_item) => Ok(Some(feed_item)),
      Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
      Err(err) => Err(err.into()),
    }
  }

  pub fn find_all_complete() -> Result<Vec<FeedItemComplete>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT f.id, f.title, f.timestamp, f.deleted FROM feed_items AS f WHERE (f.deleted IS NULL OR f.deleted = 0)
         ORDER BY f.timestamp DESC",
    ).map_err(|e| {
      log::error!("Failed to prepare feed items query: {:?}", e);
      let error_msg = format!("Failed to prepare feed items query: {:?}", e);
      Error::KSError(error_msg)
    })?;
    let feed_item_iter = stmt.query_map([], |row| FeedItem::build_struct_from_row(row))?;

    let mut feed_items_complete = Vec::new();
    for feed_item_result in feed_item_iter {
      let feed_item = match feed_item_result {
        Ok(item) => item,
        Err(e) => {
          log::error!("Error processing feed item: {:?}", e);
          knap_log_error("Couldn't retrieve feed item in find_all_complete".to_string(), Some(Error::from(e)), None);
          continue;
        }
      };
      let threads_with_messages = match Thread::find_by_feed_item_id(feed_item.id.unwrap()) {
        Ok(threads) => threads,
        Err(e) => {
          log::error!(
            "Error fetching threads for feed item {}: {:?}",
            feed_item.id.unwrap(),
            e
          );
          let error_msg = format!(
            "Error fetching threads for feed item {}",
            feed_item.id.unwrap()
          );
          knap_log_error(error_msg, Some(Error::from(e)), None);
          None
        }
      };
      let automation_run = match AutomationRun::find_by_feed_item_id(feed_item.id.unwrap()) {
        Ok(run) => run,
        Err(e) => {
          log::error!(
            "Error fetching automation run for feed item {}: {:?}",
            feed_item.id.unwrap(),
            e
          );
          let error_msg = format!(
            "Error fetching automation run for feed item {}",
            feed_item.id.unwrap()
          );
          knap_log_error(error_msg, Some(Error::from(e)), None);
          None
        }
      };
      let automation = match &automation_run {
        Some(run) => Some(Automation::find_by_uuid(run.automation_uuid.clone())?),
        None => None,
      };
      let calendar_event = match &automation_run {
        Some(ref r) => CalendarEvent::find_by_run_params(r.run_params.clone())?,
        None => None,
      };
      let feed_item_complete = FeedItemComplete {
        feed_item,
        threads: threads_with_messages,
        run: automation_run,
        automation,
        calendar_event,
      };
      feed_items_complete.push(feed_item_complete);
    }
    Ok(feed_items_complete)
  }

  pub fn find_by_id_complete(id: u64) -> Result<FeedItemComplete, Error> {
    let connection = get_db_conn();
    let mut stmt =
      connection.prepare("SELECT f.id, f.title, f.timestamp, f.deleted FROM feed_items AS f WHERE (deleted is NULL OR deleted = 0) AND id = ?1")?;
    let feed_item_result = stmt.query_row([id], |row| FeedItem::build_struct_from_row(row));

    let feed_item = feed_item_result?;
    let threads_with_messages = Thread::find_by_feed_item_id(feed_item.id.unwrap())?;
    let automation_run = AutomationRun::find_by_feed_item_id(feed_item.id.unwrap())?;
    let automation = match &automation_run {
      Some(run) => Some(Automation::find_by_uuid(run.automation_uuid.clone())?),
      None => None,
    };
    let calendar_event = match &automation_run {
      Some(ref r) => CalendarEvent::find_by_run_params(r.run_params.clone())?,
      None => None,
    };
    let feed_item_complete = FeedItemComplete {
      feed_item,
      threads: threads_with_messages,
      run: automation_run,
      automation,
      calendar_event,
    };
    Ok(feed_item_complete)
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();

    if self.title.is_none() {
      return Err(Error::KSError(
        "Cannot create a FeedItem; Title is missing.".into(),
      ));
    }

    if self.id.is_some() {
      if let Some(_) = Self::find_by_id(self.id.unwrap())? {
        println!("FeedItem ID {} already exists.", self.id.unwrap());
        return Ok(());
      }
    }

    //Verify UNIQUE KEY constraint
    if let Some(title) = &self.title {
      let mut check_stmt = connection
        .prepare("SELECT id FROM feed_items WHERE title = ?1 AND timestamp = ?2")
        .map_err(|e| Error::KSError(format!("Failed to prepare duplicate check statement: {}", e)))?;

      let timestamp = self.timestamp.unwrap_or_else(|| {
        std::time::SystemTime::now()
          .duration_since(std::time::UNIX_EPOCH)
          .unwrap_or_default()
          .as_secs() as i64
      });

      let existing_id = check_stmt.query_row(params![title, timestamp], |row| row.get::<_, u64>(0));

      if let Ok(id) = existing_id {
        let mut stmt =
      connection.prepare("SELECT f.id, f.title, f.timestamp, f.deleted FROM feed_items AS f WHERE id = ?1")?;
        let feed_item = stmt.query_row([id], |row| FeedItem::build_struct_from_row(row));
        if let Ok(existing_feed_item) = feed_item {
          self.id = existing_feed_item.id;
          self.title = existing_feed_item.title;
          self.timestamp = existing_feed_item.timestamp;
          self.update();
          return Ok(());
        }
      }
    }

    if self.timestamp.is_none() {
      let mut stmt = connection
        .prepare("INSERT INTO feed_items (timestamp, title) VALUES (strftime('%s','now'), ?1)")
        .map_err(|e| Error::KSError(format!("Failed to prepare insert statement: {}", e)))?;

      stmt
        .execute(params![self.title])
        .map_err(|e| Error::KSError(format!("Failed to execute insert statement: {}", e)))?;
    } else {
      let mut stmt = connection
        .prepare("INSERT INTO feed_items (timestamp, title) VALUES (?1, ?2)")
        .map_err(|e| Error::KSError(format!("Failed to prepare insert statement: {}", e)))?;

      stmt
        .execute(params![&self.timestamp, &self.title])
        .map_err(|e| Error::KSError(format!("Failed to execute insert statement: {}", e)))?;
    }

    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete FeedItem; FeedItem does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    let mut stmt = connection.prepare("UPDATE feed_items set deleted = 1 WHERE id = ?1")?;
    stmt.execute([self.id])?;
    Ok(())
  }

  pub fn delete_multiple(ids: &[u64]) -> Result<(), Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("UPDATE feed_items set deleted = \"true\" WHERE id IN (?)")?;
    match stmt.execute(params_from_iter(ids.iter().cloned())) {
      Ok(_) => Ok(()),
      Err(e) => {
          return Err(Error::KSError(
           format!("Error deleting feed items: {:?}", e)
          ));
      }
    }
  }

  pub fn update(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot update Feed Item; Feed Item does not exist.".into(),
      ));
    }
    let connection = get_db_conn();

    let mut stmt = connection.prepare("UPDATE feed_items SET title = ?2, deleted = ?3 WHERE id = ?1")?;

    let deleted = self.deleted.unwrap_or(false);
    let deleted_int = if deleted { 1 } else { 0 };

    stmt.execute(params![self.id, self.title, deleted_int])?;

    Ok(())
  }
}
