// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{utils::config::AppUrl, window::WindowBuilder, WindowUrl};

#[macro_use]
extern crate lazy_static;

extern crate derive_more;
extern crate dirs;
extern crate qdrant_client;
extern crate serde;
extern crate tokio;

mod api;
mod audio;
mod automations;
mod clawd;
mod config;
mod connections;
mod constants;
mod db;
mod error;
mod file_upload;
mod heartbeat;
mod llm;
mod local_fs;
mod memory;
mod pty;
mod search;
mod server;
mod spotlight;
mod transcribe;
mod user;
mod utils;
mod workspaces;
mod mcp;

use connections::api::ConnectionsData;
use log::info;
use memory::semantic::start_embed_service;
use memory::semantic::SemanticService;
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
  AppHandle, CustomMenuItem, FileDropEvent, Manager, State, SystemTray, SystemTrayEvent,
  SystemTrayMenu, WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;
use tokio::sync::Mutex;
use uuid::Uuid;
use window_shadows::set_shadow;

use crate::audio::microphone::open_microphone_settings;
use crate::audio::permission::{open_screen_recording_settings, check_audio_permissions};
use crate::connections::microsoft::auth::start_oauth;
use crate::db::db::{start_database, KNAPSACK_DB_FILENAME};
use crate::utils::log::setup_logger;

use serde_json::json;
use serde_json::Value;
use tokio::sync::Semaphore;

#[cfg(feature = "profiling")]
use console_subscriber;

// static EMBEDDER_PATH: OnceCell<PathBuf> = OnceCell::new();

pub const KNAPSACK_DATA_DIR: &str = ".knapsack";
pub const TRANSCRIPTS_DIR: &str = "transcripts";

const NOTIF_HEIGHT: f64 = 180.0;
const NOTIF_WIDTH: f64 = 720.0;
const NOTIF_Y_OFFSET: f64 = 50.0; // Push below macOS menu bar / notch
const NOTIF_START_X_OFFSET: i32 = 500;
const NOTIF_END_X_OFFSET: i32 = 20;
const NOTIF_ANIMATION_DURATION: u32 = 90;
const NOTIF_FRAME_TIME: u64 = 8;

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

  // Clone is_chatting for the heartbeat loop (before it's moved into the server thread)
  let heartbeat_is_chatting = is_chatting.clone();
  let heartbeat_app_handle = app.handle();

  // Start the server
  let _handle = std::thread::spawn(|| {
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
      Err(_) => {
        info!("Error starting server on port 8897");
        std::process::exit(1);
      }
    }
  });

  // Start the heartbeat background loop
  std::thread::spawn(move || {
    tokio::runtime::Runtime::new()
      .unwrap()
      .block_on(heartbeat::engine::start_heartbeat_loop(
        heartbeat_app_handle,
        heartbeat_is_chatting,
      ));
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
      if let (Ok(notif_pos), Ok(Some(monitor))) = (
        notification_window.outer_position(),
        notification_window.current_monitor(),
      ) {
        let screen_size = monitor.size();
        let scale_factor = monitor.scale_factor();

        // Use the same width as the notification and full screen height
        let logical_height = screen_size.height as f64 / scale_factor;

        let _ = main_window.set_size(tauri::Size::Logical(tauri::LogicalSize {
          width: NOTIF_WIDTH,
          height: logical_height,
        }));

        // Align horizontally with the notification, pin to top of screen
        let _ = main_window.set_position(tauri::Position::Physical(
          tauri::PhysicalPosition {
            x: notif_pos.x,
            y: 0,
          },
        ));
      }
    }

    let _ = main_window.unminimize();
    let _ = main_window.show();
    let _ = main_window.set_focus();
  }
}

