use chrono::DateTime;
use html2text::from_read;
use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use std::collections::HashMap;
use uuid::Uuid;

use crate::connections::data_source::KnowledgeSnippet;
use crate::db::{db::get_db_conn, models::document::Document};
use crate::error::Error;
use crate::memory::text_splitter::TextSplitter;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Email {
  pub id: Option<u64>,
  pub email_uid: String,
  pub thread_id: Option<String>,
  pub subject: String,
  pub date: u64,
  pub sender: String,
  pub recipient: String,
  pub cc: String,
  pub body: String,
  pub is_starred: Option<bool>,
  pub is_read: Option<bool>,
  pub is_archived: Option<bool>,
  pub is_deleted: Option<bool>,
}

impl Email {
  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    Ok(Email {
      id: Some(row.get(0)?),
      email_uid: row.get(1)?,
      subject: row.get(2)?,
      date: row.get(3)?,
      sender: row.get(4)?,
      body: row.get(5)?,
      recipient: row.get(6)?,
      cc: row.get(7)?,
      thread_id: Some(row.get(8)?),
      is_starred: row.get(9)?,
      is_read: row.get(10)?,
      is_archived: row.get(11)?,
      is_deleted: Some(row.get(12)?),
    })
  }
  pub fn delete(&self) -> Result<()> {
    let connection = get_db_conn();
    connection.execute("DELETE FROM emails WHERE id = ?1", params![self.email_uid])?;
    Ok(())
  }

  pub fn update(&self) -> Result<(), Error> {
    let connection = get_db_conn();
    connection.execute(
        "UPDATE emails SET 
            subject = ?1, 
            date = ?2, 
            sender = ?3, 
            body = ?4, 
            recipient = ?5, 
            cc = ?6, 
            thread_id = ?7, 
            is_starred = ?8, 
            is_read = ?9, 
            is_archived = ?10 ,
            is_deleted =?12
        WHERE email_uid = ?11",
        params![
            self.subject,
            self.date,
            self.sender,
            self.body,
            self.recipient,
            self.cc,
            self.thread_id,
            self.is_starred,
            self.is_read,
            self.is_archived,
            self.email_uid,
            self.is_deleted
        ],
    )?;
    Ok(())
}

  pub fn create(&mut self) -> Result<(), Error> {
    if self.id.is_some() {
      return Ok(());
    }
    let connection = get_db_conn();
    connection
      .execute(
        "INSERT INTO emails (email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12) ON CONFLICT(email_uid) DO UPDATE SET subject = ?2, date = ?3, sender = ?4, body = ?5, recipient = ?6, cc = ?7, thread_id = ?8, is_starred = ?9,  is_read = ?10, is_archived =?11, is_deleted =?12",
        params![self.email_uid, self.subject, self.date, self.sender, self.body, self.recipient, self.cc, self.thread_id, self.is_starred, self.is_read, self.is_archived, self.is_deleted],
      )?;
    self.id = Some(connection.last_insert_rowid() as u64);
    Ok(())
  }

  pub fn find_by_id(id: u64) -> Result<Option<Email>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted FROM emails WHERE id = ?1")
      .expect("could not prepare query emails");
    let email = stmt
      .query_row([id], |row| Email::build_struct_from_row(row))
      .optional()?;
    Ok(email)
  }

  pub fn find_by_uid(uid: &str) -> Result<Option<Email>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted FROM emails WHERE email_uid = ?1")
      .expect("could not prepare query emails");
    let email = stmt
      .query_row([uid], |row| Email::build_struct_from_row(row))
      .optional()?;
    Ok(email)
  }

  pub fn get_recent_emails_with(sender_or_recipient: &str, limit: usize) -> Vec<Email> {
    let connection = get_db_conn();
    let sender_or_recipient_query_string = format!("%{}%", sender_or_recipient).clone().to_string();
    let sender_or_recipient_query_str = sender_or_recipient_query_string.as_str();
    let limit_string = limit.clone().to_string();
    let limit_str = limit_string.as_str();
    let mut stmt = connection
      .prepare("SELECT id, email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted FROM emails WHERE sender LIKE ?1 OR recipient LIKE ?1 ORDER BY date DESC LIMIT ?2")
      .expect("could not prepare query emails");
    let rows = stmt
      .query_map([&sender_or_recipient_query_str, &limit_str], |row| {
        Email::build_struct_from_row(row)
      })
      .expect("could not execute query");

    rows.filter_map(Result::ok).collect()
  }

  pub fn get_most_recent_email_timestamp() -> Option<i64> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT MAX(date) FROM emails")
      .expect("could not prepare query for most recent email timestamp");
    let result = stmt.query_row([], |row| row.get(0));

    match result {
      Ok(timestamp) => Some(timestamp),
      Err(_) => None,
    }
  }

  pub fn get_email_message(email_uid: &str) -> Option<Email> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted FROM emails WHERE email_uid = ?1")
      .expect("could not prepare query emails");
    //TODO use build_struct_from_row
    let result = stmt.query_row(&[email_uid], |row| Email::build_struct_from_row(row));

    match result {
      Ok(email) => Some(email),
      Err(error) => {
        println!("Error while retrieving email {email_uid}: {:?}", error);
        None
      }
    }
  }

  pub fn get_recent_emails(limit: usize) -> Vec<Email> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted FROM emails ORDER BY date DESC LIMIT ?1")
      .expect("could not prepare query emails");
    //TODO use build_struct_from_row
    let rows = stmt
      .query_map([limit], |row| Email::build_struct_from_row(row))
      .expect("could not execute query");

    rows.filter_map(Result::ok).collect()
  }

  pub fn count() -> Result<u64> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT count(*) FROM emails")?;
    let count = stmt.query_row(params![], |row| Ok(row.get::<_, u64>(0)?))?;

    Ok(count)
  }

  pub fn get_all_email_uids() -> Vec<String> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT email_uid FROM emails")
      .expect("could not prepare query get all email email_uids");
    let rows = stmt
      .query_map([], |row| Ok(row.get::<_, String>(0).unwrap()))
      .expect("could not execute query");
    let mut email_uids = Vec::new();
    for row in rows {
      match row {
        Ok(email_uid) => email_uids.push(email_uid),
        Err(_) => (),
      }
    }
    email_uids
  }

  pub fn filter_emails_by_sender(
    limit: usize,
    sender: &str,
    min_timestamp: i64,
    max_timestamp: i64,
  ) -> Vec<Email> {
    let connection = get_db_conn();

    let where_query = "WHERE sender LIKE ?1 AND date >= ?2 AND date <= ?3".to_string();

    let query = format!("SELECT id, email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted FROM emails {} ORDER BY date DESC LIMIT ?4", where_query);
    let mut stmt = connection
      .prepare(&query)
      .expect("could not prepare query emails");
    //TODO use build_struct_from_row

    let rows = stmt
      .query_map(
        (&format!("%{sender}%"), min_timestamp, max_timestamp, limit),
        |row| Email::build_struct_from_row(row),
      )
      .expect("could not execute query");

    rows.filter_map(Result::ok).collect()
  }

  pub fn filter_emails(
    limit: usize,
    maybe_email_address: Option<Vec<String>>,
    maybe_minimum_timestamp: Option<i64>,
    maybe_maximum_timestamp: Option<i64>,
  ) -> Vec<Email> {
    let connection = get_db_conn();
    let mut where_queries = Vec::new();
    let mut params = Vec::new();
    let mut or_queries = Vec::new();
    if let Some(email_addresses) = maybe_email_address {
      for email_address in email_addresses {
        or_queries.push(format!("sender LIKE ?{}", params.len() + 1));
        or_queries.push(format!("recipient LIKE ?{}", params.len() + 1));
        or_queries.push(format!("cc LIKE ?{}", params.len() + 1));
        params.push(format!("%{}%", email_address));
      }
    }
    if or_queries.len() > 0 {
      where_queries.push(format!("({})", or_queries.join(" or ")));
    }

    if let Some(minimum_timestamp) = maybe_minimum_timestamp {
      where_queries.push(format!("date >= ?{}", params.len() + 1));
      params.push(minimum_timestamp.to_string());
    }

    if let Some(maximum_timestamp) = maybe_maximum_timestamp {
      where_queries.push(format!("date <= ?{}", params.len() + 1));
      params.push(maximum_timestamp.to_string());
    }

    let mut where_query = "".to_string();
    if where_queries.len() > 0 {
      where_query = format!("WHERE {}", where_queries.join(" and "));
    }

    let query = format!("SELECT id, email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted FROM emails {} ORDER BY date DESC LIMIT ?{}", where_query, params.len() + 1);
    params.push(limit.to_string());
    let mut stmt = connection
      .prepare(&query)
      .expect("could not prepare query emails");
    //TODO use build_struct_from_row

    let rows = stmt
      .query_map(rusqlite::params_from_iter(params), |row| {
        Email::build_struct_from_row(row)
      })
      .expect("could not execute query");

    rows.filter_map(Result::ok).collect()
  }

  pub fn get_documents(&self) -> Vec<HashMap<String, serde_json::Value>> {
    let body_in_bytes = self.body.as_bytes();
    let mut parsed_body = String::from("");
    if self.body != "" {
      let html_stripped_body = from_read(&body_in_bytes[..], body_in_bytes.len());
      parsed_body = html_stripped_body
        .replace("\n", " ")
        .replace("\r", " ")
        .replace("\t", " ")
        .trim()
        .split(' ')
        .filter(|s| !s.is_empty() && s.len() < 70)
        .collect::<Vec<_>>()
        .join(" ");
    }
    let mut documents = Vec::new();
    let splitter = TextSplitter::default();
    let chunks = splitter.split_text(&parsed_body);

    let document = Document::find_by_foreign_table_and_id("emails", self.id.unwrap()).unwrap();
    let mut document_id = document.map(|document| document.id).flatten();

    if document_id.is_none() {
      let document = create_email_document(self.id.unwrap(), String::from(""));
      document_id = document.id;
    }

    for (chunk_idx, chunk) in chunks.into_iter().enumerate() {
      let mut doc_payload = HashMap::from([
        (
          "id".to_string(),
          serde_json::Value::String(
            Uuid::new_v5(
              &Uuid::NAMESPACE_DNS,
              format!("{}/{}", self.email_uid.clone(), chunk_idx).as_bytes(),
            )
            .to_string(),
          ),
        ),
        (
          "chunk_id".to_string(),
          serde_json::Value::Number(serde_json::Number::from(chunk_idx)),
        ),
        (
          "email_uid".to_string(),
          serde_json::Value::String(self.email_uid.to_string()),
        ),
        (
          "subject".to_string(),
          serde_json::Value::String(self.subject.clone()),
        ),
        (
          "date".to_string(),
          serde_json::Value::Number(serde_json::Number::from(self.date)),
        ),
        (
          "sender".to_string(),
          serde_json::Value::String(self.sender.clone()),
        ),
        (
          "recipient".to_string(),
          serde_json::Value::String(self.recipient.clone()),
        ),
        ("cc".to_string(), serde_json::Value::String(self.cc.clone())),
        ("body".to_string(), serde_json::Value::String(chunk)),
        (
          "type".to_string(),
          serde_json::Value::String("gmail".to_string()),
        ),
        (
          "document_id".to_string(),
          serde_json::Value::Number(serde_json::Number::from(document_id.unwrap())),
        ),
      ]);

      documents.push(doc_payload);
    }
    documents
  }

  pub fn get_attrs() -> HashMap<&'static str, Vec<String>> {
    HashMap::from([
      (
        "embed",
        vec![
          "subject".to_string(),
          "date".to_string(),
          "sender".to_string(),
          "recipient".to_string(),
          "cc".to_string(),
          "body".to_string(),
        ],
      ),
      (
        "metadata",
        vec![
          "date".to_string(),
          "type".to_string(),
          "email_uid".to_string(),
          "document_id".to_string(),
          "chunk_id".to_string(),
        ],
      ),
    ])
  }

  pub fn get_last_email_by_thread_id(thread_id: &str) -> Result<Option<Email>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
        .prepare("SELECT id, email_uid, subject, date, sender, body, recipient, cc, thread_id, is_starred, is_read, is_archived, is_deleted FROM emails WHERE thread_id = ?1 ORDER BY date DESC LIMIT 1")
        .expect("could not prepare query emails by thread_id");

    let email_result = stmt.query_row([thread_id], |row| Email::build_struct_from_row(row));

    match email_result {
      Ok(email) => Ok(Some(email)),
      Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
      Err(e) => Err(Error::from(e)),
    }
  }

  pub async fn mark_deleted_emails(fetched_uuids: &[String], days: i64) -> Result<(), Error> {
    let connection = get_db_conn();
    let days_ago = chrono::Utc::now() - chrono::Duration::days(days);
    let days_ago_timestamp = days_ago.timestamp() as u64;
    let current_timestamp = chrono::Utc::now().timestamp() as u64;
  
    let placeholders: String = fetched_uuids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!(
        "UPDATE emails SET is_deleted = TRUE 
        WHERE email_uid NOT IN ({}) 
        AND date >= ? 
        AND date <= ? 
        AND is_deleted = FALSE",
        placeholders
    );
  
    let mut stmt = connection.prepare(&query)?;
    
    let mut params: Vec<&dyn rusqlite::ToSql> = fetched_uuids.iter().map(|s| s as &dyn rusqlite::ToSql).collect();
    params.push(&days_ago_timestamp);
    params.push(&current_timestamp);
  
    stmt.execute(params.as_slice())?;
  
    Ok(())
  }
}

