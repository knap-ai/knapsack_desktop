use thiserror::Error;
use reqwest::Error as ReqwestError;
use serde_json::Error as JsonError;
use reqwest::StatusCode;


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
