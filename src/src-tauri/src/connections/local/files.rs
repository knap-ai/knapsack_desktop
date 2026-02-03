use crate::connections::api::ConnectionsEnum;
use crate::constants::EMBEDDING_BATCH_SIZE;
use actix_web::web::Data;
use actix_web::{get, HttpRequest, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::runtime::Handle;
use tokio::sync::Mutex;

use crate::db::models::local_file::LocalFile;
use crate::error::Error;
use crate::memory::semantic::SemanticService;
use std::fs::File;

use std::{
  path::Path,
  sync::{atomic::AtomicU16, Arc},
};

use crate::{local_fs, ConnectionsData};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchLocalFilesResponse {
  success: bool,
}

pub async fn create_local_file(abs_path: String) -> LocalFile {
  // Now, for the doc at abs_path, we get the filename,
  // path, file_size, date_modified, date_created, title,
  // summary. Summary will be empty string for now.
  let path = Path::new(&abs_path);
  let filename = path
    .file_name()
    .unwrap()
    .to_str()
    .expect("Couldn't get filename.");
  let f = File::open(&abs_path).expect("Couldn't open file.");
  let metadata = f.metadata().expect("Couldn't get file metadata.");
  let modified_time: SystemTime = metadata.modified().unwrap();
  let created_time: SystemTime = metadata.created().unwrap();

  let modified_time_since_epoch = modified_time
    .duration_since(UNIX_EPOCH)
    .expect("Time went backwards");
  let created_time_since_epoch = created_time
    .duration_since(UNIX_EPOCH)
    .expect("Time went backwards");

  let modified_timestamp = modified_time_since_epoch.as_secs();
  let created_timestamp = created_time_since_epoch.as_secs();

  LocalFile {
    id: None,
    filename: String::from(filename),
    path: abs_path.clone(),
    file_size: metadata.len(),
    date_modified: modified_timestamp,
    date_created: Some(created_timestamp),
    title: String::from(filename),
    summary: Some("".to_string()),
    checksum: None,
    timestamp: None,
  }
  .upsert()
  .unwrap()
}

pub async fn embed_local_file(
  file_path: &str,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
) {
  let file_document = create_local_file(String::from(file_path)).await;
  let local_file_get_docs_result = file_document.get_documents();
  // let maybe_locked_semantic_service = semantic_service.lock().await;
  // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();
  // let attrs = LocalFile::get_attrs();
  // locked_semantic_service
  //   .learn(local_file_get_docs_result, attrs, 2)
  //   .await;
}

async fn fetch_files(semantic_service: Arc<Mutex<Option<SemanticService>>>) -> Result<(), Error> {
  let files_progress = Arc::new(AtomicU16::new(0));
  let _doc_infos = local_fs::read_home_dir(&files_progress).expect("Couldn't get doc_paths.");
  // let mut documents = Vec::new();
  // for doc_info in doc_infos.iter() {
  //   let file_document = create_local_file(doc_info.path.clone()).await;
  //   let local_file_get_docs_result = file_document.get_documents();
  //   documents.extend(local_file_get_docs_result);
  // }

  // let chunks = documents
  //   .chunks(EMBEDDING_BATCH_SIZE)
  //   .map(|chunk| chunk.to_vec())
  //   .collect::<Vec<_>>();
  // let attrs = LocalFile::get_attrs();
  // let maybe_locked_semantic_service = semantic_service.lock().await;
  // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();

  // for chunk in chunks {
  //   locked_semantic_service
  //     .learn(chunk.clone(), attrs.clone(), 1)
  //     .await
  // }
  // locked_semantic_service
  //   .add_handle_embed_finish_to_queue(ConnectionsEnum::LocalFiles, 1)
  //   .await;
  Ok(())
}

async fn start_files_data_fetching(
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
  connections_data: Arc<Mutex<ConnectionsData>>,
  handle: Data<Arc<Handle>>,
) -> Result<(), Error> {
  handle.spawn(async move {
    if ConnectionsData::lock_and_get_connection_is_syncing(
      connections_data.clone(),
      ConnectionsEnum::LocalFiles,
    )
    .await
    {
      return;
    }
    ConnectionsData::lock_and_set_connection_is_syncing(
      connections_data.clone(),
      ConnectionsEnum::LocalFiles,
      true,
    )
    .await;
    let result = fetch_files(semantic_service).await;
    if let Err(_) = result {
      ConnectionsData::lock_and_set_connection_is_syncing(
        connections_data,
        ConnectionsEnum::LocalFiles,
        false,
      )
      .await;
    }
  });
  Ok(())
}

#[get("/api/knapsack/connections/local/files")]
async fn fetch_local_files_api(
  _req: HttpRequest,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
  connections_data: Data<Arc<Mutex<ConnectionsData>>>,
  handle: Data<Arc<Handle>>,
) -> impl Responder {
  let unwrapped_semenatic_service = semantic_service.get_ref().clone();
  let unwrapped_connections_data = connections_data.get_ref().clone();
  match start_files_data_fetching(
    unwrapped_semenatic_service,
    unwrapped_connections_data,
    handle,
  )
  .await
  {
    Ok(_) => HttpResponse::Ok().json(FetchLocalFilesResponse { success: true }),
    Err(_) => HttpResponse::BadRequest().json(FetchLocalFilesResponse { success: false }),
  }
}
