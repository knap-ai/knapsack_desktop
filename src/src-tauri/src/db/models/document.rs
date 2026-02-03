use rusqlite::{params, Result};
use serde::Serialize;
use serde_json::Value;

use crate::connections::data_source::{KnowledgeSnippet, KnowledgeSource};
use crate::db::db::get_db_conn;
use crate::db::models::local_file::LocalFile;

use crate::error::Error;
use crate::local_fs;

use super::drive_document::DriveDocument;
use super::email::Email;

#[derive(Clone, Debug, Serialize)]
pub struct Document {
  pub id: Option<u64>,
  pub foreign_table: String,
  pub foreign_table_id: u64,
  pub hash: String,
  pub timestamp: Option<u64>,
}

impl Document {
  pub fn delete(&self) -> Result<()> {
    let connection = get_db_conn();
    connection.execute("DELETE FROM documents WHERE id = ?1", params![self.id])?;
    Ok(())
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    if self.id.is_none() {
      connection.execute(
        "INSERT INTO documents (foreign_table, foreign_table_id, hash) VALUES (?1, ?2, ?3)",
        params![&self.foreign_table, &self.foreign_table_id, &self.hash],
      )?;
      self.id = Some(connection.last_insert_rowid() as u64);
    } else {
      connection
        .execute(
          "UPDATE documents SET foreign_table = ?1, foreign_table_id = ?2, timestamp = strftime('%s','now'), hash = ?3 WHERE id = ?4",
          params![&self.foreign_table, &self.foreign_table_id, &self.hash, &self.id],
        )?;
    }
    Ok(())
  }

  pub fn find_by_id(id: u64) -> Result<Option<Document>> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare("SELECT * FROM documents WHERE id = ?1")?;
    let mut rows = stmt.query_map(params![id], |row| {
      Ok(Document {
        id: row.get(0)?,
        foreign_table: row.get(1)?,
        foreign_table_id: row.get(2)?,
        timestamp: row.get(3)?,
        hash: row.get(4)?,
      })
    })?;

