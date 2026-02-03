#![allow(non_snake_case)]

use actix_web::web::{self, Data};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};

use actix_web::{get, post, put, web::Json, HttpResponse, Responder, Result};
use serde::{Deserialize, Serialize};

use crate::api::document::DisplayDocument;
use crate::db::models::{calendar_event::CalendarEvent, document::Document, email::Email};
use crate::error::Error as CustomError;
use crate::user::UserInfo;

#[derive(Debug, Clone)]
pub struct RecentFile {
  abs_path: String,
  access_time: u64,
}

lazy_static! {
  static ref RECENT_FILES: Mutex<Vec<RecentFile>> = Mutex::new(Vec::new());
}

const RECENT_FILES_NUM_SLICE: usize = 20;

const FIELD_NAME_FILE_ABS_PATH: &str = "abs_path";
const FIELD_NAME_FILE_BODY: &str = "body";
const FIELD_NAME_FILE_TITLE: &str = "title";

const FIELD_NAME_EMAIL_SUBJECT: &str = "subject";
const FIELD_NAME_EMAIL_BODY: &str = "body";
const FIELD_NAME_EMAIL_SENDER: &str = "sender";
const FIELD_NAME_EMAIL_UID: &str = "email_uid";

const BOOST_ABS_PATH: f32 = 2.5;
const BOOST_BODY: f32 = 1.0;
const BOOST_TITLE: f32 = 5.0;

const SUMMARY_MAX_LENGTH: usize = 1000;

#[derive(Deserialize)]
struct GetMostRecentFilesRequest {
  top: usize,
}

#[derive(Deserialize)]
struct GetMostRecentEmailsRequest {
  top: usize,
}

#[derive(Deserialize)]
struct GetMostRecentCalendarEventsRequest {
  top: usize,
}

#[derive(Deserialize)]
struct ListEmailsWithinTimestampsRequest {
  top: usize,
  from_timestamp: i64,
  to_timestamp: i64,
}

#[derive(Deserialize)]
struct ListSentEmailsWithinTimestampsRequest {
  top: usize,
  email: String,
  from_timestamp: i64,
  to_timestamp: i64,
}

