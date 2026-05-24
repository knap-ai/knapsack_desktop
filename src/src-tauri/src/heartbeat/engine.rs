use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::Manager;
use tokio::sync::Mutex;

use crate::db::models::heartbeat::{HeartbeatConfig, HeartbeatLog};

/// Track recently sent notification messages to avoid repeating the same alert.
/// Stores (message, timestamp) pairs; entries older than 4 hours are pruned.
static RECENT_NOTIFICATIONS: once_cell::sync::Lazy<Mutex<Vec<(String, i64)>>> =
    once_cell::sync::Lazy::new(|| Mutex::new(Vec::new()));

/// The payload emitted to the frontend via Tauri event.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HeartbeatNotification {
    pub message: String,
    pub timestamp: i64,
}

/// The expected JSON response from the LLM.
#[derive(Debug, Deserialize)]
struct LlmDecision {
    notify: bool,
    message: Option<String>,
}

/// A summary of gathered context for the LLM prompt.
struct GatheredContext {
    email_summary: String,
    calendar_summary: String,
    email_count: usize,
    event_count: usize,
}

/// Start the heartbeat background loop. Runs indefinitely on a tokio task.
/// Checks every 60 seconds whether it is time to run a heartbeat evaluation.
pub async fn start_heartbeat_loop(
    app_handle: tauri::AppHandle,
    is_chatting: Arc<Mutex<AtomicBool>>,
) {
    info!("[heartbeat] Background loop started");

    // Give the app some time to finish initializing before the first check
    tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;

    loop {
        // Sleep 60 seconds between checks
        tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;

        match run_heartbeat_check(&app_handle, &is_chatting).await {
            Ok(_) => {}
            Err(e) => {
                warn!("[heartbeat] Check failed: {}", e);
            }
        }
    }
}

/// Manually trigger a single heartbeat check (used by the API endpoint).
pub async fn trigger_heartbeat(
    app_handle: &tauri::AppHandle,
    is_chatting: &Arc<Mutex<AtomicBool>>,
) -> Result<HeartbeatLog, String> {
    run_single_heartbeat(app_handle, true).await
}

/// The main check logic that runs every minute.
async fn run_heartbeat_check(
    app_handle: &tauri::AppHandle,
    is_chatting: &Arc<Mutex<AtomicBool>>,
) -> Result<(), String> {
    // 1. Read config
    let config = HeartbeatConfig::get_config().map_err(|e| format!("DB error: {:?}", e))?;

    // 2. Check if enabled
    if !config.enabled {
        return Ok(());
    }

    // 3. Check if user is actively chatting — don't interrupt
    {
        let chatting = is_chatting.lock().await;
        if chatting.load(Ordering::SeqCst) {
            return Ok(());
        }
    }

    // 4. Check if enough time has elapsed since last run
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    if let Some(last_run) = config.last_run_at {
        let elapsed_minutes = (now - last_run) / 60;
        if elapsed_minutes < config.interval_minutes {
            return Ok(());
        }
    }

    // 5. Check quiet hours
    if is_quiet_hours(&config) {
        return Ok(());
    }

    // 6. Run the heartbeat
    run_single_heartbeat(app_handle, false).await.map(|_| ())
}

