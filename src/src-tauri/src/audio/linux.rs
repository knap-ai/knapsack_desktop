use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tokio::sync::Semaphore;

pub async fn record_speaker_output(
  _is_recording: Arc<AtomicBool>,
  _is_paused: Arc<AtomicBool>,
  _output_file: &str,
  _semaphore: Arc<Semaphore>,
) -> Result<(), Box<dyn std::error::Error>> {
  Err("Speaker output recording is not supported on Linux".into())
}

pub fn count_microphone_users() -> u64 {
  0
}
