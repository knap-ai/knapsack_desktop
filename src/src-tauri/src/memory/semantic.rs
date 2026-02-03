use actix_web::{
  post,
  web::{Data, Json},
  Responder,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha256::digest;
use std::collections::HashMap;
use std::hash::{Hash, Hasher};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use uuid::Uuid;

use crate::{
  api::document::DisplayDocument,
  llm::types::{LLMError, MaxTokensArgs, StringToTokensArgs},
  memory::qdrant::{get_points, GetPointsResponse},
};
use crate::{
  connections::api::ConnectionsEnum,
  error::{Error, QdrantError},
};
use crate::{
  db::models::document::Document,
  llm::{llama_binding::llm::LlamaBinding, types::EmbeddingLlm},
};
use crate::{
  llm::types::{EmbeddingArgs, EmbeddingTokensArgs},
  ConnectionsData,
};
use priority_queue::PriorityQueue;
use std::time::Instant;
use crate::utils::platform::{OS, get_os};

use super::qdrant::{create_collection, get_point, search_points, upsert_points};

#[derive(PartialEq, Eq, Debug, Clone, Hash)]
enum QueueAction {
  CreateCollection,
  UpsertPoints,
  HandleFinishEmbedding,
}

#[derive(Debug, PartialEq, Eq, Clone, Hash)]
enum QueueItemPayload {
  Embedding(QueueItemEmbeddingPayload),
  HandleFinishEmbedding(QueueItemFinishEmbeddingPayload),
}

#[derive(PartialEq, Eq, Debug, Clone)]
struct QueueItemEmbeddingPayload {
  ids: Vec<String>,
  payloads: Vec<HashMap<String, Value>>,
  embed_fields: Vec<String>,
  hashes: Vec<(String, String)>,
}

#[derive(PartialEq, Eq, Debug, Clone)]
struct QueueItemFinishEmbeddingPayload {
  connection: ConnectionsEnum,
}

impl Hash for QueueItemEmbeddingPayload {
  fn hash<H: Hasher>(&self, state: &mut H) {
    self.ids.hash(state);
    self.embed_fields.hash(state);
  }
}
impl Hash for QueueItemFinishEmbeddingPayload {
  fn hash<H: Hasher>(&self, state: &mut H) {
    self.connection.hash(state);
  }
}

#[derive(Debug, PartialEq, Eq, Clone, Hash)]
struct QueueItem {
  action: QueueAction,
  retries: u16,
  payload: Option<QueueItemPayload>,
}

#[derive(Clone)]
pub struct SemanticService {
  llama: Arc<Mutex<LlamaBinding>>,
  embedder_path: Arc<RwLock<PathBuf>>,
  queue: Arc<Mutex<PriorityQueue<QueueItem, u16>>>,
  is_chatting: Arc<Mutex<AtomicBool>>,
  app_handle: tauri::AppHandle,
  connections_data: Arc<Mutex<ConnectionsData>>,
}

pub struct SemanticSearchResult {
  pub id: String,
  pub score: f32,
  pub document_id: u64,
  pub chunk_ids: Vec<u64>,
  pub payloads: Vec<Value>,
}

impl SemanticService {
  pub fn new(
    embedder_path: PathBuf,
    is_chatting: Arc<Mutex<AtomicBool>>,
    app_handle: tauri::AppHandle,
    connections_data: Arc<Mutex<ConnectionsData>>,
  ) -> Self {
    Self {
      queue: Arc::new(Mutex::new(PriorityQueue::new())),
      llama: Arc::new(Mutex::new(LlamaBinding::default())),
      embedder_path: Arc::new(RwLock::new(embedder_path)),
      is_chatting,
      app_handle,
      connections_data,
    }
  }

  pub async fn embed(&self, data: Vec<String>) -> Result<Vec<Vec<f32>>, LLMError> {
    let llama = self.llama.lock().await;
    let embedder_path = self.embedder_path.read().await;
    llama
      .embed(EmbeddingArgs {
        model: embedder_path.to_string_lossy().to_string(),
        inputs: data.clone(),
      })
      .await
  }

  pub async fn embed_tokens(&self, data: Vec<Vec<i32>>) -> Result<Vec<Vec<f32>>, LLMError> {
    let llama = self.llama.lock().await;
    let embedder_path = self.embedder_path.read().await;
    llama
      .embed_tokens(EmbeddingTokensArgs {
        model: embedder_path.to_string_lossy().to_string(),
        inputs: data.clone(),
      })
      .await
  }

  pub async fn get_sliced_tokens(&self, data: String) -> Vec<Vec<i32>> {
    let llama = self.llama.lock().await;
    let embedder_path = self.embedder_path.read().await;
    let mut splitted_embed_fields = Vec::new();
    let max_tokens = llama
      .get_max_tokens(MaxTokensArgs {
        model_path: embedder_path.to_string_lossy().to_string(),
      })
      .await;
    let mut tokens = llama
      .string_to_tokens(StringToTokensArgs {
        model_path: embedder_path.to_string_lossy().to_string(),
        data,
      })
      .await;
    while tokens.len() > 0 {
      let slice = tokens.iter().take(max_tokens).cloned().collect::<Vec<_>>();
      splitted_embed_fields.push(slice);
      tokens = tokens.iter().skip(max_tokens).cloned().collect();
    }
    splitted_embed_fields
  }

  pub async fn upsert_points(
    &self,
    ids: Vec<String>,
    payloads: Vec<HashMap<String, Value>>,
    embed_fields: Vec<String>,
    hashes: Vec<(String, String)>,
  ) -> Result<(), String> {
    let perf_start = Instant::now();
    let mut tokenized_embed_fields: Vec<Vec<i32>> = Vec::new();
    let mut embed_fields_split_count: Vec<usize> = Vec::new();

    let mut payloads = payloads.clone();
    let mut ids = ids.clone();
    let mut embed_fields = embed_fields.clone();
    let embed_hash_key = "embed_hash".to_string();
    let metadata_hash_key = "metadata_hash".to_string();
    let mut remove_counts = 0;
    let response = get_points(ids.clone())
      .await
      .unwrap_or(GetPointsResponse { result: None });
    let points = response.result.unwrap_or(vec![]);
    for (index, document_id) in ids.clone().into_iter().enumerate() {
      let points_clone = points.clone();
      for point in points_clone {
        if point.id == document_id {
          let (embed_hash, metadata_hash) = hashes[index].clone();
          let found_embed_hash = point
            .payload
            .get(&embed_hash_key)
            .unwrap()
            .as_str()
            .unwrap();
          let found_embed_metadata = point
            .payload
            .get(&metadata_hash_key)
            .unwrap()
            .as_str()
            .unwrap();
          if found_embed_hash == embed_hash.clone() && found_embed_metadata == metadata_hash.clone()
          {
            payloads.remove(index - remove_counts);
            ids.remove(index - remove_counts);
            embed_fields.remove(index - remove_counts);
            remove_counts += 1;
            break;
          }
        }
      }
    }

    if embed_fields.len() == 0 {
      return Ok(());
    }
    for embed_field in embed_fields {
      let splitted_embedded_fields = self.get_sliced_tokens(embed_field).await;
      embed_fields_split_count.push(splitted_embedded_fields.len());
      tokenized_embed_fields.extend(splitted_embedded_fields);
    }

    if let Ok(vectors) = self.embed_tokens(tokenized_embed_fields.clone()).await {
      let mut vector_index = 0;
      for (document_index, id) in ids.into_iter().enumerate() {
        let split_count = (&embed_fields_split_count[document_index]).clone();
        let mut point_id = id.clone();
        let payload = payloads[document_index].clone();

        for split_index in 0..split_count {
          let vector = &vectors[vector_index];
          if split_index > 0 {
            point_id = Uuid::new_v5(
              &Uuid::NAMESPACE_DNS,
              format!("{}/{}", point_id.clone(), split_index).as_bytes(),
            )
            .to_string();
          }

          let result = upsert_points(
            vec![point_id.clone()],
            vec![payload.clone()],
            vec![vector.clone()],
          )
          .await;
          if let Err(error) = result {
            log::error!("Upsert point failed {:?}", error);
          }
          vector_index += 1;
        }
      }
    }
    let duration = perf_start.elapsed();
    println!("Embedding::done: time {:?}", duration);
    // Todo: return Err in case upsert failed
    Ok(())
  }

  pub async fn create_collection(&self) -> Result<(), QdrantError> {
    create_collection().await
  }

  pub async fn learn(
    &self,
    documents: Vec<HashMap<String, Value>>,
    attrs: HashMap<&str, Vec<String>>,
    priority: u16,
  ) {
    if get_os() != OS::MACOS {
      return
    }

    let mut upsert_payloads = Vec::new();
    let mut upsert_embed_fields: Vec<String> = Vec::new();
    let mut upsert_ids = Vec::new();
    let mut upsert_hash_keys: Vec<(String, String)> = Vec::new();
    for document in documents {
      let mut document_embed_fields: HashMap<String, Value> = HashMap::new();
      let mut document_metadata_fields: HashMap<String, Value> = HashMap::new();
      let id = document.get("id").unwrap().as_str().unwrap();
      for field in attrs.get("embed").unwrap().into_iter() {
        let value = document.get(&field.clone()).unwrap();
        document_embed_fields.insert(field.clone(), value.clone());
      }

      for field in attrs.get("metadata").unwrap().into_iter() {
        if let Some(value) = document.get(&field.clone()) {
          document_metadata_fields.insert(field.clone(), value.clone());
        }
      }

      let mut document_payload: HashMap<String, Value> = document_embed_fields
        .clone()
        .into_iter()
        .chain(document_metadata_fields.clone())
        .collect();

      let embed_hash = Self::hash(Vec::from_iter(
        document_embed_fields
          .clone()
          .values()
          .map(|f| f.as_str().unwrap_or("").to_string()),
      ));
      let metadata_hash = Self::hash(Vec::from_iter(
        document_metadata_fields.clone().values().map(|f| {
          let value = match f {
            Value::String(s) => s.clone(),
            Value::Number(n) => n.to_string(),
            _ => "".to_string(),
          };
          value
        }),
      ));
      let embed_hash_key = "embed_hash".to_string();
      let metadata_hash_key = "metadata_hash".to_string();
      document_payload.insert(embed_hash_key.clone(), Value::String(embed_hash.clone()));
      document_payload.insert(
        metadata_hash_key.clone(),
        Value::String(metadata_hash.clone()),
      );
      // let wow = (embed_hash.clone(), metadata_hash.clone());
      document_payload.insert("base_id".to_string(), Value::String(id.clone().to_string()));
      upsert_hash_keys.push((embed_hash.clone(), metadata_hash.clone()));

      // let maybe_point = get_point(id.to_string()).await;
      // if let Ok(point) = maybe_point {
      //   if let Some(result) = point.result {
      //     let found_embed_hash = result
      //       .payload
      //       .get(&embed_hash_key)
      //       .unwrap()
      //       .as_str()
      //       .unwrap();
      //     let found_embed_metadata = result
      //       .payload
      //       .get(&metadata_hash_key)
      //       .unwrap()
      //       .as_str()
      //       .unwrap();
      //     if found_embed_hash == embed_hash.clone() && found_embed_metadata == metadata_hash.clone()
      //     {
      //       continue;
      //     }
      //   }
      // }
      upsert_payloads.push(document_payload);
      let parsed_embed_fields: Vec<String> = document_embed_fields
        .clone()
        .into_iter()
        .map(|(key, value)| format!("{}: {}", key, value.as_str().unwrap_or("").to_string()))
        .collect();

      let parsed_embed_fields_string = parsed_embed_fields.join(" ");
      upsert_embed_fields.push(parsed_embed_fields_string);

      upsert_ids.push(id.to_string())
    }
    if upsert_ids.len() > 0 {
      self
        .add_point_upsert_to_queue(
          upsert_ids,
          upsert_payloads,
          upsert_embed_fields,
          upsert_hash_keys,
          priority,
        )
        .await;
    }
  }

  async fn build_filters(
    maybe_filter: Option<Value>,
    documents: Option<Vec<Document>>,
  ) -> Option<Value> {
    // Construct the second filter based on document IDs
    let qdrant_filter = documents.map(|docs| {
      let doc_ids: Vec<u64> = docs.iter().filter_map(|doc| doc.id).collect();
      json!({
          "must": [{
              "key": "document_id",
              "match": {
                  "any": doc_ids
              }
          }]
      })
    });

    // Combine both filters
    match (maybe_filter, qdrant_filter) {
      (Some(filter1), Some(filter2)) => Some(json!({
          "must": [
              filter1,
              filter2
          ]
      })),
      (Some(filter1), None) => Some(filter1),
      (None, Some(filter2)) => Some(filter2),
      (None, None) => None,
    }
  }

  pub async fn semantic_search(
    &self,
    query: String,
    limit: usize,
    maybe_filter: Option<Value>,
    maybe_params: Option<Value>,
    maybe_with_vectors: Option<bool>,
    maybe_with_payload: Option<bool>,
    documents: Option<Vec<Document>>,
  ) -> Result<Vec<SemanticSearchResult>, Error> {
    let mut qdrant_filter = None;
    if documents.is_some() {
      qdrant_filter = documents.map(|docs| {
        let doc_ids: Vec<u64> = docs.iter().filter_map(|doc| doc.id).collect();
        serde_json::json!({
          "must": [{
            "key": "document_id",
            "match": {
              "any": doc_ids
            }
          }]
        })
      });
    } else {
      qdrant_filter = maybe_filter.clone();
    }

    match self.embed(vec![query]).await {
      Ok(embeddings) => {
        let vector = &embeddings[0];
        let response = search_points(
          vector.clone(),
          limit,
          qdrant_filter,
          maybe_params,
          maybe_with_vectors,
          Some(true), // maybe_with_payload,
        )
        .await;
        match response {
          Ok(response) => {
            let mut results = Vec::new();
            let groups = response.result.groups;
            for item in groups {
              let mut chunk_ids = Vec::new();
              let mut payloads: Vec<Value> = vec![];
              let id = item.hits[0].id.clone();
              let score = item.hits[0].score.clone();
              for hit in item.hits.into_iter() {
                let chunk_id = hit
                  .payload
                  .get("chunk_id")
                  .map(|chunk_id| chunk_id.as_u64())
                  .flatten();
                if let Some(chunk_id) = chunk_id {
                  println!("SS CHUNK ID: {}", chunk_id);
                  chunk_ids.push(chunk_id);
                }
                payloads.push(hit.payload);
              }
              let document_id = payloads[0].get("document_id").unwrap().as_u64();
              println!("SS for DOC ID: {:?}", document_id);
              results.push(SemanticSearchResult {
                id,
                score,
                payloads,
                chunk_ids,
                document_id: document_id.unwrap(),
              });
            }
            Ok(results)
          }
          Err(error) => Err(Error::KSError(error.to_string())),
        }
      }
      Err(error) => Err(Error::KSError(error.to_string())),
    }
  }

  pub async fn add_handle_embed_finish_to_queue(&self, connection: ConnectionsEnum, priority: u16) {
    let queue_item = QueueItem {
      action: QueueAction::HandleFinishEmbedding,
      payload: Some(QueueItemPayload::HandleFinishEmbedding(
        QueueItemFinishEmbeddingPayload { connection },
      )),
      retries: 1,
    };
    let mut queue = self.queue.lock().await;
    queue.push(queue_item, priority);
  }

  pub async fn handle_embed_finish(&self, payload: QueueItemFinishEmbeddingPayload) {
    ConnectionsData::lock_and_set_connection_is_syncing(
      self.connections_data.clone(),
      payload.connection.clone(),
      false,
    )
    .await;
  }

  async fn add_point_upsert_to_queue(
    &self,
    ids: Vec<String>,
    payloads: Vec<HashMap<String, Value>>,
    embed_fields: Vec<String>,
    hashes: Vec<(String, String)>,
    priority: u16,
  ) {
    let queue_item = QueueItem {
      action: QueueAction::UpsertPoints,
      payload: Some(QueueItemPayload::Embedding(QueueItemEmbeddingPayload {
        ids,
        payloads,
        hashes,
        embed_fields,
      })),
      retries: 3,
    };
    let mut queue = self.queue.lock().await;
    queue.push(queue_item, priority);
  }

  async fn add_create_collection_to_queue(&self, priority: u16) {
    let queue_item = QueueItem {
      action: QueueAction::CreateCollection,
      payload: None,
      retries: 3,
    };
    let mut queue = self.queue.lock().await;
    queue.push(queue_item, priority);
  }

  fn hash(fields: Vec<String>) -> String {
    let mut cloned_fields = fields.clone();
    cloned_fields.sort();
    digest(cloned_fields.join(""))
  }

  async fn handle_queue_item(&self, queue_item: QueueItem) -> Result<(), String> {
    if queue_item.action == QueueAction::CreateCollection {
      return match self.create_collection().await {
        Ok(_) => Ok(()),
        Err(error) => Err(error.to_string()),
      };
    }
    if queue_item.action == QueueAction::UpsertPoints {
      return match queue_item.payload.unwrap() {
        QueueItemPayload::Embedding(payload) => {
          self
            .upsert_points(
              payload.ids,
              payload.payloads,
              payload.embed_fields,
              payload.hashes,
            )
            .await;
          Ok(())
        }
        _ => Err(String::from("Invalid payload")),
      };
    }
    if queue_item.action == QueueAction::HandleFinishEmbedding {
      return match queue_item.payload.unwrap() {
        QueueItemPayload::HandleFinishEmbedding(payload) => {
          self.handle_embed_finish(payload).await;
          Ok(())
        }
        _ => Err(String::from("Invalid payload")),
      };
    }
    Err(String::from("Not implemented"))
  }

  pub async fn clear_queue(&self) {
    let mut queue = self.queue.lock().await;
    queue.clear();
  }

  async fn start_embed_worker(&self) {
    let queue = self.queue.clone();
    let self_clone = self.clone();

    tauri::async_runtime::spawn(async move {
      loop {
        let is_chatting: bool = self_clone
          .is_chatting
          .lock()
          .await
          .load(Ordering::Relaxed)
          .into();

        if is_chatting {
          tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
          continue;
        }

        let item = {
          let mut queue = queue.lock().await;
          queue.pop()
        };

        match item {
          Some((queue_item, priority)) => {
            log::debug!("Embedding queue size: {:?}", queue.lock().await.len());
            if let Err(e) = self_clone.handle_queue_item(queue_item.clone()).await {
              log::error!("Error processing queue_item {:?} - {:?} ", queue_item, e);
              if queue_item.retries <= 1 {
                continue;
              }
              tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
              let mut queue = queue.lock().await;
              queue.push(
                QueueItem {
                  action: queue_item.action.clone(),
                  payload: queue_item.payload.clone(),
                  retries: queue_item.retries - 1,
                },
                priority,
              );
            }
          },
          None => {
            // No items in queue, sleep for a while
            tokio::time::sleep(tokio::time::Duration::from_millis(5000)).await;
          }
        }
      }
    });
  }

  fn start(&self, semantic_service: Arc<Mutex<Option<SemanticService>>>) {
    let semantic_service_clone = self.clone();
    tauri::async_runtime::spawn(async move {
      semantic_service_clone.start_embed_worker().await;
      semantic_service_clone
        .add_create_collection_to_queue(1)
        .await;
      let mut locked_semantic_service = semantic_service.lock().await;
      *locked_semantic_service = Some(semantic_service_clone);
    });
  }
}

pub fn start_embed_service(
  embedder_path: PathBuf,
  is_chatting: Arc<Mutex<AtomicBool>>,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
  app_handle: tauri::AppHandle,
  connections_data: Arc<Mutex<ConnectionsData>>,
) -> SemanticService {
  let service = SemanticService::new(embedder_path, is_chatting, app_handle, connections_data);
  service.start(semantic_service);
  service
}

#[derive(Deserialize, Debug)]
struct SemanticSearchRequest {
  query: String,
  documents: Vec<DisplayDocument>,
  data_sources: Vec<String>,
  top: usize,
}

#[derive(Serialize)]
struct SemanticSearchResponseItem {
  id: String,
  score: f32,
  payload: Value,
  chunk_id: u64,
  document_id: u64,
}

#[derive(Serialize)]
struct SemanticSearchResponse {
  display_documents: Vec<DisplayDocument>,
  success: bool,
}

#[derive(Serialize)]
struct SemanticClearQueueResponse {
  success: bool,
}

fn construct_documents_filter(documents: Vec<DisplayDocument>) -> Option<Value> {
  if documents.is_empty() {
    return None;
  }

  let doc_ids: Vec<u64> = documents.iter().map(|doc| doc.document_id).collect();

  Some(json!({
      "must": [{
          "key": "document_id",
          "match": {
              "any": doc_ids
          }
      }]
  }))
}

fn construct_data_sources_filter(data_sources: Vec<String>) -> Option<Value> {
  if data_sources.is_empty() {
    return None;
  }

  Some(json!({
      "must": [{
          "key": "type",
          "match": {
              "any": data_sources
          }
      }]
  }))
}

#[post("/api/knapsack/semantic_search")]
pub async fn semantic_search(
  payload: Json<SemanticSearchRequest>,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
) -> impl Responder {
  // let maybe_locked_semantic_service = semantic_service.lock().await;
  // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();
  // let query = payload.query.clone();
  // let top = payload.top.clone();
  // let doc_filter = construct_documents_filter(payload.documents.clone());
  // let source_filter = construct_data_sources_filter(payload.data_sources.clone());

  // let filter = match (doc_filter, source_filter) {
  //   (Some(f1), Some(f2)) => Some(json!({
  //     "must": [
  //       f1["must"][0],
  //       f2["must"][0]
  //     ]
  //   })),
  //   (Some(f1), None) => Some(f1),
  //   (None, Some(f2)) => Some(f2),
  //   (None, None) => None,
  // };

  // let semantic_search_results: Vec<SemanticSearchResult> = match locked_semantic_service
  //   .semantic_search(query, top, filter, None, None, Some(true), None)
  //   .await
  // {
  //   Ok(response) => response,
  //   Err(error) => {
  //     log::error!("failed to do semantic search{:?}", error);
  //     return actix_web::HttpResponse::BadRequest().json(SemanticSearchResponse {
  //       success: false,
  //       display_documents: vec![],
  //     });
  //   }
  // };

  let mut display_documents = Vec::new();
  // for ss_result in semantic_search_results {
  //   let document = match Document::find_by_id(ss_result.document_id) {
  //     Ok(Some(d)) => d,
  //     _ => continue,
  //   };
  //   let knowledge = match document.as_knowledge_snippet() {
  //     Ok(k) => k,
  //     _ => continue,
  //   };
  //   display_documents.push(DisplayDocument {
  //     document_id: document.id.expect("Document id not found"),
  //     title: knowledge.get_title(),
  //     summary: Some(knowledge.get_summary()),
  //     document_type: knowledge.get_document_type(),
  //     uri: knowledge.get_hyperlink(),
  //   })
  // }
  let response = SemanticSearchResponse {
    success: true,
    display_documents,
  };
  return actix_web::HttpResponse::Ok().json(response);
}