/// Execute a single heartbeat: gather context, call LLM, maybe notify, log.
async fn run_single_heartbeat(
    app_handle: &tauri::AppHandle,
    force: bool,
) -> Result<HeartbeatLog, String> {
    info!("[heartbeat] Running heartbeat check (force={})", force);

    let config = HeartbeatConfig::get_config().map_err(|e| format!("DB error: {:?}", e))?;

    // Gather context from local APIs
    let context = gather_context(&config).await;

    // Collect recent notification messages so the LLM can avoid repeats
    let recent_msgs: Vec<String> = {
        let recent = RECENT_NOTIFICATIONS.lock().await;
        recent.iter().map(|(m, _)| m.clone()).collect()
    };

    // Build the LLM prompt
    let prompt = build_prompt(&context, &recent_msgs);

    // Call the LLM for judgment
    let decision = call_llm_for_decision(&prompt).await;

    let (should_notify, notification_message) = match decision {
        Ok(d) => (d.notify, d.message.unwrap_or_default()),
        Err(e) => {
            warn!("[heartbeat] LLM call failed: {}, defaulting to silent", e);
            (false, String::new())
        }
    };

    // If notify, emit Tauri event — but skip if we recently sent the same message
    if should_notify && !notification_message.is_empty() {
        let now_ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let is_duplicate = {
            let mut recent = RECENT_NOTIFICATIONS.lock().await;
            // Prune entries older than 4 hours
            let cutoff = now_ts - 4 * 3600;
            recent.retain(|(_, ts)| *ts > cutoff);
            // Check if this message (or very similar) was already sent
            let msg_lower = notification_message.to_lowercase();
            recent.iter().any(|(prev, _)| {
                let prev_lower = prev.to_lowercase();
                prev_lower == msg_lower || msg_lower.contains(&prev_lower) || prev_lower.contains(&msg_lower)
            })
        };

        if is_duplicate {
            info!("[heartbeat] Suppressed duplicate notification: {}", &notification_message);
        } else {
            let payload = HeartbeatNotification {
                message: notification_message.clone(),
                timestamp: now_ts,
            };

            if let Err(e) = app_handle.emit_all("heartbeat_notification", &payload) {
                error!("[heartbeat] Failed to emit notification event: {}", e);
            } else {
                info!("[heartbeat] Notification emitted: {}", &notification_message);
                // Track this notification
                let mut recent = RECENT_NOTIFICATIONS.lock().await;
                recent.push((notification_message.clone(), now_ts));
            }
        }
    }

    // Build context summary for logging
    let context_summary = format!(
        "emails: {}, events: {}",
        context.email_count, context.event_count
    );

    let decision_str = if should_notify { "notify" } else { "silent" };

    // Log the run
    let log_entry = HeartbeatLog::create(
        Some(context_summary),
        decision_str,
        should_notify,
        if should_notify {
            Some(notification_message)
        } else {
            None
        },
    )
    .map_err(|e| format!("Failed to create heartbeat log: {:?}", e))?;

    // Update last_run_at
    if let Err(e) = HeartbeatConfig::update_last_run_at() {
        warn!("[heartbeat] Failed to update last_run_at: {:?}", e);
    }

    info!("[heartbeat] Check complete: decision={}", decision_str);
    Ok(log_entry)
}

/// Check if the current time falls within quiet hours.
fn is_quiet_hours(config: &HeartbeatConfig) -> bool {
    let (start_str, end_str) = match (&config.quiet_hours_start, &config.quiet_hours_end) {
        (Some(s), Some(e)) => (s.clone(), e.clone()),
        _ => return false,
    };

    let now = chrono::Local::now();
    let current_minutes = now.format("%H:%M").to_string();

    // Parse "HH:MM" format
    let parse_hhmm = |s: &str| -> Option<u32> {
        let parts: Vec<&str> = s.split(':').collect();
        if parts.len() == 2 {
            let h = parts[0].parse::<u32>().ok()?;
            let m = parts[1].parse::<u32>().ok()?;
            Some(h * 60 + m)
        } else {
            None
        }
    };

    let start_min = match parse_hhmm(&start_str) {
        Some(m) => m,
        None => return false,
    };
    let end_min = match parse_hhmm(&end_str) {
        Some(m) => m,
        None => return false,
    };
    let now_min = match parse_hhmm(&current_minutes) {
        Some(m) => m,
        None => return false,
    };

    if start_min <= end_min {
        // Normal range: e.g. 22:00 - 23:00
        now_min >= start_min && now_min < end_min
    } else {
        // Overnight range: e.g. 22:00 - 07:00
        now_min >= start_min || now_min < end_min
    }
}

