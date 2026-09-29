//! Local audio preferences and a bounded signal test. Tests never save or upload audio.
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use serde::{Deserialize, Serialize};
use tauri::Manager;
use std::sync::{Arc, Mutex};
use std::time::Duration;

#[derive(Default, Serialize, Deserialize)]
pub struct AudioPreferences {
  pub microphone: Option<String>,
}
fn preferences_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
  app.path_resolver().app_config_dir().map(|p| p.join("audio.json"))
    .ok_or_else(|| "Audio settings folder is unavailable".into())
}
pub fn preferences(app: &tauri::AppHandle) -> Result<AudioPreferences, String> {
  match std::fs::read(preferences_path(app)?) {
    Ok(bytes) => serde_json::from_slice(&bytes).map_err(|e| e.to_string()),
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(AudioPreferences::default()),
    Err(e) => Err(e.to_string()),
  }
}
pub fn input_device(name: Option<&str>) -> Result<cpal::Device, String> {
  let host = cpal::default_host();
  match name {
    Some(name) => host.input_devices().map_err(|e| e.to_string())?
      .find(|d| d.name().ok().as_deref() == Some(name))
      .ok_or_else(|| format!("Microphone '{}' is disconnected. Choose an available microphone in Settings → Audio.", name)),
    None => host.default_input_device().ok_or_else(|| "No microphone is connected. Choose an input in Settings → Audio.".into()),
  }
}
#[tauri::command]
pub fn audio_devices(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
  let host = cpal::default_host();
  let inputs: Vec<_> = host.input_devices().map_err(|e| e.to_string())?.filter_map(|d| d.name().ok()).collect();
  let outputs: Vec<_> = host.output_devices().map_err(|e| e.to_string())?.filter_map(|d| d.name().ok()).collect();
  Ok(serde_json::json!({
    "microphone": preferences(&app)?.microphone,
    "inputs": inputs, "outputs": outputs,
    "defaultInput": host.default_input_device().and_then(|d| d.name().ok()),
    "defaultOutput": host.default_output_device().and_then(|d| d.name().ok()),
    "canSelectSpeaker": cfg!(target_os = "macos"),
    "transcriptionError": super::transcribe::transcription_readiness_error(),
  }))
}
#[tauri::command]
pub fn set_audio_microphone(app: tauri::AppHandle, microphone: Option<String>) -> Result<(), String> {
  input_device(microphone.as_deref())?.default_input_config().map_err(|e| e.to_string())?;
  let path = preferences_path(&app)?;
  std::fs::create_dir_all(path.parent().unwrap()).map_err(|e| e.to_string())?;
  let temp = path.with_extension("json.tmp");
  std::fs::write(&temp, serde_json::to_vec(&AudioPreferences { microphone }).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
  std::fs::rename(temp, path).map_err(|e| e.to_string())
}
#[tauri::command]
pub fn set_audio_speaker(name: String) -> Result<(), String> {
  #[cfg(target_os = "macos")]
  {
    if !cpal::default_host().output_devices().map_err(|e| e.to_string())?.any(|d| d.name().ok().as_deref() == Some(&name)) {
      return Err("Speaker is disconnected. Refresh the device list.".into());
    }
    super::macos::set_default_speaker(&name)
  }
  #[cfg(not(target_os = "macos"))]
  { let _ = name; Err("Change speakers in your system Sound settings.".into()) }
}
#[derive(Default)]
struct Signal { peak: f32, samples: usize, error: Option<String> }
fn measure<T>(device: &cpal::Device, config: cpal::StreamConfig) -> Result<f32, String>
where T: cpal::SizedSample, f32: cpal::FromSample<T> {
  let signal = Arc::new(Mutex::new(Signal::default()));
  let data_signal = signal.clone();
  let error_signal = signal.clone();
  let stream = device.build_input_stream(&config, move |data: &[T], _| {
    let mut s = data_signal.lock().unwrap();
    s.samples += data.len();
    for &sample in data { s.peak = s.peak.max(sample.to_sample::<f32>().abs()); }
  }, move |e| { error_signal.lock().unwrap().error = Some(e.to_string()); }, None).map_err(|e| e.to_string())?;
  stream.play().map_err(|e| e.to_string())?;
  std::thread::sleep(Duration::from_secs(3));
  drop(stream);
  let s = signal.lock().unwrap();
  if let Some(error) = &s.error { return Err(error.clone()); }
  if s.samples == 0 { return Err("No microphone samples received. Check microphone permission and reconnect the device.".into()); }
  Ok(s.peak)
}
#[tauri::command]
pub async fn test_audio_microphone(app: tauri::AppHandle) -> Result<f32, String> {
  let name = preferences(&app)?.microphone;
  tauri::async_runtime::spawn_blocking(move || {
    let _guard = super::audio::RECORDING_LIFECYCLE_LOCK.lock().map_err(|e| e.to_string())?;
    let state = app.state::<crate::RecordingState>();
    if state.is_recording.load(std::sync::atomic::Ordering::Relaxed) || state.is_stopping.load(std::sync::atomic::Ordering::Relaxed) {
      return Err("Stop the current recording before testing a microphone.".into());
    }
    let device = input_device(name.as_deref())?;
    let config = device.default_input_config().map_err(|e| e.to_string())?;
    match config.sample_format() {
      cpal::SampleFormat::F32 => measure::<f32>(&device, config.into()),
      cpal::SampleFormat::I8 => measure::<i8>(&device, config.into()),
      cpal::SampleFormat::I16 => measure::<i16>(&device, config.into()),
      cpal::SampleFormat::I32 => measure::<i32>(&device, config.into()),
      format => Err(format!("Unsupported microphone format: {}", format)),
    }
  }).await.map_err(|e| e.to_string())?
}

lazy_static! { static ref MICROPHONE_CLOCK: std::time::Instant = std::time::Instant::now(); }
static MICROPHONE_UPDATED: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
static MICROPHONE_LEVEL: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(0);
pub fn update_microphone_level(samples: &[i32]) {
  let level = if samples.is_empty() { 0.0 } else {
    (samples.iter().map(|s| (*s as f64 / 32768.0).powi(2)).sum::<f64>() / samples.len() as f64).sqrt() as f32
  };
  MICROPHONE_UPDATED.store(MICROPHONE_CLOCK.elapsed().as_millis() as u64, std::sync::atomic::Ordering::Relaxed);
  MICROPHONE_LEVEL.store(level.to_bits(), std::sync::atomic::Ordering::Relaxed);
}
pub fn microphone_level() -> f32 {
  if (MICROPHONE_CLOCK.elapsed().as_millis() as u64).saturating_sub(MICROPHONE_UPDATED.load(std::sync::atomic::Ordering::Relaxed)) > 2000 { return 0.0; }
  f32::from_bits(MICROPHONE_LEVEL.load(std::sync::atomic::Ordering::Relaxed))
}
#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn microphone_level_distinguishes_silence_from_signal_and_resets() {
    update_microphone_level(&[0, 0]);
    assert_eq!(microphone_level(), 0.0);
    update_microphone_level(&[16384, -16384]);
    assert!((microphone_level() - 0.5).abs() < 0.001);
    update_microphone_level(&[]);
    assert_eq!(microphone_level(), 0.0);
  }
}
