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

#[derive(Clone, Debug, Serialize, Deserialize, Default)]
pub struct OaiUsage {
  #[serde(default)]
  pub prompt_tokens: i64,
  #[serde(default)]
  pub completion_tokens: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OaiChatResp {
  pub choices: Vec<OaiChoice>,
  #[serde(default)]
  pub usage: Option<OaiUsage>,
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
          "properties": { "targetId": { "type": "string" }, "ref": { "type": "string" }, "text": { "type": "string" }, "submit": { "type": ["boolean", "string"], "description": "Press Enter after typing. true or false." } },
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
            "recursive": { "type": ["boolean", "string"], "description": "Whether to search subdirectories (default: true). true or false." }
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
    // Direct email sending tool (uses Gmail/Outlook API, no browser needed).
    // Two-phase: first call drafts, second call with confirmed=true sends.
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "send_email".to_string(),
        description: "Draft an email via Gmail or Outlook API. Call with to/subject/body to create a draft — this does NOT send immediately. The draft opens automatically in the Email Autopilot compose drawer for the user to review and send. After calling, tell the user their draft is ready in the Email tab. Do NOT ask for chat confirmation — the user sends from the drawer. Only call again with confirmed=true + pending_id if the user explicitly says to send in chat.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "to": { "type": "string", "description": "Comma-separated recipient email addresses" },
            "cc": { "type": "string", "description": "Comma-separated CC email addresses (optional)" },
            "subject": { "type": "string", "description": "Email subject line" },
            "body": { "type": "string", "description": "Email body in HTML format. Use <p>, <br>, <b>, <i> tags for formatting." },
            "reply_to_uid": { "type": "string", "description": "If replying to an existing email, the email_uid of the message being replied to. Omit for new emails." },
            "thread_id": { "type": "string", "description": "Gmail thread ID for threading replies. Omit for new emails." },
            "confirmed": { "type": "boolean", "description": "Set to true ONLY after the user has explicitly confirmed the draft. Must be accompanied by pending_id." },
            "pending_id": { "type": "string", "description": "The pending_id returned from the draft step. Required when confirmed=true." }
          },
          "required": ["to", "subject", "body"],
          "additionalProperties": false
        }),
      },
    },
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "open_activity_panel".to_string(),
        description: "Open the Activity Panel / terminal drawer in the sidebar. Use when the user asks to open the terminal, open Claude Code, show the Activity Panel, or see terminal output. This opens the panel UI — it does NOT start a Claude Code session.".to_string(),
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
        name: "read_terminal".to_string(),
        description: "Read recent output from the built-in terminal panel. Use this to see what the user is working on in their terminal, check command output, view error messages, or understand terminal context without asking the user to paste. Returns the last N lines from active terminal sessions.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "session_id": { "type": "string", "description": "Optional terminal session ID ('app' for main terminal, 'clawdbot' for backend). If omitted, returns output from all sessions." },
            "max_lines": { "type": "integer", "description": "Maximum number of lines to return (default: 50, max: 500)" }
          },
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
        description: "Execute a shell command and return stdout, stderr, and exit code. Use for installing software (brew, npm, pip), running CLI tools, checking versions, and system tasks. Commands run via the system shell with a timeout. Dangerous commands (rm -rf /, shutdown, etc.) and writes to sensitive paths (~/.ssh, ~/.aws, etc.) are blocked.".to_string(),
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
    OaiToolSpec {
      kind: "function".to_string(),
      function: OaiToolSpecFn {
        name: "run_claude_code".to_string(),
        description: "Delegate a coding task to Claude Code (an AI coding agent). Claude Code can read/write files, run commands, search codebases, and perform multi-step software engineering tasks autonomously. ALWAYS use this when the user asks to modify code, create projects, debug issues, add features, fix bugs, or perform ANY coding task — even simple ones. The user sees Claude Code's live progress in the terminal panel. NEVER suggest the user run claude themselves — call this tool directly instead.".to_string(),
        parameters: json!({
          "type": "object",
          "properties": {
            "prompt": { "type": "string", "description": "The coding task to delegate to Claude Code (e.g., 'Add a dark mode toggle to the React app in ~/Projects/myapp')" },
            "working_dir": { "type": "string", "description": "The project directory for Claude Code to work in (e.g., '~/Projects/myapp')" }
          },
          "required": ["prompt", "working_dir"],
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
  openai_compatible_chat(api_key, model, "https://api.openai.com/v1", messages, tools).await
}

pub async fn groq_chat(
  api_key: &str,
  model: &str,
  messages: Vec<OaiMessage>,
  tools: Vec<OaiToolSpec>,
) -> anyhow::Result<OaiChatResp> {
  // Groq supports vision only on specific models (llama-4-scout, llama-4-maverick,
  // llama-3.2-*-vision-preview).  For text-only models like Kimi K2, sending
  // multi-part content (array with image_url) causes a 400 "content must be a
  // string" error.  Strip images for non-vision models proactively.
  let model_lower = model.to_lowercase();
  let supports_vision = model_lower.contains("llama-4-scout")
    || model_lower.contains("llama-4-maverick")
    || model_lower.contains("vision");

  let messages = if supports_vision {
    messages
  } else {
    strip_images(messages)
  };

  // Try with images first.  If Groq rejects multipart content (e.g. the model
  // or endpoint doesn't actually support vision), retry with images stripped.
  let result = openai_compatible_chat(
    api_key,
    model,
    "https://api.groq.com/openai/v1",
    messages.clone(),
    tools.clone(),
  )
  .await;
  match &result {
    Err(e) if e.to_string().contains("content must be a string") => {
      eprintln!("[groq_chat] Multipart content rejected, retrying without images");
      let stripped = strip_images(messages);
      openai_compatible_chat(
        api_key,
        model,
        "https://api.groq.com/openai/v1",
        stripped,
        tools,
      )
      .await
    }
    _ => result,
  }
}

/// Remove all image attachments from messages, keeping text content intact.
fn strip_images(messages: Vec<OaiMessage>) -> Vec<OaiMessage> {
  messages
    .into_iter()
    .map(|msg| match msg {
      OaiMessage::User { content, images } if !images.is_empty() => OaiMessage::User {
        content,
        images: Vec::new(),
      },
      other => other,
    })
    .collect()
}

pub async fn openai_compatible_chat(
  api_key: &str,
  model: &str,
  base_url: &str,
  messages: Vec<OaiMessage>,
  tools: Vec<OaiToolSpec>,
) -> anyhow::Result<OaiChatResp> {
  // Use a longer timeout for local providers (Ollama) which may need more time
  let is_local = base_url.contains("localhost") || base_url.contains("127.0.0.1");
  let timeout_secs = if is_local { 300 } else { 60 };
  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(timeout_secs))
    .build()?;

  // OpenAI reasoning models (o1, o3, o4-mini, gpt-5.2-pro) only support temperature=1 (default).
  // Ollama models also often reject non-default temperatures for reasoning variants.
  let is_reasoning_model = model.starts_with("o1")
    || model.starts_with("o3")
    || model.starts_with("o4")
    || model == "gpt-5.2-pro";
  let temperature = if is_reasoning_model { None } else { Some(0.2) };

  // Build messages JSON manually to support multi-part content (text + images) for vision
  let oai_messages: Vec<JsonValue> = messages
    .iter()
    .map(|msg| {
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
        OaiMessage::Assistant {
          content,
          tool_calls,
        } => {
          let mut obj = json!({"role": "assistant"});
          if let Some(text) = content {
            obj["content"] = json!(text);
          }
          if let Some(tcs) = tool_calls {
            let tc_json: Vec<JsonValue> = tcs
              .iter()
              .map(|tc| {
                json!({
                  "id": tc.id,
                  "type": tc.kind,
                  "function": {"name": tc.function.name, "arguments": tc.function.arguments}
                })
              })
              .collect();
            obj["tool_calls"] = json!(tc_json);
          }
          obj
        }
        OaiMessage::Tool {
          tool_call_id,
          content,
        } => {
          json!({"role": "tool", "tool_call_id": tool_call_id, "content": content})
        }
      }
    })
    .collect();

  let mut body = json!({
    "model": model,
    "messages": oai_messages,
  });
  if !tools.is_empty() {
    body["tools"] = json!(tools);
    // Don't send tool_choice for local Ollama models — some models
    // (e.g. gemma3) don't support this parameter via the OpenAI-compat API.
    if !is_local {
      body["tool_choice"] = json!("auto");
    }
  }
  if let Some(t) = temperature {
    body["temperature"] = json!(t);
  }

  // Retry logic for rate limits
  let max_retries = 3;
  let mut last_error = String::new();

  for attempt in 0..max_retries {
    let res = client
      .post(format!("{}/chat/completions", base_url))
      .bearer_auth(api_key)
      .json(&body)
      .send()
      .await?;

    let status = res.status();
    let text = res.text().await.unwrap_or_default();

    if status.is_success() {
      let parsed = parse_oai_chat_resp(&text)?;
      return Ok(fixup_raw_tool_tokens(parsed));
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
      last_error = format!("LLM HTTP {}: {}", status, text);
      continue;
    }

    // Groq returns 400 with code "tool_use_failed" when the model generates a
    // plain-text answer instead of a tool call.  The actual response is in the
    // "failed_generation" field — extract it and return it as a normal reply.
    if status.as_u16() == 400 {
      if let Ok(err_json) = serde_json::from_str::<JsonValue>(&text) {
        if err_json["error"]["code"].as_str() == Some("tool_use_failed") {
          if let Some(generation) = err_json["error"]["failed_generation"].as_str() {
            // Clean up broken markdown links the model often leaves behind.
            // These look like [label]( or [label]("  with truncated/empty URLs.
            // Use multiline mode so $ matches at each line ending, allowing
            // replace_all to strip broken links on every line (not just the last).
            let cleaned = regex::Regex::new(r#"(?m)\[([^\]]*)\]\([^)]*$"#)
              .map(|re| re.replace_all(generation, "$1").to_string())
              .unwrap_or_else(|_| generation.to_string());

            return Ok(OaiChatResp {
              choices: vec![OaiChoice {
                message: OaiChoiceMsg {
                  content: Some(cleaned),
                  tool_calls: vec![],
                },
              }],
              usage: None,
            });
          }
        }
      }
    }

    // Ollama models (local) may return errors when tools are included but
    // the model doesn't support them (e.g. gemma3).  Detect these errors
    // and retry once without tools so the model can still respond.
    let text_lower = text.to_lowercase();
    let is_tool_error = text_lower.contains("does not support tools")
      || text_lower.contains("does not support function")
      || text_lower.contains("tool use is not supported")
      || text_lower.contains("tools is not supported")
      || text_lower.contains("unknown parameter: tools");
    if is_tool_error && is_local && !tools.is_empty() {
      eprintln!("[chat_agent] Ollama model does not support tools — retrying without tools");
      let mut body_no_tools = json!({
        "model": model,
        "messages": oai_messages,
      });
      if let Some(t) = temperature {
        body_no_tools["temperature"] = json!(t);
      }
      let retry_res = client
        .post(format!("{}/chat/completions", base_url))
        .bearer_auth(api_key)
        .json(&body_no_tools)
        .send()
        .await?;
      let retry_status = retry_res.status();
      let retry_text = retry_res.text().await.unwrap_or_default();
      if retry_status.is_success() {
        let parsed = parse_oai_chat_resp(&retry_text)?;
        return Ok(fixup_raw_tool_tokens(parsed));
      }
      anyhow::bail!("LLM HTTP {}: {}", retry_status, retry_text);
    }

    // For other errors, fail immediately
    anyhow::bail!("LLM HTTP {}: {}", status, text);
  }

  // All retries exhausted
  anyhow::bail!("LLM error after {} retries: {}", max_retries, last_error)
}

/// Parse the retry-after time from OpenAI rate limit error messages
fn parse_retry_after(text: &str) -> Option<f64> {
  // Look for patterns like "Please try again in 4.183s" or "retry in X seconds"
  let patterns = ["try again in ", "retry in ", "wait "];

  for pattern in patterns {
    if let Some(idx) = text.find(pattern) {
      let start = idx + pattern.len();
      let rest = &text[start..];
      // Parse the number (could be float like "4.183s")
      let num_str: String = rest
        .chars()
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

pub fn parse_oai_chat_resp(text: &str) -> anyhow::Result<OaiChatResp> {
  match serde_json::from_str::<OaiChatResp>(text) {
    Ok(parsed) => Ok(parsed),
    Err(original_err) => {
      let repaired = repair_invalid_json_string_escapes(text);
      if repaired == text {
        return Err(original_err.into());
      }
      match serde_json::from_str::<OaiChatResp>(&repaired) {
        Ok(parsed) => {
          eprintln!(
            "[chat_agent] repaired malformed JSON escapes in chat completion response: {}",
            original_err
          );
          Ok(parsed)
        }
        Err(_) => Err(original_err.into()),
      }
    }
  }
}

pub fn parse_json_value_with_escape_repair(text: &str) -> anyhow::Result<JsonValue> {
  match serde_json::from_str::<JsonValue>(text) {
    Ok(parsed) => Ok(parsed),
    Err(original_err) => {
      let repaired = repair_invalid_json_string_escapes(text);
      if repaired == text {
        return Err(original_err.into());
      }
      match serde_json::from_str::<JsonValue>(&repaired) {
        Ok(parsed) => {
          eprintln!(
            "[chat_agent] repaired malformed JSON escapes in JSON response: {}",
            original_err
          );
          Ok(parsed)
        }
        Err(_) => Err(original_err.into()),
      }
    }
  }
}

fn repair_invalid_json_string_escapes(text: &str) -> String {
  fn is_hex(ch: char) -> bool {
    ch.is_ascii_hexdigit()
  }

  let chars: Vec<char> = text.chars().collect();
  let mut repaired = String::with_capacity(text.len());
  let mut i = 0usize;
  let mut in_string = false;

  while i < chars.len() {
    let ch = chars[i];
    if !in_string {
      repaired.push(ch);
      if ch == '"' {
        in_string = true;
      }
      i += 1;
      continue;
    }

    match ch {
      '"' => {
        repaired.push('"');
        in_string = false;
        i += 1;
      }
      '\\' => {
        if i + 1 >= chars.len() {
          repaired.push('\\');
          repaired.push('\\');
          i += 1;
          continue;
        }

        let next = chars[i + 1];
        let simple_escape = matches!(next, '"' | '\\' | '/' | 'b' | 'f' | 'n' | 'r' | 't');
        let unicode_escape =
          next == 'u' && i + 5 < chars.len() && chars[i + 2..=i + 5].iter().all(|ch| is_hex(*ch));

        if simple_escape {
          repaired.push('\\');
          repaired.push(next);
          i += 2;
        } else if unicode_escape {
          repaired.push('\\');
          repaired.push('u');
          repaired.push(chars[i + 2]);
          repaired.push(chars[i + 3]);
          repaired.push(chars[i + 4]);
          repaired.push(chars[i + 5]);
          i += 6;
        } else {
          repaired.push('\\');
          repaired.push('\\');
          i += 1;
        }
      }
      _ => {
        repaired.push(ch);
        i += 1;
      }
    }
  }

  repaired
}

/// Some models (e.g. Groq-hosted Llama) sometimes emit raw tool-call tokens as
/// plain text in the `content` field instead of producing structured
/// `tool_calls`.  Detect that pattern and convert the raw tokens into proper
/// `OaiToolCall` entries so the rest of the pipeline processes them correctly.
fn fixup_raw_tool_tokens(mut resp: OaiChatResp) -> OaiChatResp {
  for choice in &mut resp.choices {
    let msg = &mut choice.message;
    // Only attempt recovery when the model returned no structured tool calls
    // but the content contains the raw token markers.
    if !msg.tool_calls.is_empty() {
      continue;
    }
    let content = match &msg.content {
      Some(c) if c.contains("<|tool_call_begin|>") => c.clone(),
      _ => continue,
    };

    eprintln!("[chat_agent] detected raw tool-call tokens in content, attempting fixup");

    let mut extracted: Vec<OaiToolCall> = Vec::new();
    let mut tc_counter = 0u32;
    // Remaining text after stripping tool-call tokens.
    let mut cleaned = content.clone();

    // Pattern: <|tool_call_begin|>functions.NAME:IGNORED<|tool_call_argument_begin|>ARGS<|tool_call_end|>
    // The section may end with <|tool_calls_section_end|>
    let re = match regex::Regex::new(
      r#"<\|tool_call_begin\|>functions\.([^:<|]+)[^<]*<\|tool_call_argument_begin\|>([\s\S]*?)<\|tool_call_end\|>"#,
    ) {
      Ok(r) => r,
      Err(_) => continue,
    };

    for cap in re.captures_iter(&content) {
      let name = cap[1].to_string();
      let args_raw = cap[2].trim().to_string();
      // Ensure the arguments are valid JSON; fall back to empty object.
      let args = if serde_json::from_str::<JsonValue>(&args_raw).is_ok() {
        args_raw
      } else {
        "{}".to_string()
      };
      tc_counter += 1;
      extracted.push(OaiToolCall {
        id: format!("raw_tc_{}", tc_counter),
        kind: "function".to_string(),
        function: OaiToolFn {
          name,
          arguments: args,
        },
      });
    }

    if !extracted.is_empty() {
      // Strip all raw tool-call tokens from the content.
      let section_re =
        regex::Regex::new(r#"<\|tool_call_begin\|>[\s\S]*?<\|tool_call_end\|>"#).unwrap();
      cleaned = section_re.replace_all(&cleaned, "").to_string();
      let end_re = regex::Regex::new(r#"<\|tool_calls_section_end\|>"#).unwrap();
      cleaned = end_re.replace_all(&cleaned, "").to_string();
      let cleaned = cleaned.trim().to_string();

      eprintln!(
        "[chat_agent] extracted {} tool call(s) from raw tokens: {:?}",
        extracted.len(),
        extracted
          .iter()
          .map(|t| &t.function.name)
          .collect::<Vec<_>>()
      );

      msg.tool_calls = extracted;
      msg.content = if cleaned.is_empty() {
        None
      } else {
        Some(cleaned)
      };
    }
  }
  resp
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
      OaiMessage::Assistant {
        content,
        tool_calls,
      } => {
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
      OaiMessage::Tool {
        tool_call_id,
        content,
      } => {
        anth_messages.push(json!({
          "role": "user",
          "content": [{"type": "tool_result", "tool_use_id": tool_call_id, "content": content}]
        }));
      }
    }
  }

  // Convert OAI tools → Anthropic tool format
  let anth_tools: Vec<JsonValue> = tools
    .iter()
    .map(|t| {
      json!({
        "name": t.function.name,
        "description": t.function.description,
        "input_schema": t.function.parameters
      })
    })
    .collect();

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
              let id = block
                .get("id")
                .and_then(|i| i.as_str())
                .unwrap_or("")
                .to_string();
              let name = block
                .get("name")
                .and_then(|n| n.as_str())
                .unwrap_or("")
                .to_string();
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

      // Extract usage from Anthropic response (input_tokens / output_tokens)
      let anth_usage = parsed.get("usage").map(|u| OaiUsage {
        prompt_tokens: u["input_tokens"].as_i64().unwrap_or(0),
        completion_tokens: u["output_tokens"].as_i64().unwrap_or(0),
      });

      return Ok(OaiChatResp {
        choices: vec![OaiChoice {
          message: OaiChoiceMsg {
            content: if reply_text.is_empty() {
              None
            } else {
              Some(reply_text)
            },
            tool_calls,
          },
        }],
        usage: anth_usage,
      });
    }

    if status.as_u16() == 429 {
      let wait_secs = parse_retry_after(&text).unwrap_or(5.0 + (attempt as f64 * 2.0));
      eprintln!(
        "Anthropic rate limit (attempt {}/{}), waiting {:.1}s...",
        attempt + 1,
        max_retries,
        wait_secs
      );
      tokio::time::sleep(Duration::from_secs_f64(wait_secs)).await;
      last_error = format!("Anthropic HTTP {}: {}", status, text);
      continue;
    }

    anyhow::bail!("Anthropic HTTP {}: {}", status, text);
  }

  anyhow::bail!(
    "Anthropic error after {} retries: {}",
    max_retries,
    last_error
  )
}

/// Recursively strip fields that Gemini doesn't support from JSON-Schema
/// tool parameters: `additionalProperties` and array-style `"type": [...]`
/// (Gemini expects a single string for `type`, not an array).
fn clean_schema_for_gemini(val: &mut JsonValue) {
  match val {
    JsonValue::Object(map) => {
      map.remove("additionalProperties");
      // Convert "type": ["boolean","string"] → "type": "string"
      if let Some(t) = map.get_mut("type") {
        if let Some(arr) = t.as_array() {
          if let Some(first) = arr
            .iter()
            .find(|v| v.as_str() != Some("null"))
            .and_then(|v| v.as_str())
          {
            *t = json!(first);
          } else if let Some(first) = arr.first().and_then(|v| v.as_str()) {
            *t = json!(first);
          }
        }
      }
      for (_, v) in map.iter_mut() {
        clean_schema_for_gemini(v);
      }
    }
    JsonValue::Array(arr) => {
      for v in arr.iter_mut() {
        clean_schema_for_gemini(v);
      }
    }
    _ => {}
  }
}

/// Call Google Gemini API and map the response back to OAI-compatible format.
pub async fn gemini_chat(
  api_key: &str,
  model: &str,
  messages: Vec<OaiMessage>,
  tools: Vec<OaiToolSpec>,
) -> anyhow::Result<OaiChatResp> {
  gemini_chat_with_retries(api_key, model, messages, tools, 6).await
}

/// Call Google Gemini API with an explicit retry count.
pub async fn gemini_chat_with_retries(
  api_key: &str,
  model: &str,
  messages: Vec<OaiMessage>,
  tools: Vec<OaiToolSpec>,
  max_retries: usize,
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
      OaiMessage::Assistant {
        content,
        tool_calls,
      } => {
        let mut parts: Vec<JsonValue> = Vec::new();
        if let Some(text) = content {
          if !text.is_empty() {
            parts.push(json!({"text": text}));
          }
        }
        if let Some(tcs) = tool_calls {
          // Gemini 2.5+ models with thinking enabled require thoughtSignature on all functionCall
          // parts in conversation history. Use the skip_thought_signature_validator sentinel for
          // function calls that don't have an actual signature (e.g. replayed from prior turns).
          // See: https://ai.google.dev/gemini-api/docs/thought-signatures
          let needs_thought_sig = {
            let m = model.to_lowercase();
            m.contains("gemini-2.5") || m.contains("gemini-3")
          };
          for tc in tcs {
            let args: JsonValue = serde_json::from_str(&tc.function.arguments).unwrap_or(json!({}));
            if needs_thought_sig {
              parts.push(json!({
                "functionCall": {
                  "name": tc.function.name,
                  "args": args
                },
                "thoughtSignature": "skip_thought_signature_validator"
              }));
            } else {
              parts.push(json!({
                "functionCall": {
                  "name": tc.function.name,
                  "args": args
                }
              }));
            }
          }
        }
        if parts.is_empty() {
          parts.push(json!({"text": ""}));
        }
        gemini_contents.push(json!({"role": "model", "parts": parts}));
      }
      OaiMessage::Tool {
        tool_call_id: _,
        content,
      } => {
        // Gemini expects tool results as functionResponse parts in a user turn
        // Try to parse content as JSON for structured response
        let response_val: JsonValue =
          serde_json::from_str(content).unwrap_or_else(|_| json!({"result": content}));
        gemini_contents.push(json!({
          "role": "user",
          "parts": [{"functionResponse": {"name": "tool", "response": response_val}}]
        }));
      }
    }
  }

  // Convert OAI tools → Gemini function declarations, stripping unsupported schema fields
  let gemini_tools: Vec<JsonValue> = if !tools.is_empty() {
    vec![json!({
      "functionDeclarations": tools.iter().map(|t| {
        let mut params = t.function.parameters.clone();
        clean_schema_for_gemini(&mut params);
        json!({
          "name": t.function.name,
          "description": t.function.description,
          "parameters": params
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
                  let name = fc
                    .get("name")
                    .and_then(|n| n.as_str())
                    .unwrap_or("")
                    .to_string();
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

      // Extract usage from Gemini usageMetadata
      let gemini_usage = parsed.get("usageMetadata").map(|u| OaiUsage {
        prompt_tokens: u["promptTokenCount"].as_i64().unwrap_or(0),
        completion_tokens: u["candidatesTokenCount"].as_i64().unwrap_or(0),
      });

      return Ok(OaiChatResp {
        choices: vec![OaiChoice {
          message: OaiChoiceMsg {
            content: if reply_text.is_empty() {
              None
            } else {
              Some(reply_text)
            },
            tool_calls,
          },
        }],
        usage: gemini_usage,
      });
    }

    if status.as_u16() == 429 || status.as_u16() == 503 {
      last_error = format!("Gemini HTTP {}: {}", status, text);
      if attempt + 1 >= max_retries {
        anyhow::bail!("{}", last_error);
      }
      let wait_secs = parse_retry_after(&text).unwrap_or(3.0 + (attempt as f64 * 2.0));
      eprintln!(
        "Gemini transient error {} (attempt {}/{}), waiting {:.1}s...",
        status,
        attempt + 1,
        max_retries,
        wait_secs
      );
      tokio::time::sleep(Duration::from_secs_f64(wait_secs)).await;
      continue;
    }

    anyhow::bail!("Gemini HTTP {}: {}", status, text);
  }

  anyhow::bail!("Gemini error after {} retries: {}", max_retries, last_error)
}

pub fn parse_args_map(args: &str) -> HashMap<String, JsonValue> {
  parse_json_value_with_escape_repair(args)
    .ok()
    .and_then(|v| v.as_object().cloned())
    .map(|m| m.into_iter().map(|(k, v)| (k, v)).collect())
    .unwrap_or_default()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn repairs_truncated_unicode_escape_in_json_string() {
    let raw = r#"{"choices":[{"message":{"content":"bad \u12 path","tool_calls":[]}}]}"#;
    let parsed = parse_oai_chat_resp(raw).expect("response should be repaired");
    let content = parsed.choices[0].message.content.as_deref().unwrap_or("");
    assert_eq!(content, r#"bad \u12 path"#);
  }

  #[test]
  fn repairs_invalid_backslash_escape_in_json_string() {
    let raw = r#"{"choices":[{"message":{"content":"draft \q now","tool_calls":[]}}]}"#;
    let parsed = parse_oai_chat_resp(raw).expect("response should be repaired");
    let content = parsed.choices[0].message.content.as_deref().unwrap_or("");
    assert_eq!(content, r#"draft \q now"#);
  }

  #[test]
  fn repairs_invalid_tool_argument_escapes() {
    let parsed = parse_args_map(r#"{"path":"C:\users\amit\u12tmp","note":"draft \q now"}"#);
    assert_eq!(
      parsed.get("path").and_then(|v| v.as_str()),
      Some(r#"C:\users\amit\u12tmp"#)
    );
    assert_eq!(
      parsed.get("note").and_then(|v| v.as_str()),
      Some(r#"draft \q now"#)
    );
  }
}
