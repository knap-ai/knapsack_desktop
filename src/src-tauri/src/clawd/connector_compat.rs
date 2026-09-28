//! Compatibility for legacy Studio Google adapters' string-only schemas.
//! Keep this narrowly scoped: IDs, queries, dates and other connectors stay intact.
use serde_json::{json, Value};

fn result_limit(connector: &str, name: &str) -> Option<u64> {
  match (connector, name) {
    ("google_calendar_read" | "google_calendar", "calendar_list_events") => Some(2500),
    ("google_calendar_read" | "google_calendar", "calendar_get_calendars") => Some(250),
    ("google_gmail_read" | "google_gmail_modify", "gmail_search_emails") => Some(500),
    _ => None,
  }
}

pub fn normalize_schemas(connector: &str, catalog: &mut Value) {
  if let Some(tools) = catalog.get_mut("tools").and_then(Value::as_array_mut) {
    for tool in tools {
      let Some(limit) = result_limit(connector, tool["name"].as_str().unwrap_or("")) else {
        continue;
      };
      if let Some(props) = tool.pointer_mut("/inputSchema/properties").and_then(Value::as_object_mut) {
        if let Some(property) = props.get_mut("max_results") {
          property["type"] = json!("integer");
          property["minimum"] = json!(1);
          property["maximum"] = json!(limit);
        }
        if let Some(property) = props.get_mut("single_events") {
          property["type"] = json!("boolean");
        }
        if let Some(property) = props.get_mut("has_attachment") {
          property["type"] = json!(["boolean", "null"]);
          property["description"] = json!("Filter by attachment presence. Use null for no attachment filter.");
        }
      }
    }
  }
}

pub fn normalize_arguments(connector: &str, name: &str, args: &mut Value) -> Result<(), String> {
  let Some(limit) = result_limit(connector, name) else { return Ok(()); };
  if let Some(value) = args.get_mut("max_results") {
    let number = value.as_u64().or_else(|| value.as_str()?.trim().parse::<u64>().ok())
      .filter(|n| (1..=limit).contains(n))
      .ok_or_else(|| format!("max_results must be an integer between 1 and {limit}"))?;
    *value = json!(number);
  }
  if let Some(value) = args.get_mut("single_events") {
    let flag = value.as_bool().or_else(|| match value.as_str()?.trim() {
      "true" => Some(true), "false" => Some(false), _ => None,
    }).ok_or_else(|| "Calendar single_events must be true or false".to_string())?;
    *value = json!(flag);
  }
  if let Some(value) = args.get_mut("has_attachment") {
    // The old schema required a string even for an omitted optional filter.
    // Empty means no filter, not false (and the string "false" is truthy in Python).
    if value.is_null() || value.as_str().is_some_and(|s| s.trim().is_empty()) {
      *value = Value::Null;
    } else {
      let flag = value.as_bool().or_else(|| match value.as_str()?.trim() {
        "true" => Some(true), "false" => Some(false), _ => None,
      }).ok_or_else(|| "has_attachment must be true, false, or null".to_string())?;
      *value = json!(flag);
    }
  }
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn repairs_the_recorded_calendar_request_without_changing_dates() {
    let mut args = json!({"calendar_id":"primary", "time_min":"2026-09-28T00:00:00-07:00", "max_results":"50", "single_events":"true"});
    normalize_arguments("google_calendar_read", "calendar_list_events", &mut args).unwrap();
    assert_eq!(args["max_results"], 50);
    assert_eq!(args["single_events"], true);
    assert_eq!(args["time_min"], "2026-09-28T00:00:00-07:00");
    normalize_arguments("google_calendar_read", "calendar_list_events", &mut args).unwrap();
  }
  #[test]
  fn rejects_invalid_types_and_preserves_other_connectors() {
    for mut args in [json!({"max_results":"many"}), json!({"max_results":0}), json!({"max_results":2501}), json!({"single_events":"yes"})] {
      assert!(normalize_arguments("google_calendar_read", "calendar_list_events", &mut args).is_err());
    }
    let mut args = json!({"max_results":"50", "single_events":"false"});
    let original = args.clone();
    normalize_arguments("other", "calendar_list_events", &mut args).unwrap();
    assert_eq!(args, original);
    normalize_arguments("google_calendar_read", "calendar_list_events", &mut args).unwrap();
    assert_eq!(args["single_events"], false);
  }
  #[test]
  fn discovery_advertises_the_types_execution_accepts() {
    let mut catalog = json!({"tools":[{"name":"calendar_list_events","inputSchema":{"properties":{"max_results":{"type":"string","description":"Limit"},"single_events":{"type":"string"},"time_min":{"type":"string"}}}}]});
    normalize_schemas("google_calendar_read", &mut catalog);
    assert_eq!(catalog["tools"][0]["inputSchema"]["properties"]["max_results"]["type"], "integer");
    assert_eq!(catalog["tools"][0]["inputSchema"]["properties"]["max_results"]["description"], "Limit");
    assert_eq!(catalog["tools"][0]["inputSchema"]["properties"]["single_events"]["type"], "boolean");
  }
  #[test]
  fn repairs_gmail_search_and_calendar_discovery_from_recorded_failures() {
    let mut gmail = json!({"query":"category:updates", "max_results":"30", "has_attachment":""});
    normalize_arguments("google_gmail_modify", "gmail_search_emails", &mut gmail).unwrap();
    assert_eq!(gmail["max_results"], 30);
    assert!(gmail["has_attachment"].is_null());
    gmail["has_attachment"] = json!("false");
    normalize_arguments("google_gmail_modify", "gmail_search_emails", &mut gmail).unwrap();
    assert_eq!(gmail["has_attachment"], false);
    let mut calendars = json!({"max_results":"10"});
    normalize_arguments("google_calendar_read", "calendar_get_calendars", &mut calendars).unwrap();
    assert_eq!(calendars["max_results"], 10);
  }
}
