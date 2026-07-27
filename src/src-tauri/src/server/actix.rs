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
use crate::automations::workflow_api;
use crate::connections;
use crate::heartbeat::api as heartbeat_api;
use crate::mcp::api as mcp_api;
use crate::search;
use crate::user::UserInfo;
use crate::workspaces::api as workspace_api;
use crate::ConnectionsData;
use crate::RecordingState;
use crate::server::mobile_discovery;
use sysinfo::System;

#[get("/")]
async fn ping() -> impl Responder {
  HttpResponse::Ok().body("pong")
}

pub type InferenceThreads = Arc<Mutex<Vec<Arc<InferenceThreadRequest>>>>;
const MOBILE_LAN_PORT: u16 = 18_898;

fn mobile_lan_port(port: u16) -> u16 {
  if port == crate::server::qdrant::QDRANT_PORT {
    MOBILE_LAN_PORT.saturating_add(1)
  } else {
    MOBILE_LAN_PORT
  }
}

fn desktop_discovery_label() -> String {
  let host_name = System::host_name().unwrap_or_else(|| "This Mac".to_string());
  format!("Knapsack on {host_name}")
}

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
        .or_else(|| Some("http://127.0.0.1:18789".to_string())),
    }));

  // Pre-check: detect and attempt to kill zombie processes on this port
  if let Ok(stream) = std::net::TcpStream::connect(("127.0.0.1", port)) {
    drop(stream);
    eprintln!(
      "WARNING: Port {} is already in use! Attempting to kill zombie process...",
      port
    );

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
        let pid_output = String::from_utf8_lossy(&output.stdout);
        let current_pid = std::process::id().to_string();
        let pids: Vec<String> = pid_output
          .lines()
          .map(str::trim)
          .filter(|pid| !pid.is_empty() && *pid != current_pid)
          .map(ToString::to_string)
          .collect();

        if !pids.is_empty() {
          eprintln!(
            "Killing zombie process(es) on port {} (PIDs: {})",
            port,
            pids.join(", ")
          );
          let _ = std::process::Command::new("kill")
            .arg("-9")
            .args(&pids)
            .status();
          std::thread::sleep(std::time::Duration::from_millis(500));
        }
      }
    }

    // Verify port is now free
    if let Ok(stream) = std::net::TcpStream::connect(("127.0.0.1", port)) {
      drop(stream);
      eprintln!(
        "ERROR: Port {} is still in use after cleanup attempt!",
        port
      );
      eprintln!("ERROR: Another Knapsack instance may be running. Please close it manually.");
    } else {
      eprintln!("SUCCESS: Port {} has been freed.", port);
    }
  }

  // Developer Mode shared state
  let dev_loop_state = Data::new(clawd::dev_feedback_loop::new_shared_state());
  let dev_team_state = Data::new(clawd::agent_team::new_shared_team_state());
  let dev_qa_state = Data::new(crate::automations::qa_suite::new_shared_qa_state());
  let dev_qa_scenarios = Data::new(crate::automations::qa_suite::new_shared_scenarios());
  let dev_mode_state = Data::new(clawd::dev_remote::new_shared_dev_mode_state());
  let mobile_port = mobile_lan_port(port);
  let mobile_server = HttpServer::new(move || {
    let cors = Cors::permissive();
    App::new()
      .wrap(cors)
      .wrap(Logger::default())
      .service(ping)
      .service(api::mobile::create_mobile_meeting)
      .service(api::mobile::list_mobile_meetings)
      .service(api::mobile::get_mobile_meeting)
      .service(api::mobile::get_mobile_session)
      .service(api::mobile::list_mobile_calendar_events)
      .service(api::mobile::list_mobile_chats)
      .service(api::mobile::get_mobile_chat)
      .service(api::mobile::create_mobile_chat)
      .service(api::mobile::send_mobile_chat_message)
      .service(api::mobile::save_mobile_notes)
      .service(api::mobile::update_mobile_meeting_status)
      .service(api::mobile::upload_mobile_recording)
  });

  let mobile_server_handle = match mobile_server.bind(("0.0.0.0", mobile_port)) {
    Ok(server) => {
      log::info!("Starting mobile LAN server on 0.0.0.0:{mobile_port}");
      let server = server.run();
      let handle = server.handle();
      tokio::spawn(async move {
        if let Err(err) = server.await {
          log::error!("Knapsack mobile LAN server exited with error: {err}");
        }
      });
      Some(handle)
    }
    Err(err) => {
      log::warn!("Unable to bind Knapsack mobile LAN server on port {mobile_port}: {err}");
      None
    }
  };
  let _mobile_discovery = mobile_server_handle
    .as_ref()
    .and_then(|_| mobile_discovery::start_mobile_discovery_service(mobile_port, &desktop_discovery_label()));

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
      .app_data(dev_loop_state.clone())
      .app_data(dev_team_state.clone())
      .app_data(dev_qa_state.clone())
      .app_data(dev_qa_scenarios.clone())
      .app_data(dev_mode_state.clone())
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
      // Browser workflow endpoints
      .service(workflow_api::get_workflows)
      .service(workflow_api::get_workflow)
      .service(workflow_api::create_workflow)
      .service(workflow_api::update_workflow)
      .service(workflow_api::delete_workflow)
      .service(workflow_api::execute_workflow)
      .service(workflow_api::get_workflow_runs)
      .service(audio::audio::start_recording)
      .service(audio::audio::stop_recording)
      .service(audio::audio::get_transcript_by_thread_id)
      .service(audio::audio::delete_transcript)
      .service(audio::audio::get_recording_status)
      .service(audio::audio::get_mic_usage)
      .service(audio::audio::pause_recording)
      .service(audio::audio::list_all_transcripts)
      .service(audio::audio::get_meeting_insights)
      .service(api::document::get_document_infos)
      .service(api::mobile::create_mobile_meeting)
      .service(api::mobile::list_mobile_meetings)
      .service(api::mobile::get_mobile_meeting)
      .service(api::mobile::get_mobile_session)
      .service(api::mobile::list_mobile_calendar_events)
      .service(api::mobile::list_mobile_chats)
      .service(api::mobile::get_mobile_chat)
      .service(api::mobile::create_mobile_chat)
      .service(api::mobile::send_mobile_chat_message)
      .service(api::mobile::save_mobile_notes)
      .service(api::mobile::update_mobile_meeting_status)
      .service(api::mobile::upload_mobile_recording)
      .service(api::notes::list_all_notes)
      .service(api::notes::get_notes)
      .service(api::notes::save_notes)
      .service(api::audio::delete_audio_files)
      .service(search::get_recent_emails)
      .service(search::get_recent_calendar_events)
      .service(search::filter_emails_by_addresses)
      .service(search::filter_emails_by_addresses_get)
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
      .service(connections::google::drive::fetch_google_drive_file_text)
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
      .service(connections::api::get_user_email)
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
      .service(clawd::browser::browser_search)
      .service(clawd::browser::knapsack_chat_completions_proxy)
      .service(clawd::browser::chat)
      .service(clawd::browser::agent_chat)
      .service(clawd::browser::agent_run)
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
      // OAuth provider login (OpenRouter browser-based auth) + Knapsack studio auth
      .service(clawd::service::start_oauth_login)
      .service(clawd::service::oauth_callback)
      .service(clawd::service::knapsack_auth_callback)
      .service(clawd::service::knapsack_disconnect)
      .service(clawd::service::gemini_connect)
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
      .service(clawd::channels::telegram_validate)
      .service(clawd::channels::telegram_disconnect)
      // Telegram user accounts (MTProto, non-bot)
      .service(clawd::channels::telegram_user_request_code)
      .service(clawd::channels::telegram_user_verify_code)
      .service(clawd::channels::telegram_user_sign_up)
      .service(clawd::channels::telegram_user_status)
      .service(clawd::channels::telegram_chief_of_staff_setup)
      .service(clawd::channels::telegram_chief_of_staff_status)
      .service(clawd::channels::telegram_provision_chief_of_staff_bot)
      .service(clawd::channels::telegram_managed_bot_deeplink)
      .service(clawd::channels::telegram_managed_bot_get_token)
      .service(clawd::channels::telegram_managed_bot_status)
      .service(clawd::channels::telegram_get_agent_bot_deep_link)
      .service(clawd::channels::telegram_provision_agent_bot)
      .service(clawd::channels::telegram_configure_agent_bot)
      .service(clawd::channels::telegram_rotate_agent_bot_token)
      .service(clawd::channels::telegram_get_agent_bot_statuses)
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
      // Managed agents: seeded templates, shared context, desktop presence, route preview
      .service(clawd::managed_agents::managed_agents_index)
      .service(clawd::managed_agents::managed_agent_templates)
      .service(clawd::managed_agents::managed_agent_policies)
      .service(clawd::managed_agents::managed_agent_list)
      .service(clawd::managed_agents::managed_agent_sessions)
      .service(clawd::managed_agents::managed_agent_upsert)
      .service(clawd::managed_agents::managed_agent_upsert_presence)
      .service(clawd::managed_agents::managed_agent_presence_for_user)
      .service(clawd::managed_agents::managed_agent_upsert_context)
      .service(clawd::managed_agents::managed_agent_context_get)
      .service(clawd::managed_agents::managed_agent_route_preview)
      .service(clawd::managed_agents::managed_agent_channel_run)
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
      .service(workspace_api::update_document_tags)
      .service(workspace_api::save_chat_to_workspace)
      // Library curator endpoints
      .service(workspace_api::get_curation_status)
      .service(workspace_api::update_curation_settings)
      .service(workspace_api::curate_now)
      .service(workspace_api::promote_workspace)
      .service(workspace_api::wipe_library)
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
      // Agent pause / resume control surface
      .service(clawd::channels::agent_pause)
      .service(clawd::channels::agent_pause_status)
      // Developer Mode: Business Context Aggregator
      .service(clawd::context_aggregator::aggregate_context)
      // Developer Mode: Agent Team orchestration
      .service(clawd::agent_team::launch_team)
      .service(clawd::agent_team::team_status)
      .service(clawd::agent_team::cancel_team)
      .service(clawd::agent_team::agent_output)
      // Developer Mode: QA Suite
      .service(crate::automations::qa_suite::run_qa_suite)
      .service(crate::automations::qa_suite::qa_status)
      .service(crate::automations::qa_suite::qa_results)
      .service(crate::automations::qa_suite::list_scenarios)
      .service(crate::automations::qa_suite::save_scenario)
      .service(crate::automations::qa_suite::delete_scenario)
      // Developer Mode: Remote control (channels, API)
      .service(clawd::dev_remote::get_dev_state)
      .service(clawd::dev_remote::remote_command)
      .service(clawd::dev_remote::notify_channel)
  })
  .bind(("127.0.0.1", port))
  .map_err(|e| {
    eprintln!(
      "FATAL: Failed to bind actix server to 127.0.0.1:{}: {}",
      port, e
    );
    eprintln!("FATAL: Is another instance of Knapsack already running on this port?");
    e
  })?
  .run();

  // Set up graceful shutdown handler
  let server_handle = server.handle();
  let mobile_shutdown_handle = mobile_server_handle.clone();

  // Spawn a task to listen for shutdown signals
  tokio::spawn(async move {
    tokio::signal::ctrl_c().await.ok();
    eprintln!("Received shutdown signal, stopping actix server gracefully...");
    if let Some(handle) = mobile_shutdown_handle {
      handle.stop(true).await;
    }
    server_handle.stop(true).await;
  });

  // Run the server
  server.await
}