/// Position the frontmost browser window to fill the screen space to the left
/// of the main Knapsack window. macOS only (uses AppleScript).
#[tauri::command]
fn position_browser_beside_app(app: tauri::AppHandle) {
  #[cfg(target_os = "macos")]
  {
    if let Some(main_window) = app.get_window("main") {
      if let (Ok(main_pos), Ok(Some(monitor))) = (
        main_window.outer_position(),
        main_window.current_monitor(),
      ) {
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
async fn kn_read_logs(app: AppHandle, log_type: String, max_lines: Option<usize>) -> Result<Vec<String>, String> {
    let log_dir = app
        .path_resolver()
        .app_log_dir()
        .ok_or("Could not resolve log directory")?;

    let filename = match log_type.as_str() {
        "error" => "ks_error.log",
        _ => "ks.log",
    };

    let log_path = log_dir.join(filename);
    let content = std::fs::read_to_string(&log_path)
        .map_err(|e| format!("Failed to read log file: {}", e))?;

    let lines: Vec<String> = content.lines().map(|l| l.to_string()).collect();
    let max = max_lines.unwrap_or(500);
    let start = if lines.len() > max { lines.len() - max } else { 0 };
    Ok(lines[start..].to_vec())
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
        app.path_resolver()
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

    let node_path = first_existing(&node_candidates)
        .ok_or("Node.js not found. Please reinstall Knapsack.")?;

    // Resolve OpenClaw entry
    let entry_path = if cfg!(debug_assertions) {
        let sys = PathBuf::from("/opt/homebrew/lib/node_modules/clawdbot/dist/entry.js");
        let ws = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("resources/clawdbot/dist/entry.js");
        if sys.exists() { sys } else { ws }
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
        (user_shell, vec!["-l".to_string(), "-c".to_string(), command])
    };

    let mut cmd = Command::new(&shell);
    cmd.args(&args);

    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }

    let output = cmd.output().map_err(|e| format!("Failed to execute command: {}", e))?;

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
            if !msg.is_empty() { msg.push('\n'); }
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
        (user_shell, vec!["-l".to_string(), "-c".to_string(), command])
    };

    let mut cmd = Command::new(&shell);
    cmd.args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    // Make the child its own process group so we can kill it + children without
    // accidentally terminating the Knapsack app.
    #[cfg(unix)]
    {
        use std::os::unix::process::CommandExt;
        cmd.process_group(0);
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
            use std::process::Command;
            Command::new("taskkill")
                .args(&["/PID", &pid.to_string(), "/T", "/F"])
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

#[tokio::main]
async fn main() {
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

  let mut context = tauri::generate_context!();
  let url = format!("http://localhost:1420").parse().unwrap();
  let window_url = WindowUrl::External(url);
  // rewrite the config so the IPC is enabled on this URL
  context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());

  let mut builder = tauri::Builder::default();

  // Only load the localhost plugin in production builds.
  // In dev mode, Vite's dev server runs on port 1420 (configured in vite.config.ts).
  // Loading the plugin in dev steals port 1420 from Vite, causing a white screen.
  #[cfg(not(dev))]
  {
    builder = builder.plugin(tauri_plugin_localhost::Builder::new(1420).build());
  }

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
      // Create window with specified logical size
      let mut window_builder = WindowBuilder::new(
        app,
        "main".to_string(),
        if cfg!(dev) {
          Default::default()
        } else {
          window_url.clone()
        },
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

      let main_window = window_builder.build()?;

      // Position the window like Granola: right-aligned, below the menu bar,
      // filling the usable screen height.  This avoids the window opening
      // behind the macOS menu bar (y=0) where the drag region and chat input
      // are inaccessible.
      if let Ok(Some(monitor)) = main_window.current_monitor() {
        let screen_size = monitor.size();
        let monitor_pos = monitor.position();
        let scale_factor = monitor.scale_factor();
        let screen_width_logical = screen_size.width as f64 / scale_factor;
        let screen_height_logical = screen_size.height as f64 / scale_factor;

        // Reserve space for the macOS menu bar (~25px) and a small bottom
        // margin so the window feels grounded rather than flush.
        let menu_bar_height: f64 = if cfg!(target_os = "macos") { 25.0 } else { 0.0 };
        let bottom_margin: f64 = 0.0;
        let usable_height = screen_height_logical - menu_bar_height - bottom_margin;

        // Cap width so the window doesn't exceed the screen
        let window_width = 1440.0_f64.min(screen_width_logical);

        main_window
          .set_size(tauri::Size::Logical(tauri::LogicalSize {
            width: window_width,
            height: usable_height,
          }))
          .unwrap();

        // Right-align: x = screen_right_edge - window_width
        let monitor_x_logical = monitor_pos.x as f64 / scale_factor;
        let x = (monitor_x_logical + screen_width_logical - window_width).max(0.0);
        let y = monitor_pos.y as f64 / scale_factor + menu_bar_height;

        main_window
          .set_position(tauri::Position::Logical(tauri::LogicalPosition { x, y }))
          .unwrap();
      } else {
        // Fallback: just center if we can't detect the monitor
        main_window.center()?;
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

      let llm_path = app
        .path_resolver()
        .resolve_resource("resources/llm.gguf")
        .expect("failed to resolve resource");

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

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      local_fs::kn_open_file_as_app,
      local_fs::kn_trigger_file_read_permissions,
      kn_get_or_generate_uuid,
      kn_get_search_indexing_status,
      start_oauth,
      show_notification_window,
      close_notification_window,
      start_meeting_recording,
      activate_main_window,
      activate_main_window_from_notification,
      position_browser_beside_app,
      emit_event,
      open_screen_recording_settings,
      open_microphone_settings,
      check_audio_permissions,
      audio::audio::emit_stop_events,
      spotlight::kn_init_app,
      spotlight::show_overlay_window,
      spotlight::hide_overlay_window,
      spotlight::toggle_overlay_window,
      kn_read_logs,
      kn_get_log_path,
      kn_execute_command,
      kn_openclaw_configure_channels_cmd,
      kn_spawn_streaming_command,
      kn_kill_streaming_process,
      pty::kn_pty_spawn,
      pty::kn_pty_write,
      pty::kn_pty_resize,
      pty::kn_pty_kill,
      pty::kn_pty_read_output
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

  #[cfg(any(target_os = "windows", target_os = "linux"))]
  {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");

    let tray_menu = SystemTrayMenu::new().add_item(show).add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);
    builder = builder
      .system_tray(system_tray)
      .on_system_tray_event(|app, event| match event {
        SystemTrayEvent::LeftClick {
          position: _,
          size: _,
          ..
        } => {
          let window = app.get_window("main").unwrap();
          window.show().unwrap();
          window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          "show" => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
          }
          _ => {}
        },
        _ => {}
      });
  }

  builder
    .run(context)
    .expect("error while running tauri application");
}
