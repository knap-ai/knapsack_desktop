use actix_web::{
  delete, get, post,
  web::{self, Data, Json},
  HttpResponse, Responder, Result,
};
use flacenc::constant::build_info::FEATURES;
use std::fs::File;
use std::io::BufWriter;

use chrono::{Duration as ChronoDuration, LocalResult, TimeZone, Utc};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs::create_dir_all;
use std::fs::read_to_string;
use std::sync::{Arc, Mutex};
use tokio::runtime::Runtime;

use tauri::{CustomMenuItem, Manager, Window, WindowBuilder, WindowUrl};

#[cfg(target_os = "macos")]
use crate::audio::macos::{count_microphone_users, record_speaker_output};

#[cfg(target_os = "windows")]
use crate::audio::windows::{count_microphone_users, record_speaker_output};

use clap::Parser;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{FromSample, Sample};
use hound::WavWriter;

use std::io::Write;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::runtime::Handle;
use tokio::time::{sleep, Duration, Instant};
use uuid::Uuid;

use crate::audio::utils::sanitize_filename;
use crate::db::models::calendar_event::CalendarEvent;
use crate::db::models::feed_item::{FeedItem, FeedItemComplete};
use crate::db::models::thread::Thread;
use crate::db::models::transcript::{Transcript, TranscriptWithContent};
use crate::error::Error;
use crate::spotlight::WINDOW_LABEL;
use crate::utils::log::knap_log_error;
use crate::RecordingState;

use super::encode::save_chunk;
use super::transcribe::{finalize_chunk, unify_transcript};
use chrono::DateTime;
use cpal::SizedSample;
use hound::SampleFormat;
use std::collections::HashMap;
use std::ffi::c_void;
use std::mem::size_of;
use std::ptr;
use tokio::sync::Semaphore;

#[derive(Parser, Debug)]
struct Opt {
  /// The audio device to use
  #[arg(short, long, default_value_t = String::from("default"))]
  device: String,

  /// Use the JACK host
  #[cfg(all(
    any(
      target_os = "linux",
      target_os = "dragonfly",
      target_os = "freebsd",
      target_os = "netbsd"
    ),
    feature = "default"
  ))]
  #[arg(short, long)]
  #[allow(dead_code)]
  jack: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordStatusResponse {
  pub is_recording: bool,
  pub thread_id: Option<u64>,
  pub feed_item_id: Option<u64>,
  pub success: bool,
}

#[derive(Serialize)]
struct TranscriptItem {
  filename: String,
  content: String,
  thread_id: Option<u64>,
  start_time: Option<i64>,
  end_time: Option<i64>,
  participants: Option<String>,
}

#[derive(Serialize)]
struct TranscriptListResponse {
  data: TranscriptData,
}

#[derive(Serialize)]
struct TranscriptData {
  transcripts: Vec<TranscriptItem>,
}

fn sample_format(format: cpal::SampleFormat) -> hound::SampleFormat {
  if format.is_float() {
    hound::SampleFormat::Float
  } else {
    hound::SampleFormat::Int
  }
}

fn wav_spec_from_config(config: &cpal::SupportedStreamConfig) -> hound::WavSpec {
  hound::WavSpec {
    channels: config.channels() as _,
    sample_rate: config.sample_rate().0 as _,
    bits_per_sample: (config.sample_format().sample_size() * 8) as _,
    sample_format: sample_format(config.sample_format()),
  }
}

type WavWriterHandle = Arc<Mutex<Option<hound::WavWriter<BufWriter<File>>>>>;
lazy_static! {
  static ref GLOBAL_SAMPLES: Mutex<Vec<i32>> = Mutex::new(Vec::new());
}

