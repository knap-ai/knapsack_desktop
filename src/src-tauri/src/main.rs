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
mod llm;
mod local_fs;
mod memory;
mod search;
mod server;
mod spotlight;
mod transcribe;
mod user;
mod utils;

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
use crate::audio::permission::open_screen_recording_settings;
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

const NOTIF_HEIGHT: f64 = 64.0;
const NOTIF_WIDTH: f64 = 384.0;
//const NOTIF_Y_POSITION: i32 = 40 + (NOTIF_HEIGHT as i32);
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

#[tauri::command]
async fn resize_notification_window(app: tauri::AppHandle, height: f64) {
  if let Some(window) = app.get_window("notification") {
    if let Ok(current_size) = window.outer_size() {
        let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
          width: current_size.width,
          height: (height as u32),
        }));
    }
  }
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
        let window_size = window.outer_size().unwrap();

        let top_margin_percentage = 0.05;
        let y_position = (screen_size.height as f64 * top_margin_percentage) as i32;

        let start_x = screen_size.width as i32 + NOTIF_START_X_OFFSET;
        let final_x = screen_size.width as i32 - window_size.width as i32 - NOTIF_END_X_OFFSET;

        window
          .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: start_x,
            y: y_position,
          }))
          .unwrap();

        window.emit("notification_event_id", json!({"event_id": event_id, "button_configs": button_configs, "title": title, "time": time})).unwrap();
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

#[tauri::command]
async fn kn_execute_command(command: String, cwd: Option<String>) -> Result<String, String> {
    use std::process::Command;

    let shell = if cfg!(target_os = "windows") { "cmd" } else { "sh" };
    let flag = if cfg!(target_os = "windows") { "/C" } else { "-c" };

    let mut cmd = Command::new(shell);
    cmd.arg(flag).arg(&command);

    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }

    let output = cmd.output().map_err(|e| format!("Failed to execute command: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        if stderr.is_empty() {
            Err(format!("Command failed with exit code: {}", output.status))
        } else {
            Err(stderr)
        }
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

  let mut builder = tauri::Builder::default()
    .plugin(tauri_plugin_localhost::Builder::new(1420).build())
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

      main_window.center()?;

      #[cfg(target_os = "macos")]
      {
        main_window.set_decorations(false).unwrap();
      }
      main_window.set_resizable(true);
      main_window.set_maximizable(true);

      #[cfg(any(windows, target_os = "macos"))]
      let _shadow_res = match set_shadow(&main_window, true) {
        Ok(_) => log::info!("Window shadow enabled successfully"),
        Err(e) => log::error!("Failed to set window shadow: {}", e),
      };

      // notification window
      let notification_window = WindowBuilder::new(
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
      .visible(false)
      .build()?;
      app.manage(Arc::new(Mutex::new(notification_window)));

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
      emit_event,
      open_screen_recording_settings,
      open_microphone_settings,
      audio::audio::emit_stop_events,
      resize_notification_window,
      spotlight::kn_init_app,
      kn_read_logs,
      kn_get_log_path,
      kn_execute_command
    ])
    .manage(UUIDState {
      uuid: StdMutex::new(None),
    }) // Initialize state with no UUID
    .manage(progress_state)
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
      }
      _ => {}
    });

  #[cfg(target_os = "windows")]
  {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");

    let tray_menu = SystemTrayMenu::new().add_item(quit).add_item(show);

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
