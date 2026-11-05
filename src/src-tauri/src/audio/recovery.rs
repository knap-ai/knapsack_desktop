//! Durable receipts for new capture sessions. Never discovers or adopts old audio.
use crate::error::Error;
use serde::{Deserialize, Serialize};
use std::{
  collections::{BTreeMap, HashSet},
  fs,
  path::{Path, PathBuf},
  sync::{Mutex, MutexGuard},
};

static JOURNAL_LOCK: Mutex<()> = Mutex::new(());
lazy_static! {
  static ref LIVE_CAPTURES: Mutex<HashSet<String>> = Mutex::new(HashSet::new());
}
pub fn lifecycle_guard() -> MutexGuard<'static, ()> {
  JOURNAL_LOCK.lock().unwrap()
}
pub struct CaptureAdmission {
  input: String,
  committed: bool,
}
impl CaptureAdmission {
  pub fn commit(&mut self) {
    self.committed = true;
  }
}
impl Drop for CaptureAdmission {
  fn drop(&mut self) {
    if !self.committed {
      LIVE_CAPTURES.lock().unwrap().remove(&self.input);
    }
  }
}
pub fn is_live_thread(thread: u64) -> bool {
  LIVE_CAPTURES
    .lock()
    .unwrap()
    .iter()
    .any(|input| input.starts_with(&format!("{}_input_", thread)))
}

