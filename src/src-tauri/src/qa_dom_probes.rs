//! Fixed, opt-in synthetic probes of the owned QA WebView. No eval endpoint.
use serde::{Deserialize, Serialize};
use std::{
  sync::{Arc, Mutex},
  time::{Duration, Instant},
};
use tauri::{Manager, Window};
use tokio::sync::oneshot;

const EVENT: &str = "knapsack-qa-dom-result";
const PROBE_LIMIT: Duration = Duration::from_secs(5);
const SUITE_LIMIT: Duration = Duration::from_secs(30);
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
enum Probe {
  Transcript,
  MeetingLink,
  ChatSelection,
  NotesEdit,
  SlackShare,
  PersonScout,
  Boundaries,
}
const PROBES: [Probe; 7] = [
  Probe::Transcript,
  Probe::MeetingLink,
  Probe::ChatSelection,
  Probe::NotesEdit,
  Probe::SlackShare,
  Probe::PersonScout,
  Probe::Boundaries,
];
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Answer {
  nonce: String,
  probe: Probe,
  passed: bool,
}
struct Ticket {
  nonce: String,
  probe: Probe,
  deadline: Instant,
  sender: oneshot::Sender<bool>,
}
impl Ticket {
  fn accepts(&self, answer: &Answer, now: Instant) -> bool {
    now < self.deadline && answer.nonce == self.nonce && answer.probe == self.probe
  }
}
#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
enum Status {
  Passed,
  AssertionFailed,
  Timeout,
  EvaluationFailed,
  Watchdog,
}
#[derive(Serialize)]
struct Row {
  probe: Probe,
  status: Status,
}
#[derive(Serialize)]
struct Report {
  version: u8,
  run_id: &'static str,
  bundle_id: &'static str,
  window: &'static str,
  coverage: &'static str,
  passed: bool,
  probes: Vec<Row>,
}