fn write_audio_data<T, U>(
  input: &[T],
  last_save: &mut Instant,
  chunk_counter: &mut u32,
  input_filename: &str,
  channel: usize,
  sample_rate: usize,
  semaphore: Arc<Semaphore>,
  is_paused: &Arc<AtomicBool>,
) where
  T: Sample + derive_more::Debug,
  U: Sample + hound::Sample + FromSample<T> + derive_more::Debug,
  f32: FromSample<U>,
{
  if input.is_empty() {
    log::warn!("Received empty audio buffer");
    return;
  }

  let now = Instant::now();

  if is_paused.load(Ordering::Relaxed) {
    *last_save = now;
    return;
  }

  let mut global_samples = GLOBAL_SAMPLES.lock().unwrap();
  let samples: Vec<i32> = input
    .iter()
    .map(|&s| {
      let sample: U = U::from_sample(s);
      let f32_sample = f32::from_sample(sample);
      let samples_16bit: i32 = (f32_sample * i16::MAX as f32) as i16 as i32;
      samples_16bit
    })
    .collect();

  global_samples.extend_from_slice(&samples);

  let should_save = now.duration_since(*last_save) >= Duration::from_secs(150);

  if should_save {
    let chunk_samples = global_samples.drain(..).collect::<Vec<i32>>();

    let chunk_filename = format!("{}_{}.flac", input_filename, *chunk_counter);
    let transcript_filename = format!("{}.txt", input_filename);
    std::thread::spawn(move || {
      let rt = Runtime::new().unwrap();
      rt.block_on(async {
        let permit = semaphore.acquire().await.unwrap();
        save_chunk(chunk_samples, chunk_filename.clone(), channel, sample_rate);
        finalize_chunk(chunk_filename, transcript_filename).await;
        drop(permit);
      });
    });

    *last_save = now;
    *chunk_counter += 1;
  }
}

fn setup_audio_device(
  host: &cpal::Host,
  device_name: &str,
  is_input: bool,
) -> Result<(cpal::Device, cpal::SupportedStreamConfig), String> {
  log::info!(
    "Setting up {} device: {}",
    if is_input { "input" } else { "output" },
    device_name
  );
  let o_devices_res = host.output_devices();
  let _o_devices = match o_devices_res {
    Ok(od) => od,
    Err(_) => return Err("Error".to_string()),
  };

  let device = if device_name == "default" {
    if is_input {
      host.default_input_device()
    } else {
      host.default_output_device()
    }
  } else {
    let devices = if is_input {
      host.input_devices()
    } else {
      host.output_devices()
    };
    match devices {
      Ok(mut devices) => devices.find(|x| x.name().map(|y| y == device_name).unwrap_or(false)),
      Err(e) => return Err(e.to_string()),
    }
  }
  .ok_or_else(|| {
    format!(
      "failed to find {} device",
      if is_input { "input" } else { "output" }
    )
  })?;

  let config = if is_input {
    let config = device.default_input_config().map_err(|e| {
      log::error!("Error getting default audio device config: {:?}", e);
      e.to_string()
    })?;

    log::info!(
      "Input device config: channels={}, sample_rate={}, sample_format={:?}",
      config.channels(),
      config.sample_rate().0,
      config.sample_format()
    );

    config
  } else {
    device.default_output_config().map_err(|e| {
      log::error!("Error getting default audio device config: {:?}", e);
      e.to_string()
    })?
  };

  Ok((device, config))
}

fn create_wav_writer(
  config: &cpal::SupportedStreamConfig,
  path: &PathBuf,
) -> Result<WavWriterHandle, String> {
  let spec = wav_spec_from_config(config);
  let writer = hound::WavWriter::create(path, spec).map_err(|e| e.to_string())?;
  Ok(Arc::new(Mutex::new(Some(writer))))
}

#[derive(Deserialize, Clone)]
struct StartRecordingRequest {
  thread_id: u64,
  feed_item_id: u64,
  event_id: u64,
  save_transcript: bool,
}

