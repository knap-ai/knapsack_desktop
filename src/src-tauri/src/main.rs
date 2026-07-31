// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{window::WindowBuilder, WindowUrl};

#[macro_use]
extern crate lazy_static;

extern crate derive_more;
extern crate dirs;
extern crate qdrant_client;
extern crate serde;
use serde::{Deserialize, Serialize};
extern crate tokio;

mod api;
mod audio;
mod automations;
mod clawd;
mod config;
mod connections;
mod constants;
mod crash_reporter;
mod db;
mod error;
mod file_upload;
mod heartbeat;
mod library_curator;
mod llm;
mod local_fs;
mod mcp;
mod memory;
mod privileged_worker;
mod pty;
mod search;
mod server;
mod spotlight;
mod transcribe;
mod user;
mod utils;
mod workspaces;

use connections::api::ConnectionsData;
use log::info;
use memory::semantic::start_embed_service;
use memory::semantic::SemanticService;
#[cfg(target_os = "macos")]
use once_cell::sync::Lazy;
use once_cell::sync::OnceCell;
use std::env;
use std::fs::create_dir_all;
use std::path::PathBuf;
use std::sync::atomic::AtomicBool;
use std::sync::atomic::{AtomicU16, Ordering};
use std::sync::Arc;
use std::sync::Mutex as StdMutex;
use tauri::async_runtime::TokioJoinHandle;
use tauri::{
  App, AppHandle, CustomMenuItem, FileDropEvent, Manager, State, SystemTray, SystemTrayEvent,
  SystemTrayMenu, SystemTrayMenuItem, WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;
use tokio::sync::Mutex;
use uuid::Uuid;
use window_shadows::set_shadow;

use crate::audio::microphone::open_microphone_settings;
use crate::audio::permission::{
  check_audio_permissions, diagnose_audio_permissions, open_screen_recording_settings,
  reset_audio_permissions,
};
use crate::connections::microsoft::auth::start_oauth;
use crate::db::db::{start_database, KNAPSACK_DB_FILENAME};
use crate::utils::log::setup_logger;

use serde_json::json;
use serde_json::Value;
use std::process;
use tokio::sync::Semaphore;

#[cfg(feature = "profiling")]
use console_subscriber;

// static EMBEDDER_PATH: OnceCell<PathBuf> = OnceCell::new();

pub const KNAPSACK_DATA_DIR: &str = ".knapsack";
pub const TRANSCRIPTS_DIR: &str = "transcripts";

/// Query the primary-monitor work area on Windows (screen rect minus taskbar).
/// Returns `(x, y, width, height)` in physical pixels, or `None` on failure /
/// non-Windows platforms.
#[cfg(target_os = "windows")]
fn windows_work_area() -> Option<(i32, i32, i32, i32)> {
  #[repr(C)]
  struct Rect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
  }
  extern "system" {
    fn SystemParametersInfoW(action: u32, param: u32, pvparam: *mut Rect, winini: u32) -> i32;
  }
  const SPI_GETWORKAREA: u32 = 0x0030;
  let mut rc = Rect {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };
  let ok = unsafe { SystemParametersInfoW(SPI_GETWORKAREA, 0, &mut rc, 0) };
  if ok != 0 {
    Some((rc.left, rc.top, rc.right - rc.left, rc.bottom - rc.top))
  } else {
    None
  }
}

const NOTIF_HEIGHT: f64 = 180.0;
const NOTIF_WIDTH: f64 = 720.0;
const NOTIF_Y_OFFSET: f64 = 50.0; // Push below macOS menu bar / notch
const NOTIF_START_X_OFFSET: i32 = 500;
const NOTIF_END_X_OFFSET: i32 = 20;
const NOTIF_ANIMATION_DURATION: u32 = 90;
const NOTIF_FRAME_TIME: u64 = 8;

#[cfg(target_os = "macos")]
fn updater_temp_root_from_executable(executable_path: &std::path::Path) -> Option<PathBuf> {
  let executable_dir = executable_path.parent()?;
  let app_root = if executable_dir.to_string_lossy().contains("Contents/MacOS") {
    executable_dir.parent()?.parent()?.to_path_buf()
  } else {
    executable_dir.to_path_buf()
  };
  let install_root = app_root.parent()?.to_path_buf();
  Some(install_root.join(".knapsack-updater-tmp"))
}

#[tauri::command]
fn kn_prepare_updater_temp_dir() -> Result<Option<String>, String> {
  #[cfg(target_os = "macos")]
  {
    let current_exe = std::env::current_exe()
      .map_err(|err| format!("Unable to locate current executable for updater prep: {err}"))?;
    let temp_root = updater_temp_root_from_executable(&current_exe).ok_or_else(|| {
      "Unable to derive updater temp directory from current executable".to_string()
    })?;
    create_dir_all(&temp_root).map_err(|err| {
      format!(
        "Unable to create updater temp directory at {:?}: {err}",
        temp_root
      )
    })?;

    std::env::set_var("TMPDIR", &temp_root);
    std::env::set_var("TMP", &temp_root);
    std::env::set_var("TEMP", &temp_root);

    log::info!(
      "Prepared macOS updater temp directory on app volume: {:?}",
      temp_root
    );
    return Ok(Some(temp_root.to_string_lossy().into_owned()));
  }

  #[cfg(not(target_os = "macos"))]
  {
    Ok(None)
  }
}

#[tauri::command]
async fn kn_send_composed_email(
  to: String,
  cc: Option<String>,
  subject: String,
  body: String,
  thread_id: Option<String>,
  user_email: String,
  user_name: Option<String>,
  attachments: Option<Vec<crate::clawd::gmail::EmailAttachment>>,
) -> Result<String, String> {
  let trimmed_to = to.trim().to_string();
  let trimmed_subject = subject.trim().to_string();
  let trimmed_body = body.trim().to_string();

  if trimmed_to.is_empty() || trimmed_subject.is_empty() || trimmed_body.is_empty() {
    return Err("To, subject, and body are required".to_string());
  }

  crate::clawd::gmail::send_gmail_email(
    &user_email,
    user_name.as_deref().unwrap_or(""),
    &trimmed_to,
    cc.as_deref(),
    &trimmed_subject,
    &trimmed_body,
    thread_id.as_deref(),
    attachments.as_deref(),
  )
  .await
}

fn validate_bundled_ui_asset(app: &App, page: &str, label: &str) -> Option<String> {
  let candidate_paths = vec![page.to_string(), format!("dist/{page}")];
  let found = candidate_paths.iter().find_map(|candidate| {
    app.path_resolver().resolve_resource(candidate).map(|path| {
      log::info!("Resolved {label} UI asset: {:?}", path);
      candidate.clone()
    })
  });

  if let Some(path) = found {
    log::info!("Using {label} UI asset at {path}");
    return Some(path);
  }

  let tried = candidate_paths.join(", ");
  log::error!(
    "Missing required bundled UI asset for {label}. Tried: {tried}. This is usually a packaging issue; please reinstall the app from the latest release."
  );
  None
}

#[derive(serde::Serialize)]
#[serde(rename_all = "PascalCase")]
pub enum Release {
  Limited,
  Full,
}

pub fn release_type() -> Release {
  #[cfg(not(any(feature = "full", feature = "limited")))]
  {
    return Release::Limited;
  }
}

#[cfg(all(test, target_os = "macos"))]
mod updater_temp_dir_tests {
  use super::updater_temp_root_from_executable;
  use std::path::Path;

  #[test]
  fn derives_temp_root_next_to_app_bundle_on_macos_layout() {
    let exe = Path::new("/Applications/Knapsack.app/Contents/MacOS/Knapsack");
    let temp_root = updater_temp_root_from_executable(exe).unwrap();
    assert_eq!(temp_root, Path::new("/Applications/.knapsack-updater-tmp"));
  }

  #[test]
  fn derives_temp_root_next_to_binary_for_non_bundle_layout() {
    let exe = Path::new("/tmp/knapsack-dev/target/debug/knapsack");
    let temp_root = updater_temp_root_from_executable(exe).unwrap();
    assert_eq!(
      temp_root,
      Path::new("/tmp/knapsack-dev/target/debug/.knapsack-updater-tmp")
    );
  }
}

#[cfg(target_os = "macos")]
static KN_KEEP_AWAKE_PROCESS: Lazy<StdMutex<Option<std::process::Child>>> =
  Lazy::new(|| StdMutex::new(None));
