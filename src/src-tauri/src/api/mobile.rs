use crate::api::notes::save_notes_to_file;
use crate::clawd::gateway_client;
use crate::clawd::gbrain::{default_brain_root, kn_brain_list, kn_brain_read_page};
use crate::clawd::gmail::send_gmail_email;
use crate::connections::google::auth::refresh_connection_token;
use crate::connections::google::constants::GOOGLE_GMAIL_SCOPE;
use crate::connections::microsoft::auth::refresh_user_connection;
use crate::connections::microsoft::constants::{MICROSOFT_BASE_URL, MICROSOFT_OUTLOOK_SCOPE};
use crate::db::models::calendar_event::CalendarEvent;
use crate::db::models::connection::Connection;
use crate::db::models::email::Email;
use crate::db::models::feed_item::FeedItem;
use crate::db::models::message::Message;
use crate::db::models::thread::{Thread, ThreadType, ThreadWithMessages};
use crate::db::models::user::User;
use crate::db::models::user_connection::UserConnection;
use crate::error::Error;
use actix_multipart::Multipart;
use actix_web::{
  get, post,
  web::{self, Json},
  HttpResponse, Responder,
};
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs::{create_dir_all, read_to_string, File};
use std::io::Write;
use std::path::PathBuf;

const MOBILE_METADATA_DIR: &str = "mobile_meetings";
const MOBILE_RECORDINGS_DIR: &str = "mobile_recordings";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MobileMeetingStatus {
  Created,
  Recording,
  Saved,
  SyncingToPhone,
  Uploading,
  Uploaded,
  GeneratingNotes,
  Ready,
  Failed,
}

