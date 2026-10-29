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
  Boundaries,
}
const PROBES: [Probe; 6] = [
  Probe::Transcript,
  Probe::MeetingLink,
  Probe::ChatSelection,
  Probe::NotesEdit,
  Probe::SlackShare,
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
#[derive(Deserialize)]
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
async fn wait_for_preflight() -> bool {
  let Some(folder) = option_env!("KNAPSACK_QA_BUILD_STATE_DIR") else {
    return false;
  };
  let path = std::path::Path::new(folder).join("qa-dom-go.json");
  let end = Instant::now() + Duration::from_secs(45);
  while Instant::now() < end {
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
  if !enabled() || window.label() != "main" {
    return;
  }
  // The handle is created by this process, never selected by app name or AX.
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
      if !wait_for_preflight().await {
        save(vec![Row {
          probe: Probe::Transcript,
          status: Status::Watchdog,
        }]);
        window.unlisten(listener);
        window.app_handle().exit(1);
        return;
      }
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
    assert_eq!(PROBES.len(), 6);
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