#[derive(Default, Serialize, Deserialize)]
struct Chunk {
  text: Option<String>,
}
#[derive(Serialize, Deserialize)]
struct Capture {
  owner: String,
  thread_id: u64,
  input: String,
  output: String,
  target: String,
  base: String,
  projected: String,
  stopped: bool,
  chunks: BTreeMap<String, Chunk>,
}
#[derive(Serialize, Deserialize)]
struct Projection {
  owner: String,
  target: String,
  base: String,
  projected: String,
  #[serde(default)]
  pending_desired: Option<String>,
  captures: Vec<String>,
}
fn projection_path(root: &Path, thread: u64) -> PathBuf {
  root
    .join("transcription-queue-v1")
    .join(format!("{}_projection.json", thread))
}
fn is_capture_path(path: &Path) -> bool {
  path.extension().and_then(|s| s.to_str()) == Some("json")
    && path
      .file_stem()
      .and_then(|s| s.to_str())
      .and_then(|s| input_for_chunk(&format!("{}_0.flac", s)).map(|input| input == s))
      .unwrap_or(false)
}
fn root() -> Result<PathBuf, Error> {
  Ok(
    dirs::home_dir()
      .ok_or_else(|| Error::KSError("Home unavailable".into()))?
      .join(".knapsack"),
  )
}
fn journal(root: &Path, input: &str) -> PathBuf {
  root
    .join("transcription-queue-v1")
    .join(format!("{}.json", input))
}
fn read(path: &Path) -> Result<String, Error> {
  match fs::read_to_string(path) {
    Ok(s) => Ok(s),
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(String::new()),
    Err(e) => Err(e.into()),
  }
}
fn atomic(path: &Path, text: &str) -> Result<(), Error> {
  let parent = path
    .parent()
    .ok_or_else(|| Error::KSError("Invalid journal path".into()))?;
  let mut missing = Vec::new();
  let mut ancestor = parent;
  while !ancestor.exists() {
    missing.push(ancestor.to_path_buf());
    ancestor = ancestor
      .parent()
      .ok_or_else(|| Error::KSError("Invalid journal directory".into()))?;
  }
  fs::create_dir_all(parent)?;
  #[cfg(not(target_os = "windows"))]
  for directory in missing.iter().rev() {
    if let Some(parent) = directory.parent() {
      super::audio::sync_recording_directory(parent)?;
    }
  }
  let temp = path.with_extension("tmp");
  {
    use std::io::Write;
    let mut options = fs::OpenOptions::new();
    options.write(true).create(true).truncate(true);
    #[cfg(unix)]
    {
      use std::os::unix::fs::OpenOptionsExt;
      options.mode(0o600);
    }
    let mut f = options.open(&temp)?;
    f.write_all(text.as_bytes())?;
    f.sync_all()?;
  }
  #[cfg(not(target_os = "windows"))]
  {
    fs::rename(&temp, path)?;
    super::audio::sync_recording_directory(parent)?;
  }
  #[cfg(target_os = "windows")]
  {
    use std::os::windows::ffi::OsStrExt;
    #[link(name = "kernel32")]
    extern "system" {
      fn MoveFileExW(existing: *const u16, new: *const u16, flags: u32) -> i32;
    }
    let source: Vec<u16> = temp.as_os_str().encode_wide().chain(Some(0)).collect();
    let destination: Vec<u16> = path.as_os_str().encode_wide().chain(Some(0)).collect();
    // REPLACE_EXISTING | WRITE_THROUGH: no unsupported directory FlushFileBuffers.
    if unsafe { MoveFileExW(source.as_ptr(), destination.as_ptr(), 0x1 | 0x8) } == 0 {
      return Err(std::io::Error::last_os_error().into());
    }
  }
  Ok(())
}
fn load(path: &Path) -> Result<Capture, Error> {
  serde_json::from_str(&fs::read_to_string(path)?).map_err(|e| Error::KSError(e.to_string()))
}
fn save(path: &Path, capture: &Capture) -> Result<(), Error> {
  atomic(
    path,
    &serde_json::to_string(capture).map_err(|e| Error::KSError(e.to_string()))?,
  )
}
fn input_for_chunk(audio: &str) -> Option<String> {
  let (stream, index) = audio.strip_suffix(".flac")?.rsplit_once('_')?;
  index.parse::<u64>().ok()?;
  let (thread, rest) = stream.split_once('_')?;
  thread.parse::<u64>().ok()?;
  let capture = rest
    .strip_prefix("input_")
    .or_else(|| rest.strip_prefix("output_"))?;
  uuid::Uuid::parse_str(capture).ok()?;
  Some(format!("{}_input_{}", thread, capture))
}
pub fn begin(
  thread: u64,
  input: &str,
  output: &str,
  target: &str,
  owner: &str,
) -> Result<CaptureAdmission, Error> {
  let _lock = JOURNAL_LOCK.lock().unwrap();
  let root = root()?;
  let path = journal(&root, input);
  if path.exists() {
    return Err(Error::KSError("Capture identity already exists".into()));
  }
  if owner != std::env::var("KNAPSACK_USER_EMAIL").unwrap_or_default() {
    return Err(Error::KSError(
      "Account changed before recording started".into(),
    ));
  }
  let base = read(&root.join("transcripts").join(target))?;
  let projection_file = projection_path(&root, thread);
  let mut projection = if projection_file.exists() {
    serde_json::from_str::<Projection>(&fs::read_to_string(&projection_file)?)
      .map_err(|error| Error::KSError(error.to_string()))?
  } else {
    Projection {
      owner: owner.into(),
      target: target.into(),
      base: base.clone(),
      projected: base.clone(),
      pending_desired: None,
      captures: Vec::new(),
    }
  };
  if projection.owner != owner || projection.target != target || projection.projected != base {
    return Err(Error::KSError(
      "Saved transcript changed. Reconcile pending transcription before starting another capture."
        .into(),
    ));
  }
  atomic(
    &projection_file,
    &serde_json::to_string(&projection).map_err(|error| Error::KSError(error.to_string()))?,
  )?;

  save(
    &path,
    &Capture {
      owner: owner.into(),
      thread_id: thread,
      input: input.into(),
      output: output.into(),
      target: target.into(),
      projected: base.clone(),
      base,
      stopped: false,
      chunks: BTreeMap::new(),
    },
  )?;
  projection.captures.push(input.into());
  atomic(
    &projection_file,
    &serde_json::to_string(&projection).map_err(|error| Error::KSError(error.to_string()))?,
  )?;
  LIVE_CAPTURES.lock().unwrap().insert(input.into());
  Ok(CaptureAdmission {
    input: input.into(),
    committed: false,
  })
}
pub fn register(audio: &str) -> Result<(), Error> {
  let Some(input) = input_for_chunk(audio) else {
    return Ok(());
  };
  let _lock = JOURNAL_LOCK.lock().unwrap();
  let path = journal(&root()?, &input);
  if !path.exists() {
    return Err(Error::KSError(
      "Capture was deleted or its recovery journal is unavailable. Audio was preserved.".into(),
    ));
  }
  let mut capture = load(&path)?;
  capture.chunks.entry(audio.into()).or_default();
  save(&path, &capture)
}
fn stream(capture: &Capture, name: &str) -> String {
  let mut entries: Vec<_> = capture
    .chunks
    .iter()
    .filter_map(|(file, chunk)| {
      let (prefix, index) = file.strip_suffix(".flac")?.rsplit_once('_')?;
      (prefix == name).then(|| {
        (
          index.parse::<u64>().unwrap_or(0),
          chunk.text.as_deref().unwrap_or(""),
        )
      })
    })
    .collect();
  entries.sort_by_key(|(index, _)| *index);
  // Keep empty chunks: input and output indexes must stay aligned after a failure.
  let max = entries.last().map(|e| e.0 + 1).unwrap_or(0);
  (0..max)
    .map(|index| {
      format!(
        "{}\n ---END-CHUNK---\n",
        entries
          .iter()
          .find(|e| e.0 == index)
          .map(|e| e.1)
          .unwrap_or("")
      )
    })
    .collect()
}
fn desired_for_receipt(capture: &Capture) -> String {
  let merged = super::transcribe::merge_transcripts(
    &stream(capture, &capture.input),
    &stream(capture, &capture.output),
  );
  if capture.base.trim().is_empty() {
    merged
  } else if merged.trim().is_empty() {
    capture.base.clone()
  } else {
    format!("{}\n{}", capture.base.trim_end(), merged)
  }
}
fn needs_projection(capture: &Capture) -> bool {
  capture.stopped && desired_for_receipt(capture) != capture.projected
}
fn settle_projection(root: &Path, path: &Path, projection: &mut Projection) -> Result<(), Error> {
  let Some(desired) = projection.pending_desired.clone() else {
    return Ok(());
  };
  let target = root.join("transcripts").join(&projection.target);
  let current = read(&target)?;
  if current == projection.projected {
    atomic(&target, &desired)?;
  } else if current != desired {
    return Err(Error::KSError(
      "Saved transcript changed during recovery. Audio was preserved.".into(),
    ));
  }
  projection.projected = desired;
  projection.pending_desired = None;
  atomic(
    path,
    &serde_json::to_string(projection).map_err(|error| Error::KSError(error.to_string()))?,
  )
}
fn project(root: &Path, path: &Path, capture: &mut Capture) -> Result<(), Error> {
  if capture.stopped {
    let projection_file = projection_path(root, capture.thread_id);
    let mut projection = if projection_file.exists() {
      serde_json::from_str::<Projection>(&fs::read_to_string(&projection_file)?)
        .map_err(|error| Error::KSError(error.to_string()))?
    } else {
      Projection {
        owner: capture.owner.clone(),
        target: capture.target.clone(),
        base: capture.base.clone(),
        projected: capture.projected.clone(),
        pending_desired: None,
        captures: vec![capture.input.clone()],
      }
    };
    // Finish the prior exact replacement before a restarted/live capture can
    // change the set of contributions used for the next replacement.
    if projection.owner != capture.owner || projection.target != capture.target {
      return Err(Error::KSError(
        "Transcript owner or target changed. Audio was preserved.".into(),
      ));
    }
    settle_projection(root, &projection_file, &mut projection)?;
    if !projection.captures.contains(&capture.input) {
      projection.captures.push(capture.input.clone());
    }
    let mut parts = vec![projection.base.trim_end().to_string()];
    for input in &projection.captures {
      let other;
      let receipt = if input == &capture.input {
        &*capture
      } else {
        let receipt_path = journal(root, input);
        if !receipt_path.exists() {
          return Err(Error::KSError(
            "A committed capture receipt is missing. Transcript and audio were preserved.".into(),
          ));
        }
        other = load(&receipt_path)?;
        &other
      };
      if receipt.owner != projection.owner
        || receipt.target != projection.target
        || receipt.thread_id != capture.thread_id
        || receipt.input != *input
      {
        return Err(Error::KSError(
          "Capture ownership changed. Transcript and audio were preserved.".into(),
        ));
      }
      if receipt.stopped {
        let text = super::transcribe::merge_transcripts(
          &stream(receipt, &receipt.input),
          &stream(receipt, &receipt.output),
        );
        if !text.trim().is_empty() {
          parts.push(text.trim_end().into());
        }
      }
    }
    let desired = parts
      .into_iter()
      .filter(|part| !part.trim().is_empty())
      .collect::<Vec<_>>()
      .join("\n");
    let target = root.join("transcripts").join(&capture.target);
    let current = read(&target)?;
    if current != projection.projected && current != desired {
      return Err(Error::KSError(
        "Saved transcript changed. Pending audio is preserved; review before recovery.".into(),
      ));
    }
    // Checkpoint the expected aggregate before writing its replacement. A crash
    // after target write is recognized by current==desired on the next retry.
    projection.pending_desired = Some(desired.clone());
    atomic(
      &projection_file,
      &serde_json::to_string(&projection).map_err(|error| Error::KSError(error.to_string()))?,
    )?;
    atomic(&target, &desired)?;
    projection.projected = desired;
    projection.pending_desired = None;
    atomic(
      &projection_file,
      &serde_json::to_string(&projection).map_err(|error| Error::KSError(error.to_string()))?,
    )?;
    capture.projected = desired_for_receipt(capture);
    save(path, capture)?;
  } else {
    for name in [&capture.input, &capture.output] {
      atomic(
        &root.join("transcripts").join(format!("{}.txt", name)),
        &stream(capture, name),
      )?;
    }
  }
  Ok(())
}
pub fn persist(audio: &str, text: &str) -> Result<bool, Error> {
  let _lock = JOURNAL_LOCK.lock().unwrap();
  persist_in(&root()?, audio, text)
}
fn persist_in(root: &Path, audio: &str, text: &str) -> Result<bool, Error> {
  let Some(input) = input_for_chunk(audio) else {
    return Ok(false);
  };
  let path = journal(&root, &input);
  if !path.exists() {
    return Err(Error::KSError(
      "Capture was deleted or its recovery journal is unavailable. Audio was preserved.".into(),
    ));
  }
  let mut capture = load(&path)?;
  capture.chunks.entry(audio.into()).or_default().text = Some(text.into());
  // Receipt precedes projection. Retrying a crash reprojects instead of appending.
  save(&path, &capture)?;
  project(&root, &path, &mut capture)?;
  Ok(true)
}
pub fn check_owner(audio: &str) -> Result<(), Error> {
  let _guard = lifecycle_guard();
  check_owner_in(
    &root()?,
    audio,
    &std::env::var("KNAPSACK_USER_EMAIL").unwrap_or_default(),
  )
}
fn check_owner_in(root: &Path, audio: &str, owner: &str) -> Result<(), Error> {
  let Some(input) = input_for_chunk(audio) else {
    return Ok(());
  };
  let path = journal(root, &input);
  if !path.exists() || load(&path)?.owner != owner {
    return Err(Error::KSError(
      "Account changed. Your audio is preserved.".into(),
    ));
  }
  Ok(())
}
pub fn cached(audio: &str) -> Result<Option<String>, Error> {
  let Some(input) = input_for_chunk(audio) else {
    return Ok(None);
  };
  let _lock = JOURNAL_LOCK.lock().unwrap();
  let path = journal(&root()?, &input);
  if !path.exists() {
    return Err(Error::KSError(
      "Capture was deleted or its recovery journal is unavailable. Audio was preserved.".into(),
    ));
  };
  Ok(load(&path)?.chunks.get(audio).and_then(|c| c.text.clone()))
}
pub fn finish(input_path: &Path, target: &Path) -> Result<bool, Error> {
  let Some(input) = input_path.file_stem().and_then(|s| s.to_str()) else {
    return Ok(false);
  };
  let _lock = JOURNAL_LOCK.lock().unwrap();
  let root = root()?;
  let path = journal(&root, input);
  if !path.exists() {
    return Ok(false);
  };
  let mut capture = load(&path)?;
  if target.file_name().and_then(|s| s.to_str()) != Some(capture.target.as_str()) {
    return Err(Error::KSError("Transcript target mismatch".into()));
  }
  capture.stopped = true;
  save(&path, &capture)?;
  LIVE_CAPTURES.lock().unwrap().remove(input);
  project(&root, &path, &mut capture)?;
  Ok(true)
}
fn capture_jobs(root: &Path, capture: &Capture, owner: &str) -> Vec<(String, String)> {
  let mut result = Vec::new();
  if capture.owner != owner {
    return result;
  }
  let repair = needs_projection(capture);
  for (position, (audio, chunk)) in capture.chunks.iter().enumerate() {
    if chunk.text.is_none() || root.join("audio").join(audio).exists() || (repair && position == 0)
    {
      result.push((
        audio.clone(),
        format!("{}.txt", audio.rsplit_once('_').map(|x| x.0).unwrap_or("")),
      ))
    }
  }
  result
}
fn reconcile_capture(
  root: &Path,
  path: &Path,
  capture: &mut Capture,
  live: bool,
) -> Result<(), Error> {
  if live || capture.stopped {
    return Ok(());
  }
  let audio_dir = root.join("audio");
  if audio_dir.exists() {
    for entry in fs::read_dir(audio_dir)? {
      let entry = entry?;
      if !entry.file_type()?.is_file() {
        continue;
      }
      let name = entry.file_name().to_string_lossy().into_owned();
      if input_for_chunk(&name).as_deref() == Some(capture.input.as_str()) {
        capture.chunks.entry(name).or_default();
      }
    }
  }
  capture.stopped = true;
  save(path, capture)?;
  project(root, path, capture)
}
/// Caller holds lifecycle_guard while staging files and committing row deletion.
pub fn deletion_files(home: &Path, threads: &[u64]) -> Result<Vec<PathBuf>, Error> {
  let root = home.join(".knapsack");
  let dir = root.join("transcription-queue-v1");
  let mut paths = Vec::new();
  if !dir.exists() {
    return Ok(paths);
  }
  for entry in fs::read_dir(dir)? {
    let entry = entry?;
    if !entry.file_type()?.is_file() {
      continue;
    }
    let path = entry.path();
    let name = path.file_name().and_then(|s| s.to_str()).unwrap_or("");
    if threads.iter().any(|thread| {
      name == format!("{}_projection.json", thread) || name == format!("{}_projection.tmp", thread)
    }) {
      paths.push(path);
      continue;
    }
    let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("");
    let Some(input) = input_for_chunk(&format!("{}_0.flac", stem)) else {
      continue;
    };
    if input != stem
      || !threads
        .iter()
        .any(|thread| input.starts_with(&format!("{}_input_", thread)))
    {
      continue;
    }
    if !matches!(
      path.extension().and_then(|s| s.to_str()),
      Some("json" | "tmp")
    ) {
      continue;
    }
    paths.push(path.clone());
    if path.extension().and_then(|s| s.to_str()) == Some("json") {
      let capture = load(&path)?;
      for stream in [&capture.input, &capture.output] {
        paths.push(root.join("transcripts").join(format!("{}.txt", stream)));
      }
      let audio = root.join("audio");
      if audio.exists() {
        for file in fs::read_dir(audio)? {
          let file = file?;
          let name = file.file_name().to_string_lossy().into_owned();
          if file.file_type()?.is_file()
            && input_for_chunk(&name).as_deref() == Some(input.as_str())
          {
            paths.push(file.path());
          }
        }
      }
    }
  }
  Ok(paths)
}
pub fn pending(owner: &str) -> Result<Vec<(String, String)>, Error> {
  let _lock = JOURNAL_LOCK.lock().unwrap();
  let root = root()?;
  let dir = root.join("transcription-queue-v1");
  let mut result = Vec::new();
  if !dir.exists() {
    return Ok(result);
  }
  for entry in fs::read_dir(dir)? {
    let path = entry?.path();
    if !is_capture_path(&path) {
      continue;
    }
    let mut capture = load(&path)?;
    if capture.owner != owner {
      continue;
    }
    if crate::db::models::transcript::Transcript::find_by_thread_id(capture.thread_id)?.is_none() {
      continue;
    }
    let live = LIVE_CAPTURES.lock().unwrap().contains(&capture.input);
    if let Err(error) = reconcile_capture(&root, &path, &mut capture, live) {
      log::warn!("Capture recovery needs attention: {}", error);
    }
    result.extend(capture_jobs(&root, &capture, owner));
  }
  result.sort();
  Ok(result)
}

