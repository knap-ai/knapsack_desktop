use crate::{Error, RestoreReport, Result, STRUCTURED_FILES};
use serde::{
  de::{self, DeserializeSeed, MapAccess, SeqAccess, Visitor},
  Deserialize,
};
use serde_json::{json, Value};
use std::{collections::HashSet, fmt};
#[path = "models.rs"]
mod models;

pub(crate) fn reject_duplicate_keys(bytes: &[u8]) -> Result<()> {
  struct Unique;
  impl<'de> DeserializeSeed<'de> for Unique {
    type Value = ();
    fn deserialize<D: de::Deserializer<'de>>(self, de: D) -> std::result::Result<(), D::Error> {
      de.deserialize_any(self)
    }
  }
  impl<'de> Visitor<'de> for Unique {
    type Value = ();
    fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
      f.write_str("unambiguous JSON")
    }
    fn visit_bool<E: de::Error>(self, _: bool) -> std::result::Result<(), E> {
      Ok(())
    }
    fn visit_i64<E: de::Error>(self, _: i64) -> std::result::Result<(), E> {
      Ok(())
    }
    fn visit_u64<E: de::Error>(self, _: u64) -> std::result::Result<(), E> {
      Ok(())
    }
    fn visit_f64<E: de::Error>(self, _: f64) -> std::result::Result<(), E> {
      Ok(())
    }
    fn visit_str<E: de::Error>(self, _: &str) -> std::result::Result<(), E> {
      Ok(())
    }
    fn visit_unit<E: de::Error>(self) -> std::result::Result<(), E> {
      Ok(())
    }
    fn visit_seq<A: SeqAccess<'de>>(self, mut seq: A) -> std::result::Result<(), A::Error> {
      while seq.next_element_seed(Unique)?.is_some() {}
      Ok(())
    }
    fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> std::result::Result<(), A::Error> {
      let mut keys = HashSet::<String>::new();
      while let Some(key) = map.next_key::<String>()? {
        if !keys.insert(key) {
          return Err(de::Error::custom("duplicate key"));
        }
        map.next_value_seed(Unique)?;
      }
      Ok(())
    }
  }
  let mut de = serde_json::Deserializer::from_slice(bytes);
  Unique
    .deserialize(&mut de)
    .map_err(|_| Error::InvalidSchema)?;
  de.end().map_err(|_| Error::InvalidSchema)
}
fn version(value: &Value, field: &str) -> Result<()> {
  match value.get(field).and_then(Value::as_u64) {
    Some(1) => Ok(()),
    Some(_) => Err(Error::UnsupportedVersion),
    None => Err(Error::InvalidSchema),
  }
}
fn parse(content: &str) -> Result<Value> {
  reject_duplicate_keys(content.as_bytes())?;
  serde_json::from_str(content).map_err(|_| Error::InvalidSchema)
}
fn typed<'a, T: Deserialize<'a>>(content: &'a str) -> Result<T> {
  serde_json::from_str(content).map_err(|_| Error::InvalidSchema)
}
fn unique_ids(rows: &[Value]) -> Result<()> {
  let mut seen = HashSet::new();
  for row in rows {
    let id = row
      .get("id")
      .and_then(Value::as_str)
      .filter(|s| !s.trim().is_empty())
      .ok_or(Error::InvalidSchema)?;
    if !seen.insert(id) {
      return Err(Error::InvalidSchema);
    }
  }
  Ok(())
}
fn check_decoded_strings(value: &Value) -> Result<()> {
  match value {
    Value::String(text) => crate::secrets::check(text)?,
    Value::Array(values) => {
      for value in values {
        check_decoded_strings(value)?;
      }
    }
    Value::Object(values) => {
      for (key, value) in values {
        crate::secrets::check(key)?;
        check_decoded_strings(value)?;
      }
    }
    _ => {}
  }
  Ok(())
}
pub(crate) fn validate(path: &str, content: &str) -> Result<()> {
  if !STRUCTURED_FILES.contains(&path) {
    return Ok(());
  }
  let value = parse(content)?;
  check_decoded_strings(&value)?;
  match path {
    ".knapsack/loops-v1.json" => {
      version(&value, "schemaVersion")?;
      let store: models::LoopStore = typed(content)?;
      for definition in &store.definitions {
        if definition.schema_version != 1 {
          return Err(Error::UnsupportedVersion);
        }
      }
      for key in ["definitions", "runs", "candidates"] {
        if let Some(rows) = value[key].as_array() {
          unique_ids(rows)?;
        }
      }
    }
    ".knapsack/follow-through-v1.json" => {
      version(&value, "schema_version")?;
      let _: models::FollowStore = typed(content)?;
      let rows = value["items"].as_array().ok_or(Error::InvalidSchema)?;
      unique_ids(rows)?;
      for row in rows {
        if !matches!(
          row["status"].as_str(),
          Some(
            "proposed"
              | "tracking"
              | "attention"
              | "paused"
              | "dismissed"
              | "resolved"
              | "reply_received"
          )
        ) {
          return Err(Error::InvalidSchema);
        }
      }
    }
    ".knapsack/goals-v1.json" => {
      version(&value, "schemaVersion")?;
      let store: models::GoalStore = typed(content)?;
      for goal in &store.goals {
        if goal.schema_version != 1 {
          return Err(Error::UnsupportedVersion);
        }
      }
      for key in ["goals", "observations"] {
        unique_ids(value[key].as_array().ok_or(Error::InvalidSchema)?)?;
      }
    }
    _ => return Err(Error::InvalidSchema),
  }
  Ok(())
}