#[post("/api/knapsack/start_recording")]
pub async fn start_recording(
  recording_state: Data<RecordingState>,
  data: Json<StartRecordingRequest>,
  handle: Data<Arc<Handle>>,
  app_handle: Data<tauri::AppHandle>,
) -> Result<HttpResponse> {
  //TODO Error Handling
  if recording_state.is_recording.load(Ordering::Relaxed) {
    if recording_state.is_paused.load(Ordering::Relaxed) {
      recording_state.is_paused.store(false, Ordering::Relaxed);
      return Ok(HttpResponse::Ok().body("Recording resumed"));
    }
    return Ok(HttpResponse::InternalServerError().body("Recording is already in progress"));
  }

  let input_filename = format!("{}_input", data.thread_id);
  let output_filename = format!("{}_output", data.thread_id);

  {
    let mut input_filename_guard = recording_state.input_filename.lock().unwrap();
    *input_filename_guard = Some(input_filename.clone());
  }
  {
    let mut output_filename_guard = recording_state.output_filename.lock().unwrap();
    *output_filename_guard = Some(output_filename.clone());
  }

  recording_state.is_recording.store(true, Ordering::Relaxed);
  recording_state.is_paused.store(false, Ordering::Relaxed);

  let opt = Opt::parse();
  let host = cpal::default_host();
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");

  // Setup input device
  let input_wav_path = knapsack_data_dir.join(&input_filename);
  let (mic_input_device, mic_input_config) = setup_audio_device(&host, &opt.device, true)
    .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

  let feed_item_id = data.feed_item_id;
  let thread_id = data.thread_id;

  let is_recording_state_mic = Arc::clone(&recording_state);
  let is_recording_output = Arc::clone(&recording_state.is_recording);
  let is_paused_output = Arc::clone(&recording_state.is_paused);

  let mic_input_config = mic_input_config.clone();
  let mic_input_device = mic_input_device.clone();
  log::debug!("--------------- MIC INPUT CFG: {:?}", mic_input_config);
  let mic_thread = handle.spawn_blocking(move || {
    if let Err(e) = tokio::runtime::Runtime::new()
      .unwrap()
      .block_on(stream_audio(
        mic_input_config,
        &mic_input_device,
        is_recording_state_mic,
        app_handle.get_ref(),
        data.clone(),
      ))
    {
      knap_log_error(
        "Error in microphone recording".to_string(),
        Some(Error::KSError(e)),
        Some(true),
      );
    }
  });

  let output_file_semaphore = Arc::clone(&recording_state.output_file_semaphore);
  let output_thread = handle.spawn_blocking(move || {
    if let Err(e) = tokio::runtime::Runtime::new()
      .unwrap()
      .block_on(record_speaker_output(
        is_recording_output,
        is_paused_output,
        &output_filename,
        output_file_semaphore,
      ))
    {
      knap_log_error(
        format!("Error in speaker output recording: {:?}", e.to_string()),
        None,
        None,
      );
    }
  });

  {
    let mut mic_thread_guard = recording_state.mic_thread.lock().unwrap();
    *mic_thread_guard = Some(mic_thread);
  }
  {
    let mut output_thread_guard = recording_state.output_thread.lock().unwrap();
    *output_thread_guard = Some(output_thread);
  }

  {
    let mut thread_id_guard = recording_state.thread_id.lock().unwrap();
    *thread_id_guard = Some(thread_id.clone());
  }

  {
    let mut feed_item_id_guard = recording_state.feed_item_id.lock().unwrap();
    *feed_item_id_guard = Some(feed_item_id.clone());
  }

  let filename = Uuid::new_v4().to_string();
  let start_time = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .unwrap()
    .as_secs() as i64;
  let mut transcript = Transcript {
    id: None,
    thread_id: Some(thread_id),
    filename,
    start_time: Some(start_time),
    end_time: None,
    timestamp: None,
  };
  transcript.create();

  Ok(HttpResponse::Ok().body("Recording started successfully"))
}

#[derive(Deserialize, Clone)]
struct StopRecordingRequest {
  thread_id: u64,
  event_id: u64,
  save_transcript: bool,
}

#[derive(Serialize, Clone, Debug)]
pub struct Metadata {
  pub filename: String,
  pub participants: Option<String>,
  pub end_time: Option<i64>,
  pub start_time: Option<i64>,
  pub thread_id: Option<u64>,
}

pub async fn get_metadata(thread_id: u64) -> Result<Metadata, Error> {
  let thread = match Thread::find_by_id(thread_id.clone()) {
    Ok(Some(t)) => t,
    Ok(None) => return Err(Error::KSError("Thread not found".into())),
    Err(e) => {
      return Err(Error::KSError(
        format!("Failed to get thread: {:?}", e).into(),
      ))
    }
  };

  let feed_item_id = match thread.feed_item_id {
    Some(id) => id,
    None => {
      return Err(Error::KSError(
        format!("Thread {} has no feed_item_id", thread_id).into(),
      ))
    }
  };

  let feed_item_complete = FeedItem::find_by_id_complete(feed_item_id).map_err(|e| {
    Error::KSError(format!("Failed to load feed item {}: {:?}", feed_item_id, e).into())
  })?;

  let participants = feed_item_complete
    .calendar_event
    .as_ref()
    .and_then(|c| c.attendees_json.clone());

  let end_time = feed_item_complete
    .calendar_event
    .as_ref()
    .and_then(|c| c.end);

  let start_time = feed_item_complete
    .calendar_event
    .as_ref()
    .and_then(|c| c.start)
    .or(feed_item_complete.feed_item.timestamp);

  Ok(Metadata {
    filename: feed_item_complete.feed_item.title.unwrap_or("Untitled".to_string()),
    participants,
    end_time,
    start_time,
    thread_id: Some(thread_id.clone()),
  })
}

