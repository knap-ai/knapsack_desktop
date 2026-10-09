//! Local-only diagnostic metadata. This schema cannot carry request content.
use serde::Serialize;
use std::collections::VecDeque;
use std::sync::{Mutex, OnceLock};
use std::time::Instant;
use uuid::Uuid;
const RETENTION: usize = 1024;
#[derive(Default)]
struct Capture {
  enabled: bool,
  events: VecDeque<serde_json::Value>,
}
static CAPTURE: OnceLock<Mutex<Capture>> = OnceLock::new();
fn capture() -> &'static Mutex<Capture> {
  CAPTURE.get_or_init(|| Mutex::new(Capture::default()))
}
fn retain(event: serde_json::Value) {
  if let Ok(mut state) = capture().lock() {
    if !state.enabled {
      return;
    }
    if state.events.len() == RETENTION {
      state.events.pop_front();
    }
    state.events.push_back(event);
  }
}
#[tauri::command]
pub fn set_diagnostic_capture(enabled: bool) -> Result<(), ()> {
  let mut state = capture().lock().map_err(|_| ())?;
  state.enabled = enabled;
  state.events.clear();
  Ok(())
}
#[tauri::command]
pub fn diagnostic_capture_snapshot() -> Result<Vec<serde_json::Value>, ()> {
  Ok(
    capture()
      .lock()
      .map_err(|_| ())?
      .events
      .iter()
      .cloned()
      .collect(),
  )
}

#[derive(Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Kind {
  Completion,
  Transcription,
}
#[derive(Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Phase {
  Total,
  Preparation,
  Auth,
  Provider,
  Request,
  RetryWait,
  LocalInference,
}
#[derive(Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Outcome {
  Started,
  Completed,
  Failed,
  Cancelled,
  Timeout,
  Transport,
  HttpError,
}

#[derive(Clone)]
pub struct Trace {
  id: String,
  kind: Kind,
}
tokio::task_local! { pub static TRACE: Trace; }

#[derive(Serialize)]
struct Event {
  diagnostic_id: String,
  kind: Kind,
  phase: Phase,
  outcome: Outcome,
  elapsed_ms: u64,
  #[serde(skip_serializing_if = "Option::is_none")]
  http_status: Option<u16>,
}

impl Trace {
  pub fn new(kind: Kind, id: Option<&str>) -> Self {
    let id = id
      .and_then(|s| Uuid::parse_str(s).ok())
      .filter(|id| id.get_version_num() == 4 && id.get_variant() == uuid::Variant::RFC4122)
      .unwrap_or_else(Uuid::new_v4);
    Self {
      id: id.to_string(),
      kind,
    }
  }
}

pub struct Span {
  trace: Trace,
  phase: Phase,
  start: Instant,
  finished: bool,
}
impl Span {
  pub fn current(phase: Phase) -> Option<Self> {
    TRACE
      .try_with(|trace| {
        let span = Self {
          trace: trace.clone(),
          phase,
          start: Instant::now(),
          finished: false,
        };
        span.emit(Outcome::Started, None);
        span
      })
      .ok()
  }
  fn emit(&self, outcome: Outcome, status: Option<u16>) {
    let event = Event {
      diagnostic_id: self.trace.id.clone(),
      kind: self.trace.kind,
      phase: self.phase,
      outcome,
      elapsed_ms: self.start.elapsed().as_millis().min(u64::MAX as u128) as u64,
      http_status: status,
    };
    // Dedicated bounded memory, never log or telemetry appenders.
    retain(serde_json::to_value(&event).expect("primitive metadata"));
    #[cfg(test)]
    EVENTS.with(|events| {
      events
        .borrow_mut()
        .push(serde_json::to_value(event).unwrap())
    });
  }
  pub fn finish(mut self, outcome: Outcome, status: Option<u16>) {
    self.finished = true;
    self.emit(outcome, status.filter(|s| (100..=599).contains(s)));
  }
}
impl Drop for Span {
  fn drop(&mut self) {
    if !self.finished {
      self.emit(Outcome::Cancelled, None);
    }
  }
}
pub fn finish_result<T, E>(span: Option<Span>, result: &Result<T, E>) {
  if let Some(span) = span {
    span.finish(
      if result.is_ok() {
        Outcome::Completed
      } else {
        Outcome::Failed
      },
      None,
    );
  }
}
pub fn finish_request(span: Option<Span>, result: &Result<reqwest::Response, reqwest::Error>) {
  if let Some(span) = span {
    match result {
      Ok(response) => span.finish(
        if response.status().is_success() {
          Outcome::Completed
        } else {
          Outcome::HttpError
        },
        Some(response.status().as_u16()),
      ),
      Err(error) => span.finish(
        if error.is_timeout() {
          Outcome::Timeout
        } else if error.is_connect() {
          Outcome::Transport
        } else {
          Outcome::Failed
        },
        None,
      ),
    }
  }
}

