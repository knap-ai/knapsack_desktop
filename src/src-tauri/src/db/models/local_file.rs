use std::collections::HashMap;

use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha256::digest;
use uuid::Uuid;

use crate::connections::data_source::KnowledgeSnippet;
use crate::db::{db::get_db_conn, models::document::Document};
use crate::error::Error;
use crate::local_fs;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LocalFile {
  pub id: Option<u64>,
  pub filename: String,
  pub path: String,
  pub file_size: u64,
  pub date_modified: u64,
  pub date_created: Option<u64>, // not supported on all platforms.
  pub title: String,
  pub summary: Option<String>,
  pub checksum: Option<String>,
  pub timestamp: Option<u64>,
}

impl LocalFile {
  pub fn find_by_id(id: u64) -> Result<Option<LocalFile>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT * FROM local_files WHERE id = ?1")?;
    let local_file = stmt
      .query_row([id], |row| {
        Ok(LocalFile {
          id: Some(row.get(0)?),
          filename: row.get(1)?,
          path: row.get(2)?,
          file_size: row.get(3)?,
          date_modified: row.get(4)?,
          date_created: row.get(5)?,
          title: row.get(6)?,
          summary: row.get(7)?,
          checksum: row.get(8)?,
          timestamp: row.get(9)?,
        })
      })
      .optional()?;

    Ok(local_file)
  }

  pub fn find_all() -> Result<Vec<LocalFile>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT * FROM local_files ORDER BY timestamp DESC")?;
    let file_iter = stmt.query_map([], |row| {
      Ok(LocalFile {
        id: Some(row.get(0)?),
        filename: row.get(1)?,
        path: row.get(2)?,
        file_size: row.get(3)?,
        date_modified: row.get(4)?,
        date_created: row.get(5)?,
        title: row.get(6)?,
        summary: row.get(7)?,
        checksum: row.get(8)?,
        timestamp: row.get(9)?,
      })
    })?;

    let mut files = Vec::new();
    for file in file_iter {
      files.push(file?);
    }
    Ok(files)
  }

  pub fn find_by_filename(filename: String) -> Result<Option<LocalFile>, Error> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT * FROM local_files WHERE filename = ?1")?;
    let result = stmt.query_row([filename], |row| {
      Ok(LocalFile {
        id: Some(row.get(0)?),
        filename: row.get(1)?,
        path: row.get(2)?,
        file_size: row.get(3)?,
        date_modified: row.get(4)?,
        date_created: row.get(5)?,
        title: row.get(6)?,
        summary: row.get(7)?,
        checksum: row.get(8)?,
        timestamp: row.get(9)?,
      })
    });

    match result {
      Ok(local_file) => Ok(Some(local_file)),
      Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
      Err(e) => Err(e.into()),
    }
  }

  pub fn upsert(&mut self) -> Result<Self, Error> {
    let connection = get_db_conn();

    // First, check if a file with this filename already exists
    // and has a different checksum
    let existing_file = connection.query_row(
      "SELECT id, checksum FROM local_files WHERE filename = ?1",
      params![self.filename],
      |row| Ok((row.get::<_, u64>(0)?, row.get::<_, Option<String>>(1)?)),
    );

    match existing_file {
      Ok((existing_id, existing_checksum)) => {
        if existing_checksum != self.checksum {
          let mut stmt = connection.prepare(
            "
            UPDATE local_files SET
            path = ?2, file_size = ?3, date_modified = ?4, date_created = ?5,
            title = ?6, summary = ?7, checksum = ?8, timestamp = ?9
            WHERE id = ?1
            ",
          )?;
          stmt.execute(params![
            existing_id,
            self.path,
            self.file_size,
            self.date_modified,
            self.date_created,
            self.title,
            self.summary,
            self.checksum,
            self.timestamp
          ])?;
          self.id = Some(existing_id);
        } else {
          // Checksum is the same, no update needed
          self.id = Some(existing_id);
        }
      }
      Err(rusqlite::Error::QueryReturnedNoRows) => {
        // File doesn't exist, insert new row
        let mut stmt = connection.prepare(
          "
          INSERT INTO local_files
          (filename, path, file_size, date_modified, date_created, title, summary, checksum, timestamp)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
          ")?;
        stmt.execute(params![
          self.filename,
          self.path,
          self.file_size,
          self.date_modified,
          self.date_created,
          self.title,
          self.summary,
          self.checksum,
          self.timestamp
        ])?;
        self.id = Some(connection.last_insert_rowid() as u64);
      }
      Err(e) => return Err(e.into()),
    }

    Ok(self.clone())
  }

  pub fn count() -> Result<u64> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT count(*) FROM local_files")?;
    let count = stmt.query_row(params![], |row| Ok(row.get::<_, u64>(0)?))?;

    Ok(count)
  }

  pub fn delete(&self) -> Result<(), Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "Cannot delete LocalFile; LocalFile does not exist.".into(),
      ));
    }
    let connection = get_db_conn();
    let mut stmt = connection.prepare("DELETE FROM local_files WHERE id = ?1")?;
    stmt.execute([self.id])?;
    Ok(())
  }

  pub fn get_documents(&self) -> Vec<HashMap<String, serde_json::Value>> {
    let summary = match &self.summary {
      Some(s) => s.clone(),
      None => "".to_string(),
    };
    let text_chunks = match local_fs::read_file_contents(&self) {
      Ok(contents) => contents,
      Err(e) => {
        log::debug!(
          "Error reading file contents for local file: {:?}",
          e.to_string()
        );
        Vec::new()
      }
    };

    let hash = digest(text_chunks.join(""));

    let mut documents = Vec::new();

    let mut document =
      Document::find_by_foreign_table_and_id("local_files", self.id.unwrap()).unwrap();

    if document.is_none() {
      document = Some(create_local_files_document(self.id.unwrap(), hash.clone()));
    } else {
      let mut existing_document = document.unwrap();
      existing_document.hash = hash.clone();
      existing_document.create();
      document = Some(existing_document);
    }

    let document_id = document.unwrap().id.unwrap();

    for (chunk_idx, chunk) in text_chunks.iter().enumerate() {
      let doc_payload = HashMap::from([
        (
          "id".to_string(),
          serde_json::Value::String(
            Uuid::new_v5(
              &Uuid::NAMESPACE_DNS,
              format!("{}/{}", self.path.clone(), chunk_idx).as_bytes(),
            )
            .to_string(),
          ),
        ),
        (
          "content".to_string(),
          serde_json::Value::String(chunk.to_string()),
        ),
        (
          "chunk_id".to_string(),
          serde_json::Value::Number(serde_json::Number::from(chunk_idx)),
        ),
        (
          "filename".to_string(),
          serde_json::Value::String(self.filename.clone()),
        ),
        (
          "path".to_string(),
          serde_json::Value::String(self.path.clone()),
        ),
        (
          "file_size".to_string(),
          serde_json::Value::Number(serde_json::Number::from(self.file_size.clone())),
        ),
        (
          "title".to_string(),
          serde_json::Value::String(self.title.clone()),
        ),
        (
          "summary".to_string(),
          serde_json::Value::String(summary.clone()),
        ),
        (
          "type".to_string(),
          serde_json::Value::String("file".to_string()),
        ),
        (
          "document_id".to_string(),
          serde_json::Value::Number(serde_json::Number::from(document_id)),
        ),
      ]);
      documents.push(doc_payload);
    }

    documents
  }

  pub fn get_attrs() -> HashMap<&'static str, Vec<String>> {
    // TODO: might be nice to make sure that summary doesn't make it
    // into the embedding if it's an empty string.
    HashMap::from([
      (
        "embed",
        vec![
          "filename".to_string(),
          "path".to_string(),
          "title".to_string(),
          "content".to_string(),
        ],
      ),
      (
        "metadata",
        vec![
          "file_size".to_string(),
          "type".to_string(),
          "document_id".to_string(),
          "chunk_id".to_string(),
        ],
      ),
    ])
  }
}

