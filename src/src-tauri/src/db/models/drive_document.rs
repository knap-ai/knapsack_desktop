use rusqlite::{params, OptionalExtension};
use serde_json::{Map, Value};
use std::collections::HashMap;
use uuid::Uuid;

use crate::connections::data_source::KnowledgeSnippet;
use crate::db::{db::get_db_conn, models::document::Document};
use crate::error::Error;
use std::collections::HashSet;

#[derive(Debug, Clone)]
pub struct DriveDocument {
  pub id: Option<u64>,
  pub drive_id: String,
  pub filename: String,
  pub file_size: u64,
  pub date_modified: u64,
  pub date_created: u64,
  pub summary: String,
  pub checksum: String,
  pub url: String,
  pub timestamp: Option<u64>,
  pub content_chunks: Option<Vec<String>>,
  pub account_email: String,
}

impl DriveDocument {
  /// Keep a bounded, locally persisted text index for features that need to
  /// find a Drive file by its contents without making a remote Drive call.
  /// The full content still lives in the vector index; this is only enough to
  /// select useful evidence for short, source-labelled experiences such as
  /// goal discovery.
  pub fn summary_from_content_chunks(content_chunks: &[String]) -> String {
    const LIMIT: usize = 12_000;
    content_chunks
      .iter()
      .flat_map(|chunk| chunk.chars())
      .take(LIMIT)
      .collect()
  }

  pub fn update_summary(&self) -> Result<(), Error> {
    let connection = get_db_conn();
    connection.execute(
      "UPDATE drive_documents SET filename = ?1, file_size = ?2,
       date_modified = ?3, date_created = ?4, summary = ?5, checksum = ?6,
       url = ?7, account_email = ?8 WHERE drive_id = ?9 AND account_email = ?8",
      params![
        &self.filename,
        self.file_size,
        self.date_modified,
        self.date_created,
        &self.summary,
        &self.checksum,
        &self.url,
        &self.account_email,
        &self.drive_id,
      ],
    )?;
    Ok(())
  }