impl Default for MobileMeetingStatus {
  fn default() -> Self {
    Self::Created
  }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MobileMeetingMetadata {
  pub thread_id: u64,
  pub status: MobileMeetingStatus,
  pub source_device: Option<String>,
  pub latest_audio_file: Option<String>,
  pub notes_preview: Option<String>,
  pub started_at: Option<i64>,
  pub ended_at: Option<i64>,
  pub updated_at: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMobileMeetingRequest {
  pub title: Option<String>,
  pub subtitle: Option<String>,
  pub source_device: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveMobileNotesRequest {
  pub notes: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMobileMeetingStatusRequest {
  pub status: MobileMeetingStatus,
  pub source_device: Option<String>,
  pub started_at: Option<i64>,
  pub ended_at: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileMeetingDetail {
  pub thread: Thread,
  pub metadata: MobileMeetingMetadata,
  pub notes: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileChatSummary {
  pub thread: Thread,
  pub preview: Option<String>,
  pub updated_at: i64,
  pub message_count: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileChatMessage {
  pub id: Option<u64>,
  pub timestamp: i64,
  pub role: String,
  pub content: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileChatDetail {
  pub thread: Thread,
  pub messages: Vec<MobileChatMessage>,
  pub updated_at: i64,
}

const MOBILE_CHAT_SEED_HISTORY_LIMIT: usize = 12;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMobileChatRequest {
  pub title: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendMobileChatMessageRequest {
  pub text: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileLinkedProfile {
  pub email: String,
  pub name: Option<String>,
  pub uuid: Option<String>,
  pub provider: Option<String>,
  pub profile_image: Option<String>,
  pub sharing_permission: Option<i64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileLinkedSession {
  pub linked: bool,
  pub profile: Option<MobileLinkedProfile>,
  pub connection_scopes: Vec<String>,
  pub calendar_connected: bool,
  pub email_connected: bool,
  pub drive_connected: bool,
  pub desktop_label: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileCalendarEventSummary {
  pub id: u64,
  pub event_id: String,
  pub title: Option<String>,
  pub description: Option<String>,
  pub location: Option<String>,
  pub start: Option<i64>,
  pub end: Option<i64>,
  pub google_meet_url: Option<String>,
  pub calendar_account_email: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileBrainListQuery {
  pub sub_path: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileBrainPageQuery {
  pub rel_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileBrainPage {
  pub rel_path: String,
  pub title: String,
  pub content: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileAutopilotBrief {
  pub headline: String,
  pub summary: String,
  pub generated_at: i64,
  pub sections: Vec<MobileAutopilotSection>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileAutopilotSection {
  pub id: String,
  pub title: String,
  pub subtitle: Option<String>,
  pub cards: Vec<MobileAutopilotCard>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileAutopilotCard {
  pub id: String,
  pub kind: String,
  pub title: String,
  pub subtitle: String,
  pub preview: Option<String>,
  pub rationale: Option<String>,
  pub badge: Option<String>,
  pub timestamp: Option<i64>,
  pub email_uid: Option<String>,
  pub related_thread_id: Option<u64>,
  pub related_chat_thread_id: Option<u64>,
  pub suggested_prompts: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileAutopilotEmailMessage {
  pub email_uid: String,
  pub sender: String,
  pub recipients: Vec<String>,
  pub cc: Vec<String>,
  pub subject: String,
  pub body: String,
  pub summary: String,
  pub date: u64,
  pub is_read: Option<bool>,
  pub is_archived: Option<bool>,
  pub is_deleted: Option<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileAutopilotEmailDetail {
  pub email_uid: String,
  pub account_email: String,
  pub provider: String,
  pub category: String,
  pub subject: String,
  pub sender: String,
  pub preview: Option<String>,
  pub badge: Option<String>,
  pub suggested_prompts: Vec<String>,
  pub messages: Vec<MobileAutopilotEmailMessage>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MobileAutopilotEmailActionRequest {
  pub action: String,
  pub reply_body: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum MobileEmailProvider {
  Google,
  Microsoft,
}

fn knapsack_data_dir() -> Result<PathBuf, Error> {
  let home_dir =
    dirs::home_dir().ok_or_else(|| Error::KSError("Could not resolve home dir".into()))?;
  let dir = home_dir.join(".knapsack");
  create_dir_all(&dir)?;
  Ok(dir)
}

fn mobile_metadata_dir() -> Result<PathBuf, Error> {
  let dir = knapsack_data_dir()?.join(MOBILE_METADATA_DIR);
  create_dir_all(&dir)?;
  Ok(dir)
}

fn mobile_recordings_dir() -> Result<PathBuf, Error> {
  let dir = knapsack_data_dir()?.join(MOBILE_RECORDINGS_DIR);
  create_dir_all(&dir)?;
  Ok(dir)
}

fn mobile_metadata_path(thread_id: u64) -> Result<PathBuf, Error> {
  Ok(mobile_metadata_dir()?.join(format!("{thread_id}.json")))
}

fn load_mobile_metadata(thread_id: u64) -> Result<Option<MobileMeetingMetadata>, Error> {
  let path = mobile_metadata_path(thread_id)?;
  if !path.exists() {
    return Ok(None);
  }
  let content = read_to_string(path)?;
  let parsed = serde_json::from_str::<MobileMeetingMetadata>(&content)
    .map_err(|err| Error::KSError(format!("Failed to parse mobile metadata: {err}")))?;
  Ok(Some(parsed))
}

fn save_mobile_metadata(metadata: &MobileMeetingMetadata) -> Result<(), Error> {
  let path = mobile_metadata_path(metadata.thread_id)?;
  let serialized = serde_json::to_string_pretty(metadata)
    .map_err(|err| Error::KSError(format!("Failed to serialize mobile metadata: {err}")))?;
  std::fs::write(path, serialized)?;
  Ok(())
}

fn load_notes(thread_id: u64) -> Option<String> {
  let notes_path = dirs::home_dir()?
    .join(".knapsack")
    .join("notes")
    .join(thread_id.to_string());
  read_to_string(notes_path).ok()
}

fn build_default_metadata(thread_id: u64, source_device: Option<String>) -> MobileMeetingMetadata {
  MobileMeetingMetadata {
    thread_id,
    status: MobileMeetingStatus::Created,
    source_device,
    latest_audio_file: None,
    notes_preview: None,
    started_at: None,
    ended_at: None,
    updated_at: chrono::Utc::now().timestamp(),
  }
}

fn profile_dat_path() -> Result<PathBuf, Error> {
  Ok(knapsack_data_dir()?.join("profile.dat"))
}

fn load_profile_dat() -> Option<Value> {
  let path = profile_dat_path().ok()?;
  let content = read_to_string(path).ok()?;
  serde_json::from_str::<Value>(&content).ok()
}

fn profile_string(profile: &Value, key: &str) -> Option<String> {
  profile
    .get(key)
    .and_then(|value| value.as_str())
    .map(|value| value.trim().to_string())
    .filter(|value| !value.is_empty())
}

fn profile_i64(root: &Value, key: &str) -> Option<i64> {
  root.get(key).and_then(|value| value.as_i64())
}

fn infer_linked_profile() -> Option<MobileLinkedProfile> {
  let root = load_profile_dat();
  let kn_profile = root.as_ref().and_then(|json| json.get("KN_PROFILE"));

  let email = kn_profile
    .and_then(|profile| profile_string(profile, "email"))
    .or_else(|| User::find_first_with_email().ok().map(|user| user.email))?;

  let uuid = kn_profile
    .and_then(|profile| profile_string(profile, "uuid"))
    .or_else(|| {
      User::find_by_email(email.clone())
        .ok()
        .and_then(|user| user.uuid)
    });

  Some(MobileLinkedProfile {
    email,
    name: kn_profile.and_then(|profile| profile_string(profile, "name")),
    uuid,
    provider: kn_profile.and_then(|profile| profile_string(profile, "provider")),
    profile_image: kn_profile.and_then(|profile| profile_string(profile, "profile_image")),
    sharing_permission: root
      .as_ref()
      .and_then(|json| profile_i64(json, "kn_share_notes_permission")),
  })
}

fn infer_connection_scopes(email: &str) -> Vec<String> {
  let mut scopes = Connection::find_connections_from_user_email(email.to_string())
    .unwrap_or_default()
    .into_iter()
    .map(|connection| connection.scope)
    .collect::<Vec<_>>();

  if scopes.is_empty() {
    if let Some(root) = load_profile_dat() {
      if let Some(values) = root
        .get("KN_CONNECTIONS")
        .and_then(|value| value.as_array())
      {
        scopes = values
          .iter()
          .filter_map(|value| value.as_str().map(|scope| scope.to_string()))
          .collect();
      }
    }
  }

  scopes.sort();
  scopes.dedup();
  scopes
}

fn build_mobile_session() -> MobileLinkedSession {
  let profile = infer_linked_profile();
  let scopes = profile
    .as_ref()
    .map(|profile| infer_connection_scopes(&profile.email))
    .unwrap_or_default();

  let calendar_connected = scopes
    .iter()
    .any(|scope| scope == "google_calendar_read" || scope == "microsoft_calendar_read");
  let email_connected = scopes
    .iter()
    .any(|scope| scope == "google_gmail_modify" || scope == "microsoft_outlook_read");
  let drive_connected = scopes
    .iter()
    .any(|scope| scope == "google_drive_read" || scope == "microsoft_onedrive_read");

  MobileLinkedSession {
    linked: profile.is_some(),
    profile,
    connection_scopes: scopes,
    calendar_connected,
    email_connected,
    drive_connected,
    desktop_label: "Linked to your desktop Knapsack app".to_string(),
  }
}

fn build_mobile_calendar_events(limit: usize) -> Vec<MobileCalendarEventSummary> {
  let now = chrono::Utc::now().timestamp() - 60 * 60 * 6;
  let mut events = CalendarEvent::find_all()
    .into_iter()
    .filter(|event| event.start.unwrap_or_default() >= now)
    .collect::<Vec<_>>();

  events.sort_by_key(|event| event.start.unwrap_or(i64::MAX));
  events
    .into_iter()
    .take(limit)
    .filter_map(|event| {
      Some(MobileCalendarEventSummary {
        id: event.id?,
        event_id: event.event_id,
        title: event.title,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        google_meet_url: event.google_meet_url,
        calendar_account_email: event.calendar_account_email,
      })
    })
    .collect()
}

fn clean_email_preview(value: &str) -> Option<String> {
  let preview = value
    .replace('\r', " ")
    .replace('\n', " ")
    .split_whitespace()
    .collect::<Vec<_>>()
    .join(" ");
  let trimmed = preview.trim();
  if trimmed.is_empty() {
    None
  } else {
    Some(trimmed.chars().take(160).collect())
  }
}

fn email_timestamp_seconds(email: &Email) -> i64 {
  let raw = email.date as i64;
  if raw > 10_000_000_000 { raw / 1000 } else { raw }
}

fn is_deleted_or_archived(email: &Email) -> bool {
  email.is_deleted.unwrap_or(false) || email.is_archived.unwrap_or(false)
}

fn is_unread(email: &Email) -> bool {
  !email.is_read.unwrap_or(false)
}

fn lower_join(subject: &str, body: &str, sender: &str) -> String {
  format!("{subject} {body} {sender}").to_lowercase()
}

fn contains_any(haystack: &str, needles: &[&str]) -> bool {
  needles.iter().any(|needle| haystack.contains(needle))
}

fn is_noise_email(email: &Email) -> bool {
  let text = lower_join(&email.subject, &email.body, &email.sender);
  contains_any(
    &text,
    &[
      "newsletter",
      "unsubscribe",
      "sale",
      "promotion",
      "promo",
      "digest",
      "deals",
      "marketing",
      "do not reply",
      "donotreply",
      "no-reply",
      "noreply",
    ],
  )
}

fn is_tracking_email(email: &Email) -> bool {
  let text = lower_join(&email.subject, &email.body, &email.sender);
  contains_any(
    &text,
    &[
      "tracking",
      "out for delivery",
      "delivered",
      "shipment",
      "shipping",
      "package",
      "order #",
      "receipt",
      "invoice",
      "payment due",
      "charged",
      "flight",
      "boarding",
      "reservation",
      "hotel",
      "itinerary",
    ],
  )
}

fn is_reply_candidate(email: &Email) -> bool {
  let sender = email.sender.to_lowercase();
  is_unread(email)
    && !is_deleted_or_archived(email)
    && !is_noise_email(email)
    && !contains_any(&sender, &["no-reply", "noreply", "donotreply"])
}

#[derive(Default)]
struct SenderStat {
  count: usize,
  unread_count: usize,
  latest_subject: Option<String>,
}

fn split_addresses(value: &str) -> Vec<String> {
  value
    .split(',')
    .map(|entry| entry.trim().to_string())
    .filter(|entry| !entry.is_empty())
    .collect()
}

fn autopilot_category_for_email(email: &Email) -> String {
  if is_tracking_email(email) {
    "Track".to_string()
  } else if is_noise_email(email) {
    "Clean up".to_string()
  } else if is_reply_candidate(email) {
    "Needs attention".to_string()
  } else {
    "Inbox".to_string()
  }
}

fn provider_label(provider: MobileEmailProvider) -> &'static str {
  match provider {
    MobileEmailProvider::Google => "gmail",
    MobileEmailProvider::Microsoft => "outlook",
  }
}

fn resolve_mobile_email_connection(
  account_email: &str,
  scope: &str,
) -> Result<(String, UserConnection), Error> {
  let owner_email = infer_linked_profile()
    .map(|profile| profile.email)
    .ok_or_else(|| Error::KSError("No linked Desktop profile found".to_string()))?;
  let connection = UserConnection::find_by_scope_and_account_email(
    owner_email.clone(),
    scope.to_string(),
    account_email.to_string(),
  )?;
  Ok((owner_email, connection))
}

fn detect_mobile_email_provider(account_email: &str) -> Result<MobileEmailProvider, Error> {
  if resolve_mobile_email_connection(account_email, GOOGLE_GMAIL_SCOPE).is_ok() {
    return Ok(MobileEmailProvider::Google);
  }

  if resolve_mobile_email_connection(account_email, MICROSOFT_OUTLOOK_SCOPE).is_ok() {
    return Ok(MobileEmailProvider::Microsoft);
  }

  Err(Error::KSError(format!(
    "No email connection found for {}",
    account_email
  )))
}

fn build_mobile_autopilot_email_message(email: &Email) -> MobileAutopilotEmailMessage {
  MobileAutopilotEmailMessage {
    email_uid: email.email_uid.clone(),
    sender: email.sender.clone(),
    recipients: split_addresses(&email.recipient),
    cc: split_addresses(&email.cc),
    subject: email.subject.clone(),
    body: email.body.clone(),
    summary: clean_email_preview(&email.body).unwrap_or_default(),
    date: email.date,
    is_read: email.is_read,
    is_archived: email.is_archived,
    is_deleted: email.is_deleted,
  }
}

fn build_mobile_autopilot_email_detail(email_uid: &str) -> Result<MobileAutopilotEmailDetail, Error> {
  let email = Email::find_by_uid(email_uid)?
    .ok_or_else(|| Error::KSError("Email not found".to_string()))?;
  let provider = detect_mobile_email_provider(&email.account_email)?;

  let mut messages = if let Some(thread_id) = email.thread_id.clone() {
    Email::get_last_email_by_thread_id(&thread_id)?
  } else {
    vec![email.clone()]
  };
  messages.sort_by(|left, right| right.date.cmp(&left.date));

  let anchor = messages
    .iter()
    .find(|message| message.email_uid == email.email_uid)
    .cloned()
    .unwrap_or_else(|| email.clone());

  Ok(MobileAutopilotEmailDetail {
    email_uid: anchor.email_uid.clone(),
    account_email: anchor.account_email.clone(),
    provider: provider_label(provider).to_string(),
    category: autopilot_category_for_email(&anchor),
    subject: anchor.subject.clone(),
    sender: anchor.sender.clone(),
    preview: clean_email_preview(&anchor.body),
    badge: if is_reply_candidate(&anchor) {
      Some("Needs attention".to_string())
    } else if is_tracking_email(&anchor) {
      Some("Track".to_string())
    } else if is_noise_email(&anchor) {
      Some("Clean up".to_string())
    } else {
      None
    },
    suggested_prompts: vec![
      format!("Summarize what matters in '{}'.", anchor.subject),
      format!("Draft the best reply to '{}'.", anchor.subject),
      format!("What can I safely ignore in this thread: '{}'?", anchor.subject),
    ],
    messages: messages
      .iter()
      .map(build_mobile_autopilot_email_message)
      .collect(),
  })
}

fn mark_local_email_state(email_uid: &str, action: &str) -> Result<(), Error> {
  let Some(mut email) = Email::find_by_uid(email_uid)? else {
    return Ok(());
  };

  match action {
    "mark_read" => {
      email.is_read = Some(true);
    }
    "archive" => {
      email.is_read = Some(true);
      email.is_archived = Some(true);
    }
    "delete" => {
      email.is_deleted = Some(true);
    }
    _ => {}
  }

  email.update()
}

async fn perform_google_email_action(
  account_email: &str,
  message_id: &str,
  action: &str,
) -> Result<(), Error> {
  let (owner_email, user_connection) =
    resolve_mobile_email_connection(account_email, GOOGLE_GMAIL_SCOPE)?;
  let access_token = refresh_connection_token(owner_email, user_connection).await?;
  let client = reqwest::Client::new();

  let (remove_label_ids, add_label_ids) = match action {
    "mark_read" => (vec!["UNREAD".to_string()], Vec::new()),
    "archive" => (
      vec!["UNREAD".to_string(), "INBOX".to_string()],
      Vec::new(),
    ),
    "delete" => (Vec::new(), vec!["TRASH".to_string()]),
    _ => {
      return Err(Error::KSError(format!(
        "Unsupported Gmail action: {}",
        action
      )))
    }
  };

  let response = client
    .post(format!(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/{}/modify",
      message_id
    ))
    .bearer_auth(access_token)
    .json(&json!({
      "removeLabelIds": remove_label_ids,
      "addLabelIds": add_label_ids,
    }))
    .send()
    .await
    .map_err(|err| Error::KSError(format!("Gmail request failed: {err}")))?;

  if !response.status().is_success() {
    let status = response.status();
    let body = response.text().await.unwrap_or_default();
    return Err(Error::KSError(format!(
      "Gmail action failed ({}): {}",
      status, body
    )));
  }

  Ok(())
}

async fn perform_microsoft_email_action(
  account_email: &str,
  message_id: &str,
  action: &str,
) -> Result<(), Error> {
  let (owner_email, user_connection) =
    resolve_mobile_email_connection(account_email, MICROSOFT_OUTLOOK_SCOPE)?;
  let access_token = refresh_user_connection(user_connection, owner_email)
    .await?
    .token;
  let client = reqwest::Client::new();

  let response = match action {
    "mark_read" => {
      client
        .patch(format!("{}/me/messages/{}", MICROSOFT_BASE_URL, message_id))
        .bearer_auth(&access_token)
        .json(&json!({ "isRead": true }))
        .send()
        .await
    }
    "archive" => {
      client
        .post(format!("{}/me/messages/{}/move", MICROSOFT_BASE_URL, message_id))
        .bearer_auth(&access_token)
        .json(&json!({ "destinationId": "archive" }))
        .send()
        .await
    }
    "delete" => {
      client
        .delete(format!("{}/me/messages/{}", MICROSOFT_BASE_URL, message_id))
        .bearer_auth(&access_token)
        .send()
        .await
    }
    _ => {
      return Err(Error::KSError(format!(
        "Unsupported Outlook action: {}",
        action
      )))
    }
  }
  .map_err(|err| Error::KSError(format!("Outlook request failed: {err}")))?;

  if !response.status().is_success() {
    let status = response.status();
    let body = response.text().await.unwrap_or_default();
    return Err(Error::KSError(format!(
      "Outlook action failed ({}): {}",
      status, body
    )));
  }

  Ok(())
}

async fn send_mobile_email_reply(email_uid: &str, reply_body: &str) -> Result<(), Error> {
  let email = Email::find_by_uid(email_uid)?
    .ok_or_else(|| Error::KSError("Email not found".to_string()))?;
  let provider = detect_mobile_email_provider(&email.account_email)?;
  let trimmed = reply_body.trim();
  if trimmed.is_empty() {
    return Err(Error::KSError("Reply body is empty".to_string()));
  }

  match provider {
    MobileEmailProvider::Google => {
      let user_name = infer_linked_profile()
        .and_then(|profile| profile.name)
        .unwrap_or_default();
      let subject = if email.subject.to_lowercase().starts_with("re:") {
        email.subject.clone()
      } else {
        format!("Re: {}", email.subject)
      };

      send_gmail_email(
        &infer_linked_profile()
          .map(|profile| profile.email)
          .unwrap_or_else(|| email.account_email.clone()),
        &email.account_email,
        &user_name,
        &email.sender,
        if email.cc.trim().is_empty() {
          None
        } else {
          Some(email.cc.as_str())
        },
        &subject,
        trimmed,
        email.thread_id.as_deref(),
        None,
      )
      .await
      .map_err(Error::KSError)?;
    }
    MobileEmailProvider::Microsoft => {
      let (owner_email, user_connection) =
        resolve_mobile_email_connection(&email.account_email, MICROSOFT_OUTLOOK_SCOPE)?;
      let access_token = refresh_user_connection(user_connection, owner_email)
        .await?
        .token;

      let response = reqwest::Client::new()
        .post(format!(
          "{}/me/messages/{}/replyAll",
          MICROSOFT_BASE_URL, email.email_uid
        ))
        .bearer_auth(access_token)
        .json(&json!({ "comment": trimmed }))
        .send()
        .await
        .map_err(|err| Error::KSError(format!("Outlook reply failed: {err}")))?;

      if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(Error::KSError(format!(
          "Outlook reply failed ({}): {}",
          status, body
        )));
      }
    }
  }

  mark_local_email_state(email_uid, "mark_read")?;
  Ok(())
}

fn build_mobile_autopilot_brief() -> MobileAutopilotBrief {
  let now = chrono::Utc::now().timestamp();
  let session = build_mobile_session();
  let calendar_events = build_mobile_calendar_events(10);
  let recent_meetings = Thread::find_all()
    .unwrap_or_default()
    .into_iter()
    .filter(|thread| matches!(thread.thread_type, ThreadType::MeetingNotes))
    .collect::<Vec<_>>();
  let recent_chats = merged_mobile_chats().unwrap_or_default();
  let recent_emails = Email::get_recent_emails(140);

  let mut sections = Vec::new();

  let reply_cards = recent_emails
    .iter()
    .filter(|email| is_reply_candidate(email))
    .take(3)
    .enumerate()
    .map(|(index, email)| MobileAutopilotCard {
      id: format!("reply-{}-{index}", email.email_uid),
      kind: "reply".to_string(),
      title: email.subject.clone(),
      subtitle: format!("Reply to {}", email.sender),
      preview: clean_email_preview(&email.body),
      rationale: Some("Unread email that looks like a real conversation, not inbox noise.".to_string()),
      badge: Some("Needs attention".to_string()),
      timestamp: Some(email_timestamp_seconds(email)),
      email_uid: Some(email.email_uid.clone()),
      related_thread_id: None,
      related_chat_thread_id: None,
      suggested_prompts: vec![
        format!("Draft a concise reply to '{}' from {}.", email.subject, email.sender),
        format!("Summarize what {} needs from me in '{}'.", email.sender, email.subject),
      ],
    })
    .collect::<Vec<_>>();

  if !reply_cards.is_empty() {
    sections.push(MobileAutopilotSection {
      id: "needs-attention".to_string(),
      title: "Needs attention".to_string(),
      subtitle: Some("The few things most likely to require a response or decision.".to_string()),
      cards: reply_cards,
    });
  }

  let today_cards = calendar_events
    .iter()
    .take(3)
    .enumerate()
    .map(|(index, event)| MobileAutopilotCard {
      id: format!("event-{}-{index}", event.id),
      kind: "today".to_string(),
      title: event.title.clone().unwrap_or_else(|| "Upcoming event".to_string()),
      subtitle: format!("{}{}", format_mobile_timestamp(event.start), event.location.as_ref().map(|v| format!(" · {v}")).unwrap_or_default()),
      preview: event.description.clone().filter(|value| !value.trim().is_empty()),
      rationale: Some("Upcoming calendar event surfaced from your linked desktop account.".to_string()),
      badge: Some("Today".to_string()),
      timestamp: event.start,
      email_uid: None,
      related_thread_id: None,
      related_chat_thread_id: None,
      suggested_prompts: vec![
        format!("Prepare me for '{}'.", event.title.clone().unwrap_or_else(|| "this event".to_string())),
      ],
    })
    .collect::<Vec<_>>();

  let prep_cards = recent_meetings
    .into_iter()
    .take(2)
    .enumerate()
    .map(|(index, thread)| {
      let thread_id = thread.id.unwrap_or_default();
      let detail = mobile_meeting_detail(thread, load_mobile_metadata(thread_id).ok().flatten());
      let preview = detail
        .metadata
        .notes_preview
        .clone()
        .or(detail.notes.clone())
        .and_then(|value| clean_email_preview(&value));

      MobileAutopilotCard {
        id: format!("meeting-{}-{index}", thread_id),
        kind: "prep".to_string(),
        title: detail.thread.title.unwrap_or_else(|| "Recent meeting".to_string()),
        subtitle: "Recent note worth polishing or reusing".to_string(),
        preview,
        rationale: Some("Recent meeting notes are often the fastest way to prepare for the next conversation.".to_string()),
        badge: Some("Prep".to_string()),
        timestamp: detail.thread.timestamp,
        email_uid: None,
        related_thread_id: Some(thread_id),
        related_chat_thread_id: None,
        suggested_prompts: vec![
          format!("What are the follow-ups from meeting {}?", thread_id),
          format!("Turn meeting {} into a crisp prep brief.", thread_id),
        ],
      }
    })
    .collect::<Vec<_>>();

  let mut today_and_prep = Vec::new();
  today_and_prep.extend(today_cards);
  today_and_prep.extend(prep_cards);
  if !today_and_prep.is_empty() {
    sections.push(MobileAutopilotSection {
      id: "today".to_string(),
      title: "Today".to_string(),
      subtitle: Some("Meetings, logistics, and prep that should stay in view.".to_string()),
      cards: today_and_prep,
    });
  }

  let track_cards = recent_emails
    .iter()
    .filter(|email| !is_deleted_or_archived(email) && is_tracking_email(email))
    .take(4)
    .enumerate()
    .map(|(index, email)| MobileAutopilotCard {
      id: format!("track-{}-{index}", email.email_uid),
      kind: "track".to_string(),
      title: email.subject.clone(),
      subtitle: "Travel, purchase, package, or receipt update".to_string(),
      preview: clean_email_preview(&email.body),
      rationale: Some("Useful life-admin and logistics email that is worth keeping handy on phone.".to_string()),
      badge: Some("Track".to_string()),
      timestamp: Some(email_timestamp_seconds(email)),
      email_uid: Some(email.email_uid.clone()),
      related_thread_id: None,
      related_chat_thread_id: None,
      suggested_prompts: vec![
        format!("Pull the important details out of '{}'.", email.subject),
      ],
    })
    .collect::<Vec<_>>();

  let workspace_cards = recent_chats
    .into_iter()
    .take(2)
    .enumerate()
    .map(|(index, chat)| {
      let chat_id = chat.thread.id.unwrap_or_default();
      MobileAutopilotCard {
        id: format!("chat-{chat_id}-{index}"),
        kind: "workspace".to_string(),
        title: chat.thread.title.unwrap_or_else(|| "Recent chat".to_string()),
        subtitle: "Pick up an active desktop conversation".to_string(),
        preview: chat.preview.clone(),
        rationale: Some(
          "Knapsack can go beyond email by carrying your live desktop context onto the phone."
            .to_string(),
        ),
        badge: Some("Workspace".to_string()),
        timestamp: Some(chat.updated_at),
        email_uid: None,
        related_thread_id: None,
        related_chat_thread_id: Some(chat_id),
        suggested_prompts: vec![format!("Continue the conversation in chat {}.", chat_id)],
      }
    })
    .collect::<Vec<_>>();

  let mut track_and_workspace = Vec::new();
  track_and_workspace.extend(track_cards);
  track_and_workspace.extend(workspace_cards);
  if !track_and_workspace.is_empty() {
    sections.push(MobileAutopilotSection {
      id: "track".to_string(),
      title: "Track".to_string(),
      subtitle: Some("Useful logistics, receipts, and live work threads.".to_string()),
      cards: track_and_workspace,
    });
  }

  let mut sender_stats = HashMap::<String, SenderStat>::new();
  for email in recent_emails.iter().filter(|email| !is_deleted_or_archived(email)) {
    let sender_key = email.sender.trim().to_lowercase();
    if sender_key.is_empty() || !is_noise_email(email) {
      continue;
    }
    let stat = sender_stats.entry(sender_key).or_default();
    stat.count += 1;
    if is_unread(email) {
      stat.unread_count += 1;
    }
    if stat.latest_subject.is_none() {
      stat.latest_subject = Some(email.subject.clone());
    }
  }

  let mut cleanup_cards = sender_stats
    .into_iter()
    .filter(|(_, stat)| stat.count >= 2)
    .collect::<Vec<_>>();
  cleanup_cards.sort_by(|left, right| right.1.count.cmp(&left.1.count));

  let cleanup_cards = cleanup_cards
    .into_iter()
    .take(4)
    .enumerate()
    .map(|(index, (sender, stat))| MobileAutopilotCard {
      id: format!("cleanup-{}-{index}", sender),
      kind: "cleanup".to_string(),
      title: sender.clone(),
      subtitle: format!("{} recent messages, {} still unread", stat.count, stat.unread_count),
      preview: stat.latest_subject.clone(),
      rationale: Some("Good candidate for unsubscribe, mute, or bulk archive.".to_string()),
      badge: Some("Clean up".to_string()),
      timestamp: None,
      email_uid: recent_emails
        .iter()
        .find(|email| email.sender.trim().eq_ignore_ascii_case(&sender))
        .map(|email| email.email_uid.clone()),
      related_thread_id: None,
      related_chat_thread_id: None,
      suggested_prompts: vec![
        format!("Help me clean up mail from {}.", sender),
      ],
    })
    .collect::<Vec<_>>();

  if !cleanup_cards.is_empty() {
    sections.push(MobileAutopilotSection {
      id: "cleanup".to_string(),
      title: "Clean up".to_string(),
      subtitle: Some("Senders worth muting or unsubscribing from next.".to_string()),
      cards: cleanup_cards,
    });
  }

  let attention_count = sections
    .iter()
    .find(|section| section.id == "needs-attention")
    .map(|section| section.cards.len())
    .unwrap_or_default();
  let event_count = calendar_events.len();

  MobileAutopilotBrief {
    headline: if attention_count > 0 {
      format!("{} thing{} likely need your attention", attention_count, if attention_count == 1 { "" } else { "s" })
    } else {
      "Your workspace looks under control".to_string()
    },
    summary: format!(
      "Knapsack scanned your linked workspace{} and found {} section{} to keep your day moving.",
      if session.email_connected { ", calendar, and recent email" } else { " and calendar" },
      sections.len(),
      if sections.len() == 1 { "" } else { "s" }
    ) + &if event_count > 0 {
      format!(" You have {} upcoming calendar item{} in view.", event_count, if event_count == 1 { "" } else { "s" })
    } else {
      String::new()
    },
    generated_at: now,
    sections,
  }
}

fn is_gbrain_thread(thread: &Thread) -> bool {
  thread
    .title
    .as_deref()
    .unwrap_or_default()
    .to_lowercase()
    .contains("gbrain")
}

fn format_mobile_timestamp(timestamp: Option<i64>) -> String {
  timestamp
    .and_then(|value| chrono::DateTime::from_timestamp(value, 0))
    .map(|value| value.format("%b %-d at %-I:%M %p").to_string())
    .unwrap_or_else(|| "Unknown time".to_string())
}

fn build_mobile_gbrain_context(current_thread_id: u64) -> String {
  let session = build_mobile_session();
  let upcoming_events = build_mobile_calendar_events(5);
  let recent_chats = merged_mobile_chats()
    .unwrap_or_default()
    .into_iter()
    .filter(|chat| chat.thread.id != Some(current_thread_id))
    .take(5)
    .collect::<Vec<_>>();

  let mut meeting_threads = Thread::find_all()
    .unwrap_or_default()
    .into_iter()
    .filter(|thread| matches!(thread.thread_type, ThreadType::MeetingNotes))
    .collect::<Vec<_>>();
  meeting_threads.sort_by(|left, right| {
    right
      .timestamp
      .unwrap_or_default()
      .cmp(&left.timestamp.unwrap_or_default())
  });

  let recent_meetings = meeting_threads
    .into_iter()
    .take(5)
    .map(|thread| {
      let thread_id = thread.id.unwrap_or_default();
      let detail = mobile_meeting_detail(thread, load_mobile_metadata(thread_id).ok().flatten());
      let note_preview = detail
        .metadata
        .notes_preview
        .clone()
        .or(detail.notes.clone())
        .unwrap_or_default()
        .lines()
        .next()
        .unwrap_or("No notes yet.")
        .trim()
        .to_string();
      format!(
        "- {} ({}) :: {}",
        detail
          .thread
          .title
          .unwrap_or_else(|| "Untitled meeting".to_string()),
        format_mobile_timestamp(detail.thread.timestamp),
        note_preview
      )
    })
    .collect::<Vec<_>>();

  let brain_root = default_brain_root().to_string_lossy().to_string();
  let brain_entries = kn_brain_list(brain_root, String::new())
    .unwrap_or_default()
    .into_iter()
    .take(8)
    .map(|entry| {
      if entry.is_dir {
        format!("- {}/", entry.name)
      } else {
        format!("- {}", entry.name)
      }
    })
    .collect::<Vec<_>>();

  let connected_tools = [
    ("calendar", session.calendar_connected),
    ("email", session.email_connected),
    ("drive", session.drive_connected),
  ]
  .into_iter()
  .filter_map(|(name, connected)| connected.then_some(name))
  .collect::<Vec<_>>();

  let event_lines = upcoming_events
    .into_iter()
    .map(|event| {
      format!(
        "- {} ({})",
        event.title.unwrap_or_else(|| "Untitled event".to_string()),
        format_mobile_timestamp(event.start)
      )
    })
    .collect::<Vec<_>>();

  let chat_lines = recent_chats
    .into_iter()
    .map(|chat| {
      format!(
        "- {} :: {}",
        chat
          .thread
          .title
          .unwrap_or_else(|| "Untitled chat".to_string()),
        chat
          .preview
          .unwrap_or_else(|| "No preview available.".to_string())
      )
    })
    .collect::<Vec<_>>();

  format!(
    "Knapsack mobile workspace context\nLinked account: {}\nConnected tools: {}\n\nUpcoming calendar\n{}\n\nRecent meetings\n{}\n\nRecent desktop chats\n{}\n\nAvailable brain pages\n{}\n\nInstructions\n- Use this context directly when answering.\n- Do not say you lack access to meetings, chats, calendar, or brain pages unless the relevant section above is empty.\n- Answer for a mobile knowledge worker: concise, concrete, and action-oriented.",
    session
      .profile
      .as_ref()
      .map(|profile| profile.email.clone())
      .unwrap_or_else(|| "Not linked".to_string()),
    if connected_tools.is_empty() {
      "none".to_string()
    } else {
      connected_tools.join(", ")
    },
    if event_lines.is_empty() {
      "- No upcoming events found.".to_string()
    } else {
      event_lines.join("\n")
    },
    if recent_meetings.is_empty() {
      "- No recent meetings found.".to_string()
    } else {
      recent_meetings.join("\n")
    },
    if chat_lines.is_empty() {
      "- No recent chats found.".to_string()
    } else {
      chat_lines.join("\n")
    },
    if brain_entries.is_empty() {
      "- No brain pages found.".to_string()
    } else {
      brain_entries.join("\n")
    },
  )
}

fn mobile_meeting_detail(
  thread: Thread,
  metadata: Option<MobileMeetingMetadata>,
) -> MobileMeetingDetail {
  let notes = thread.id.and_then(load_notes);
  let mut merged = metadata.unwrap_or_else(|| {
    build_default_metadata(thread.id.unwrap_or_default(), Some("iphone".to_string()))
  });
  if merged.notes_preview.is_none() {
    merged.notes_preview = notes
      .as_ref()
      .map(|value| value.lines().take(3).collect::<Vec<_>>().join("\n"))
      .filter(|value| !value.is_empty());
  }
  MobileMeetingDetail {
    thread,
    metadata: merged,
    notes,
  }
}

fn mobile_chat_message(message: Message) -> MobileChatMessage {
  MobileChatMessage {
    id: message.id,
    timestamp: message.timestamp,
    role: if message.user_id.is_some() {
      "user".to_string()
    } else {
      "assistant".to_string()
    },
    content: message
      .content_facade
      .clone()
      .filter(|value| !value.trim().is_empty())
      .unwrap_or(message.content),
  }
}

fn mobile_chat_detail_from_thread(thread: Thread, messages: Vec<Message>) -> MobileChatDetail {
  let updated_at = messages
    .last()
    .map(|message| message.timestamp)
    .or(thread.timestamp)
    .unwrap_or_else(|| chrono::Utc::now().timestamp());

  MobileChatDetail {
    thread,
    messages: messages.into_iter().map(mobile_chat_message).collect(),
    updated_at,
  }
}

fn seed_history_message(role: &str, content: String) -> Value {
  json!({
    "role": role,
    "content": content,
  })
}

fn build_seed_history_from_messages(messages: &[Message]) -> Vec<Value> {
  let mut seed = messages
    .iter()
    .filter_map(|message| {
      let content = thread_message_preview(message)?;
      Some(seed_history_message(
        if message.user_id.is_some() {
          "user"
        } else {
          "assistant"
        },
        content,
      ))
    })
    .collect::<Vec<_>>();

  if seed.len() > MOBILE_CHAT_SEED_HISTORY_LIMIT {
    seed.drain(0..seed.len() - MOBILE_CHAT_SEED_HISTORY_LIMIT);
  }

  seed
}

fn build_seed_history_for_thread(
  thread_id: u64,
  existing_messages: &[Message],
) -> Result<Vec<Value>, Error> {
  if !existing_messages.is_empty() {
    return Ok(build_seed_history_from_messages(existing_messages));
  }

  let feed_backed_messages = feed_backed_mobile_chat_detail(thread_id)?
    .map(|detail| {
      detail
        .messages
        .into_iter()
        .filter_map(|message| {
          let content = message.content.trim();
          if content.is_empty() {
            None
          } else {
            Some(seed_history_message(&message.role, content.to_string()))
          }
        })
        .collect::<Vec<_>>()
    })
    .unwrap_or_default();

  Ok(
    feed_backed_messages
      .into_iter()
      .rev()
      .take(MOBILE_CHAT_SEED_HISTORY_LIMIT)
      .collect::<Vec<_>>()
      .into_iter()
      .rev()
      .collect(),
  )
}

fn parse_gateway_payload_text(raw: &str) -> String {
  let trimmed = raw.trim();
  if !trimmed.starts_with("data:") {
    return trimmed.to_string();
  }

  let mut chunks = Vec::new();
  for line in trimmed.lines() {
    let line = line.trim();
    if !line.starts_with("data:") {
      continue;
    }
    let payload = line.trim_start_matches("data:").trim();
    if payload.is_empty() || payload == "[DONE]" {
      continue;
    }
    if let Ok(value) = serde_json::from_str::<Value>(payload) {
      if let Some(text) = value.get("content").and_then(|item| item.as_str()) {
        chunks.push(text.to_string());
        continue;
      }
      if let Some(text) = value.get("text").and_then(|item| item.as_str()) {
        chunks.push(text.to_string());
        continue;
      }
    }
    chunks.push(payload.to_string());
  }

  if chunks.is_empty() {
    trimmed.to_string()
  } else {
    chunks.join("\n\n")
  }
}

fn gateway_run_failed(status: &str) -> bool {
  matches!(
    status.trim().to_ascii_lowercase().as_str(),
    "failed" | "error" | "timed_out" | "expired" | "cancelled" | "rejected"
  )
}

fn gateway_reply_from_result(result: &Value) -> Option<String> {
  let status = result
    .get("status")
    .and_then(|value| value.as_str())
    .unwrap_or("unknown");
  if gateway_run_failed(status) {
    return None;
  }

  let reply = result
    .pointer("/result/payloads")
    .and_then(|payloads| payloads.as_array())
    .map(|payloads| {
      payloads
        .iter()
        .filter_map(|payload| payload.get("text").and_then(|text| text.as_str()))
        .map(parse_gateway_payload_text)
        .collect::<Vec<_>>()
        .join("\n\n")
    })
    .or_else(|| {
      result
        .get("summary")
        .and_then(|summary| summary.as_str())
        .map(|summary| summary.to_string())
    })
    .unwrap_or_default();

  let reply = reply.trim().to_string();
  if reply.is_empty() { None } else { Some(reply) }
}

fn thread_message_preview(message: &Message) -> Option<String> {
  message
    .content_facade
    .clone()
    .filter(|value| !value.trim().is_empty())
    .or_else(|| {
      let trimmed = message.content.trim();
      if trimmed.is_empty() {
        None
      } else {
        Some(trimmed.to_string())
      }
    })
}

fn mobile_chat_summary_from_thread_messages(
  thread: Thread,
  messages: Vec<Message>,
) -> MobileChatSummary {
  let preview = messages.last().and_then(thread_message_preview);
  let updated_at = messages
    .last()
    .map(|message| message.timestamp)
    .or(thread.timestamp)
    .unwrap_or_else(|| chrono::Utc::now().timestamp());

  MobileChatSummary {
    thread,
    preview,
    updated_at,
    message_count: messages.len(),
  }
}

fn mobile_chat_summary_from_thread_with_messages(
  thread_with_messages: ThreadWithMessages,
) -> MobileChatSummary {
  mobile_chat_summary_from_thread_messages(
    thread_with_messages.thread,
    thread_with_messages.messages,
  )
}

fn feed_backed_mobile_chats() -> Result<Vec<MobileChatSummary>, Error> {
  let mut chats = Vec::new();

  for feed_item in FeedItem::find_all_complete()? {
    for thread_with_messages in feed_item.threads.unwrap_or_default() {
      if matches!(thread_with_messages.thread.thread_type, ThreadType::Chat) {
        chats.push(mobile_chat_summary_from_thread_with_messages(
          thread_with_messages,
        ));
      }
    }
  }

  Ok(chats)
}

fn merged_mobile_chats() -> Result<Vec<MobileChatSummary>, Error> {
  let mut merged = std::collections::BTreeMap::<u64, MobileChatSummary>::new();

  for chat in feed_backed_mobile_chats()? {
    if let Some(thread_id) = chat.thread.id {
      merged.insert(thread_id, chat);
    }
  }

  for thread in Thread::find_all()? {
    if !matches!(thread.thread_type, ThreadType::Chat) {
      continue;
    }

    let thread_id = match thread.id {
      Some(thread_id) => thread_id,
      None => continue,
    };

    let messages = Message::find_by_thread_id(thread_id)?;
    let candidate = mobile_chat_summary_from_thread_messages(thread, messages);
    match merged.get(&thread_id) {
      Some(existing)
        if existing.message_count > candidate.message_count
          || (existing.message_count == candidate.message_count
            && existing.updated_at >= candidate.updated_at) => {}
      _ => {
        merged.insert(thread_id, candidate);
      }
    }
  }

  let mut chats = merged.into_values().collect::<Vec<_>>();
  chats.sort_by(|left, right| right.updated_at.cmp(&left.updated_at));
  chats.truncate(30);
  Ok(chats)
}

fn feed_backed_mobile_chat_detail(thread_id: u64) -> Result<Option<MobileChatDetail>, Error> {
  for feed_item in FeedItem::find_all_complete()? {
    for thread_with_messages in feed_item.threads.unwrap_or_default() {
      if thread_with_messages.thread.id == Some(thread_id)
        && matches!(thread_with_messages.thread.thread_type, ThreadType::Chat)
      {
        return Ok(Some(mobile_chat_detail_from_thread(
          thread_with_messages.thread,
          thread_with_messages.messages,
        )));
      }
    }
  }

  Ok(None)
}

fn mobile_user_id() -> Option<u64> {
  let profile = infer_linked_profile()?;
  User::find_by_email(profile.email)
    .ok()
    .and_then(|user| user.id)
    .or_else(|| User::find_first_with_email().ok().and_then(|user| user.id))
}

#[get("/api/knapsack/mobile/session")]
pub async fn get_mobile_session() -> impl Responder {
  HttpResponse::Ok().json(json!({
    "success": true,
    "data": build_mobile_session()
  }))
}

#[get("/api/knapsack/mobile/calendar")]
pub async fn list_mobile_calendar_events() -> impl Responder {
  HttpResponse::Ok().json(json!({
    "success": true,
    "data": build_mobile_calendar_events(20)
  }))
}

#[get("/api/knapsack/mobile/autopilot")]
pub async fn get_mobile_autopilot() -> impl Responder {
  HttpResponse::Ok().json(json!({
    "success": true,
    "data": build_mobile_autopilot_brief()
  }))
}

#[get("/api/knapsack/mobile/autopilot/email/{email_uid}")]
pub async fn get_mobile_autopilot_email(path: web::Path<String>) -> impl Responder {
  match build_mobile_autopilot_email_detail(&path.into_inner()) {
    Ok(detail) => HttpResponse::Ok().json(json!({
      "success": true,
      "data": detail
    })),
    Err(err) => HttpResponse::NotFound().json(json!({
      "success": false,
      "error": err.to_string()
    })),
  }
}

#[post("/api/knapsack/mobile/autopilot/email/{email_uid}/action")]
pub async fn perform_mobile_autopilot_email_action(
  path: web::Path<String>,
  payload: Json<MobileAutopilotEmailActionRequest>,
) -> impl Responder {
  let email_uid = path.into_inner();
  let action = payload.action.trim().to_lowercase();

  let result = match action.as_str() {
    "mark_read" | "archive" | "delete" => {
      let email = match Email::find_by_uid(&email_uid) {
        Ok(Some(email)) => email,
        Ok(None) => {
          return HttpResponse::NotFound().json(json!({
            "success": false,
            "error": "Email not found"
          }))
        }
        Err(err) => {
          return HttpResponse::InternalServerError().json(json!({
            "success": false,
            "error": err.to_string()
          }))
        }
      };

      match detect_mobile_email_provider(&email.account_email) {
        Ok(MobileEmailProvider::Google) => {
          perform_google_email_action(&email.account_email, &email.email_uid, &action).await
        }
        Ok(MobileEmailProvider::Microsoft) => {
          perform_microsoft_email_action(&email.account_email, &email.email_uid, &action).await
        }
        Err(err) => Err(err),
      }
      .and_then(|_| mark_local_email_state(&email_uid, &action))
    }
    "reply" => send_mobile_email_reply(&email_uid, payload.reply_body.as_deref().unwrap_or("")).await,
    _ => Err(Error::KSError(format!("Unsupported action: {}", action))),
  };

  match result {
    Ok(_) => match build_mobile_autopilot_email_detail(&email_uid) {
      Ok(detail) => HttpResponse::Ok().json(json!({
        "success": true,
        "data": detail
      })),
      Err(err) => HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": err.to_string()
      })),
    },
    Err(err) => HttpResponse::BadRequest().json(json!({
      "success": false,
      "error": err.to_string()
    })),
  }
}

#[get("/api/knapsack/mobile/gbrain/root")]
pub async fn get_mobile_gbrain_root() -> impl Responder {
  HttpResponse::Ok().json(json!({
    "success": true,
    "data": default_brain_root().to_string_lossy().to_string()
  }))
}

#[get("/api/knapsack/mobile/gbrain/list")]
pub async fn list_mobile_gbrain_entries(query: web::Query<MobileBrainListQuery>) -> impl Responder {
  let brain_root = default_brain_root().to_string_lossy().to_string();
  let sub_path = query.sub_path.clone().unwrap_or_default();

  match kn_brain_list(brain_root, sub_path) {
    Ok(entries) => HttpResponse::Ok().json(json!({
      "success": true,
      "data": entries
    })),
    Err(err) => HttpResponse::BadRequest().json(json!({
      "success": false,
      "error": err
    })),
  }
}

#[get("/api/knapsack/mobile/gbrain/page")]
pub async fn get_mobile_gbrain_page(query: web::Query<MobileBrainPageQuery>) -> impl Responder {
  let brain_root = default_brain_root().to_string_lossy().to_string();
  let rel_path = query.rel_path.trim().to_string();

  if rel_path.is_empty() {
    return HttpResponse::BadRequest().json(json!({
      "success": false,
      "error": "Brain page path is required"
    }));
  }

  match kn_brain_read_page(brain_root, rel_path.clone()) {
    Ok(content) => {
      let fallback = rel_path
        .split('/')
        .last()
        .unwrap_or("Brain page");
      let title = crate::clawd::gbrain::markdown_title(&content, fallback);

      HttpResponse::Ok().json(json!({
        "success": true,
        "data": MobileBrainPage {
          rel_path,
          title,
          content,
        }
      }))
    }
    Err(err) => HttpResponse::BadRequest().json(json!({
      "success": false,
      "error": err
    })),
  }
}

#[get("/api/knapsack/mobile/chats")]
pub async fn list_mobile_chats() -> impl Responder {
  let chats = match merged_mobile_chats() {
    Ok(chats) => chats,
    Err(err) => {
      log::error!("Failed to list threads for mobile chats: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to list mobile chats"
      }));
    }
  };

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": chats
  }))
}

#[get("/api/knapsack/mobile/chats/{thread_id}")]
pub async fn get_mobile_chat(path: web::Path<u64>) -> impl Responder {
  let thread_id = path.into_inner();
  let detail = match Thread::find_by_id(thread_id) {
    Ok(Some(thread)) => {
      if !matches!(thread.thread_type, ThreadType::Chat) {
        return HttpResponse::BadRequest().json(json!({
          "success": false,
          "error": "Requested thread is not a chat"
        }));
      }

      let messages = match Message::find_by_thread_id(thread_id) {
        Ok(messages) => messages,
        Err(err) => {
          log::error!(
            "Failed to load messages for mobile chat {}: {:?}",
            thread_id,
            err
          );
          return HttpResponse::InternalServerError().json(json!({
            "success": false,
            "error": "Failed to load chat messages"
          }));
        }
      };

      if messages.is_empty() {
        match feed_backed_mobile_chat_detail(thread_id) {
          Ok(Some(detail)) => detail,
          Ok(None) => mobile_chat_detail_from_thread(thread, messages),
          Err(err) => {
            log::error!(
              "Failed to load feed-backed mobile chat {}: {:?}",
              thread_id,
              err
            );
            return HttpResponse::InternalServerError().json(json!({
              "success": false,
              "error": "Failed to load mobile chat"
            }));
          }
        }
      } else {
        mobile_chat_detail_from_thread(thread, messages)
      }
    }
    Ok(None) => match feed_backed_mobile_chat_detail(thread_id) {
      Ok(Some(detail)) => detail,
      Ok(None) => {
        return HttpResponse::NotFound().json(json!({
          "success": false,
          "error": "Chat not found"
        }))
      }
      Err(err) => {
        log::error!("Failed to get feed-backed mobile chat thread: {:?}", err);
        return HttpResponse::InternalServerError().json(json!({
          "success": false,
          "error": "Failed to load mobile chat"
        }));
      }
    },
    Err(err) => {
      log::error!("Failed to get mobile chat thread: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to load mobile chat"
      }));
    }
  };

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": detail
  }))
}

#[post("/api/knapsack/mobile/chats")]
pub async fn create_mobile_chat(data: Json<CreateMobileChatRequest>) -> impl Responder {
  let mut thread = Thread {
    id: None,
    timestamp: Some(chrono::Utc::now().timestamp()),
    hide_follow_up: Some(false),
    feed_item_id: None,
    title: data.title.clone().or_else(|| Some("New chat".to_string())),
    subtitle: Some("Started from iPhone".to_string()),
    thread_type: ThreadType::Chat,
    recorded: Some(false),
    saved_transcript: None,
    prompt_template: None,
  };

  if let Err(err) = thread.create() {
    log::error!("Failed to create mobile chat thread: {:?}", err);
    return HttpResponse::InternalServerError().json(json!({
      "success": false,
      "error": "Failed to create mobile chat"
    }));
  }

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": MobileChatDetail {
      thread,
      messages: vec![],
      updated_at: chrono::Utc::now().timestamp(),
    }
  }))
}

#[post("/api/knapsack/mobile/chats/{thread_id}/messages")]
pub async fn send_mobile_chat_message(
  path: web::Path<u64>,
  data: Json<SendMobileChatMessageRequest>,
) -> impl Responder {
  let thread_id = path.into_inner();
  let text = data.text.trim().to_string();

  if text.is_empty() {
    return HttpResponse::BadRequest().json(json!({
      "success": false,
      "error": "Message text is required"
    }));
  }

  let thread = match Thread::find_by_id(thread_id) {
    Ok(Some(thread)) => thread,
    Ok(None) => {
      return HttpResponse::NotFound().json(json!({
        "success": false,
        "error": "Chat not found"
      }))
    }
    Err(err) => {
      log::error!("Failed to get mobile chat thread for send: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to load mobile chat"
      }));
    }
  };

  if !matches!(thread.thread_type, ThreadType::Chat) {
    return HttpResponse::BadRequest().json(json!({
      "success": false,
      "error": "Requested thread is not a chat"
    }));
  }

  let existing_messages = match Message::find_by_thread_id(thread_id) {
    Ok(messages) => messages,
    Err(err) => {
      log::error!(
        "Failed to load existing mobile chat messages for seed history {}: {:?}",
        thread_id,
        err
      );
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to load existing chat history"
      }));
    }
  };

  let seed_history = match build_seed_history_for_thread(thread_id, &existing_messages) {
    Ok(seed_history) => seed_history,
    Err(err) => {
      log::error!(
        "Failed to build seed history for mobile chat {}: {:?}",
        thread_id,
        err
      );
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to prepare chat history"
      }));
    }
  };

  let mut user_message = Message {
    id: None,
    timestamp: chrono::Utc::now().timestamp(),
    thread_id,
    user_id: mobile_user_id(),
    content: text.clone(),
    content_facade: Some(text.clone()),
    feedbacks: None,
    document_ids: None,
  };

  if let Err(err) = user_message.create() {
    log::error!("Failed to create mobile user chat message: {:?}", err);
    return HttpResponse::InternalServerError().json(json!({
      "success": false,
      "error": "Failed to save mobile chat message"
    }));
  }

  let request_text = if is_gbrain_thread(&thread) {
    format!(
      "{}\n\nUser request\n{}",
      build_mobile_gbrain_context(thread_id),
      text
    )
  } else {
    text.clone()
  };

  let mut attachments = Vec::new();
  if !seed_history.is_empty() {
    attachments.push(json!({
      "name": "mobile-seed-history.json",
      "type": "application/json",
      "content": serde_json::to_string(&seed_history).unwrap_or_else(|_| "[]".to_string()),
    }));
  }

  let gateway_result =
    match gateway_client::agent_chat(&request_text, &attachments, None, Some("dm"), None).await {
      Ok(result) => result,
      Err(err) => {
        log::error!("Mobile chat gateway request failed: {:?}", err);
        return HttpResponse::BadGateway().json(json!({
          "success": false,
          "error": "Desktop chat is unavailable"
        }));
      }
    };

  let reply = gateway_reply_from_result(&gateway_result).unwrap_or_default();

  if reply.is_empty() {
    let error_message = gateway_result
      .get("message")
      .or_else(|| gateway_result.get("error"))
      .and_then(|value| value.as_str())
      .unwrap_or("Desktop chat did not return a response");
    return HttpResponse::BadGateway().json(json!({
      "success": false,
      "error": error_message
    }));
  }

  let mut assistant_message = Message {
    id: None,
    timestamp: chrono::Utc::now().timestamp(),
    thread_id,
    user_id: None,
    content: reply.clone(),
    content_facade: Some(reply),
    feedbacks: None,
    document_ids: None,
  };

  if let Err(err) = assistant_message.create() {
    log::error!("Failed to save desktop reply for mobile chat: {:?}", err);
    return HttpResponse::InternalServerError().json(json!({
      "success": false,
      "error": "Failed to save desktop reply"
    }));
  }

  let refreshed_messages = match Message::find_by_thread_id(thread_id) {
    Ok(messages) => messages,
    Err(err) => {
      log::error!("Failed to load refreshed mobile chat messages: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to load refreshed chat"
      }));
    }
  };

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": mobile_chat_detail_from_thread(thread, refreshed_messages)
  }))
}

