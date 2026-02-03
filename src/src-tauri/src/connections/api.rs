use std::collections::HashMap;
use std::sync::Arc;

use actix_web::delete;
use actix_web::get;
use actix_web::web;
use actix_web::web::Data;
use actix_web::HttpRequest;
use actix_web::HttpResponse;

use actix_web::Responder;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tokio::sync::Mutex;

use crate::db::models::user_connection::UserConnection;
use crate::memory::semantic::SemanticService;
use crate::connections::utils::get_knapsack_api_connection;


#[derive(Debug, Deserialize, Serialize)]
pub struct SuccessResponse {
  success: bool,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserConnectionResponse {
  #[serde(flatten)]
  user_connection: UserConnection,
  synced_since: Option<u64>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GetConnectionsResponse {
  success: bool,
  connections: Option<Vec<UserConnectionResponse>>,
  message: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GetConnectionsParams {
  email: String,
}

#[derive(Hash, Clone, PartialEq, Eq, Debug, Deserialize, Serialize)]
pub enum ConnectionsEnum {
  GoogleCalendar,
  GoogleGmail,
  GoogleDrive,
  LocalFiles,
  MicrosoftCalendar,
  MicrosoftOutlook,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ConnectionsData {
  is_syncing: HashMap<ConnectionsEnum, bool>,
}

impl ConnectionsData {
  pub fn new() -> ConnectionsData {
    ConnectionsData {
      is_syncing: HashMap::from([]),
    }
  }

  pub fn reset(&mut self) {
    let connections_clone = self.is_syncing.clone();
    let keys = connections_clone.keys();
    for key in keys {
      self.is_syncing.insert(key.clone(), false);
    }
  }

  pub fn get_connection_is_syncing(&self, connection: ConnectionsEnum) -> bool {
    *self.is_syncing.get(&connection).unwrap_or(&false)
  }

  pub fn set_connection_is_syncing(&mut self, connection: ConnectionsEnum, is_syncing: bool) {
    self.is_syncing.insert(connection, is_syncing);
  }

  pub async fn lock_and_get_connection_is_syncing(
    connections_data: Arc<Mutex<ConnectionsData>>,
    connection: ConnectionsEnum,
  ) -> bool {
    let connections_data_locked = connections_data.lock().await;
    return connections_data_locked.get_connection_is_syncing(connection);
  }

  pub async fn lock_and_set_connection_is_syncing(
    connection_data: Arc<Mutex<ConnectionsData>>,
    connection: ConnectionsEnum,
    is_syncing: bool,
  ) {
    let mut connections_data_locked = connection_data.lock().await;
    connections_data_locked.set_connection_is_syncing(connection, is_syncing)
  }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GetConnectionsDataResponse {
  success: bool,
  data: ConnectionsData,
}

#[get("/api/knapsack/connections/is_syncing")]
async fn get_is_connections_syncing(
  _req: HttpRequest,
  connections_data: Data<Arc<Mutex<ConnectionsData>>>,
) -> impl Responder {
  let is_syncing = connections_data.lock().await;
  let response = GetConnectionsDataResponse {
    data: is_syncing.clone(),
    success: true,
  };
  HttpResponse::Ok().json(response)
}

#[get("/api/knapsack/connections/signout")]
async fn signout(
    _req: HttpRequest,
    semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
    connections_data: Data<Arc<Mutex<ConnectionsData>>>,
) -> impl Responder {
    if let Some(service) = &*semantic_service.lock().await {
        service.clear_queue().await;
    }
    
    let mut data = connections_data.lock().await;
    data.reset();
    
    HttpResponse::Ok().json(SuccessResponse { success: true })
}

#[get("/api/knapsack/connections")]
async fn get_connections(req: HttpRequest) -> impl Responder {
  let params =
    actix_web::web::Query::<GetConnectionsParams>::from_query(req.query_string()).unwrap();
  let synced_since = match UserConnection::get_synced_since() {
    Ok(s) => Some(s),
    Err(_) => None,
  };
  match UserConnection::find_by_user_email(params.email.clone()) {
    Ok(connections) => {
      let connection_responses: Vec<UserConnectionResponse> = connections
        .into_iter()
        .map(|connection| {
          let mut connection_synced_since = None;
          if let Some(sync_dates) = &synced_since {
            if let Some(conn) = &connection.connection {
              connection_synced_since = match conn.scope.as_str() {
                "google_gmail_modify" => sync_dates.emails_synced_since,
                "google_drive_read" => None,
                "google_calendar_read" => None,
                "google_profile_read" => None,
                _ => None,
              };
            }
          }

          UserConnectionResponse {
            user_connection: connection,
            synced_since: connection_synced_since,
          }
        })
        .collect();

      let response = GetConnectionsResponse {
        connections: Some(connection_responses),
        success: true,
        message: None,
      };
      HttpResponse::Ok().json(response)
    }
    Err(_) => {
      log::error!("Failed retrieving user connections");
      HttpResponse::BadRequest().json(GetConnectionsResponse {
        success: false,
        connections: None,
        message: Some("Failed to retrieve user connections".to_string()),
      })
    }
  }
}

#[delete("/api/knapsack/connections/{connection_id}")]
async fn delete_connection(path: web::Path<String>) -> impl Responder {
  match path.into_inner().parse() {
    Ok(connection_id) => {
      match UserConnection::find_by_id(connection_id) {
        Ok(connections) => match connections.delete() {
          Ok(_) => HttpResponse::Ok().json(json!({"success": true})),
          Err(error) => {
            log::error!("Failed to delete connection: {:?}", error);
            HttpResponse::BadRequest().json(json!({"success": false}))
          }
        },
        Err(error) => {
          log::error!("Failed to retrieve connection {:?}", error);
          HttpResponse::BadRequest().json(json!({"success": false}))
        }
      }
    },
    Err(error) => {
      log::error!("Path param parsing failed {:?}", error);
      HttpResponse::BadRequest().json(json!({"success": false}))
    }
  }
}

#[get("/api/knapsack/connections/refresh_token_api/{user_email}")]
async fn refresh_knapsack_api_token(path: web::Path<String>) -> impl Responder {
    let user_email = path.into_inner();
    
    match get_knapsack_api_connection(user_email) {
        Ok(user_connection) => {
            match user_connection.refresh_token {
                Some(token) => HttpResponse::Ok().json(json!({
                    "success": true,
                    "token": token
                })),
                None => HttpResponse::BadRequest().json(json!({
                    "success": false,
                    "message": "Refresh token not found for the user"
                }))
            }
        },
        Err(_) => {
            log::error!("Failed to get Knapsack API connection");
            HttpResponse::BadRequest().json(json!({
                "success": false,
                "message": "Failed to retrieve Knapsack API connection"
            }))
        }
    }
}