#[post("/api/knapsack/stop_recording")]
pub async fn stop_recording(
  data: Json<StopRecordingRequest>,
  recording_state: Data<RecordingState>,
  _handle: Data<Arc<Handle>>,
) -> HttpResponse {
  if !recording_state.is_recording.load(Ordering::Relaxed) {
    return HttpResponse::BadRequest().body("No recording in progress");
  }

  recording_state.is_recording.store(false, Ordering::Relaxed);

  let input_filename = {
    let input_filename_guard = recording_state.input_filename.lock().unwrap();
    input_filename_guard.clone().unwrap_or_default()
  };
  let output_filename = {
    let output_filename_guard = recording_state.output_filename.lock().unwrap();
    output_filename_guard.clone().unwrap_or_default()
  };

  if let Some(handle) = recording_state.mic_thread.lock().unwrap().take() {
    if let Err(e) = handle.await {
      let err_msg = format!("Mic recording task failed to complete: {:?}", e);
      return HttpResponse::InternalServerError().body(err_msg);
    }
  }

  if let Some(handle) = recording_state.output_thread.lock().unwrap().take() {
    if let Err(e) = handle.await {
      let err_msg = format!("Audio output recording task failed to complete: {:?}", e);
      return HttpResponse::InternalServerError().body(err_msg);
    }
  }

  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack/transcripts");
  let input_path = knapsack_data_dir.join(&format!("{}.txt", input_filename));
  let output_path = knapsack_data_dir.join(&format!("{}.txt", output_filename));
  let thread_id = data.thread_id;
  let transcript = match Transcript::find_by_thread_id(thread_id) {
    Ok(Some(t)) => t,
    Ok(None) => {
      log::error!("Application error: Transcript not found");
      return HttpResponse::InternalServerError().json(json!({
        "error": "Transcript not found: ",
        "status": "error"
      }));
    }
    Err(e) => {
      log::error!("Application error: {:?}", e);
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("Failed to retrieve transcript name: {:?}", e),
        "status": "error"
      }));
    }
  };
  let transcript_path = knapsack_data_dir.join(&transcript.filename);

  let _input_permit = recording_state
    .input_file_semaphore
    .acquire()
    .await
    .unwrap();
  let _output_permit = recording_state
    .output_file_semaphore
    .acquire()
    .await
    .unwrap();
  match unify_transcript(
    input_path.to_str().unwrap(),
    output_path.to_str().unwrap(),
    transcript_path.to_str().unwrap(),
  ) {
    Ok(_) => {
      log::info!("Successfully combined .wav/.raw files");
      if let Err(e) = std::fs::remove_file(&input_path) {
        let err_msg = format!("Failed to delete input txt file: {:?}", e);
        knap_log_error(err_msg.clone(), None, Some(true));
        log::error!("Failed to delete input txt file: {:?}", e);
      }
      if let Err(e) = std::fs::remove_file(&output_path) {
        let err_msg = format!("Failed to delete output txt file: {:?}", e);
        knap_log_error(err_msg.clone(), None, Some(true));
        log::error!("Failed to delete output file: {:?}", e);
      }
    }
    Err(e) => {
      log::error!("Application error: {:?}", e);
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("Failed to combine input/output txt file and generate transcript: {:?}", e),
        "status": "error"
      }));
    }
  };

  let save_transcript = data.save_transcript;

  if save_transcript {
    let event_id = data.event_id;
    save_transcript_for_user(thread_id.clone(), event_id.clone(), ".transcripts");
  }

  let mut thread = match Thread::find_by_id(thread_id.clone()) {
    Ok(Some(t)) => t,
    Ok(None) => {
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("No thread found"),
        "status": "error"
      }));
    }
    Err(e) => {
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("Failed to get thread: {:?}", e),
        "status": "error"
      }));
    }
  };

  let transcript_dir = home_dir.join(".transcripts");
  let file_name = generate_filename(
    thread.clone().subtitle.unwrap(),
    thread.clone().timestamp.unwrap(),
  );
  let file_path = transcript_dir.join(file_name);

  thread.recorded = Some(true);
  if save_transcript {
    thread.saved_transcript = Some(file_path.to_string_lossy().to_string());
  }

  match thread.update() {
    Ok(_) => HttpResponse::Ok().json("Finished recording"),
    Err(e) => {
      log::error!("Error updating thread: {:?}", e);
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("Failed to update thread: {:?}", e),
        "status": "error"
      }));
    }
  }
}

