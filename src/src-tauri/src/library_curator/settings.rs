//! Persistent on-disk settings for the library curator.
//!
//! Stored as a single JSON file at `~/.knapsack/library_curator.json` so we
//! don't need a new SQLite table or migration. The file is read on every
//! `load()` call (which happens at most once per pass) so settings changes
//! take effect on the next pass without an app restart.

use std::path::PathBuf;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CuratorSettings {
  /// Master toggle. If false, no curation happens at all.
  pub enabled: bool,
  /// Per-source toggles. Defaults: everything except local files is on.
  pub sources_email: bool,
  pub sources_calendar: bool,
  pub sources_drive: bool,
  pub sources_local_files: bool,
  /// Stamped after every successful pass so the UI can show a "last
  /// curated 5m ago" hint.
  pub last_run_at: Option<i64>,
}

impl Default for CuratorSettings {
  fn default() -> Self {
    CuratorSettings {
      enabled: true,
      sources_email: true,
      sources_calendar: true,
      sources_drive: true,
      // Local files require an explicit opt-in (see plan §"Local files: opt-in only").
      sources_local_files: false,
      last_run_at: None,
    }
  }
}

impl CuratorSettings {
  fn settings_path() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    let dir = home.join(".knapsack");
    if !dir.exists() {
      let _ = std::fs::create_dir_all(&dir);
    }
    Some(dir.join("library_curator.json"))
  }

  /// Load settings from disk. Falls back to defaults on any error so the
  /// curator never crashes due to malformed config.
  pub fn load() -> Self {
    let Some(path) = Self::settings_path() else {
      return Self::default();
    };
    let Ok(text) = std::fs::read_to_string(&path) else {
      return Self::default();
    };
    serde_json::from_str(&text).unwrap_or_default()
  }

  pub fn save(&self) -> std::io::Result<()> {
    let Some(path) = Self::settings_path() else {
      return Ok(());
    };
    let json = serde_json::to_string_pretty(self).unwrap_or_default();
    std::fs::write(path, json)
  }

  pub fn mark_run_now(&mut self) {
    self.last_run_at = Some(
      std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0),
    );
    let _ = self.save();
  }
}