pub(crate) fn enabled() -> bool {
  crate::qa_launch::is_synthetic_build()
    && std::env::var("KNAPSACK_QA_DOM_PROBES").as_deref() == Ok("1")
}
fn accept(slot: &Mutex<Option<Ticket>>, payload: &str, now: Instant) {
  if payload.len() > 256 {
    return;
  }
  let Ok(answer) = serde_json::from_str::<Answer>(payload) else {
    return;
  };
  let Ok(mut slot) = slot.lock() else { return };
  if slot
    .as_ref()
    .is_some_and(|ticket| ticket.accepts(&answer, now))
  {
    if let Some(ticket) = slot.take() {
      let _ = ticket.sender.send(answer.passed);
    }
  }
}
fn script(probe: Probe, nonce: &str) -> String {
  // Both substitutions are serialized data; callers cannot supply JavaScript.
  format!("(() => {{ const end=Date.now()+4500; const call=()=>{{if(typeof window.__knapsackNativeQaProbe==='function'){{void window.__knapsackNativeQaProbe({},{});}}else if(Date.now()<end){{setTimeout(call,25);}}}};call(); }})()",serde_json::to_string(&probe).unwrap(),serde_json::to_string(nonce).unwrap())
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Gate {
  run_id: String,
  bundle_id: String,
}
fn gate_matches(payload: &str) -> bool {
  payload.len() <= 512
    && serde_json::from_str::<Gate>(payload)
      .ok()
      .is_some_and(|gate| {
        Some(gate.run_id.as_str()) == option_env!("KNAPSACK_QA_BUILD_RUN_ID")
          && Some(gate.bundle_id.as_str()) == option_env!("KNAPSACK_QA_BUILD_BUNDLE_ID")
      })
}
// A fixed operator event, separate from the component harness side-effect bridge.
const OPERATOR_EVENT: &str = "knapsack-qa-operator-start";
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct OperatorChallenge {
  run_id: String,
  bundle_id: String,
  nonce: String,
  expires_at_ms: u64,
}
fn wall_ms() -> u64 {
  std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH)
    .map(|d| d.as_millis() as u64).unwrap_or(u64::MAX)
}
impl OperatorChallenge {
  fn valid(&self, now: u64) -> bool {
    gate_matches(&serde_json::json!({"run_id": self.run_id, "bundle_id": self.bundle_id}).to_string())
      && uuid::Uuid::parse_str(&self.nonce).is_ok()
      && now < self.expires_at_ms && self.expires_at_ms.saturating_sub(now) <= 30_000
  }
}
struct OperatorTicket {
  challenge: OperatorChallenge,
  deadline: Instant,
}
fn consume_operator(slot: &Mutex<Option<OperatorTicket>>, payload: &str, now: Instant, visible: bool, focused: bool) -> Option<Gate> {
  if payload.len() > 1024 || !visible || !focused { return None; }
  let answer = serde_json::from_str::<OperatorChallenge>(payload).ok()?;
  let mut slot = slot.lock().ok()?;
  let ticket = slot.as_ref()?;
  let expected = &ticket.challenge;
  if now >= ticket.deadline || !answer.valid(wall_ms()) || answer.run_id != expected.run_id
    || answer.bundle_id != expected.bundle_id || answer.nonce != expected.nonce
    || answer.expires_at_ms != expected.expires_at_ms { return None; }
  let ticket = slot.take()?; // Consume before any marker I/O; failure cannot rearm.
  Some(Gate { run_id: ticket.challenge.run_id, bundle_id: ticket.challenge.bundle_id })
}
fn write_visible_marker(gate: &Gate) -> std::io::Result<()> {
  let folder = option_env!("KNAPSACK_QA_BUILD_STATE_DIR").ok_or(std::io::ErrorKind::NotFound)?;
  let path = std::path::Path::new(folder).join("qa-visible-go.json");
  let bytes = serde_json::to_vec(gate)?;
  install_marker(&path, &bytes)
}
fn install_marker(path: &std::path::Path, bytes: &[u8]) -> std::io::Result<()> {
  use std::io::Write;
  let temporary = path.with_extension("native-tmp");
  let mut file = std::fs::OpenOptions::new().write(true).create_new(true).open(&temporary)?;
  let result = file.write_all(bytes).and_then(|_| file.sync_all()).and_then(|_| {
    // Atomic create-new publication: never expose partial JSON or replace a link.
    std::fs::hard_link(&temporary, path)
  });
  let _ = std::fs::remove_file(temporary);
  result
}
fn arm_operator(window: &Window, slot: &Mutex<Option<OperatorTicket>>, armed: &mut bool) {
  if *armed || std::env::var("KNAPSACK_QA_VISIBLE_OPERATOR_GATE").as_deref() != Ok("1") { return; }
  let Some(folder) = option_env!("KNAPSACK_QA_BUILD_STATE_DIR") else { return; };
  let path = std::path::Path::new(folder).join("qa-visible-arm.json");
  let Ok(meta) = std::fs::symlink_metadata(&path) else { return; };
  if !meta.is_file() || meta.file_type().is_symlink() || meta.len() > 1024 { return; }
  let Some(challenge) = std::fs::read_to_string(path).ok().and_then(|s| serde_json::from_str::<OperatorChallenge>(&s).ok()) else { return; };
  let now = wall_ms();
  if !challenge.valid(now) { return; }
  let Ok(mut ticket) = slot.lock() else { return; };
  let deadline = Instant::now() + Duration::from_millis(challenge.expires_at_ms - now);
  *ticket = Some(OperatorTicket { deadline, challenge: challenge.clone() });
  *armed = true;
  // Fixed data-only dispatch, polled until the isolated fixture has loaded.
  let fixed = format!("window.__knapsackQaArmOperator?.({})", serde_json::to_string(&challenge).unwrap());
  let owner = window.clone();
  std::thread::spawn(move || {
    while Instant::now() < deadline && wall_ms() < challenge.expires_at_ms {
      if owner.eval(&fixed).is_err() { break; }
      std::thread::sleep(Duration::from_millis(100));
    }
  });
}
async fn wait_for_preflight(window: &Window, operator: &Mutex<Option<OperatorTicket>>) -> bool {
  let mut armed = false;
  let Some(folder) = option_env!("KNAPSACK_QA_BUILD_STATE_DIR") else {
    return false;
  };
  let path = std::path::Path::new(folder).join("qa-dom-go.json");
  let end = Instant::now() + Duration::from_secs(45);
  while Instant::now() < end {
    arm_operator(window, operator, &mut armed);
    if let Ok(meta) = std::fs::symlink_metadata(&path) {
      if meta.file_type().is_symlink() || meta.len() > 512 {
        return false;
      }
      return std::fs::read_to_string(&path)
        .ok()
        .is_some_and(|text| gate_matches(&text));
    }
    tokio::time::sleep(Duration::from_millis(25)).await;
  }
  false
}
fn save(rows: Vec<Row>) -> bool {
  let report = Report {
    version: 1,
    run_id: option_env!("KNAPSACK_QA_BUILD_RUN_ID").unwrap_or(""),
    bundle_id: option_env!("KNAPSACK_QA_BUILD_BUNDLE_ID").unwrap_or(""),
    window: "main",
    coverage: "native_webview_real_components_with_synthetic_boundaries",
    passed: rows.len() == PROBES.len() && rows.iter().all(|r| matches!(r.status, Status::Passed)),
    probes: rows,
  };
  if let Some(folder) = option_env!("KNAPSACK_QA_BUILD_STATE_DIR") {
    let path = std::path::Path::new(folder).join("qa-dom-result.json");
    let temporary = path.with_extension("tmp");
    if let Ok(bytes) = serde_json::to_vec_pretty(&report) {
      if std::fs::write(&temporary, bytes).is_ok() && std::fs::rename(temporary, path).is_ok() {
        return report.passed;
      }
    }
  }
  false
}
pub(crate) fn start(window: Window) {
  if !enabled() || window.label() != "main" || std::env::var("KNAPSACK_QA_MANUAL_NOTES").as_deref() == Ok("1") || std::env::var("KNAPSACK_QA_MANUAL_SLACK").as_deref() == Ok("1") {
    return;
  }
  // The handle is created by this process, never selected by app name or AX.
  // Fixed enum-only diagnostic on this compiled synthetic window; never accepts code or user data.
  window.listen("knapsack-qa-bootstrap", |event| {
    let phase = event.payload().and_then(|text| serde_json::from_str::<String>(text).ok());
    if let Some(phase) = phase.filter(|value| matches!(value.as_str(), "entry_loaded" | "module_loaded" | "harness_ready" | "bootstrap_failed" | "dispatch_received" | "probe_finished" | "result_bridge_ready")) {
      eprintln!("[qa-bootstrap] {}", phase);
    }
  });
  let operator = Arc::new(Mutex::new(None));
  let incoming_operator = operator.clone();
  let owner = window.clone();
  window.listen(OPERATOR_EVENT, move |event| {
    // These synchronous native getters can stall; they have no per-call timeout.
    // Until both return, no marker is written. The independent launcher still
    // expires its 30-second operator gate and requests owned-child cleanup.
    let visible = owner.is_visible().unwrap_or(false);
    let focused = owner.is_focused().unwrap_or(false);
    if let Some(gate) = event.payload().and_then(|payload| consume_operator(&incoming_operator, payload, Instant::now(), visible, focused)) {
      if write_visible_marker(&gate).is_err() { owner.app_handle().exit(1); }
    }
  });
  let slot: Arc<Mutex<Option<Ticket>>> = Arc::new(Mutex::new(None));
  let incoming = slot.clone();
  let listener = window.listen(EVENT, move |event| {
    if let Some(payload) = event.payload() {
      accept(&incoming, payload, Instant::now());
    }
  });
  std::thread::spawn(move || {
    let Ok(runtime) = crate::utils::runtime::background_runtime() else {
      save(vec![Row {
        probe: Probe::Transcript,
        status: Status::EvaluationFailed,
      }]);
      window.unlisten(listener);
      window.app_handle().exit(1);
      return;
    };
    runtime.block_on(async {
      if !wait_for_preflight(&window, &operator).await {
        save(vec![Row {
          probe: Probe::Transcript,
          status: Status::Watchdog,
        }]);
        window.unlisten(listener);
        window.app_handle().exit(1);
        return;
      }
      // Run inside the actual isolated app after launcher ownership/empty-state
      // preflight, not the unit-test binary. No hardware or provider is opened.
      let capture_passed = matches!(tokio::time::timeout(Duration::from_secs(3), crate::audio::audio::native_capture_probe()).await, Ok(Ok(())));
      let capture_report = serde_json::json!({"version":1,"run_id":option_env!("KNAPSACK_QA_BUILD_RUN_ID").unwrap_or(""),"bundle_id":option_env!("KNAPSACK_QA_BUILD_BUNDLE_ID").unwrap_or(""),"coverage":"native_app_synthetic_callbacks_no_hardware","passed":capture_passed});
      let folder = std::path::Path::new(option_env!("KNAPSACK_QA_BUILD_STATE_DIR").unwrap_or(""));
      let saved = std::fs::write(folder.join("qa-capture-result.tmp"), serde_json::to_vec_pretty(&capture_report).unwrap()).and_then(|_| std::fs::rename(folder.join("qa-capture-result.tmp"),folder.join("qa-capture-result.json"))).is_ok();
      if !capture_passed || !saved { window.unlisten(listener); window.app_handle().exit(1); return; }
      let notes_passed = matches!(tokio::time::timeout(Duration::from_secs(5), crate::notes_transcript::native_read_probe()).await, Ok(Ok(())));
      let notes_report = serde_json::json!({"version":1,"run_id":option_env!("KNAPSACK_QA_BUILD_RUN_ID").unwrap_or(""),"bundle_id":option_env!("KNAPSACK_QA_BUILD_BUNDLE_ID").unwrap_or(""),"coverage":"native_saved_read_commands_synthetic_profile_and_database","passed":notes_passed});
      let notes_saved = std::fs::write(folder.join("qa-notes-read-result.json"), serde_json::to_vec_pretty(&notes_report).unwrap()).is_ok();
      eprintln!("[qa-notes-read] {}", notes_report);
      if !notes_passed || !notes_saved { window.unlisten(listener); window.app_handle().exit(1); return; }
      let deadline = Instant::now() + SUITE_LIMIT;
      let mut rows = Vec::new();
      for probe in PROBES {
        let Some(remaining) = deadline.checked_duration_since(Instant::now()) else {
          rows.push(Row {
            probe,
            status: Status::Watchdog,
          });
          break;
        };
        let budget = PROBE_LIMIT.min(remaining);
        let nonce = uuid::Uuid::new_v4().to_string();
        let (sender, receiver) = oneshot::channel();
        *slot.lock().unwrap() = Some(Ticket {
          nonce: nonce.clone(),
          probe,
          deadline: Instant::now() + budget,
          sender,
        });
        let owner = window.clone();
        let fixed = script(probe, &nonce);
        // A wedged dispatcher cannot block the timer's executor thread.
        let attempt = async {
          tokio::task::spawn_blocking(move || owner.eval(&fixed))
            .await
            .map_err(|_| ())?
            .map_err(|_| ())?;
          receiver.await.map_err(|_| ())
        };
        let status = match tokio::time::timeout(budget, attempt).await {
          Ok(Ok(true)) => Status::Passed,
          Ok(Ok(false)) => Status::AssertionFailed,
          Ok(Err(_)) => Status::EvaluationFailed,
          Err(_) => Status::Timeout,
        };
        *slot.lock().unwrap() = None; // expire nonce before starting another probe
        let passed = matches!(status, Status::Passed);
        rows.push(Row { probe, status });
        if !passed {
          break;
        } // no retries or unsafe continuation after failure
      }
      let passed = save(rows);
      window.unlisten(listener);
      window.app_handle().exit(if passed { 0 } else { 1 }); // only the owned QA app, with Tauri cleanup
    });
  });
}
#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn synthetic_qa_dom_operator_is_armed_identity_bound_focused_and_single_use() {
    let now = Instant::now();
    let challenge = OperatorChallenge {
      run_id: option_env!("KNAPSACK_QA_BUILD_RUN_ID").unwrap().into(),
      bundle_id: option_env!("KNAPSACK_QA_BUILD_BUNDLE_ID").unwrap().into(),
      nonce: uuid::Uuid::new_v4().to_string(), expires_at_ms: wall_ms() + 20_000,
    };
    let payload = serde_json::to_string(&challenge).unwrap();
    let slot = Mutex::new(None);
    assert!(consume_operator(&slot, &payload, now, true, true).is_none());
    *slot.lock().unwrap() = Some(OperatorTicket { challenge: challenge.clone(), deadline: now + Duration::from_secs(20) });
    for (visible, focused) in [(false, true), (true, false), (false, false)] {
      assert!(consume_operator(&slot, &payload, now, visible, focused).is_none());
    }
    for field in ["run_id", "bundle_id", "nonce", "expires_at_ms"] {
      let mut bad = serde_json::to_value(&challenge).unwrap();
      bad[field] = if field == "expires_at_ms" { serde_json::json!(wall_ms() - 1) } else { serde_json::json!("wrong") };
      assert!(consume_operator(&slot, &bad.to_string(), now, true, true).is_none());
    }
    assert!(consume_operator(&slot, &"x".repeat(1025), now, true, true).is_none());
    assert!(consume_operator(&slot, &payload, now + Duration::from_secs(20), true, true).is_none());
    assert!(consume_operator(&slot, &payload, now, true, true).is_some());
    assert!(consume_operator(&slot, &payload, now, true, true).is_none());
  }
  #[test]
  fn synthetic_qa_dom_operator_marker_is_atomic_and_never_overwrites() {
    let folder = std::env::temp_dir().join(format!("qa-operator-marker-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir(&folder).unwrap();
    let path = folder.join("qa-visible-go.json");
    let payload = br#"{"run_id":"fixture","bundle_id":"qa.fixture"}"#;
    install_marker(&path, payload).unwrap();
    assert_eq!(std::fs::read(&path).unwrap(), payload);
    assert!(install_marker(&path, b"replacement").is_err());
    assert_eq!(std::fs::read(&path).unwrap(), payload);
    assert!(!path.with_extension("native-tmp").exists());
    std::fs::remove_file(&path).unwrap();
    #[cfg(unix)] {
      let target = folder.join("target");
      std::fs::write(&target, b"preserved").unwrap();
      std::os::unix::fs::symlink(&target, &path).unwrap();
      assert!(install_marker(&path, payload).is_err());
      assert_eq!(std::fs::read(target).unwrap(), b"preserved");
    }
    std::fs::remove_dir_all(folder).unwrap();
  }
  fn ticket(now: Instant) -> (Mutex<Option<Ticket>>, oneshot::Receiver<bool>) {
    let (s, r) = oneshot::channel();
    (
      Mutex::new(Some(Ticket {
        nonce: "fictional-nonce".into(),
        probe: Probe::Transcript,
        deadline: now + PROBE_LIMIT,
        sender: s,
      })),
      r,
    )
  }
  #[test]
  fn synthetic_qa_dom_results_are_nonce_bound_allowlisted_and_single_use() {
    let now = Instant::now();
    let (slot, mut receiver) = ticket(now);
    for bad in [
      r#"{"nonce":"wrong","probe":"transcript","passed":true}"#,
      r#"{"nonce":"fictional-nonce","probe":"slack_share","passed":true}"#,
      r#"{"nonce":"fictional-nonce","probe":"eval","passed":true}"#,
      r#"{"nonce":"fictional-nonce","probe":"transcript","passed":true,"script":"arbitrary"}"#,
    ] {
      accept(&slot, bad, now);
      assert!(slot.lock().unwrap().is_some());
    }
    accept(
      &slot,
      r#"{"nonce":"fictional-nonce","probe":"transcript","passed":true}"#,
      now,
    );
    assert_eq!(receiver.try_recv().unwrap(), true);
    assert!(slot.lock().unwrap().is_none());
    accept(
      &slot,
      r#"{"nonce":"fictional-nonce","probe":"transcript","passed":false}"#,
      now,
    );
    assert!(slot.lock().unwrap().is_none());
  }
  #[test]
  fn synthetic_qa_dom_expired_or_oversized_results_are_ignored() {
    let now = Instant::now();
    let (slot, _) = ticket(now);
    accept(&slot, &"x".repeat(257), now);
    assert!(slot.lock().unwrap().is_some());
    accept(
      &slot,
      r#"{"nonce":"fictional-nonce","probe":"transcript","passed":true}"#,
      now + PROBE_LIMIT,
    );
    assert!(slot.lock().unwrap().is_some());
  }
  #[test]
  fn synthetic_qa_dom_preflight_gate_requires_compiled_identity() {
    let valid = serde_json::json!({"run_id":option_env!("KNAPSACK_QA_BUILD_RUN_ID").unwrap(),"bundle_id":option_env!("KNAPSACK_QA_BUILD_BUNDLE_ID").unwrap()});
    assert!(gate_matches(&valid.to_string()));
    assert!(!gate_matches(r#"{"run_id":"wrong","bundle_id":"wrong"}"#));
    assert!(!gate_matches(&"x".repeat(513)));
  }
  #[test]
  fn synthetic_qa_dom_script_contains_only_fixed_dispatch_and_serialized_values() {
    let s = script(Probe::MeetingLink, "fictional\";alert(1)//");
    assert!(s.contains("__knapsackNativeQaProbe(\"meeting_link\",\"fictional\\\";alert(1)//\")"));
    assert!(!s.contains("fetch("));
    assert_eq!(PROBES.len(), 7);
    assert_eq!(PROBE_LIMIT.as_secs(), 5);
    assert_eq!(SUITE_LIMIT.as_secs(), 30);
  }
  #[tokio::test]
  async fn synthetic_qa_dom_wait_has_a_hard_timeout() {
    let (_sender, receiver) = oneshot::channel::<bool>();
    assert!(tokio::time::timeout(Duration::from_millis(10), receiver)
      .await
      .is_err());
  }
}
