use actix_web::{get, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

use crate::db::models::email::Email;

#[derive(Debug, Deserialize)]
pub struct UnreadImportantParams {
  /// Max number of emails to return.
  pub top: Option<usize>,
}

#[derive(Debug, Serialize)]
pub struct UnreadImportantEmail {
  pub email_uid: String,
  pub subject: String,
  pub sender: String,
  pub date: u64,
  pub is_starred: Option<bool>,
  pub is_read: Option<bool>,
  pub is_archived: Option<bool>,
  pub is_deleted: Option<bool>,
  pub body_preview: String,
}

#[derive(Debug, Serialize)]
pub struct UnreadImportantResponse {
  pub success: bool,
  pub emails: Vec<UnreadImportantEmail>,
}

/// A lightweight endpoint intended for Clawd integration: provide a bundle of
/// "unread + important" (currently approximated as UNREAD + STARRED) emails.
///
/// The summarization itself can happen either:
/// - via your local LLM endpoint (`/api/knapsack/llm/complete`), or
/// - by forwarding these to Clawdbot.
#[get("/api/clawd/gmail/unread_important")]
pub async fn get_unread_important(query: web::Query<UnreadImportantParams>) -> impl Responder {
  let top = query.top.unwrap_or(10);

  // NOTE: This relies on emails already being synced into the local DB.
  // We currently filter in-memory because Email model APIs are limited.
  let mut emails = Email::get_recent_emails(top * 5);

  emails.retain(|e| e.is_deleted != Some(true));
  emails.retain(|e| e.is_read != Some(true));
  emails.retain(|e| e.is_starred == Some(true));

  let emails = emails.into_iter().take(top).collect::<Vec<_>>();

  let mapped = emails
    .into_iter()
    .map(|e| {
      let body_preview = e.body.chars().take(800).collect::<String>();
      UnreadImportantEmail {
        email_uid: e.email_uid,
        subject: e.subject,
        sender: e.sender,
        date: e.date,
        is_starred: e.is_starred,
        is_read: e.is_read,
        is_archived: e.is_archived,
        is_deleted: e.is_deleted,
        body_preview,
      }
    })
    .collect::<Vec<_>>();

  HttpResponse::Ok().json(UnreadImportantResponse {
    success: true,
    emails: mapped,
  })
}
