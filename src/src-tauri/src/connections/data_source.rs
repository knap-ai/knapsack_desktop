use serde_json::Value;

use crate::db::models::{
  document::Document, drive_document::DriveDocument, email::Email, local_file::LocalFile,
};
use crate::error::Error;

pub struct KnowledgeSource {
  pub document: Document,
  pub title: Option<String>,
  pub document_type: Option<String>,
  // pub prompt_string: Option<String>,
  pub summary: Option<String>,
  pub hyperlink: Option<String>,
  pub data: Option<Box<dyn KnowledgeSnippet>>,
}

impl KnowledgeSource {
  pub fn new(document_id: u64) -> Result<Option<KnowledgeSource>, Error> {
    let document = Document::find_by_id(document_id)?;
    if let Some(doc) = document {
      let data: Option<Box<dyn KnowledgeSnippet>> = match doc.foreign_table.as_str() {
        "emails" => {
          let email = Email::find_by_id(doc.foreign_table_id)?;
          if email.is_none() {
            return Ok(None);
          }
          Some(Box::new(email.unwrap()))
        }
        "drive_documents" => {
          let drive_document = DriveDocument::find_by_id(doc.foreign_table_id)?;
          if drive_document.is_none() {
            return Ok(None);
          }
          Some(Box::new(drive_document.unwrap()))
        }
        "local_files" => {
          let local_file = LocalFile::find_by_id(doc.foreign_table_id)?;
          if local_file.is_none() {
            return Ok(None);
          }
          Some(Box::new(local_file.unwrap()))
        }
        _ => None,
      };
      let title = data.as_ref().map(|d| d.get_title().clone());
      let document_type = data.as_ref().map(|d| d.get_document_type().clone());
      // let prompt_string = data.as_ref().map(|d| d.to_prompt_string(None).clone());
      let summary = data.as_ref().map(|d| d.get_summary().clone());
      let hyperlink = data.as_ref().map(|d| d.get_hyperlink().clone());

      Ok(Some(KnowledgeSource {
        document: doc,
        title,
        document_type,
        // prompt_string,
        summary,
        hyperlink,
        data,
      }))
    } else {
      Err(Error::KSError("Document not found".to_string()))
    }
  }

  pub fn get_title(&mut self) -> &String {
    if self.title.is_none() {
      self.title = self.data.as_ref().map(|d| d.get_title().clone());
    }
    self.title.as_ref().unwrap()
  }

  pub fn get_document_type(&mut self) -> &String {
    if self.document_type.is_none() {
      self.document_type = self.data.as_ref().map(|d| d.get_document_type().clone());
    }
    self.document_type.as_ref().unwrap()
  }

  pub fn get_summary(&mut self) -> &String {
    if self.summary.is_none() {
      self.summary = self.data.as_ref().map(|d| d.get_summary().clone());
    }
    self.summary.as_ref().unwrap()
  }

  pub fn to_prompt_string(
    &mut self,
    chunk_ids: Option<Vec<u64>>,
    payloads: Option<Vec<Value>>,
  ) -> String {
    self
      .data
      .as_ref()
      .map(|d| d.to_prompt_string(chunk_ids, payloads))
      .unwrap()
  }

  pub fn get_hyperlink(&mut self) -> &String {
    if self.hyperlink.is_none() {
      self.hyperlink = self.data.as_ref().map(|d| d.get_hyperlink().clone());
    }
    self.hyperlink.as_ref().unwrap()
  }
}

pub trait KnowledgeSnippet {
  fn get_title(&self) -> String;
  fn get_document_type(&self) -> String;
  // TODO: should we be returning JSON Strings from to_prompt_string?
  // Would that help LLMs parse the context data better?
  fn to_prompt_string(&self, chunk_ids: Option<Vec<u64>>, payloads: Option<Vec<Value>>) -> String;
  fn get_summary(&self) -> String;
  fn get_hyperlink(&self) -> String;
}
