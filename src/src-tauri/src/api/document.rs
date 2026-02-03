use crate::connections::data_source::KnowledgeSource;
use crate::connections::google::drive::embed_drive_document;
use crate::connections::google::gmail::embed_email;
use crate::connections::local::files::embed_local_file;
use crate::db::models::document::Document;
use crate::memory::semantic::SemanticService;
use actix_web::web::Data;
use actix_web::{post, web::Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::runtime::Handle;
use tokio::sync::Mutex;

#[derive(Serialize, Deserialize)]
struct GetDocumentInfosRequest {
  document_identifiers: Vec<String>,
  document_types: Vec<String>,
  email: Option<String>,
}

struct GetDocumentsByIdsResponse {
  success: bool,
  display_documents: Vec<DisplayDocument>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DisplayDocument {
  pub document_id: u64,
  pub title: String,
  pub document_type: String,
  pub summary: Option<String>,
  pub uri: String,
}

async fn embed_document(
  doc_type: &str,
  doc_identifier: &str,
  email: Option<String>,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
) {
  let unwrapped_semenatic_service = semantic_service.get_ref().clone();
  match doc_type {
    "local_files" => {
      embed_local_file(doc_identifier, unwrapped_semenatic_service).await;
    }
    "drive_documents" => {
      if let Some(email) = email {
        embed_drive_document(doc_identifier, &email, unwrapped_semenatic_service).await;
      }
    }
    "emails" => {
      if let Some(email) = email {
        embed_email(doc_identifier, &email, unwrapped_semenatic_service).await;
      }
    }
    _ => {
      log::error!("Document type not supported: {}", doc_type);
    }
  }
}

fn embed_documents(
  document_types: Vec<String>,
  document_identifiers: Vec<String>,
  email: Option<String>,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
  handle: Data<Arc<Handle>>,
) {
  handle.spawn(async move {
    for (idx, doc_type) in document_types.into_iter().enumerate() {
      let doc_identifer = document_identifiers[idx].clone();

      embed_document(
        &doc_type,
        &doc_identifer,
        email.clone(),
        semantic_service.clone(),
      )
      .await;
    }
  });
}

#[post("/api/knapsack/document_infos")]
pub async fn get_document_infos(
  request: Json<GetDocumentInfosRequest>,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
  handle: Data<Arc<Handle>>,
) -> actix_web::HttpResponse {
  let infos = to_display_docs(request, semantic_service, handle).await;
  actix_web::HttpResponse::Ok().json(infos)
}

async fn to_display_docs(
  request: Json<GetDocumentInfosRequest>,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
  handle: Data<Arc<Handle>>,
) -> Vec<DisplayDocument> {
  let mut idx = 0;
  let mut documents = Vec::new();
  let email = request.email.clone();
  let document_types = request.document_types.clone();
  let document_identifiers = request.document_identifiers.clone();
  embed_documents(
    document_types.clone(),
    document_identifiers.clone(),
    email.clone(),
    semantic_service,
    handle,
  );

  for doc_type in document_types {
    let doc_identifer = &document_identifiers[idx].clone();
    idx += 1;
    let doc = match Document::find_by_type(doc_type.to_string(), doc_identifer.to_string()) {
      Some(d) => d,
      None => {
        log::error!("Could not find document by type: {}", doc_type);
        continue;
      }
    };
    documents.push(doc);
  }
  documents_to_display_documents(documents)
}

pub fn documents_to_display_documents(documents: Vec<Document>) -> Vec<DisplayDocument> {
  let mut display_documents = Vec::new();
  for document in documents {
    let document_id = match document.id {
      Some(id) => id,
      None => continue,
    };
    // TODO: no error handling here on KnowledgeSource::new
    let mut data_source = KnowledgeSource::new(document_id).unwrap().unwrap();
    display_documents.push(DisplayDocument {
      document_id,
      title: data_source.get_title().to_string(),
      document_type: data_source.get_document_type().to_string(),
      summary: Some(data_source.get_summary().to_string()),
      uri: data_source.get_hyperlink().to_string(),
    });
  }
  display_documents
}