#[post("/api/knapsack/mobile/meetings")]
pub async fn create_mobile_meeting(data: Json<CreateMobileMeetingRequest>) -> impl Responder {
  let mut thread = Thread {
    id: None,
    timestamp: Some(chrono::Utc::now().timestamp()),
    hide_follow_up: Some(false),
    feed_item_id: None,
    title: data
      .title
      .clone()
      .or_else(|| Some("Mobile meeting".to_string())),
    subtitle: data.subtitle.clone(),
    thread_type: ThreadType::MeetingNotes,
    recorded: Some(false),
    saved_transcript: None,
    prompt_template: None,
  };

  if let Err(err) = thread.create() {
    log::error!("Failed to create mobile meeting thread: {:?}", err);
    return HttpResponse::InternalServerError().json(json!({
      "success": false,
      "error": "Failed to create mobile meeting"
    }));
  }

  let metadata = build_default_metadata(
    thread.id.unwrap_or_default(),
    data
      .source_device
      .clone()
      .or_else(|| Some("iphone".to_string())),
  );
  if let Err(err) = save_mobile_metadata(&metadata) {
    log::error!("Failed to save mobile metadata: {:?}", err);
    return HttpResponse::InternalServerError().json(json!({
      "success": false,
      "error": "Failed to persist mobile meeting metadata"
    }));
  }

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": mobile_meeting_detail(thread, Some(metadata))
  }))
}

