use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use super::gbrain::default_brain_root;
use crate::db::models::email::Email;

const LOOP_STORE_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LoopMaturity {
  Observe,
  Shadow,
  Prepare,
  Supervised,
  ExceptionOnly,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LoopDefinitionStatus {
  Draft,
  Active,
  Paused,
  Deleted,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LoopRunStatus {
  Queued,
  GatheringContext,
  Preparing,
  WaitingForApproval,
  Executing,
  Verifying,
  Completed,
  Blocked,
  Failed,
  Cancelled,
  Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LoopCandidateStatus {
  Proposed,
  Accepted,
  Dismissed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum VerificationMethod {
  SystemRecord,
  DeterministicCheck,
  HumanApproval,
  DeferredOutcome,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ApprovalDecision {
  Pending,
  Approved,
  Rejected,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoopTrigger {
  pub kind: String,
  pub source: Option<String>,
  pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerificationRule {
  pub id: String,
  pub label: String,
  pub method: VerificationMethod,
  pub source: Option<String>,
  pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApprovalPolicy {
  pub required_before_execution: bool,
  pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoopDefinition {
  pub schema_version: u32,
  pub id: String,
  pub name: String,
  pub description: String,
  pub category: String,
  pub maturity: LoopMaturity,
  pub status: LoopDefinitionStatus,
  pub trigger: LoopTrigger,
  pub desired_outcome: String,
  pub approval_policy: ApprovalPolicy,
  pub verification_rules: Vec<VerificationRule>,
  pub created_at: u64,
  pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct LoopEvidence {
  pub id: String,
  pub verification_id: String,
  pub label: String,
  pub source: String,
  pub details: Option<String>,
  pub verified: bool,
  pub observed_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PreparedArtifact {
  pub title: String,
  pub body: String,
  pub format: String,
  pub created_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoopCandidate {
  pub id: String,
  pub loop_id: String,
  pub signal_id: String,
  pub signal_type: String,
  pub title: String,
  pub reason: String,
  pub confidence: f32,
  pub context: Option<String>,
  pub account_identity: Option<String>,
  #[serde(default)]
  pub target_identity: Option<String>,
  pub status: LoopCandidateStatus,
  pub observed_at: u64,
  pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoopRunEvent {
  pub from: Option<LoopRunStatus>,
  pub to: LoopRunStatus,
  pub at: u64,
  pub note: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoopRun {
  pub id: String,
  pub loop_id: String,
  pub status: LoopRunStatus,
  pub approval: Option<ApprovalDecision>,
  #[serde(default)]
  pub candidate_id: Option<String>,
  #[serde(default)]
  pub subject: Option<String>,
  #[serde(default)]
  pub context: Option<String>,
  #[serde(default)]
  pub account_identity: Option<String>,
  #[serde(default)]
  pub target_identity: Option<String>,
  #[serde(default)]
  pub prepared_artifact: Option<PreparedArtifact>,
  pub evidence: Vec<LoopEvidence>,
  pub events: Vec<LoopRunEvent>,
  pub started_at: u64,
  pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoopStore {
  schema_version: u32,
  definitions: Vec<LoopDefinition>,
  runs: Vec<LoopRun>,
  #[serde(default)]
  candidates: Vec<LoopCandidate>,
}

impl Default for LoopStore {
  fn default() -> Self {
    Self {
      schema_version: LOOP_STORE_SCHEMA_VERSION,
      definitions: Vec::new(),
      runs: Vec::new(),
      candidates: Vec::new(),
    }
  }
}

fn now() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map(|duration| duration.as_secs())
    .unwrap_or(0)
}

fn resolve_root(brain_root: &str) -> PathBuf {
  let value = brain_root.trim();
  if value.is_empty() {
    default_brain_root()
  } else {
    PathBuf::from(value)
  }
}

fn store_path(brain_root: &str) -> PathBuf {
  resolve_root(brain_root)
    .join(".knapsack")
    .join("loops-v1.json")
}

fn read_store(path: &Path) -> Result<LoopStore, String> {
  if !path.exists() {
    return Ok(LoopStore::default());
  }
  let contents = std::fs::read_to_string(path)
    .map_err(|error| format!("Cannot read loop registry: {}", error))?;
  let store: LoopStore = serde_json::from_str(&contents)
    .map_err(|error| format!("Loop registry is not valid: {}", error))?;
  if store.schema_version != LOOP_STORE_SCHEMA_VERSION {
    return Err(format!(
      "Unsupported loop registry version: {}",
      store.schema_version
    ));
  }
  Ok(store)
}

fn write_store(path: &Path, store: &LoopStore) -> Result<(), String> {
  let parent = path.parent().ok_or("Loop registry path has no parent")?;
  std::fs::create_dir_all(parent)
    .map_err(|error| format!("Cannot create loop registry directory: {}", error))?;

  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    std::fs::set_permissions(parent, std::fs::Permissions::from_mode(0o700))
      .map_err(|error| format!("Cannot protect loop registry directory: {}", error))?;
  }

  let temporary = path.with_extension("json.tmp");
  let encoded = serde_json::to_vec_pretty(store)
    .map_err(|error| format!("Cannot encode loop registry: {}", error))?;
  std::fs::write(&temporary, encoded)
    .map_err(|error| format!("Cannot write loop registry: {}", error))?;

  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    std::fs::set_permissions(&temporary, std::fs::Permissions::from_mode(0o600))
      .map_err(|error| format!("Cannot protect loop registry: {}", error))?;
  }

  std::fs::rename(&temporary, path)
    .map_err(|error| format!("Cannot commit loop registry: {}", error))
}

fn transition_allowed(from: &LoopRunStatus, to: &LoopRunStatus) -> bool {
  use LoopRunStatus::*;
  matches!(
    (from, to),
    (Queued, GatheringContext)
      | (Queued, Cancelled)
      | (Queued, Expired)
      | (GatheringContext, Preparing)
      | (GatheringContext, Blocked)
      | (GatheringContext, Failed)
      | (GatheringContext, Cancelled)
      | (GatheringContext, Expired)
      | (Preparing, WaitingForApproval)
      | (Preparing, Executing)
      | (Preparing, Blocked)
      | (Preparing, Failed)
      | (Preparing, Cancelled)
      | (Preparing, Expired)
      | (WaitingForApproval, Executing)
      | (WaitingForApproval, Cancelled)
      | (WaitingForApproval, Blocked)
      | (WaitingForApproval, Expired)
      | (Executing, Verifying)
      | (Executing, Blocked)
      | (Executing, Failed)
      | (Executing, Cancelled)
      | (Verifying, Completed)
      | (Verifying, Blocked)
      | (Verifying, Failed)
      | (Verifying, Cancelled)
      | (Blocked, GatheringContext)
      | (Blocked, Preparing)
      | (Blocked, WaitingForApproval)
      | (Blocked, Cancelled)
      | (Blocked, Expired)
  )
}

fn required_verification_is_complete(
  definition: &LoopDefinition,
  evidence: &[LoopEvidence],
) -> bool {
  definition.verification_rules.iter().all(|rule| {
    !rule.required
      || evidence
        .iter()
        .any(|item| item.verification_id == rule.id && item.verified)
  })
}

fn is_durable_receipt(value: &str) -> bool {
  let trimmed = value.trim();
  let has_record_shape = trimmed.contains(':')
    || trimmed.contains('-')
    || trimmed.contains('/')
    || trimmed.contains('@');
  trimmed.len() >= 12
    && has_record_shape
    && trimmed.chars().any(|character| character.is_ascii_digit())
}

fn is_independent_source(value: &str) -> bool {
  !matches!(
    value.trim().to_ascii_lowercase().as_str(),
    "model" | "agent" | "assistant" | "self reported" | "self-reported"
  )
}

fn apply_transition(
  definition: &LoopDefinition,
  run: &mut LoopRun,
  next_status: LoopRunStatus,
  evidence: Vec<LoopEvidence>,
  note: Option<String>,
) -> Result<(), String> {
  if !transition_allowed(&run.status, &next_status) {
    return Err(format!(
      "Loop cannot move from {:?} to {:?}",
      run.status, next_status
    ));
  }

  for item in evidence {
    let rule = definition
      .verification_rules
      .iter()
      .find(|rule| rule.id == item.verification_id)
      .ok_or_else(|| {
        format!(
          "Evidence references unknown verification rule: {}",
          item.verification_id
        )
      })?;
    if item.verified && item.source.trim().is_empty() {
      return Err("Verified evidence must name its source".to_string());
    }
    if item.verified
      && matches!(
        rule.method,
        VerificationMethod::SystemRecord | VerificationMethod::DeferredOutcome
      )
      && !item
        .details
        .as_deref()
        .map(is_durable_receipt)
        .unwrap_or(false)
    {
      return Err("Authoritative or deferred evidence needs a durable receipt".to_string());
    }
    if item.verified
      && matches!(
        rule.method,
        VerificationMethod::SystemRecord | VerificationMethod::DeferredOutcome
      )
      && !is_independent_source(&item.source)
    {
      return Err("Authoritative evidence must come from an independent source".to_string());
    }
    if item.verified
      && rule.method == VerificationMethod::HumanApproval
      && run.approval != Some(ApprovalDecision::Approved)
    {
      return Err("Human-approval evidence requires a recorded approval".to_string());
    }
    if let Some(existing) = run.evidence.iter().find(|row| row.id == item.id) {
      if existing != &item {
        return Err("Evidence history is append-only; use a new evidence id".to_string());
      }
    } else {
      run.evidence.push(item);
    }
  }

  if next_status == LoopRunStatus::Executing {
    if matches!(
      definition.maturity,
      LoopMaturity::Observe | LoopMaturity::Shadow | LoopMaturity::Prepare
    ) {
      return Err("This loop is not mature enough to execute actions".to_string());
    }

    if (definition.maturity == LoopMaturity::Supervised
      || definition.approval_policy.required_before_execution)
      && run.approval != Some(ApprovalDecision::Approved)
    {
      return Err("This loop requires approval before execution".to_string());
    }
  }

  if next_status == LoopRunStatus::Completed
    && !required_verification_is_complete(definition, &run.evidence)
  {
    return Err("Required completion evidence is missing".to_string());
  }

  let changed_at = now();
  let previous = run.status.clone();
  run.status = next_status.clone();
  run.updated_at = changed_at;
  run.events.push(LoopRunEvent {
    from: Some(previous),
    to: next_status,
    at: changed_at,
    note,
  });
  Ok(())
}

#[tauri::command]
pub fn kn_loop_list_definitions(brain_root: String) -> Result<Vec<LoopDefinition>, String> {
  Ok(
    read_store(&store_path(&brain_root))?
      .definitions
      .into_iter()
      .filter(|definition| definition.status != LoopDefinitionStatus::Deleted)
      .collect(),
  )
}

#[tauri::command]
pub fn kn_loop_list_candidates(brain_root: String) -> Result<Vec<LoopCandidate>, String> {
  let mut candidates = read_store(&store_path(&brain_root))?.candidates;
  candidates.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
  Ok(candidates)
}

fn email_needs_response(email: &Email) -> Option<f32> {
  if email.account_email.trim().is_empty()
    || email.is_deleted.unwrap_or(false)
    || email.is_archived.unwrap_or(false)
    || email
      .sender
      .to_lowercase()
      .contains(&email.account_email.to_lowercase())
  {
    return None;
  }
  let text = format!("{} {}", email.subject, email.body).to_lowercase();
  let direct_cues = [
    "please",
    "could you",
    "can you",
    "would you",
    "let me know",
    "action required",
    "please review",
    "please approve",
    "please confirm",
  ];
  let direct_cue_count = direct_cues
    .iter()
    .filter(|cue| text.contains(**cue))
    .count();
  let has_question = text.contains('?');
  if direct_cue_count == 0 && !(has_question && email.is_starred.unwrap_or(false)) {
    return None;
  }
  let mut confidence: f32 = 0.64 + (direct_cue_count.min(3) as f32 * 0.08);
  if has_question {
    confidence += 0.04;
  }
  if email.is_starred.unwrap_or(false) {
    confidence += 0.10;
  }
  if email.is_read == Some(false) {
    confidence += 0.04;
  }
  Some(confidence.min(0.98))
}

#[tauri::command]
pub fn kn_loop_discover_email_candidates(
  brain_root: String,
  limit: Option<usize>,
) -> Result<Vec<LoopCandidate>, String> {
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let observed_at = now();
  let mut discovered = Vec::new();

  for email in Email::get_recent_emails(limit.unwrap_or(50).min(100)) {
    let Some(confidence) = email_needs_response(&email) else {
      continue;
    };
    let signal_id = format!("email:{}:{}", email.account_email, email.email_uid);
    if let Some(existing) = store
      .candidates
      .iter()
      .find(|row| row.loop_id == "starter-inbox-response" && row.signal_id == signal_id)
    {
      discovered.push(existing.clone());
      continue;
    }
    let body_excerpt: String = email.body.chars().take(24_000).collect();
    let candidate = LoopCandidate {
      id: format!("candidate-email-{}", Uuid::new_v4()),
      loop_id: "starter-inbox-response".to_string(),
      signal_id,
      signal_type: "inbound_email_needs_response".to_string(),
      title: email.subject.clone(),
      reason: format!(
        "An inbound message from {} appears to request a response.",
        email.sender
      ),
      confidence,
      context: Some(format!(
        "From: {}\nTo: {}\nCC: {}\nConnected account: {}\nDate: {}\nSubject: {}\n\n{}",
        email.sender,
        email.recipient,
        email.cc,
        email.account_email,
        email.date,
        email.subject,
        body_excerpt
      )),
      account_identity: Some(email.account_email),
      target_identity: Some(email.sender),
      status: LoopCandidateStatus::Proposed,
      observed_at,
      updated_at: observed_at,
    };
    store.candidates.push(candidate.clone());
    discovered.push(candidate);
  }
  write_store(&path, &store)?;
  discovered.sort_by(|a, b| b.confidence.total_cmp(&a.confidence));
  Ok(discovered)
}

#[tauri::command]
pub fn kn_loop_observe_candidate(
  brain_root: String,
  mut candidate: LoopCandidate,
) -> Result<LoopCandidate, String> {
  if candidate.id.trim().is_empty()
    || candidate.loop_id.trim().is_empty()
    || candidate.signal_id.trim().is_empty()
    || candidate.title.trim().is_empty()
  {
    return Err("A candidate needs an id, loop id, signal id, and title".to_string());
  }
  if !(0.0..=1.0).contains(&candidate.confidence) {
    return Err("Candidate confidence must be between 0 and 1".to_string());
  }

  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  if let Some(existing) = store
    .candidates
    .iter()
    .find(|row| row.loop_id == candidate.loop_id && row.signal_id == candidate.signal_id)
  {
    return Ok(existing.clone());
  }

  let observed_at = now();
  candidate.status = LoopCandidateStatus::Proposed;
  candidate.observed_at = observed_at;
  candidate.updated_at = observed_at;
  store.candidates.push(candidate.clone());
  write_store(&path, &store)?;
  Ok(candidate)
}

#[tauri::command]
pub fn kn_loop_decide_candidate(
  brain_root: String,
  candidate_id: String,
  decision: LoopCandidateStatus,
) -> Result<LoopCandidate, String> {
  if decision == LoopCandidateStatus::Proposed {
    return Err("A candidate decision must be accepted or dismissed".to_string());
  }
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let candidate = store
    .candidates
    .iter_mut()
    .find(|row| row.id == candidate_id)
    .ok_or("Loop candidate not found")?;
  candidate.status = decision;
  candidate.updated_at = now();
  let result = candidate.clone();
  write_store(&path, &store)?;
  Ok(result)
}

#[tauri::command]
pub fn kn_loop_upsert_definition(
  brain_root: String,
  mut definition: LoopDefinition,
) -> Result<LoopDefinition, String> {
  if definition.id.trim().is_empty()
    || definition.name.trim().is_empty()
    || definition.desired_outcome.trim().is_empty()
    || definition.verification_rules.is_empty()
  {
    return Err("A loop needs an id, name, desired outcome, and verification rules".to_string());
  }

  definition.schema_version = LOOP_STORE_SCHEMA_VERSION;
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let changed_at = now();
  definition.updated_at = changed_at;

  if let Some(existing) = store
    .definitions
    .iter_mut()
    .find(|row| row.id == definition.id)
  {
    definition.created_at = existing.created_at;
    *existing = definition.clone();
  } else {
    definition.created_at = changed_at;
    store.definitions.push(definition.clone());
  }

  write_store(&path, &store)?;
  Ok(definition)
}

#[tauri::command]
pub fn kn_loop_delete_definition(
  brain_root: String,
  loop_id: String,
) -> Result<LoopDefinition, String> {
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let definition = store
    .definitions
    .iter_mut()
    .find(|row| row.id == loop_id)
    .ok_or("Loop definition not found")?;
  definition.status = LoopDefinitionStatus::Deleted;
  definition.updated_at = now();
  for candidate in store.candidates.iter_mut().filter(|candidate| {
    candidate.loop_id == loop_id && candidate.status == LoopCandidateStatus::Proposed
  }) {
    candidate.status = LoopCandidateStatus::Dismissed;
    candidate.updated_at = definition.updated_at;
  }
  let result = definition.clone();
  write_store(&path, &store)?;
  Ok(result)
}

#[tauri::command]
pub fn kn_loop_list_runs(
  brain_root: String,
  loop_id: Option<String>,
) -> Result<Vec<LoopRun>, String> {
  let mut runs = read_store(&store_path(&brain_root))?.runs;
  if let Some(id) = loop_id {
    runs.retain(|run| run.loop_id == id);
  }
  runs.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
  Ok(runs)
}

#[tauri::command]
pub fn kn_loop_start_run(
  brain_root: String,
  loop_id: String,
  run_id: String,
  candidate_id: Option<String>,
  subject: Option<String>,
  context: Option<String>,
  account_identity: Option<String>,
  target_identity: Option<String>,
) -> Result<LoopRun, String> {
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let definition = store
    .definitions
    .iter()
    .find(|row| row.id == loop_id)
    .ok_or("Loop definition not found")?;
  if definition.status != LoopDefinitionStatus::Active {
    return Err("Only active loops can start a run".to_string());
  }
  if run_id.trim().is_empty() || store.runs.iter().any(|run| run.id == run_id) {
    return Err("A new, unique run id is required".to_string());
  }

  let started_at = now();
  let run = LoopRun {
    id: run_id,
    loop_id,
    status: LoopRunStatus::Queued,
    approval: definition
      .approval_policy
      .required_before_execution
      .then_some(ApprovalDecision::Pending),
    candidate_id,
    subject,
    context,
    account_identity,
    target_identity,
    prepared_artifact: None,
    evidence: Vec::new(),
    events: vec![LoopRunEvent {
      from: None,
      to: LoopRunStatus::Queued,
      at: started_at,
      note: Some("Loop run created".to_string()),
    }],
    started_at,
    updated_at: started_at,
  };
  store.runs.push(run.clone());
  write_store(&path, &store)?;
  Ok(run)
}

#[tauri::command]
pub fn kn_loop_set_prepared_artifact(
  brain_root: String,
  run_id: String,
  mut artifact: PreparedArtifact,
) -> Result<LoopRun, String> {
  if artifact.title.trim().is_empty() || artifact.body.trim().is_empty() {
    return Err("A prepared artifact needs a title and body".to_string());
  }
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let run = store
    .runs
    .iter_mut()
    .find(|row| row.id == run_id)
    .ok_or("Loop run not found")?;
  if run.status != LoopRunStatus::Preparing {
    return Err("Artifacts can only be attached while a run is preparing".to_string());
  }
  artifact.created_at = now();
  run.prepared_artifact = Some(artifact);
  let changed_at = now();
  run.updated_at = changed_at;
  run.events.push(LoopRunEvent {
    from: Some(run.status.clone()),
    to: run.status.clone(),
    at: changed_at,
    note: Some("Prepared artifact recorded".to_string()),
  });
  let result = run.clone();
  write_store(&path, &store)?;
  Ok(result)
}

#[tauri::command]
pub fn kn_loop_export(brain_root: String) -> Result<String, String> {
  let store = read_store(&store_path(&brain_root))?;
  serde_json::to_string_pretty(&store)
    .map_err(|error| format!("Cannot export loop registry: {}", error))
}

#[tauri::command]
pub fn kn_loop_import(brain_root: String, payload: String) -> Result<(), String> {
  let store: LoopStore = serde_json::from_str(&payload)
    .map_err(|error| format!("Loop import is not valid: {}", error))?;
  if store.schema_version != LOOP_STORE_SCHEMA_VERSION {
    return Err(format!(
      "Unsupported loop registry version: {}",
      store.schema_version
    ));
  }
  write_store(&store_path(&brain_root), &store)
}

#[tauri::command]
pub fn kn_loop_set_approval(
  brain_root: String,
  run_id: String,
  decision: ApprovalDecision,
) -> Result<LoopRun, String> {
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let run = store
    .runs
    .iter_mut()
    .find(|row| row.id == run_id)
    .ok_or("Loop run not found")?;
  if run.status != LoopRunStatus::WaitingForApproval {
    return Err("Approval can only be recorded while a run is waiting for approval".to_string());
  }
  run.approval = Some(decision);
  let changed_at = now();
  run.updated_at = changed_at;
  run.events.push(LoopRunEvent {
    from: Some(run.status.clone()),
    to: run.status.clone(),
    at: changed_at,
    note: Some("Approval decision recorded".to_string()),
  });
  let result = run.clone();
  write_store(&path, &store)?;
  Ok(result)
}

#[tauri::command]
pub fn kn_loop_transition_run(
  brain_root: String,
  run_id: String,
  next_status: LoopRunStatus,
  evidence: Vec<LoopEvidence>,
  note: Option<String>,
) -> Result<LoopRun, String> {
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let run_index = store
    .runs
    .iter()
    .position(|row| row.id == run_id)
    .ok_or("Loop run not found")?;
  let definition = store
    .definitions
    .iter()
    .find(|row| row.id == store.runs[run_index].loop_id)
    .cloned()
    .ok_or("Loop definition not found")?;

  apply_transition(
    &definition,
    &mut store.runs[run_index],
    next_status,
    evidence,
    note,
  )?;
  let result = store.runs[run_index].clone();
  write_store(&path, &store)?;
  Ok(result)
}

#[cfg(test)]
mod tests {
  use super::*;

  fn definition(requires_approval: bool) -> LoopDefinition {
    LoopDefinition {
      schema_version: 1,
      id: "invoice-payment".to_string(),
      name: "Invoice payment".to_string(),
      description: "Pay an approved invoice".to_string(),
      category: "finance".to_string(),
      maturity: LoopMaturity::Supervised,
      status: LoopDefinitionStatus::Active,
      trigger: LoopTrigger {
        kind: "event".to_string(),
        source: Some("accounting".to_string()),
        description: "Approved invoice arrives".to_string(),
      },
      desired_outcome: "Payment settles and the ledger reconciles".to_string(),
      approval_policy: ApprovalPolicy {
        required_before_execution: requires_approval,
        description: None,
      },
      verification_rules: vec![VerificationRule {
        id: "bank-settlement".to_string(),
        label: "Payment settled at the bank".to_string(),
        method: VerificationMethod::SystemRecord,
        source: Some("bank".to_string()),
        required: true,
      }],
      created_at: 0,
      updated_at: 0,
    }
  }

  fn run(status: LoopRunStatus) -> LoopRun {
    LoopRun {
      id: "run-1".to_string(),
      loop_id: "invoice-payment".to_string(),
      status,
      approval: Some(ApprovalDecision::Pending),
      candidate_id: None,
      subject: None,
      context: None,
      account_identity: None,
      target_identity: None,
      prepared_artifact: None,
      evidence: Vec::new(),
      events: Vec::new(),
      started_at: 0,
      updated_at: 0,
    }
  }

  #[test]
  fn consequential_execution_requires_approval() {
    let mut value = run(LoopRunStatus::WaitingForApproval);
    let result = apply_transition(
      &definition(true),
      &mut value,
      LoopRunStatus::Executing,
      Vec::new(),
      None,
    );
    assert_eq!(
      result.unwrap_err(),
      "This loop requires approval before execution"
    );
  }

  #[test]
  fn observation_mode_cannot_execute_even_with_approval() {
    let mut value = run(LoopRunStatus::WaitingForApproval);
    value.approval = Some(ApprovalDecision::Approved);
    let mut observed = definition(true);
    observed.maturity = LoopMaturity::Observe;
    let result = apply_transition(
      &observed,
      &mut value,
      LoopRunStatus::Executing,
      Vec::new(),
      None,
    );
    assert_eq!(
      result.unwrap_err(),
      "This loop is not mature enough to execute actions"
    );
  }

  #[test]
  fn completion_requires_verified_evidence() {
    let mut value = run(LoopRunStatus::Verifying);
    value.approval = Some(ApprovalDecision::Approved);
    let result = apply_transition(
      &definition(true),
      &mut value,
      LoopRunStatus::Completed,
      Vec::new(),
      None,
    );
    assert_eq!(
      result.unwrap_err(),
      "Required completion evidence is missing"
    );
  }

  #[test]
  fn verified_evidence_allows_completion() {
    let mut value = run(LoopRunStatus::Verifying);
    value.approval = Some(ApprovalDecision::Approved);
    let result = apply_transition(
      &definition(true),
      &mut value,
      LoopRunStatus::Completed,
      vec![LoopEvidence {
        id: "evidence-1".to_string(),
        verification_id: "bank-settlement".to_string(),
        label: "Bank receipt".to_string(),
        source: "bank".to_string(),
        details: Some("bank-receipt-123".to_string()),
        verified: true,
        observed_at: 1,
      }],
      None,
    );
    assert!(result.is_ok());
    assert_eq!(value.status, LoopRunStatus::Completed);
  }

  #[test]
  fn invalid_state_jump_is_rejected() {
    let mut value = run(LoopRunStatus::Queued);
    let result = apply_transition(
      &definition(false),
      &mut value,
      LoopRunStatus::Completed,
      Vec::new(),
      None,
    );
    assert!(result.is_err());
  }

  #[test]
  fn unknown_or_receiptless_evidence_is_rejected() {
    let mut value = run(LoopRunStatus::Verifying);
    value.approval = Some(ApprovalDecision::Approved);
    let unknown = apply_transition(
      &definition(true),
      &mut value,
      LoopRunStatus::Completed,
      vec![LoopEvidence {
        id: "evidence-1".to_string(),
        verification_id: "model-says-done".to_string(),
        label: "Model assertion".to_string(),
        source: "model".to_string(),
        details: Some("looks done".to_string()),
        verified: true,
        observed_at: 1,
      }],
      None,
    );
    assert!(unknown.unwrap_err().contains("unknown verification rule"));

    let receiptless = apply_transition(
      &definition(true),
      &mut value,
      LoopRunStatus::Completed,
      vec![LoopEvidence {
        id: "evidence-2".to_string(),
        verification_id: "bank-settlement".to_string(),
        label: "No receipt".to_string(),
        source: "bank".to_string(),
        details: None,
        verified: true,
        observed_at: 1,
      }],
      None,
    );
    assert_eq!(
      receiptless.unwrap_err(),
      "Authoritative or deferred evidence needs a durable receipt"
    );

    let self_reported = apply_transition(
      &definition(true),
      &mut value,
      LoopRunStatus::Completed,
      vec![LoopEvidence {
        id: "evidence-3".to_string(),
        verification_id: "bank-settlement".to_string(),
        label: "Agent assertion".to_string(),
        source: "model".to_string(),
        details: Some("model-receipt-123".to_string()),
        verified: true,
        observed_at: 1,
      }],
      None,
    );
    assert_eq!(
      self_reported.unwrap_err(),
      "Authoritative evidence must come from an independent source"
    );
  }

  #[test]
  fn durable_receipts_have_record_shape() {
    assert!(is_durable_receipt("bank-receipt-123"));
    assert!(is_durable_receipt(
      "https://workspace.slack.com/archives/C123/p456789"
    ));
    assert!(is_durable_receipt("sent:message-123"));
    assert!(!is_durable_receipt("looks complete"));
    assert!(!is_durable_receipt("model says 123"));
  }

  #[test]
  fn candidates_deduplicate_and_dismissal_is_sticky() {
    let root = std::env::temp_dir().join(format!("knapsack-loop-test-{}", now()));
    let root_string = root.to_string_lossy().to_string();
    let candidate = LoopCandidate {
      id: "candidate-1".to_string(),
      loop_id: "starter-meeting-follow-up".to_string(),
      signal_id: "meeting-42".to_string(),
      signal_type: "completed_recording".to_string(),
      title: "Weekly review".to_string(),
      reason: "Recording ended".to_string(),
      confidence: 0.98,
      context: Some("Transcript".to_string()),
      account_identity: Some("mark@example.com".to_string()),
      target_identity: Some("Pat <pat@example.com>".to_string()),
      status: LoopCandidateStatus::Proposed,
      observed_at: 0,
      updated_at: 0,
    };

    let first = kn_loop_observe_candidate(root_string.clone(), candidate.clone()).unwrap();
    let duplicate = kn_loop_observe_candidate(
      root_string.clone(),
      LoopCandidate {
        id: "candidate-duplicate".to_string(),
        ..candidate
      },
    )
    .unwrap();
    assert_eq!(first.id, duplicate.id);
    let dismissed = kn_loop_decide_candidate(
      root_string.clone(),
      first.id.clone(),
      LoopCandidateStatus::Dismissed,
    )
    .unwrap();
    assert_eq!(dismissed.status, LoopCandidateStatus::Dismissed);
    let rows = kn_loop_list_candidates(root_string).unwrap();
    assert_eq!(rows.len(), 1);
    assert_eq!(rows[0].status, LoopCandidateStatus::Dismissed);
    let _ = std::fs::remove_dir_all(root);
  }

  #[test]
  fn export_import_round_trip_preserves_canonical_store() {
    let source = std::env::temp_dir().join(format!("knapsack-loop-export-{}", now()));
    let target = std::env::temp_dir().join(format!("knapsack-loop-import-{}", now()));
    let source_string = source.to_string_lossy().to_string();
    let target_string = target.to_string_lossy().to_string();
    kn_loop_upsert_definition(source_string.clone(), definition(true)).unwrap();
    let exported = kn_loop_export(source_string).unwrap();
    kn_loop_import(target_string.clone(), exported.clone()).unwrap();
    let reexported = kn_loop_export(target_string).unwrap();
    assert_eq!(exported, reexported);
    let _ = std::fs::remove_dir_all(source);
    let _ = std::fs::remove_dir_all(target);
  }

  #[test]
  fn deleting_a_definition_hides_it_but_preserves_history_in_export() {
    let root = std::env::temp_dir().join(format!("knapsack-loop-delete-{}", Uuid::new_v4()));
    let root_string = root.to_string_lossy().to_string();
    kn_loop_upsert_definition(root_string.clone(), definition(true)).unwrap();
    let deleted =
      kn_loop_delete_definition(root_string.clone(), "invoice-payment".to_string()).unwrap();
    assert_eq!(deleted.status, LoopDefinitionStatus::Deleted);
    assert!(kn_loop_list_definitions(root_string.clone())
      .unwrap()
      .is_empty());
    let exported = kn_loop_export(root_string).unwrap();
    assert!(exported.contains("invoice-payment"));
    assert!(exported.contains("deleted"));
    let _ = std::fs::remove_dir_all(root);
  }

  #[test]
  fn email_candidate_detection_is_inbound_and_request_driven() {
    let base = Email {
      id: Some(7),
      email_uid: "message-7".to_string(),
      thread_id: Some("thread-1".to_string()),
      subject: "Proposal".to_string(),
      date: 1,
      sender: "Paula <paula@example.com>".to_string(),
      recipient: "Mark <mark@example.com>".to_string(),
      cc: String::new(),
      body: "Could you please review and let me know?".to_string(),
      is_starred: Some(true),
      is_read: Some(false),
      is_archived: Some(false),
      is_deleted: Some(false),
      account_email: "mark@example.com".to_string(),
    };
    assert!(email_needs_response(&base).unwrap() > 0.8);

    let outbound = Email {
      sender: "Mark <mark@example.com>".to_string(),
      ..base.clone()
    };
    assert_eq!(email_needs_response(&outbound), None);

    let newsletter = Email {
      body: "Your weekly news digest".to_string(),
      subject: "Newsletter".to_string(),
      ..base
    };
    assert_eq!(email_needs_response(&newsletter), None);
  }
}
