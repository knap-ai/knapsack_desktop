use crate::connections::api::ConnectionsEnum;
use crate::db::models::drive_document::{self, create_drive_document};
use crate::memory::text_splitter::TextSplitter;
use crate::ConnectionsData;
use actix_web::web::Data;
use actix_web::{error, get, post, web::Json, HttpRequest, HttpResponse, Responder};
use chrono::{Duration, Utc};
use google_calendar3::hyper;
use google_calendar3::hyper_rustls;
use google_drive3::api::File;
use google_drive3::DriveHub;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::{Mutex, Semaphore};

use crate::constants::EMBEDDING_BATCH_SIZE;
use crate::db::models::{
  drive_document::DriveDocument, local_file::LocalFile,
  user_connection::UserConnection,
};
use crate::error::Error;
use crate::local_fs;
use crate::memory::semantic::SemanticService;

use crate::utils::log::knap_log_error;

use super::auth::refresh_connection_token;
use super::constants::GOOGLE_DRIVE_SCOPE;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchGoogleDriveResponse {
  success: bool,
  message: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FetchGoogleDriveParams {
  email: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchGoogleDriveMimeTypesResponse {
  success: bool,
  error: Option<String>,
  mime_types: Option<Vec<String>>,
}

lazy_static! {
  static ref DRIVE_MIME_TYPES_EXPORTABLE_TO_TXT: Vec<&'static str> = vec![
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.kix",
    "application/vnd.google-apps.presentation",
  ];
  static ref  GOOGLE_MIME_TYPES: Vec<&'static str> = vec![
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.kix",
  "application/vnd.google-apps.presentation",
  "application/vnd.google-apps.spreadsheet",
];

static ref MIMETYPE_EXTENSION_MAPPING: HashMap<&'static str, &'static str> = HashMap::from([
  ("application/vnd.google-apps.document", "txt"),
  ("application/vnd.google-apps.kix", "txt"),
  ("application/vnd.google-apps.presentation", "txt"),
  ("text/plain", "txt"),
  ("application/rtf", "txt"),
  ("application/msword", "doc"),
  ("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "doc"),
  ("application/vnd.openxmlformats-officedocument.wordprocessingml.template", "doc"),
  ("application/vnd.ms-word.document.macroEnabled.12", "doc"),
  ("application/vnd.ms-word.template.macroEnabled.12", "doc"),
  ("application/vnd.oasis.opendocument.text", "doc"),
  ("application/vnd.ms-powerpoint", "pptx"),
  ("application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"),
  ("application/vnd.openxmlformats-officedocument.presentationml.template", "pptx"),
  ("application/vnd.openxmlformats-officedocument.presentationml.slideshow", "pptx"),
  ("application/vnd.ms-powerpoint.addin.macroEnabled.12", "pptx"),
  ("application/vnd.ms-powerpoint.presentation.macroEnabled.12", "pptx"),
  ("application/vnd.ms-powerpoint.template.macroEnabled.12", "pptx"),
  ("application/vnd.ms-powerpoint.slideshow.macroEnabled.12", "pptx"),
  ("application/vnd.oasis.opendocument.presentation", "pptx"),
  ("application/pdf", "pdf"),
  ("application/vnd.google-apps.spreadsheet", "xlsx"),
  ("application/vnd.ms-excel", "xlsx"),
  ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"),
  ("application/vnd.openxmlformats-officedocument.spreadsheetml.template", "xlsx"),
  ("application/vnd.ms-excel.sheet.macroEnabled.12", "xlsx"),
  ("application/vnd.ms-excel.template.macroEnabled.12", "xlsx"),
  ("application/vnd.ms-excel.addin.macroEnabled.12", "xlsx"),
  ("application/vnd.ms-excel.sheet.binary.macroEnabled.12", "xlsx"),
  ("application/vnd.oasis.opendocument.spreadsheet", "xlsx"),
]);

static ref  DRIVE_ALLOWED_MIME_TYPES: Vec<&'static str> = vec![
  // documents
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  "application/vnd.ms-word.document.macroEnabled.12",
  "application/vnd.ms-word.template.macroEnabled.12",
  "application/vnd.oasis.opendocument.text",
  // spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
  "application/vnd.ms-excel.sheet.macroEnabled.12",
  "application/vnd.ms-excel.template.macroEnabled.12",
  "application/vnd.ms-excel.addin.macroEnabled.12",
  "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
  "application/vnd.oasis.opendocument.spreadsheet",
  // Slides
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.presentationml.template",
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  "application/vnd.ms-powerpoint.addin.macroEnabled.12",
  "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  "application/vnd.ms-powerpoint.template.macroEnabled.12",
  "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
  "application/vnd.oasis.opendocument.presentation",
  // pdf
  "application/pdf",
  // text
  "text/plain",
  "application/rtf",
  // drive files
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.kix",
  "application/vnd.google-apps.presentation",
  "application/vnd.google-apps.spreadsheet",
];
}