pub(crate) fn restore_content(
  path: &str,
  content: &str,
  at: u64,
  report: &mut RestoreReport,
) -> Result<String> {
  if !STRUCTURED_FILES.contains(&path) {
    return Ok(content.to_owned());
  }
  // Called after strict schema validation. Do not retain executable permissions,
  // approvals or timers. The encrypted original remains the historical archive.
  let mut value = parse(content)?;
  match path {
    ".knapsack/loops-v1.json" => {
      for definition in value["definitions"]
        .as_array_mut()
        .ok_or(Error::InvalidSchema)?
      {
        if definition["status"] == "active" {
          definition["status"] = json!("paused");
          definition["updatedAt"] = json!(at);
          report.paused_definitions += 1;
        }
      }
      for run in value["runs"].as_array_mut().ok_or(Error::InvalidSchema)? {
        let previous = run["status"]
          .as_str()
          .ok_or(Error::InvalidSchema)?
          .to_owned();
        let old_approval = run
          .get("approval")
          .and_then(Value::as_str)
          .map(str::to_owned);
        if old_approval.is_some() {
          report.cleared_approvals += 1;
        }
        run["approval"] = Value::Null;
        if !matches!(
          previous.as_str(),
          "completed" | "failed" | "cancelled" | "expired"
        ) {
          run["status"] = json!("expired");
          report.expired_runs += 1;
        }
        let current = run["status"].clone();
        // A prior decision is evidence in the event only, never a live grant.
        let note = if let Some(approval) = old_approval {
          format!("Restored on replacement device; live approval cleared (historical decision: {approval}); reactivation requires fresh review.")
        } else {
          "Restored on replacement device; reactivation requires fresh review.".to_owned()
        };
        run["events"]
          .as_array_mut()
          .ok_or(Error::InvalidSchema)?
          .push(json!({"from": previous, "to": current, "at": at, "note": note}));
        run["updatedAt"] = json!(at);
      }
    }
    ".knapsack/follow-through-v1.json" => {
      for item in value["items"].as_array_mut().ok_or(Error::InvalidSchema)? {
        if matches!(item["status"].as_str(), Some("tracking" | "attention")) {
          item["status"] = json!("paused");
          report.paused_follow_through += 1;
        }
        item["nextCheckAt"] = Value::Null;
        let revision = item["revision"]
          .as_u64()
          .ok_or(Error::InvalidSchema)?
          .checked_add(1)
          .ok_or(Error::Bounds)?;
        item["revision"] = json!(revision);
        if item.get("history").is_none() {
          item["history"] = json!([]);
        }
        // history.status is a free-form historical marker, not live status.
        item["history"]
          .as_array_mut()
          .ok_or(Error::InvalidSchema)?
          .push(json!({"at": at, "status": "restored_requires_review"}));
      }
    }
    ".knapsack/goals-v1.json" => {
      for goal in value["goals"].as_array_mut().ok_or(Error::InvalidSchema)? {
        if matches!(goal["status"].as_str(), Some("active" | "at_risk")) {
          goal["status"] = json!("paused");
          goal["updatedAt"] = json!(at);
          report.paused_goals += 1;
        }
      }
    }
    _ => return Err(Error::InvalidSchema),
  }
  serde_json::to_string_pretty(&value).map_err(|_| Error::InvalidSchema)
}

