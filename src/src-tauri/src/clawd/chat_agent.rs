use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::time::Duration;

/// An image attachment to include in a vision-capable LLM request.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImageAttachment {
  /// MIME type, e.g. "image/png", "image/jpeg"
  pub media_type: String,
  /// Raw base64-encoded image data (no data URL prefix)
  pub data: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "role")]
pub enum OaiMessage {
  #[serde(rename = "system")]
  System { content: String },
  #[serde(rename = "user")]
  User {
    content: String,
    /// Optional image attachments for vision-capable models.
    /// Skipped during default serialization — each provider builds its own format.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    images: Vec<ImageAttachment>,
  },
  #[serde(rename = "assistant")]
  Assistant {
    content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    tool_calls: Option<Vec<OaiToolCall>>,
  },
  #[serde(rename = "tool")]
  Tool {
    tool_call_id: String,
    content: String,
  },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiToolCall {
  pub id: String,
  #[serde(rename = "type")]
  pub kind: String,
  pub function: OaiToolFn,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiToolFn {
  pub name: String,
  pub arguments: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiToolSpec {
  #[serde(rename = "type")]
  pub kind: String,
  pub function: OaiToolSpecFn,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiToolSpecFn {
  pub name: String,
  pub description: String,
  pub parameters: JsonValue,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiChatReq {
  pub model: String,
  pub messages: Vec<OaiMessage>,
  #[serde(skip_serializing_if = "Option::is_none")]
  pub tools: Option<Vec<OaiToolSpec>>,
  #[serde(skip_serializing_if = "Option::is_none")]
  pub tool_choice: Option<String>,
  #[serde(skip_serializing_if = "Option::is_none")]
  pub temperature: Option<f32>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ChatUsage {
  pub input_tokens: i64,
  pub output_tokens: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiChatResp {
  pub choices: Vec<OaiChoice>,
  /// Token usage extracted from the provider response (if available).
  #[serde(default)]
  pub usage: Option<ChatUsage>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiChoice {
  pub message: OaiChoiceMsg,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiChoiceMsg {
  pub content: Option<String>,
  #[serde(default)]
  pub tool_calls: Vec<OaiToolCall>,
}

pub fn default_tools() -> Vec<OaiToolSpec> {
  vec![
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "open_url".to_string(),
        description: "Open a URL in a NEW browser tab. Use navigate() to reuse existing tab.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": { "url": { "type": "string" } },
          "required": ["url"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "navigate".to_string(),
        description: "Navigate to a URL in an existing tab (reuses current tab instead of opening new one). Preferred over open_url for visiting sites.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "url": { "type": "string", "description": "URL to navigate to" },
            "targetId": { "type": "string", "description": "Optional tab ID. If not provided, uses the current/most recent tab." }
          },
          "required": ["url"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "list_tabs".to_string(),
        description: "List all open browser tabs with their IDs and URLs".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {},
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "focus_tab".to_string(),
        description: "Focus (switch to) a specific browser tab by its targetId".to_string(),
        parameters: json!({
          "type": "object",
          "properties": { "targetId": { "type": "string", "description": "The tab ID to focus" } },
          "required": ["targetId"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "snapshot".to_string(),
        description: "Get an accessibility snapshot of the current tab".to_string(),
        parameters: json!({
          "type": "object",
          "properties": { "targetId": { "type": "string" } },
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "click".to_string(),
        description: "Click an element by ref from snapshot".to_string(),
        parameters: json!({
          "type": "object",
          "properties": { "targetId": { "type": "string" }, "ref": { "type": "string" } },
          "required": ["ref"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "type".to_string(),
        description: "Type text into an element by ref from snapshot".to_string(),
        parameters: json!({
          "type": "object",
          "properties": { "targetId": { "type": "string" }, "ref": { "type": "string" }, "text": { "type": "string" }, "submit": { "type": "boolean" } },
          "required": ["ref", "text"],
          "additionalProperties": false
        }),
      },
    },
    // Local file tools
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "read_file".to_string(),
        description: "Read the contents of a local file. Supports text files, code, documents. Returns the file content as text.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "path": { "type": "string", "description": "Absolute or relative path to the file (e.g., ~/Documents/notes.txt or /Users/name/file.md)" }
          },
          "required": ["path"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "list_directory".to_string(),
        description: "List files and directories in a local folder. Returns names with file/directory indicators.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "path": { "type": "string", "description": "Absolute or relative path to the directory (e.g., ~/Documents or /Users/name/Projects)" }
          },
          "required": ["path"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "search_files".to_string(),
        description: "Search for files by name pattern in a directory. Returns matching file paths.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "path": { "type": "string", "description": "Directory to search in" },
            "pattern": { "type": "string", "description": "File name pattern to match (e.g., '*.pdf', 'report*', '*.txt')" },
            "recursive": { "type": "boolean", "description": "Whether to search subdirectories (default: true)" }
          },
          "required": ["path", "pattern"],
          "additionalProperties": false
        }),
      },
    },
    // File writing tool
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "write_file".to_string(),
        description: "Write content to a local file. Creates the file if it doesn't exist, overwrites if it does. Creates parent directories as needed.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "path": { "type": "string", "description": "Absolute or relative path to the file (e.g., ~/Documents/output.txt or /Users/name/file.md)" },
            "content": { "type": "string", "description": "The content to write to the file" }
          },
          "required": ["path", "content"],
          "additionalProperties": false
        }),
      },
    },
    // Python script execution tool
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "run_script".to_string(),
        description: "Write a Python script to a temporary directory and execute it. Returns stdout, stderr, and exit code. Script has a 30-second timeout. Use this for data processing, calculations, file transformations, or any task that benefits from Python execution.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "script": { "type": "string", "description": "The Python script source code to execute" },
            "timeout_secs": { "type": "integer", "description": "Optional timeout in seconds (default: 30, max: 60)" }
          },
          "required": ["script"],
          "additionalProperties": false
        }),
      },
    },
    // Scheduling tools
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "schedule_task".to_string(),
        description: "Schedule a recurring task. Creates a cron job that will send the specified message at the scheduled times. Use natural language times like 'every day at 9am', 'every hour', 'every Monday at 3pm'.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "name": { "type": "string", "description": "A descriptive name for this scheduled task" },
            "message": { "type": "string", "description": "The message/task to execute (what you want Clawd to do)" },
            "schedule": { "type": "string", "description": "When to run: 'every hour', 'every day at 9am', 'every Monday at 3pm', or cron expression like '0 9 * * *'" },
            "timezone": { "type": "string", "description": "Timezone for the schedule (default: local). E.g., 'America/New_York', 'Europe/London'" }
          },
          "required": ["name", "message", "schedule"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "list_scheduled_tasks".to_string(),
        description: "List all scheduled tasks/cron jobs.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {},
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "cancel_scheduled_task".to_string(),
        description: "Cancel/remove a scheduled task by its ID or name.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "id": { "type": "string", "description": "The ID or name of the scheduled task to cancel" }
          },
          "required": ["id"],
          "additionalProperties": false
        }),
      },
    },
    // Meeting context tools
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "list_recent_meetings".to_string(),
        description: "List meeting recordings with metadata (title, date, duration, participants). Returns thread_ids for use with get_meeting_transcript or get_meeting_notes. Without search, returns meetings from last N days. When search is provided, searches ALL meetings regardless of date.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "days": { "type": "integer", "description": "Number of days to look back (default: 30, max: 365). Ignored when search is provided." },
            "search": { "type": "string", "description": "Keyword to filter by meeting title or participant name. Searches ALL meetings regardless of date." }
          },
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "get_meeting_transcript".to_string(),
        description: "Get the full spoken transcript of a specific meeting by its thread_id. Contains the conversation text from the recording. Use list_recent_meetings first to find the thread_id.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "thread_id": { "type": "integer", "description": "The thread_id of the meeting (from list_recent_meetings or the Recent Meetings section)" }
          },
          "required": ["thread_id"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "get_meeting_notes".to_string(),
        description: "Get the user's written notes for a specific meeting by its thread_id. Notes are user-created summaries or annotations, separate from the spoken transcript. Use list_recent_meetings first to find the thread_id.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "thread_id": { "type": "integer", "description": "The thread_id of the meeting (from list_recent_meetings or the Recent Meetings section)" }
          },
          "required": ["thread_id"],
          "additionalProperties": false
        }),
      },
    },
  ]
}