/// Gather context by calling the local Knapsack API endpoints.
async fn gather_context(config: &HeartbeatConfig) -> GatheredContext {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    let mut email_summary = String::from("No email data available.");
    let mut email_count: usize = 0;
    let mut calendar_summary = String::from("No calendar data available.");
    let mut event_count: usize = 0;

    // Fetch recent emails
    if config.check_emails {
        match client
            .post("http://127.0.0.1:8897/api/knapsack/recent_emails_search")
            .json(&json!({ "top": 10 }))
            .send()
            .await
        {
            Ok(resp) => {
                if let Ok(body) = resp.json::<serde_json::Value>().await {
                    if let Some(docs) = body["display_docs"].as_array() {
                        email_count = docs.len();
                        let mut summaries = Vec::new();
                        for (i, doc) in docs.iter().enumerate().take(5) {
                            let sender = doc["sender"].as_str().unwrap_or("unknown");
                            let subject = doc["subject"].as_str().unwrap_or("(no subject)");
                            let is_read = doc["isRead"].as_bool().unwrap_or(true);
                            let read_label = if is_read { "" } else { " [UNREAD]" };
                            summaries.push(format!(
                                "{}. From: {} | Subject: {}{}",
                                i + 1,
                                sender,
                                subject,
                                read_label
                            ));
                        }
                        if !summaries.is_empty() {
                            email_summary = summaries.join("\n");
                        }
                    }
                }
            }
            Err(e) => {
                warn!("[heartbeat] Failed to fetch emails: {}", e);
            }
        }
    }

    // Fetch upcoming calendar events
    if config.check_calendar {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        // Look ahead 8 hours to cover the rest of the working day
        let two_hours_later = now + 28800;

        match client
            .get(&format!(
                "http://127.0.0.1:8897/api/knapsack/calendar/get_events?start_timestamp={}&end_timestamp={}",
                now, two_hours_later
            ))
            .send()
            .await
        {
            Ok(resp) => {
                if let Ok(body) = resp.json::<serde_json::Value>().await {
                    if let Some(docs) = body["display_docs"].as_array() {
                        event_count = docs.len();
                        let mut summaries = Vec::new();
                        for (i, doc) in docs.iter().enumerate().take(5) {
                            let title = doc["title"].as_str().unwrap_or("(untitled)");
                            let start = doc["start"].as_i64().unwrap_or(0);
                            let minutes_until = if start > 0 {
                                ((start as u64).saturating_sub(now)) / 60
                            } else {
                                0
                            };
                            let time_display = if minutes_until < 2 {
                                "in about 1 minute".to_string()
                            } else if minutes_until < 60 {
                                format!("in {} minutes", minutes_until)
                            } else {
                                let hours = minutes_until / 60;
                                let remaining_mins = minutes_until % 60;
                                if hours == 1 {
                                    if remaining_mins > 15 {
                                        "in about 1.5 hours".to_string()
                                    } else {
                                        "in about 1 hour".to_string()
                                    }
                                } else if remaining_mins > 15 {
                                    format!("in about {}.5 hours", hours)
                                } else {
                                    format!("in about {} hours", hours)
                                }
                            };
                            summaries.push(format!(
                                "{}. {} ({})",
                                i + 1,
                                title,
                                time_display
                            ));
                        }
                        if !summaries.is_empty() {
                            calendar_summary = summaries.join("\n");
                        }
                    }
                }
            }
            Err(e) => {
                warn!("[heartbeat] Failed to fetch calendar events: {}", e);
            }
        }
    }

    GatheredContext {
        email_summary,
        calendar_summary,
        email_count,
        event_count,
    }
}

