use serde::{Deserialize, Serialize};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;
use walkdir::WalkDir;

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
  pub title: Option<String>,
  pub rel_path: String,
  pub is_dir: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GBrainConfig {
  pub brain_root: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrainSearchResult {
  pub title: String,
  pub rel_path: String,
  pub snippet: String,
  pub score: i64,
  pub modified_at: u64,
}

fn humanize_name(name: &str) -> String {
  name
    .trim_end_matches(".md")
    .replace(['-', '_'], " ")
    .trim()
    .to_string()
}

pub fn markdown_title(content: &str, fallback: &str) -> String {
  for line in content.lines() {
    let trimmed = line.trim();
    if trimmed.is_empty() {
      continue;
    }

    let candidate = trimmed
      .trim_start_matches('#')
      .trim_start_matches('-')
      .trim_start_matches('*')
      .trim();

    if !candidate.is_empty() {
      return candidate.to_string();
    }
  }

  humanize_name(fallback)
}

fn page_title(content: &str, path: &Path) -> String {
  let mut in_frontmatter = content.starts_with("---");
  for (index, line) in content.lines().enumerate() {
    if in_frontmatter {
      if let Some(title) = line.strip_prefix("title:") {
        let clean = title.trim().trim_matches('"').trim_matches('\'');
        if !clean.is_empty() {
          return clean.to_string();
        }
      }
      if index > 0 && line == "---" {
        in_frontmatter = false;
      }
      continue;
    }
    if let Some(title) = line.strip_prefix("# ") {
      if !title.trim().is_empty() {
        return title.trim().to_string();
      }
    }
  }
  humanize_name(
    &path
      .file_stem()
      .unwrap_or_default()
      .to_string_lossy(),
  )
}

fn page_snippet(content: &str, terms: &[String]) -> String {
  let clean_lines: Vec<&str> = content
    .lines()
    .filter(|line| {
      let trimmed = line.trim();
      !trimmed.is_empty()
        && trimmed != "---"
        && !trimmed.starts_with('#')
        && !trimmed.starts_with("title:")
        && !trimmed.starts_with("type:")
        && !trimmed.starts_with("captured_at:")
        && !trimmed.starts_with("source:")
    })
    .collect();
  let chosen = clean_lines
    .iter()
    .find(|line| {
      let lower = line.to_lowercase();
      terms.iter().any(|term| lower.contains(term))
    })
    .copied()
    .or_else(|| clean_lines.first().copied())
    .unwrap_or("");
  let single_line = chosen.split_whitespace().collect::<Vec<_>>().join(" ");
  single_line.chars().take(220).collect()
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
      let title = if is_dir {
        Some(humanize_name(&name))
      } else {
        std::fs::read_to_string(entry.path())
          .ok()
          .map(|content| markdown_title(&content, &name))
          .or_else(|| Some(humanize_name(&name)))
      };
      Some(BrainEntry {
        name,
        title,
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

/// Search local markdown brain pages. This deliberately works without an agent
/// or database so a cold/offline brain can still ground later synthesis.
#[tauri::command]
pub fn kn_brain_search(
  brain_root: String,
  query: String,
  limit: usize,
) -> Result<Vec<BrainSearchResult>, String> {
  let root = resolve_root(&brain_root);
  if !root.exists() {
    std::fs::create_dir_all(&root)
      .map_err(|e| format!("Cannot create brain directory {}: {}", root.display(), e))?;
  }

  let terms: Vec<String> = query
    .to_lowercase()
    .split(|c: char| !c.is_alphanumeric())
    .filter(|term| term.len() > 1)
    .map(str::to_string)
    .collect();
  let phrase = query.trim().to_lowercase();
  let mut results = Vec::new();

  for entry in WalkDir::new(&root)
    .follow_links(false)
    .into_iter()
    .filter_map(Result::ok)
    .take(10_000)
  {
    let path = entry.path();
    let rel_path = match path.strip_prefix(&root) {
      Ok(relative) => relative,
      Err(_) => continue,
    };
    if !entry.file_type().is_file()
      || path.extension().and_then(|ext| ext.to_str()) != Some("md")
      || rel_path
        .components()
        .any(|part| part.as_os_str().to_string_lossy().starts_with('.'))
    {
      continue;
    }

    let mut file = match std::fs::File::open(path) {
      Ok(file) => file,
      Err(_) => continue,
    };
    let mut content = String::new();
    if file
      .by_ref()
      .take(512 * 1024)
      .read_to_string(&mut content)
      .is_err()
    {
      continue;
    }
    let title = page_title(&content, path);
    let rel_path = rel_path.to_string_lossy().to_string();
    let title_lower = title.to_lowercase();
    let path_lower = rel_path.to_lowercase();
    let content_lower = content.to_lowercase();
    let mut score = 0i64;
    for term in &terms {
      if title_lower.contains(term) {
        score += 12;
      }
      if path_lower.contains(term) {
        score += 6;
      }
      score += content_lower.matches(term).count().min(8) as i64;
    }
    if !phrase.is_empty() && content_lower.contains(&phrase) {
      score += 20;
    }
    if !terms.is_empty() && score == 0 {
      continue;
    }

    let modified_at = entry
      .metadata()
      .ok()
      .and_then(|metadata| metadata.modified().ok())
      .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
      .map(|duration| duration.as_secs())
      .unwrap_or(0);
    results.push(BrainSearchResult {
      title,
      rel_path,
      snippet: page_snippet(&content, &terms),
      score,
      modified_at,
    });
  }

  results.sort_by(|a, b| {
    b.score
      .cmp(&a.score)
      .then_with(|| b.modified_at.cmp(&a.modified_at))
      .then_with(|| a.rel_path.cmp(&b.rel_path))
  });
  results.truncate(limit.clamp(1, 50));
  Ok(results)
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