#[derive(Deserialize, Clone)]
struct GoogleDriveFilesRequest {
  id: String,
  name: String,
  mime_type: String,
}

#[derive(Deserialize, Clone)]
struct FetchGoogleDriveFileRequest {
  files: Vec<GoogleDriveFilesRequest>,
}

#[derive(Serialize)]
struct FetchGoogleDriveFileResponse {
  success: bool,
  error: Option<String>,
  paths: Option<Vec<String>>,
}

pub async fn embed_drive_document(
  drive_id: &str,
  email: &str,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
) -> Result<(), Error> {
  // let user_connection = UserConnection::find_by_user_email_and_scope(
  //   email.to_string(),
  //   String::from(GOOGLE_DRIVE_SCOPE),
  // )?;
  // let access_token = refresh_connection_token(
  //   user_connection.clone(),
  // )
  // .await?;
  // let hub = DriveHub::new(
  //   hyper::Client::builder().build(
  //     hyper_rustls::HttpsConnectorBuilder::new()
  //       .with_native_roots()
  //       .unwrap()
  //       .https_or_http()
  //       .enable_http1()
  //       .build(),
  //   ),
  //   access_token,
  // );
  // let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  // let temp_dir = home_dir.join("knapsack_temp");
  // fs::create_dir_all(temp_dir.clone()).unwrap();

  // let result = hub.files().get(&drive_id).doit().await;

  // if let Err(e) = result {
  //   log::error!("Error fetching file: {:?}", e);
  //   return Err(Error::KSError("Error fetching file".into()));
  // }
  // let (_response, file) = result.unwrap();

  // let drive_document = get_or_create_drive_document_from_file(&file, &temp_dir, &hub).await;
  // let documents = drive_document.get_documents();
  // let maybe_locked_semantic_service = semantic_service.lock().await;
  // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();
  // let attrs = DriveDocument::get_attrs();
  // locked_semantic_service
  //   .learn(documents, attrs.clone(), 2)
  //   .await;
  Ok(())
}

async fn get_drive_file_content(
  mime_type: String,
  id: String,
  temp_dir: PathBuf,
  hub: DriveHub<hyper_rustls::HttpsConnector<hyper::client::HttpConnector>>,
) -> Option<Vec<String>> {
  let path = temp_dir.join(format!(
    "{}.{}",
    id.clone(),
    MIMETYPE_EXTENSION_MAPPING
      .get(&mime_type.as_str())
      .unwrap_or(&"txt")
  ));

  if GOOGLE_MIME_TYPES.contains(&mime_type.as_str()) {
    let mut export_mime_type = "text/plain".to_string();
    if !DRIVE_MIME_TYPES_EXPORTABLE_TO_TXT.contains(&&mime_type.as_str()) {
      export_mime_type = "text/csv".to_string();
    }
    let export_result = hub.files().export(&id, &export_mime_type).doit().await;
    return match export_result {
      Err(e) => {
        println!("Export {id} failed {:?}", e);
        None
      }
      Ok(res) => {
        let (_, body) = res.into_parts();
        let bytes = hyper::body::to_bytes(body).await.unwrap();
        let result = String::from_utf8(bytes.into_iter().collect()).expect("");
        let splitter = TextSplitter::default();
        let chunks = splitter.split_text(&result);
        Some(chunks)
      }
    };
  }
  let export_result = hub.files().get(&id).param("alt", "media").doit().await;
  match export_result {
    Err(e) => {
      println!("Download {id} failed {:?}", e);
      None
    }
    Ok(res) => {
      let (_, body) = res.0.into_parts();
      let bytes = hyper::body::to_bytes(body).await.unwrap();
      fs::write(path.clone(), bytes.clone()).unwrap();
      let local_temp_file = LocalFile {
        id: None,
        filename: id.clone(),
        path: path.to_str().unwrap().to_string(),
        file_size: bytes.len() as u64,
        date_modified: chrono::Utc::now().timestamp() as u64,
        date_created: Some(chrono::Utc::now().timestamp() as u64),
        title: "".to_string(),
        summary: None,
        checksum: None,
        timestamp: None,
      };
      match local_fs::read_file_contents(&local_temp_file) {
        Ok(summary) => {
          fs::remove_file(path).unwrap();
          // TODO: implement chunking for DriveDocument.
          if summary.len() > 0 {
            return Some(summary.clone());
          }
          None
        }
        Err(error) => {
          log::error!("Could not open file: {:?}", error);
          None
        }
      }
    }
  }
}