pub fn save_transcript_for_user(thread_id: u64, event_id: u64, path: &str) -> Result<(), Error> {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let temp_transcripts_dir = knapsack_data_dir.join("transcripts");

  let participants_str = CalendarEvent::get_event_participants_str(event_id).unwrap();

  let transcript = match Transcript::find_by_thread_id(thread_id) {
    Ok(Some(t)) => t,
    Ok(None) => {
      return Err(Error::KSError(
        "Couldn't transcribe audio because no Transcript row was found.".into(),
      ))
    }
    Err(_) => {
      return Err(Error::KSError(
        format!("Couldn't transcribe audio because of transcripts db error.").into(),
      ))
    }
  };
  let thread = match Thread::find_by_id(thread_id) {
    Ok(Some(t)) => t,
    Ok(None) => return Err(Error::KSError("Couldn't find thread.".into())),
    Err(_) => {
      return Err(Error::KSError(
        format!("Couldn't find thread because of db error.").into(),
      ))
    }
  };
  let temp_transcript_path = temp_transcripts_dir.join(transcript.filename);
  if temp_transcript_path.exists() {
    let content: String = read_to_string(temp_transcript_path)?;
    let file_path = home_dir.join(path);

    create_dir_all(&file_path)?;

    let file_name = generate_filename(thread.subtitle.unwrap(), thread.timestamp.unwrap());
    let file_path = file_path.join(file_name);

    let content_w_participants = format!("{}\n\n\n{}", participants_str, content);
    let mut file = File::create(&file_path)?;
    file.write_all(content_w_participants.as_bytes())?;
    log::debug!("write transcript to users folder: {:?}", file_path);
  } else {
    log::debug!("Original transcript file not found.");
  }

  Ok(())
}

pub fn generate_filename(thread_subtitle: String, timestamp: i64) -> String {
  let re = Regex::new(r"^(.*),\s*[A-Za-z]{3}\s*\d{2},\s*\d{4}$").unwrap();
  let mut meeting_name: Option<String> = Some(thread_subtitle.to_string());
  if let Some(captures) = re.captures(&thread_subtitle.clone()) {
    meeting_name = captures.get(1).map(|m| m.as_str().to_string());
  }

  let meeting_name_sanitized = sanitize_filename(meeting_name.unwrap_or("Untitled".to_string()));
  match Utc.timestamp_opt(timestamp / 1000, 0) {
    LocalResult::Single(datetime_utc) => {
      let formatted_date = datetime_utc.format("%Y-%m-%d").to_string();
      return format!("{}-{}.txt", formatted_date, meeting_name_sanitized);
    }
    LocalResult::None => {
      log::debug!("Invalid timestamp");
      let current_date_formatted = Utc::now().format("%Y-%m-%d").to_string();
      return format!("{}-{}.txt", current_date_formatted, meeting_name_sanitized);
    }
    LocalResult::Ambiguous(_, _) => {
      log::debug!("Ambiguous timestamp");
      let current_date_formatted = Utc::now().format("%Y-%m-%d").to_string();
      return format!("{}-{}.txt", current_date_formatted, meeting_name_sanitized);
    }
  }
}

fn delete_transcript_file(thread_id: u64) -> Result<(), Error> {
  let transcript = match Transcript::find_by_thread_id(thread_id) {
    Ok(Some(t)) => t,
    Ok(None) => {
      return Err(Error::KSError(format!("Find no transcript")));
    }
    Err(_) => {
      return Err(Error::KSError(format!("Failed to find transcript:")));
    }
  };

  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let transcript_dir = knapsack_data_dir.join("transcripts");
  let transcript_path = transcript_dir.join(transcript.clone().filename);

  if transcript_path.exists() {
    std::fs::remove_file(&transcript_path).map_err(|e| {
      log::error!("Failed to delete transcript file: {:?}", e);
      return Error::KSError(format!("Failed to delete transcript file: {:?}", e));
    })?;
  }
  transcript.delete().map_err(|e| {
    log::error!("Failed to delete transcript record: {:?}", e);
    return Error::KSError(format!("Failed to delete transcript record: {:?}", e));
  });

  Ok(())
}

#[delete("/api/knapsack/transcript/{thread_id}")]
async fn delete_transcript(path: web::Path<u64>) -> impl Responder {
  let thread_id = path.into_inner();
  match delete_transcript_file(thread_id) {
    Ok(_) => HttpResponse::Ok().json(json!({
      "success": true,
      "message": "Transcript deleted successfully"
    })),
    Err(e) => {
      log::error!(
        "Failed to delete transcript file after saving notes: {:?}",
        e
      );
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("{:?}", e),
        "success": false
      }));
    }
  }
}