#[cfg(target_os = "windows")]
static KN_KEEP_AWAKE_PROCESS: StdMutex<bool> = StdMutex::new(false);

#[tauri::command]
fn kn_set_keep_awake(enabled: bool) -> Result<(), String> {
  #[cfg(target_os = "macos")]
  {
    keep_awake_macos::set_keep_awake(enabled);
  }
  #[cfg(target_os = "windows")]
  {
    keep_awake_windows::set_keep_awake(enabled);
  }

  #[cfg(not(any(target_os = "macos", target_os = "windows")))]
  {
    let _ = enabled;
  }

  Ok(())
}

#[cfg(target_os = "macos")]
mod keep_awake_macos {
  use std::process::{Command, Stdio};

  use super::KN_KEEP_AWAKE_PROCESS;

  pub fn set_keep_awake(enabled: bool) {
    let mut handle = KN_KEEP_AWAKE_PROCESS.lock().unwrap();

    if enabled {
      if handle.is_some() {
        return;
      }

      let app_pid = std::process::id().to_string();
      let result = Command::new("caffeinate")
        .arg("-dims")
        .arg("-w")
        .arg(app_pid)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn();
      match result {
        Ok(child) => {
          *handle = Some(child);
          log::info!("macOS keep-awake assertion started (caffeinate)");
        }
        Err(err) => {
          log::warn!("Failed to start caffeinate keep-awake process: {}", err);
        }
      }
      return;
    }

    if let Some(mut process) = handle.take() {
      if let Err(err) = process.kill() {
        log::warn!("Failed to stop caffeinate keep-awake process: {}", err);
      }
      let _ = process.wait();
      log::info!("macOS keep-awake assertion stopped");
    }
  }
}

#[cfg(target_os = "windows")]
mod keep_awake_windows {
  use super::StdMutex;
  use super::KN_KEEP_AWAKE_PROCESS;

  const ES_CONTINUOUS: u32 = 0x80000000;
  const ES_SYSTEM_REQUIRED: u32 = 0x00000001;
  const ES_DISPLAY_REQUIRED: u32 = 0x00000002;
  const ES_AWAYMODE_REQUIRED: u32 = 0x00000040;

  #[link(name = "kernel32")]
  extern "system" {
    fn SetThreadExecutionState(es_flags: u32) -> u32;
  }

  pub fn set_keep_awake(enabled: bool) {
    let mut active = KN_KEEP_AWAKE_PROCESS.lock().unwrap();

    if enabled && *active {
      return;
    }

    if !enabled && !*active {
      return;
    }

    let flags = if enabled {
      ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED | ES_AWAYMODE_REQUIRED
    } else {
      ES_CONTINUOUS
    };

    let result = unsafe { SetThreadExecutionState(flags) };

    if result == 0 {
      log::warn!(
        "Failed to {} Windows keep-awake assertion",
        if enabled { "enable" } else { "disable" }
      );
      return;
    }

    *active = enabled;
    if enabled {
      log::info!("Windows keep-awake assertion enabled");
    } else {
      log::info!("Windows keep-awake assertion disabled");
    }
  }
}

fn setup_database() {
  tokio::spawn(async {
    start_database().await;
  });
}

// fn setup_vector_database() {
//   server::qdrant::start_qdrant();
// }

// fn setup_embedding_service(
//   is_chatting: Arc<Mutex<AtomicBool>>,
//   semantic_service: Arc<Mutex<Option<SemanticService>>>,
//   app: &mut tauri::App,
//   connections_data: Arc<Mutex<ConnectionsData>>,
// ) -> SemanticService {
//   let embedder_path = match EMBEDDER_PATH.get() {
//     Some(e) => e,
//     None => panic!("EMBEDDER_PATH not set"),
//   };
//
//   start_embed_service(
//     embedder_path.clone(),
//     is_chatting,
//     semantic_service,
//     app.handle(),
//     connections_data,
//   )
// }

fn setup_handler(
  app: &mut tauri::App,
  // llm_path: PathBuf,
  knapsack_gmail_indexing_progress: Arc<AtomicU16>,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
  is_chatting: Arc<Mutex<AtomicBool>>,
  connections_data: Arc<Mutex<ConnectionsData>>,
) -> Result<(), Box<dyn std::error::Error + 'static>> {
  // Set activation poicy to Accessory to prevent the app icon from showing on the dock
  //
  // For now, we're not going to have this enabled. It's convenient to
  // be able to kill the app from the Dock/app tile.
  // app.set_activation_policy(tauri::ActivationPolicy::Accessory);

  let app_handle = app.handle();

  // Start the gateway as early as possible so it warms in parallel with
  // app-local config and key propagation.
  let auto_enable_handle = app.handle();
  std::thread::spawn(move || {
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
      clawd::service::auto_enable_if_needed(&auto_enable_handle).await;
      // Keeps Rust aware of live Slack sessions so the Snowflake MCP tool
      // can bind queries to a verified sender and per-sender sandbox
      // containers get torn down promptly (see clawd/session_watcher.rs).
      clawd::session_watcher::spawn(auto_enable_handle.clone());
      // `spawn()` only schedules the poll loop on this runtime; keep this
      // dedicated thread/runtime alive for the app's lifetime so the task
      // keeps running instead of being dropped once this block finishes.
      std::future::pending::<()>().await;
    });
  });

  config::init_knapsack_config(
    app_handle
      .path_resolver()
      .app_local_data_dir()
      .unwrap_or_default(),
  );

  // Load saved LLM API keys into env vars early, before the actix server
  // starts, so that llm_complete (meeting notes) and transcribe can use them.
  clawd::service::propagate_llm_keys_to_env(&app_handle);

  let actix_app_handle = app.handle();
  let server_error_handle = actix_app_handle.clone();

  // Clone is_chatting for the heartbeat loop (before it's moved into the server thread)
  let heartbeat_is_chatting = is_chatting.clone();
  let heartbeat_app_handle = app.handle();

  // Start the server
  let _handle = std::thread::spawn(move || {
    match server::actix::start_server(
      8897,
      // llm_path,
      actix_app_handle,
      knapsack_gmail_indexing_progress,
      semantic_service,
      is_chatting,
      connections_data,
    ) {
      Ok(_) => {
        info!("Server started on port 8897");
        std::process::exit(0);
      }
      Err(e) => {
        eprintln!("Error starting server on port 8897: {}", e);
        let window = server_error_handle.get_window("main");
        #[cfg(target_os = "macos")]
        let log_hint = "~/Library/Logs/Knapsack/ks_error.log";
        #[cfg(target_os = "windows")]
        let log_hint = "%APPDATA%\\Knapsack\\logs\\ks_error.log";
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        let log_hint = "~/.config/Knapsack/logs/ks_error.log";
        tauri::api::dialog::blocking::message(
          window.as_ref(),
          "Knapsack couldn't start",
          format!(
            "Knapsack failed to start its internal server on port 8897.\n\n\
             This usually means another instance of Knapsack is already running.\n\n\
             To fix it, open Terminal and run:\n    lsof -ti :8897 | xargs kill -9\n\
             Then reopen Knapsack.\n\n\
             Error: {}\n\
             Log: {}",
            e, log_hint
          ),
        );
        std::process::exit(1);
      }
    }
  });

  // Start the heartbeat background loop
  std::thread::spawn(move || match tokio::runtime::Runtime::new() {
    Ok(runtime) => {
      runtime.block_on(heartbeat::engine::start_heartbeat_loop(
        heartbeat_app_handle,
        heartbeat_is_chatting,
      ));
    }
    Err(e) => {
      eprintln!("Failed to create tokio runtime for heartbeat: {}", e);
    }
  });

  // Start the library curator background loop. Auto-populates the user's
  // Library with People + Project collections from synced data sources.
  std::thread::spawn(|| {
    tokio::runtime::Runtime::new()
      .unwrap()
      .block_on(library_curator::run_curator_forever());
  });

  // Memory monitor: samples our process tree's RSS and reports outliers
  // to Sentry. Required after a Windows tester reported the app sitting
  // at ~590 MB with no per-user telemetry to identify whether the
  // condition is widespread.
  std::thread::spawn(|| {
    tokio::runtime::Runtime::new()
      .unwrap()
      .block_on(utils::memory_monitor::start_memory_monitor_loop());
  });

  info!(
    "setup_handler: app_local_data_dir: {}",
    app_handle
      .path_resolver()
      .app_local_data_dir()
      .unwrap_or(PathBuf::new())
      .to_string_lossy()
  );

  Ok(())
}