pub async fn get_or_create_drive_document_from_file(
  file: &File,
  temp_dir: &PathBuf,
  hub: &DriveHub<hyper_rustls::HttpsConnector<hyper::client::HttpConnector>>,
) -> DriveDocument {
  let mime_type = file.mime_type.clone().unwrap();
  let drive_id = file.id.clone().unwrap();
  let filename = file.name.clone().unwrap();
  let file_size = file.size.clone().unwrap_or(0) as u64;
  let date_created = file.created_time.unwrap_or(chrono::Utc::now()).timestamp() as u64;
  let date_modified = file.modified_time.unwrap_or(chrono::Utc::now()).timestamp() as u64;
  let checksum = file
    .md5_checksum
    .clone()
    .or(file.version.clone().map(|f| f.to_string()));
  let existing_drive_document = DriveDocument::find_by_drive_id(&drive_id.clone())
    .ok()
    .flatten();
  let url = file.web_view_link.clone().unwrap_or("".to_string());
  let maybe_content =
    get_drive_file_content(mime_type, drive_id.clone(), temp_dir.clone(), hub.clone()).await;

  if existing_drive_document.is_some() {
    let mut drive_document = existing_drive_document.unwrap().clone();
    drive_document.content_chunks = maybe_content;
    return drive_document;
  }

  let mut drive_document = DriveDocument {
    id: None,
    drive_id,
    filename,
    file_size,
    date_created,
    date_modified,
    summary: String::from(""),
    checksum: checksum.unwrap_or("0".to_string()),
    url,
    timestamp: None,
    content_chunks: maybe_content,
  };

  let insert_result = drive_document.create();
  create_drive_document(drive_document.id.unwrap(), drive_document.checksum.clone());
  if let Err(e) = insert_result {
    log::error!("Error inserting drive document: {:?}", e);
  }
  drive_document
}

