use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use super::gbrain::default_brain_root;

const GOAL_STORE_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum GoalStatus {
  Draft,
  Active,
  AtRisk,
  Achieved,
  Paused,
  Deleted,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MetricDirection {
  Increase,
  Decrease,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoalLoopLink {
  pub loop_id: String,
  pub key_result_id: String,
  pub driver: String,
  pub expected_contribution: String,
  pub leading_indicator: bool,
  pub review_cadence: String,
  pub falsification: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoalAssessment {
  pub goal: GoalDefinition,
  pub observations: Vec<GoalObservation>,
  pub missing_fields: Vec<String>,
  pub uncovered_key_result_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GoalStore {
  schema_version: u32,
  goals: Vec<GoalDefinition>,
  observations: Vec<GoalObservation>,
}

impl Default for GoalStore {
  fn default() -> Self {
    Self {
      schema_version: GOAL_STORE_SCHEMA_VERSION,
      goals: Vec::new(),
      observations: Vec::new(),
    }
  }
}

fn now() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map(|duration| duration.as_secs())
    .unwrap_or(0)
}

fn store_path(brain_root: &str) -> PathBuf {
  let root = if brain_root.trim().is_empty() {
    default_brain_root()
  } else {
    PathBuf::from(brain_root.trim())
  };
  root.join(".knapsack").join("goals-v1.json")
}

fn read_store(path: &Path) -> Result<GoalStore, String> {
  if !path.exists() {
    return Ok(GoalStore::default());
  }
  let contents = std::fs::read_to_string(path)
    .map_err(|error| format!("Cannot read goal registry: {}", error))?;
  let store: GoalStore = serde_json::from_str(&contents)
    .map_err(|error| format!("Goal registry is not valid: {}", error))?;
  if store.schema_version != GOAL_STORE_SCHEMA_VERSION {
    return Err(format!(
      "Unsupported goal registry version: {}",
      store.schema_version
    ));
  }
  Ok(store)
}

fn write_store(path: &Path, store: &GoalStore) -> Result<(), String> {
  let parent = path.parent().ok_or("Goal registry path has no parent")?;
  std::fs::create_dir_all(parent)
    .map_err(|error| format!("Cannot create goal registry directory: {}", error))?;
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    std::fs::set_permissions(parent, std::fs::Permissions::from_mode(0o700))
      .map_err(|error| format!("Cannot protect goal registry directory: {}", error))?;
  }
  let temporary = path.with_extension("json.tmp");
  std::fs::write(
    &temporary,
    serde_json::to_vec_pretty(store)
      .map_err(|error| format!("Cannot encode goal registry: {}", error))?,
  )
  .map_err(|error| format!("Cannot write goal registry: {}", error))?;
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    std::fs::set_permissions(&temporary, std::fs::Permissions::from_mode(0o600))
      .map_err(|error| format!("Cannot protect goal registry: {}", error))?;
  }
  std::fs::rename(&temporary, path)
    .map_err(|error| format!("Cannot commit goal registry: {}", error))
}

fn meaningful(value: &Option<String>) -> bool {
  value
    .as_deref()
    .map(str::trim)
    .is_some_and(|value| !value.is_empty())
}

fn missing_fields(goal: &GoalDefinition) -> Vec<String> {
  let mut missing = Vec::new();
  if goal.name.trim().is_empty() {
    missing.push("Goal name".to_string());
  }
  if goal.objective.trim().is_empty() {
    missing.push("Objective".to_string());
  }
  if !meaningful(&goal.owner) {
    missing.push("Owner".to_string());
  }
  if goal.key_results.is_empty() {
    missing.push("At least one measurable key result".to_string());
  }
  for (index, result) in goal.key_results.iter().enumerate() {
    let label = if result.title.trim().is_empty() {
      format!("Key result {}", index + 1)
    } else {
      result.title.clone()
    };
    if result.baseline.is_none() {
      missing.push(format!("{} baseline", label));
    }
    if result.target.is_none() {
      missing.push(format!("{} target", label));
    }
    if !meaningful(&result.unit) {
      missing.push(format!("{} unit", label));
    }
    if !meaningful(&result.deadline) {
      missing.push(format!("{} deadline", label));
    }
    if !meaningful(&result.authoritative_source) {
      missing.push(format!("{} authoritative source", label));
    }
  }
  missing
}

fn target_reached(result: &GoalKeyResult, value: f64) -> bool {
  result.target.is_some_and(|target| match result.direction {
    MetricDirection::Increase => value >= target,
    MetricDirection::Decrease => value <= target,
  })
}

fn assess(goal: GoalDefinition, observations: &[GoalObservation]) -> GoalAssessment {
  let goal_observations: Vec<_> = observations
    .iter()
    .filter(|row| row.goal_id == goal.id)
    .cloned()
    .collect();
  let uncovered_key_result_ids = goal
    .key_results
    .iter()
    .filter(|result| {
      !goal
        .loop_links
        .iter()
        .any(|link| link.key_result_id == result.id)
    })
    .map(|result| result.id.clone())
    .collect();
  GoalAssessment {
    missing_fields: missing_fields(&goal),
    goal,
    observations: goal_observations,
    uncovered_key_result_ids,
  }
}

fn validate_goal(goal: &GoalDefinition, observations: &[GoalObservation]) -> Result<(), String> {
  if goal.id.trim().is_empty() {
    return Err("A goal needs a stable id".to_string());
  }
  let missing = missing_fields(goal);
  if goal.status != GoalStatus::Draft && !missing.is_empty() {
    return Err(format!(
      "Activate this goal after adding: {}",
      missing.join(", ")
    ));
  }
  for result in &goal.key_results {
    if result.id.trim().is_empty() || result.title.trim().is_empty() {
      return Err("Every key result needs an id and title".to_string());
    }
    if result.baseline.is_some() && result.baseline == result.target {
      return Err(format!(
        "{} needs different baseline and target values",
        result.title
      ));
    }
  }
  for link in &goal.loop_links {
    if !goal
      .key_results
      .iter()
      .any(|result| result.id == link.key_result_id)
    {
      return Err("A loop link references a key result outside this goal".to_string());
    }
    if link.loop_id.trim().is_empty()
      || link.driver.trim().is_empty()
      || link.falsification.trim().is_empty()
    {
      return Err("A loop link needs a loop, driver, and falsification condition".to_string());
    }
  }
  if goal.status == GoalStatus::Achieved {
    let all_reached = !goal.key_results.is_empty()
      && goal.key_results.iter().all(|result| {
        observations
          .iter()
          .filter(|row| row.goal_id == goal.id && row.key_result_id == result.id && row.verified)
          .max_by_key(|row| row.observed_at)
          .is_some_and(|row| target_reached(result, row.value))
      });
    if !all_reached {
      return Err(
        "A goal can only be achieved after every key result has verified target evidence"
          .to_string(),
      );
    }
  }
  Ok(())
}

#[tauri::command]
pub fn kn_goal_list(brain_root: String) -> Result<Vec<GoalAssessment>, String> {
  let store = read_store(&store_path(&brain_root))?;
  let mut goals: Vec<_> = store
    .goals
    .into_iter()
    .filter(|goal| goal.status != GoalStatus::Deleted)
    .map(|goal| assess(goal, &store.observations))
    .collect();
  goals.sort_by(|a, b| b.goal.updated_at.cmp(&a.goal.updated_at));
  Ok(goals)
}

#[tauri::command]
pub fn kn_goal_upsert(
  brain_root: String,
  mut goal: GoalDefinition,
) -> Result<GoalAssessment, String> {
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  validate_goal(&goal, &store.observations)?;
  goal.schema_version = GOAL_STORE_SCHEMA_VERSION;
  goal.updated_at = now();
  if let Some(existing) = store.goals.iter_mut().find(|row| row.id == goal.id) {
    goal.created_at = existing.created_at;
    *existing = goal.clone();
  } else {
    goal.created_at = goal.updated_at;
    store.goals.push(goal.clone());
  }
  write_store(&path, &store)?;
  Ok(assess(goal, &store.observations))
}

#[tauri::command]
pub fn kn_goal_add_observation(
  brain_root: String,
  observation: GoalObservation,
) -> Result<GoalAssessment, String> {
  if observation.id.trim().is_empty()
    || observation.goal_id.trim().is_empty()
    || observation.key_result_id.trim().is_empty()
  {
    return Err("An observation needs stable goal, key-result, and observation ids".to_string());
  }
  if !observation.value.is_finite() {
    return Err("An observation value must be finite".to_string());
  }
  if observation.verified
    && (observation.source.trim().is_empty() || observation.source_record.trim().len() < 8)
  {
    return Err(
      "Verified progress needs an authoritative source and durable source record".to_string(),
    );
  }
  if observation.verified
    && matches!(
      observation.source.trim().to_ascii_lowercase().as_str(),
      "model" | "agent" | "assistant" | "self-reported"
    )
  {
    return Err("A model or self-report cannot verify goal progress".to_string());
  }
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  if let Some(existing) = store
    .observations
    .iter()
    .find(|row| row.id == observation.id)
  {
    if existing == &observation {
      let goal = store
        .goals
        .iter()
        .find(|row| row.id == observation.goal_id)
        .cloned()
        .ok_or("Goal not found")?;
      return Ok(assess(goal, &store.observations));
    }
    return Err("Goal evidence is append-only; use a new observation id".to_string());
  }
  let goal = store
    .goals
    .iter()
    .find(|row| row.id == observation.goal_id)
    .cloned()
    .ok_or("Goal not found")?;
  if !goal
    .key_results
    .iter()
    .any(|result| result.id == observation.key_result_id)
  {
    return Err("Observation references an unknown key result".to_string());
  }
  store.observations.push(observation);
  write_store(&path, &store)?;
  Ok(assess(goal, &store.observations))
}

#[tauri::command]
pub fn kn_goal_delete(brain_root: String, goal_id: String) -> Result<GoalAssessment, String> {
  let path = store_path(&brain_root);
  let mut store = read_store(&path)?;
  let goal = store
    .goals
    .iter_mut()
    .find(|row| row.id == goal_id)
    .ok_or("Goal not found")?;
  goal.status = GoalStatus::Deleted;
  goal.updated_at = now();
  let result = goal.clone();
  write_store(&path, &store)?;
  Ok(assess(result, &store.observations))
}

#[cfg(test)]
mod tests {
  use super::*;

  fn draft(status: GoalStatus) -> GoalDefinition {
    GoalDefinition {
      schema_version: 1,
      id: "goal-retention".into(),
      name: "Improve retention".into(),
      objective: "Make the product indispensable".into(),
      owner: Some("Mark".into()),
      collaborators: vec![],
      status,
      key_results: vec![GoalKeyResult {
        id: "kr-retention".into(),
        title: "Raise 30-day retention".into(),
        unit: Some("%".into()),
        baseline: Some(40.0),
        target: Some(60.0),
        deadline: Some("2026-12-31".into()),
        authoritative_source: Some("Amplitude".into()),
        direction: MetricDirection::Increase,
      }],
      loop_links: vec![],
      constraints: vec![],
      non_goals: vec![],
      created_at: 0,
      updated_at: 0,
    }
  }

  #[test]
  fn active_goals_require_measurable_fields() {
    let mut goal = draft(GoalStatus::Active);
    goal.key_results[0].target = None;
    assert!(validate_goal(&goal, &[]).unwrap_err().contains("target"));
    goal.status = GoalStatus::Draft;
    assert!(validate_goal(&goal, &[]).is_ok());
  }

  #[test]
  fn achieved_requires_verified_target_observation() {
    let goal = draft(GoalStatus::Achieved);
    assert!(validate_goal(&goal, &[])
      .unwrap_err()
      .contains("verified target"));
    let observation = GoalObservation {
      id: "obs-1".into(),
      goal_id: goal.id.clone(),
      key_result_id: "kr-retention".into(),
      value: 61.0,
      source: "Amplitude".into(),
      source_record: "chart:retention-2026-12-31".into(),
      observed_at: 1,
      verified: true,
    };
    assert!(validate_goal(&goal, &[observation]).is_ok());
  }

  #[test]
  fn assessment_finds_uncovered_key_results() {
    let assessment = assess(draft(GoalStatus::Active), &[]);
    assert_eq!(assessment.uncovered_key_result_ids, vec!["kr-retention"]);
  }

  #[test]
  fn observations_are_independent_append_only_evidence() {
    let root = tempfile::tempdir().unwrap();
    let root_string = root.path().to_string_lossy().to_string();
    kn_goal_upsert(root_string.clone(), draft(GoalStatus::Active)).unwrap();

    let mut observation = GoalObservation {
      id: "obs-1".into(),
      goal_id: "goal-retention".into(),
      key_result_id: "kr-retention".into(),
      value: 61.0,
      source: "model".into(),
      source_record: "chart:retention-2026-12-31".into(),
      observed_at: 1,
      verified: true,
    };
    assert!(
      kn_goal_add_observation(root_string.clone(), observation.clone())
        .unwrap_err()
        .contains("cannot verify")
    );

    observation.source = "Amplitude".into();
    let saved = kn_goal_add_observation(root_string.clone(), observation.clone()).unwrap();
    assert_eq!(saved.observations.len(), 1);
    let duplicate = kn_goal_add_observation(root_string.clone(), observation.clone()).unwrap();
    assert_eq!(duplicate.observations.len(), 1);

    observation.value = 62.0;
    assert!(kn_goal_add_observation(root_string, observation)
      .unwrap_err()
      .contains("append-only"));
  }
}