struct UUIDState {
  uuid: StdMutex<Option<String>>,
}

struct ProgressState {
  files: Arc<AtomicU16>,
  emails: Arc<AtomicU16>,
}

#[tauri::command]
fn kn_get_or_generate_uuid(state: State<'_, UUIDState>, app: AppHandle) -> String {
  let mut uuid_guard = state.uuid.lock().unwrap();

  if let Some(ref uuid) = *uuid_guard {
    uuid.clone()
  } else {
    // Attempt to load the UUID from Knapsack's data dir
    let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
    let knapsack_data_dir = home_dir.join(".knapsack");
    let uuid_file = knapsack_data_dir.join("uuid.txt");
    let maybe_stored_uuid: Option<String> = uuid_file
      .to_str()
      .and_then(|path| std::fs::read_to_string(path).ok());

    match maybe_stored_uuid {
      Some(uuid) => {
        // If a UUID exists, use it and save to state
        *uuid_guard = Some(uuid.clone());
        uuid
      }
      None => {
        // Generate a new UUID if none is found
        let new_uuid = Uuid::new_v4().to_string();
        // Save the new UUID to persistent storage
        if let Some(_path) = app.path_resolver().app_data_dir() {
          let _ = std::fs::write(uuid_file, &new_uuid);
        }
        *uuid_guard = Some(new_uuid.clone());
        new_uuid
      }
    }
  }
}

#[derive(serde::Serialize, serde::Deserialize)]
struct KSearchIndexingStatusResponse {
  success: bool,
  progress: u16,
}

#[derive(Clone)]
struct RecordingState {
  pub mic_thread: Arc<StdMutex<Option<TokioJoinHandle<()>>>>,
  pub output_thread: Arc<StdMutex<Option<TokioJoinHandle<()>>>>,
  pub is_recording: Arc<AtomicBool>,
  pub thread_id: Arc<StdMutex<Option<u64>>>,
  pub feed_item_id: Arc<StdMutex<Option<u64>>>,
  pub input_filename: Arc<StdMutex<Option<String>>>,
  pub output_filename: Arc<StdMutex<Option<String>>>,
  pub input_file_semaphore: Arc<Semaphore>,
  pub output_file_semaphore: Arc<Semaphore>,
  pub is_paused: Arc<AtomicBool>,
}

impl Default for RecordingState {
  fn default() -> Self {
    RecordingState {
      mic_thread: Arc::new(StdMutex::new(None)),
      output_thread: Arc::new(StdMutex::new(None)),
      is_recording: Arc::new(AtomicBool::new(false)),
      thread_id: Arc::new(StdMutex::new(None)),
      feed_item_id: Arc::new(StdMutex::new(None)),
      input_filename: Arc::new(StdMutex::new(None)),
      output_filename: Arc::new(StdMutex::new(None)),
      input_file_semaphore: Arc::new(Semaphore::new(1)),
      output_file_semaphore: Arc::new(Semaphore::new(1)),
      is_paused: Arc::new(AtomicBool::new(false)),
    }
  }
}

#[tauri::command]
async fn kn_get_search_indexing_status(
  progress_state: State<'_, ProgressState>,
) -> Result<KSearchIndexingStatusResponse, String> {
  let files_progress = &progress_state.files;
  let emails_progress = &progress_state.emails;
  info!(
    "kn_get_search_indexing_status_files:: progress: {}",
    files_progress.load(Ordering::SeqCst)
  );
  info!(
    "kn_get_search_indexing_status_emails:: progress: {}",
    emails_progress.load(Ordering::SeqCst)
  );
  let email_progress_value = emails_progress.load(Ordering::SeqCst);
  if email_progress_value > 0 {
    return Ok(KSearchIndexingStatusResponse {
      success: true,
      progress: (files_progress.load(Ordering::SeqCst) + emails_progress.load(Ordering::SeqCst))
        / 2,
    });
  }
  Ok(KSearchIndexingStatusResponse {
    success: true,
    progress: files_progress.load(Ordering::SeqCst),
  })
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ButtonConfig {
  button_text: String,
  button_handler: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FrontmostAppInfo {
  name: String,
  bundle_id: Option<String>,
  window_title: Option<String>,
}

#[tauri::command]
fn get_frontmost_app_info() -> Result<FrontmostAppInfo, String> {
  #[cfg(target_os = "macos")]
  {
    use std::process::Command;

    let script = r#"
      tell application "System Events"
        set frontApp to first application process whose frontmost is true
        set appName to name of frontApp
        set bundleId to ""
        set windowTitle to ""
        try
          set bundleId to bundle identifier of frontApp
        end try
        try
          set windowTitle to name of front window of frontApp
        end try
        return appName & linefeed & bundleId & linefeed & windowTitle
      end tell
    "#;

    let output = Command::new("osascript")
      .arg("-e")
      .arg(script)
      .output()
      .map_err(|e| format!("Failed to inspect frontmost app: {}", e))?;

    if !output.status.success() {
      return Err(format!(
        "Failed to inspect frontmost app: {}",
        String::from_utf8_lossy(&output.stderr).trim()
      ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut lines = stdout.lines();
    let name = lines.next().unwrap_or_default().trim().to_string();
    let bundle_id = lines
      .next()
      .map(str::trim)
      .filter(|s| !s.is_empty())
      .map(ToString::to_string);
    let window_title = lines
      .next()
      .map(str::trim)
      .filter(|s| !s.is_empty())
      .map(ToString::to_string);

    return Ok(FrontmostAppInfo {
      name,
      bundle_id,
      window_title,
    });
  }

  #[cfg(not(target_os = "macos"))]
  {
    Ok(FrontmostAppInfo {
      name: String::new(),
      bundle_id: None,
      window_title: None,
    })
  }
}

#[tauri::command]
async fn show_notification_window(
  app: tauri::AppHandle,
  event_id: Option<String>,
  button_configs: Vec<ButtonConfig>,
  title: String,
  time: String,
) {
  if let Some(window) = app.get_window("notification") {
    if let Ok(monitor) = window.current_monitor() {
      if let Some(monitor) = monitor {
        let screen_size = monitor.size();
        let scale_factor = monitor.scale_factor();

        // Convert logical notification dimensions to physical pixels
        let physical_notif_width = (NOTIF_WIDTH * scale_factor) as i32;
        let physical_end_offset = (NOTIF_END_X_OFFSET as f64 * scale_factor) as i32;
        let physical_start_offset = (NOTIF_START_X_OFFSET as f64 * scale_factor) as i32;

        let y_position = (NOTIF_Y_OFFSET * scale_factor) as i32;

        // Size the notification window to just fit its content
        window
          .set_size(tauri::Size::Logical(tauri::LogicalSize {
            width: NOTIF_WIDTH,
            height: NOTIF_HEIGHT,
          }))
          .unwrap();

        let start_x = screen_size.width as i32 + physical_start_offset;

        window
          .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: start_x,
            y: y_position,
          }))
          .unwrap();

        window.emit("notification_event_id", json!({"event_id": event_id, "button_configs": button_configs, "title": title, "time": time})).unwrap();

        let final_x = screen_size.width as i32 - physical_notif_width - physical_end_offset;

        for i in 0..=NOTIF_ANIMATION_DURATION {
          let t = i as f32 / NOTIF_ANIMATION_DURATION as f32;

          let ease = if t < 0.5 {
            4.0 * t * t * t
          } else {
            1.0 - (-2.0 * t + 2.0).powi(3) / 2.0
          };

          let current_x = start_x + ((final_x - start_x) as f32 * ease) as i32;

          window
            .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
              x: current_x,
              y: y_position,
            }))
            .unwrap();
          window.show();
          tokio::time::sleep(std::time::Duration::from_millis(NOTIF_FRAME_TIME)).await;
        }

        // On macOS, always-on-top transparent windows are floating panels that
        // don't become the key window on click. Without key status, WKWebView
        // won't forward mouse events to JavaScript, making buttons unclickable.
        window.set_focus().ok();
      }
    }
  }
}

#[tauri::command]
fn close_notification_window(app: tauri::AppHandle) {
  if let Some(window) = app.get_window("notification") {
    window.hide().unwrap();
    window.emit("close-notification", {}).unwrap();
  }
}

#[tauri::command]
async fn start_meeting_recording(app: tauri::AppHandle, event_id: String) {
  if let Some(main_window) = app.get_window("main") {
    main_window
      .emit("start-meeting-recording", event_id)
      .unwrap();
  }
}

