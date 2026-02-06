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
use crate::search;
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
      base_url: std::env::var("CLAWDBOT_BASE_URL")
        .ok()
        .map(|s| s.trim_end_matches('/').to_string())
        .or_else(|| Some("http://127.0.0.1:18791".to_string())),
    }));

  println!("actix.rs: start_server: Starting server on port: {}", port);
  HttpServer::new(move || {
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
      .service(clawd::gmail::get_unread_important)
      .service(clawd::sidecar::status)
      .service(clawd::sidecar::set_config)
      .service(clawd::service::service_status)
      .service(clawd::service::service_health)
      .service(clawd::service::service_logs)
      .service(clawd::service::set_llm_keys)
      .service(clawd::service::set_service_enabled)
      .service(clawd::service::api_key_status)
      .service(clawd::service::set_api_key)
      .service(clawd::service::get_api_key)
      // Skills management endpoints
      .service(clawd::service::skills_status)
      .service(clawd::service::skills_install)
      .service(clawd::service::skills_update)
      // Channel management endpoints
      .service(clawd::channels::whatsapp_status)
      .service(clawd::channels::whatsapp_enable)
      .service(clawd::channels::whatsapp_login)
      .service(clawd::channels::imessage_status)
      .service(clawd::channels::imessage_enable)
      .service(clawd::channels::imessage_setup)
      .service(clawd::channels::voice_status)
      .service(clawd::channels::voice_enable)
      .service(clawd::channels::open_full_disk_access)
      // Token usage & cost management endpoints
      .service(usage_api::get_usage_summary)
      .service(usage_api::get_daily_usage)
      .service(usage_api::get_recent_usage)
      .service(usage_api::get_budget_status)
  })
  .bind(("127.0.0.1", port))
  .unwrap()
  .run()
  .await
}