/// Enforce executable parent links, but preserve native-valid advisory references
/// and append-only history whose targets may have changed. Warnings are generic,
/// deduplicated and deterministic; no record content or identifiers leave here.
pub(crate) fn validate_references(files: &[crate::Entry]) -> Result<Vec<String>> {
  let mut warnings = std::collections::BTreeSet::new();
  use std::collections::HashMap;
  let find = |path: &str| -> Result<Option<Value>> {
    files
      .iter()
      .find(|f| f.path == path)
      .map(|f| parse(&f.content))
      .transpose()
  };
  let loops = find(STRUCTURED_FILES[0])?;
  let follow = find(STRUCTURED_FILES[1])?;
  let goals = find(STRUCTURED_FILES[2])?;
  let mut definition_ids = HashSet::new();
  let mut runs = HashMap::new();
  let mut candidates = HashMap::new();
  if let Some(store) = loops.as_ref() {
    for definition in store["definitions"]
      .as_array()
      .ok_or(Error::InvalidSchema)?
    {
      definition_ids.insert(definition["id"].as_str().ok_or(Error::InvalidSchema)?);
      unique_ids(
        definition["verificationRules"]
          .as_array()
          .ok_or(Error::InvalidSchema)?,
      )?;
    }
    if let Some(rows) = store["candidates"].as_array() {
      for candidate in rows {
        let loop_id = candidate["loopId"].as_str().ok_or(Error::InvalidSchema)?;
        // Native candidate decisions do not require an installed definition.
        // Proposed/dismissed template suggestions are routine; accepted advisory
        // history without a definition is preserved with a review warning.
        if !definition_ids.contains(loop_id)
          && !matches!(candidate["status"].as_str(), Some("proposed" | "dismissed"))
        {
          warnings.insert("Accepted candidate history references an unavailable loop definition; preserved for review.");
        }
        candidates.insert(
          candidate["id"].as_str().ok_or(Error::InvalidSchema)?,
          loop_id,
        );
      }
    }
    for run in store["runs"].as_array().ok_or(Error::InvalidSchema)? {
      let loop_id = run["loopId"].as_str().ok_or(Error::InvalidSchema)?;
      if !definition_ids.contains(loop_id) {
        return Err(Error::InvalidSchema);
      }
      if let Some(id) = run["candidateId"].as_str() {
        if candidates.get(id) != Some(&loop_id) {
          warnings.insert("Loop run history has an unavailable or different-loop candidate reference; preserved for review.");
        }
      }
      runs.insert(run["id"].as_str().ok_or(Error::InvalidSchema)?, loop_id);
    }
  }
  if let Some(store) = follow.as_ref() {
    for item in store["items"].as_array().ok_or(Error::InvalidSchema)? {
      if !runs.contains_key(item["runId"].as_str().ok_or(Error::InvalidSchema)?) {
        return Err(Error::InvalidSchema);
      }
    }
  }
  if let Some(store) = goals.as_ref() {
    let mut result_ids = HashMap::new();
    for goal in store["goals"].as_array().ok_or(Error::InvalidSchema)? {
      let results: &[Value] = goal["keyResults"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or(&[]);
      unique_ids(results)?;
      let ids: HashSet<_> = results
        .iter()
        .map(|r| r["id"].as_str().ok_or(Error::InvalidSchema))
        .collect::<Result<_>>()?;
      if let Some(links) = goal["loopLinks"].as_array() {
        for link in links {
          if !ids.contains(link["keyResultId"].as_str().ok_or(Error::InvalidSchema)?) {
            return Err(Error::InvalidSchema);
          }
          if !definition_ids.contains(link["loopId"].as_str().ok_or(Error::InvalidSchema)?) {
            warnings.insert("A goal's advisory loop link references an unavailable loop definition; preserved for review.");
          }
        }
      }
      result_ids.insert(goal["id"].as_str().ok_or(Error::InvalidSchema)?, ids);
    }
    for observation in store["observations"]
      .as_array()
      .ok_or(Error::InvalidSchema)?
    {
      let goal = observation["goalId"].as_str().ok_or(Error::InvalidSchema)?;
      let result = observation["keyResultId"]
        .as_str()
        .ok_or(Error::InvalidSchema)?;
      let ids = result_ids.get(goal).ok_or(Error::InvalidSchema)?;
      // Native goal edits may remove a key result while observations remain
      // append-only. Keep the evidence and its exact original target metadata.
      if !ids.contains(result) {
        warnings.insert("Goal observation history references a removed key result; preserved as historical evidence.");
      }
    }
  }
  Ok(warnings.into_iter().map(str::to_owned).collect())
}