  /// A separate per-account marker makes the historical content catch-up
  /// explicit. `timestamp` cannot serve this purpose because legacy rows have
  /// always received a creation timestamp from SQLite.
  pub fn needs_goal_index_backfill(account_email: &str) -> Result<bool, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT NOT EXISTS(
        SELECT 1 FROM drive_goal_index_backfills WHERE account_email = ?1
      ) AND (
        NOT EXISTS(SELECT 1 FROM drive_goal_index_backfill_attempts WHERE account_email = ?1)
        OR COALESCE((SELECT attempted_at FROM drive_goal_index_backfill_attempts WHERE account_email = ?1), 0)
           < strftime('%s','now') - 86400
      )",
    )?;
    stmt
      .query_row(params![account_email], |row| row.get(0))
      .map_err(Into::into)
  }

  pub fn mark_goal_index_backfill_complete(account_email: &str) -> Result<(), Error> {
    let connection = get_db_conn();
    connection.execute(
      "INSERT OR REPLACE INTO drive_goal_index_backfills (account_email, completed_at)
       VALUES (?1, strftime('%s','now'))",
      params![account_email],
    )?;
    Ok(())
  }

  pub fn record_goal_index_backfill_attempt(account_email: &str) -> Result<(), Error> {
    let connection = get_db_conn();
    connection.execute(
      "INSERT OR REPLACE INTO drive_goal_index_backfill_attempts (account_email, attempted_at)
       VALUES (?1, strftime('%s','now'))",
      params![account_email],
    )?;
    Ok(())
  }

  pub fn find_by_id(id: u64) -> Result<Option<DriveDocument>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, timestamp, account_email FROM drive_documents WHERE id = ?1")?;

    let drive_document = stmt
      .query_row(params![id], |row| {
        Ok(DriveDocument {
          id: row.get(0)?,
          drive_id: row.get(1)?,
          filename: row.get(2)?,
          file_size: row.get(3)?,
          date_modified: row.get(4)?,
          date_created: row.get(5)?,
          summary: row.get(6)?,
          checksum: row.get(7)?,
          url: row.get(8)?,
          timestamp: row.get(9)?,
          content_chunks: None,
          account_email: row.get(10).unwrap_or_default(),
        })
      })
      .optional()?;

    Ok(drive_document)
  }

  pub fn find_by_drive_id(drive_id: &str) -> Result<Option<DriveDocument>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, timestamp, account_email FROM drive_documents WHERE drive_id = ?1")?;

    let drive_document = stmt
      .query_row(params![drive_id], |row| {
        Ok(DriveDocument {
          id: row.get(0)?,
          drive_id: row.get(1)?,
          filename: row.get(2)?,
          file_size: row.get(3)?,
          date_modified: row.get(4)?,
          date_created: row.get(5)?,
          summary: row.get(6)?,
          checksum: row.get(7)?,
          url: row.get(8)?,
          timestamp: row.get(9)?,
          content_chunks: None,
          account_email: row.get(10).unwrap_or_default(),
        })
      })
      .optional()?;

    Ok(drive_document)
  }

  pub fn find_by_drive_id_for_account(
    drive_id: &str,
    account_email: &str,
  ) -> Result<Option<DriveDocument>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, timestamp, account_email
       FROM drive_documents WHERE drive_id = ?1 AND account_email = ?2",
    )?;
    let drive_document = stmt
      .query_row(params![drive_id, account_email], |row| {
        Ok(DriveDocument {
          id: row.get(0)?, drive_id: row.get(1)?, filename: row.get(2)?, file_size: row.get(3)?,
          date_modified: row.get(4)?, date_created: row.get(5)?, summary: row.get(6)?,
          checksum: row.get(7)?, url: row.get(8)?, timestamp: row.get(9)?, content_chunks: None,
          account_email: row.get(10).unwrap_or_default(),
        })
      })
      .optional()?;
    Ok(drive_document)
  }

  pub fn find_by_ids(ids: Vec<String>) -> Result<Vec<DriveDocument>, Error> {
    let connection = get_db_conn();

    let formatted_ids = ids
      .iter()
      .map(|name| format!("\"{}\"", name))
      .collect::<Vec<_>>()
      .join(", ");
    let mut stmt = connection
      .prepare(&format!("SELECT id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, timestamp, account_email FROM drive_documents WHERE drive_id IN ({})",
      formatted_ids))?;

    let rows = stmt.query_map([], |row| {
      Ok(DriveDocument {
        id: row.get(0)?,
        drive_id: row.get(1)?,
        filename: row.get(2)?,
        file_size: row.get(3)?,
        date_modified: row.get(4)?,
        date_created: row.get(5)?,
        summary: row.get(6)?,
        checksum: row.get(7)?,
        url: row.get(8)?,
        timestamp: row.get(9)?,
        content_chunks: None,
        account_email: row.get(10).unwrap_or_default(),
      })
    })?;

    let mut unique_drive_ids: HashSet<String> = HashSet::new();

    let mut drive_document = Vec::new();

    for row in rows {
      let document = row?.clone();
      let drive_id = document.drive_id.clone();
      if !unique_drive_ids.contains(&drive_id) {
        drive_document.push(document);
        unique_drive_ids.insert(drive_id);
      }
    }

    Ok(drive_document)
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    let result = connection
      .execute(
        "INSERT INTO drive_documents (id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, account_email) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        (
          &self.id,
          &self.drive_id,
          &self.filename,
          &self.file_size,
          &self.date_modified,
          &self.date_created,
          &self.summary,
          &self.checksum,
          &self.url,
          &self.account_email,
        ),
      )
      .map_err(|e| e.into());
    match result {
      Ok(_) => {
        self.id = Some(connection.last_insert_rowid() as u64);
        Ok(())
      }
      Err(e) => Err(e),
    }
  }

  pub fn count() -> Result<u64, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT count(*) FROM drive_documents")?;
    let count = stmt.query_row(params![], |row| Ok(row.get::<_, u64>(0)?))?;

    Ok(count)
  }

  /// Return Drive files whose name or locally persisted text index looks
  /// likely to contain an objective, OKR, or planning target. Callers use this
  /// metadata only to select evidence for a goal proposal.
  pub fn find_goal_evidence(limit: usize) -> Result<Vec<DriveDocument>, Error> {
    const GOAL_TERMS: [&str; 12] = [
      "okr",
      "objective",
      "key result",
      "goal",
      "target",
      "kpi",
      "metric",
      "milestone",
      "north star",
      "annual plan",
      "strategic plan",
      "quarterly plan",
    ];

    let connection = get_db_conn();
    let clauses = GOAL_TERMS
      .iter()
      .map(|_| "(LOWER(filename) LIKE ? OR LOWER(summary) LIKE ?)")
      .collect::<Vec<_>>()
      .join(" OR ");
    let query = format!(
      "SELECT id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, timestamp, account_email \
       FROM drive_documents WHERE {clauses} ORDER BY date_modified DESC LIMIT ?"
    );
    let mut params = Vec::with_capacity(GOAL_TERMS.len() * 2 + 1);
    for term in GOAL_TERMS {
      let pattern = format!("%{term}%");
      params.push(pattern.clone());
      params.push(pattern);
    }
    params.push(limit.max(1).to_string());

    let mut stmt = connection.prepare(&query)?;
    let rows = stmt.query_map(rusqlite::params_from_iter(params), |row| {
      Ok(DriveDocument {
        id: row.get(0)?,
        drive_id: row.get(1)?,
        filename: row.get(2)?,
        file_size: row.get(3)?,
        date_modified: row.get(4)?,
        date_created: row.get(5)?,
        summary: row.get(6)?,
        checksum: row.get(7)?,
        url: row.get(8)?,
        timestamp: row.get(9)?,
        content_chunks: None,
        account_email: row.get(10).unwrap_or_default(),
      })
    })?;
    Ok(rows.filter_map(Result::ok).collect())
  }

  pub fn upsert(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    let result = connection
      .execute(
        "INSERT INTO google_drive (id, filename, file_size, date_modified, date_created, summary, checksum, url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        ON CONFLICT(id) DO UPDATE SET filename = ?2, file_size = ?3, date_modified = ?4, date_created = ?5, summary = ?6, checksum = ?7, url = ?8",
        (
          &self.id,
          &self.filename,
          &self.file_size,
          &self.date_modified,
          &self.date_created,
          &self.summary,
          &self.checksum,
          &self.url,
        ),
      )
      .map_err(|e| e.into());
    match result {
      Ok(_) => Ok(()),
      Err(e) => Err(e),
    }
  }

  // pub fn update(&self) -> Result<(), Error> {
  //   let connection = get_db_conn();
  //   connection
  //     .execute(
  //       "UPDATE drive_documents SET checksum = ?2 WHERE id = ?1",
  //       (&self.id, &self.checksum),
  //     )?;
  //   Ok(())
  // }

  pub fn delete(&self) -> Result<(), Error> {
    let connection = get_db_conn();
    let result = connection
      .execute("DELETE FROM drive_documents WHERE id = ?1", [&self.id])
      .map_err(|e| e.into());
    match result {
      Ok(_) => Ok(()),
      Err(e) => Err(e),
    }
  }

  pub fn get_drive_checksum(drive_id: &str) -> Option<String> {
    let doc = DriveDocument::find_by_drive_id(drive_id).map(|doc| doc.map(|d| d.checksum));
    match doc {
      Ok(Some(checksum)) => Some(checksum),
      _ => None,
    }
  }

  pub fn get_documents(&self) -> Vec<HashMap<String, serde_json::Value>> {
    let mut documents = Vec::new();
    // let splitter = TextSplitter::default();
    // let chunks = splitter.split_text(content);

    let document =
      Document::find_by_foreign_table_and_id("drive_documents", self.id.unwrap()).unwrap();
    let mut document_id = document.map(|document| document.id).flatten();
    if document_id.is_none() {
      let document = create_drive_document(self.id.unwrap(), String::from(""));
      document_id = document.id;
    }

    for (chunk_idx, chunk) in self
      .content_chunks
      .clone()
      .unwrap_or(vec![])
      .into_iter()
      .enumerate()
    {
      // match document_id {
      //   Some(doc) => {
      //     let document_id = doc.id.unwrap();
      //     doc_payload.insert(
      //       "document_id".to_string(),
      //       serde_json::Value::Number(serde_json::Number::from(document_id)),
      //     );
      //     doc_payload
      //   }
      //   None => doc_payload,
      // }

      let mut doc_payload = HashMap::from([
        (
          "id".to_string(),
          serde_json::Value::String(
            Uuid::new_v5(
              &Uuid::NAMESPACE_DNS,
              format!("{}/{}", self.drive_id.clone(), chunk_idx).as_bytes(),
            )
            .to_string(),
          ),
        ),
        (
          "chunk_id".to_string(),
          serde_json::Value::Number(serde_json::Number::from(chunk_idx)),
        ),
        (
          "drive_id".to_string(),
          serde_json::Value::String(self.drive_id.clone()),
        ),
        (
          "filename".to_string(),
          serde_json::Value::String(self.filename.clone()),
        ),
        (
          "file_size".to_string(),
          serde_json::Value::Number(serde_json::Number::from(self.file_size.clone())),
        ),
        (
          "date_created".to_string(),
          serde_json::Value::Number(serde_json::Number::from(self.date_created.clone())),
        ),
        ("content".to_string(), serde_json::Value::String(chunk)),
        (
          "url".to_string(),
          serde_json::Value::String(self.url.clone()),
        ),
        (
          "type".to_string(),
          serde_json::Value::String("drive".to_string()),
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
      ("embed", vec!["filename".to_string(), "content".to_string()]),
      (
        "metadata",
        vec![
          "drive_id".to_string(),
          "url".to_string(),
          "date_created".to_string(),
          "file_size".to_string(),
          "type".to_string(),
          "document_id".to_string(),
          "chunk_id".to_string(),
        ],
      ),
    ])
  }
}

pub fn create_drive_document(id: u64, hash: String) -> Document {
  let mut document = Document {
    id: None,
    foreign_table: "drive_documents".to_string(),
    foreign_table_id: id,
    hash,
    timestamp: None,
  };
  match document.create() {
    Ok(d) => d,
    Err(_) => log::error!("Couldn't create doc for drive file: {:?}", id),
  };
  document
}

impl KnowledgeSnippet for DriveDocument {
  fn get_title(&self) -> String {
    self.filename.clone()
  }

  fn get_document_type(&self) -> String {
    "drive_document".to_string()
  }

  fn to_prompt_string(&self, _chunk_ids: Option<Vec<u64>>, payloads: Option<Vec<Value>>) -> String {
    let payloads = payloads.unwrap_or(vec![]);
    // let file_contents = match local_fs::read_file_contents(&self) {
    //   Ok(file_contents) => {
    //     log::debug!("content length {}", file_contents.len());
    //     file_contents
    //   }
    //   Err(e) => {
    //     log::debug!("error reading file contents: {}", e);
    //     Vec::new()
    //   }
    // };

    let mut prompt = format!("\n\n> Start of excerpts from: {}", self.filename);
    if payloads.len() == 0 {
      prompt = format!("{}\n\n{}", prompt, self.summary);
    } else {
      for payload in payloads {
        let content = payload
          .as_object()
          .map(|item| {
            item
              .get("content")
              .map(|content| content.as_str())
              .flatten()
          })
          .flatten();
        if let Some(content) = content {
          prompt = format!("{}\n\n{}", prompt, content);
        }
      }
    }
    prompt = format!("{}> End of excerpts from: {}", prompt, self.filename);

    prompt
  }

  fn get_summary(&self) -> String {
    self.summary.clone()
  }

  fn get_hyperlink(&self) -> String {
    self.url.clone()
  }
}