#[derive(Deserialize)]
struct FilterEmailsRequest {
  top: usize,
  addresses: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CalendarSearchResponseDoc {
  pub event_id: String,
  pub title: Option<String>,
  pub description: Option<String>,
  pub creator_email: Option<String>,
  pub attendees_json: Option<String>,
  pub location: Option<String>,
  pub start: Option<i64>,
  pub end: Option<i64>,
  pub google_meet_url: Option<String>,
  pub id: Option<u64>,
}

#[derive(Serialize)]
struct GoogleCalendarSearchResponse {
  success: bool,
  display_docs: Vec<CalendarSearchResponseDoc>,
  error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GmailSearchResponseDoc {
  #[serde(flatten)]
  pub sourceDocument: DisplayDocument,
  pub email_uid: String,
  pub sender: String,
  pub recipients: Vec<String>,
  pub cc: Vec<String>,
  pub subject: String,
  pub body: String,
  pub thread_id: Option<String>,
  pub date: u64,
  pub summary: String,
  pub is_starred: Option<bool>,
  pub is_read: Option<bool>,
  pub is_archived: Option<bool>,
  pub is_deleted: Option<bool>,
}

#[derive(Serialize)]
struct GmailSearchResponse {
  success: bool,
  display_docs: Vec<GmailSearchResponseDoc>,
  error: Option<String>,
}

#[derive(Deserialize)]
struct GetEmailThreadRequest {
  document_id: u64,
}

#[derive(Serialize, Clone)]
struct StandardResponse {
  success: bool,
  error_code: Option<String>,
  message: Option<String>,
}

#[post("/api/knapsack/recent_emails_search")]
async fn get_recent_emails(payload: Json<GetMostRecentEmailsRequest>) -> impl Responder {
  let mut display_docs = Vec::new();
  let recent_emails = Email::get_recent_emails(payload.top);
  for email in recent_emails {
    match build_gmail_response_doc_from_email_row(email) {
      Some(doc) => display_docs.push(doc),
      None => continue,
    };
  }
  let response = GmailSearchResponse {
    success: true,
    display_docs,
    error: None,
  };
  return actix_web::HttpResponse::Ok().json(response);
}

#[post("/api/knapsack/recent_calendar_events")]
async fn get_recent_calendar_events(
  payload: Json<GetMostRecentCalendarEventsRequest>,
) -> impl Responder {
  let mut display_docs = Vec::new();
  let recent_calendar_events = CalendarEvent::get_recent_calendar_events(payload.top);
  for calendar_event in recent_calendar_events {
    display_docs.push(CalendarSearchResponseDoc {
      event_id: calendar_event.event_id,
      title: calendar_event.title,
      description: calendar_event.description,
      creator_email: calendar_event.creator_email,
      attendees_json: calendar_event.attendees_json,
      location: calendar_event.location,
      start: calendar_event.start,
      end: calendar_event.end,
      google_meet_url: calendar_event.google_meet_url,
      id: calendar_event.id,
    });
  }
  let response = GoogleCalendarSearchResponse {
    success: true,
    display_docs,
    error: None,
  };
  return actix_web::HttpResponse::Ok().json(response);
}

#[derive(Deserialize)]
struct CalendarGetEventsParams {
    start_timestamp: u64,
    end_timestamp: u64,
}

#[get("/api/knapsack/calendar/get_events")]
async fn get_events(query: web::Query<CalendarGetEventsParams>) -> impl Responder {
    let events = CalendarEvent::find_by_timestamp_range(
        query.start_timestamp,
        query.end_timestamp,
    );

    let display_docs: Vec<CalendarSearchResponseDoc> = events
        .into_iter()
        .map(|calendar_event| CalendarSearchResponseDoc {
            event_id: calendar_event.event_id,
            title: calendar_event.title,
            description: calendar_event.description,
            creator_email: calendar_event.creator_email,
            attendees_json: calendar_event.attendees_json,
            location: calendar_event.location,
            start: calendar_event.start,
            end: calendar_event.end,
            google_meet_url: calendar_event.google_meet_url,
            id: calendar_event.id,
        })
        .collect();

    let response = GoogleCalendarSearchResponse {
        success: true,
        display_docs,
        error: None,
    };

    HttpResponse::Ok().json(response)
}

#[get("/api/knapsack/calendar_event/{event_id}")]
async fn get_calendar_event_by_id(path: web::Path<u64>) -> impl Responder {
  let event_id = path.into_inner();
  match CalendarEvent::find_by_id(event_id) {
    Ok(maybe_calendar_event) => match maybe_calendar_event {
      Some(calendar_event) => {
        actix_web::HttpResponse::Ok().json(json!({ "success": true, "data": calendar_event}))
      }
      None => actix_web::HttpResponse::NotFound()
        .json(json!({ "error": "calendar event not found", "success": false, })),
    },
    Err(error) => {
      log::error!("Failed to get calendar event {:?}", error);
      actix_web::HttpResponse::BadRequest()
        .json(json!({ "error": "failed to get calendar event", "success": false}))
    }
  }
}

#[post("/api/knapsack/search_emails_by_addresses")]
pub async fn filter_emails_by_addresses(
  payload: Json<FilterEmailsRequest>,
  user_info: Data<Arc<RwLock<UserInfo>>>,
) -> impl Responder {
  let mut display_docs = Vec::new();
  let ten_days_ago_timestamp = (chrono::Utc::now() - chrono::Duration::days(10)).timestamp();
  let mut maybe_email_addresses: Option<Vec<String>> = None;
  let email_addresses = payload.addresses.clone();
  let my_email_address = match user_info.read().await.email.clone() {
    Some(email) => email,
    None => "".to_string(),
  };
  let mut parsed_email_addresses = Vec::new();
  for email_address in email_addresses {
    if email_address != my_email_address {
      parsed_email_addresses.push(email_address);
    }
  }
  if !parsed_email_addresses.is_empty() {
    maybe_email_addresses = Some(parsed_email_addresses);
  }
  let recent_emails = Email::filter_emails(
    payload.top,
    maybe_email_addresses,
    Some(ten_days_ago_timestamp),
    None,
  );
  for email in recent_emails {
    match build_gmail_response_doc_from_email_row(email) {
      Some(doc) => display_docs.push(doc),
      None => continue,
    };
  }
  let response = GmailSearchResponse {
    success: true,
    display_docs,
    error: None,
  };
  return actix_web::HttpResponse::Ok().json(response);
}

#[post("/api/knapsack/list_emails_within_timestamps")]
pub async fn list_emails_within_timestamps(
  payload: Json<ListEmailsWithinTimestampsRequest>,
) -> impl Responder {
  let mut display_docs = Vec::new();
  let recent_emails = Email::filter_emails(
    payload.top,
    None,
    Some(payload.from_timestamp.clone()),
    Some(payload.to_timestamp.clone()),
  );

  for email in recent_emails {
    match build_gmail_response_doc_from_email_row(email) {
      Some(doc) => display_docs.push(doc),
      None => continue,
    };
  }
  let response = GmailSearchResponse {
    success: true,
    display_docs,
    error: None,
  };
  return actix_web::HttpResponse::Ok().json(response);
}

#[post("/api/knapsack/list_sent_emails_within_timestamps")]
pub async fn list_sent_emails_within_timestamps(
  payload: Json<ListSentEmailsWithinTimestampsRequest>,
) -> impl Responder {
  let mut display_docs = Vec::new();
  let sent_emails = Email::filter_emails_by_sender(
    payload.top,
    &payload.email,
    payload.from_timestamp.clone(),
    payload.to_timestamp.clone(),
  );

  for email in sent_emails {
    match build_gmail_response_doc_from_email_row(email) {
      Some(doc) => display_docs.push(doc),
      None => continue,
    };
  }

  let response = GmailSearchResponse {
    success: true,
    display_docs,
    error: None,
  };
  return actix_web::HttpResponse::Ok().json(response);
}

fn get_document_id_from_email(email: Email) -> Option<u64> {
  let email_id = match email.id {
    Some(id) => id,
    None => return None,
  };
  let document = match Document::find_by_foreign_table_and_id("emails", email_id) {
    Ok(Some(doc)) => doc,
    Ok(None) => return None,
    Err(e) => {
      log::error!(
        "Error finding Document for Email ID: {:?} - {:?}",
        email_id,
        e
      );
      return None;
    }
  };
  return document.id;
}

fn build_gmail_response_doc_from_email_row(email: Email) -> Option<GmailSearchResponseDoc> {
  let document_id = match get_document_id_from_email(email.clone()) {
    Some(id) => id,
    None => {
      log::error!("No Document ID for Email Msg: {:?}", email);
      return None;
    }
  };
  let summary: String = email.body.chars().take(SUMMARY_MAX_LENGTH).collect();

  let display_document = DisplayDocument {
    document_id,
    title: email.subject.clone(),
    summary: None,
    document_type: "email".to_string(),
    uri: "".to_string(),
  };
  let doc: GmailSearchResponseDoc = GmailSearchResponseDoc {
    sourceDocument: display_document,
    email_uid: email.email_uid,
    subject: email.subject.clone(),
    cc: vec![email.cc],
    date: email.date,
    sender: email.sender,
    recipients: vec![email.recipient],
    body: email.body.clone(),
    thread_id: email.thread_id.clone(),
    summary,
    is_starred: email.is_starred,
    is_read: email.is_read,
    is_archived: email.is_archived,
    is_deleted: email.is_deleted,
  };
  return Some(doc);
}

#[get("/api/knapsack/email_thread/{document_id}")]
pub async fn get_email_thread(path: web::Path<u64>) -> Result<HttpResponse> {
  let document_id = path.into_inner();

  let document = match Document::find_by_id(document_id) {
    Ok(Some(doc)) => doc,
    Ok(None) => {
      return Ok(HttpResponse::NotFound().json(StandardResponse {
        success: false,
        error_code: Some("DOCUMENT_NOT_FOUND".to_string()),
        message: Some("Document not found".to_string()),
      }))
    }
    Err(e) => {
      return Ok(HttpResponse::InternalServerError().json(StandardResponse {
        success: false,
        error_code: Some("DATABASE_ERROR".to_string()),
        message: Some(format!("Error fetching document: {:?}", e)),
      }))
    }
  };

  let email = match Email::find_by_id(document.foreign_table_id) {
    Ok(Some(email)) => email,
    Ok(None) => {
      return Ok(HttpResponse::NotFound().json(StandardResponse {
        success: false,
        error_code: Some("EMAIL_NOT_FOUND".to_string()),
        message: Some("Email not found".to_string()),
      }))
    }
    Err(e) => {
      return Ok(HttpResponse::InternalServerError().json(StandardResponse {
        success: false,
        error_code: Some("DATABASE_ERROR".to_string()),
        message: Some(format!("Error fetching email: {:?}", e)),
      }))
    }
  };

  let thread_emails = match Email::get_last_email_by_thread_id(&email.thread_id.unwrap_or_default())
  {
    Ok(emails) => emails,
    Err(e) => {
      return Ok(HttpResponse::InternalServerError().json(StandardResponse {
        success: false,
        error_code: Some("DATABASE_ERROR".to_string()),
        message: Some(format!("Error fetching thread emails: {:?}", e)),
      }))
    }
  };

  let display_docs: Vec<GmailSearchResponseDoc> = thread_emails
    .into_iter()
    .filter_map(build_gmail_response_doc_from_email_row)
    .collect();

  Ok(HttpResponse::Ok().json(GmailSearchResponse {
    success: true,
    display_docs,
    error: None,
  }))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateEmailRequest {
  email_uid: String,
  subject: Option<String>,
  date: Option<u64>,
  sender: Option<String>,
  recipient: Option<String>,
  cc: Option<String>,
  body: Option<String>,
  thread_id: Option<String>,
  is_starred: Option<bool>,
  is_read: Option<bool>,
  is_archived: Option<bool>,
}

#[put("/api/knapsack/update_email")]
pub async fn update_email(payload: Json<UpdateEmailRequest>) -> Result<HttpResponse> {
  let email = match Email::find_by_uid(&payload.email_uid) {
    Ok(Some(email)) => email,
    Ok(None) => {
      return Ok(HttpResponse::NotFound().json(StandardResponse {
        success: false,
        error_code: Some("EMAIL_NOT_FOUND".to_string()),
        message: Some("Email not found".to_string()),
      }))
    }
    Err(e) => {
      return Ok(HttpResponse::InternalServerError().json(StandardResponse {
        success: false,
        error_code: Some("DATABASE_ERROR".to_string()),
        message: Some(format!("Error fetching email: {:?}", e)),
      }))
    }
  };

  let mut updated_email = email.clone();

  if let Some(subject) = payload.subject.clone() {
    updated_email.subject = subject;
  }
  if let Some(date) = payload.date {
    updated_email.date = date;
  }
  if let Some(sender) = payload.sender.clone() {
    updated_email.sender = sender;
  }
  if let Some(recipient) = payload.recipient.clone() {
    updated_email.recipient = recipient;
  }
  if let Some(cc) = payload.cc.clone() {
    updated_email.cc = cc;
  }
  if let Some(body) = payload.body.clone() {
    updated_email.body = body;
  }
  if let Some(thread_id) = payload.thread_id.clone() {
    updated_email.thread_id = Some(thread_id);
  }
  if let Some(is_starred) = payload.is_starred {
    updated_email.is_starred = Some(is_starred);
  }
  if let Some(is_read) = payload.is_read {
    updated_email.is_read = Some(is_read);
  }
  if let Some(is_archived) = payload.is_archived {
    updated_email.is_archived = Some(is_archived);
  }

  match updated_email.update() {
    Ok(_) => Ok(HttpResponse::Ok().json(StandardResponse {
      success: true,
      error_code: None,
      message: Some("Email updated successfully".to_string()),
    })),
    Err(e) => Ok(HttpResponse::InternalServerError().json(StandardResponse {
      success: false,
      error_code: Some("UPDATE_ERROR".to_string()),
      message: Some(format!("Error updating email: {:?}", e)),
    })),
  }
}
