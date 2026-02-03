use actix_web::{
  delete, get, post, put,
  web::{self, Data, Json},
  Error as ActixError, HttpRequest, HttpResponse,
};
use chrono::{DateTime, Datelike, Duration, Local, TimeDelta, Timelike, Utc};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::{ fs, path::Path };

use crate::{
  db::models::{
    automation::Automation,
    automation_run::AutomationRun,
    cadence_trigger::CadenceTrigger,
    calendar_event::CalendarEvent,
    data_source_trigger::DataSourceTrigger,
    document::Document,
    email::Email,
    feed_item::FeedItem,
    feed_item::FeedItemComplete,
    message::Message,
    message_feedback::MessageFeedback,
    thread::{Thread, ThreadType, ThreadWithMessages},
    user::User,
  },
  error::Error,
  memory::semantic::SemanticService,
  utils::log::{knap_log_error,knap_log_debug},
};
use crate::audio::audio::generate_filename;

#[derive(Deserialize, Clone)]
struct CreateAutomationRequestStep {
  pub name: String,
  pub args_json: Option<String>,
}

#[derive(Deserialize, Clone)]
struct CreateAutomationRequestCadence {
  pub cadence_type: String,
  pub day_of_week: Option<String>,
  pub time: Option<String>,
}

#[derive(Deserialize, Clone)]
struct CreateAutomationRequest {
  uuid: String,
  name: String,
  description: String,
  is_active: Option<bool>,
  is_beta: Option<bool>,
  cadences: Vec<CreateAutomationRequestCadence>,
  steps: Vec<CreateAutomationRequestStep>,
}

#[derive(Deserialize, Clone)]
struct CreateAutomationRunRequest {
  automation_uuid: String,
  execution_timestamp: i64,
  feed_item_id: Option<u64>,
  thread_id: Option<u64>,
  automation_run_id: Option<u64>,
  documents: Option<Vec<u64>>,
  user_prompt: String,
  user_prompt_facade: Option<String>,
  result: String,
  user_email: String,
  document_ids: Option<Vec<u64>>,
}

#[derive(Deserialize, Clone)]
struct CreateAutomationRunFollowUpMessageRequest {
  thread_id: u64,
  timestamp: i64,
  user_prompt: String,
  user_prompt_facade: Option<String>,
  user_email: String,
  response: String,
  document_ids: Option<Vec<u64>>,
}

#[derive(Deserialize, Clone)]
struct ScheduleAutomationRunsRequest {
  user_email: String,
}

#[derive(Serialize, Clone)]
struct ScheduleAutomationRunsResponse {
  success: bool,
  error: Option<String>,
}

#[derive(Serialize, Clone)]
struct ListAutomationRunsResponse {
  data: Vec<AutomationRun>,
  success: bool,
  error: Option<String>,
}

#[derive(Deserialize, Clone)]
struct UpdateThreadRequest {
  thread: Thread,
}

#[derive(Serialize, Clone)]
struct UpdateThreadResponse {
  success: bool,
  error: Option<String>,
}

#[derive(Deserialize, Clone)]
struct CreateAutomationFeedbackRequest {
  user_email: String,
  message_id: u64,
  feedback: i32,
}

#[derive(Serialize)]
struct CreateAutomationResponse {
  success: bool,
  error: Option<String>,
}

#[derive(Serialize)]
struct CreateAutomationRunResponse {
  success: bool,
  error: Option<String>,
  feed_item: Option<FeedItemComplete>,
}

#[derive(Serialize)]
struct CreateAutomationRunFollowUpMessageResponse {
  success: bool,
  error: Option<String>,
  data: Option<AutomationRun>,
  messages: Option<Vec<Message>>,
}

#[derive(Serialize)]
struct StartCheckResponse {
  success: bool,
}

#[derive(Deserialize)]
struct GetUserMessagesRequest {
  email: String,
}

#[derive(Deserialize)]
struct GetTranscriptDataRequest {
  id: u64,
}

#[derive(Serialize)]
struct GetUserMessagesResponse {
  data: Option<Vec<MessageFeedback>>,
  success: bool,
  message: Option<String>,
}

