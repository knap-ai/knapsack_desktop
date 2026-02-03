use actix_web::web::Data;
use actix_web::{get, HttpRequest, HttpResponse, Responder};
use google_calendar3::{hyper, hyper_rustls, CalendarHub};
use serde::{Deserialize, Serialize};
use serde_json::Map;
use serde_json::Value;
use std::sync::Arc;
use tauri::api::http::Client;
use tokio::sync::Mutex;
use crate::spotlight::WINDOW_LABEL;
use tauri::Manager;

use crate::connections::utils::get_knapsack_api_connection;
use crate::connections::api::ConnectionsEnum;
use crate::db::models::calendar_event::CalendarEvent;
use crate::db::models::user_connection::UserConnection;

use crate::error::Error;
use crate::ConnectionsData;

use super::auth::refresh_connection_token;
use super::constants::GOOGLE_CALENDAR_SCOPE;
use crate::utils::log::knap_log_error;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchGoogleCalendarResponse {
  success: bool,
  message: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FetchGoogleCalendarParams {
  email: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct FetchCalendarEventPayload {
  pub success: bool,
  pub synced_events_count: usize,
}

pub async fn fetch_calendar(
  email: String,
  app_handle: tauri::AppHandle,
  connections_data: Arc<Mutex<ConnectionsData>>,
) -> Result<(), Error> {
  let user_conn = match get_knapsack_api_connection(email.clone()) {
    Ok(connection) => connection,
    Err(error) => {
      return Err(Error::KSError("Fail to get user connection".to_string()));
    }
  };

  let user_connection = match UserConnection::find_by_user_email_and_scope(
    email.clone(),
    String::from(GOOGLE_CALENDAR_SCOPE),
  ) {
    Ok(user_connection) => user_connection,
    Err(error) => {
      let msg = format!("Failed to find user connection for user: {}", email);
      knap_log_error(msg, Some(error), Some(true));
      return Err(Error::KSError("Fail to get user connection".to_string()));
    }
  };
  let access_token = match refresh_connection_token(email.clone(), user_connection.clone()).await {
    Ok(token) => token,
    Err(error) => {
      log::error!("Failed to refresh access token: {:?}", error);
      let msg = format!("Failed to refresh access token in google calendar for user: {}", email);
      knap_log_error(msg, Some(error), None);
      return Err(Error::KSError("Fail to refresh access token".to_string()));
    }
  };

  if ConnectionsData::lock_and_get_connection_is_syncing(
    connections_data.clone(),
    ConnectionsEnum::GoogleCalendar,
  )
  .await
  {
    return Ok(());
  }

  ConnectionsData::lock_and_set_connection_is_syncing(
    connections_data.clone(),
    ConnectionsEnum::GoogleCalendar,
    true,
  )
  .await;

  tauri::async_runtime::spawn(async move {
    let hub = CalendarHub::new(
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

    // NOTE: adding events from earlier than today for testing purposes.
    // Can't hurt to store a few days' extra events.
    let two_weeks_ago = chrono::Utc::now() - chrono::Duration::days(16);
    let one_month_later = chrono::Utc::now() + chrono::Duration::days(31);
    let mut page_token: Option<String> = None;

    let mut event_ids_total: Vec<String> = Vec::new();
    loop {
      let mut request = hub
        .events()
        .list(&email)
        .single_events(true)
        .time_min(two_weeks_ago)
        .time_max(one_month_later)
        .order_by("startTime")
        .max_results(1000);

      if let Some(token) = &page_token {
        request = request.page_token(token);
      }

      let result = request.doit().await;
      match result {
        Ok(response) => {
          let events = response.1.items.unwrap_or_default();
          let event_ids: Vec<String> = events.iter().filter_map(|event| event.id.clone()).collect();
          event_ids_total.extend(event_ids);
          for event in events {
            let event_id = event.id.unwrap();
            let title = event.summary;
            let description = event.description;
            let mut creator_email = None;
            if let Some(creator) = event.creator {
              creator_email = creator.email;
            }
            let mut attendees_maps: Vec<Map<String, Value>> = Vec::new();
            if let Some(attendees) = event.attendees {
              for attendee in attendees.clone() {
                let mut attendee_map = Map::new();
                attendee_map.insert(
                  "email".to_string(),
                  Value::String(attendee.email.unwrap_or("".to_string())),
                );
                attendee_map.insert(
                  "name".to_string(),
                  Value::String(attendee.display_name.unwrap_or("".to_string())),
                );
                attendees_maps.push(attendee_map);
              }
            }
            let recurrence_json = if let Some(recurrence) = &event.recurrence {
              Some(serde_json::to_string(recurrence).unwrap())
            } else {
              None
            };

            let recurrence_id = event.recurring_event_id;
            let attendees_json = Some(serde_json::to_string(&attendees_maps).unwrap());
            let google_meet_url = event
              .conference_data
              .map(|conference_data| {
                conference_data
                  .conference_id
                  .map(|conference_id| format!("https://meet.google.com/{}", conference_id))
              })
              .flatten();
            let location = event.location;
            let mut start = None;
            if let Some(item_start) = event.start {
              if let Some(item_start_datetime) = item_start.date_time {
                start = Some(item_start_datetime.timestamp());
              }
            }

            let mut end = None;
            if let Some(item_end) = event.end {
              if let Some(item_end_datetime) = item_end.date_time {
                end = Some(item_end_datetime.timestamp());
              }
            }

            let mut calendar_event = CalendarEvent {
              id: None,
              event_id,
              title,
              description,
              start,
              end,
              creator_email,
              attendees_json,
              location,
              google_meet_url,
              recurrence_json,
              recurrence_id,
            };
            if let Err(e) = calendar_event.create() {
              let msg = format!("Failed to create calendar event: {:?}", e);
              knap_log_error(msg, Some(e), Some(true));
            }
          }

          page_token = response.1.next_page_token;
          if page_token.is_none() {
            break;
          }
        }
        Err(error) => {
          log::error!("Calendar sync failed {:?}", error.to_string());
          let error_msg = format!("Fetch calendar failed: {:?}", error.to_string()
          );
          knap_log_error(error_msg, None, Some(true));
          ConnectionsData::lock_and_set_connection_is_syncing(
            connections_data.clone(),
            ConnectionsEnum::GoogleCalendar,
            false,
          )
          .await;
          break;
        }
      };
    }
    let event_count = event_ids_total.len();
    CalendarEvent::delete_calendar_events_removed(event_ids_total);
    ConnectionsData::lock_and_set_connection_is_syncing(
      connections_data,
      ConnectionsEnum::GoogleCalendar,
      false,
    )
    .await;
    UserConnection::update_last_sync_by_id(user_connection.id.unwrap(), two_weeks_ago);
    let window = app_handle.get_window(WINDOW_LABEL).unwrap();
    window.emit(
      "finish_fetch_calendar",
      FetchCalendarEventPayload {
        success: true,
        synced_events_count: event_count,
      }
    );
  });
  Ok(())
}

#[get("/api/knapsack/connections/google/calendar")]
async fn fetch_google_calendar_api(
  req: HttpRequest,
  app_handle: Data<tauri::AppHandle>,
  connections_data: Data<Arc<Mutex<ConnectionsData>>>,
) -> impl Responder {
  let params =
    actix_web::web::Query::<FetchGoogleCalendarParams>::from_query(req.query_string()).unwrap();
  let unwrapped_app_handle = app_handle.get_ref().clone();
  let unwrapped_connections_data = connections_data.get_ref().clone();
  match fetch_calendar(
    params.email.clone(),
    unwrapped_app_handle,
    unwrapped_connections_data,
  )
  .await
  {
    Ok(_) => HttpResponse::Ok().json(
      FetchGoogleCalendarResponse { success: true, message: "Fetching calendar data".to_string() }
    ),
    Err(error) => {
      log::error!("Fetch calendar failed: {:?}", error);
      let error_msg = format!("Fetch calendar failed: {:?}", error
      );
      HttpResponse::BadRequest().json(
        FetchGoogleCalendarResponse { success: false, message: error_msg }
      )
    },
  }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleCalendarGetEventsParams {
  start_timestamp: u64,
  end_timestamp: u64,
}

#[get("/api/knapsack/connections/google/calendar/get_events")]
async fn get_events(req: HttpRequest) -> impl Responder {
  let params =
    actix_web::web::Query::<GoogleCalendarGetEventsParams>::from_query(req.query_string()).unwrap();
  let events = CalendarEvent::find_by_timestamp_range(
    params.start_timestamp.clone(),
    params.end_timestamp.clone(),
  );
  HttpResponse::Ok().json(events)
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleCalendarGetRecurrenceEventsParams {
  recurrence_id: String,
}

#[get("/api/knapsack/connections/google/calendar/get_emails_by_recurrence_id")]
async fn get_event_ids_by_recurrence_ids(req: HttpRequest) -> impl Responder {
  let params = actix_web::web::Query::<GoogleCalendarGetRecurrenceEventsParams>::from_query(
    req.query_string(),
  )
  .unwrap();
  let recurrence_id = params.recurrence_id.clone();

  let calendar_events = CalendarEvent::get_calendar_event_by_recurrence_id(recurrence_id);

  let mut event_ids = Vec::new();

  for event in calendar_events {
    event_ids.push(event.event_id);
  }

  HttpResponse::Ok().json(event_ids)
}
