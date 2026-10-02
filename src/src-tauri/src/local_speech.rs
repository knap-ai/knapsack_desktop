//! Offline recognition shared by voice chat and meeting capture. No audio leaves
//! this module. Only the owner-triggered model installer makes network requests.
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{fs, io::{Read, Write}, path::{Path, PathBuf}, sync::{Mutex, atomic::{AtomicBool, AtomicU64, Ordering}}};
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

const MODEL_BYTES: u64 = 147_951_465;
const MODEL_SHA256: &str = "60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe";
const MODEL_URL: &str = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin";
pub const SETUP_MESSAGE: &str = "Set up on-device speech in Privacy → On-device only. Download the speech model once to use voice input and meeting transcription offline. Recorded audio stays on this device.";
static DOWNLOADING: AtomicBool = AtomicBool::new(false);
static DOWNLOADED: AtomicU64 = AtomicU64::new(0);
static DOWNLOAD_ERROR: Mutex<Option<String>> = Mutex::new(None);
static CONTEXT: Mutex<Option<WhisperContext>> = Mutex::new(None);
static MODEL_INVALID: AtomicBool = AtomicBool::new(false);

fn model_path() -> Result<PathBuf, String> {
  #[cfg(test)]
  if let Ok(path) = std::env::var("KNAPSACK_LOCAL_SPEECH_TEST_MODEL") { return Ok(PathBuf::from(path)); }
  dirs::home_dir().map(|p| p.join(".knapsack/models/speech/ggml-base.bin"))
    .ok_or_else(|| "Could not locate your speech model folder".into())
}
pub fn ready() -> bool {
  !MODEL_INVALID.load(Ordering::Relaxed) && model_path().ok().and_then(|p| fs::metadata(p).ok()).is_some_and(|m| m.len() == MODEL_BYTES)
}
#[derive(Serialize)]
pub struct SpeechStatus { ready: bool, downloading: bool, downloaded: u64, total: u64, error: Option<String> }
#[tauri::command]
pub fn local_speech_status() -> SpeechStatus {
  let downloading = DOWNLOADING.load(Ordering::Relaxed);
  let downloaded = if downloading { DOWNLOADED.load(Ordering::Relaxed) } else {
    model_path().ok().and_then(|p| fs::metadata(p.with_extension("download")).ok()).map(|m| m.len().min(MODEL_BYTES)).unwrap_or(0)
  };
  SpeechStatus { ready: ready(), downloading, downloaded, total: MODEL_BYTES, error: DOWNLOAD_ERROR.lock().unwrap().clone() }
}
fn verify_model(path: &Path) -> Result<(), String> {
  let mut file = fs::File::open(path).map_err(|e| e.to_string())?;
  let mut hash = Sha256::new();
  let mut buffer = [0u8; 65536];
  loop { let n = file.read(&mut buffer).map_err(|e| e.to_string())?; if n == 0 { break; } hash.update(&buffer[..n]); }
  if format!("{:x}", hash.finalize()) != MODEL_SHA256 { return Err("Speech model is incomplete or damaged. Download it again in Privacy → On-device only.".into()); }
  Ok(())
}
#[tauri::command]
pub async fn install_local_speech() -> Result<(), String> {
  if DOWNLOADING.compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire).is_err() { return Err("Speech model download is already running".into()); }
  struct Reset;
  impl Drop for Reset { fn drop(&mut self) { DOWNLOADING.store(false, Ordering::Release); } }
  let _reset = Reset;
  DOWNLOADED.store(0, Ordering::Relaxed);
  *DOWNLOAD_ERROR.lock().unwrap() = None;
  let result = download_model().await;
  if let Err(error) = &result { *DOWNLOAD_ERROR.lock().unwrap() = Some(error.clone()); }
  result
}
async fn download_model() -> Result<(), String> {
  let path = model_path()?;
  if ready() && verify_model(&path).is_ok() { return Ok(()); }
  fs::create_dir_all(path.parent().unwrap()).map_err(|e| e.to_string())?;
  let partial = path.with_extension("download");
  let mut offset = fs::metadata(&partial).map(|m| m.len()).unwrap_or(0);
  if offset > MODEL_BYTES || (offset == MODEL_BYTES && verify_model(&partial).is_err()) {
    fs::remove_file(&partial).map_err(|e| e.to_string())?;
    offset = 0;
  }
  DOWNLOADED.store(offset, Ordering::Relaxed);
  if offset < MODEL_BYTES {
    let client = reqwest::Client::builder().connect_timeout(std::time::Duration::from_secs(15))
      .timeout(std::time::Duration::from_secs(3600)).build().map_err(|e| e.to_string())?;
    let mut request = client.get(MODEL_URL);
    if offset > 0 { request = request.header(reqwest::header::RANGE, format!("bytes={offset}-")); }
    let mut response = request.send().await.map_err(|_| "Could not download the speech model. Check your connection and try again; downloaded progress is saved.".to_string())?
      .error_for_status().map_err(|_| "Speech model download is temporarily unavailable. Try again; downloaded progress is saved.".to_string())?;
    if response.status() == reqwest::StatusCode::PARTIAL_CONTENT {
      let range = response.headers().get(reqwest::header::CONTENT_RANGE).and_then(|h| h.to_str().ok()).unwrap_or("");
      if !valid_model_range(range, offset) { return Err("The model server returned an unexpected download range. Try again.".into()); }
    } else {
      // A server may ignore Range. Replace the partial file instead of
      // appending a second model; final SHA256 validation remains mandatory.
      offset = 0;
    }
    let mut file = fs::OpenOptions::new().create(true).write(true).truncate(offset == 0).append(offset > 0).open(&partial).map_err(|e| e.to_string())?;
    let mut bytes = offset;
    while let Some(chunk) = response.chunk().await.map_err(|_| "Download interrupted. Try again to resume from saved progress.".to_string())? {
      bytes += chunk.len() as u64;
      if bytes > MODEL_BYTES { return Err("Unexpected speech model download size".into()); }
      file.write_all(&chunk).map_err(|e| e.to_string())?;
      DOWNLOADED.store(bytes, Ordering::Relaxed);
    }
    file.sync_all().map_err(|e| e.to_string())?;
  }
  if let Err(error) = verify_model(&partial) {
    // An incomplete download can resume; a full-sized corrupt one must restart.
    if fs::metadata(&partial).map(|m| m.len() == MODEL_BYTES).unwrap_or(false) { let _ = fs::remove_file(&partial); }
    return Err(error);
  }
  // Windows cannot rename over an existing corrupt file.
  if path.exists() { fs::remove_file(&path).map_err(|e| e.to_string())?; }
  fs::rename(&partial, &path).map_err(|e| e.to_string())?;
  *CONTEXT.lock().unwrap() = None;
  MODEL_INVALID.store(false, Ordering::Relaxed);
  Ok(())
}
fn valid_model_range(value: &str, offset: u64) -> bool {
  let Some((interval, total)) = value.strip_prefix("bytes ").and_then(|v| v.split_once('/')) else { return false; };
  let Some((start, end)) = interval.split_once('-') else { return false; };
  start.parse::<u64>().ok() == Some(offset)
    && total.parse::<u64>().ok() == Some(MODEL_BYTES)
    && end.parse::<u64>().ok().is_some_and(|end| end >= offset && end < MODEL_BYTES)
}

