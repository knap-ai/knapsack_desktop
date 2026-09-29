pub mod audio;
pub mod encode;
pub mod mic_monitor;
pub mod microphone;
pub mod permission;
pub mod transcribe;
pub mod utils;

#[cfg(target_os = "macos")]
pub mod macos;

#[cfg(target_os = "windows")]
pub mod windows;

#[cfg(target_os = "linux")]
pub mod linux;

pub mod devices;

/// Keep meeting chat and insights current while recording, on every platform.
pub const TRANSCRIPTION_CHUNK_INTERVAL: std::time::Duration = std::time::Duration::from_secs(30);