#[tauri::command]
fn activate_main_window(window: tauri::Window) {
  if let Some(main_window) = window.app_handle().get_window("main") {
    main_window.unminimize().unwrap();
    main_window.set_focus().unwrap();
  }
}

#[tauri::command]
fn activate_main_window_from_notification(window: tauri::Window) {
  let app = window.app_handle();

  if let Some(main_window) = app.get_window("main") {
    // Determine position and size from the notification window so the main
    // window appears to "expand" from it.
    if let Some(notification_window) = app.get_window("notification") {
      if let Ok(notif_pos) = notification_window.outer_position() {
        // On Windows, use the actual work area so we never overlap the taskbar.
        #[cfg(target_os = "windows")]
        {
          if let Some((_wa_x, wa_y, _wa_w, wa_h)) = windows_work_area() {
            let scale_factor = notification_window
              .current_monitor()
              .ok()
              .flatten()
              .map(|m| m.scale_factor())
              .unwrap_or(1.0);
            // Subtract frame overhead so the outer window fits in the work area
            let frame_overhead_physical = main_window
              .outer_size()
              .ok()
              .and_then(|outer| {
                main_window
                  .inner_size()
                  .ok()
                  .map(|inner| outer.height as i32 - inner.height as i32)
              })
              .unwrap_or(0);
            let usable_h = (wa_h - frame_overhead_physical).max(400);
            let wa_h_logical = usable_h as f64 / scale_factor;

            let _ = main_window.set_size(tauri::Size::Logical(tauri::LogicalSize {
              width: NOTIF_WIDTH,
              height: wa_h_logical,
            }));
            let _ = main_window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
              x: notif_pos.x,
              y: wa_y,
            }));
          }
        }

        #[cfg(not(target_os = "windows"))]
        {
          if let Ok(Some(monitor)) = notification_window.current_monitor() {
            let screen_size = monitor.size();
            let monitor_pos = monitor.position();
            let scale_factor = monitor.scale_factor();

            // macOS: ~25px for the menu bar at the top
            let menu_bar_height: f64 = if cfg!(target_os = "macos") { 25.0 } else { 0.0 };
            let logical_height = screen_size.height as f64 / scale_factor - menu_bar_height;

            let _ = main_window.set_size(tauri::Size::Logical(tauri::LogicalSize {
              width: NOTIF_WIDTH,
              height: logical_height,
            }));

            let y = monitor_pos.y as f64 / scale_factor + menu_bar_height;
            let _ = main_window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
              x: notif_pos.x,
              y: (y * scale_factor) as i32,
            }));
          }
        }
      }
    }

    let _ = main_window.unminimize();
    let _ = main_window.show();
    let _ = main_window.set_focus();
  }
}

/// Send a notification message into the meeting chat via macOS Accessibility
/// API / keyboard simulation. Copies the message to the clipboard, activates
/// the meeting window, opens chat via platform-specific keyboard shortcut,
/// pastes, and sends. Falls back to clipboard-only on non-macOS.
#[tauri::command]
async fn send_meeting_chat_message(platform: String, message: String) -> Result<bool, String> {
  #[cfg(target_os = "macos")]
  {
    use std::process::Command;

    // 1. Copy message to clipboard via pbcopy
    let mut pbcopy = Command::new("pbcopy")
      .stdin(std::process::Stdio::piped())
      .spawn()
      .map_err(|e| format!("Failed to start pbcopy: {}", e))?;
    if let Some(ref mut stdin) = pbcopy.stdin {
      use std::io::Write;
      stdin
        .write_all(message.as_bytes())
        .map_err(|e| format!("Failed to write to pbcopy: {}", e))?;
    }
    pbcopy.wait().map_err(|e| format!("pbcopy failed: {}", e))?;

    // 2. Build the AppleScript to open chat, paste, and send.
    //    Each platform has a different keyboard shortcut to toggle chat.
    let (open_chat_keys, close_chat_keys, target_app) = match platform.as_str() {
      "zoom" => {
        // Zoom: Cmd+Shift+H toggles chat panel
        (
          "key code 4 using {command down, shift down}", // H
          "key code 4 using {command down, shift down}", // toggle off
          r#"tell application "System Events" to set targetApp to name of first application process whose name contains "zoom""#,
        )
      }
      "teams" => {
        // Teams: Cmd+Shift+M toggles chat (newer) or Cmd+2
        (
          "key code 46 using {command down, shift down}", // M
          "key code 46 using {command down, shift down}", // toggle off
          r#"tell application "System Events" to set targetApp to name of first application process whose name contains "Teams""#,
        )
      }
      _ => {
        // Google Meet in browser: Cmd+Shift+C toggles chat
        // We target the frontmost browser
        (
          "key code 8 using {command down, shift down}", // C
          "key code 8 using {command down, shift down}", // toggle off
          r#"tell application "System Events" to set targetApp to name of first application process whose frontmost is true"#,
        )
      }
    };

    let script = format!(
      r#"
      {target_app}
      tell application targetApp to activate
      delay 0.5
      tell application "System Events"
        tell process targetApp
          -- Open chat panel
          {open_chat}
          delay 0.8
          -- Paste from clipboard
          keystroke "v" using command down
          delay 0.3
          -- Press Enter to send
          key code 36
          delay 0.3
          -- Close chat panel
          {close_chat}
        end tell
      end tell
      "#,
      target_app = target_app,
      open_chat = open_chat_keys,
      close_chat = close_chat_keys,
    );

    let output = Command::new("osascript")
      .arg("-e")
      .arg(&script)
      .output()
      .map_err(|e| format!("Failed to run AppleScript: {}", e))?;

    if !output.status.success() {
      let stderr = String::from_utf8_lossy(&output.stderr);
      log::warn!(
        "Meeting chat AppleScript failed: {}. Message is still on clipboard.",
        stderr
      );
      // Return false to indicate auto-paste failed (message is on clipboard as fallback)
      return Ok(false);
    }

    Ok(true)
  }

  #[cfg(not(target_os = "macos"))]
  {
    // On non-macOS, just copy to clipboard and let the user paste manually
    // Use arboard or fall back to platform clipboard commands
    let _ = platform;
    let mut child = std::process::Command::new("xclip")
      .args(&["-selection", "clipboard"])
      .stdin(std::process::Stdio::piped())
      .spawn()
      .or_else(|_| {
        std::process::Command::new("xsel")
          .args(&["--clipboard", "--input"])
          .stdin(std::process::Stdio::piped())
          .spawn()
      })
      .map_err(|e| format!("Failed to copy to clipboard: {}", e))?;
    if let Some(ref mut stdin) = child.stdin {
      use std::io::Write;
      stdin
        .write_all(message.as_bytes())
        .map_err(|e| format!("Failed to write to clipboard: {}", e))?;
    }
    child
      .wait()
      .map_err(|e| format!("Clipboard command failed: {}", e))?;
    Ok(false) // auto-paste not supported, message is on clipboard
  }
}

/// Position the frontmost browser window to fill the screen space to the left
/// of the main Knapsack window. macOS only (uses AppleScript).
#[tauri::command]
fn position_browser_beside_app(app: tauri::AppHandle) {
  #[cfg(target_os = "macos")]
  {
    if let Some(main_window) = app.get_window("main") {
      if let (Ok(main_pos), Ok(Some(monitor))) =
        (main_window.outer_position(), main_window.current_monitor())
      {
        let screen_size = monitor.size();
        let scale_factor = monitor.scale_factor();

        let browser_width = main_pos.x;

        // Only reposition if the main window leaves meaningful space on the left
        // (i.e. the app is in narrow/notification mode, not full-screen).
        let min_browser_width = (200.0 * scale_factor) as i32;
        if browser_width < min_browser_width {
          return;
        }

        let browser_x = 0;
        let browser_y = 0; // top of screen (below menu bar is handled by macOS)
        let browser_height = screen_size.height as i32;

        // Convert physical pixels to macOS points for AppleScript bounds
        let x1 = (browser_x as f64 / scale_factor) as i32;
        let y1 = (browser_y as f64 / scale_factor) as i32;
        let x2 = (browser_width as f64 / scale_factor) as i32;
        let y2 = (browser_height as f64 / scale_factor) as i32;

        let script = format!(
          r#"tell application "System Events"
            set frontApp to name of first application process whose frontmost is true
          end tell
          tell application frontApp
            set bounds of front window to {{{}, {}, {}, {}}}
          end tell"#,
          x1, y1, x2, y2
        );

        std::process::Command::new("osascript")
          .arg("-e")
          .arg(&script)
          .spawn()
          .ok();
      }
    }
  }
}

