use actix_web::{delete, HttpResponse, Responder};
use serde_json::json;
use crate::error::Error;

#[delete("/api/knapsack/audio")]
async fn delete_audio_files() -> impl Responder {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let input_wav_path = knapsack_data_dir.join("input.wav");
  let output_wav_path = knapsack_data_dir.join("output.wav");
  let output_raw_path = knapsack_data_dir.join("output.raw");
  let processed_mp3_path = knapsack_data_dir.join("processed.mp3");

  if input_wav_path.exists() {
    std::fs::remove_file(input_wav_path)
      .map_err(|e| Error::KSError(format!("Failed to remove input WAV file: {}", e)));
  }

  if output_wav_path.exists() {
    std::fs::remove_file(output_wav_path)
     .map_err(|e| Error::KSError(format!("Failed to remove output WAV file: {}", e)));
  }

  if output_raw_path.exists() {
    std::fs::remove_file(output_raw_path)
     .map_err(|e| Error::KSError(format!("Failed to remove output WAV file: {}", e)));
  }

  if processed_mp3_path.exists() {
    std::fs::remove_file(processed_mp3_path)
      .map_err(|e| Error::KSError(format!("Failed to remove processed_mp3_path file: {}", e)));
  }

  log::debug!("Deleted audio.");
  HttpResponse::Ok().json(json!({
    "success": true,
    "message": "Audio files deleted successfully"
  }))
}