/// Additional tools only available when Advanced Mode is enabled.
/// These give the agent shell command execution capabilities.
pub fn advanced_tools() -> Vec<OaiToolSpec> {
  vec![
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "run_command".to_string(),
        description: "Execute a shell command and return stdout, stderr, and exit code. Use for installing software (brew, npm, pip), running CLI tools, checking versions, and system tasks. Commands run via /bin/bash -c with a timeout. Dangerous commands (rm -rf /, shutdown, etc.) and writes to sensitive paths (~/.ssh, ~/.aws, etc.) are blocked.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "command": { "type": "string", "description": "The shell command to execute (e.g., 'brew install ffmpeg', 'node --version', 'ls -la ~/Projects')" },
            "timeout_secs": { "type": "integer", "description": "Optional timeout in seconds (default: 60, max: 120)" },
            "working_dir": { "type": "string", "description": "Optional working directory for the command (defaults to home directory)" }
          },
          "required": ["command"],
          "additionalProperties": false
        }),
      },
    },
  ]
}

pub async fn openai_chat(
  api_key: &str,
  model: &str,
  messages: Vec<OaiMessage>,
  tools: Vec<OaiToolSpec>,
) -> anyhow::Result<OaiChatResp> {
  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(60))
    .build()?;

  // o3, o1, and gpt-5.2-pro reasoning models only support temperature=1 (default)
  // gpt-5.2 standard supports custom temperature
  let temperature = if model.starts_with("o3") || model.starts_with("o1") || model == "gpt-5.2-pro" {
    None // Use default temperature for reasoning models
  } else {
    Some(0.2)
  };

  // Build messages JSON manually to support multi-part content (text + images) for vision
  let oai_messages: Vec<JsonValue> = messages.iter().map(|msg| {
    match msg {
      OaiMessage::System { content } => json!({"role": "system", "content": content}),
      OaiMessage::User { content, images } => {
        if images.is_empty() {
          json!({"role": "user", "content": content})
        } else {
          // Multi-part content: text + image_url blocks (OpenAI vision format)
          let mut parts: Vec<JsonValue> = vec![json!({"type": "text", "text": content})];
          for img in images {
            parts.push(json!({
              "type": "image_url",
              "image_url": {
                "url": format!("data:{};base64,{}", img.media_type, img.data),
                "detail": "auto"
              }
            }));
          }
          json!({"role": "user", "content": parts})
        }
      }
      OaiMessage::Assistant { content, tool_calls } => {
        let mut obj = json!({"role": "assistant"});
        if let Some(text) = content {
          obj["content"] = json!(text);
        }
        if let Some(tcs) = tool_calls {
          let tc_json: Vec<JsonValue> = tcs.iter().map(|tc| json!({
            "id": tc.id,
            "type": tc.kind,
            "function": {"name": tc.function.name, "arguments": tc.function.arguments}
          })).collect();
          obj["tool_calls"] = json!(tc_json);
        }
        obj
      }
      OaiMessage::Tool { tool_call_id, content } => {
        json!({"role": "tool", "tool_call_id": tool_call_id, "content": content})
      }
    }
  }).collect();

  let mut body = json!({
    "model": model,
    "messages": oai_messages,
    "tools": tools,
    "tool_choice": "auto"
  });
  if let Some(t) = temperature {
    body["temperature"] = json!(t);
  }

  // Retry logic for rate limits
  let max_retries = 3;
  let mut last_error = String::new();

  for attempt in 0..max_retries {
    let res = client
      .post("https://api.openai.com/v1/chat/completions")
      .bearer_auth(api_key)
      .json(&body)
      .send()
      .await?;

    let status = res.status();
    let text = res.text().await.unwrap_or_default();

    if status.is_success() {
      let raw: JsonValue = serde_json::from_str(&text)?;
      let usage = raw.get("usage").and_then(|u| {
        let input = u.get("prompt_tokens").or_else(|| u.get("input_tokens")).and_then(|v| v.as_i64()).unwrap_or(0);
        let output = u.get("completion_tokens").or_else(|| u.get("output_tokens")).and_then(|v| v.as_i64()).unwrap_or(0);
        if input > 0 || output > 0 { Some(ChatUsage { input_tokens: input, output_tokens: output }) } else { None }
      });
      let mut parsed: OaiChatResp = serde_json::from_value(raw)?;
      parsed.usage = usage;
      return Ok(parsed);
    }

    // Check for rate limit (429)
    if status.as_u16() == 429 {
      // Parse retry-after from error message or use default
      let wait_secs = parse_retry_after(&text).unwrap_or(5.0 + (attempt as f64 * 2.0));
      eprintln!(
        "Rate limit hit (attempt {}/{}), waiting {:.1}s before retry...",
        attempt + 1,
        max_retries,
        wait_secs
      );
      tokio::time::sleep(Duration::from_secs_f64(wait_secs)).await;
      last_error = format!("OpenAI HTTP {}: {}", status, text);
      continue;
    }

    // For other errors, fail immediately
    anyhow::bail!("OpenAI HTTP {}: {}", status, text);
  }

  // All retries exhausted
  anyhow::bail!("OpenAI error after {} retries: {}", max_retries, last_error)
}

