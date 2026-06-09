use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::time::Duration;

use crate::db::models::browser_workflow::{BrowserWorkflow, ElementSelector, RecordedAction};
use crate::error::Error;

const OPENCLAW_BASE_URL: &str = "http://127.0.0.1:18791";
const ACTION_TIMEOUT_MS: u64 = 30000;
const RETRY_COUNT: u32 = 3;
const RETRY_DELAY_MS: u64 = 1000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepResult {
  pub step_index: usize,
  pub action_type: String,
  pub status: String, // "success", "fallback_success", "failed", "skipped"
  pub detail: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowResult {
  pub steps: Vec<StepResult>,
  pub total: usize,
  pub succeeded: usize,
  pub failed: usize,
}

/// Execute a recorded browser workflow using hybrid approach:
/// 1. Try literal replay using OpenClaw browser API
/// 2. On element-not-found, fall back to LLM-assisted resolution
pub async fn execute_workflow(workflow: &BrowserWorkflow) -> Result<WorkflowResult, Error> {
  let client = Client::builder()
    .timeout(Duration::from_millis(ACTION_TIMEOUT_MS))
    .build()
    .map_err(|e| Error::KSError(format!("HTTP client error: {}", e)))?;

  let profile = &workflow.browser_profile;
  let steps = workflow.get_steps()?;
  let mut results: Vec<StepResult> = Vec::new();

  // Ensure browser is started
  ensure_browser_started(&client, profile).await?;

  // Navigate to start URL
  navigate(&client, profile, &workflow.start_url).await?;
  wait_for_load(&client, profile).await?;

  for (i, step) in steps.iter().enumerate() {
    let result = execute_step(&client, profile, i, step).await;
    results.push(result);
  }

  let succeeded = results
    .iter()
    .filter(|r| r.status == "success" || r.status == "fallback_success")
    .count();
  let failed = results.iter().filter(|r| r.status == "failed").count();

  Ok(WorkflowResult {
    total: results.len(),
    succeeded,
    failed,
    steps: results,
  })
}

async fn ensure_browser_started(client: &Client, profile: &str) -> Result<(), Error> {
  let status_url = format!("{}/?profile={}", OPENCLAW_BASE_URL, profile);
  let resp = client.get(&status_url).send().await;

  match resp {
    Ok(r) if r.status().is_success() => Ok(()),
    _ => {
      // Try to start the browser
      let start_url = format!("{}/start?profile={}", OPENCLAW_BASE_URL, profile);
      client
        .post(&start_url)
        .send()
        .await
        .map_err(|e| Error::KSError(format!("Failed to start browser: {}", e)))?;
      tokio::time::sleep(Duration::from_secs(2)).await;
      Ok(())
    }
  }
}

async fn navigate(client: &Client, profile: &str, url: &str) -> Result<(), Error> {
  let nav_url = format!("{}/navigate?profile={}", OPENCLAW_BASE_URL, profile);
  client
    .post(&nav_url)
    .json(&json!({ "url": url }))
    .send()
    .await
    .map_err(|e| Error::KSError(format!("Navigate failed: {}", e)))?;
  Ok(())
}

async fn wait_for_load(client: &Client, profile: &str) -> Result<(), Error> {
  let wait_url = format!("{}/wait?profile={}", OPENCLAW_BASE_URL, profile);
  let _ = client
    .post(&wait_url)
    .json(&json!({ "load": "networkidle", "timeoutMs": 10000 }))
    .send()
    .await;
  Ok(())
}

/// Get an AI snapshot of the current page, returning the text representation
async fn get_snapshot(client: &Client, profile: &str) -> Result<String, Error> {
  let url = format!(
    "{}/snapshot?profile={}&format=ai",
    OPENCLAW_BASE_URL, profile
  );
  let resp = client
    .get(&url)
    .send()
    .await
    .map_err(|e| Error::KSError(format!("Snapshot failed: {}", e)))?;
  let text = resp
    .text()
    .await
    .map_err(|e| Error::KSError(format!("Snapshot read failed: {}", e)))?;
  Ok(text)
}

/// Try to resolve an element selector to a snapshot ref number.
/// Uses multi-strategy matching: id -> aria -> text -> placeholder -> name
fn resolve_ref_from_snapshot(snapshot: &str, selector: &ElementSelector) -> Option<String> {
  let lines: Vec<&str> = snapshot.lines().collect();

  // Strategy 1: Match by id attribute
  if let Some(ref id) = selector.id {
    if !id.is_empty() {
      for line in &lines {
        if line.contains(id) {
          if let Some(ref_num) = extract_ref_from_line(line) {
            return Some(ref_num);
          }
        }
      }
    }
  }

  // Strategy 2: Match by aria-label
  if let Some(ref aria_label) = selector.aria_label {
    if !aria_label.is_empty() {
      for line in &lines {
        let lower = line.to_lowercase();
        if lower.contains(&aria_label.to_lowercase()) {
          if let Some(ref_num) = extract_ref_from_line(line) {
            return Some(ref_num);
          }
        }
      }
    }
  }

  // Strategy 3: Match by text content
  if let Some(ref text) = selector.text_content {
    if !text.is_empty() && text.len() > 1 {
      let search_text = if text.len() > 50 {
        &text[..50]
      } else {
        text.as_str()
      };
      for line in &lines {
        if line.contains(search_text) {
          if let Some(ref_num) = extract_ref_from_line(line) {
            return Some(ref_num);
          }
        }
      }
    }
  }

  // Strategy 4: Match by placeholder
  if let Some(ref placeholder) = selector.placeholder {
    if !placeholder.is_empty() {
      for line in &lines {
        let lower = line.to_lowercase();
        if lower.contains(&placeholder.to_lowercase()) {
          if let Some(ref_num) = extract_ref_from_line(line) {
            return Some(ref_num);
          }
        }
      }
    }
  }

  // Strategy 5: Match by name attribute
  if let Some(ref name) = selector.name {
    if !name.is_empty() {
      for line in &lines {
        if line.contains(name) {
          if let Some(ref_num) = extract_ref_from_line(line) {
            return Some(ref_num);
          }
        }
      }
    }
  }

  None
}

/// Extract ref number from a snapshot line like "[ref=12] button \"Submit\""
fn extract_ref_from_line(line: &str) -> Option<String> {
  // Look for patterns like [ref=12] or [12]
  if let Some(start) = line.find("[ref=") {
    let after = &line[start + 5..];
    if let Some(end) = after.find(']') {
      return Some(after[..end].to_string());
    }
  }
  // Also handle simple [12] pattern
  if let Some(start) = line.find('[') {
    let after = &line[start + 1..];
    if let Some(end) = after.find(']') {
      let candidate = &after[..end];
      if candidate.chars().all(|c| c.is_ascii_digit()) && !candidate.is_empty() {
        return Some(candidate.to_string());
      }
    }
  }
  None
}

async fn execute_step(
  client: &Client,
  profile: &str,
  index: usize,
  step: &RecordedAction,
) -> StepResult {
  match step.action_type.as_str() {
    "navigate" => {
      if let Some(ref url) = step.url {
        match navigate(client, profile, url).await {
          Ok(()) => {
            let _ = wait_for_load(client, profile).await;
            StepResult {
              step_index: index,
              action_type: "navigate".into(),
              status: "success".into(),
              detail: Some(format!("Navigated to {}", url)),
            }
          }
          Err(e) => StepResult {
            step_index: index,
            action_type: "navigate".into(),
            status: "failed".into(),
            detail: Some(format!("{:?}", e)),
          },
        }
      } else {
        StepResult {
          step_index: index,
          action_type: "navigate".into(),
          status: "failed".into(),
          detail: Some("No URL provided".into()),
        }
      }
    }

    "click" => execute_element_action(client, profile, index, step, "click").await,
    "type" => execute_element_action(client, profile, index, step, "type").await,
    "select" => execute_element_action(client, profile, index, step, "select").await,

    "scroll" => {
      let act_url = format!("{}/act?profile={}", OPENCLAW_BASE_URL, profile);
      let _ = client
        .post(&act_url)
        .json(&json!({
            "action": "scroll",
            "x": 0,
            "y": 300,
        }))
        .send()
        .await;
      StepResult {
        step_index: index,
        action_type: "scroll".into(),
        status: "success".into(),
        detail: None,
      }
    }

    "wait" => {
      let _ = wait_for_load(client, profile).await;
      StepResult {
        step_index: index,
        action_type: "wait".into(),
        status: "success".into(),
        detail: None,
      }
    }

    "submit" => {
      let act_url = format!("{}/act?profile={}", OPENCLAW_BASE_URL, profile);
      let _ = client
        .post(&act_url)
        .json(&json!({ "action": "press", "key": "Enter" }))
        .send()
        .await;
      let _ = wait_for_load(client, profile).await;
      StepResult {
        step_index: index,
        action_type: "submit".into(),
        status: "success".into(),
        detail: None,
      }
    }

    other => StepResult {
      step_index: index,
      action_type: other.into(),
      status: "skipped".into(),
      detail: Some(format!("Unknown action type: {}", other)),
    },
  }
}

/// Execute a click/type/select action with retry and LLM fallback
async fn execute_element_action(
  client: &Client,
  profile: &str,
  index: usize,
  step: &RecordedAction,
  action: &str,
) -> StepResult {
  let selector = match &step.selector {
    Some(s) => s,
    None => {
      return StepResult {
        step_index: index,
        action_type: action.into(),
        status: "failed".into(),
        detail: Some("No element selector recorded".into()),
      };
    }
  };

  // Try with retries (page might still be loading)
  for attempt in 0..RETRY_COUNT {
    if attempt > 0 {
      tokio::time::sleep(Duration::from_millis(RETRY_DELAY_MS * (attempt as u64 + 1))).await;
    }

    let snapshot = match get_snapshot(client, profile).await {
      Ok(s) => s,
      Err(_) => continue,
    };

    if let Some(ref_num) = resolve_ref_from_snapshot(&snapshot, selector) {
      let act_url = format!("{}/act?profile={}", OPENCLAW_BASE_URL, profile);
      let mut body = json!({
          "action": action,
          "ref": ref_num,
      });

      if action == "type" {
        if let Some(ref value) = step.value {
          body["value"] = json!(value);
        }
      }
      if action == "select" {
        if let Some(ref value) = step.value {
          body["values"] = json!([value]);
        }
      }

      match client.post(&act_url).json(&body).send().await {
        Ok(resp) if resp.status().is_success() => {
          // Brief wait after action for page to react
          tokio::time::sleep(Duration::from_millis(500)).await;
          return StepResult {
            step_index: index,
            action_type: action.into(),
            status: if attempt == 0 {
              "success"
            } else {
              "fallback_success"
            }
            .into(),
            detail: Some(format!("Used ref {} (attempt {})", ref_num, attempt + 1)),
          };
        }
        Ok(resp) => {
          let err_text = resp.text().await.unwrap_or_default();
          if attempt == RETRY_COUNT - 1 {
            return StepResult {
              step_index: index,
              action_type: action.into(),
              status: "failed".into(),
              detail: Some(format!("Action failed after retries: {}", err_text)),
            };
          }
        }
        Err(e) => {
          if attempt == RETRY_COUNT - 1 {
            return StepResult {
              step_index: index,
              action_type: action.into(),
              status: "failed".into(),
              detail: Some(format!("HTTP error: {}", e)),
            };
          }
        }
      }
    } else if attempt == RETRY_COUNT - 1 {
      // Final attempt: try LLM-assisted fallback
      let fallback = try_llm_fallback(client, profile, action, step, selector).await;
      return StepResult {
        step_index: index,
        action_type: action.into(),
        status: fallback.0.into(),
        detail: Some(fallback.1),
      };
    }
  }

  StepResult {
    step_index: index,
    action_type: action.into(),
    status: "failed".into(),
    detail: Some("Exhausted all retries".into()),
  }
}

/// LLM fallback: Use the OpenClaw chat endpoint to ask the agent
/// to find and interact with the element described by the selector metadata.
async fn try_llm_fallback(
  client: &Client,
  profile: &str,
  action: &str,
  step: &RecordedAction,
  selector: &ElementSelector,
) -> (String, String) {
  // Build a description of the target element for the LLM
  let mut description_parts = Vec::new();
  if let Some(ref tag) = selector.tag_name {
    description_parts.push(format!("tag: {}", tag));
  }
  if let Some(ref text) = selector.text_content {
    let truncated = if text.len() > 100 {
      &text[..100]
    } else {
      text.as_str()
    };
    description_parts.push(format!("text: \"{}\"", truncated));
  }
  if let Some(ref aria_label) = selector.aria_label {
    description_parts.push(format!("aria-label: \"{}\"", aria_label));
  }
  if let Some(ref placeholder) = selector.placeholder {
    description_parts.push(format!("placeholder: \"{}\"", placeholder));
  }
  if let Some(ref id) = selector.id {
    description_parts.push(format!("id: \"{}\"", id));
  }
  if let Some(ref outer_html) = selector.outer_html_preview {
    description_parts.push(format!("html preview: {}", outer_html));
  }

  let element_desc = description_parts.join(", ");
  let value_instruction = match &step.value {
    Some(v) => format!(" with value \"{}\"", v),
    None => String::new(),
  };

  let prompt = format!(
    "I need you to {} on an element in the current page. The element has these properties: {}{}. \
         Please take a snapshot of the page and perform the action on the matching element. \
         If you cannot find the exact element, find the closest match.",
    action, element_desc, value_instruction
  );

  // Use the OpenClaw chat endpoint to let the agent handle it
  let chat_url = format!("{}/chat?profile={}", OPENCLAW_BASE_URL, profile);
  match client
    .post(&chat_url)
    .json(&json!({ "message": prompt }))
    .timeout(Duration::from_secs(60))
    .send()
    .await
  {
    Ok(resp) if resp.status().is_success() => (
      "fallback_success".to_string(),
      format!("LLM agent resolved: {}", element_desc),
    ),
    Ok(resp) => {
      let err = resp.text().await.unwrap_or_default();
      (
        "failed".to_string(),
        format!("LLM fallback failed: {}", err),
      )
    }
    Err(e) => ("failed".to_string(), format!("LLM fallback error: {}", e)),
  }
}