    if let Some(row) = rows.next() {
      return Ok(Some(row?));
    }
    Ok(None)
  }

  pub fn find_by_ids(ids: &Vec<u64>) -> Result<Vec<Document>> {
    let connection = get_db_conn();
    let id_where_clause = ids
      .iter()
      .map(|id| id.to_string())
      .collect::<Vec<String>>()
      .join(",");
    let mut stmt = connection.prepare(&format!(
      "SELECT * FROM documents WHERE id IN ({})",
      id_where_clause
    ))?;
    let rows = stmt.query_map([], |row| {
      Ok(Document {
        id: row.get(0)?,
        foreign_table: row.get(1)?,
        foreign_table_id: row.get(2)?,
        timestamp: row.get(3)?,
        hash: row.get(4)?,
      })
    })?;

    let mut documents = Vec::new();
    for row in rows {
      documents.push(row?);
    }
    Ok(documents)
  }

  pub fn find_by_foreign_table_and_id(
    foreign_table: &str,
    foreign_table_id: u64,
  ) -> Result<Option<Document>> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT * FROM documents WHERE foreign_table = ?1 AND foreign_table_id = ?2")?;
    let mut rows = stmt.query_map(params![foreign_table, foreign_table_id], |row| {
      Ok(Document {
        id: row.get(0)?,
        foreign_table: row.get(1)?,
        foreign_table_id: row.get(2)?,
        timestamp: row.get(3)?,
        hash: row.get(4)?,
      })
    })?;
    if let Some(row) = rows.next() {
      return Ok(Some(row?));
    }
    Ok(None)
  }

  pub fn find_by_type(foreign_table: String, identifier: String) -> Option<Document> {
    if foreign_table == "local_files" {
      let filename = match local_fs::get_filename_from_path(identifier) {
        Some(f) => f,
        None => return None,
      };

      let document = match LocalFile::find_by_filename(filename) {
        Ok(Some(lf)) => {
          log::info!("Document::find_by_type. Found local file: {:?}", lf);
          Document::find_by_foreign_table_and_id("local_files", lf.id.unwrap()).unwrap()
        }
        Ok(None) => None,
        Err(e) => {
          log::error!("Error finding Document by type: {:?}", e);
          None
        }
      };
      return document;
    }
    if foreign_table == "emails" {
      let email = Email::get_email_message(&identifier);
      let document = email.map(|email| {
        match Document::find_by_foreign_table_and_id("emails", email.id.unwrap()) {
          Ok(document) => document,
          Err(error) => {
            log::error!("Error finding document: {:?}", error);
            None
          }
        }
      });
      return document.flatten();
    }
    if foreign_table == "drive_documents" {
      let drive_file = match DriveDocument::find_by_drive_id(&identifier) {
        Ok(drive_file) => drive_file,
        Err(error) => {
          log::error!("Error finding drive file {:?}", error);
          None
        }
      };
      let document = drive_file.map(|drive_file| {
        match Document::find_by_foreign_table_and_id("drive_documents", drive_file.id.unwrap()) {
          Ok(document) => document,
          Err(error) => {
            log::error!("Error finding document: {:?}", error);
            None
          }
        }
      });
      return document.flatten();
    }
    None
  }

  pub fn get_knowledge_snippets(
    &self,
    chunk_ids: Option<Vec<u64>>,
    payloads: Option<Vec<Value>>,
  ) -> Result<String, Error> {
    if self.id.is_none() {
      return Err(Error::KSError(
        "document.id == None - can't get knowledge snippets.".to_string(),
      ));
    }

    let mut knowledge_source = match KnowledgeSource::new(self.id.unwrap()) {
      Ok(Some(ks)) => ks,
      Ok(None) => {
        return Err(Error::KSError(
          "Could not find knowledge source".to_string(),
        ))
      }
      Err(e) => return Err(e),
    };
    Ok(
      knowledge_source
        .to_prompt_string(chunk_ids, payloads)
        .to_string(),
    )
  }

  pub fn as_knowledge_snippet(&self) -> Result<Box<dyn KnowledgeSnippet>, Error> {
    match KnowledgeSource::new(self.id.unwrap()) {
      Ok(Some(ks)) => Ok(ks.data.unwrap()),
      Ok(None) => Err(Error::KSError(
        "Could not find knowledge source".to_string(),
      )),
      Err(e) => Err(e),
    }
  }
}

pub fn convert_ids_to_knowledge(
  document_id: u64,
  chunk_ids: Option<Vec<u64>>,
  payloads: Option<Vec<Value>>,
) -> Result<String, Error> {
  match Document::find_by_id(document_id)? {
    Some(d) => Ok(d.get_knowledge_snippets(chunk_ids, payloads)?),
    None => Err(Error::KSError("Could not find document".to_string())),
  }
}

fn contains_document(documents: &Vec<Document>, id: u64) -> bool {
  let mut contains_doc = false;
  for document in documents {
    contains_doc = match &document.id {
      Some(document_id) => document_id == &id,
      None => false,
    };
  }
  contains_doc
}

pub fn get_documents(ids: Vec<u64>) -> Vec<Document> {
  let connection = get_db_conn();
  let id_where_clause = ids
    .iter()
    .map(|id| id.to_string())
    .collect::<Vec<String>>()
    .join(",");
  let mut stmt = connection
    .prepare("SELECT * FROM documents WHERE id IN (?)")
    .expect("could not prepare query to get documents");
  stmt
    .execute([id_where_clause])
    .expect("could not execute query to get documents");
  let rows = stmt
    .query_map([], |row| {
      Ok(Document {
        id: row.get(0)?,
        foreign_table: row.get(1)?,
        foreign_table_id: row.get(2)?,
        timestamp: row.get(3)?,
        hash: row.get(4)?,
      })
    })
    .expect("could not execute query");
  let mut documents = Vec::new();
  for row in rows {
    let document = row.unwrap();
    documents.push(document);
  }
  return documents;
}
