use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use crate::connections::api::ConnectionsEnum;
use crate::connections::google::constants::GOOGLE_GMAIL_SCOPE;
use crate::connections::utils::get_knapsack_api_connection;
use crate::constants::{EMBEDDING_BATCH_SIZE, GMAIL_DOWNLOADS_THREAD_POOL_SIZE};
use crate::db::models::user_connection::UserConnection;
use crate::memory::semantic::SemanticService;
use crate::utils::log::knap_log_error;
use crate::ConnectionsData;
use actix_web::web::Data;
use actix_web::{get, post, web::Json, HttpRequest, HttpResponse, Responder};
use google_gmail1::api::MessagePartBody;
use mailparse::dateparse;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
extern crate google_gmail1 as gmail1;

use crate::error::Error;

use crate::db::models::email::Email;

use super::auth::refresh_connection_token;
use super::https_client::get_https_client;

use tokio::sync::{Mutex, Semaphore};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchGoogleGmailResponse {
  success: bool,
  message: String,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct FetchGoogleGmailParams {
  email: String,
  account_email: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SetEmailReadResponse {
  message: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SetEmailReadResponseParams {
  email: String,
  account_email: Option<String>,
  message_id: String,
  extra_action: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct FetchEmailEventPayload {
  pub success: bool,
}

use chrono::{DateTime, Utc};
use gmail1::api::ModifyMessageRequest;
use gmail1::{chrono, hyper, hyper_rustls, Gmail};

use crate::spotlight::WINDOW_LABEL;
use tauri::Manager;

fn get_body_content(maybe_body: Option<MessagePartBody>) -> Option<String> {
  match maybe_body {
    Some(body) => match body.data {
      Some(data) => {
        if data.len() <= 1 {
          return None;
        }
        Some(String::from_utf8_lossy(&data).into_owned())
      }
      None => None,
    },
    None => None,
  }
}

fn parse_message_date(headers: &HashMap<String, String>, stable_fallback: Option<u64>) -> u64 {
  headers
    .get("date")
    .and_then(|value| dateparse(value).ok())
    .filter(|timestamp| *timestamp > 0)
    .and_then(|timestamp| u64::try_from(timestamp).ok())
    .or_else(|| stable_fallback.filter(|timestamp| *timestamp > 0))
    .unwrap_or(0)
}

#[cfg(test)]
mod gmail_message_tests {
  use super::*;

  #[test]
  fn malformed_or_missing_dates_use_the_stable_gmail_timestamp() {
    let malformed = HashMap::from([("date".to_string(), "not-a-date".to_string())]);
    let gmail_internal_date = 1_789_000_000_u64;

    assert_eq!(
      parse_message_date(&malformed, Some(gmail_internal_date)),
      gmail_internal_date
    );
    assert_eq!(
      parse_message_date(&HashMap::new(), Some(gmail_internal_date)),
      gmail_internal_date
    );
    assert_eq!(parse_message_date(&HashMap::new(), None), 0);
  }
}

pub async fn upsert_email_by_uid(
  email_uid: &str,
  access_token: &str,
  flag_update: bool,
  account_email: &str,
) -> Result<Email, Error> {
  let email_result = Email::find_by_uid(email_uid).ok().flatten();
  let existing_date = email_result.as_ref().map(|email| email.date);
  if let Some(email) = email_result {
    if email.thread_id.is_some() && !flag_update {
      return Ok(email);
    }
  }

  let hub = Gmail::new(get_https_client(), access_token.to_string());
  let result = hub.users().messages_get("me", email_uid).doit().await;

  let message = match result {
    Ok(response) => response.1,
    Err(_) => return Err(Error::KSError("Failed to fetch email".into())),
  };

  let stable_message_date = message
    .internal_date
    .and_then(|milliseconds| u64::try_from(milliseconds).ok())
    .map(|milliseconds| milliseconds / 1000)
    .filter(|timestamp| *timestamp > 0)
    .or(existing_date);
  let thread_id = message.thread_id.unwrap_or_default();

  let payload = message
    .payload
    .ok_or_else(|| Error::KSError("Gmail message has no payload".into()))?;
  let headers = payload.headers.unwrap_or_default();

  let mut content: String = get_body_content(payload.body).unwrap_or(String::from(""));

  if let Some(parts) = payload.parts {
    for subpart in parts {
      let mime_type = subpart.mime_type.unwrap_or(String::from(""));
      let body_content = get_body_content(subpart.body);
      if mime_type == "text/plain" {
        if let Some(text_content) = body_content {
          content = text_content;
          break;
        }
      }
      if mime_type == "text/html" {
        content = body_content.unwrap_or(content);
      }
      if mime_type == "multipart/alternative" {
        for part in subpart.parts.unwrap_or_default() {
          let part_mime_type = part.mime_type.unwrap_or_default();
          let body_content = get_body_content(part.body);
          if part_mime_type == "text/plain" {
            if let Some(text_content) = body_content {
              content = text_content;
              break;
            }
          }
          if part_mime_type == "text/html" {
            content = body_content.unwrap_or(content);
          }
        }
      }
    }
  }
  let mut hashed_headers = HashMap::new();
  for header in headers {
    if header.name.is_some() && header.value.is_some() {
      hashed_headers.insert(header.name.unwrap().to_lowercase(), header.value.unwrap());
    }
  }

  let is_starred = message
    .label_ids
    .as_ref()
    .map_or(false, |labels| labels.contains(&"STARRED".to_string()));

  let is_read = message
    .label_ids
    .as_ref()
    .map_or(true, |labels| !labels.contains(&"UNREAD".to_string()));

  let is_archived = message
    .label_ids
    .as_ref()
    .map_or(true, |labels| !labels.contains(&"INBOX".to_string()));

  let mut email_message = Email {
    id: None,
    body: content,
    email_uid: email_uid.to_string(),
    thread_id: Some(thread_id),
    subject: {
      let raw_subject = hashed_headers
        .get("subject")
        .unwrap_or(&String::from(""))
        .clone();
      // Decode RFC 2047 MIME encoded-words (e.g. =?UTF-8?B?...?=)
      let header_line = format!("Subject: {}", raw_subject);
      match mailparse::parse_header(header_line.as_bytes()) {
        Ok((parsed, _)) => parsed.get_value(),
        Err(_) => raw_subject,
      }
    },
    date: parse_message_date(&hashed_headers, stable_message_date),
    sender: hashed_headers
      .get("from")
      .unwrap_or(&String::from(""))
      .clone(),
    recipient: hashed_headers
      .get("to")
      .unwrap_or(&String::from(""))
      .clone(),
    cc: hashed_headers
      .get("cc")
      .unwrap_or(&String::from(""))
      .clone(),
    is_starred: Some(is_starred),
    is_read: Some(is_read),
    is_archived: Some(is_archived),
    is_deleted: Some(false),
    account_email: account_email.to_string(),
  };
  let email_message_creation_response = email_message.create();
  if let Err(error) = email_message_creation_response {
    log::error!("Failed to create email message {:?}", error);
  }
  Ok(email_message)
}

pub async fn embed_email(
  email_uid: &str,
  email: &str,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
) -> Result<(), Error> {
  let user_connection = UserConnection::find_by_user_email_and_scope(
    email.to_string(),
    String::from(GOOGLE_GMAIL_SCOPE),
  )?;
  let access_token =
    refresh_connection_token(email.clone().to_string(), user_connection.clone()).await?;

  let email = upsert_email_by_uid(email_uid, &access_token, false, email).await?;

  let documents = email.get_documents();

  // let maybe_locked_semantic_service = semantic_service.lock().await;
  // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();
  // let attrs = Email::get_attrs();
  // locked_semantic_service.learn(documents, attrs, 2).await;
  Ok(())
}

pub async fn fetch_gmail(
  access_token: String,
  user_connection: UserConnection,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
  days: u16,
  embedding_priority: u16,
  flag_update: bool,
  account_email: String,
) -> Result<(), Error> {
  let connection_id = user_connection
    .id
    .ok_or_else(|| Error::KSError("Gmail connection has no database id".into()))?;
  let mut maybe_next_page_token: Option<String> = None;
  let mut all_email_uuids = Vec::new();
  let hub = Gmail::new(
    hyper::Client::builder().build(
      hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .unwrap()
        .https_or_http()
        .enable_http1()
        .build(),
    ),
    access_token.clone(),
  );

  let limit_date = chrono::Utc::now() - chrono::Duration::days(days.into());
  let older_date = Arc::new(Mutex::new(chrono::Utc::now()));
  loop {
    let mut list_request = hub
      .users()
      .messages_list("me")
      .max_results(500)
      .q(&format!("after:{}", limit_date.format("%Y-%m-%d")));
    if let Some(next_page_token) = maybe_next_page_token {
      list_request = list_request.page_token(&next_page_token);
    }
    let response = list_request
      .doit()
      .await
      .map_err(|error| Error::KSError(format!("Failed to list Gmail messages: {error}")))?;
    let mut tasks = vec![];
    let semaphore = Arc::new(Semaphore::new(GMAIL_DOWNLOADS_THREAD_POOL_SIZE));
    maybe_next_page_token = response.1.next_page_token;

    let email_documents = Arc::new(Mutex::new(Vec::new()));
    let had_fetch_errors = Arc::new(AtomicBool::new(false));

    for message in response.1.messages.unwrap_or_default() {
      let semaphore_clone = Arc::clone(&semaphore);
      let access_token_clone = access_token.clone();
      let Some(message_id) = message.id else {
        knap_log_error(
          "Gmail list response contained a message without an id".to_string(),
          None,
          Some(true),
        );
        continue;
      };
      all_email_uuids.push(message_id.clone());
      let email_documents_clone = email_documents.clone();
      let account_email_clone = account_email.clone();
      let older_date_clone = older_date.clone();
      let had_fetch_errors_clone = had_fetch_errors.clone();
      let task = tauri::async_runtime::spawn(async move {
        let Ok(_permit) = semaphore_clone.acquire().await else {
          return;
        };
        let result = upsert_email_by_uid(
          &message_id,
          &access_token_clone,
          flag_update.clone(),
          &account_email_clone,
        )
        .await;
        match result {
          Ok(email_message) => {
            let mut oldest_date = older_date_clone.lock().await;
            if oldest_date.timestamp() as u64 > email_message.date {
              if let Some(dt) = DateTime::from_timestamp(email_message.date as i64, 0) {
                *oldest_date = dt;
              }
            }
            drop(oldest_date);
            email_documents_clone.lock().await.push(email_message);
          }
          Err(error) => {
            had_fetch_errors_clone.store(true, Ordering::Relaxed);
            let msg = format!("Failed to fetch emails: {:?}", error);
            knap_log_error(msg, Some(error), Some(true));
          }
        }
      });

      tasks.push(task);
    }

    for task in tasks {
      task.await?;
    }
    if had_fetch_errors.load(Ordering::Relaxed) {
      return Err(Error::KSError(
        "One or more Gmail messages could not be downloaded".into(),
      ));
    }

    let attrs = Email::get_attrs();
    let locked_email_docs = email_documents.lock().await;

    let mut sliced_documents: Vec<HashMap<String, serde_json::Value>> = Vec::new();
    for email_doc in locked_email_docs.iter() {
      sliced_documents.append(&mut email_doc.get_documents());
    }

    // let email_doc_batches = sliced_documents
    //   .chunks(EMBEDDING_BATCH_SIZE)
    //   .map(|chunk| chunk.to_vec())
    //   .collect::<Vec<_>>();

    // let maybe_locked_semantic_service = semantic_service.lock().await;
    // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();
    // for email_doc_batch in email_doc_batches {
    //   locked_semantic_service
    //     .learn(email_doc_batch.clone(), attrs.clone(), embedding_priority)
    //     .await;
    // }

    // drop(locked_semantic_service);

    if maybe_next_page_token == None {
      break;
    }
  }

  Email::mark_deleted_emails(&all_email_uuids, 3, &account_email).await?;

  let oldest_synced_date = *older_date.lock().await;
  UserConnection::update_last_sync_by_id(connection_id, oldest_synced_date)?;
  Ok(())
}

async fn start_gmail_data_fetching(
  email: String,
  account_email: String,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
  connections_data: Arc<Mutex<ConnectionsData>>,
  app_handle: tauri::AppHandle,
) -> Result<(), Error> {
  let user_conn = match get_knapsack_api_connection(email.clone()) {
    Ok(connection) => connection,
    Err(error) => {
      return Err(Error::KSError("Fail to get user connection".to_string()));
    }
  };

  let user_connection = match UserConnection::find_by_user_email_scope_and_calendar_account(
    email.clone(),
    String::from(GOOGLE_GMAIL_SCOPE),
    account_email.clone(),
  ) {
    Ok(connection) => connection,
    Err(error) => {
      log::error!("Failed to find user connection: {:?}", error);
      let msg = format!(
        "Failed to find Gmail connection for user {} / account {}",
        email, account_email
      );
      knap_log_error(msg, Some(error), None);
      return Err(Error::KSError("Fail to get user connection".to_string()));
    }
  };
  let access_token = match refresh_connection_token(email.clone(), user_connection.clone()).await {
    Ok(token) => token,
    Err(error) => {
      let msg = format!(
        "Failed to find user connection in google gmail for user: {}",
        email
      );
      knap_log_error(msg, Some(error), Some(true));
      return Err(Error::KSError("Fail to refresh access token".to_string()));
    }
  };
  if !ConnectionsData::lock_and_try_begin_account_sync(
    connections_data.clone(),
    ConnectionsEnum::GoogleGmail,
    &account_email,
  )
  .await
  {
    return Ok(());
  }
  tauri::async_runtime::spawn(async move {
    let fetching_day_result = fetch_gmail(
      access_token.clone(),
      user_connection.clone(),
      semantic_service.clone(),
      3,
      3,
      true,
      account_email.clone(),
    )
    .await;

    let sync_succeeded = fetching_day_result.is_ok();
    if let Some(window) = app_handle.get_window(WINDOW_LABEL) {
      window.emit(
        "finish_fetch_email",
        FetchEmailEventPayload {
          success: sync_succeeded,
        },
      );
    }

    if !sync_succeeded {
      log::error!("Failed to fetch gmail");
      let msg = format!("Failed to fetch gmail: {}", email);

      if let Err(day_error) = fetching_day_result {
        knap_log_error(format!("{} (Day fetch)", msg), Some(day_error), Some(true));
      }
    }

    ConnectionsData::lock_and_finish_account_sync(
      connections_data,
      ConnectionsEnum::GoogleGmail,
      &account_email,
    )
    .await;
  });
  Ok(())
}

#[get("/api/knapsack/connections/google/gmail")]
async fn fetch_google_gmail_api(
  req: HttpRequest,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
  connections_data: Data<Arc<Mutex<ConnectionsData>>>,
  app_handle: Data<tauri::AppHandle>,
) -> impl Responder {
  let params =
    actix_web::web::Query::<FetchGoogleGmailParams>::from_query(req.query_string()).unwrap();
  let unwrapped_semantic_service = semantic_service.get_ref().clone();
  let unwrapped_connections_data = connections_data.get_ref().clone();
  let unwrapped_app_handle = app_handle.get_ref().clone();
  match start_gmail_data_fetching(
    params.email.clone(),
    params.account_email.clone().unwrap_or(params.email.clone()),
    unwrapped_semantic_service,
    unwrapped_connections_data,
    unwrapped_app_handle,
  )
  .await
  {
    Ok(_) => HttpResponse::Ok().json(FetchGoogleGmailResponse {
      success: true,
      message: "Fetching gmail data".to_string(),
    }),
    Err(err) => HttpResponse::BadRequest().json(FetchGoogleGmailResponse {
      success: false,
      message: format!("{:?}", err),
    }),
  }
}

#[post("/api/knapsack/connections/google/gmail/read")]
async fn set_email_as_read(payload: Json<SetEmailReadResponseParams>) -> impl Responder {
  let user_connection = match payload.account_email.clone() {
    Some(account_email) => UserConnection::find_by_user_email_scope_and_calendar_account(
      payload.email.clone(),
      String::from(GOOGLE_GMAIL_SCOPE),
      account_email,
    ),
    None => UserConnection::find_by_user_email_and_scope(
      payload.email.clone(),
      String::from(GOOGLE_GMAIL_SCOPE),
    ),
  };
  let user_connection = match user_connection {
    Ok(connection) => connection,
    Err(error) => {
      return HttpResponse::BadRequest().json(SetEmailReadResponse {
        message: error.to_string(),
      })
    }
  };
  let access_token = match refresh_connection_token(payload.email.clone(), user_connection).await {
    Ok(token) => token,
    Err(error) => {
      return HttpResponse::BadRequest().json(SetEmailReadResponse {
        message: error.to_string(),
      })
    }
  };
  let message_id = payload.message_id.clone();

  let hub = Gmail::new(get_https_client(), access_token.to_string());

  let mut remove_label_ids = Some(vec!["UNREAD".to_string()]);
  let mut add_label_ids = None;

  if payload.extra_action == Some("archive".to_string()) {
    remove_label_ids = Some(vec!["INBOX".to_string(), "UNREAD".to_string()]);
  } else if payload.extra_action == Some("delete".to_string()) {
    add_label_ids = Some(vec!["TRASH".to_string()]);
  }

  let modify_request = ModifyMessageRequest {
    add_label_ids: add_label_ids,
    remove_label_ids: remove_label_ids,
  };

  let result = hub
    .users()
    .messages_modify(modify_request, "me", &message_id)
    .doit()
    .await;

  match result {
    Ok(_) => HttpResponse::Ok().json(SetEmailReadResponse {
      message: "success".to_string(),
    }),
    Err(e) => HttpResponse::InternalServerError().json(SetEmailReadResponse {
      message: e.to_string(),
    }),
  }
}
