use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

// ── Config helpers ────────────────────────────────────────────────────────────

/// Default brain repo root: ~/gbrain
pub fn default_brain_root() -> PathBuf {
  dirs::home_dir()
    .unwrap_or_else(|| PathBuf::from("."))
    .join("gbrain")
}

/// Resolve brain root: use provided path if non-empty, else default.
fn resolve_root(brain_root: &str) -> PathBuf {
  let p = brain_root.trim();
  if p.is_empty() {
    default_brain_root()
  } else {
    PathBuf::from(p)
  }
}

/// Ensure a path stays inside the brain root (prevent directory traversal).
fn safe_join(root: &Path, rel: &str) -> Option<PathBuf> {
  let candidate = root.join(rel.trim_start_matches('/'));
  // Canonicalize fails if path doesn't exist yet, so check the normalised form manually.
  let mut parts = Vec::new();
  for component in candidate.components() {
    use std::path::Component::*;
    match component {
      CurDir => {}
      ParentDir => {
        parts.pop();
      }
      c => parts.push(c),
    }
  }
  let resolved: PathBuf = parts.iter().collect();
  if resolved.starts_with(root) {
    Some(resolved)
  } else {
    None
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrainEntry {
  pub name: String,
  pub rel_path: String,
  pub is_dir: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GBrainConfig {
  pub brain_root: String,
}

// ── Tauri commands ────────────────────────────────────────────────────────────

/// List the immediate children of `sub_path` (relative to `brain_root`).
/// Pass `sub_path = ""` to list the root.
#[tauri::command]
pub fn kn_brain_list(brain_root: String, sub_path: String) -> Result<Vec<BrainEntry>, String> {
  let root = resolve_root(&brain_root);
  let dir = if sub_path.trim().is_empty() {
    root.clone()
  } else {
    safe_join(&root, &sub_path).ok_or("Invalid path")?
  };

  if !dir.exists() {
    // Auto-create the root brain directory on first use so the UI starts clean.
    if sub_path.trim().is_empty() {
      std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Cannot create brain directory {}: {}", dir.display(), e))?;
    } else {
      return Err(format!("Brain directory not found: {}", dir.display()));
    }
  }

  let mut entries: Vec<BrainEntry> = std::fs::read_dir(&dir)
    .map_err(|e| format!("Cannot read directory: {}", e))?
    .filter_map(|r| r.ok())
    .filter_map(|entry| {
      let name = entry.file_name().to_string_lossy().to_string();
      // Skip hidden files and git internals
      if name.starts_with('.') {
        return None;
      }
      let ft = entry.file_type().ok()?;
      let is_dir = ft.is_dir();
      // Only show markdown files (and directories)
      if !is_dir && !name.ends_with(".md") {
        return None;
      }
      let rel = entry
        .path()
        .strip_prefix(&root)
        .ok()?
        .to_string_lossy()
        .to_string();
      Some(BrainEntry {
        name,
        rel_path: rel,
        is_dir,
      })
    })
    .collect();

  entries.sort_by(|a, b| {
    b.is_dir
      .cmp(&a.is_dir)
      .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
  });

  Ok(entries)
}

/// Read the contents of a brain page (markdown file) by its relative path.
#[tauri::command]
pub fn kn_brain_read_page(brain_root: String, rel_path: String) -> Result<String, String> {
  let root = resolve_root(&brain_root);
  let path = safe_join(&root, &rel_path).ok_or("Invalid path")?;
  if path.is_dir() {
    return Err("Path is a directory, not a file".to_string());
  }
  std::fs::read_to_string(&path).map_err(|e| format!("Cannot read {}: {}", path.display(), e))
}

/// Write (create or overwrite) a brain page by its relative path.
#[tauri::command]
pub fn kn_brain_write_page(
  brain_root: String,
  rel_path: String,
  content: String,
) -> Result<(), String> {
  let root = resolve_root(&brain_root);
  let path = safe_join(&root, &rel_path).ok_or("Invalid path")?;
  if let Some(parent) = path.parent() {
    std::fs::create_dir_all(parent).map_err(|e| format!("Cannot create parent dirs: {}", e))?;
  }
  std::fs::write(&path, content).map_err(|e| format!("Cannot write {}: {}", path.display(), e))
}

/// Return the default brain root path so the frontend can pre-populate settings.
#[tauri::command]
pub fn kn_brain_default_root() -> String {
  default_brain_root().to_string_lossy().to_string()
}
