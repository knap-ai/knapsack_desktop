use tokio;
use std::env;
use std::sync::Arc;
use tokio::sync::Mutex;
use serde_json::{ Value, Map };

use reqwest::Client;

use chrono::{Duration, DateTime, Utc, TimeZone};

use actix_web::web::Data;
use actix_web::{get, HttpRequest, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

use crate::connections::api::ConnectionsEnum;
use crate::connections::microsoft::constants::{ MICROSOFT_CALENDAR_SCOPE, MICROSOFT_BASE_URL };
use crate::connections::microsoft::auth::{ refresh_user_connection };
use crate::ConnectionsData;

use crate::db::models::calendar_event::CalendarEvent;
use crate::db::models::user_connection::UserConnection;
use crate::error::Error;
use crate::spotlight::WINDOW_LABEL;
use tauri::Manager;
use crate::connections::google::calendar::FetchCalendarEventPayload;
use crate::utils::log::knap_log_error;

#[derive(Debug, Deserialize, Serialize)]
pub struct FetchMicrosoftCalendarParams {
  email: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchMicrosoftCalendarResponse {
  success: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchMicrosoftCalendarFailResponse {
  success: bool,
  details: String,
}


#[derive(Deserialize, Debug)]
struct Event {
    id: Option<String>,
    seriesMasterId: Option<String>,
    subject: Option<String>,
    start: Option<MSDateTime>,
    end: Option<MSDateTime>,
    location: Option<Location>,
    attendees: Option<Vec<Attendee>>,
    body: Option<Body>,
    organizer: Option<Organizer>,
    isOnlineMeeting: Option<bool>,
    onlineMeetingUrl: Option<String>,
    recurrence: Option<Recurrence>,
}


#[derive(Deserialize, Debug)]
struct MSDateTime {
    dateTime: Option<String>,
    timeZone: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Location {
    displayName: Option<String>,
    address: Option<Address>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Pattern {
    r#type: Option<String>,
    interval: Option<u32>,
    daysOfWeek: Option<Vec<String>>,
    firstDayOfWeek: Option<String>,
    index: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Recurrence {
    pattern: Option<Pattern>,
    range: Option<Range>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Range {
    r#type: Option<String>,
    startDate: Option<String>,
    endDate: Option<String>,
    numberOfOccurrences: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Address {
    street: Option<String>,
    city: Option<String>,
    state: Option<String>,
    countryOrRegion: Option<String>,
    postalCode: Option<String>,
}

#[derive(Deserialize, Debug)]
struct Attendee {
    emailAddress: Option<EmailAddress>,
    status: Option<ResponseStatus>,
}

#[derive(Deserialize, Debug)]
struct EmailAddress {
    name: Option<String>,
    address: Option<String>,
}

#[derive(Deserialize, Debug)]
struct ResponseStatus {
    response: Option<String>,
    time: Option<String>,
}

#[derive(Deserialize, Debug)]
struct Body {
    contentType: Option<String>,
    content: Option<String>,
}

#[derive(Deserialize, Debug)]
struct Organizer {
    emailAddress: Option<EmailAddress>,
}

#[derive(Deserialize, Debug)]
struct EventResponse {
    value: Vec<Event>,
    #[serde(rename = "@odata.nextLink")]
    next_link: Option<String>,
}

fn convert_date_string_to_timestamp(date: &str) -> Option<i64> {
  let cleaned_date = date.trim_end_matches('0').trim_end_matches('.');

  match Utc.datetime_from_str(cleaned_date, "%Y-%m-%dT%H:%M:%S") {
      Ok(datetime) => Some(datetime.timestamp()),
      Err(e) => {
          eprintln!("Error converting timestamp: {:?}", e);
          None
      }
  }
}

fn create_calendar_event(event: Event) -> Result<(), Error> {
  let event_id = event.id.unwrap();
  let title = event.subject;
  let description = event.body.unwrap().content;
  let mut creator_email = None;
  if let Some(organizer) = event.organizer {
    creator_email = organizer.emailAddress.unwrap().address;
  }
  let mut attendees_maps: Vec<Map<String, Value>> = Vec::new();
  if let Some(attendees) = event.attendees {
    for attendee in attendees {
      if let Some(emailAddress) =  attendee.emailAddress{
        let mut attendee_map = Map::new();
        attendee_map.insert(
          "email".to_string(),
          Value::String(emailAddress.address.unwrap_or("".to_string())),
        );
        attendee_map.insert(
          "name".to_string(),
          Value::String(emailAddress.name.unwrap_or("".to_string())),
        );

        attendees_maps.push(attendee_map);
      }
    } 
  }
  let mut recurrence_json: Option<String> = None;
  if let Some(recurrence) = &event.recurrence {
      match serde_json::to_string(recurrence) {
          Ok(json) => recurrence_json = Some(json),
          Err(e) => eprintln!("Error during recurrence serialization {:?}", e),
      }
  }

  let recurrence_id = event.seriesMasterId;
  let attendees_json = Some(serde_json::to_string(&attendees_maps).unwrap());

  let google_meet_url = event.onlineMeetingUrl;

  let mut location = None;
  if let Some(location_obj) = event.location {
    location = Some(location_obj.displayName.unwrap_or("".to_string()))
  }

  let mut start = None;
  if let Some(item_start) = event.start {
    if let Some(item_start_str) = item_start.dateTime {
      start = convert_date_string_to_timestamp(&item_start_str);
    }
  }
  let mut end = None;
  if let Some(item_end) = event.end {
    if let Some(item_end) = item_end.dateTime {
      end = convert_date_string_to_timestamp(&item_end);
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

  calendar_event.create()
}

async fn fetch_calendar(  
  email: String,
  app_handle: tauri::AppHandle,
  connections_data: Arc<Mutex<ConnectionsData>>
) -> Result<(), Error> {
  let user_connection = match UserConnection::find_by_user_email_and_scope(
    email.clone(),
    String::from(MICROSOFT_CALENDAR_SCOPE),
  ) {
    Ok(user_connection) => user_connection,
    Err(error) => {
      log::error!("Failed to find user connection: {:?}", error);
      let msg = format!("Failed to find user connection for user: {}", email);
      knap_log_error(msg, Some(error), Some(true));
      return Err(Error::KSError("Fail to get user connection".to_string()));
    }
  };

  let update_user_connection = match refresh_user_connection(user_connection.clone(), email.clone()).await {
    Ok(updated_user_connection) => updated_user_connection,
    Err(error) => {
      log::error!("Failed to refresh access token: {:?}", error);
      let msg = format!("Failed to refresh access token in microsoft calendar for user: {}", email);
      knap_log_error(msg, Some(error), None);
      return Err(Error::KSError("Fail to refresh access token".to_string()));
    }
  };

  if ConnectionsData::lock_and_get_connection_is_syncing(
    connections_data.clone(),
    ConnectionsEnum::MicrosoftCalendar,
  )
  .await
  {
    return Ok(());
  }
  ConnectionsData::lock_and_set_connection_is_syncing(
    connections_data.clone(),
    ConnectionsEnum::MicrosoftCalendar,
    true,
  )
  .await;

  let client = Client::new();
  let now = Utc::now();

  let one_month_ago = (chrono::Utc::now() - chrono::Duration::days(31)).format("%Y-%m-%dT%H:%M:%SZ").to_string();;
  let one_month_later = (chrono::Utc::now() + chrono::Duration::days(31)).format("%Y-%m-%dT%H:%M:%SZ").to_string();;

  let mut url = format!(
    "{}/me/events?$filter=start/dateTime ge '{}' and start/dateTime lt '{}'&$top=500",
    MICROSOFT_BASE_URL, one_month_ago, one_month_later
  );

  let mut event_ids_total: Vec<String> = Vec::new();
  loop {
    let response = client
      .get(&url)
      .header("Authorization", update_user_connection.token.clone())
      .send()
      .await?;

    if response.status().is_success() {
      let body = response.text().await?;
      let events_response: EventResponse = serde_json::from_str(&body).unwrap();
      let events = events_response.value;

      let event_ids: Vec<String> = events.iter().filter_map(|event| event.id.clone()).collect();
      event_ids_total.extend(event_ids);

      for event in events {
        if let Err(e) = create_calendar_event(event) {
          let msg = format!("Error creating calendar event: {}", email);
          knap_log_error(msg, Some(e), Some(true));
        };
      }

      if let Some(next_link) = events_response.next_link {
        url = next_link;
      } else {
        break;
      }
    } else {
      ConnectionsData::lock_and_set_connection_is_syncing(
        connections_data.clone(),
        ConnectionsEnum::MicrosoftCalendar,
        false,
      )
      .await;

      return Err(Error::from(format!(
        "Error when fetch calendar events: {}",
        response.status()
      )));
    }
  }

  let event_count = event_ids_total.len();
  CalendarEvent::delete_calendar_events_removed(event_ids_total.clone());
  UserConnection::update_last_sync_by_id(user_connection.id.unwrap(), (chrono::Utc::now() + chrono::Duration::days(31)));

  ConnectionsData::lock_and_set_connection_is_syncing(
    connections_data.clone(),
    ConnectionsEnum::MicrosoftCalendar,
    false,
  ).await;
  let window = app_handle.get_window(WINDOW_LABEL).unwrap();
  window.emit(
    "finish_fetch_calendar",
    FetchCalendarEventPayload {
      success: true,
      synced_events_count: event_count,
    }
  );
  
  Ok(())
}

#[get("/api/knapsack/connections/microsoft/calendar")]
async fn fetch_microsoft_calendar_api(
  req: HttpRequest,
  app_handle: Data<tauri::AppHandle>,
  connections_data: Data<Arc<Mutex<ConnectionsData>>>,
) -> impl Responder {
  let params =
    actix_web::web::Query::<FetchMicrosoftCalendarParams>::from_query(req.query_string()).unwrap();
  let unwrapped_app_handle = app_handle.get_ref().clone();
  let unwrapped_connections_data = connections_data.get_ref().clone();

  match fetch_calendar(
    params.email.clone(),
    unwrapped_app_handle,
    unwrapped_connections_data,
  ).await {
    Ok(_) => HttpResponse::Ok().json(FetchMicrosoftCalendarResponse { success: true }),
    Err(error) => {
      log::error!("Fetch calendar fail {:?}", error);
      HttpResponse::BadRequest().json(
        FetchMicrosoftCalendarFailResponse { 
          success: false, 
          details: format!("Fetch calendar error: {:?}", error)
        }
      )
    }
  }
}