/// Build the LLM assessment prompt from gathered context.
fn build_prompt(context: &GatheredContext, recent_notifications: &[String]) -> String {
    let now_str = chrono::Local::now().format("%Y-%m-%d %H:%M").to_string();

    let recent_section = if recent_notifications.is_empty() {
        String::from("(none)")
    } else {
        recent_notifications
            .iter()
            .map(|m| format!("- {}", m))
            .collect::<Vec<_>>()
            .join("\n")
    };

    format!(
        r#"You are the user's proactive assistant at Knapsack. Your job is to surface the ONE most important, time-sensitive thing the user should know about right now.

CRITICAL: Focus on ONE thing only. Do not bundle multiple items. Pick the single most urgent item and mention only that.

Context:
- Recent emails ({} total):
{}
- Upcoming meetings today ({} total):
{}
- Current time: {}
- Notifications already sent recently (DO NOT repeat these):
{}

When to notify (pick the FIRST one that applies — only mention that ONE thing):
1. A meeting is coming up in the next 60 minutes — mention prep, who's attending
2. An urgent email from a real person needs a reply (direct question, deadline, decision needed)
3. It's morning and they haven't gotten a briefing yet — mention the most important thing on their plate today

When to stay SILENT:
- Emails are routine, automated, or informational (Apple Developer notices, Sentry alerts, newsletters, shipping notifications, marketing, CI/CD reports, etc.) — these are NEVER worth notifying about
- Nothing is genuinely time-sensitive or urgent right now
- You already notified about the exact same item recently — check the "Notifications already sent recently" list above. If a meeting or email has already been mentioned there, do NOT notify about it again
- There are no upcoming meetings and no emails that require a human reply
- The only emails are from automated systems, bots, or no-reply addresses

Be more aggressive about staying silent. If nothing is truly urgent or time-sensitive, stay silent. Routine emails and distant meetings do not warrant a notification.

Tone: Direct, helpful, conversational. Talk TO the user ("You have..." not "The user has..."). Be specific — mention names, subjects, times.

Respond with ONLY valid JSON, no markdown, no explanation:
{{"notify": true/false, "message": "1-2 sentences about the ONE most important thing. Be specific. If suggesting an action, phrase it as an offer: 'Want me to...' or 'I can...'"}}"#,
        context.email_count,
        context.email_summary,
        context.event_count,
        context.calendar_summary,
        now_str,
        recent_section
    )
}

