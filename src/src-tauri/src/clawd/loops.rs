use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use super::gbrain::default_brain_root;

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

#[derive(Debug, Clone, Serialize, Deserialize)]
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
}

impl Default for LoopStore {
  fn default() -> Self {
    Self {
      schema_version: LOOP_STORE_SCHEMA_VERSION,
      definitions: Vec::new(),
      runs: Vec::new(),
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
      | (GatheringContext, Preparing)
      | (GatheringContext, Blocked)
      | (GatheringContext, Failed)
      | (Preparing, WaitingForApproval)
      | (Preparing, Executing)
      | (Preparing, Blocked)
      | (Preparing, Failed)
      | (WaitingForApproval, Executing)
      | (WaitingForApproval, Cancelled)
      | (WaitingForApproval, Blocked)
      | (Executing, Verifying)
      | (Executing, Blocked)
      | (Executing, Failed)
      | (Verifying, Completed)
      | (Verifying, Blocked)
      | (Verifying, Failed)
      | (Blocked, GatheringContext)
      | (Blocked, Preparing)
      | (Blocked, WaitingForApproval)
      | (Blocked, Cancelled)
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
    if let Some(existing) = run.evidence.iter_mut().find(|row| row.id == item.id) {
      *existing = item;
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
  Ok(read_store(&store_path(&brain_root))?.definitions)
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
  run.approval = Some(decision);
  run.updated_at = now();
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
        details: None,
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
}