pub async fn fetch_drive(
  access_token: String,
  _semantic_service: Arc<Mutex<Option<SemanticService>>>,
  user_connection: UserConnection,
) -> Result<(), Error> {
  let mut maybe_next_page_token: Option<String> = None;
  let hub = DriveHub::new(
    hyper::Client::builder().build(
      hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .unwrap()
        .https_or_http()
        .enable_http1()
        .build(),
    ),
    access_token,
  );
  let days_in_month = 30;
  let limit_date = chrono::Utc::now() - chrono::Duration::days(days_in_month);
  let query = format!(
    "({}) and (modifiedTime > '{}')",
    DRIVE_ALLOWED_MIME_TYPES
      .clone()
      .into_iter()
      .map(|f| format!("mimeType='{f}'"))
      .collect::<Vec<_>>()
      .join(" or "),
    limit_date.format("%Y-%m-%dT%H:%M:%S")
  );
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let temp_dir = home_dir.join("knapsack_temp");
  fs::create_dir_all(temp_dir.clone()).unwrap();
  // let attrs = DriveDocument::get_attrs();
  loop {
    let mut list_request = hub
        .files()
        .list()
        .order_by("createdTime desc")
        .q(&query)
        .param(
          "fields",
          "nextPageToken,files(id,name,md5Checksum,version,createdTime,modifiedTime,size,mimeType,webViewLink)",
        )
        .page_size(500);
    if let Some(next_page_token) = maybe_next_page_token {
      list_request = list_request.page_token(&next_page_token);
    }
    let result = list_request.doit().await.unwrap();
    let file_list = result.1.clone();
    let mut tasks = vec![];
    let semaphore = Arc::new(Semaphore::new(5));
    let drive_documents = Arc::new(Mutex::new(Vec::new()));
    maybe_next_page_token = file_list.clone().next_page_token;
    for file in file_list.files.unwrap() {
      let semaphore_clone = Arc::clone(&semaphore);
      let temp_dir_clone = temp_dir.clone();
      let hub_clone = hub.clone();
      let drive_documents_clone = drive_documents.clone();
      let task = tauri::async_runtime::spawn(async move {
        let _permit = semaphore_clone.acquire().await.unwrap();
        let drive_document =
          get_or_create_drive_document_from_file(&file, &temp_dir_clone, &hub_clone).await;
        drive_documents_clone.lock().await.push(drive_document);
      });
      tasks.push(task);
    }
    for task in tasks {
      task.await.unwrap();
    }

    let mut sliced_documents: Vec<HashMap<String, serde_json::Value>> = Vec::new();
    for document in drive_documents.lock().await.iter() {
      sliced_documents.append(&mut document.get_documents());
    }

    // let drive_doc_batches = sliced_documents
    //   .chunks(EMBEDDING_BATCH_SIZE)
    //   .map(|chunk| chunk.to_vec())
    //   .collect::<Vec<_>>();

    // let maybe_locked_semantic_service = semantic_service.lock().await;
    // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();

    // for drive_doc_batch in drive_doc_batches {
    //   locked_semantic_service
    //     .learn(drive_doc_batch.clone(), attrs.clone(), 1)
    //     .await;
    // }
    // drop(locked_semantic_service);
    // drop(maybe_locked_semantic_service);
    if maybe_next_page_token == None {
      break;
    }
  }

  // let maybe_locked_semantic_service = semantic_service.lock().await;
  // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();

  // locked_semantic_service
  //   .add_handle_embed_finish_to_queue(ConnectionsEnum::GoogleDrive, 1)
  //   .await;
  let _ = fs::remove_dir_all(temp_dir);
  UserConnection::update_last_sync_by_id(user_connection.id.unwrap(), limit_date);
  Ok(())
}

async fn start_drive_data_fetching(
  email: String,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
  connections_data: Arc<Mutex<ConnectionsData>>,
) -> Result<(), Error> {
  let user_connection =
    match UserConnection::find_by_user_email_and_scope(email.clone(), String::from(GOOGLE_DRIVE_SCOPE)) {
      Ok(connection) => connection,
      Err(error) => {
        let msg = format!("Failed to find user connection for user: {}", email);
        knap_log_error(msg, Some(error), Some(true));
        return Err(Error::KSError("Fail to get user connection".to_string()))
      }
    };
  let access_token = match refresh_connection_token(
    email.clone(),
    user_connection.clone(),
  )
  .await{
    Ok(token) => token,
    Err(error) => {
      let msg = format!("Failed to refresh access token in google drive for user: {}", email);
      knap_log_error(msg, Some(error), None);
      return Err(Error::KSError("Failed to refresh connection token".to_string()))
    }
  };

  tauri::async_runtime::spawn(async move {
    if ConnectionsData::lock_and_get_connection_is_syncing(
      connections_data.clone(),
      ConnectionsEnum::GoogleDrive,
    )
    .await
    {
      return;
    }
    ConnectionsData::lock_and_set_connection_is_syncing(
      connections_data.clone(),
      ConnectionsEnum::GoogleDrive,
      true,
    )
    .await;
    let result = fetch_drive(access_token, semantic_service, user_connection.clone()).await;
    if let Err(error) = result {
      let msg = format!("Failed to fetch drive files: {}", email);
      knap_log_error(msg, Some(error), Some(true));
      ConnectionsData::lock_and_set_connection_is_syncing(
        connections_data,
        ConnectionsEnum::GoogleDrive,
        false,
      )
      .await;
    }
  });
  Ok(())
}

