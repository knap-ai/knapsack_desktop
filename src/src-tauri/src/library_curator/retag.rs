//! Retag stale workspace documents.
//!
//! Backfills `auto_tags` + `summary` for any document that has neither.
//! This finally hooks up `WorkspaceDocument::update_auto_tags()` so that
//! every doc the curator ingests ends up with structured tags + a one-line
//! summary the agent can use to ground its answers.
//!
//! Capped at MAX_PER_PASS per run to avoid runaway LLM cost. Documents that
//! produce empty content (e.g. emails with HTML stripped to nothing) get an
//! empty tag list stamped so they don't get re-processed every pass.

use serde::Deserialize;

use crate::db::models::workspace::WorkspaceDocument;
use crate::error::Error;
use crate::llm::types::{Message as LlmMessage, MessageSender};
use crate::llm::use_cases::complete::multi_provider_completion;

/// Normal per-pass cap.
const MAX_PER_PASS: i64 = 25;
/// Reduced cap when many untagged docs exist (first-run / large initial sync).
/// Spreads the work across curator intervals instead of blasting the API at launch.
const MAX_PER_PASS_FIRST_RUN: i64 = 5;
/// If more than this many docs need tagging we treat it as a first-run scenario.
const FIRST_RUN_THRESHOLD: i64 = 10;
/// Pause between LLM calls to avoid rate-limit bursts.
const INTER_CALL_DELAY_MS: u64 = 500;
/// Substrings that indicate a rate-limit or overload error from the LLM layer.
/// `multi_provider_completion` surfaces these as `LLMError::TooManyRequests`,
/// which formats to `TooManyRequests("...")` via `{:?}`.
const RATE_LIMIT_MARKERS: &[&str] = &["TooManyRequests", "rate limit", "429", "overload", "503"];
const MAX_BODY_CHARS: usize = 4_000;

#[derive(Debug, Deserialize)]
struct TagResponse {
  #[serde(default)]
  tags: Vec<String>,
  #[serde(default)]
  summary: String,
}

pub async fn retag_stale() -> Result<(), Error> {
  let total_untagged = WorkspaceDocument::count_untagged().unwrap_or(0);
  let limit = if total_untagged > FIRST_RUN_THRESHOLD {
    log::info!(
      "[library_curator/retag] {} untagged docs — first-run mode, capping at {}",
      total_untagged,
      MAX_PER_PASS_FIRST_RUN
    );
    MAX_PER_PASS_FIRST_RUN
  } else {
    MAX_PER_PASS
  };

  let docs = WorkspaceDocument::find_untagged(limit)?;
  if docs.is_empty() {
    log::info!("[library_curator/retag] no stale documents");
    return Ok(());
  }
  log::info!(
    "[library_curator/retag] retagging {} stale documents",
    docs.len()
  );

  for doc in docs {
    let Some(id) = doc.id else { continue };
    let body: String = doc
      .content_hash
      .as_deref()
      .unwrap_or("")
      .chars()
      .take(MAX_BODY_CHARS)
      .collect();
    if body.trim().is_empty() {
      // Stamp an empty tag list so we don't re-process every pass.
      let _ = WorkspaceDocument::update_auto_tags(id, Some("[]".to_string()), Some(String::new()));
      continue;
    }
    match call_llm_tag(&doc.document_name, &body).await {
      Ok((tags, summary)) => {
        let tags_json = serde_json::to_string(&tags).unwrap_or_else(|_| "[]".to_string());
        let _ = WorkspaceDocument::update_auto_tags(id, Some(tags_json), Some(summary));
      }
      Err(ref e) if RATE_LIMIT_MARKERS.iter().any(|m| e.contains(m)) => {
        // Rate-limited or overloaded after all internal retries. Abort the
        // remainder of this pass — continuing would just pile on more 429s.
        // The 30-minute inter-pass interval is the effective backoff window.
        log::warn!(
          "[library_curator/retag] rate limit detected ({}), aborting pass early",
          e
        );
        return Ok(());
      }
      Err(e) => {
        log::warn!("[library_curator/retag] tag failed for doc {}: {}", id, e);
        // Non-rate-limit failure — leave auto_tags NULL so we retry next pass.
      }
    }
    tokio::time::sleep(tokio::time::Duration::from_millis(INTER_CALL_DELAY_MS)).await;
  }
  Ok(())
}

async fn call_llm_tag(name: &str, body: &str) -> Result<(Vec<String>, String), String> {
  let user = format!(
        "Document title: {}\n\nDocument body:\n{}\n\nReturn ONLY a JSON object: {{\"tags\":[\"3-7 lowercase kebab-case tags\"],\"summary\":\"one or two sentences\"}}",
        name, body,
    );
  let messages = vec![
    LlmMessage {
      sender: MessageSender::System,
      content: "You tag and summarize knowledge-base documents. Reply with valid JSON only."
        .to_string(),
    },
    LlmMessage {
      sender: MessageSender::User,
      content: user,
    },
  ];
  let raw = multi_provider_completion(messages)
    .await
    .map_err(|e| format!("{:?}", e))?;
  let cleaned = strip_json_fence(&raw);
  let parsed: TagResponse = serde_json::from_str(cleaned).map_err(|e| {
    format!(
      "JSON parse: {} :: raw={}",
      e,
      cleaned.chars().take(200).collect::<String>()
    )
  })?;
  Ok((parsed.tags, parsed.summary))
}

fn strip_json_fence(raw: &str) -> &str {
  let trimmed = raw.trim();
  let no_md = trimmed
    .trim_start_matches("```json")
    .trim_start_matches("```")
    .trim_end_matches("```")
    .trim();
  if let (Some(start), Some(end)) = (no_md.find('{'), no_md.rfind('}')) {
    if end >= start {
      return &no_md[start..=end];
    }
  }
  no_md
}