#[get("/api/knapsack/mobile/meetings")]
pub async fn list_mobile_meetings() -> impl Responder {
  let threads = match Thread::find_all() {
    Ok(threads) => threads,
    Err(err) => {
      log::error!("Failed to list threads for mobile meetings: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to list mobile meetings"
      }));
    }
  };

  let meetings: Vec<MobileMeetingDetail> = threads
    .into_iter()
    .filter(|thread| matches!(thread.thread_type, ThreadType::MeetingNotes))
    .take(50)
    .map(|thread| {
      let metadata = thread
        .id
        .and_then(|thread_id| load_mobile_metadata(thread_id).ok().flatten());
      mobile_meeting_detail(thread, metadata)
    })
    .collect();

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": meetings
  }))
}

#[get("/api/knapsack/mobile/meetings/{thread_id}")]
pub async fn get_mobile_meeting(path: web::Path<u64>) -> impl Responder {
  let thread_id = path.into_inner();
  let thread = match Thread::find_by_id(thread_id) {
    Ok(Some(thread)) => thread,
    Ok(None) => {
      return HttpResponse::NotFound().json(json!({
        "success": false,
        "error": "Meeting not found"
      }))
    }
    Err(err) => {
      log::error!("Failed to get mobile meeting: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to load mobile meeting"
      }));
    }
  };
  let metadata = load_mobile_metadata(thread_id).ok().flatten();
  HttpResponse::Ok().json(json!({
    "success": true,
    "data": mobile_meeting_detail(thread, metadata)
  }))
}