/// Call the LLM to assess the context and make a notify/silent decision.
/// Prefers Groq for speed and cost, falls back to other configured providers.
async fn call_llm_for_decision(prompt: &str) -> Result<LlmDecision, String> {
    let provider = resolve_heartbeat_provider()?;

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    let response_text = if provider.is_anthropic {
        // Anthropic Messages API
        let body = json!({
            "model": &provider.model,
            "max_tokens": 256,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1
        });

        let resp = client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", &provider.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Anthropic request failed: {}", e))?;

        let status = resp.status();
        let text = resp
            .text()
            .await
            .map_err(|e| format!("Failed to read Anthropic response: {}", e))?;

        if !status.is_success() {
            return Err(format!("Anthropic error ({}): {}", status, text));
        }

        let json: serde_json::Value = serde_json::from_str(&text)
            .map_err(|e| format!("Anthropic JSON parse failed: {}", e))?;

        json["content"][0]["text"]
            .as_str()
            .unwrap_or("")
            .to_string()
    } else {
        // OpenAI-compatible API (Groq, OpenAI, Gemini)
        let body = json!({
            "model": &provider.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 256
        });

        let url = format!("{}/chat/completions", &provider.base_url);

        let resp = client
            .post(&url)
            .header("Authorization", format!("Bearer {}", &provider.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("{} request failed: {}", provider.name, e))?;

        let status = resp.status();
        let text = resp
            .text()
            .await
            .map_err(|e| format!("Failed to read {} response: {}", provider.name, e))?;

        if !status.is_success() {
            return Err(format!("{} error ({}): {}", provider.name, status, text));
        }

        let json: serde_json::Value = serde_json::from_str(&text)
            .map_err(|e| format!("{} JSON parse failed: {}", provider.name, e))?;

        json["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string()
    };

    // Parse the LLM response as JSON
    parse_llm_decision(&response_text)
}

/// Parse the LLM response text into a structured decision.
/// Handles cases where the LLM wraps JSON in markdown code blocks.
fn parse_llm_decision(text: &str) -> Result<LlmDecision, String> {
    let cleaned = text.trim();

    // Try direct JSON parse first
    if let Ok(decision) = serde_json::from_str::<LlmDecision>(cleaned) {
        return Ok(decision);
    }

    // Try extracting JSON from markdown code blocks
    let json_str = if let Some(start) = cleaned.find('{') {
        if let Some(end) = cleaned.rfind('}') {
            &cleaned[start..=end]
        } else {
            cleaned
        }
    } else {
        cleaned
    };

    serde_json::from_str::<LlmDecision>(json_str).map_err(|e| {
        format!(
            "Failed to parse LLM decision: {}. Response was: {}",
            e, text
        )
    })
}

/// Resolved LLM provider for the heartbeat system.
struct HeartbeatProvider {
    name: String,
    api_key: String,
    model: String,
    base_url: String,
    is_anthropic: bool,
}

/// Resolve the cheapest available model for the user's active provider.
/// The heartbeat always uses the cheapest model regardless of what the user
/// has configured for chat — background checks don't need expensive models.
///
/// Cheapest models per provider:
///   Groq: free (llama-3.3-70b-versatile)
///   Gemini: gemini-3.5-flash (fast, low-cost)
///   OpenAI: gpt-4o-mini (~$0.15/1M input)
///   Anthropic: claude-haiku-4-5 (~$0.25/1M input)
///   OpenRouter: free tier model
///
/// If the user's active provider key is unavailable, falls back to the
/// cheapest available provider. Respects KNAPSACK_DISABLE_PAID_FALLBACK.
fn resolve_heartbeat_provider() -> Result<HeartbeatProvider, String> {
    let active = std::env::var("KNAPSACK_ACTIVE_PROVIDER").unwrap_or_default();
    let disable_paid = std::env::var("KNAPSACK_DISABLE_PAID_FALLBACK")
        .map(|v| v == "1" || v.eq_ignore_ascii_case("true"))
        .unwrap_or(true);

    let groq_key = std::env::var("GROQ_API_KEY").ok().filter(|k| !k.trim().is_empty());
    let gemini_key = std::env::var("GEMINI_API_KEY")
        .or_else(|_| std::env::var("GOOGLE_API_KEY"))
        .ok()
        .filter(|k| !k.trim().is_empty());
    let openai_key = std::env::var("OPENAI_API_KEY").ok().filter(|k| !k.trim().is_empty());
    let anthropic_key = std::env::var("ANTHROPIC_API_KEY").ok().filter(|k| !k.trim().is_empty());
    let openrouter_key = std::env::var("OPENROUTER_API_KEY").ok().filter(|k| !k.trim().is_empty());

    // First: try the user's active provider with its CHEAPEST model
    match active.as_str() {
        "groq" if groq_key.is_some() => {
            return Ok(HeartbeatProvider {
                name: "groq".into(),
                api_key: groq_key.unwrap(),
                model: "llama-3.3-70b-versatile".into(),
                base_url: "https://api.groq.com/openai/v1".into(),
                is_anthropic: false,
            });
        }
        "gemini" if gemini_key.is_some() => {
            return Ok(HeartbeatProvider {
                name: "gemini".into(),
                api_key: gemini_key.unwrap(),
                model: "gemini-3.5-flash".into(),
                base_url: "https://generativelanguage.googleapis.com/v1beta/openai".into(),
                is_anthropic: false,
            });
        }
        "openai" if openai_key.is_some() => {
            return Ok(HeartbeatProvider {
                name: "openai".into(),
                api_key: openai_key.unwrap(),
                model: "gpt-4o-mini".into(), // cheapest, NOT the user's chat model
                base_url: "https://api.openai.com/v1".into(),
                is_anthropic: false,
            });
        }
        "anthropic" if anthropic_key.is_some() => {
            return Ok(HeartbeatProvider {
                name: "anthropic".into(),
                api_key: anthropic_key.unwrap(),
                model: "claude-haiku-4-5-20251001".into(), // cheapest, NOT Sonnet/Opus
                base_url: "https://api.anthropic.com/v1".into(),
                is_anthropic: true,
            });
        }
        "openrouter" if openrouter_key.is_some() => {
            return Ok(HeartbeatProvider {
                name: "openrouter".into(),
                api_key: openrouter_key.unwrap(),
                model: "meta-llama/llama-3.3-70b-instruct:free".into(),
                base_url: "https://openrouter.ai/api/v1".into(),
                is_anthropic: false,
            });
        }
        _ => {}
    }

    // Fallback: cheapest available provider (free → cheap → paid)
    log::info!("[heartbeat] Active provider '{}' unavailable, trying cheapest fallback", active);
    let active_is_free = matches!(active.as_str(), "groq" | "gemini" | "ollama" | "openrouter" | "");

    if let Some(key) = groq_key {
        return Ok(HeartbeatProvider {
            name: "groq".into(), api_key: key,
            model: "llama-3.3-70b-versatile".into(),
            base_url: "https://api.groq.com/openai/v1".into(),
            is_anthropic: false,
        });
    }
    if let Some(key) = gemini_key {
        return Ok(HeartbeatProvider {
            name: "gemini".into(), api_key: key,
            model: "gemini-3.5-flash".into(),
            base_url: "https://generativelanguage.googleapis.com/v1beta/openai".into(),
            is_anthropic: false,
        });
    }
    if let Some(key) = openrouter_key {
        return Ok(HeartbeatProvider {
            name: "openrouter".into(), api_key: key,
            model: "meta-llama/llama-3.3-70b-instruct:free".into(),
            base_url: "https://openrouter.ai/api/v1".into(),
            is_anthropic: false,
        });
    }
    // Only try paid providers if allowed
    if !disable_paid || !active_is_free {
        if let Some(key) = openai_key {
            return Ok(HeartbeatProvider {
                name: "openai".into(), api_key: key,
                model: "gpt-4o-mini".into(),
                base_url: "https://api.openai.com/v1".into(),
                is_anthropic: false,
            });
        }
        if let Some(key) = anthropic_key {
            return Ok(HeartbeatProvider {
                name: "anthropic".into(), api_key: key,
                model: "claude-haiku-4-5-20251001".into(),
                base_url: "https://api.anthropic.com/v1".into(),
                is_anthropic: true,
            });
        }
    } else {
        log::info!("[heartbeat] Skipping paid providers (KNAPSACK_DISABLE_PAID_FALLBACK, active={})", active);
    }

    Err("No API key configured for heartbeat. Please add an API key in Settings.".into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_llm_decision_direct_json() {
        let input = r#"{"notify": true, "message": "You have a meeting in 25 minutes"}"#;
        let result = parse_llm_decision(input).unwrap();
        assert!(result.notify);
        assert_eq!(
            result.message.unwrap(),
            "You have a meeting in 25 minutes"
        );
    }

    #[test]
    fn test_parse_llm_decision_markdown_wrapped() {
        let input = "```json\n{\"notify\": false, \"message\": \"\"}\n```";
        let result = parse_llm_decision(input).unwrap();
        assert!(!result.notify);
    }

    #[test]
    fn test_parse_llm_decision_silent() {
        let input = r#"{"notify": false, "message": ""}"#;
        let result = parse_llm_decision(input).unwrap();
        assert!(!result.notify);
    }

    #[test]
    fn test_is_quiet_hours_no_config() {
        let config = HeartbeatConfig {
            id: Some(1),
            enabled: true,
            interval_minutes: 30,
            check_emails: true,
            check_calendar: true,
            check_documents: false,
            quiet_hours_start: None,
            quiet_hours_end: None,
            last_run_at: None,
            created_at: None,
            updated_at: None,
        };
        assert!(!is_quiet_hours(&config));
    }
}