/// Parse the retry-after time from OpenAI rate limit error messages
fn parse_retry_after(text: &str) -> Option<f64> {
  // Look for patterns like "Please try again in 4.183s" or "retry in X seconds"
  let patterns = [
    "try again in ",
    "retry in ",
    "wait ",
  ];

  for pattern in patterns {
    if let Some(idx) = text.find(pattern) {
      let start = idx + pattern.len();
      let rest = &text[start..];
      // Parse the number (could be float like "4.183s")
      let num_str: String = rest.chars()
        .take_while(|c| c.is_numeric() || *c == '.')
        .collect();
      if let Ok(secs) = num_str.parse::<f64>() {
        // Add a small buffer to be safe
        return Some(secs + 0.5);
      }
    }
  }
  None
}

/// Call Anthropic Messages API and map the response back to OAI-compatible format.
pub async fn anthropic_chat(
  api_key: &str,
  model: &str,
  messages: Vec<OaiMessage>,
  tools: Vec<OaiToolSpec>,
) -> anyhow::Result<OaiChatResp> {
  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(90))
    .build()?;

  // Convert OAI messages → Anthropic format
  // Anthropic expects: system as top-level param, messages array of user/assistant
  let mut system_text = String::new();
  let mut anth_messages: Vec<JsonValue> = Vec::new();

  for msg in &messages {
    match msg {
      OaiMessage::System { content } => {
        if !system_text.is_empty() {
          system_text.push_str("\n\n");
        }
        system_text.push_str(content);
      }
      OaiMessage::User { content, images } => {
        if images.is_empty() {
          anth_messages.push(json!({"role": "user", "content": content}));
        } else {
          // Multi-part content: text + image blocks (Anthropic vision format)
          let mut parts: Vec<JsonValue> = vec![json!({"type": "text", "text": content})];
          for img in images {
            parts.push(json!({
              "type": "image",
              "source": {
                "type": "base64",
                "media_type": img.media_type,
                "data": img.data
              }
            }));
          }
          anth_messages.push(json!({"role": "user", "content": parts}));
        }
      }
      OaiMessage::Assistant { content, tool_calls } => {
        let mut content_blocks: Vec<JsonValue> = Vec::new();
        if let Some(text) = content {
          if !text.is_empty() {
            content_blocks.push(json!({"type": "text", "text": text}));
          }
        }
        if let Some(tcs) = tool_calls {
          for tc in tcs {
            let args: JsonValue = serde_json::from_str(&tc.function.arguments).unwrap_or(json!({}));
            content_blocks.push(json!({
              "type": "tool_use",
              "id": tc.id,
              "name": tc.function.name,
              "input": args
            }));
          }
        }
        if content_blocks.is_empty() {
          content_blocks.push(json!({"type": "text", "text": ""}));
        }
        anth_messages.push(json!({"role": "assistant", "content": content_blocks}));
      }
      OaiMessage::Tool { tool_call_id, content } => {
        anth_messages.push(json!({
          "role": "user",
          "content": [{"type": "tool_result", "tool_use_id": tool_call_id, "content": content}]
        }));
      }
    }
  }

  // Convert OAI tools → Anthropic tool format
  let anth_tools: Vec<JsonValue> = tools.iter().map(|t| {
    json!({
      "name": t.function.name,
      "description": t.function.description,
      "input_schema": t.function.parameters
    })
  }).collect();

  let mut body = json!({
    "model": model,
    "max_tokens": 8192,
    "messages": anth_messages,
    "tools": anth_tools
  });
  if !system_text.is_empty() {
    body["system"] = json!(system_text);
  }

  // Retry logic for rate limits (Anthropic has tighter limits, use more retries)
  let max_retries = 5;
  let mut last_error = String::new();

  for attempt in 0..max_retries {
    let res = client
      .post("https://api.anthropic.com/v1/messages")
      .header("x-api-key", api_key)
      .header("anthropic-version", "2023-06-01")
      .header("content-type", "application/json")
      .json(&body)
      .send()
      .await?;

    let status = res.status();
    let text = res.text().await.unwrap_or_default();

    if status.is_success() {
      // Parse Anthropic response → OAI format
      let parsed: JsonValue = serde_json::from_str(&text)?;

      let usage = parsed.get("usage").and_then(|u| {
        let input = u.get("input_tokens").and_then(|v| v.as_i64()).unwrap_or(0);
        let output = u.get("output_tokens").and_then(|v| v.as_i64()).unwrap_or(0);
        if input > 0 || output > 0 { Some(ChatUsage { input_tokens: input, output_tokens: output }) } else { None }
      });

      let mut reply_text = String::new();
      let mut tool_calls: Vec<OaiToolCall> = Vec::new();

      if let Some(content) = parsed.get("content").and_then(|c| c.as_array()) {
        for block in content {
          match block.get("type").and_then(|t| t.as_str()) {
            Some("text") => {
              if let Some(t) = block.get("text").and_then(|t| t.as_str()) {
                reply_text.push_str(t);
              }
            }
            Some("tool_use") => {
              let id = block.get("id").and_then(|i| i.as_str()).unwrap_or("").to_string();
              let name = block.get("name").and_then(|n| n.as_str()).unwrap_or("").to_string();
              let input = block.get("input").cloned().unwrap_or(json!({}));
              tool_calls.push(OaiToolCall {
                id,
                kind: "function".to_string(),
                function: OaiToolFn {
                  name,
                  arguments: serde_json::to_string(&input).unwrap_or_default(),
                },
              });
            }
            _ => {}
          }
        }
      }

      return Ok(OaiChatResp {
        choices: vec![OaiChoice {
          message: OaiChoiceMsg {
            content: if reply_text.is_empty() { None } else { Some(reply_text) },
            tool_calls,
          },
        }],
        usage,
      });
    }

    if status.as_u16() == 429 {
      let wait_secs = parse_retry_after(&text).unwrap_or(5.0 + (attempt as f64 * 2.0));
      eprintln!(
        "Anthropic rate limit (attempt {}/{}), waiting {:.1}s...",
        attempt + 1, max_retries, wait_secs
      );
      tokio::time::sleep(Duration::from_secs_f64(wait_secs)).await;
      last_error = format!("Anthropic HTTP {}: {}", status, text);
      continue;
    }

    anyhow::bail!("Anthropic HTTP {}: {}", status, text);
  }

  anyhow::bail!("Anthropic error after {} retries: {}", max_retries, last_error)
}