fn create_local_files_document(local_file_id: u64, hash: String) -> Document {
  let mut document = Document {
    id: None,
    foreign_table: "local_files".to_string(),
    foreign_table_id: local_file_id,
    hash,
    timestamp: None,
  };
  match document.create() {
    Ok(d) => d,
    Err(_) => log::error!("Couldn't create doc for local file: {:?}", local_file_id),
  };
  document
}

impl KnowledgeSnippet for LocalFile {
  fn get_title(&self) -> String {
    self.filename.clone()
  }

  fn get_document_type(&self) -> String {
    "local_file".to_string()
  }

  fn to_prompt_string(&self, chunk_ids: Option<Vec<u64>>, _payloads: Option<Vec<Value>>) -> String {
    let chunk_ids = chunk_ids.unwrap_or(vec![]);
    let file_contents = match local_fs::read_file_contents(&self) {
      Ok(file_contents) => {
        log::debug!("content length {}", file_contents.len());
        file_contents
      }
      Err(e) => {
        log::debug!("error reading file contents: {}", e);
        Vec::new()
      }
    };

    let mut prompt = format!("\n\n> Start of excerpts from: {}", self.filename);
    if chunk_ids.len() == 0 {
      prompt = format!("{}\n\n{}", prompt, file_contents.join(""));
    } else {
      for (chunk_idx, chunk) in file_contents.iter().enumerate() {
        if chunk_ids.contains(&(chunk_idx.clone() as u64)) {
          prompt = format!("{}\n\n{}", prompt, chunk,);
        }
      }
    }
    prompt = format!("{}> End of excerpts from: {}", prompt, self.filename);

    prompt
  }

  fn get_summary(&self) -> String {
    // TODO: This is naively just returning the first chunk of the file.
    let file_contents = match local_fs::read_file_contents(&self) {
      Ok(file_contents) => {
        log::debug!("content length {}", file_contents.len());
        file_contents
      }
      Err(e) => {
        log::debug!("error reading file contents: {}", e);
        Vec::new()
      }
    };
    file_contents.first().cloned().unwrap_or_else(|| format!(""))
  }

  fn get_hyperlink(&self) -> String {
    return "".to_string();
  }
}