#[derive(Serialize)]
pub struct SpeechResult { pub text: String, pub timestamped: String }
fn recognize(samples: &[f32]) -> Result<SpeechResult, String> {
  if samples.is_empty() || samples.len() > 16000 * 180 || samples.iter().any(|v| !v.is_finite()) { return Err("Record between one second and three minutes of audio at a time.".into()); }
  if !ready() { return Err(SETUP_MESSAGE.into()); }
  // Whisper hallucinates on silence; skip chunks with no meaningful signal.
  let rms = (samples.iter().map(|v| (*v as f64).powi(2)).sum::<f64>() / samples.len() as f64).sqrt();
  if rms < 0.0005 { return Ok(SpeechResult { text: String::new(), timestamped: String::new() }); }
  let mut context = CONTEXT.lock().map_err(|_| "Speech recognition needs an app restart")?;
  if context.is_none() {
    let path = model_path()?;
    if let Err(error) = verify_model(&path) {
      MODEL_INVALID.store(true, Ordering::Relaxed);
      *DOWNLOAD_ERROR.lock().unwrap() = Some(error.clone());
      return Err(error);
    }
    *context = Some(WhisperContext::new_with_params(path.to_str().ok_or("Invalid model path")?, WhisperContextParameters::default()).map_err(|e| format!("Could not load speech model: {e}"))?);
  }
  let mut state = context.as_ref().unwrap().create_state().map_err(|e| e.to_string())?;
  let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
  params.set_n_threads(std::thread::available_parallelism().map(|n| n.get().min(4)).unwrap_or(2) as i32);
  params.set_language(None);
  params.set_translate(false);
  params.set_no_context(true);
  params.set_print_special(false); params.set_print_progress(false); params.set_print_realtime(false); params.set_print_timestamps(false);
  state.full(params, samples).map_err(|e| format!("On-device transcription failed: {e}"))?;
  let mut text = Vec::new(); let mut timestamped = Vec::new();
  for segment in state.as_iter() {
    let value = segment.to_string();
    if value.trim().is_empty() { continue; }
    timestamped.push(format!("[{:.2} - {:.2}]: {}", segment.start_timestamp() as f64 / 100., segment.end_timestamp() as f64 / 100., value.trim()));
    text.push(value.trim().to_string());
  }
  Ok(SpeechResult { text: text.join(" "), timestamped: timestamped.join("\n") })
}
#[tauri::command]
pub async fn transcribe_local_voice(samples: Vec<f32>) -> Result<SpeechResult, String> {
  // PCM only: no arbitrary paths or URLs are accepted from the renderer.
  tokio::task::spawn_blocking(move || recognize(&samples)).await.map_err(|e| e.to_string())?
}
fn mono_16k(samples: &[i32], channels: usize, rate: u32, bits: u32) -> Result<Vec<f32>, String> {
  if channels == 0 || rate == 0 || bits == 0 || bits > 32 || samples.len() % channels != 0 { return Err("Unsupported audio format".into()); }
  let scale = 2f32.powi(bits as i32 - 1);
  let mono: Vec<f32> = samples.chunks_exact(channels).map(|frame| frame.iter().map(|v| *v as f32 / scale).sum::<f32>() / channels as f32).collect();
  if mono.is_empty() { return Ok(vec![]); }
  let len = mono.len() * 16000 / rate as usize;
  Ok((0..len).map(|i| { let pos = i as f64 * rate as f64 / 16000.; let left = pos as usize; let fraction = (pos - left as f64) as f32; mono[left.min(mono.len()-1)] * (1.-fraction) + mono[(left+1).min(mono.len()-1)] * fraction }).collect())
}
pub async fn transcribe_meeting(path: PathBuf) -> Result<String, String> {
  tokio::task::spawn_blocking(move || {
    if fs::metadata(&path).map_err(|e| e.to_string())?.len() > 32 * 1024 * 1024 { return Err("Audio chunk is too large for local transcription".into()); }
    let mut reader = claxon::FlacReader::open(path).map_err(|e| e.to_string())?;
    let info = reader.streaminfo();
    let limit = info.sample_rate as usize * info.channels as usize * 180;
    let samples = reader.samples().take(limit + 1).collect::<Result<Vec<i32>, _>>().map_err(|e| e.to_string())?;
    if samples.len() > limit { return Err("Audio chunk exceeds three minutes".into()); }
    let pcm = mono_16k(&samples, info.channels as usize, info.sample_rate, info.bits_per_sample)?;
    if pcm.is_empty() { return Ok(String::new()); }
    recognize(&pcm).map(|result| result.timestamped)
  }).await.map_err(|e| e.to_string())?
}
#[cfg(test)]
mod tests {
  use super::*;
  #[tokio::test]
  #[ignore = "Requires the downloaded speech model and public JFK audio fixture"]
  async fn real_offline_voice_and_meeting_transcription() {
    let fixture = std::env::var("KNAPSACK_LOCAL_SPEECH_TEST_WAV").expect("speech fixture path");
    let mut wav = hound::WavReader::open(fixture).unwrap();
    let spec = wav.spec();
    let raw = wav.samples::<i16>().map(|s| s.unwrap() as i32).collect::<Vec<_>>();
    let pcm = mono_16k(&raw, spec.channels as usize, spec.sample_rate, 16).unwrap();
    let voice = transcribe_local_voice(pcm).await.unwrap();
    assert!(voice.text.to_lowercase().contains("country"), "Expected spoken words from public fixture");
    assert!(voice.text.to_lowercase().contains("ask"));
    use flacenc::{bitsink::ByteSink, component::BitRepr, error::Verify};
    let config = flacenc::config::Encoder::default().into_verified().unwrap();
    let source = flacenc::source::MemSource::from_samples(&raw, spec.channels as usize, 16, spec.sample_rate as usize);
    let stream = flacenc::encode_with_fixed_block_size(&config, source, config.block_size).unwrap();
    let mut sink = ByteSink::new(); stream.write(&mut sink).unwrap();
    let temp = tempfile::NamedTempFile::new().unwrap();
    fs::write(temp.path(), sink.as_slice()).unwrap();
    let meeting = transcribe_meeting(temp.path().to_path_buf()).await.unwrap();
    assert!(meeting.to_lowercase().contains("country"));
    assert!(meeting.starts_with('['));
  }
  #[test] fn model_resume_requires_matching_range_and_total() {
    assert!(valid_model_range("bytes 100-147951464/147951465", 100));
    assert!(!valid_model_range("bytes 0-147951464/147951465", 100));
    assert!(!valid_model_range("bytes 100-200/999", 100));
    assert!(!valid_model_range("bytes */147951465", 100));
    assert!(!valid_model_range("bytes 100-99/147951465", 100));
  }
  #[test] fn stereo_downmix_and_resample() {
    let pcm = mono_16k(&[32767, -32767, 16384, 16384], 2, 16000, 16).unwrap();
    assert_eq!(pcm, vec![0., 0.5]);
    assert_eq!(mono_16k(&[100; 480], 1, 48000, 16).unwrap().len(), 160);
    assert!(mono_16k(&[], 1, 48000, 16).unwrap().is_empty());
    assert!(mono_16k(&[1], 2, 48000, 16).is_err());
  }
  #[test] fn corrupt_model_is_rejected() {
    let temp = tempfile::NamedTempFile::new().unwrap();
    fs::write(temp.path(), b"bad model").unwrap();
    assert!(verify_model(temp.path()).is_err());
  }
  #[test] fn invalid_voice_input_is_rejected_before_loading() {
    assert!(recognize(&[]).is_err()); assert!(recognize(&[f32::NAN]).is_err());
  }
}