fn create_email_document(id: u64, hash: String) -> Document {
  let mut document = Document {
    id: None,
    foreign_table: "emails".to_string(),
    foreign_table_id: id,
    hash,
    timestamp: None,
  };
  match document.create() {
    Ok(d) => d,
    Err(_) => log::error!("Couldn't create doc for email: {:?}", id),
  };
  document
}


impl KnowledgeSnippet for Email {
  fn get_title(&self) -> String {
    self.subject.clone()
  }

  fn get_document_type(&self) -> String {
    "email".to_string()
  }

  fn to_prompt_string(&self, chunk_ids: Option<Vec<u64>>, _payloads: Option<Vec<Value>>) -> String {
    let chunk_ids = chunk_ids.unwrap_or(vec![]);
    let datestr = DateTime::from_timestamp(self.date as i64, 0)
      .expect("Invalid date")
      .format("%Y-%m-%d %H:%M:%S")
      .to_string();

    let parsed_body = match self.body.clone().as_str() {
      "" => String::from(""),
      _ => {
        let body_in_bytes = self.body.as_bytes();
        let html_stripped_body = from_read(&body_in_bytes[..], body_in_bytes.len());
        html_stripped_body
          .replace("\n", " ")
          .replace("\r", " ")
          .replace("\t", " ")
          .trim()
          .split(' ')
          .filter(|s| !s.is_empty() && s.len() < 70)
          .collect::<Vec<_>>()
          .join(" ")
      }
    };

    let splitter = TextSplitter::default();
    let chunks = splitter.split_text(&parsed_body);

    let mut prompt = format!(
      "> Start of Email\n\n {} sent on {}\n Subject:{}\n\n",
      self.sender, datestr, self.subject
    );

    if chunk_ids.len() <= 0 || chunks.len() <= 0 {
      prompt = format!("{}\n\n{}", prompt, &parsed_body);
    } else {
      for chunk_id in chunk_ids {
        if chunk_id as usize <= chunks.len() - 1 {
          prompt = format!("{}\n\n{}", prompt, chunks[chunk_id as usize]);
        }
      }
    }

    prompt = format!("{}\n\n > End of Email\n\n", prompt);
    prompt
  }

  fn get_summary(&self) -> String {
    self.body.clone()
  }

  fn get_hyperlink(&self) -> String {
    format!("https://mail.google.com/mail/u/0/#inbox/{}", self.email_uid)
  }
  
}
