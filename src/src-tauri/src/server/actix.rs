use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::web::Data;
use core::time::Duration;

use std::path::PathBuf;
use std::sync::{
  atomic::{AtomicBool, AtomicU16},
  Arc,
};
use tokio::runtime::Handle;
use tokio::sync::{Mutex, RwLock};

use actix_web::{get, App, HttpResponse, HttpServer, Responder};

use qdrant_client::client::QdrantClient;
use qdrant_client::prelude::*;

use crate::llm::api::{llm_complete, stop_llm_execution};
use crate::llm::usage_api;

use crate::clawd;
use crate::llm::llama_binding::llm::LlamaBinding;

use clawd::sidecar::ClawdbotConfig;
use clawd::sidecar::SharedClawdbotConfig;

use crate::llm::llama_binding::process::InferenceThreadRequest;
use crate::memory::semantic::{semantic_search, SemanticService};

use crate::api;
use crate::audio;
use crate::automations::api as automation_api;
use crate::connections;
use crate::heartbeat::api as heartbeat_api;
use crate::mcp::api as mcp_api;
use crate::search;
use crate::workspaces::api as workspace_api;
use crate::user::UserInfo;
use crate::ConnectionsData;
use crate::RecordingState;

#[get("/")]
async fn ping() -> impl Responder {
  HttpResponse::Ok().body("pong")
}

pub type InferenceThreads = Arc<Mutex<Vec<Arc<InferenceThreadRequest>>>>;