#[tauri::command]
pub fn transcription_recovery_status(thread_id: u64) -> Result<serde_json::Value, String> {
  let _lock = JOURNAL_LOCK.lock().unwrap();
  let root = root().map_err(|e| e.to_string())?;
  let dir = root.join("transcription-queue-v1");
  let mut pending = 0;
  if dir.exists() {
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
      let path = entry.map_err(|e| e.to_string())?.path();
      if !is_capture_path(&path) {
        continue;
      }
      let capture = load(&path).map_err(|e| e.to_string())?;
      if capture.thread_id == thread_id
        && capture.owner == std::env::var("KNAPSACK_USER_EMAIL").unwrap_or_default()
      {
        pending += usize::from(
          needs_projection(&capture)
            || (!capture.stopped && !LIVE_CAPTURES.lock().unwrap().contains(&capture.input)),
        ) + capture
          .chunks
          .iter()
          .filter(|(audio, c)| c.text.is_none() || root.join("audio").join(audio).exists())
          .count();
      }
    }
  }
  Ok(serde_json::json!({"pending":pending}))
}
#[tauri::command]
pub async fn resume_saved_transcription() -> Result<(), String> {
  let owner = std::env::var("KNAPSACK_USER_EMAIL").unwrap_or_default();
  super::transcribe::resume_pending_transcription(owner).await
}