#[tauri::command]
async fn emit_event(window: tauri::Window, event: String, payload: Value) -> Result<(), String> {
  let main_window = window
    .app_handle()
    .get_window("main")
    .ok_or("Main window not found")?;

  main_window
    .emit(&event, payload)
    .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
async fn kn_read_logs(
  app: AppHandle,
  log_type: String,
  max_lines: Option<usize>,
) -> Result<Vec<String>, String> {
  let log_dir = app
    .path_resolver()
    .app_log_dir()
    .ok_or("Could not resolve log directory")?;

  let log_path = match log_type.as_str() {
    "error" => log_dir.join("ks_error.log"),
    "clawdbot_err" => crate::clawd::service::gateway_stderr_log(),
    "clawdbot_out" => crate::clawd::service::gateway_stdout_log(),
    _ => log_dir.join("ks.log"),
  };

  let content = std::fs::read_to_string(&log_path)
    .map_err(|e| format!("Failed to read log file {}: {}", log_path.display(), e))?;

  let lines: Vec<String> = content.lines().map(|l| l.to_string()).collect();
  let max = max_lines.unwrap_or(500);
  let start = if lines.len() > max {
    lines.len() - max
  } else {
    0
  };
  Ok(lines[start..].to_vec())
}

/// Streaming variant for live log tailing.  Returns only the bytes after
/// `since_offset` (a byte position in the file) plus the new file size so the
/// caller can pass it back on the next poll.  If the file has been rotated
/// (new size < since_offset), we reset and return the full tail instead.
#[tauri::command]
async fn kn_read_logs_since(
  app: AppHandle,
  log_type: String,
  since_offset: u64,
) -> Result<(Vec<String>, u64), String> {
  let log_dir = app
    .path_resolver()
    .app_log_dir()
    .ok_or("Could not resolve log directory")?;

  let log_path = match log_type.as_str() {
    "error" => log_dir.join("ks_error.log"),
    "clawdbot_err" => crate::clawd::service::gateway_stderr_log(),
    "clawdbot_out" => crate::clawd::service::gateway_stdout_log(),
    _ => log_dir.join("ks.log"),
  };

  let metadata =
    std::fs::metadata(&log_path).map_err(|e| format!("Failed to stat log file: {}", e))?;
  let file_size = metadata.len();

  // When since_offset exceeds the file size (first poll uses a large sentinel,
  // or the file was rotated/truncated), start from a reasonable tail so we
  // show recent context without dumping the whole file.
  let read_from = if since_offset > file_size {
    file_size.saturating_sub(32 * 1024) // last 32 KB
  } else {
    since_offset
  };

  if read_from >= file_size {
    return Ok((vec![], file_size));
  }

  use std::io::{Read, Seek, SeekFrom};
  let mut f =
    std::fs::File::open(&log_path).map_err(|e| format!("Failed to open log file: {}", e))?;
  f.seek(SeekFrom::Start(read_from))
    .map_err(|e| format!("Seek failed: {}", e))?;

  let mut buf = String::new();
  f.read_to_string(&mut buf)
    .map_err(|e| format!("Read failed: {}", e))?;

  // If we seeked into the middle of a line, skip to the first newline.
  let content = if read_from > 0 {
    buf.find('\n').map(|i| &buf[i + 1..]).unwrap_or("")
  } else {
    &buf
  };

  let lines: Vec<String> = content.lines().map(|l| l.to_string()).collect();
  Ok((lines, file_size))
}

#[tauri::command]
async fn kn_get_openclaw_version(app: AppHandle) -> Result<String, String> {
  let pkg_path = app
    .path_resolver()
    .resolve_resource("resources/clawdbot/package.json")
    .ok_or("Could not resolve clawdbot package.json")?;
  let content = std::fs::read_to_string(&pkg_path)
    .map_err(|e| format!("Failed to read clawdbot package.json: {}", e))?;
  let json: serde_json::Value = serde_json::from_str(&content)
    .map_err(|e| format!("Failed to parse clawdbot package.json: {}", e))?;
  json["version"]
    .as_str()
    .map(|s| s.to_string())
    .ok_or_else(|| "No version field in clawdbot package.json".to_string())
}

#[tauri::command]
async fn kn_get_log_path(app: AppHandle) -> Result<String, String> {
  let log_dir = app
    .path_resolver()
    .app_log_dir()
    .ok_or("Could not resolve log directory")?;
  Ok(log_dir.to_string_lossy().to_string())
}

/// Return a shell command that launches the bundled OpenClaw channel-configure
/// wizard.  The frontend dispatches this into a PTY session so the user gets
/// the full interactive setup flow.
#[tauri::command]
async fn kn_openclaw_configure_channels_cmd(app: AppHandle) -> Result<String, String> {
  use std::path::PathBuf;

  fn first_existing(paths: &[PathBuf]) -> Option<PathBuf> {
    paths.iter().find(|p| p.exists()).cloned()
  }

  let resolve = |rel: &str| -> PathBuf {
    app
      .path_resolver()
      .resolve_resource(rel)
      .unwrap_or_else(|| PathBuf::from(rel))
  };

  // Resolve node binary (same logic as service.rs)
  let bundled_node = resolve("resources/node/node");
  let node_candidates: Vec<PathBuf> = if cfg!(debug_assertions) {
    vec![
      PathBuf::from("/opt/homebrew/bin/node"),
      PathBuf::from("/usr/local/bin/node"),
      PathBuf::from("/usr/bin/node"),
      bundled_node,
    ]
  } else {
    vec![
      bundled_node,
      PathBuf::from("/opt/homebrew/bin/node"),
      PathBuf::from("/usr/local/bin/node"),
      PathBuf::from("/usr/bin/node"),
    ]
  };

  let node_path =
    first_existing(&node_candidates).ok_or("Node.js not found. Please reinstall Knapsack.")?;

  // Resolve OpenClaw entry
  let entry_path = if cfg!(debug_assertions) {
    let sys = PathBuf::from("/opt/homebrew/lib/node_modules/clawdbot/dist/entry.js");
    let ws = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/clawdbot/dist/entry.js");
    if sys.exists() {
      sys
    } else {
      ws
    }
  } else {
    resolve("resources/clawdbot/dist/entry.js")
  };

  if !entry_path.exists() {
    return Err(format!("OpenClaw not found at {}", entry_path.display()));
  }

  let home_path = app
    .path_resolver()
    .app_data_dir()
    .unwrap_or_else(|| PathBuf::from("."))
    .join("clawdbot");

  // Build a shell command with OPENCLAW_HOME set
  Ok(format!(
    "OPENCLAW_HOME=\"{}\" \"{}\" \"{}\" configure --section channels",
    home_path.display(),
    node_path.display(),
    entry_path.display()
  ))
}

#[tauri::command]
async fn kn_execute_command(command: String, cwd: Option<String>) -> Result<String, String> {
  use std::process::Command;

  let (shell, args) = if cfg!(target_os = "windows") {
    ("cmd".to_string(), vec!["/C".to_string(), command])
  } else {
    // Use a login shell so the user's PATH (node, npm, claude, etc.) is available
    let user_shell = std::env::var("SHELL").unwrap_or_else(|_| "bash".to_string());
    (
      user_shell,
      vec!["-l".to_string(), "-c".to_string(), command],
    )
  };

  let mut cmd = Command::new(&shell);
  cmd.args(&args);

  #[cfg(windows)]
  {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    cmd.creation_flags(CREATE_NO_WINDOW);
  }

  if let Some(dir) = cwd {
    cmd.current_dir(dir);
  } else {
    // Default to user home so cmd.exe doesn't inherit a potentially
    // invalid working directory from the Tauri process on Windows.
    if let Some(home) = dirs::home_dir() {
      cmd.current_dir(home);
    }
  }

  let output = cmd
    .output()
    .map_err(|e| format!("Failed to execute command: {}", e))?;

  let stdout = String::from_utf8_lossy(&output.stdout).to_string();
  let stderr = String::from_utf8_lossy(&output.stderr).to_string();

  // Push command output to global terminal buffer so the chat AI can see it
  for line in stdout.lines() {
    pty::push_terminal_line("app", line);
  }
  for line in stderr.lines() {
    pty::push_terminal_line("app", line);
  }

  if output.status.success() {
    Ok(stdout)
  } else {
    // Include both stdout and stderr so error messages aren't swallowed
    let mut msg = String::new();
    if !stderr.is_empty() {
      msg.push_str(&stderr);
    }
    if !stdout.is_empty() {
      if !msg.is_empty() {
        msg.push('\n');
      }
      msg.push_str(&stdout);
    }
    if msg.is_empty() {
      msg = format!("Command failed with exit code: {}", output.status);
    }
    Err(msg)
  }
}

// ── Streaming process support (for long-running commands like Claude Code) ──

struct StreamingProcessState {
  pids: Arc<StdMutex<std::collections::HashMap<String, u32>>>,
}

#[tauri::command]
async fn kn_spawn_streaming_command(
  app: AppHandle,
  command: String,
  cwd: Option<String>,
  session_id: String,
  state: State<'_, StreamingProcessState>,
) -> Result<String, String> {
  use std::io::{BufRead, BufReader};
  use std::process::{Command, Stdio};

  let process_id = Uuid::new_v4().to_string();

  let (shell, args) = if cfg!(target_os = "windows") {
    ("cmd".to_string(), vec!["/C".to_string(), command])
  } else {
    let user_shell = std::env::var("SHELL").unwrap_or_else(|_| "bash".to_string());
    (
      user_shell,
      vec!["-l".to_string(), "-c".to_string(), command],
    )
  };

  let mut cmd = Command::new(&shell);
  cmd
    .args(&args)
    .stdout(Stdio::piped())
    .stderr(Stdio::piped());

  // Make the child its own process group so we can kill it + children without
  // accidentally terminating the Knapsack app.
  #[cfg(unix)]
  {
    use std::os::unix::process::CommandExt;
    cmd.process_group(0);
  }

  #[cfg(windows)]
  {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    cmd.creation_flags(CREATE_NO_WINDOW);
  }

  if let Some(ref dir) = cwd {
    cmd.current_dir(dir);
  }

  let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn: {}", e))?;
  let child_pid = child.id();

  // Store PID so it can be killed later
  state
    .pids
    .lock()
    .unwrap()
    .insert(process_id.clone(), child_pid);

  let stdout = child.stdout.take();
  let stderr = child.stderr.take();

  // Background thread: stream stdout line-by-line via Tauri events
  let app1 = app.clone();
  let sid1 = session_id.clone();
  let pid1 = process_id.clone();
  if let Some(stdout) = stdout {
    std::thread::spawn(move || {
      let reader = BufReader::new(stdout);
      for line in reader.lines().flatten() {
        let _ = app1.emit_all(
          "streaming-stdout",
          json!({
              "processId": pid1,
              "sessionId": sid1,
              "text": line,
          }),
        );
      }
    });
  }

  // Background thread: stream stderr line-by-line via Tauri events
  let app2 = app.clone();
  let sid2 = session_id.clone();
  let pid2 = process_id.clone();
  if let Some(stderr) = stderr {
    std::thread::spawn(move || {
      let reader = BufReader::new(stderr);
      for line in reader.lines().flatten() {
        let _ = app2.emit_all(
          "streaming-stderr",
          json!({
              "processId": pid2,
              "sessionId": sid2,
              "text": line,
          }),
        );
      }
    });
  }

  // Background thread: wait for exit, emit exit event, clean up PID map
  let app3 = app.clone();
  let sid3 = session_id.clone();
  let pid3 = process_id.clone();
  let pids_ref = state.pids.clone();
  std::thread::spawn(move || {
    let status = child.wait();
    let exit_code = status.map(|s| s.code().unwrap_or(-1)).unwrap_or(-1);
    let _ = app3.emit_all(
      "streaming-exit",
      json!({
          "processId": pid3,
          "sessionId": sid3,
          "exitCode": exit_code,
      }),
    );
    pids_ref.lock().unwrap().remove(&pid3);
  });

  Ok(process_id)
}

#[tauri::command]
async fn kn_kill_streaming_process(
  process_id: String,
  state: State<'_, StreamingProcessState>,
) -> Result<(), String> {
  let pids = state.pids.lock().unwrap();
  if let Some(&pid) = pids.get(&process_id) {
    #[cfg(unix)]
    {
      // Send SIGTERM to the process group to also kill child processes
      unsafe {
        libc::kill(-(pid as i32), libc::SIGTERM);
      }
    }
    #[cfg(windows)]
    {
      use std::os::windows::process::CommandExt;
      use std::process::Command;
      const CREATE_NO_WINDOW: u32 = 0x08000000;
      Command::new("taskkill")
        .args(&["/PID", &pid.to_string(), "/T", "/F"])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .ok();
    }
    Ok(())
  } else {
    Err("Process not found".to_string())
  }
}

fn create_data_dir() {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let data_dir = home_dir.join(KNAPSACK_DATA_DIR);
  let transcripts_dir = data_dir.join(TRANSCRIPTS_DIR);

  create_dir_all(data_dir).expect("Failed to create .knapsack directory");
  create_dir_all(transcripts_dir).expect("Failed to create transcripts directory");
}

// make the db path OS agnostic
fn create_db_env_variable() {
  let home_dir = dirs::home_dir().expect("Could not determine the home directory");
  let db_dir = home_dir.join(KNAPSACK_DB_FILENAME);
  let db_path = db_dir.as_path();
  let db_path_str = db_path.to_str().unwrap();

  env::set_var("DATABASE_URL", db_path_str);
}

// ── System tray menu bar ──

fn build_default_tray_menu(app_version: &str) -> SystemTrayMenu {
  let open_knapsack = CustomMenuItem::new("open_knapsack", "Open Knapsack");
  let quick_note = CustomMenuItem::new("quick_note", "Quick Note");
  let settings = CustomMenuItem::new("settings", "Settings");
  let version = CustomMenuItem::new("version", format!("Knapsack v{}", app_version)).disabled();
  let check_updates = CustomMenuItem::new("check_updates", "Check for updates");
  let quit = CustomMenuItem::new("quit", "Quit");

  SystemTrayMenu::new()
    .add_item(open_knapsack)
    .add_item(quick_note)
    .add_item(settings)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(version)
    .add_item(check_updates)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(quit)
}

fn handle_tray_menu_click(app: &AppHandle, id: &str) {
  match id {
    "open_knapsack" | "show" => {
      if let Some(window) = app.get_window("main") {
        window.show().unwrap();
        window.set_focus().unwrap();
      }
    }
    "quick_note" => {
      if let Some(window) = app.get_window("main") {
        window.show().unwrap();
        window.set_focus().unwrap();
        let _ = window.emit("create_quick_note", {});
      }
    }
    "settings" => {
      if let Some(window) = app.get_window("main") {
        window.show().unwrap();
        window.set_focus().unwrap();
        let _ = window.emit("open_settings", {});
      }
    }
    "check_updates" => {
      if let Some(window) = app.get_window("main") {
        window.show().unwrap();
        window.set_focus().unwrap();
      }
    }
    "quit" => {
      clawd::service::cleanup_gateway_on_exit();
      app.exit(0);
    }
    _ => {
      if id.starts_with("meeting_") {
        if let Some(window) = app.get_window("main") {
          window.show().unwrap();
          window.set_focus().unwrap();
          let _ = window.emit("tray_meeting_click", id);
        }
      }
    }
  }
}

#[derive(Debug, Deserialize)]
struct TrayMeetingItem {
  title: String,
  time: String,
  #[serde(default)]
  is_now: bool,
}

#[derive(Debug, Deserialize)]
struct TrayMeetingGroup {
  label: String,
  meetings: Vec<TrayMeetingItem>,
}

#[tauri::command]
fn update_tray_menu(app: AppHandle, groups: Vec<TrayMeetingGroup>) {
  let mut menu = SystemTrayMenu::new();

  let mut meeting_index = 0;
  for group in &groups {
    let header = CustomMenuItem::new(format!("header_{}", group.label), &group.label).disabled();
    menu = menu.add_item(header);

    for meeting in &group.meetings {
      let label = format!("{}\n{}", meeting.title, meeting.time);
      let item = CustomMenuItem::new(format!("meeting_{}", meeting_index), label);
      menu = menu.add_item(item);
      meeting_index += 1;
    }
  }

  if meeting_index > 0 {
    menu = menu.add_native_item(SystemTrayMenuItem::Separator);
  }

  let open_knapsack = CustomMenuItem::new("open_knapsack", "Open Knapsack");
  let quick_note = CustomMenuItem::new("quick_note", "Quick Note");
  let settings = CustomMenuItem::new("settings", "Settings");
  let version = CustomMenuItem::new(
    "version",
    format!("Knapsack v{}", app.package_info().version),
  )
  .disabled();
  let check_updates = CustomMenuItem::new("check_updates", "Check for updates");
  let quit = CustomMenuItem::new("quit", "Quit");

  menu = menu
    .add_item(open_knapsack)
    .add_item(quick_note)
    .add_item(settings)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(version)
    .add_item(check_updates)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(quit);

  let _ = app.tray_handle().set_menu(menu);
}

#[tauri::command]
fn update_tray_title(app: AppHandle, title: String) {
  #[cfg(target_os = "macos")]
  {
    let _ = app.tray_handle().set_title(&title);
  }
  #[cfg(not(target_os = "macos"))]
  {
    let _ = app.tray_handle().set_tooltip(&title);
  }
}

#[tokio::main]
async fn main() {
  // Hidden entrypoint: OpenClaw spawns this same binary as an MCP-over-stdio
  // subprocess (see `ensure_knapsack_snowflake_mcp_server` in
  // clawd/service.rs, which points `mcp.servers.snowflake.command` at
  // `current_exe()`). Intercept before any Tauri/Sentry/tray setup — this
  // invocation does nothing else with the process.
  if std::env::args().any(|arg| arg == "--internal-mcp-snowflake") {
    clawd::snowflake_mcp::run_stdio_server().await;
    std::process::exit(0);
  }

  create_data_dir();
  create_db_env_variable();

  let maybe_sentry_dsn: Option<&'static str> = option_env!("SENTRY_DSN");
  let mut _guard = match maybe_sentry_dsn {
    Some(sentry_dsn) => Some(sentry::init((
      sentry_dsn,
      sentry::ClientOptions {
        release: sentry::release_name!(),
        ..Default::default()
      },
    ))),
    None => None,
  };

  // Tag every Rust Sentry event as coming from the desktop app.
  sentry::configure_scope(|scope| {
    scope.set_tag("platform", "desktop");
    scope.set_tag("app", "knapsack_desktop");
  });

  // Wrap sentry's panic hook so we can attach recent logs + a memory snapshot
  // to the scope before the event is captured and flushed.
  crash_reporter::install_panic_hook();

  // log4rs::init_file("log4rs.yaml", Default::default()).unwrap();
  // setup_tracing();

  // TODO: enable when we start offering embeddings/RAG.
  // server::qdrant::qdrant_server(8897).await

  let knapsack_search_indexing_progress = Arc::new(AtomicU16::new(0));
  let knapsack_gmail_indexing_progress = Arc::new(AtomicU16::new(0));
  let is_chatting = Arc::new(Mutex::new(AtomicBool::new(false)));
  let semantic_service = Arc::new(Mutex::new(None));
  let connections_data = Arc::new(Mutex::new(ConnectionsData::new()));
  let progress_state = ProgressState {
    files: knapsack_search_indexing_progress.clone(),
    emails: knapsack_gmail_indexing_progress.clone(),
  };
  let recording_state = RecordingState::default();
  let recording_is_active = Arc::clone(&recording_state.is_recording);

  let context = tauri::generate_context!();

  let mut builder = tauri::Builder::default();

  builder = builder
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(tauri_plugin_autostart::init(
      MacosLauncher::LaunchAgent,
      None,
    ))
    .on_window_event(|event| match event.event() {
      WindowEvent::FileDrop(FileDropEvent::Dropped(paths)) => {
        for path in paths {
          let docs = local_fs::get_docs_for_finra_compliance(&path);
          event.window().emit_all("finra_docs", docs).unwrap();
        }
      }
      _ => {}
    })
    .manage(semantic_service.clone())
    .manage(recording_state)
    .setup(move |app| {
      #[cfg(not(debug_assertions))]
      {
        let mut missing = vec![];
        let mut assert_asset = |page, label| {
          if validate_bundled_ui_asset(app, page, label).is_none() {
            missing.push(format!("{page} ({label})"));
          }
        };
        assert_asset("index.html", "main window");
        assert_asset("notification.html", "notification window");
        assert_asset("overlay.html", "overlay window");
        assert_asset("recording-indicator.html", "recording indicator window");

        if !missing.is_empty() {
          return Err(Box::new(tauri::Error::AssetNotFound(format!(
            "Bundled UI assets missing (packaging issue): {}. Reinstall from the latest release and report this crash report.",
            missing.join(", ")
          ))));
        }
      }

      // Create window with specified logical size
      let mut window_builder = WindowBuilder::new(
        app,
        "main".to_string(),
        Default::default(),
      )
      .title("")
      .fullscreen(false)
      .maximizable(true)
      //.maximized(true)
      .resizable(true)
      .decorations(true)
      .visible(true)
      .inner_size(1440.0, 960.0); // logical size (tauri handles scale factoring internally)

      #[cfg(target_os = "macos")]
      {
        window_builder = window_builder.title_bar_style(tauri::TitleBarStyle::Overlay);
      }

      let main_window = window_builder.build().map_err(|e| {
        log::error!("Failed to create main window: {:?}", e);
        #[cfg(target_os = "windows")]
        {
          if format!("{:?}", e).contains("0x80070057") || format!("{:?}", e).contains("WebView2") {
            let setup_error: Box<dyn std::error::Error> = Box::new(std::io::Error::new(
              std::io::ErrorKind::Other,
              "Failed to initialize WebView2. Please ensure Microsoft Edge WebView2 Runtime is installed. Download it from https://go.microsoft.com/fwlink/p/?LinkId=2124703",
            ));
            return tauri::Error::Setup(setup_error.into());
          }
        }
        e
      })?;

      // Position the window: right-aligned, filling the usable screen height.
      // On Windows we query the actual work area (excludes taskbar regardless
      // of its position/size).  On macOS we subtract the menu bar height.
      #[cfg(target_os = "windows")]
      {
        if let Some((wa_x, wa_y, wa_w, wa_h)) = windows_work_area() {
          let scale_factor = main_window.current_monitor()
            .ok().flatten()
            .map(|m| m.scale_factor())
            .unwrap_or(1.0);

          // Measure the window frame overhead (title bar + borders).
          // set_size / inner_size sets the *client* area, so the outer
          // window extends beyond by the frame dimensions.
          let frame_overhead_physical = main_window.outer_size()
            .ok()
            .and_then(|outer| main_window.inner_size().ok().map(|inner| {
              outer.height as i32 - inner.height as i32
            }))
            .unwrap_or(0);

          let wa_w_logical = wa_w as f64 / scale_factor;
          // Subtract the frame overhead so the *outer* window fits inside the work area
          let usable_h = (wa_h - frame_overhead_physical).max(400);
          let wa_h_logical = usable_h as f64 / scale_factor;
          let window_width = 1440.0_f64.min(wa_w_logical);

          main_window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
              width: window_width,
              height: wa_h_logical,
            }))
            .unwrap();

          // Right-align within the work area
          let x = wa_x as f64 + (wa_w as f64 - window_width * scale_factor);
          main_window
            .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
              x: x as i32,
              y: wa_y,
            }))
            .unwrap();
        } else {
          main_window.center()?;
        }
      }

      #[cfg(not(target_os = "windows"))]
      {
        if let Ok(Some(monitor)) = main_window.current_monitor() {
          let screen_size = monitor.size();
          let monitor_pos = monitor.position();
          let scale_factor = monitor.scale_factor();
          let screen_width_logical = screen_size.width as f64 / scale_factor;
          let screen_height_logical = screen_size.height as f64 / scale_factor;

          // macOS: ~25px for the menu bar at the top
          let menu_bar_height: f64 = if cfg!(target_os = "macos") { 25.0 } else { 0.0 };
          let usable_height = screen_height_logical - menu_bar_height;
          let window_width = 1440.0_f64.min(screen_width_logical);

          main_window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
              width: window_width,
              height: usable_height,
            }))
            .unwrap();

          let monitor_x_logical = monitor_pos.x as f64 / scale_factor;
          let x = (monitor_x_logical + screen_width_logical - window_width).max(0.0);
          let y = monitor_pos.y as f64 / scale_factor + menu_bar_height;

          main_window
            .set_position(tauri::Position::Logical(tauri::LogicalPosition { x, y }))
            .unwrap();
        } else {
          main_window.center()?;
        }
      }

      // NOTE: Do NOT call set_decorations(false) on macOS — it disables
      // the native window chrome that Tauri needs for data-tauri-drag-region
      // to work.  TitleBarStyle::Overlay (set above) already hides the
      // visible titlebar while keeping the drag machinery intact.
      main_window.set_resizable(true);
      main_window.set_maximizable(true);

      #[cfg(any(windows, target_os = "macos"))]
      let _shadow_res = match set_shadow(&main_window, true) {
        Ok(_) => log::info!("Window shadow enabled successfully"),
        Err(e) => log::error!("Failed to set window shadow: {}", e),
      };

      // notification window
      let mut notification_builder = WindowBuilder::new(
        app,
        "notification",
        WindowUrl::App("notification.html".into()),
      )
      .title("Notification")
      .inner_size(NOTIF_WIDTH, NOTIF_HEIGHT)
      .resizable(false)
      .decorations(false)
      .always_on_top(true)
      .transparent(true)
      .visible(false);

      // On macOS, transparent always-on-top windows are floating NSPanels.
      // Without accept_first_mouse the first click only focuses the panel;
      // the user would have to click a second time for JS to see the event.
      #[cfg(target_os = "macos")]
      {
        notification_builder = notification_builder.accept_first_mouse(true);
      }

      let notification_window = notification_builder.build()?;
      app.manage(Arc::new(Mutex::new(notification_window)));

      // overlay (Quick Chat Panel) window
      let mut overlay_builder = WindowBuilder::new(
        app,
        "overlay",
        WindowUrl::App("overlay.html".into()),
      )
      .title("Overlay")
      .inner_size(680.0, 72.0)
      .resizable(false)
      .decorations(false)
      .always_on_top(true)
      .transparent(true)
      .visible(false);

      #[cfg(target_os = "macos")]
      {
        overlay_builder = overlay_builder.accept_first_mouse(true);
      }

      let overlay_window = overlay_builder.build()?;

      // Center the overlay horizontally, position ~1/4 from the top of the screen
      if let Ok(Some(monitor)) = overlay_window.current_monitor() {
        let screen_size = monitor.size();
        let scale_factor = monitor.scale_factor();
        let screen_width_logical = screen_size.width as f64 / scale_factor;
        let screen_height_logical = screen_size.height as f64 / scale_factor;
        let overlay_width = 680.0_f64;
        let overlay_x = ((screen_width_logical - overlay_width) / 2.0) * scale_factor;
        let overlay_y = (screen_height_logical * 0.25) * scale_factor;
        overlay_window
          .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: overlay_x as i32,
            y: overlay_y as i32,
          }))
          .unwrap();
      }

      // Recording indicator floating pill window
      let mut rec_indicator_builder = WindowBuilder::new(
        app,
        "recording-indicator",
        WindowUrl::App("recording-indicator.html".into()),
      )
      .title("Recording")
      .inner_size(180.0, 48.0)
      .resizable(false)
      .decorations(false)
      .always_on_top(true)
      .transparent(true)
      .visible(false);

      #[cfg(target_os = "macos")]
      {
        rec_indicator_builder = rec_indicator_builder.accept_first_mouse(true);
      }

      let rec_indicator_window = rec_indicator_builder.build()?;

      // Position recording indicator at bottom-right of screen
      if let Ok(Some(monitor)) = rec_indicator_window.current_monitor() {
        let screen_size = monitor.size();
        let scale_factor = monitor.scale_factor();
        let screen_width_logical = screen_size.width as f64 / scale_factor;
        let screen_height_logical = screen_size.height as f64 / scale_factor;
        let indicator_width = 180.0_f64;
        let indicator_height = 48.0_f64;
        let indicator_x = (screen_width_logical - indicator_width - 24.0) * scale_factor;
        let indicator_y = ((screen_height_logical - indicator_height) / 2.0) * scale_factor;
        rec_indicator_window
          .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: indicator_x as i32,
            y: indicator_y as i32,
          }))
          .unwrap();
      }

      // EMBEDDER_PATH.set(
      //   app
      //     .path_resolver()
      //     .resolve_resource("resources/embedder.gguf")
      //     .expect("failed to resolve resource"),
      // );
      setup_database();
      // setup_vector_database();
      // setup_embedding_service(
      //   is_chatting.clone(),
      //   semantic_service.clone(),
      //   app,
      //   connections_data.clone(),
      // );

      setup_handler(
        app,
        // llm_path,
        knapsack_gmail_indexing_progress,
        semantic_service,
        is_chatting.clone(),
        connections_data,
      );
      setup_logger(app).expect("Failed to setup logger");

      audio::mic_monitor::start_mic_monitor(app.handle(), recording_is_active);

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      local_fs::kn_open_file_as_app,
      local_fs::kn_trigger_file_read_permissions,
      kn_get_or_generate_uuid,
      kn_get_search_indexing_status,
      start_oauth,
      show_notification_window,
      get_frontmost_app_info,
      close_notification_window,
      start_meeting_recording,
      activate_main_window,
      activate_main_window_from_notification,
      position_browser_beside_app,
      send_meeting_chat_message,
      emit_event,
      open_screen_recording_settings,
      open_microphone_settings,
      check_audio_permissions,
      reset_audio_permissions,
      diagnose_audio_permissions,
      audio::audio::emit_stop_events,
      spotlight::kn_init_app,
      spotlight::show_overlay_window,
      spotlight::hide_overlay_window,
      spotlight::toggle_overlay_window,
      spotlight::show_recording_indicator,
      spotlight::hide_recording_indicator,
      update_tray_menu,
      update_tray_title,
      kn_read_logs,
      kn_read_logs_since,
      kn_get_log_path,
      kn_get_openclaw_version,
      kn_set_keep_awake,
      kn_prepare_updater_temp_dir,
      kn_send_composed_email,
      kn_execute_command,
      kn_openclaw_configure_channels_cmd,
      kn_spawn_streaming_command,
      kn_kill_streaming_process,
      pty::kn_pty_spawn,
      pty::kn_pty_write,
      pty::kn_pty_resize,
      pty::kn_pty_kill,
      pty::kn_pty_read_output,
      privileged_worker::kn_execute_privileged_job,
      clawd::gbrain::kn_brain_list,
      clawd::gbrain::kn_brain_read_page,
      clawd::gbrain::kn_brain_search,
      clawd::gbrain::kn_brain_write_page,
      clawd::gbrain::kn_brain_default_root
    ])
    .manage(UUIDState {
      uuid: StdMutex::new(None),
    }) // Initialize state with no UUID
    .manage(progress_state)
    .manage(StreamingProcessState {
      pids: Arc::new(StdMutex::new(std::collections::HashMap::new())),
    })
    .manage(pty::PtySessionState {
      sessions: Arc::new(StdMutex::new(std::collections::HashMap::new())),
    })
    .on_window_event(|event| match event.event() {
      tauri::WindowEvent::Focused(true) => {
        event
          .window()
          .emit("custom-focus", "EVENT_FOCUS_WINDOW_REFRESHED")
          .unwrap();
      }
      tauri::WindowEvent::CloseRequested { api, .. } => {
        #[cfg(target_os = "windows")]
        {
          let window = event.window();
          window.hide().unwrap();
          api.prevent_close();
        }

        #[cfg(target_os = "macos")]
        {
          tauri::AppHandle::hide(&event.window().app_handle()).unwrap();
          api.prevent_close();
        }

        #[cfg(target_os = "linux")]
        {
          let window = event.window();
          window.hide().unwrap();
          api.prevent_close();
        }
      }
      _ => {}
    });

  // System tray with meetings menu (all platforms)
  {
    let tray_menu = build_default_tray_menu(&context.package_info().version.to_string());
    let system_tray = SystemTray::new().with_menu(tray_menu);

    builder = builder
      .system_tray(system_tray)
      .on_system_tray_event(|app, event| match event {
        SystemTrayEvent::LeftClick {
          position: _,
          size: _,
          ..
        } => {
          if let Some(window) = app.get_window("main") {
            window.show().unwrap();
            window.set_focus().unwrap();
          }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
          handle_tray_menu_click(app, &id);
        }
        _ => {}
      });
  }

  let run_result = builder.run(context);
  clawd::service::cleanup_gateway_on_exit();
  if let Err(err) = run_result {
    log::error!("Knapsack failed to start: {err}");
    eprintln!("Startup failed. This is usually a packaging issue with the desktop bundle.");
    eprintln!("Please reinstall the app from the latest official release.");
    process::exit(1);
  }
}
