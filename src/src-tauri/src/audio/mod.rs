pub mod audio;
pub mod utils;
pub mod permission;
pub mod encode;
pub mod transcribe;
pub mod microphone;

#[cfg(target_os = "macos")]
pub mod macos;

 #[cfg(target_os = "windows")]
pub mod windows;