#[cfg(test)]
mod tests {
  use super::*;
  fn fixture() -> Capture {
    Capture {
      owner: "synthetic@example.test".into(),
      thread_id: 42,
      input: "42_input_3ff2ba37-4e89-48ee-90bf-6c3c9cb80516".into(),
      output: "42_output_3ff2ba37-4e89-48ee-90bf-6c3c9cb80516".into(),
      target: "synthetic.txt".into(),
      base: "Earlier transcript".into(),
      projected: "Earlier transcript".into(),
      stopped: false,
      chunks: BTreeMap::new(),
    }
  }
  #[test]
  fn transcription_recovery_orders_chunks_and_keeps_missing_slots() {
    let mut c = fixture();
    for (index, text) in [(10, "ten"), (2, "two"), (0, "zero")] {
      c.chunks.insert(
        format!("{}_{}.flac", c.input, index),
        Chunk {
          text: Some(text.into()),
        },
      );
    }
    let text = stream(&c, &c.input);
    let chunks: Vec<_> = text.split("---END-CHUNK---").collect();
    assert_eq!(chunks.len(), 12);
    assert!(chunks[0].contains("zero"));
    assert!(chunks[1].trim().is_empty());
    assert!(chunks[2].contains("two"));
    assert!(chunks[10].contains("ten"));
  }
  #[test]
  fn transcription_recovery_receipts_reproject_without_duplicates_or_overwrites() {
    let root =
      std::env::temp_dir().join(format!("transcription-recovery-{}", uuid::Uuid::new_v4()));
    let path = root.join("queue.json");
    let mut c = fixture();
    fs::create_dir_all(root.join("transcripts")).unwrap();
    let target = root.join("transcripts").join(&c.target);
    fs::write(&target, &c.base).unwrap();
    c.stopped = true;
    c.chunks.insert(
      format!("{}_0.flac", c.input),
      Chunk {
        text: Some("[0.00 - 1.00]: Synthetic recovery".into()),
      },
    );
    save(&path, &c).unwrap();
    project(&root, &path, &mut c).unwrap();
    let once = read(&target).unwrap();
    assert!(once.contains("Synthetic recovery"));
    let mut before_crash = load(&path).unwrap();
    before_crash.projected = before_crash.base.clone();
    save(&path, &before_crash).unwrap();
    project(&root, &path, &mut before_crash).unwrap();
    assert_eq!(read(&target).unwrap(), once);
    fs::write(&target, "User changed transcript").unwrap();
    assert!(project(&root, &path, &mut c).is_err());
    assert_eq!(read(&target).unwrap(), "User changed transcript");
    fs::remove_dir_all(root).unwrap();
  }
  #[test]
  fn transcription_recovery_pending_is_account_scoped_and_survives_reload() {
    let root = std::env::temp_dir().join(format!("transcription-queue-{}", uuid::Uuid::new_v4()));
    let path = root.join("queue.json");
    let mut capture = fixture();
    capture
      .chunks
      .insert(format!("{}_0.flac", capture.input), Chunk::default());
    save(&path, &capture).unwrap();
    let loaded = load(&path).unwrap();
    assert_eq!(capture_jobs(&root, &loaded, "other@example.test").len(), 0);
    assert_eq!(capture_jobs(&root, &loaded, &capture.owner).len(), 1);
    fs::remove_dir_all(root).unwrap();
  }
  #[test]
  fn transcription_recovery_live_replay_keeps_slots_and_stopped_receipt_is_retryable() {
    let root = std::env::temp_dir().join(format!("transcription-replay-{}", uuid::Uuid::new_v4()));
    let path = root.join("queue.json");
    let mut capture = fixture();
    let failed = format!("{}_0.flac", capture.input);
    let next = format!("{}_1.flac", capture.input);
    capture.chunks.insert(failed.clone(), Chunk::default());
    capture.chunks.insert(
      next,
      Chunk {
        text: Some("[0.00 - 1.00]: Next chunk".into()),
      },
    );
    save(&path, &capture).unwrap();
    project(&root, &path, &mut capture).unwrap();
    let stream_path = root
      .join("transcripts")
      .join(format!("{}.txt", capture.input));
    assert!(read(&stream_path)
      .unwrap()
      .starts_with("\n ---END-CHUNK---"));
    capture.chunks.get_mut(&failed).unwrap().text = Some("[0.00 - 1.00]: Recovered chunk".into());
    save(&path, &capture).unwrap();
    project(&root, &path, &mut capture).unwrap();
    let live = read(&stream_path).unwrap();
    project(&root, &path, &mut capture).unwrap();
    assert_eq!(read(&stream_path).unwrap(), live);
    fs::write(
      root.join("transcripts").join(&capture.target),
      &capture.base,
    )
    .unwrap();
    capture.stopped = true;
    save(&path, &capture).unwrap();
    assert!(needs_projection(&capture));
    assert!(!capture_jobs(&root, &capture, &capture.owner).is_empty());
    project(&root, &path, &mut capture).unwrap();
    assert!(!needs_projection(&capture));
    let final_text = read(&root.join("transcripts").join(&capture.target)).unwrap();
    assert_eq!(final_text.matches("Recovered chunk").count(), 1);
    assert_eq!(final_text.matches("Next chunk").count(), 1);
    assert!(capture_jobs(&root, &capture, &capture.owner).is_empty());
    fs::remove_dir_all(root).unwrap();
  }
  #[test]
  fn transcription_recovery_never_adopts_legacy_or_arbitrary_paths() {
    for file in [
      "../../secret.flac",
      "139_input_0.flac",
      "139_input_old_0.flac",
    ] {
      assert!(input_for_chunk(file).is_none());
    }
    assert!(input_for_chunk("42_output_3ff2ba37-4e89-48ee-90bf-6c3c9cb80516_12.flac").is_some());
  }
  #[test]
  fn transcription_recovery_crash_reconciles_only_its_known_capture_and_projects_final_text() {
    let root = tempfile::tempdir().unwrap();
    let path = root.path().join("queue.json");
    let mut capture = fixture();
    std::fs::create_dir_all(root.path().join("audio")).unwrap();
    std::fs::create_dir_all(root.path().join("transcripts")).unwrap();
    std::fs::write(
      root.path().join("transcripts").join(&capture.target),
      &capture.base,
    )
    .unwrap();
    let chunk = format!("{}_0.flac", capture.input);
    std::fs::write(root.path().join("audio").join(&chunk), b"synthetic").unwrap();
    std::fs::write(
      root.path().join("audio/139_input_0.flac"),
      b"untouched legacy fixture",
    )
    .unwrap();
    save(&path, &capture).unwrap();
    reconcile_capture(root.path(), &path, &mut capture, true).unwrap();
    assert!(!capture.stopped);
    reconcile_capture(root.path(), &path, &mut capture, false).unwrap();
    assert!(capture.stopped);
    assert!(capture.chunks.contains_key(&chunk));
    assert_eq!(capture.chunks.len(), 1);
    capture.chunks.get_mut(&chunk).unwrap().text =
      Some("[0.00 - 1.00]: Restored after crash".into());
    save(&path, &capture).unwrap();
    project(root.path(), &path, &mut capture).unwrap();
    assert_eq!(
      read(&root.path().join("transcripts").join(&capture.target))
        .unwrap()
        .matches("Restored after crash")
        .count(),
      1
    );
    assert_eq!(
      std::fs::read(root.path().join("audio/139_input_0.flac")).unwrap(),
      b"untouched legacy fixture"
    );
  }
  #[test]
  fn transcription_recovery_deleted_journal_rejects_a_stale_worker_without_recreating_files() {
    let root = tempfile::tempdir().unwrap();
    let capture = fixture();
    let audio = format!("{}_0.flac", capture.input);
    let path = journal(root.path(), &capture.input);
    save(&path, &capture).unwrap();
    std::fs::remove_file(&path).unwrap();
    assert!(persist_in(root.path(), &audio, "[0.00 - 1.00]: Late response").is_err());
    assert!(!root
      .path()
      .join("transcripts")
      .join(&capture.target)
      .exists());
    assert!(!path.exists());
  }
  #[test]
  fn transcription_recovery_deletion_includes_full_receipts_and_only_the_selected_capture() {
    let home = tempfile::tempdir().unwrap();
    let root = home.path().join(".knapsack");
    let capture = fixture();
    let path = journal(&root, &capture.input);
    save(&path, &capture).unwrap();
    let paths = deletion_files(home.path(), &[42]).unwrap();
    assert!(paths.contains(&path));
    assert!(deletion_files(home.path(), &[43]).unwrap().is_empty());
  }
  #[test]
  fn transcription_recovery_request_admission_rechecks_deletion_and_owner_after_async_prep() {
    let root = tempfile::tempdir().unwrap();
    let capture = fixture();
    let audio = format!("{}_0.flac", capture.input);
    let path = journal(root.path(), &capture.input);
    save(&path, &capture).unwrap();
    assert!(check_owner_in(root.path(), &audio, &capture.owner).is_ok());
    // File/auth preparation completes, then deletion commits before send admission.
    let prepared_bytes = b"synthetic audio bytes";
    assert!(!prepared_bytes.is_empty());
    std::fs::remove_file(&path).unwrap();
    let mut requests = 0;
    if check_owner_in(root.path(), &audio, &capture.owner).is_ok() {
      requests += 1
    };
    assert_eq!(requests, 0);
    save(&path, &capture).unwrap();
    assert!(check_owner_in(root.path(), &audio, "different@example.test").is_err());
  }
  #[test]
  fn transcription_recovery_composes_older_replay_with_a_newer_live_capture() {
    let root = tempfile::tempdir().unwrap();
    let mut a = fixture();
    a.stopped = true;
    let a_file = journal(root.path(), &a.input);
    let a_chunk = format!("{}_0.flac", a.input);
    a.chunks.insert(a_chunk.clone(), Chunk { text: None });
    save(&a_file, &a).unwrap();
    std::fs::create_dir_all(root.path().join("transcripts")).unwrap();
    let target = root.path().join("transcripts").join(&a.target);
    std::fs::write(&target, &a.base).unwrap();
    project(root.path(), &a_file, &mut a).unwrap();
    let mut b = fixture();
    b.input = "42_input_5ff2ba37-4e89-48ee-90bf-6c3c9cb80516".into();
    b.output = "42_output_5ff2ba37-4e89-48ee-90bf-6c3c9cb80516".into();
    b.base = read(&target).unwrap();
    b.projected = b.base.clone();
    let b_file = journal(root.path(), &b.input);
    b.chunks.insert(
      format!("{}_0.flac", b.input),
      Chunk {
        text: Some("[0.00 - 1.00]: New capture".into()),
      },
    );
    save(&b_file, &b).unwrap();
    let projection_file = projection_path(root.path(), 42);
    let mut projection: Projection =
      serde_json::from_str(&std::fs::read_to_string(&projection_file).unwrap()).unwrap();
    projection.captures.push(b.input.clone());
    atomic(
      &projection_file,
      &serde_json::to_string(&projection).unwrap(),
    )
    .unwrap();
    let before_a_projection: Projection =
      serde_json::from_str(&std::fs::read_to_string(&projection_file).unwrap()).unwrap();
    a.chunks.get_mut(&a_chunk).unwrap().text = Some("[0.00 - 1.00]: Recovered old capture".into());
    save(&a_file, &a).unwrap();
    project(root.path(), &a_file, &mut a).unwrap();
    assert!(!read(&target).unwrap().contains("New capture"));
    let written = read(&target).unwrap();
    let mut interrupted = before_a_projection;
    interrupted.pending_desired = Some(written);
    atomic(
      &projection_file,
      &serde_json::to_string(&interrupted).unwrap(),
    )
    .unwrap();
    // Restart changes B from live to stopped while A's replacement is pending.
    b.stopped = true;
    save(&b_file, &b).unwrap();
    project(root.path(), &b_file, &mut b).unwrap();
    let final_text = read(&target).unwrap();
    assert_eq!(final_text.matches("Recovered old capture").count(), 1);
    assert_eq!(final_text.matches("New capture").count(), 1);
    project(root.path(), &a_file, &mut a).unwrap();
    assert_eq!(read(&target).unwrap(), final_text);
    std::fs::remove_file(&a_file).unwrap();
    assert!(project(root.path(), &b_file, &mut b).is_err());
    assert_eq!(read(&target).unwrap(), final_text);
  }
}