#[post("/api/knapsack/mobile/meetings/{thread_id}/notes")]
pub async fn save_mobile_notes(
  path: web::Path<u64>,
  data: Json<SaveMobileNotesRequest>,
) -> impl Responder {
  let thread_id = path.into_inner();
  if let Err(err) = save_notes_to_file(thread_id, &data.notes) {
    log::error!("Failed to save mobile notes: {:?}", err);
    return HttpResponse::InternalServerError().json(json!({
      "success": false,
      "error": "Failed to save notes"
    }));
  }

  let mut metadata = load_mobile_metadata(thread_id)
    .ok()
    .flatten()
    .unwrap_or_else(|| build_default_metadata(thread_id, Some("iphone".to_string())));
  metadata.notes_preview = Some(data.notes.lines().take(3).collect::<Vec<_>>().join("\n"));
  metadata.updated_at = chrono::Utc::now().timestamp();
  let _ = save_mobile_metadata(&metadata);

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": metadata
  }))
}

#[post("/api/knapsack/mobile/meetings/{thread_id}/status")]
pub async fn update_mobile_meeting_status(
  path: web::Path<u64>,
  data: Json<UpdateMobileMeetingStatusRequest>,
) -> impl Responder {
  let thread_id = path.into_inner();
  let mut metadata = load_mobile_metadata(thread_id)
    .ok()
    .flatten()
    .unwrap_or_else(|| build_default_metadata(thread_id, data.source_device.clone()));

  metadata.status = data.status.clone();
  metadata.source_device = data.source_device.clone().or(metadata.source_device);
  metadata.started_at = data.started_at.or(metadata.started_at);
  metadata.ended_at = data.ended_at.or(metadata.ended_at);
  metadata.updated_at = chrono::Utc::now().timestamp();

  if let Err(err) = save_mobile_metadata(&metadata) {
    log::error!("Failed to update mobile meeting status: {:?}", err);
    return HttpResponse::InternalServerError().json(json!({
      "success": false,
      "error": "Failed to update status"
    }));
  }

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": metadata
  }))
}