#[derive(Serialize)]
struct GetTranscriptDataResponse {
  data: Option<TranscriptResponse>,
  success: bool,
  message: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct GetAutomationsResponse {
  success: bool,
  data: Option<Vec<Automation>>,
  error: Option<String>,
}

#[derive(Deserialize, Clone)]
struct CreateMessageRequest {
  user_email: Option<String>,
  thread_id: u64,
  content: String,
  content_facade: Option<String>,
  timestamp: i64,
  document_ids: Option<Vec<u64>>,
}

#[derive(Serialize)]
struct CreateMessageResponse {
  success: bool,
  error: Option<String>,
  thread: Option<ThreadWithMessages>,
  document_ids: Option<Vec<u64>>,
}

#[derive(Serialize)]
struct DeleteAutomationResponse {
  success: bool,
  error: Option<String>,
}

#[derive(Serialize)]
struct TranscriptResponse {
  title: String,
  timestamp: u64,
  content: String,
}

#[derive(Serialize)]
struct MessageFeedbacksServer {
  automation_name: String,
  user_email: String,
  message_id: u64,
  feedback: i32,
}

#[derive(Deserialize, Clone, Debug)]
struct CreateSystemMessageRequest {
  thread_id: u64,
  content: String,
  timestamp: i64,
  hide_follow_up: bool,
  thread_type: ThreadType,
  document_ids: Option<Vec<u64>>,
}

#[derive(Serialize)]
struct CreateSystemMessageResponse {
  success: bool,
  error: Option<String>,
  thread: Option<ThreadWithMessages>,
  document_ids: Option<Vec<u64>>,
}

#[derive(Deserialize, Clone, Debug)]
struct CreateThreadRequest {
  timestamp: i64,
  hide_follow_up: bool,
  feed_item_id: u64,
  thread_type: ThreadType,
  title: Option<String>,
  subtitle: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CreateThreadResponse {
  success: bool,
  error: Option<String>,
  thread: Option<Thread>,
}

#[derive(Deserialize, Clone, Debug)]
struct CreateFeedItemRequest {
  timestamp: i64,
  title: Option<String>,
}

#[derive(Serialize)]
struct CreateFeedItemResponse {
  success: bool,
  error: Option<String>,
  data: Option<FeedItem>,
}

#[derive(Serialize)]
struct GetFeedItemsResponse {
  success: bool,
  data: Option<Vec<FeedItemComplete>>,
  error: Option<String>,
}

#[derive(Deserialize, Clone)]
struct UpdateFeedItemRequest {
  feed_item: FeedItem,
}

#[derive(Serialize)]
struct StandardResponse {
  success: bool,
  error_code: Option<String>,
  message: Option<String>,
}

#[post("/api/knapsack/automations")]
async fn create_automation(
  data: Json<CreateAutomationRequest>,
) -> Result<HttpResponse, ActixError> {
  let mut response = CreateAutomationResponse {
    success: false,
    error: None,
  };
  // let mut cadences: Vec<CadenceTrigger> = vec![];
  // for data_cadence in data.cadences.clone() {
  //   let cadence = CadenceTrigger {
  //     id: None,
  //     automation_uuid: data.uuid.clone(),
  //     cadence_type: data_cadence.cadence_type,
  //     day_of_week: data_cadence.day_of_week,
  //     time: data_cadence.time,
  //   };
  //   cadences.push(cadence);
  // }
  // let mut steps: Vec<AutomationStep> = vec![];
  // for (i, data_step) in data.steps.iter().enumerate() {
  //   let step = AutomationStep {
  //     id: None,
  //     automation_uuid: data.uuid.clone(),
  //     name: data_step.name.clone(),
  //     ordering: i as u64,
  //     args_json: data_step.args_json.clone(),
  //   };
  //   steps.push(step);
  // }

  // let is_active = match data.is_active {
  //   Some(i) => i.clone(),
  //   None => true,
  // };

  // let is_beta = match data.is_beta {
  //   Some(i) => i.clone(),
  //   None => true,
  // };

  // let mut automation = Automation {
  //   id: None,
  //   uuid: data.uuid.clone(),
  //   name: data.name.clone(),
  //   description: data.description.clone(),
  //   is_active,
  //   is_beta,
  //   runs: None,
  //   trigger_cadences: Some(cadences),
  //   trigger_data_sources: None,
  //   steps: Some(steps),
  // };
  // automation.create();
  // response.success = true;
  Ok(HttpResponse::Ok().json(response))
}

#[get("/api/knapsack/automations")]
async fn get_automations() -> Result<HttpResponse, ActixError> {
  let automations = Automation::find_all();
  let response = GetAutomationsResponse {
    error: None,
    success: true,
    data: Some(automations.clone()),
  };
  let http_response = HttpResponse::Ok().json(response);
  Ok(http_response)
}

#[post("/api/knapsack/messages")]
async fn create_message(data: Json<CreateMessageRequest>) -> Result<HttpResponse, ActixError> {
  let mut user_id = None;
  if data.user_email.is_some() {
    let user_email = data
      .user_email
      .clone()
      .expect("create_message expected user_email");
    let user = User::find_by_email(user_email).unwrap();
    user_id = Some(user.id.unwrap());
  }

  let mut thread_with_messages: ThreadWithMessages =
    Thread::find_by_id_with_messages(data.thread_id).unwrap_or_default();
  if thread_with_messages.thread.id.is_none() {
    return Ok(HttpResponse::BadRequest().json(CreateMessageResponse {
      success: false,
      error: Some("Thread not found.".to_string()),
      thread: None,
      document_ids: data.document_ids.clone(),
    }));
  }
  let mut message = Message {
    id: None,
    timestamp: data.timestamp.clone(),
    thread_id: data.thread_id.clone(),
    user_id,
    content: data.content.clone(),
    content_facade: data.content_facade.clone(),
    feedbacks: None,
    document_ids: data.document_ids.clone(),
  };

  let message_result = message.create();
  if let Err(error) = message_result {
    log::error!("Message creation failed: {:?}", error);
    return Ok(HttpResponse::BadRequest().json(CreateMessageResponse {
      success: false,
      error: Some("message creation failed".to_string()),
      thread: None,
      document_ids: data.document_ids.clone(),
    }));
  }

  thread_with_messages.messages.push(message.clone());

  Ok(HttpResponse::Ok().json(CreateMessageResponse {
    success: true,
    error: None,
    thread: Some(thread_with_messages),
    document_ids: data.document_ids.clone(),
  }))
}

#[delete("/api/knapsack/automations/{automation_id}")]
async fn delete_automation(path: web::Path<String>) -> Result<HttpResponse, ActixError> {
  let automation_id = path.into_inner();
  let mut response = DeleteAutomationResponse {
    success: false,
    error: None,
  };
  let automation_res = Automation::find_by_id(automation_id.clone());
  match automation_res {
    Ok(automation_opt) => {
      match automation_opt {
        Some(mut automation) => {
          automation.delete();
        }
        None => {
          response.error = Some("Automation not found".to_string());
        }
      }
      response.success = true;
    }
    _Err => {
      response.success = false;
      response.error = Some("Error deleting automation with id ".to_string() + &automation_id);
    }
  }
  Ok(HttpResponse::Ok().json(response))
}

#[put("/api/knapsack/automations/{automation_id}")]
async fn update_automation(
  path: web::Path<String>,
  data: Json<CreateAutomationRequest>,
) -> Result<HttpResponse, ActixError> {
  let automation_id = path.into_inner();
  let existing_automation = Automation::find_by_id(automation_id)
    .unwrap()
    .expect("Automation not found.");
  let mut response = CreateAutomationResponse {
    success: false,
    error: None,
  };

  // let mut cadences: Vec<CadenceTrigger> = vec![];
  // for data_cadence in data.cadences.clone() {
  //   let cadence = CadenceTrigger {
  //     id: None,
  //     automation_uuid: existing_automation.uuid.clone(),
  //     cadence_type: data_cadence.cadence_type,
  //     day_of_week: data_cadence.day_of_week,
  //     time: data_cadence.time,
  //   };
  //   cadences.push(cadence);
  // }

  // let mut steps: Vec<AutomationStep> = vec![];
  // for (i, data_step) in data.steps.iter().enumerate() {
  //   let step = AutomationStep {
  //     id: None,
  //     automation_uuid: existing_automation.uuid.clone(),
  //     name: data_step.name.clone(),
  //     ordering: i as u64,
  //     args_json: data_step.args_json.clone(),
  //   };
  //   steps.push(step);
  // }

  // let is_active = match data.is_active {
  //   Some(ia) => ia,
  //   None => existing_automation.is_active.clone(),
  // };
  // let is_beta = match data.is_beta {
  //   Some(ia) => ia,
  //   None => existing_automation.is_beta.clone(),
  // };
  // let mut automation = Automation {
  //   id: existing_automation.id.clone(),
  //   uuid: existing_automation.uuid.clone(),
  //   name: data.name.clone(),
  //   description: data.description.clone(),
  //   is_active,
  //   is_beta,
  //   runs: None,
  //   trigger_cadences: Some(cadences),
  //   trigger_data_sources: None,
  //   steps: Some(steps),
  //   // feedbacks: None,
  // };

  // automation.update();
  // response.success = true;
  Ok(HttpResponse::Ok().json(response))
}

/**
 * Todo: Receive automation id as param and check if its specifics data_source have enough data
 */

#[get("/api/knapsack/automations/start_check")]
async fn start_check() -> Result<HttpResponse, ActixError> {
  let calendar_count = CalendarEvent::count().unwrap();
  let emails_count = Email::count().unwrap();
  let response = StartCheckResponse {
    success: calendar_count > 0 && emails_count > 0,
  };
  Ok(HttpResponse::Ok().json(response))
}

#[get("/api/knapsack/automations/feedbacks")]
async fn get_feedbacks(request: HttpRequest) -> Result<HttpResponse, ActixError> {
  let params = actix_web::web::Query::<GetUserMessagesRequest>::from_query(request.query_string())?;
  let user = match User::find_by_email(params.email.clone()) {
    Ok(user) => user,
    Err(error) => {
      log::error!("Failed to get user: {:?}", error);
      return Ok(HttpResponse::NotFound().json(GetUserMessagesResponse {
        success: false,
        data: None,
        message: Some(format!("Failed to get user: {:?}", error)),
      }));
    }
  };
  let messages = match MessageFeedback::find_by_user_id(user.id.unwrap()) {
    Ok(messages) => messages,
    Err(error) => {
      log::error!("Failed to get feedback messages: {:?}", error);
      return Ok(HttpResponse::BadRequest().json(GetUserMessagesResponse {
        success: false,
        data: None,
        message: Some(format!("Failed to get feedback messages: {:?}", error)),
      }));
    }
  };
  Ok(HttpResponse::Ok().json(GetUserMessagesResponse {
    success: true,
    data: Some(messages),
    message: None,
  }))
}

#[post("/api/knapsack/automations/feedbacks")]
async fn upsert_automations_feedback(
  data: Json<CreateAutomationFeedbackRequest>,
) -> Result<HttpResponse, ActixError> {
  let mut response = CreateAutomationResponse {
    success: false,
    error: None,
  };
  let user = User::find_by_email(data.user_email.clone()).unwrap();

  let maybe_automation = Automation::find_by_message_id(data.message_id.clone()).unwrap();

  let api_server: &'static str = env!("VITE_KN_API_SERVER", "Missing VITE_KN_API_SERVER env var");
  let api_endpoint = format!("{}/api/automations/feedbacks", api_server);

  let feedback_data = MessageFeedbacksServer {
    automation_name: maybe_automation.unwrap().name.clone(),
    user_email: data.user_email.clone(),
    message_id: data.message_id.clone(),
    feedback: data.feedback.clone(),
  };

  let client = Client::new();
  let _request_result = client.post(&api_endpoint).json(&feedback_data).send().await;

  let _upsert_result = MessageFeedback::upsert(user.id.unwrap(), data.message_id, data.feedback);
  response.success = true;

  Ok(HttpResponse::Ok().json(response))
}

// fn schedule_future_run_hourly(current_date: )

const ONE_HOUR: TimeDelta = Duration::hours(1);
const ONE_DAY: TimeDelta = Duration::days(1);
const ONE_WEEK: TimeDelta = Duration::days(7);
const DAYS_TO_SCHEDULE: u32 = 7;

fn create_feed_item_to_schedule_run(
  mut automation_run: AutomationRun,
  title: String,
  timestamp: i64,
) -> AutomationRun {

  let mut feed_item = FeedItem {
    id: None,
    title: Some(title),
    timestamp: Some(timestamp),
    deleted: None,
  };

  if let Err(e) = feed_item.create() {
    let err_msg = format!(
      "Couldn't create feed_item from automation_run: existing_run: {:?}",
      automation_run
    );
    knap_log_error(err_msg, Some(e), None);
  }
  automation_run.feed_item_id = feed_item.id;
  automation_run
}

fn schedule_cadence_future_run_hourly(
  automation_uuid: &String,
  user_id: u64,
  date: &DateTime<Local>,
) {
  let mut current_date = date.clone();
  let hours = 24 * DAYS_TO_SCHEDULE;
  for _ in 1..hours {
    current_date = current_date + ONE_HOUR;
    let mut automation_run = AutomationRun {
      id: None,
      user_id,
      automation_uuid: automation_uuid.to_string(),
      thread_id: None,
      schedule_timestamp: Some(current_date.timestamp_millis()),
      execution_timestamp: None,
      run_params: Some(json!({ "timestamp": current_date.timestamp_millis() }).to_string()),
      feed_item_id: None,
    };
    let automation = Automation::find_by_uuid(automation_uuid.clone()).unwrap();
    automation_run = create_feed_item_to_schedule_run(
      automation_run,
      automation.name.clone(),
      current_date.timestamp_millis(),
    );
    automation_run.upsert_schedule();
  }
}

fn schedule_cadence_future_run_daily(
  automation_uuid: &String,
  user_id: u64,
  date: &DateTime<Local>,
) {
  let mut current_date = date.clone();
  let now_timestamp = chrono::offset::Local::now().timestamp();
  for _ in 1..DAYS_TO_SCHEDULE {
    if current_date.timestamp() > now_timestamp {
      let mut automation_run = AutomationRun {
        id: None,
        user_id,
        automation_uuid: automation_uuid.to_string(),
        thread_id: None,
        schedule_timestamp: Some(current_date.timestamp_millis()),
        execution_timestamp: None,
        run_params: Some(json!({ "timestamp": current_date.timestamp_millis() }).to_string()),
        feed_item_id: None,
      };
      let automation = Automation::find_by_uuid(automation_uuid.clone()).unwrap();
      automation_run = create_feed_item_to_schedule_run(
        automation_run,
        automation.name.clone(),
        current_date.timestamp_millis(),
      );
      automation_run.upsert_schedule();
    }
    current_date = current_date + ONE_DAY;
  }
}

fn schedule_cadence_future_run_weekly(
  automation_uuid: &String,
  user_id: u64,
  date: &DateTime<Local>,
  cadence_day_of_week: Option<String>,
) {
  let mut current_date = date.clone();
  let now = chrono::offset::Local::now();
  let cadence_weekday = match cadence_day_of_week
    .unwrap_or(String::from("Monday"))
    .as_str()
  {
    "Sunday" => 0,
    "Monday" => 1,
    "Tuesday" => 2,
    "Wednesday" => 3,
    "Thursday" => 4,
    "Friday" => 5,
    "Saturday" => 6,
    _ => 1,
  };
  while current_date.weekday().num_days_from_sunday() != cadence_weekday {
    current_date = current_date + ONE_DAY;
  }
  if current_date > now {
    let mut automation_run = AutomationRun {
      id: None,
      user_id,
      automation_uuid: automation_uuid.to_string(),
      thread_id: None,
      schedule_timestamp: Some(current_date.timestamp_millis()),
      execution_timestamp: None,
      run_params: Some(json!({ "timestamp": current_date.timestamp_millis() }).to_string()),
      feed_item_id: None,
    };
    let automation = Automation::find_by_uuid(automation_uuid.clone()).unwrap();
    automation_run = create_feed_item_to_schedule_run(
      automation_run,
      automation.name.clone(),
      current_date.timestamp_millis(),
    );
    automation_run.upsert_schedule();
  }
}

fn schedule_cadence_future_run(cadence: &CadenceTrigger, automation_uuid: &String, user_id: u64) {
  let now = chrono::offset::Local::now();
  let mut current_date = now
    .with_minute(0)
    .unwrap()
    .with_second(0)
    .unwrap()
    .with_nanosecond(0)
    .unwrap();
  if let Some(time) = &cadence.time {
    let splitted_time = time.split(":").collect::<Vec<_>>();
    let hour: u32 = splitted_time.get(0).unwrap().parse().unwrap();
    let minute: u32 = splitted_time.get(1).unwrap().parse().unwrap();
    current_date = current_date
      .with_hour(hour)
      .unwrap()
      .with_minute(minute)
      .unwrap();
  }
  match cadence.cadence_type.as_str() {
    "hourly" => schedule_cadence_future_run_hourly(automation_uuid, user_id, &current_date),
    "daily" => schedule_cadence_future_run_daily(automation_uuid, user_id, &current_date),
    "weekly" => schedule_cadence_future_run_weekly(
      automation_uuid,
      user_id,
      &current_date,
      cadence.day_of_week.clone(),
    ),
    _ => log::error!("cadence_type not implement"),
  }
}

fn schedule_data_source_future_run_google_calendar(
  data_source: &DataSourceTrigger,
  automation_uuid: &str,
  user_id: u64,
) -> Result<(), Error> {
  let now = chrono::offset::Local::now()
    .with_hour(0)
    .and_then(|dt| dt.with_minute(0))
    .and_then(|dt| dt.with_second(5))
    .expect("Failed to adjust time");
  let to_date = now + ONE_WEEK;
  let calendar_events =
    CalendarEvent::filter_calendar_events_by_timestamp(now.timestamp(), to_date.timestamp())?;

  let valid_events: Vec<&CalendarEvent> = calendar_events
    .iter()
    .filter(|event| {
      event.attendees_json.as_ref()
        .map(|attendees| attendees.split(',').count() > 1)
        .unwrap_or(false)
    })
    .collect();

  let valid_event_ids: Vec<u64> = valid_events
    .iter()
    .filter_map(|event| event.id)
    .collect();

  if let Err(e) = AutomationRun::delete_outdated_calendar_runs(&valid_event_ids, now.timestamp_millis()) {
    log::error!("Failed to delete outdated calendar runs: {:?}", e);
    let err_msg = "Failed to delete outdated calendar runs".to_string();
    knap_log_error(err_msg, Some(e), None);
  }

  for event in valid_events {
    let event_id = match event.id {
      Some(id) => id,
      None => {
        log::warn!("Skipping event with missing ID");
        let err_msg = "Skipping event with missing ID".to_string();
        knap_log_error(err_msg, None, None);
        continue;
      }
    };

    let event_start = match event.start {
      Some(start) => start,
      None => {
        log::warn!("Event ID {} has no start time", event_id);
        let err_msg = format!("Event ID {} has no start time", event_id);
        knap_log_error(err_msg, None, None);
        continue;
      }
    };

    let utc_event_date = match DateTime::<Utc>::from_timestamp(event_start, 0) {
      Some(d) => d,
      None => {
        log::warn!("Invalid start time for event ID {}", event_id);
        let err_msg = format!("Invalid start time for event ID {}", event_id);
        knap_log_error(err_msg, None, None);
        continue;
      }
    };

    let event_date = DateTime::<Local>::from(utc_event_date);
    let run_date = event_date + Duration::minutes(data_source.offset_minutes);
    let run_timestamp = run_date.timestamp_millis();

    let mut automation_run = match AutomationRun::find_run_by_calendar_event(
      event_id,
      run_timestamp,
      automation_uuid,
      user_id
    ) {
      Ok(Some(run)) if run.feed_item_id.is_some() => {
        log::debug!("Skipping event ID {} with existing feed item", event_id);
        let err_msg = format!("Skipping event ID {} with existing feed item", event_id);
        knap_log_debug(err_msg, None);
        continue;
      },
      Ok(Some(run)) => {
        run
      },
      Ok(None) => {
        AutomationRun {
          id: None,
          user_id,
          automation_uuid: automation_uuid.to_string(),
          thread_id: None,
          schedule_timestamp: Some(run_timestamp),
          execution_timestamp: None,
          run_params: Some(
            json!({ "event_id": event_id, "timestamp": run_timestamp }).to_string(),
          ),
          feed_item_id: None,
        }
      },
      Err(e) => {
        log::error!("Error checking for existing run: {:?}", e);
        let err_msg = "Error checking for existing run".to_string();
        knap_log_error(err_msg, Some(e), None);
        continue;
      }
    };

    let title = event.title.as_deref().unwrap_or("Untitled Meeting").to_string();

    automation_run = create_feed_item_to_schedule_run(automation_run, title, event_date.timestamp_millis());

    if let Err(e) = automation_run.upsert_schedule() {
      let err_msg = format!(
        "Failed to upsert schedule for event {}", event_id
      );
      log::error!("Failed to upsert schedule for event {}: {:?}", event_id, e);
      knap_log_error(err_msg, Some(e), None);
    }
  }
  Ok(())
}

fn schedule_data_source_future_run(
  data_source: &DataSourceTrigger,
  automation_uuid: &String,
  user_id: u64,
) -> Result<(), Error> {
  match data_source.data_source.as_str() {
    "google_calendar" => {
      schedule_data_source_future_run_google_calendar(data_source, automation_uuid, user_id)?
    }
    _ => {
      log::error!("data_source not implement")
    }
  };
  Ok(())
}

#[post("/api/knapsack/automations/runs/schedule")]
async fn schedule_automation_runs(
  data: Json<ScheduleAutomationRunsRequest>,
) -> Result<HttpResponse, ActixError> {
  let user_id = match User::find_by_email(data.user_email.clone()) {
    Ok(user) => user.id.unwrap(),
    Err(error) => {
      log::error!("User not found: {:?}", error);
      return Ok(
        HttpResponse::NotFound().json(ScheduleAutomationRunsResponse {
          success: false,
          error: Some("User not found".to_string()),
        }),
      );
    }
  };
  let automations = Automation::find_all();

  for automation in automations {
    let cadences = automation.trigger_cadences.unwrap_or(vec![]);
    for cadence in cadences {
      schedule_cadence_future_run(&cadence, &automation.uuid, user_id);
    }

    let data_sources = automation.trigger_data_sources.unwrap_or(vec![]);
    for data_source in data_sources {
      if let Err(e) = schedule_data_source_future_run(&data_source, &automation.uuid, user_id) {
        let err_msg = format!("Couldn't schedule data source runs: {:?}", data_source);
        knap_log_error(err_msg, Some(e), None);
      }
    }
  }

  Ok(HttpResponse::Ok().json(ScheduleAutomationRunsResponse {
    success: true,
    error: None,
  }))
}

#[get("/api/knapsack/automations/runs/")]
async fn get_automation_runs() -> Result<HttpResponse, ActixError> {
  let automations = AutomationRun::find_all();
  Ok(HttpResponse::Ok().json(ListAutomationRunsResponse {
    data: automations,
    success: true,
    error: None,
  }))
}

#[put("/api/knapsack/threads/{thread_id}")]
async fn update_thread(
  path: web::Path<String>,
  data: Json<UpdateThreadRequest>,
) -> Result<HttpResponse, ActixError> {
  let result: Result<u64, _> = path.into_inner().parse();
  match result {
    Ok(thread_id) => {
      let mut existing_thread = match Thread::find_by_id(thread_id) {
        Ok(Some(thread)) => thread,
        Ok(None) => {
          return Ok(HttpResponse::NotFound().json(StandardResponse {
            success: false,
            error_code: Some("THREAD_NOT_FOUND".to_string()),
            message: Some("Thread not found".to_string()),
          }));
        }
        Err(e) => {
          return Ok(HttpResponse::InternalServerError().json(StandardResponse {
            success: false,
            error_code: Some("DATABASE_ERROR".to_string()),
            message: Some(format!("Error retrieving thread: {:?}", e)),
          }));
        }
      };
      let mut response = StandardResponse {
        success: false,
        error_code: None,
        message: None,
      };
      existing_thread.hide_follow_up = data.thread.hide_follow_up;
      existing_thread.thread_type = data.thread.thread_type.clone();
      existing_thread.title = data.thread.title.clone();
      existing_thread.subtitle = data.thread.subtitle.clone();
      existing_thread.prompt_template = data.thread.prompt_template.clone();
      existing_thread.update();

      response.success = true;
      Ok(HttpResponse::Ok().json(response))
    }
    Err(e) => {
      let message = format!("{}", e);

      Ok(HttpResponse::BadRequest().json(StandardResponse {
        success: false,
        error_code: Some("UPDATE_THREAD_ERROR".to_string()),
        message: Some(message),
      }))
    }
  }
}

#[post("/api/knapsack/system_messages")]
async fn create_system_message(
  data: Json<CreateSystemMessageRequest>,
) -> Result<HttpResponse, ActixError> {
  let mut thread_with_messages: ThreadWithMessages =
    Thread::find_by_id_with_messages(data.thread_id).unwrap_or_default();
  if thread_with_messages.thread.id.is_none() {
    return Ok(
      HttpResponse::BadRequest().json(CreateSystemMessageResponse {
        success: false,
        error: Some("Thread not found.".to_string()),
        thread: None,
        document_ids: None,
      }),
    );
  }

  let mut bot_message = Message {
    id: None,
    timestamp: data.timestamp.clone(),
    thread_id: thread_with_messages.thread.id.unwrap(),
    user_id: None,
    content: data.content.clone(),
    content_facade: None,
    feedbacks: None,
    document_ids: data.document_ids.clone(),
  };

  match bot_message.create() {
    Ok(_) => {
      thread_with_messages.messages.push(bot_message.clone());
    }
    Err(error) => {
      log::error!("Failed to create message: {:?}", error);
      return Ok(
        HttpResponse::InternalServerError().json(CreateSystemMessageResponse {
          success: false,
          error: Some("Failed to create message".to_string()),
          thread: None,
          document_ids: None,
        }),
      );
    }
  }

  Ok(HttpResponse::Ok().json(CreateSystemMessageResponse {
    success: true,
    error: None,
    thread: Some(thread_with_messages),
    document_ids: None,
  }))
}

#[post("/api/knapsack/threads")]
async fn create_threads(data: Json<CreateThreadRequest>) -> Result<HttpResponse, ActixError> {
  let mut thread = Thread {
    id: None,
    timestamp: Some(data.timestamp.clone()),
    hide_follow_up: Some(data.hide_follow_up.clone()),
    thread_type: data.thread_type.clone(),
    feed_item_id: Some(data.feed_item_id.clone()),
    title: data.title.clone(),
    subtitle: data.subtitle.clone(),
    recorded: Some(false),
    saved_transcript: None,
    prompt_template: None,
  };

  match thread.create() {
    Ok(_) => (),
    Err(error) => {
      log::error!("Failed to create thread: {:?}", error);
      return Ok(
        HttpResponse::InternalServerError().json(CreateThreadResponse {
          success: false,
          error: Some("Failed to create thread".to_string()),
          thread: None,
        }),
      );
    }
  }
  let response = CreateThreadResponse {
    error: None,
    success: true,
    thread: Some(thread),
  };
  Ok(HttpResponse::Ok().json(response))
}

#[post("/api/knapsack/automations/runs")]
async fn create_automation_run(
  data: Json<CreateAutomationRunRequest>,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
) -> Result<HttpResponse, ActixError> {
  let mut response = CreateAutomationRunResponse {
    success: false,
    error: None,
    feed_item: None,
  };
  let user = User::find_by_email(data.user_email.clone()).unwrap();

  let feed_item = data
    .feed_item_id
    .ok_or_else(|| {
      HttpResponse::BadRequest().json(CreateAutomationRunResponse {
        success: false,
        error: Some(String::from("feed_item_id is required")),
        feed_item: None,
      })
    })
    .and_then(|id| {
      FeedItem::find_by_id(id).map_err(|_| {
        HttpResponse::NotFound().json(CreateAutomationRunResponse {
          success: false,
          error: Some(String::from("Failed to get feed item")),
          feed_item: None,
        })
      })
    })
    .and_then(|maybe_item| {
      maybe_item.ok_or_else(|| {
        HttpResponse::NotFound().json(CreateAutomationRunResponse {
          success: false,
          error: Some(String::from("Feed item not found")),
          feed_item: None,
        })
      })
    });

  let automation = Automation::find_by_uuid(data.automation_uuid.clone())
    .map_err(|_| {
      HttpResponse::InternalServerError().json(CreateAutomationRunResponse {
        success: false,
        error: Some(String::from("Failed to find thread")),
        feed_item: None,
      })
    })
    .and_then(|automation| Ok(automation));

  let thread = data
    .thread_id
    .map(Thread::find_by_id)
    .unwrap_or_else(|| Ok(None))
    .map_err(|_| {
      HttpResponse::InternalServerError().json(CreateAutomationRunResponse {
        success: false,
        error: Some(String::from("Failed to find thread")),
        feed_item: None,
      })
    })
    .and_then(|maybe_thread| {
      Ok(maybe_thread.unwrap_or_else(|| Thread {
        id: None,
        timestamp: Some(data.execution_timestamp.clone()),
        hide_follow_up: Some(false),
        thread_type: ThreadType::Chat,
        feed_item_id: feed_item.as_ref().ok().and_then(|fi| fi.id),
        title: automation.as_ref().ok().and_then(|a| Some(a.name.clone())),
        subtitle: feed_item.as_ref().ok().and_then(|fi| fi.title.clone()),
        recorded: Some(false),
        saved_transcript: None,
        prompt_template: None,
      }))
    })
    .and_then(|mut thread| {
      if thread.id.is_none() {
        thread.create().map_err(|_| {
          HttpResponse::InternalServerError().json(CreateAutomationRunResponse {
            success: false,
            error: Some(String::from("Failed to create new thread")),
            feed_item: None,
          })
        })?;
      }
      Ok(thread)
    });

  let automation_run = data
    .automation_run_id
    .map(AutomationRun::find_by_id)
    .unwrap_or_else(|| Ok(None))
    .map_err(|_| {
      HttpResponse::InternalServerError().json(CreateAutomationRunResponse {
        success: false,
        error: Some(String::from("Failed to get AutomationRun")),
        feed_item: None,
      })
    })
    .and_then(|maybe_run| {
      Ok(maybe_run.unwrap_or_else(|| AutomationRun {
        id: None,
        automation_uuid: data.automation_uuid.clone(),
        user_id: user.id.unwrap(),
        thread_id: thread.as_ref().ok().and_then(|t| t.id),
        schedule_timestamp: None,
        execution_timestamp: Some(data.execution_timestamp.clone()),
        run_params: None,
        feed_item_id: feed_item.as_ref().ok().and_then(|fi| fi.id),
      }))
    })
    .and_then(|mut run| {
      if run.id.is_none() {
        run.create().map_err(|_| {
          HttpResponse::InternalServerError().json(CreateAutomationRunResponse {
            success: false,
            error: Some(String::from("Failed to create run")),
            feed_item: None,
          })
        })?;
      } else {
        run.thread_id = thread.as_ref().ok().and_then(|t| t.id);
        run.execution_timestamp = Some(data.execution_timestamp.clone());
        run.update().map_err(|_| {
          HttpResponse::InternalServerError().json(CreateAutomationRunResponse {
            success: false,
            error: Some(String::from("Failed to update run")),
            feed_item: None,
          })
        })?;
      }
      Ok(run)
    });

  let (feed_item, thread, automation_run) = match (feed_item, thread, automation_run) {
    (Ok(fi), Ok(t), Ok(ar)) => (fi, t, ar),
    (Err(response), _, _) => return Ok(response),
    (_, Err(response), _) => return Ok(response),
    (_, _, Err(response)) => return Ok(response),
  };

  // TODO: code a better way than this for the
  // Vec<u64> -> Vec<Document> conversion..
  // Should live in the Document model class.
  let documents: Vec<Document> = match &data.documents {
    Some(docs) => {
      let mut results = Vec::new();
      for doc in docs {
        let document = match Document::find_by_id(*doc) {
          Ok(Some(d)) => d,
          Ok(None) => continue,
          Err(_) => continue,
        };
        results.push(document);
      }
      results
    }
    None => vec![],
  };
  // let built_user_message = build_user_message(
  //   data.user_prompt.clone(),
  //   None,
  //   Some(documents),
  //   semantic_service.get_ref().clone(),
  //   None,
  // )
  // .await;

  let now_timestamp = chrono::offset::Local::now().timestamp();
  // let mut user_message = Message {
  //   id: None,
  //   timestamp: now_timestamp,
  //   thread_id: thread.id.unwrap(),
  //   user_id: user.id,
  //   content: built_user_message.content.clone(),
  //   content_facade: data.user_prompt_facade.clone(),
  //   feedbacks: None,
  //   document_ids: data.document_ids.clone(),
  // };
  // user_message.create();
  let mut bot_message = Message {
    id: None,
    timestamp: now_timestamp,
    thread_id: thread.id.unwrap(),
    user_id: None,
    content: data.result.clone(),
    content_facade: None,
    feedbacks: None,
    document_ids: data.document_ids.clone(),
  };
  bot_message.create();

  response.success = true;
  let feed_item_response = FeedItem::find_by_id_complete(feed_item.id.unwrap()).unwrap();
  response.feed_item = Some(feed_item_response);
  Ok(HttpResponse::Ok().json(response))
}

#[get("/api/knapsack/feed_items")]
async fn get_feed_items() -> Result<HttpResponse, ActixError> {
  match FeedItem::find_all_complete() {
    Ok(feed_items_complete) => {
      let response = GetFeedItemsResponse {
        error: None,
        success: true,
        data: Some(feed_items_complete),
      };
      Ok(HttpResponse::Ok().json(response))
    },
    Err(e) => {
      let error_message = format!("{:?}", e);
      Ok(HttpResponse::InternalServerError().json(StandardResponse {
        success: false,
        error_code: Some("FETCH_FEED_ITEMS_ERROR".to_string()),
        message: Some(error_message),
      }))
    }
  }
}

#[post("/api/knapsack/feed_items")]
async fn create_feed_item(data: Json<CreateFeedItemRequest>) -> Result<HttpResponse, ActixError> {
  let mut feed_item = FeedItem {
    id: None,
    title: data.title.clone(),
    timestamp: Some(data.timestamp),
    deleted: None,
  };

  match feed_item.create() {
    Ok(_) => Ok(HttpResponse::Ok().json(CreateFeedItemResponse {
      error: None,
      success: true,
      data: Some(feed_item),
    })),
    Err(e) => {
      let error_message = format!("{:?}", e);
      Ok(HttpResponse::BadRequest().json(StandardResponse {
        success: false,
        error_code: Some("CREATE_FEED_ITEM_ERROR".to_string()),
        message: Some(error_message),
      }))
    }
  }
}

#[put("/api/knapsack/feed_items/{feed_item_id}")]
async fn update_feed_item(
  path: web::Path<String>,
  data: Json<UpdateFeedItemRequest>,
) -> Result<HttpResponse, ActixError> {
  let result: Result<u64, _> = path.into_inner().parse();
  match result {
    Ok(feed_item_id) => {
      let mut existing_feed_item = FeedItem::find_by_id(feed_item_id)
        .unwrap()
        .expect("Feed Item not found.");
      if let Some(title) = &data.feed_item.title {
        existing_feed_item.title = Some(title.clone());
      }
      if let Some(deleted) = data.feed_item.deleted {
        existing_feed_item.deleted = Some(deleted);
      }

      if let Err(e) = existing_feed_item.update() {
        log::error!("Failed to update feed item: {:?}", e);
        return Ok(HttpResponse::InternalServerError().json(StandardResponse {
          success: false,
          error_code: Some("UPDATE_FEED_ITEM_ERROR".to_string()),
          message: Some("Failed to update feed item".to_string()),
        }));
      }

      Ok(HttpResponse::Ok().json(StandardResponse {
        success: true,
        error_code: None,
        message: None,
      }))
    }
    Err(e) => {
      let message = format!("{}", e);
      Ok(HttpResponse::BadRequest().json(StandardResponse {
        success: false,
        error_code: Some("UPDATE_FEED_ITEM_ERROR".to_string()),
        message: Some(message),
      }))
    }
  }
}


#[get("/api/knapsack/thread/transcript")]
async fn get_thread_transcript(req: HttpRequest) -> Result<HttpResponse, ActixError> {
  let params =
    actix_web::web::Query::<GetTranscriptDataRequest>::from_query(req.query_string()).unwrap();

  let thread = match Thread::find_by_id(params.id) {
    Ok(Some(t)) => t,
    Ok(None) => {
      return Ok(HttpResponse::NotFound().json(StandardResponse {
        success: false,
        error_code: Some("Thread not found".to_string()),
        message: Some("Thread not found".to_string()),
      }));
    },
    Err(e) => {
      log::error!("Failed to get thread: {:?}", e);
      return Ok(HttpResponse::BadRequest().json(StandardResponse {
        success: false,
        error_code: Some(format!("Failed to get Thread: {:?}", e)),
        message: Some("Failed to get Thread".to_string()),
      }));
    }
  };

  let mut feed_item = None;
  match FeedItem::find_by_id(thread.feed_item_id.unwrap()) {
    Ok(Some(fi)) => feed_item = Some(fi),
    Ok(None) => feed_item = None,
    Err(e) => {
      log::error!("Failed to get feed item: {:?}", e);
      return Ok(HttpResponse::BadRequest().json(StandardResponse {
        success: false,
        error_code: Some(format!("Failed to get Feed Item: {:?}", e)),
        message: Some("Failed to get Feed Item".to_string()),
      }));
    }
  };

  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let transcript_data_dir = home_dir.join(".transcripts");


  let file_name = generate_filename(thread.subtitle.clone().unwrap(), thread.timestamp.clone().unwrap());
  let file_path = transcript_data_dir.join(file_name);

  if !file_path.exists() {
    return Ok(HttpResponse::NotFound().json(GetTranscriptDataResponse {
      success: false,
      data: None,
      message: Some("Transcript not found".to_string()),
    }));
  }

  let title = if let Some(feed_item) = feed_item {
    feed_item.title
  }else{
    thread.subtitle
  };
  let content = match fs::read_to_string(file_path) {
    Ok(content) => content,
    Err(e) => {
      return Ok(HttpResponse::InternalServerError().json(StandardResponse {
        success: false,
        error_code: Some(format!("Fail to get the transcript file: {:?}", e)),
        message: Some("Fail to get the transcript file".to_string()),
      }));
    },
  };


  Ok(HttpResponse::Ok().json(GetTranscriptDataResponse {
    success: true,
    data: Some(TranscriptResponse {
      content: content,
      title: title.unwrap(),
      timestamp: thread.timestamp.unwrap() as u64,
    }),
    message: None,
  }))

}