#[get("/api/knapsack/transcript/{thread_id}")]
async fn get_transcript_by_thread_id(path: web::Path<u64>) -> impl Responder {
  let thread_id = path.into_inner();
  let transcript = match Transcript::find_by_thread_id(thread_id) {
    Ok(Some(t)) => t,
    Ok(None) => {
      return actix_web::HttpResponse::BadRequest()
        .json(json!({ "error": "transcript not found", "success": false}))
    }
    Err(e) => {
      log::error!("Failed to get transcript from DB {:?}", e);
      return actix_web::HttpResponse::BadRequest()
        .json(json!({ "error": "failed to get transcript", "success": false}));
    }
  };

  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let transcripts_dir = knapsack_data_dir.join("transcripts");
  let transcript_path = transcripts_dir.join(&transcript.filename.clone());

  let content = match read_to_string(transcript_path) {
    Ok(c) => c,
    Err(e) => {
      log::error!("Failed to get transcript from disk {:?}", e);
      return actix_web::HttpResponse::BadRequest()
        .json(json!({ "error": "failed to get transcript", "success": false}));
    }
  };

  let metadata = get_metadata(thread_id).await.unwrap();

  let transcript_with_content = TranscriptWithContent {
    transcript,
    content,
    filename: metadata.filename,
    start_time: metadata.start_time,
    end_time: metadata.end_time,
    participants: metadata.participants,
    thread_id: metadata.thread_id,
  };

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": transcript_with_content
  }))
}

#[get("/api/knapsack/transcripts/list")]
pub async fn list_all_transcripts() -> impl Responder {
  let transcripts_from_db = match Transcript::find_all() {
    Ok(transcripts) => transcripts,
    Err(e) => {
      log::error!("Failed to get transcripts from DB: {:?}", e);
      return HttpResponse::InternalServerError().json(json!({
          "error": "Failed to get transcripts from database",
          "success": false
      }));
    }
  };

  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let transcripts_dir = knapsack_data_dir.join("transcripts");

  let mut transcripts = Vec::new();

  for transcript in transcripts_from_db {
    let transcript_path = transcripts_dir.join(&transcript.filename);

    let metadata = get_metadata(transcript.thread_id.unwrap()).await.unwrap();

    match std::fs::read_to_string(&transcript_path) {
      Ok(content) => {
        transcripts.push(TranscriptItem {
          filename: metadata.filename,
          content,
          thread_id: transcript.thread_id,
          start_time: metadata.start_time,
          end_time: metadata.end_time,
          participants: metadata.participants,
        });
      }
      Err(e) => {
        log::warn!(
          "Failed to read transcript file {}: {:?}",
          transcript.filename,
          e
        );
        continue;
      }
    }
  }

  HttpResponse::Ok().json(TranscriptListResponse {
    data: TranscriptData { transcripts },
  })
}

fn focus_window(window: Window) {
  window.show().expect("Failed to show window");
  window.set_focus().expect("Failed to focus window");
}

#[derive(Debug, Serialize, Clone)]
pub struct StopRecordEventPayload {
  threadId: u64,
  eventId: u64,
  saveTranscript: bool,
}

async fn fetch_meeting_end_time(event_id: u64) -> Result<Option<DateTime<Utc>>, String> {
  match CalendarEvent::find_by_id(event_id) {
    Ok(Some(event)) => match event.end {
      Some(end_timestamp) => Ok(Some(
        Utc
          .timestamp_opt(end_timestamp, 0)
          .single()
          .ok_or_else(|| "Invalid timestamp".to_string())?,
      )),
      None => Ok(None),
    },
    Ok(None) => Ok(None),
    Err(e) => Err(format!("Error fetching event: {:?}", e)),
  }
}

async fn notify_meeting_ended(app_handle: &tauri::AppHandle) -> Result<(), Error> {
  println!("Meeting ended before time!");
  let window = app_handle.get_window(WINDOW_LABEL).unwrap();
  window.emit("meeting_ended", {}).unwrap();

  Ok(())
}