#[post("/api/knapsack/mobile/meetings/{thread_id}/recording")]
pub async fn upload_mobile_recording(
  path: web::Path<u64>,
  mut payload: Multipart,
) -> impl Responder {
  let thread_id = path.into_inner();
  let mut source_device: Option<String> = None;
  let mut started_at: Option<i64> = None;
  let mut ended_at: Option<i64> = None;
  let mut stored_file: Option<String> = None;

  while let Some(field_result) = payload.next().await {
    let mut field = match field_result {
      Ok(field) => field,
      Err(err) => {
        log::error!("Failed to read multipart field: {:?}", err);
        return HttpResponse::BadRequest().json(json!({
          "success": false,
          "error": "Invalid multipart payload"
        }));
      }
    };

    let name = field.name().to_string();
    if name == "file" {
      let filename = field
        .content_disposition()
        .get_filename()
        .map(|value| value.to_string())
        .unwrap_or_else(|| "recording.m4a".to_string());
      let sanitized_filename = filename.replace('/', "_");
      let target_path = match mobile_recordings_dir() {
        Ok(dir) => dir.join(format!(
          "{thread_id}-{}-{sanitized_filename}",
          chrono::Utc::now().timestamp()
        )),
        Err(err) => {
          log::error!("Failed to resolve mobile recordings dir: {:?}", err);
          return HttpResponse::InternalServerError().json(json!({
            "success": false,
            "error": "Failed to prepare mobile recordings dir"
          }));
        }
      };

      let mut file = match File::create(&target_path) {
        Ok(file) => file,
        Err(err) => {
          log::error!("Failed to create uploaded recording file: {:?}", err);
          return HttpResponse::InternalServerError().json(json!({
            "success": false,
            "error": "Failed to store recording"
          }));
        }
      };

      while let Some(chunk_result) = field.next().await {
        let chunk = match chunk_result {
          Ok(chunk) => chunk,
          Err(err) => {
            log::error!("Failed to read upload chunk: {:?}", err);
            return HttpResponse::BadRequest().json(json!({
              "success": false,
              "error": "Failed while reading uploaded file"
            }));
          }
        };
        if let Err(err) = file.write_all(&chunk) {
          log::error!("Failed to write uploaded recording: {:?}", err);
          return HttpResponse::InternalServerError().json(json!({
            "success": false,
            "error": "Failed to save uploaded file"
          }));
        }
      }

      stored_file = Some(target_path.to_string_lossy().to_string());
    } else {
      let mut bytes = Vec::new();
      while let Some(chunk_result) = field.next().await {
        let chunk = match chunk_result {
          Ok(chunk) => chunk,
          Err(err) => {
            log::error!("Failed to read multipart text field: {:?}", err);
            return HttpResponse::BadRequest().json(json!({
              "success": false,
              "error": "Invalid multipart text field"
            }));
          }
        };
        bytes.extend_from_slice(&chunk);
      }
      let value = String::from_utf8(bytes).unwrap_or_default();
      match name.as_str() {
        "sourceDevice" => source_device = Some(value),
        "startedAt" => started_at = value.parse::<i64>().ok(),
        "endedAt" => ended_at = value.parse::<i64>().ok(),
        _ => {}
      }
    }
  }

  if stored_file.is_none() {
    return HttpResponse::BadRequest().json(json!({
      "success": false,
      "error": "No file field supplied"
    }));
  }

  let mut metadata = load_mobile_metadata(thread_id)
    .ok()
    .flatten()
    .unwrap_or_else(|| build_default_metadata(thread_id, source_device.clone()));
  metadata.status = MobileMeetingStatus::Uploaded;
  metadata.source_device = source_device.or(metadata.source_device);
  metadata.latest_audio_file = stored_file.clone();
  metadata.started_at = started_at.or(metadata.started_at);
  metadata.ended_at = ended_at.or(metadata.ended_at);
  metadata.updated_at = chrono::Utc::now().timestamp();

  if let Err(err) = save_mobile_metadata(&metadata) {
    log::error!("Failed to persist metadata after upload: {:?}", err);
    return HttpResponse::InternalServerError().json(json!({
      "success": false,
      "error": "Failed to persist upload metadata"
    }));
  }

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": metadata
  }))
}

#[cfg(test)]
mod tests {
  use super::{gateway_reply_from_result, parse_gateway_payload_text};
  use serde_json::json;

  #[test]
  fn parses_plain_gateway_payload_text() {
    assert_eq!(parse_gateway_payload_text("hello"), "hello");
  }

  #[test]
  fn parses_sse_gateway_payload_text() {
    let raw = "data: {\"text\":\"First\"}\n\ndata: {\"content\":\"Second\"}\n\ndata: [DONE]";
    assert_eq!(parse_gateway_payload_text(raw), "First\n\nSecond");
  }

  #[test]
  fn extracts_reply_from_gateway_payloads() {
    let result = json!({
      "status": "completed",
      "result": {
        "payloads": [
          { "text": "data: {\"text\":\"A\"}\n\ndata: {\"text\":\"B\"}\n\ndata: [DONE]" }
        ]
      }
    });

    assert_eq!(gateway_reply_from_result(&result).as_deref(), Some("A\n\nB"));
  }
}
