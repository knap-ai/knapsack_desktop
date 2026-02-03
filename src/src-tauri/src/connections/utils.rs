use reqwest::{Client, header::{HeaderMap, HeaderValue, AUTHORIZATION}};
use serde_json::json;
use serde_json::Value;
use log::error;
use thiserror::Error;
use serde::Deserialize;
use crate::db::models::user::{User};
use crate::db::models::user_connection::UserConnection;
use crate::db::models::connection::Connection;
use crate::db::db::get_db_conn;
use crate::connections::google::constants::KNAPSACK_ACCESS_KEY;
use rusqlite::params;

#[derive(Deserialize)]
struct UserUuidResponse {
    success: bool,
    error_code: Option<String>,
    message: Option<String>,
    uuid: Option<String>,
}

#[derive(Debug, Error)]
pub enum FetchUuidError {
    #[error("Network error: {0}")]
    NetworkError(String),
    #[error("Failed to parse UUID response: {0}")]
    ParseError(String),
}

pub async fn fetch_user_uuid(email: &str, refresh_internal: Option<String>) -> Result<String, FetchUuidError> {
    let mut user = None;
    if let Ok(found_user) = User::find_by_email(email.to_string()) {
        if let Some(existing_uuid) = found_user.uuid {
            return Ok(existing_uuid);
        } else {
            user = Some(found_user);
        }
    }

    let access_token = get_api_access_token(email, refresh_internal).await
        .map_err(|e| FetchUuidError::NetworkError(format!("Failed to refresh access token: {}", e)))?;

    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", access_token))
            .map_err(|e| FetchUuidError::NetworkError(format!("Invalid header value: {}", e)))?
    );

    let api_server: &'static str = env!("VITE_KN_API_SERVER", "Missing VITE_KN_API_SERVER env var");
    let client = Client::new();
    let user_uuid_response = client
        .get(format!("{api_server}/api/users/"))
        .headers(headers)
        .send()
        .await
        .map_err(|err| {
            error!("Failed to fetch user UUID: {:?}", err);
            FetchUuidError::NetworkError(format!("Failed to fetch user UUID: {:?}", err))
        })?;

    let response_data: UserUuidResponse = user_uuid_response.json().await.map_err(|err| {
        error!("Failed to parse user UUID response: {:?}", err);
        FetchUuidError::ParseError(format!("Failed to parse user UUID response: {:?}", err))
    })?;

    if response_data.success {
        if let Some(uuid) = response_data.uuid {
            if let Some(mut existing_user) = user {
                existing_user.uuid = Some(uuid.clone());
                if let Err(e) = existing_user.update() {
                    error!("Failed to update user UUID: {:?}", e);
                }
            }
            Ok(uuid)
        } else {
            Err(FetchUuidError::ParseError("UUID not found in response".into()))
        }
    } else {
        Err(FetchUuidError::NetworkError(format!(
            "Error fetching UUID: {:?}, Message: {:?}",
            response_data.error_code, response_data.message
        )))
    }
}

pub async fn get_api_access_token(email: &str, refresh_internal: Option<String>) -> Result<String, Box<dyn std::error::Error>> {
    let api_server: &'static str = env!("VITE_KN_API_SERVER", "Missing VITE_KN_API_SERVER env var");
    let client = Client::new();

    let mut headers = HeaderMap::new();
    let refresh_token = match refresh_internal {
        Some(token) => token,
        None => {
            let user_conn = get_knapsack_api_connection(email.to_string())?;
            user_conn.refresh_token.ok_or("Refresh token not found")?
        }
    };

    headers.insert("refresh-token", HeaderValue::from_str(&refresh_token)?);

    let response = client
        .get(format!("{api_server}/api/authentication/refresh/app"))
        .headers(headers)
        .send()
        .await?;

    if response.status().is_success() {
        let response_json: Value = response.json().await?;
        if let Some(access_token) = response_json["access_token"].as_str() {
            Ok(access_token.to_string())
        } else {
            Err("Access token not found in response".into())
        }
    } else {
        Err(format!("Failed to refresh token: {}", response.status()).into())
    }
}

pub fn create_knapsack_api_connection(user_email: String, refresh_internal: &str) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::find_by_scope(KNAPSACK_ACCESS_KEY.to_string())?;
    let user = User::find_by_email(user_email.clone())?;
  
    let mut user_conn = match get_knapsack_api_connection(user_email.clone()) {
      Ok(uc) => Some(uc),
      Err(_) => None,
    };
  
    if user_conn.is_none() {
      let user_connection = UserConnection {
        id: None,
        user_id: user.id.unwrap(),
        connection_id: connection.id.unwrap(),
        token: refresh_internal.to_string(),
        refresh_token: Some(refresh_internal.to_string()),
        connection: None,
        last_synced: None,
      };
      user_connection.upsert(); 
    } else {
      let user_connection = user_conn.as_mut().unwrap();
      user_connection.token = refresh_internal.to_string();
      user_connection.refresh_token = Some(refresh_internal.to_string());
      user_connection.update(); 
    }
  
    Ok(())
  }

  pub fn get_knapsack_api_connection(user_email: String) -> Result<UserConnection, Box<dyn std::error::Error>> {
    let user_connection = match UserConnection::find_by_user_email_and_scope(user_email, KNAPSACK_ACCESS_KEY.to_string()) {
      Ok(uc) => uc,
      Err(error) => {
          return Err("Failed to find user connection".into());
      }
    };
  
    Ok(user_connection)
  }