async fn stream_audio(
  config: cpal::SupportedStreamConfig,
  device: &cpal::Device,
  recording_state: Arc<RecordingState>,
  app_handle: &tauri::AppHandle,
  data: StartRecordingRequest,
) -> Result<(), String> {
  log::debug!("RECORDING MIC AUDIO! -----------------------------------");
  let err_fn = move |err| {
    log::error!("an error occurred on stream: {}", err);
  };
  let mut last_save: Instant = Instant::now();
  let mut chunk_counter: u32 = 0;
  // Get the input filename
  let input_filename = recording_state
    .input_filename
    .lock()
    .unwrap()
    .clone()
    .unwrap_or_default();

  let meeting_end_time = fetch_meeting_end_time(data.event_id).await?;

  let semaphore = recording_state.input_file_semaphore.clone();
  let is_paused = recording_state.is_paused.clone();

  let input_filename_clone = input_filename.clone();

  let channel = config.channels() as usize;
  let sample_rate = config.sample_rate().0 as usize;

  let stream = match config.sample_format() {
    cpal::SampleFormat::I8 => device
      .build_input_stream(
        &config.clone().into(),
        move |data, _: &_| {
          // Check if we're getting non-zero audio data
          let has_audio = data.iter().any(|&sample| sample != 0);
          let semaphore = semaphore.clone();
          if has_audio {
            log::debug!("Receiving I8 audio data");
          } else {
            log::debug!("Receiving NULL I8 audio data");
          }
          write_audio_data::<i8, i8>(
            data,
            &mut last_save,
            &mut chunk_counter,
            &input_filename,
            channel,
            sample_rate,
            semaphore,
            &is_paused,
          );
        },
        err_fn,
        None,
      )
      .map_err(|e| e.to_string())?,
    cpal::SampleFormat::I16 => device
      .build_input_stream(
        &config.clone().into(),
        move |data, _: &_| {
          let semaphore = semaphore.clone();
          // Check if we're getting non-zero audio data
          let has_audio = data.iter().any(|&sample| sample != 0);
          if has_audio {
            log::debug!("Receiving I16 audio data");
          } else {
            log::debug!("Receiving NULL I16 audio data");
          }
          write_audio_data::<i16, i16>(
            data,
            &mut last_save,
            &mut chunk_counter,
            &input_filename,
            channel,
            sample_rate,
            semaphore,
            &is_paused,
          );
        },
        err_fn,
        None,
      )
      .map_err(|e| e.to_string())?,
    cpal::SampleFormat::I32 => device
      .build_input_stream(
        &config.clone().into(),
        move |data, _: &_| {
          let semaphore = semaphore.clone();
          // Check if we're getting non-zero audio data
          let has_audio = data.iter().any(|&sample| sample != 0);
          if has_audio {
            log::debug!("Receiving I32 audio data");
          } else {
            log::debug!("Receiving NULL I32 audio data");
          }
          write_audio_data::<i32, i32>(
            data,
            &mut last_save,
            &mut chunk_counter,
            &input_filename,
            channel,
            sample_rate,
            semaphore,
            &is_paused,
          );
        },
        err_fn,
        None,
      )
      .map_err(|e| e.to_string())?,
    cpal::SampleFormat::F32 => device
      .build_input_stream(
        &config.clone().into(),
        move |data, _: &_| {
          let semaphore = semaphore.clone();
          // Check if we're getting non-zero audio data
          let has_audio = data.iter().any(|&sample| sample != 0.0);
          if has_audio {
            log::debug!("Receiving F32 audio data");
          } else {
            log::debug!("Receiving NULL F32 audio data");
          }
          write_audio_data::<f32, f32>(
            data,
            &mut last_save,
            &mut chunk_counter,
            &input_filename,
            channel,
            sample_rate,
            semaphore,
            &is_paused,
          );
        },
        err_fn,
        None,
      )
      .map_err(|e| e.to_string())?,
    sample_format => return Err(format!("Unsupported sample format '{sample_format}'")),
  };

  stream.play();
  let start_time = Utc::now();
  let mic_users_beginning = count_microphone_users();
  let mut mic_users_after_connections = 0;

  let mut in_meeting = false;
  let mut stop_event_called = false; // void duplicate signal call
  let mut should_stop_time = Utc::now();
  let mut should_stop_flag = false;
  while recording_state.is_recording.load(Ordering::Relaxed) {
    sleep(Duration::from_millis(100)).await;
    let elapsed_time = Utc::now() - start_time;

    if !should_stop_flag && elapsed_time >= ChronoDuration::seconds(60) {
      if elapsed_time < ChronoDuration::seconds(61) {
        // after 1 minute, we should have total number of apps connected to the mic
        mic_users_after_connections = count_microphone_users();
      }
      if should_stop_recording(
        &mut in_meeting,
        mic_users_beginning,
        mic_users_after_connections,
      ) {
        should_stop_flag = true;
        should_stop_time = Utc::now();
      }
    } else if should_stop_flag && !stop_event_called {
      let should_stop: bool = should_stop_recording(
        &mut in_meeting,
        mic_users_beginning,
        mic_users_after_connections,
      );
      if !should_stop {
        should_stop_flag = false;
      } else if let Some(end_time) = meeting_end_time {
        if Utc::now() > end_time {
          handle_stop_events(&app_handle).await;
          should_stop_flag = false;
          stop_event_called = true;
        } else if (Utc::now() - should_stop_time) >= ChronoDuration::seconds(3) {
          notify_meeting_ended(&app_handle).await;
          should_stop_flag = false;
          stop_event_called = true;
        }
      } else if (Utc::now() - should_stop_time) >= ChronoDuration::seconds(3) {
        notify_meeting_ended(&app_handle).await;
        should_stop_flag = false;
        stop_event_called = true;
      }
    }
  }

  drop(stream);
  let samples = {
    let mut global_samples = GLOBAL_SAMPLES.lock().unwrap();
    global_samples.drain(..).collect::<Vec<i32>>()
  };
  let chunk_filename = format!("{}_{}.flac", input_filename_clone, chunk_counter);
  let transcript_filename = format!("{}.txt", input_filename_clone);
  let semaphore = recording_state.input_file_semaphore.clone();
  let permit = semaphore.acquire().await;
  save_chunk(samples, chunk_filename.clone(), channel, sample_rate);
  finalize_chunk(chunk_filename, transcript_filename).await;
  drop(permit);

  Ok(())
}

