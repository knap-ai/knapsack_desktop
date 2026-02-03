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
}

impl DriveDocument {
  pub fn find_by_id(id: u64) -> Result<Option<DriveDocument>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, timestamp FROM drive_documents WHERE id = ?1")?;

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
        })
      })
      .optional()?;

    Ok(drive_document)
  }

  pub fn find_by_drive_id(drive_id: &str) -> Result<Option<DriveDocument>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, timestamp FROM drive_documents WHERE drive_id = ?1")?;

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
        })
      })
      .optional()?;

    Ok(drive_document)
  }

  pub fn find_by_ids(ids: Vec<String>) -> Result<Vec<DriveDocument>, Error>{
    let connection = get_db_conn();

    let formatted_ids = ids
    .iter()
    .map(|name| format!("\"{}\"", name))
    .collect::<Vec<_>>()
    .join(", ");
    let mut stmt = connection
      .prepare(&format!("SELECT id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url, timestamp FROM drive_documents WHERE drive_id IN ({})", 
      formatted_ids))?;

    let rows = stmt
      .query_map([], |row| {
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
        "INSERT INTO drive_documents (id, drive_id, filename, file_size, date_modified, date_created, summary, checksum, url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
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
            ).to_string(),
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
        let content = payload.as_object().map(|item| item.get("content").map(|content| content.as_str()).flatten()).flatten();
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