#[tokio::main]
pub async fn start_server<'a>(
  //state: tauri::State<'a, State>,
  port: u16,
  //llm_path: PathBuf,
  app_handle: tauri::AppHandle,
  knapsack_gmail_indexing_progress: Arc<AtomicU16>,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
  is_chatting: Arc<Mutex<AtomicBool>>,
  connections_data: Arc<Mutex<ConnectionsData>>,
) -> std::io::Result<()> {
  let handle = Arc::new(Handle::current());
  // if state.running.load(Ordering::SeqCst) {
  //   return Err("Server is already running.".to_string());
  // }
  // state.running.store(true, Ordering::SeqCst);

  let qdrant_client_config = QdrantClientConfig {
    uri: "http://localhost:6333".to_string(),
    timeout: Duration::from_secs(300),
    ..Default::default()
  };
  let qdrant_client = QdrantClient::new(Some(qdrant_client_config)).unwrap();
  let qdrant_client = Data::new(Arc::new(Mutex::new(qdrant_client)));

  let llama_data = Data::new(Arc::new(Mutex::new(LlamaBinding::default())));
  let inference_threads: InferenceThreads = Arc::new(Mutex::new(Vec::new()));

  let user_info = Data::new(Arc::new(RwLock::new(UserInfo::default())));

  let recording_state = RecordingState::default();

  // Clawdbot integration config (in-memory for now)
  let clawdbot_cfg: SharedClawdbotConfig =
    std::sync::Arc::new(tokio::sync::RwLock::new(ClawdbotConfig {
      base_url: std::env::var("OPENCLAW_BASE_URL")
        .ok()
        .map(|s| s.trim_end_matches('/').to_string())
        .or_else(|| Some("http://127.0.0.1:18791".to_string())),
    }));

  // Pre-check: detect and attempt to kill zombie processes on this port
  if let Ok(stream) = std::net::TcpStream::connect(("127.0.0.1", port)) {
    drop(stream);
    eprintln!("WARNING: Port {} is already in use! Attempting to kill zombie process...", port);

    #[cfg(target_os = "windows")]
    {
      // Kill any process holding this port on Windows
      use std::os::windows::process::CommandExt;
      const CREATE_NO_WINDOW: u32 = 0x08000000;

      let netstat_output = std::process::Command::new("cmd")
        .args(["/C", &format!("netstat -ano | findstr :{}", port)])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

      if let Ok(output) = netstat_output {
        let output_str = String::from_utf8_lossy(&output.stdout);
        for line in output_str.lines() {
          if line.contains("LISTENING") {
            if let Some(pid_str) = line.split_whitespace().last() {
              eprintln!("Killing zombie process on port {} (PID: {})", port, pid_str);
              let _ = std::process::Command::new("taskkill")
                .args(["/PID", pid_str, "/F", "/T"])
                .creation_flags(CREATE_NO_WINDOW)
                .status();
              std::thread::sleep(std::time::Duration::from_millis(500));
            }
          }
        }
      }
    }

    #[cfg(not(target_os = "windows"))]
    {
      // Kill any process holding this port on Unix-like systems
      let lsof_output = std::process::Command::new("lsof")
        .args(["-ti", &format!(":{}", port)])
        .output();

      if let Ok(output) = lsof_output {
        let pid_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !pid_str.is_empty() {
          eprintln!("Killing zombie process on port {} (PID: {})", port, pid_str);
          let _ = std::process::Command::new("kill")
            .args(["-9", &pid_str])
            .status();
          std::thread::sleep(std::time::Duration::from_millis(500));
        }
      }
    }

    // Verify port is now free
    if let Ok(stream) = std::net::TcpStream::connect(("127.0.0.1", port)) {
      drop(stream);
      eprintln!("ERROR: Port {} is still in use after cleanup attempt!", port);
      eprintln!("ERROR: Another Knapsack instance may be running. Please close it manually.");
    } else {
      eprintln!("SUCCESS: Port {} has been freed.", port);
    }
  }

  println!("actix.rs: start_server: Starting server on port: {}", port);
  let server = HttpServer::new(move || {
    let cors = Cors::permissive();
    App::new()
      .app_data(Data::new(app_handle.clone()))
      .app_data(Data::new(semantic_service.clone()))
      .app_data(Data::new(knapsack_gmail_indexing_progress.clone()))
      .app_data(user_info.clone())
      .app_data(qdrant_client.clone())
      .app_data(Data::clone(&llama_data))
      // .app_data(Data::new(Arc::new(llm_path.clone())))
      .app_data(Data::new(inference_threads.clone()))
      .app_data(Data::new(is_chatting.clone()))
      .app_data(Data::new(connections_data.clone()))
      .app_data(Data::new(recording_state.clone()))
      .app_data(Data::new(handle.clone()))
      .app_data(Data::new(clawdbot_cfg.clone()))
      .wrap(cors)
      .wrap(Logger::default())
      .service(llm_complete)
      .service(stop_llm_execution)
      .service(api::app_info::get_release_type)
      .service(automation_api::create_automation)
      .service(automation_api::create_automation_run)
      .service(automation_api::get_automations)
      .service(automation_api::create_threads)
      .service(automation_api::update_thread)
      .service(automation_api::create_message)
      .service(automation_api::delete_automation)
      .service(automation_api::update_automation)
      .service(automation_api::upsert_automations_feedback)
      .service(automation_api::get_feedbacks)
      .service(automation_api::start_check)
      .service(automation_api::create_system_message)
      .service(automation_api::schedule_automation_runs)
      .service(automation_api::get_automation_runs)
      .service(automation_api::get_feed_items)
      .service(automation_api::create_feed_item)
      .service(automation_api::update_feed_item)
      .service(automation_api::get_thread_transcript)
      .service(audio::audio::start_recording)
      .service(audio::audio::stop_recording)
      .service(audio::audio::get_transcript_by_thread_id)
      .service(audio::audio::delete_transcript)
      .service(audio::audio::get_recording_status)
      .service(audio::audio::get_mic_usage)
      .service(audio::audio::pause_recording)
      .service(audio::audio::list_all_transcripts)
      .service(api::document::get_document_infos)
      .service(api::notes::list_all_notes)
      .service(api::notes::get_notes)
      .service(api::notes::save_notes)
      .service(api::audio::delete_audio_files)
      .service(search::get_recent_emails)
      .service(search::get_recent_calendar_events)
      .service(search::filter_emails_by_addresses)
      .service(search::list_emails_within_timestamps)
      .service(search::get_calendar_event_by_id)
      .service(search::list_sent_emails_within_timestamps)
      .service(search::get_email_thread)
      .service(search::update_email)
      .service(search::get_events)
      .service(semantic_search)
      .service(connections::google::auth::google_signin_api)
      .service(connections::google::auth::complete_google_signin)
      .service(connections::google::auth::focus)
      .service(connections::google::auth::fetch_google_auth_token_api)
      .service(connections::google::profile::fetch_google_profile_api)
      .service(connections::google::drive::fetch_google_drive_api)
      .service(connections::google::drive::fetch_google_drive_files)
      .service(connections::google::drive::fetch_google_drive_mime_types)
      .service(connections::google::drive::fetch_google_drive_documents_ids_shared_by_users)
      .service(connections::google::calendar::fetch_google_calendar_api)
      .service(connections::google::calendar::get_events)
      .service(connections::google::calendar::get_event_ids_by_recurrence_ids)
      .service(connections::google::gmail::fetch_google_gmail_api)
      .service(connections::google::gmail::set_email_as_read)
      .service(connections::local::files::fetch_local_files_api)
      .service(connections::microsoft::auth::microsoft_signin_api)
      .service(connections::microsoft::calendar::fetch_microsoft_calendar_api)
      .service(connections::microsoft::outlook::fetch_microsoft_email_api)
      .service(connections::microsoft::outlook::set_email_as_read)
      .service(connections::microsoft::outlook::reply_to_email)
      .service(connections::microsoft::profile::fetch_microsoft_profile_api)
      .service(connections::api::get_connections)
      .service(connections::api::get_is_connections_syncing)
      .service(connections::api::delete_connection)
      .service(connections::api::signout)
      .service(connections::api::refresh_knapsack_api_token)
      // Clawd integration endpoints
      .service(clawd::browser::open_browser)
      .service(clawd::browser::list_tabs)
      .service(clawd::browser::focus_tab)
      .service(clawd::browser::snapshot)
      .service(clawd::browser::act)
      .service(clawd::browser::screenshot)
      .service(clawd::browser::chat)
      .service(clawd::browser::agent_chat)
      .service(clawd::browser::terminal_output)
      .service(clawd::gmail::get_unread_important)
      .service(clawd::sidecar::status)
      .service(clawd::sidecar::set_config)
      .service(clawd::service::service_status)
      .service(clawd::service::service_health)
      .service(clawd::service::service_startup_ready)
      .service(clawd::service::service_logs)
      .service(clawd::service::set_llm_keys)
      .service(clawd::service::set_service_enabled)
      .service(clawd::service::api_key_status)
      .service(clawd::service::validate_api_key)
      .service(clawd::service::set_api_key)
      .service(clawd::service::delete_extra_provider_key)
      .service(clawd::service::get_api_key)
      // Ollama (local LLM) endpoints
      .service(clawd::service::ollama_status)
      .service(clawd::service::ollama_models)
      .service(clawd::service::ollama_configure)
      .service(clawd::service::ollama_pull)
      .service(clawd::service::ollama_delete)
      // Skills management endpoints
      .service(clawd::service::skills_status)
      .service(clawd::service::skills_install)
      .service(clawd::service::skills_update)
      // Channel management endpoints
      .service(clawd::channels::whatsapp_status)
      .service(clawd::channels::whatsapp_enable)
      .service(clawd::channels::whatsapp_login)
      .service(clawd::channels::whatsapp_login_wait)
      .service(clawd::channels::whatsapp_relink)
      .service(clawd::channels::whatsapp_login_phone)
      .service(clawd::channels::whatsapp_disconnect)
      .service(clawd::channels::imessage_status)
      .service(clawd::channels::imessage_enable)
      .service(clawd::channels::imessage_setup)
      .service(clawd::channels::imessage_disconnect)
      .service(clawd::channels::send_channel_message)
      .service(clawd::channels::telegram_status)
      .service(clawd::channels::telegram_enable)
      .service(clawd::channels::telegram_configure)
      .service(clawd::channels::telegram_disconnect)
      .service(clawd::channels::voice_status)
      .service(clawd::channels::voice_enable)
      .service(clawd::channels::open_full_disk_access)
      .service(clawd::channels::channel_diagnostics)
      .service(clawd::channels::generic_channel_status)
      .service(clawd::channels::generic_channel_configure)
      .service(clawd::channels::generic_channel_disconnect)
      .service(clawd::channels::channel_allowlist_get)
      .service(clawd::channels::channel_allowlist_update)
      .service(clawd::channels::signal_check_cli)
      .service(clawd::channels::signal_install_cli)
      .service(clawd::channels::signal_link)
      .service(clawd::channels::signal_register)
      .service(clawd::channels::signal_verify)
      // Token usage & cost management endpoints
      .service(usage_api::get_usage_summary)
      .service(usage_api::get_daily_usage)
      .service(usage_api::get_recent_usage)
      .service(usage_api::get_budget_status)
      .service(usage_api::get_model_routing)
      .service(usage_api::set_model_routing)
      // Heartbeat system endpoints
      .service(heartbeat_api::get_heartbeat_config)
      .service(heartbeat_api::update_heartbeat_config)
      .service(heartbeat_api::get_heartbeat_logs)
      .service(heartbeat_api::trigger_heartbeat)
      // Workspace / Knowledge Base endpoints
      .service(workspace_api::create_workspace)
      .service(workspace_api::list_workspaces)
      .service(workspace_api::get_workspace)
      .service(workspace_api::update_workspace)
      .service(workspace_api::delete_workspace)
      .service(workspace_api::add_document)
      .service(workspace_api::remove_document)
      .service(workspace_api::workspace_search)
      // MCP Marketplace endpoints
      .service(mcp_api::list_servers)
      .service(mcp_api::list_installed_servers)
      .service(mcp_api::get_server)
      .service(mcp_api::install_server)
      .service(mcp_api::uninstall_server)
      .service(mcp_api::enable_server)
      .service(mcp_api::disable_server)
      .service(mcp_api::update_server_config)
      .service(mcp_api::add_custom_server)
  })
  .bind(("127.0.0.1", port))
  .map_err(|e| {
    eprintln!("FATAL: Failed to bind actix server to 127.0.0.1:{}: {}", port, e);
    eprintln!("FATAL: Is another instance of Knapsack already running on this port?");
    e
  })?
  .run();

  // Set up graceful shutdown handler
  let server_handle = server.handle();

  // Spawn a task to listen for shutdown signals
  tokio::spawn(async move {
    tokio::signal::ctrl_c().await.ok();
    eprintln!("Received shutdown signal, stopping actix server gracefully...");
    server_handle.stop(true).await;
  });

  // Run the server
  server.await
}