pub fn scheduler_missing_user(empty_email: bool) {
  #[derive(Serialize)]
  #[serde(rename_all = "snake_case")]
  enum DatabaseCategory {
    Default,
    Configured,
    Unknown,
  }
  #[derive(Serialize)]
  struct SchedulerEvent {
    diagnostic_id: String,
    empty_email: bool,
    match_count: u8,
    database_category: DatabaseCategory,
  }
  // QueryReturnedNoRows already establishes zero matches; no extra DB query.
  let path = crate::db::db::resolve_db_path();
  let category = match dirs::home_dir() {
    Some(home) if path == home.join(crate::db::db::KNAPSACK_DB_FILENAME) => {
      DatabaseCategory::Default
    }
    Some(_) => DatabaseCategory::Configured,
    None => DatabaseCategory::Unknown,
  };
  let event = SchedulerEvent {
    diagnostic_id: Uuid::new_v4().to_string(),
    empty_email,
    match_count: 0,
    database_category: category,
  };
  retain(serde_json::to_value(&event).expect("primitive metadata"));
}

#[cfg(test)]
thread_local! { static EVENTS: std::cell::RefCell<Vec<serde_json::Value>> = const { std::cell::RefCell::new(Vec::new()) }; }
#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn rejects_non_random_identifier_and_allows_only_metadata_fields() {
    let hostile =
      "email@example.invalid token=secret /private/meeting.flac https://invalid/?key=secret";
    let trace = Trace::new(Kind::Completion, Some(hostile));
    assert_ne!(trace.id, hostile);
    assert_eq!(Uuid::parse_str(&trace.id).unwrap().get_version_num(), 4);
    let span = Span {
      trace,
      phase: Phase::Auth,
      start: Instant::now(),
      finished: false,
    };
    span.finish(Outcome::Failed, Some(999));
    EVENTS.with(|events| {
      let events = events.borrow();
      let event = events.last().unwrap();
      let mut keys = event
        .as_object()
        .unwrap()
        .keys()
        .map(String::as_str)
        .collect::<Vec<_>>();
      keys.sort();
      assert_eq!(
        keys,
        vec!["diagnostic_id", "elapsed_ms", "kind", "outcome", "phase"]
      );
      assert!(!event.to_string().contains("secret"));
      assert!(!event.to_string().contains("email"));
    });
  }
  #[tokio::test]
  async fn preserves_result_and_records_cancellation_once() {
    EVENTS.with(|events| events.borrow_mut().clear());
    TRACE
      .scope(Trace::new(Kind::Transcription, None), async {
        let result: Result<u8, &str> = Ok(7);
        finish_result(Span::current(Phase::Preparation), &result);
        assert_eq!(result, Ok(7));
        drop(Span::current(Phase::Request));
      })
      .await;
    EVENTS.with(|events| {
      let events = events.borrow();
      assert_eq!(
        events
          .iter()
          .filter(|e| e["outcome"] == "completed")
          .count(),
        1
      );
      assert_eq!(
        events
          .iter()
          .filter(|e| e["outcome"] == "cancelled")
          .count(),
        1
      );
      assert_eq!(events[0]["diagnostic_id"], events[3]["diagnostic_id"]);
    });
  }
  #[tokio::test]
  async fn errors_are_preserved_without_serializing_sensitive_bodies() {
    EVENTS.with(|events| events.borrow_mut().clear());
    TRACE
      .scope(Trace::new(Kind::Completion, None), async {
        let result: Result<u8, &str> = Err("token=secret prompt=private email@example.invalid");
        finish_result(Span::current(Phase::Auth), &result);
        assert_eq!(
          result.unwrap_err(),
          "token=secret prompt=private email@example.invalid"
        );
      })
      .await;
    EVENTS.with(|events| {
      let serialized = serde_json::to_string(&*events.borrow()).unwrap();
      for forbidden in ["secret", "private", "example.invalid", "URL"] {
        assert!(!serialized.contains(forbidden));
      }
      assert_eq!(
        events
          .borrow()
          .iter()
          .filter(|e| e["outcome"] == "failed")
          .count(),
        1
      );
    });
  }
  #[test]
  fn capture_is_disabled_bounded_and_clearable() {
    set_diagnostic_capture(false).unwrap();
    retain(serde_json::json!({"phase":"auth"}));
    assert!(diagnostic_capture_snapshot().unwrap().is_empty());
    set_diagnostic_capture(true).unwrap();
    for _ in 0..(RETENTION + 10) {
      retain(serde_json::json!({"phase":"auth"}));
    }
    assert_eq!(diagnostic_capture_snapshot().unwrap().len(), RETENTION);
    set_diagnostic_capture(false).unwrap();
    assert!(diagnostic_capture_snapshot().unwrap().is_empty());
    assert!(!Capture::default().enabled);
  }
}
