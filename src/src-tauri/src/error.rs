use derive_more::From;
use reqwest::Error as ReqwestError;
use serde::Deserialize;
use serde_json::Value;
use std::{error::Error as StdError, fmt};

use crate::llm::types::LLMError;
use crate::server::qdrant::start_qdrant;
pub type Result<T> = std::result::Result<T, Error>;
use crate::connections::utils::FetchUuidError;

#[derive(Debug, From)]
pub enum Error {

  #[from]
  KSError(String), // Generic Knapsack Error

  #[from]
  LLMError(LLMError),

  #[from]
  RusqliteError(rusqlite::Error),

  #[from]
  ReqwestError(reqwest::Error),

  #[from]
  ImapError(imap::Error),

  #[from]
  TauriError(tauri::Error),

  #[from]
  IoError(std::io::Error),

  #[from]
  TimeError(std::time::SystemTimeError),

  #[from]
  HoundError(hound::Error),

  #[from]
  JoinError(tokio::task::JoinError),

  #[from]
  FetchUuidError(FetchUuidError),
}

#[derive(Debug)]
pub struct CustomQdrantError {
  details: String,
}

impl CustomQdrantError {
  pub fn new(msg: &str) -> CustomQdrantError {
    CustomQdrantError {
      details: msg.to_string(),
    }
  }
}

impl fmt::Display for CustomQdrantError {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.details)
  }
}

impl StdError for CustomQdrantError {
  fn description(&self) -> &str {
    &self.details
  }
}

#[derive(Debug, Deserialize)]
pub struct BaseQdrantResponse {
  pub status: Value,
}

#[derive(Debug)]
pub enum QdrantError {
  ConnectionError(ReqwestError),
  StatusError(ReqwestError),
  ActionError(CustomQdrantError),
  PayloadError(CustomQdrantError),
  ServerError(CustomQdrantError),
}

impl fmt::Display for QdrantError {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      QdrantError::ConnectionError(error) => write!(f, "{}", error.to_string()),
      QdrantError::StatusError(error) => write!(f, "{}", error.to_string()),
      QdrantError::ActionError(error) => write!(f, "{}", error.to_string()),
      QdrantError::PayloadError(error) => write!(f, "{}", error.to_string()),
      QdrantError::ServerError(error) => write!(f, "{}", error.to_string()),
    }
  }
}

pub fn handle_qdrant_request_error(error: ReqwestError) -> QdrantError {
  if error.is_connect() {
    start_qdrant();
    return QdrantError::ConnectionError(error);
  }
  return QdrantError::StatusError(error);
}