#[get("/api/knapsack/connections/google/drive")]
async fn fetch_google_drive_api(
  req: HttpRequest,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
  connections_data: Data<Arc<Mutex<ConnectionsData>>>,
) -> impl Responder {
  let params =
    actix_web::web::Query::<FetchGoogleDriveParams>::from_query(req.query_string()).unwrap();
  let unwrapped_semenatic_service = semantic_service.get_ref().clone();
  let unwrapped_connections_data = connections_data.get_ref().clone();
  match start_drive_data_fetching(
    params.email.clone(),
    unwrapped_semenatic_service,
    unwrapped_connections_data,
  )
  .await
  {
    Ok(_) => HttpResponse::Ok().json(FetchGoogleDriveResponse { success: true, message: "Fetching drive data".to_string() }),
    Err(err) => HttpResponse::BadRequest().json(FetchGoogleDriveResponse { success: false, message: format!("{:?}", err) }),
  }
}

async fn create_temp_drive_file(
  mime_type: String,
  id: String,
  name: String,
  email: String,
) -> Option<String> {
  let user_connection =
    UserConnection::find_by_user_email_and_scope(email.clone(), String::from(GOOGLE_DRIVE_SCOPE))
      .ok()?;
  let access_token = refresh_connection_token(
    email.clone(),
    user_connection.clone(),
  )
  .await
  .ok()?;
  let hub = DriveHub::new(
    hyper::Client::builder().build(
      hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .unwrap()
        .https_or_http()
        .enable_http1()
        .build(),
    ),
    access_token,
  );
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let temp_dir = home_dir.join("knapsack_drive_temp");
  fs::create_dir_all(temp_dir.clone()).unwrap();
  if GOOGLE_MIME_TYPES.contains(&mime_type.as_str()) {
    let mut export_mime_type = "text/plain".to_string();
    let extension = "txt";
    if !DRIVE_MIME_TYPES_EXPORTABLE_TO_TXT.contains(&&mime_type.as_str()) {
      export_mime_type = "text/csv".to_string();
    }
    let export_result = hub.files().export(&id, &export_mime_type).doit().await;
    return match export_result {
      Err(e) => {
        log::error!("Export {id} failed {:?}", e);
        None
      }
      Ok(res) => {
        let (_, body) = res.into_parts();
        let bytes = hyper::body::to_bytes(body).await.unwrap();
        let full_name = format!("{}.{}", name, extension);
        let path = temp_dir.join(full_name);
        fs::write(path.clone(), bytes.clone()).unwrap();
        let path_string = path.to_str().unwrap().to_string();
        Some(path_string)
      }
    };
  }
  let export_result = hub.files().get(&id).param("alt", "media").doit().await;
  match export_result {
    Err(e) => {
      log::error!("Download {id} failed {:?}", e);
      None
    }
    Ok(res) => {
      let (_, body) = res.0.into_parts();
      let bytes = hyper::body::to_bytes(body).await.unwrap();
      let path = temp_dir.join(name);
      fs::write(path.clone(), bytes.clone()).unwrap();
      let path_string = path.to_str().unwrap().to_string();
      Some(path_string)
    }
  }
}

#[post("/api/knapsack/connections/google/drive/files")]
async fn fetch_google_drive_files(
  req: HttpRequest,
  data: Json<FetchGoogleDriveFileRequest>,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
) -> Result<HttpResponse, error::Error> {
  let params =
    actix_web::web::Query::<FetchGoogleDriveParams>::from_query(req.query_string()).unwrap();
  let email = params.email.clone();
  let attrs = DriveDocument::get_attrs();
  let user_connection =
    UserConnection::find_by_user_email_and_scope(email.clone(), String::from(GOOGLE_DRIVE_SCOPE))
      .unwrap();
  let access_token = refresh_connection_token(
    email.clone(),
    user_connection.clone(),
  )
  .await
  .unwrap();
  let hub = DriveHub::new(
    hyper::Client::builder().build(
      hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .unwrap()
        .https_or_http()
        .enable_http1()
        .build(),
    ),
    access_token,
  );
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let temp_dir = home_dir.join("knapsack_temp");
  fs::create_dir_all(temp_dir.clone()).unwrap();

  // let mut embedding_documents = vec![];
  let mut documents = vec![];
  for file in data.files.iter() {
    let (_response, file) = hub.files().get(&file.id).doit().await.unwrap();

    let drive_document = get_or_create_drive_document_from_file(&file, &temp_dir, &hub).await;
    let document =
      create_drive_document(drive_document.id.unwrap(), drive_document.checksum.clone());

    // embedding_documents.append(&mut drive_document.get_documents());

    documents.push(document);
  }
  // let drive_doc_batches = embedding_documents
  //   .chunks(EMBEDDING_BATCH_SIZE)
  //   .map(|chunk| chunk.to_vec())
  //   .collect::<Vec<_>>();

  // let maybe_locked_semantic_service = semantic_service.lock().await;
  // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();

  // for drive_doc_batch in drive_doc_batches {
  //   locked_semantic_service
  //     .learn(drive_doc_batch.clone(), attrs.clone(), 2)
  //     .await;
  // }
  Ok(HttpResponse::Ok().json(json!({ "success": true,  "data": documents })))
}

