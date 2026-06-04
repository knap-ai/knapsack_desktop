use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc,
};
use tauri::{AppHandle, Manager};

/// Start monitoring the default audio input device.
/// Emits `mic-activated` to the main window whenever the microphone turns on
/// (from any app), as long as Knapsack itself is not already recording.
/// macOS only; no-op on other platforms.
#[cfg(target_os = "macos")]
pub fn start_mic_monitor(app: AppHandle, is_knapsack_recording: Arc<AtomicBool>) {
  tauri::async_runtime::spawn(async move {
    run_monitor(app, is_knapsack_recording).await;
  });
}

#[cfg(not(target_os = "macos"))]
pub fn start_mic_monitor(_app: AppHandle, _is_knapsack_recording: Arc<AtomicBool>) {}

#[cfg(target_os = "macos")]
async fn run_monitor(app: AppHandle, is_knapsack_recording: Arc<AtomicBool>) {
  use std::time::{Duration, Instant};
  use tokio::time::sleep;

  let cooldown = Duration::from_secs(30);
  let mut was_active = false;
  let mut last_notified = Instant::now()
    .checked_sub(cooldown)
    .unwrap_or_else(Instant::now);

  loop {
    sleep(Duration::from_millis(500)).await;

    // count_microphone_users() checks all audio devices for IsRunningSomewhere.
    // A non-zero count means at least one mic is in use by some process.
    let active = super::macos::count_microphone_users() > 0;

    if active && !was_active {
      let knapsack_recording = is_knapsack_recording.load(Ordering::Relaxed);
      let cooldown_elapsed = last_notified.elapsed() >= cooldown;

      if !knapsack_recording && cooldown_elapsed {
        if let Some(window) = app.get_window("main") {
          let _ = window.emit("mic-activated", ());
        }
        last_notified = Instant::now();
      }
    }

    was_active = active;
  }
}
