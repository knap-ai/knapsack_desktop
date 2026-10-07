// Mirrors v1 persisted models. Fail closed on unknown fields/statuses; update
// intentionally when the native schema changes. Never deserialize runtime config.
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LoopMaturity {
  Observe,
  Shadow,
  Prepare,
  Supervised,
  ExceptionOnly,
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LoopDefinitionStatus {
  Draft,
  Active,
  Paused,
  Deleted,
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
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

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LoopCandidateStatus {
  Proposed,
  Accepted,
  Dismissed,
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum VerificationMethod {
  SystemRecord,
  DeterministicCheck,
  HumanApproval,
  DeferredOutcome,
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ApprovalDecision {
  Pending,
  Approved,
  Rejected,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct LoopTrigger {
  pub kind: String,
  pub source: Option<String>,
  pub description: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct VerificationRule {
  pub id: String,
  pub label: String,
  pub method: VerificationMethod,
  pub source: Option<String>,
  pub required: bool,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ApprovalPolicy {
  pub required_before_execution: bool,
  pub description: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
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

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct LoopEvidence {
  pub id: String,
  pub verification_id: String,
  pub label: String,
  pub source: String,
  pub details: Option<String>,
  pub verified: bool,
  pub observed_at: u64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PreparedArtifact {
  pub title: String,
  pub body: String,
  pub format: String,
  pub created_at: u64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
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

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct LoopRunEvent {
  pub from: Option<LoopRunStatus>,
  pub to: LoopRunStatus,
  pub at: u64,
  pub note: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
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

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct LoopStore {
  pub(super) schema_version: u32,
  pub(super) definitions: Vec<LoopDefinition>,
  runs: Vec<LoopRun>,
  #[serde(default)]
  candidates: Vec<LoopCandidate>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Proposal {
  pub action: String,
  pub owner: String,
  pub quote: String,
  pub draft: String,
}
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct FollowThrough {
  pub id: String,
  pub run_id: String,
  pub proposal: Proposal,
  pub status: String,
  pub due_at: Option<u64>,
  pub account: Option<String>,
  pub recipient: Option<String>,
  pub sent_id: Option<String>,
  pub thread_id: Option<String>,
  pub reply_id: Option<String>,
  pub last_checked_at: Option<u64>,
  pub next_check_at: Option<u64>,
  pub check_error: Option<String>,
  pub revision: u64,
  #[serde(default)]
  pub history: Vec<FollowThroughEvent>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FollowThroughEvent {
  pub at: u64,
  pub status: String,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct FollowStore {
  schema_version: u32,
  items: Vec<FollowThrough>,
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum GoalStatus {
  Draft,
  Active,
  AtRisk,
  Achieved,
  Paused,
  Deleted,
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MetricDirection {
  Increase,
  Decrease,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct GoalKeyResult {
  pub id: String,
  pub title: String,
  pub unit: Option<String>,
  pub baseline: Option<f64>,
  pub target: Option<f64>,
  pub deadline: Option<String>,
  pub authoritative_source: Option<String>,
  pub direction: MetricDirection,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct GoalLoopLink {
  pub loop_id: String,
  pub key_result_id: String,
  pub driver: String,
  pub expected_contribution: String,
  pub leading_indicator: bool,
  pub review_cadence: String,
  pub falsification: String,
}

#[derive(Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct GoalObservation {
  pub id: String,
  pub goal_id: String,
  pub key_result_id: String,
  pub value: f64,
  pub source: String,
  pub source_record: String,
  pub observed_at: u64,
  pub verified: bool,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct GoalDefinition {
  pub schema_version: u32,
  pub id: String,
  pub name: String,
  pub objective: String,
  pub owner: Option<String>,
  #[serde(default)]
  pub collaborators: Vec<String>,
  pub status: GoalStatus,
  #[serde(default)]
  pub key_results: Vec<GoalKeyResult>,
  #[serde(default)]
  pub loop_links: Vec<GoalLoopLink>,
  #[serde(default)]
  pub constraints: Vec<String>,
  #[serde(default)]
  pub non_goals: Vec<String>,
  pub created_at: u64,
  pub updated_at: u64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct GoalStore {
  pub(super) schema_version: u32,
  pub(super) goals: Vec<GoalDefinition>,
  observations: Vec<GoalObservation>,
}