#[get("/api/knapsack/google/drive/mimeTypes")]
async fn fetch_google_drive_mime_types() -> Result<HttpResponse, error::Error> {
  Ok(
    HttpResponse::Ok().json(FetchGoogleDriveMimeTypesResponse {
      success: true,
      error: None,
      mime_types: Some(
        DRIVE_ALLOWED_MIME_TYPES
          .clone()
          .into_iter()
          .map(|s| s.to_string())
          .collect(),
      ),
    }),
  )
}

#[get("/api/knapsack/connections/google/drive/ids_by_email")]
async fn fetch_google_drive_documents_ids_shared_by_users(
  req: HttpRequest,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
  connections_data: Data<Arc<Mutex<ConnectionsData>>>,
) -> Result<HttpResponse, error::Error> {
  let params =
    actix_web::web::Query::<FetchGoogleDriveParams>::from_query(req.query_string()).unwrap();

  let emails = params.email.clone();
  let list_emails = emails.split(',').collect::<Vec<&str>>();
  let unwrapped_semenatic_service = semantic_service.get_ref().clone();
  let unwrapped_connections_data = connections_data.get_ref().clone();

  let ids = fetch_files_id_shared_between_users(
    list_emails,
  )
  .await
  .unwrap();

  let documents = DriveDocument::find_by_ids(ids).ok();
  let drive_documents = documents.unwrap();

  let mut drive_document_ids = Vec::new();

  for document in drive_documents {
    drive_document_ids.push(document.drive_id);
  }

  Ok(HttpResponse::Ok().json(json!({ "ids": drive_document_ids })))
}

async fn fetch_files_id_shared_between_users(
  emails: Vec<&str>,
) -> Result<Vec<String>, error::Error> {
  let user_connection = UserConnection::find_by_user_email_and_scope(
    emails[0].clone().to_string(),
    String::from(GOOGLE_DRIVE_SCOPE),
  )
  .unwrap();
  let access_token = refresh_connection_token(
    emails[0].clone().to_string(),
    user_connection.clone(),  
  )
  .await
  .unwrap();

  let hub = DriveHub::new(
    hyper::Client::builder().build(
      hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .unwrap()
        .https_or_http()
        .enable_http1()
        .build(),
    ),
    access_token,
  );

  let ninety_days_ago = Utc::now() - Duration::days(90);
  let formatted_date = ninety_days_ago.format("%Y-%m-%dT%H:%M:%S").to_string();

  let email_conditions = emails
    .iter()
    .flat_map(|email1| {
      emails.iter().filter_map(move |email2| {
        if email1 != email2 {
          Some(format!(
            "'{}' in readers and '{}' in owners",
            email1, email2
          ))
        } else {
          None
        }
      })
    })
    .collect::<Vec<_>>()
    .join(" or ");

  let query = format!(
    "({}) and (modifiedTime > '{}')",
    email_conditions, formatted_date
  );

  let mut file_names = Vec::new();
  let mut next_page_token: Option<String> = None;

  loop {
    let mut list_request = hub
      .files()
      .list()
      .q(&query)
      .param("fields", "nextPageToken, files(id, name)")
      .page_size(100);

    if let Some(token) = next_page_token {
      list_request = list_request.page_token(&token);
    }

    let result = list_request.doit().await;

    match result {
      Ok((_, file_list)) => {
        if let Some(files) = file_list.files {
          file_names.extend(files.into_iter().filter_map(|file| file.id));
        }
        next_page_token = file_list.next_page_token;
        if next_page_token.is_none() {
          break;
        }
      }
      Err(e) => {
        eprintln!("Error fetching files: {:?}", e);
        break;
      }
    }
  }

  Ok((file_names))
}