async fn handle_stop_events(app_handle: &tauri::AppHandle) -> Result<(), Error> {
  let window = app_handle.get_window(WINDOW_LABEL).unwrap();

  window.emit("open_feed_item", {}).unwrap();
  sleep(Duration::from_millis(100)).await;

  window.emit("stop_recording", {}).unwrap();
  sleep(Duration::from_millis(500)).await;

  focus_window(window);
  Ok(())
}

#[tauri::command]
pub async fn emit_stop_events(app_handle: tauri::AppHandle) -> Result<(), String> {
  match handle_stop_events(&app_handle).await {
    Ok(_) => Ok(()),
    Err(e) => {
      let err_msg = format!("Error in stop Recording from tauri command: {:?}", e);
      knap_log_error(err_msg.clone(), None, None);
      Err(err_msg)
    }
  }
}

fn should_stop_recording(
  in_meeting: &mut bool,
  mic_users_beginning: u64,
  mic_users_after_connections: u64,
) -> bool {
  let current_mic_users = count_microphone_users();

  let meeting_was_already_running = (mic_users_beginning == mic_users_after_connections);
  let ended_if_already_running =
    (current_mic_users < mic_users_after_connections) || (current_mic_users == 1);

  let ended_if_new_meeting =
    (current_mic_users < mic_users_after_connections) || (current_mic_users == mic_users_beginning);

  if meeting_was_already_running {
    if !*in_meeting {
      *in_meeting = true;
    }

    if ended_if_already_running {
      *in_meeting = false;
      return true;
    } else {
      return false;
    }
  } else {
    if !*in_meeting {
      *in_meeting = true;
    }

    if ended_if_new_meeting {
      *in_meeting = false;
      return true;
    } else {
      return false;
    }
  }
}

#[get("/api/knapsack/recording_status")]
async fn get_recording_status(recording_state: web::Data<RecordingState>) -> impl Responder {
  let is_recording = recording_state.is_recording.load(Ordering::Relaxed);
  let thread_id = recording_state.thread_id.lock().unwrap().clone();
  let feed_item_id = recording_state.feed_item_id.lock().unwrap().clone();
  let response = RecordStatusResponse {
    is_recording,
    thread_id,
    feed_item_id,
    success: true,
  };

  HttpResponse::Ok().json(response)
}

#[get("/api/knapsack/mic/usage")]
async fn get_mic_usage() -> impl Responder {
  let users = count_microphone_users();
  HttpResponse::Ok().json(users)
}

//TODO Error Handling
#[post("/api/knapsack/pause_recording")]
pub async fn pause_recording(recording_state: Data<RecordingState>) -> HttpResponse {
  if !recording_state.is_recording.load(Ordering::Relaxed) {
    return HttpResponse::BadRequest().body("No recording in progress");
  }

  recording_state.is_paused.store(true, Ordering::Relaxed);
  HttpResponse::Ok().body("Recording paused")
}