/// Call Google Gemini API and map the response back to OAI-compatible format.
pub async fn gemini_chat(
  api_key: &str,
  model: &str,
  messages: Vec<OaiMessage>,
  tools: Vec<OaiToolSpec>,
) -> anyhow::Result<OaiChatResp> {
  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(90))
    .build()?;

  // Convert OAI messages → Gemini format
  let mut system_text = String::new();
  let mut gemini_contents: Vec<JsonValue> = Vec::new();

  for msg in &messages {
    match msg {
      OaiMessage::System { content } => {
        if !system_text.is_empty() {
          system_text.push_str("\n\n");
        }
        system_text.push_str(content);
      }
      OaiMessage::User { content, images } => {
        let mut parts: Vec<JsonValue> = vec![json!({"text": content})];
        for img in images {
          parts.push(json!({
            "inline_data": {
              "mime_type": img.media_type,
              "data": img.data
            }
          }));
        }
        gemini_contents.push(json!({
          "role": "user",
          "parts": parts
        }));
      }
      OaiMessage::Assistant { content, tool_calls } => {
        let mut parts: Vec<JsonValue> = Vec::new();
        if let Some(text) = content {
          if !text.is_empty() {
            parts.push(json!({"text": text}));
          }
        }
        if let Some(tcs) = tool_calls {
          for tc in tcs {
            let args: JsonValue = serde_json::from_str(&tc.function.arguments).unwrap_or(json!({}));
            parts.push(json!({
              "functionCall": {
                "name": tc.function.name,
                "args": args
              }
            }));
          }
        }
        if parts.is_empty() {
          parts.push(json!({"text": ""}));
        }
        gemini_contents.push(json!({"role": "model", "parts": parts}));
      }
      OaiMessage::Tool { tool_call_id: _, content } => {
        // Gemini expects tool results as functionResponse parts in a user turn
        // Try to parse content as JSON for structured response
        let response_val: JsonValue = serde_json::from_str(content)
          .unwrap_or_else(|_| json!({"result": content}));
        gemini_contents.push(json!({
          "role": "user",
          "parts": [{"functionResponse": {"name": "tool", "response": response_val}}]
        }));
      }
    }
  }

  // Convert OAI tools → Gemini function declarations
  let gemini_tools: Vec<JsonValue> = if !tools.is_empty() {
    vec![json!({
      "functionDeclarations": tools.iter().map(|t| {
        json!({
          "name": t.function.name,
          "description": t.function.description,
          "parameters": t.function.parameters
        })
      }).collect::<Vec<JsonValue>>()
    })]
  } else {
    vec![]
  };

  let mut body = json!({
    "contents": gemini_contents,
    "tools": gemini_tools
  });
  if !system_text.is_empty() {
    body["systemInstruction"] = json!({"parts": [{"text": system_text}]});
  }

  let url = format!(
    "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
    model, api_key
  );

  let max_retries = 3;
  let mut last_error = String::new();

  for attempt in 0..max_retries {
    let res = client
      .post(&url)
      .header("content-type", "application/json")
      .json(&body)
      .send()
      .await?;

    let status = res.status();
    let text = res.text().await.unwrap_or_default();

    if status.is_success() {
      let parsed: JsonValue = serde_json::from_str(&text)?;

      // Gemini returns usageMetadata with promptTokenCount / candidatesTokenCount
      let usage = parsed.get("usageMetadata").and_then(|u| {
        let input = u.get("promptTokenCount").and_then(|v| v.as_i64()).unwrap_or(0);
        let output = u.get("candidatesTokenCount").and_then(|v| v.as_i64()).unwrap_or(0);
        if input > 0 || output > 0 { Some(ChatUsage { input_tokens: input, output_tokens: output }) } else { None }
      });

      let mut reply_text = String::new();
      let mut tool_calls: Vec<OaiToolCall> = Vec::new();
      let mut tc_counter = 0;

      if let Some(candidates) = parsed.get("candidates").and_then(|c| c.as_array()) {
        if let Some(candidate) = candidates.first() {
          if let Some(content) = candidate.get("content") {
            if let Some(parts) = content.get("parts").and_then(|p| p.as_array()) {
              for part in parts {
                if let Some(t) = part.get("text").and_then(|t| t.as_str()) {
                  reply_text.push_str(t);
                }
                if let Some(fc) = part.get("functionCall") {
                  tc_counter += 1;
                  let name = fc.get("name").and_then(|n| n.as_str()).unwrap_or("").to_string();
                  let args = fc.get("args").cloned().unwrap_or(json!({}));
                  tool_calls.push(OaiToolCall {
                    id: format!("call_{}", tc_counter),
                    kind: "function".to_string(),
                    function: OaiToolFn {
                      name,
                      arguments: serde_json::to_string(&args).unwrap_or_default(),
                    },
                  });
                }
              }
            }
          }
        }
      }

      return Ok(OaiChatResp {
        choices: vec![OaiChoice {
          message: OaiChoiceMsg {
            content: if reply_text.is_empty() { None } else { Some(reply_text) },
            tool_calls,
          },
        }],
        usage,
      });
    }

    if status.as_u16() == 429 {
      let wait_secs = parse_retry_after(&text).unwrap_or(5.0 + (attempt as f64 * 2.0));
      eprintln!(
        "Gemini rate limit (attempt {}/{}), waiting {:.1}s...",
        attempt + 1, max_retries, wait_secs
      );
      tokio::time::sleep(Duration::from_secs_f64(wait_secs)).await;
      last_error = format!("Gemini HTTP {}: {}", status, text);
      continue;
    }

    anyhow::bail!("Gemini HTTP {}: {}", status, text);
  }

  anyhow::bail!("Gemini error after {} retries: {}", max_retries, last_error)
}

pub fn parse_args_map(args: &str) -> HashMap<String, JsonValue> {
  serde_json::from_str::<JsonValue>(args)
    .ok()
    .and_then(|v| v.as_object().cloned())
    .map(|m| m.into_iter().map(|(k, v)| (k, v)).collect())
    .unwrap_or_default()
}
