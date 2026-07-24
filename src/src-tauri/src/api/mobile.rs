use crate::api::notes::save_notes_to_file;
use crate::db::models::calendar_event::CalendarEvent;
use crate::db::models::connection::Connection;
use crate::db::models::message::Message;
use crate::db::models::thread::{Thread, ThreadType};
use crate::db::models::user::User;
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

fn knapsack_data_dir() -> Result<PathBuf, Error> {
  let home_dir = dirs::home_dir().ok_or_else(|| Error::KSError("Could not resolve home dir".into()))?;
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
  let notes_path = dirs::home_dir()?.join(".knapsack").join("notes").join(thread_id.to_string());
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
    .or_else(|| User::find_by_email(email.clone()).ok().and_then(|user| user.uuid));

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
      if let Some(values) = root.get("KN_CONNECTIONS").and_then(|value| value.as_array()) {
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

fn mobile_meeting_detail(thread: Thread, metadata: Option<MobileMeetingMetadata>) -> MobileMeetingDetail {
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

#[get("/api/knapsack/mobile/chats")]
pub async fn list_mobile_chats() -> impl Responder {
  let threads = match Thread::find_all() {
    Ok(threads) => threads,
    Err(err) => {
      log::error!("Failed to list threads for mobile chats: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to list mobile chats"
      }));
    }
  };

  let chats: Vec<MobileChatSummary> = threads
    .into_iter()
    .filter(|thread| matches!(thread.thread_type, ThreadType::Chat))
    .take(30)
    .map(|thread| {
      let messages = thread
        .id
        .and_then(|thread_id| Message::find_by_thread_id(thread_id).ok())
        .unwrap_or_default();
      let preview = messages
        .last()
        .map(|message| {
          message
            .content_facade
            .clone()
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| message.content.clone())
        });
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
    })
    .collect();

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": chats
  }))
}

#[get("/api/knapsack/mobile/chats/{thread_id}")]
pub async fn get_mobile_chat(path: web::Path<u64>) -> impl Responder {
  let thread_id = path.into_inner();
  let thread = match Thread::find_by_id(thread_id) {
    Ok(Some(thread)) => thread,
    Ok(None) => {
      return HttpResponse::NotFound().json(json!({
        "success": false,
        "error": "Chat not found"
      }))
    }
    Err(err) => {
      log::error!("Failed to get mobile chat thread: {:?}", err);
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

  let messages = match Message::find_by_thread_id(thread_id) {
    Ok(messages) => messages,
    Err(err) => {
      log::error!("Failed to load messages for mobile chat {}: {:?}", thread_id, err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to load chat messages"
      }));
    }
  };

  let detail = mobile_chat_detail_from_thread(thread, messages);

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
    title: data
      .title
      .clone()
      .or_else(|| Some("New chat".to_string())),
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

  let profile = infer_linked_profile();
  let mut payload = json!({
    "text": text,
    "sessionId": thread_id.to_string(),
    "autonomyMode": "assist",
  });

  if let Some(profile) = profile.clone() {
    payload["userEmail"] = json!(profile.email);
    if let Some(name) = profile.name {
      payload["userName"] = json!(name);
    }
  }

  let client = match reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(90))
    .build()
  {
    Ok(client) => client,
    Err(err) => {
      log::error!("Failed to initialize mobile chat client: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "error": "Failed to initialize desktop chat bridge"
      }));
    }
  };

  let response = match client
    .post("http://127.0.0.1:8897/api/clawd/agent-chat")
    .json(&payload)
    .send()
    .await
  {
    Ok(response) => response,
    Err(err) => {
      log::error!("Mobile chat bridge request failed: {:?}", err);
      return HttpResponse::BadGateway().json(json!({
        "success": false,
        "error": "Desktop chat is unavailable"
      }));
    }
  };

  let response_json: Value = match response.json().await {
    Ok(value) => value,
    Err(err) => {
      log::error!("Failed to parse desktop chat response: {:?}", err);
      return HttpResponse::BadGateway().json(json!({
        "success": false,
        "error": "Desktop chat returned an unreadable response"
      }));
    }
  };

  let reply = response_json
    .get("reply")
    .and_then(|value| value.as_str())
    .unwrap_or("")
    .trim()
    .to_string();

  if reply.is_empty() {
    let error_message = response_json
      .get("message")
      .or_else(|| response_json.get("error"))
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
    data.source_device.clone().or_else(|| Some("iphone".to_string())),
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
