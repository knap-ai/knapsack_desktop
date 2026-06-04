use reqwest::Error as ReqwestError;
use reqwest::StatusCode;
use serde_json::Error as JsonError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum FetchError {
  #[error("Network error: {0}")]
  NetworkError(#[from] ReqwestError),
  #[error("Invalid or expired access token")]
  InvalidToken,
  #[error("Rate limit exceeded")]
  RateLimitExceeded,
  #[error("Server error: {0}")]
  ServerError(StatusCode),
  #[error("Failed to parse response: {0}")]
  ParsingError(#[from] JsonError),
  #[error("Unknown error: {0}")]
  UnknownError(String),
}
