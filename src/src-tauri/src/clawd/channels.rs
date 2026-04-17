use actix_web::{get, post, web, HttpResponse, Responder};
use once_cell::sync::Lazy;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::Duration;

use crate::clawd::gateway_client;
use crate::clawd::pairing_auto_approve;
use crate::clawd::sidecar::SharedClawdbotConfig;

/// Strip ANSI escape sequences (colours, bold, etc.) from a string.
/// The gateway returns colourised channelSummary lines which must be
/// cleaned before we can prefix-match on them.
static ANSI_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"\x1b\[[0-9;]*m").unwrap()
});

fn strip_ansi(s: &str) -> String {
    ANSI_RE.replace_all(s, "").into_owned()
}

/// Quick check: is the gateway port listening?  If not, attempt a restart
/// via `ensure_gateway_best_effort` and re-check.  Returns a fast error
/// response if the gateway is still down after the restart attempt.
async fn gateway_or_bail() -> Option<HttpResponse> {
    if gateway_client::is_gateway_port_open().await {
        return None;
    }

    // Gateway is down — try to restart it before giving up.
    // This handles the common case where the gateway crashed and macOS
    // KeepAlive hasn't restarted it yet, or the restart is in progress.
    eprintln!("[channels] gateway port not open — attempting restart before bailing");
    gateway_client::ensure_gateway_and_wait().await;

    // Re-check after restart attempt
    if gateway_client::is_gateway_port_open().await {
        eprintln!("[channels] gateway came back after restart — proceeding");
        return None;
    }

    Some(HttpResponse::Ok().json(ChannelStatusResponse {
        success: false,
        enabled: false,
        configured: false,
        linked: Some(false),
        provider: None,
        message: Some("Gateway not reachable — the background service may need to be restarted. Check the Activity panel.".to_string()),
        account: None,
    }))
}

/// Request body for sending a message through a channel.
#[derive(Deserialize)]
struct SendMessageRequest {
    /// Channel to send through: "whatsapp" or "imessage"
    channel: String,
    /// Recipient address: phone number (WhatsApp) or email/phone (iMessage)
    to: String,
    /// The message text
    message: String,
}

/// Response for send-message
#[derive(Serialize)]
struct SendMessageResponse {
    success: bool,
    message: Option<String>,
}

/// Response for channel status
#[derive(Serialize)]
struct ChannelStatusResponse {
    success: bool,
    enabled: bool,
    configured: bool,
    linked: Option<bool>,
    provider: Option<String>,
    message: Option<String>,
    /// The account identifier (e.g. phone number for WhatsApp, email for iMessage)
    #[serde(skip_serializing_if = "Option::is_none")]
    account: Option<String>,
}

/// Request body for enable/disable
#[derive(Deserialize)]
struct EnableRequest {
    enabled: bool,
}

/// Generic success response
#[derive(Serialize)]
struct GenericResponse {
    success: bool,
    message: Option<String>,
    configured: Option<bool>,
    linked: Option<bool>,
}

/// Translate gateway config validation errors into user-friendly messages.
fn humanize_config_error(channel: &str, raw_error: &str) -> String {
    let lower = raw_error.to_lowercase();

    if lower.contains("unrecognized key") {
        return format!(
            "Configuration rejected — the gateway does not accept one or more fields. \
             Please check that you're providing the correct credentials for {}.",
            channel
        );
    }

    // Slack-specific: missing appToken
    if channel == "slack" && (lower.contains("apptoken") || lower.contains("app_token") || lower.contains("app-level")) {
        return "Slack requires both a Bot Token (xoxb-…) and an App-Level Token (xapp-…). \
                Please provide both.".to_string();
    }

    // Discord-specific: missing token
    if channel == "discord" && lower.contains("token") {
        return "Discord requires a bot token. Create one at discord.com/developers/applications.".to_string();
    }

    // Google Chat-specific: requires a service account, not just a webhook URL
    if channel == "googlechat" {
        return "Google Chat requires a service account JSON key (not just a webhook URL). \
                Use the CLI: openclaw channels setup googlechat --token-file <service-account.json>. \
                See the Google Chat docs for setup instructions.".to_string();
    }

    // Fallback: include the raw error but with a friendlier prefix
    format!("Failed to configure {}: {}", channel, raw_error)
}

/// Extract baseHash from a config.get snapshot response.
/// The gateway returns the snapshot with a "hash" field at the top level,
/// computed from the raw config file contents.
/// When the config file doesn't exist yet (exists == false), the gateway
/// doesn't require a baseHash, so we return an empty string in that case.
fn extract_base_hash(snapshot: &serde_json::Value) -> String {
    // Try top-level "hash" field first (standard snapshot shape)
    if let Some(h) = snapshot.get("hash").and_then(|v| v.as_str()) {
        if !h.is_empty() {
            return h.to_string();
        }
    }
    // If config file doesn't exist, no hash is needed
    if let Some(false) = snapshot.get("exists").and_then(|v| v.as_bool()) {
        return String::new();
    }
    // Log a warning so we can debug if the snapshot shape changes
    eprintln!(
        "[channels] warning: could not extract baseHash from config snapshot (keys: {:?})",
        snapshot.as_object().map(|o| o.keys().collect::<Vec<_>>())
    );
    String::new()
}

/// Check whether `agents.defaults.model` is already set in the config snapshot.
fn has_default_model(snapshot: &serde_json::Value) -> bool {
    let config = snapshot.get("config").unwrap_or(snapshot);
    let model = config.pointer("/agents/defaults/model");
    match model {
        Some(serde_json::Value::String(s)) => !s.trim().is_empty(),
        Some(serde_json::Value::Object(o)) => {
            // Object form: { "primary": "anthropic/…", "fallbacks": [...] }
            o.get("primary")
                .and_then(|v| v.as_str())
                .map(|s| !s.trim().is_empty())
                .unwrap_or(false)
        }
        _ => false,
    }
}

/// Pick the best default model based on which LLM API key is available.
///
/// The gateway inherits env vars from the desktop app (service.rs propagates
/// ANTHROPIC_API_KEY, OPENAI_API_KEY, GROQ_API_KEY, GEMINI_API_KEY).
fn resolve_default_model() -> String {
    // Respect the user's active provider selection so the gateway model
    // matches what the user configured in Settings.
    let active = std::env::var("KNAPSACK_ACTIVE_PROVIDER").unwrap_or_default();

    match active.as_str() {
        "openrouter" => {
            let model = std::env::var("KNAPSACK_OPENROUTER_MODEL")
                .unwrap_or_else(|_| "meta-llama/llama-3.3-70b-instruct:free".to_string());
            return format!("openrouter/{}", model);
        }
        "ollama" => {
            let model = std::env::var("KNAPSACK_OLLAMA_MODEL")
                .unwrap_or_else(|_| "llama3.1".to_string());
            return format!("ollama/{}", model);
        }
        "anthropic" if has_key("ANTHROPIC_API_KEY") => {
            let model = std::env::var("KNAPSACK_ANTHROPIC_MODEL")
                .unwrap_or_else(|_| "claude-opus-4-6".to_string());
            return format!("anthropic/{}", model);
        }
        "openai" if has_key("OPENAI_API_KEY") => {
            let model = std::env::var("KNAPSACK_OPENAI_MODEL")
                .unwrap_or_else(|_| "gpt-5.4".to_string());
            return format!("openai/{}", model);
        }
        "groq" if has_key("GROQ_API_KEY") => {
            let model = std::env::var("KNAPSACK_GROQ_MODEL")
                .unwrap_or_else(|_| "llama-3.3-70b-versatile".to_string());
            return format!("groq/{}", model);
        }
        "gemini" if has_key("GEMINI_API_KEY") => {
            let model = std::env::var("KNAPSACK_GEMINI_MODEL")
                .unwrap_or_else(|_| "gemini-2.0-flash".to_string());
            return format!("google/{}", model);
        }
        _ => {}
    }

    // Fallback: try providers in preference order
    if has_key("ANTHROPIC_API_KEY") {
        let model = std::env::var("KNAPSACK_ANTHROPIC_MODEL")
            .unwrap_or_else(|_| "claude-opus-4-6".to_string());
        return format!("anthropic/{}", model);
    }
    if has_key("OPENAI_API_KEY") {
        let model = std::env::var("KNAPSACK_OPENAI_MODEL")
            .unwrap_or_else(|_| "gpt-5.4".to_string());
        return format!("openai/{}", model);
    }
    if has_key("GROQ_API_KEY") { return "groq/llama-3.3-70b-versatile".to_string(); }
    if has_key("GEMINI_API_KEY") { return "google/gemini-2.0-flash".to_string(); }
    if has_key("OPENROUTER_API_KEY") {
        let model = std::env::var("KNAPSACK_OPENROUTER_MODEL")
            .unwrap_or_else(|_| "meta-llama/llama-3.3-70b-instruct:free".to_string());
        return format!("openrouter/{}", model);
    }
    if std::env::var("OLLAMA_API_KEY").map(|k| !k.trim().is_empty()).unwrap_or(false) {
        let model = std::env::var("KNAPSACK_OLLAMA_MODEL")
            .unwrap_or_else(|_| "llama3.1".to_string());
        return format!("ollama/{}", model);
    }

    // Fallback — matches the gateway's compiled default
    "anthropic/claude-opus-4-6".to_string()
}

fn has_key(var: &str) -> bool {
    std::env::var(var).map(|k| !k.trim().is_empty()).unwrap_or(false)
}

/// Check whether `browser.enabled` is already true in the config snapshot.
fn has_browser_enabled(snapshot: &serde_json::Value) -> bool {
    let config = snapshot.get("config").unwrap_or(snapshot);
    config
        .pointer("/browser/enabled")
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
}

/// Check whether `tools.sandbox.tools.allow` includes the minimum set of
/// tools required for channel messages (Telegram, WhatsApp, etc.) to work.
/// Without these, the gateway's sandbox mode blocks browser, web, and exec
/// tools — so the agent silently fails to respond to channel messages even
/// though the channel shows as "connected" in the UI.
fn has_sandbox_tools(snapshot: &serde_json::Value) -> bool {
    let config = snapshot.get("config").unwrap_or(snapshot);
    let allow = match config.pointer("/tools/sandbox/tools/allow").and_then(|v| v.as_array()) {
        Some(arr) => arr,
        None => return false,
    };
    // Check for a few critical tools that must be present
    let required = ["exec", "browser", "sessions_send"];
    required.iter().all(|tool| {
        allow.iter().any(|item| item.as_str() == Some(tool))
    })
}

/// Build a config.patch JSON string for enabling a channel.
///
/// If `agents.defaults.model` is not already set, the patch includes it so
/// that the auto-reply agent can actually generate responses.
///
/// Also ensures `browser.enabled` is true so the auto-reply agent can use
/// browser automation (e.g. "check my email" from Telegram).
///
/// Also ensures `tools.sandbox.tools.allow` and `tools.sandbox.tools.deny`
/// are set so that channel messages can use browser, exec, web, and session
/// tools.  Without this, channels show "connected" but the AI cannot
/// respond because sandbox mode blocks all the tools it needs.
fn build_enable_patch(channel_patch: &str, snapshot: &serde_json::Value) -> String {
    let needs_model = !has_default_model(snapshot);
    let needs_browser = !has_browser_enabled(snapshot);
    let needs_sandbox_tools = !has_sandbox_tools(snapshot);

    if !needs_model && !needs_browser && !needs_sandbox_tools {
        return channel_patch.to_string();
    }

    let mut patch: serde_json::Value = serde_json::from_str(channel_patch).unwrap();

    if needs_model {
        let model = resolve_default_model();
        patch
            .as_object_mut()
            .unwrap()
            .insert(
                "agents".to_string(),
                serde_json::json!({"defaults": {"model": model}}),
            );
    }

    if needs_browser {
        patch
            .as_object_mut()
            .unwrap()
            .insert(
                "browser".to_string(),
                serde_json::json!({"enabled": true}),
            );
    }

    if needs_sandbox_tools {
        // Merge sandbox tools into the patch.  This mirrors what service.rs
        // does at startup, but ensures it also happens when a channel is
        // enabled/reconnected after a config reset (when service.rs startup
        // patching has already run against the old, now-deleted config).
        let tools_patch = serde_json::json!({
            "sandbox": {
                "tools": {
                    "deny": ["canvas", "nodes", "cron", "gateway"],
                    "allow": [
                        "exec", "process", "group:fs",
                        "image", "sessions_list", "sessions_history",
                        "sessions_send", "sessions_spawn", "session_status",
                        "browser", "group:web"
                    ]
                }
            }
        });
        // Also ensure normal-mode tools.allow includes browser + group:web
        let mut tools_val = serde_json::json!({
            "allow": ["browser", "group:web", "exec", "process", "group:fs"],
            "deny": ["canvas", "nodes", "cron", "gateway"],
            "exec": {"applyPatch": {"enabled": true}},
            "media": {"image": {"enabled": true}}
        });
        // Merge sandbox into tools
        tools_val.as_object_mut().unwrap().insert("sandbox".to_string(), tools_patch["sandbox"].clone());

        patch
            .as_object_mut()
            .unwrap()
            .insert("tools".to_string(), tools_val);
        eprintln!("[channels] build_enable_patch: added sandbox tools to config patch");
    }

    serde_json::to_string(&patch).unwrap()
}

/// Helper to parse channel summary from gateway status response.
///
/// The gateway returns channelSummary as an array of strings like:
///   "WhatsApp: linked +1234567890 auth 2h ago"
///   "WhatsApp: not linked"
///   "iMessage: configured"
///   "iMessage: not configured"
///   "WhatsApp: disabled"
///
/// The status keyword is always immediately after ": ".  We use
/// `starts_with` on the status portion so "not linked" is never
/// confused with "linked".
fn parse_channel_from_summary(status: &serde_json::Value, channel_name: &str) -> (bool, bool, bool) {
    let channel_summary = status
        .get("channelSummary")
        .and_then(|cs| cs.as_array());

    if let Some(lines) = channel_summary {
        let prefix = format!("{}: ", channel_name.to_lowercase());
        for line in lines {
            if let Some(text) = line.as_str() {
                let clean = strip_ansi(text);
                let lower = clean.to_lowercase();
                if let Some(status_part) = lower.strip_prefix(&prefix) {
                    let enabled = !status_part.starts_with("disabled");
                    let linked = status_part.starts_with("linked");
                    let configured = status_part.starts_with("configured");
                    return (enabled, linked, configured);
                }
            }
        }
    }

    (false, false, false)
}

/// Extract a phone number from the channelSummary for a given channel.
///
/// WhatsApp summary looks like: "WhatsApp: linked +1234567890 auth 2h ago"
/// We extract the token that starts with '+' followed by digits.
fn parse_account_from_summary(status: &serde_json::Value, channel_name: &str) -> Option<String> {
    let channel_summary = status.get("channelSummary")?.as_array()?;
    let prefix = format!("{}: ", channel_name.to_lowercase());
    for line in channel_summary {
        if let Some(text) = line.as_str() {
            let clean = strip_ansi(text);
            let lower = clean.to_lowercase();
            if lower.starts_with(&prefix) {
                // Find a token starting with '+' and containing digits
                for token in clean.split_whitespace() {
                    if token.starts_with('+') && token.len() > 1 && token[1..].chars().all(|c| c.is_ascii_digit()) {
                        return Some(token.to_string());
                    }
                }
            }
        }
    }
    None
}

/// Get WhatsApp channel status
#[get("/api/clawd/channels/whatsapp/status")]
pub async fn whatsapp_status(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    if let Some(bail) = gateway_or_bail().await { return bail; }
    match gateway_client::get_channel_status(None).await {
        Ok(status) => {
            let (enabled, linked, _configured) = parse_channel_from_summary(&status, "WhatsApp");
            let account = if linked {
                parse_account_from_summary(&status, "WhatsApp")
            } else {
                None
            };

            HttpResponse::Ok().json(ChannelStatusResponse {
                success: true,
                enabled,
                configured: linked,
                linked: Some(linked),
                provider: None,
                message: None,
                account,
            })
        }
        Err(e) => HttpResponse::Ok().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: Some(false),
            provider: None,
            message: Some(format!("Gateway error: {}", e)),
            account: None,
        }),
    }
}

/// Enable/disable WhatsApp channel via config.patch
#[post("/api/clawd/channels/whatsapp/enable")]
pub async fn whatsapp_enable(
    _cfg: web::Data<SharedClawdbotConfig>,
    body: web::Json<EnableRequest>,
) -> impl Responder {
    // First get current config to obtain baseHash
    let config_result = gateway_client::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            // Extract baseHash from snapshot — the gateway uses "hash" at the top level
            let base_hash = extract_base_hash(&config_snapshot);

            // WhatsApp channel config:
            // - dmPolicy "allowlist" = only owner (linked self number) can interact; others silently ignored
            // Also ensures agents.defaults.model is set so auto-reply actually works.
            let patch = if body.enabled {
                build_enable_patch(
                    r#"{"channels": {"whatsapp": {"dmPolicy": "allowlist"}}}"#,
                    &config_snapshot,
                )
            } else {
                r#"{"channels": {"whatsapp": null}}"#.to_string()
            };

            match gateway_client::config_patch(&patch, &base_hash, None).await {
                Ok(_) => HttpResponse::Ok().json(GenericResponse {
                    success: true,
                    message: Some(if body.enabled {
                        "WhatsApp enabled".to_string()
                    } else {
                        "WhatsApp disabled".to_string()
                    }),
                    configured: None,
                    linked: None,
                }),
                Err(e) => HttpResponse::Ok().json(GenericResponse {
                    success: false,
                    message: Some(format!("Failed to update config: {}", e)),
                    configured: None,
                    linked: None,
                }),
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to get config: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Response for WhatsApp login (includes QR data URL)
#[derive(Serialize)]
struct WhatsAppLoginResponse {
    success: bool,
    message: Option<String>,
    #[serde(rename = "qrDataUrl", skip_serializing_if = "Option::is_none")]
    qr_data_url: Option<String>,
}

/// Start WhatsApp login flow.
///
/// After config.patch enables WhatsApp, the gateway restarts (SIGUSR1).
/// The WebSocket connection drops during restart, so we retry a few times
/// with backoff to let the gateway come back up before calling web.login.start.
#[post("/api/clawd/channels/whatsapp/login")]
pub async fn whatsapp_login(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    let params = serde_json::json!({
        "force": true
    });

    // Invalidate the pooled connection — the gateway may have restarted
    // after config.patch.  The next request will open a fresh connection.
    gateway_client::invalidate();

    let mut last_err = String::new();
    let delays = [
        Duration::from_secs(2),
        Duration::from_secs(3),
        Duration::from_secs(4),
    ];

    for (attempt, delay) in delays.iter().enumerate() {
        tokio::time::sleep(*delay).await;

        match gateway_client::call_channel_method(
            "web.login.start",
            Some(params.clone()),
            None,
        )
        .await
        {
            Ok(result) => {
                let qr_data_url = result
                    .get("qrDataUrl")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());
                let message = result
                    .get("message")
                    .and_then(|v| v.as_str())
                    .unwrap_or("WhatsApp login started. Scan the QR code.")
                    .to_string();

                // If the RPC succeeded but no QR was returned, the WhatsApp
                // channel likely hasn't finished initializing yet. Treat this
                // as a retryable failure rather than returning success with no
                // QR (which the frontend misinterprets as "already linked").
                if qr_data_url.is_none() {
                    eprintln!(
                        "[channels] web.login.start attempt {} returned OK but no qrDataUrl — retrying",
                        attempt + 1,
                    );
                    last_err = format!("No QR code returned: {}", message);
                    gateway_client::invalidate();
                    continue;
                }

                return HttpResponse::Ok().json(WhatsAppLoginResponse {
                    success: true,
                    message: Some(message),
                    qr_data_url,
                });
            }
            Err(e) => {
                eprintln!(
                    "[channels] web.login.start attempt {} failed: {}",
                    attempt + 1,
                    e
                );
                last_err = e;
                // Invalidate again so the next attempt opens a fresh connection
                gateway_client::invalidate();
            }
        }
    }

    HttpResponse::Ok().json(WhatsAppLoginResponse {
        success: false,
        message: Some(format!("Login failed after retries: {}", last_err)),
        qr_data_url: None,
    })
}

/// Re-link WhatsApp: clears stale credentials and starts a fresh QR login.
///
/// Use this when the user unlinked the device from their phone and wants to
/// re-scan a QR code.  The flow is: channel.logout → ensure channel config
/// exists → web.login.start.
#[post("/api/clawd/channels/whatsapp/relink")]
pub async fn whatsapp_relink(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    // Step 1: Clear stale Baileys credentials via channel.logout.
    // This is best-effort — if it fails (e.g. already unlinked), continue.
    let logout_params = serde_json::json!({
        "channel": "whatsapp",
        "accountId": "default",
    });
    let _ = gateway_client::call_channel_method(
        "channel.logout",
        Some(logout_params),
        None,
    )
    .await;
    gateway_client::invalidate();

    // Step 2: Ensure WhatsApp channel config is present (re-enable if needed).
    // After logout, the channel config should still be there, but if a
    // previous disconnect removed it, we need to add it back.
    if let Ok(snapshot) = gateway_client::config_get(None).await {
        let config = snapshot.get("config").unwrap_or(&snapshot);
        let has_whatsapp = config
            .pointer("/channels/whatsapp")
            .map(|v| !v.is_null())
            .unwrap_or(false);

        if !has_whatsapp {
            let base_hash = extract_base_hash(&snapshot);
            let patch = build_enable_patch(
                r#"{"channels": {"whatsapp": {"dmPolicy": "allowlist"}}}"#,
                &snapshot,
            );
            if let Err(e) = gateway_client::config_patch(&patch, &base_hash, None).await {
                eprintln!("[channels] relink: failed to re-enable whatsapp config: {}", e);
            }
            gateway_client::invalidate();
        }
    }

    // Step 3: Wait for gateway to settle, then start login flow.
    tokio::time::sleep(Duration::from_secs(2)).await;
    gateway_client::invalidate();

    let params = serde_json::json!({"force": true});
    let mut last_err = String::new();
    let delays = [
        Duration::from_secs(2),
        Duration::from_secs(3),
        Duration::from_secs(4),
    ];

    for (attempt, delay) in delays.iter().enumerate() {
        tokio::time::sleep(*delay).await;

        match gateway_client::call_channel_method(
            "web.login.start",
            Some(params.clone()),
            None,
        )
        .await
        {
            Ok(result) => {
                let qr_data_url = result
                    .get("qrDataUrl")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());

                if qr_data_url.is_none() {
                    eprintln!(
                        "[channels] relink: web.login.start attempt {} — no qrDataUrl, retrying",
                        attempt + 1,
                    );
                    last_err = "No QR code returned yet".to_string();
                    gateway_client::invalidate();
                    continue;
                }

                let message = result
                    .get("message")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Scan this QR code with WhatsApp to re-link.")
                    .to_string();

                return HttpResponse::Ok().json(WhatsAppLoginResponse {
                    success: true,
                    message: Some(message),
                    qr_data_url,
                });
            }
            Err(e) => {
                eprintln!(
                    "[channels] relink: web.login.start attempt {} failed: {}",
                    attempt + 1,
                    e
                );
                last_err = e;
                gateway_client::invalidate();
            }
        }
    }

    HttpResponse::Ok().json(WhatsAppLoginResponse {
        success: false,
        message: Some(format!("Re-link failed after retries: {}", last_err)),
        qr_data_url: None,
    })
}

/// Response for phone-number pairing (returns a pairing code instead of QR).
#[derive(Serialize)]
struct WhatsAppPhonePairResponse {
    success: bool,
    message: Option<String>,
    #[serde(rename = "pairingCode", skip_serializing_if = "Option::is_none")]
    pairing_code: Option<String>,
}

/// Start WhatsApp phone-number pairing flow.
///
/// Instead of scanning a QR code, the gateway requests a pairing code from
/// WhatsApp servers.  The user enters this code on their phone via
/// WhatsApp → Linked Devices → Link a Device → Link with phone number.
#[post("/api/clawd/channels/whatsapp/login-phone")]
pub async fn whatsapp_login_phone(
    body: web::Json<serde_json::Value>,
    _cfg: web::Data<SharedClawdbotConfig>,
) -> impl Responder {
    let phone_number = body
        .get("phoneNumber")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    if phone_number.is_empty() {
        return HttpResponse::Ok().json(WhatsAppPhonePairResponse {
            success: false,
            message: Some("Phone number is required.".to_string()),
            pairing_code: None,
        });
    }

    // Step 1: Clear stale credentials (best-effort).
    let logout_params = serde_json::json!({
        "channel": "whatsapp",
        "accountId": "default",
    });
    let _ = gateway_client::call_channel_method(
        "channel.logout",
        Some(logout_params),
        None,
    )
    .await;
    gateway_client::invalidate();

    // Step 2: Ensure WhatsApp channel config is present.
    if let Ok(snapshot) = gateway_client::config_get(None).await {
        let config = snapshot.get("config").unwrap_or(&snapshot);
        let has_whatsapp = config
            .pointer("/channels/whatsapp")
            .map(|v| !v.is_null())
            .unwrap_or(false);

        if !has_whatsapp {
            let base_hash = extract_base_hash(&snapshot);
            let patch = build_enable_patch(
                r#"{"channels": {"whatsapp": {"dmPolicy": "allowlist"}}}"#,
                &snapshot,
            );
            if let Err(e) = gateway_client::config_patch(&patch, &base_hash, None).await {
                eprintln!("[channels] login-phone: failed to re-enable whatsapp config: {}", e);
            }
            gateway_client::invalidate();
        }
    }

    // Step 3: Wait for gateway to settle, then start phone pairing.
    tokio::time::sleep(Duration::from_secs(2)).await;
    gateway_client::invalidate();

    let params = serde_json::json!({
        "phoneNumber": phone_number,
        "force": true,
    });

    let mut last_err = String::new();
    let delays = [
        Duration::from_secs(2),
        Duration::from_secs(3),
        Duration::from_secs(4),
    ];

    for (attempt, delay) in delays.iter().enumerate() {
        tokio::time::sleep(*delay).await;

        match gateway_client::call_channel_method(
            "web.login.phone",
            Some(params.clone()),
            None,
        )
        .await
        {
            Ok(result) => {
                let pairing_code = result
                    .get("pairingCode")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());

                if pairing_code.is_none() {
                    eprintln!(
                        "[channels] web.login.phone attempt {} — no pairingCode, retrying",
                        attempt + 1,
                    );
                    last_err = "No pairing code returned yet".to_string();
                    gateway_client::invalidate();
                    continue;
                }

                let message = result
                    .get("message")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Enter the pairing code in WhatsApp on your phone.")
                    .to_string();

                return HttpResponse::Ok().json(WhatsAppPhonePairResponse {
                    success: true,
                    message: Some(message),
                    pairing_code,
                });
            }
            Err(e) => {
                eprintln!(
                    "[channels] web.login.phone attempt {} failed: {}",
                    attempt + 1,
                    e
                );
                last_err = e;
                gateway_client::invalidate();
            }
        }
    }

    HttpResponse::Ok().json(WhatsAppPhonePairResponse {
        success: false,
        message: Some(format!("Phone pairing failed after retries: {}", last_err)),
        pairing_code: None,
    })
}

/// Get iMessage channel status
#[get("/api/clawd/channels/imessage/status")]
pub async fn imessage_status(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    if let Some(bail) = gateway_or_bail().await { return bail; }
    match gateway_client::get_channel_status(None).await {
        Ok(status) => {
            let (enabled, _linked, configured) = parse_channel_from_summary(&status, "iMessage");

            HttpResponse::Ok().json(ChannelStatusResponse {
                success: true,
                enabled,
                configured,
                linked: None,
                provider: None,
                message: None,
                account: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: None,
            provider: None,
            message: Some(format!("Gateway error: {}", e)),
            account: None,
        }),
    }
}

/// Enable/disable iMessage channel via config.patch
#[post("/api/clawd/channels/imessage/enable")]
pub async fn imessage_enable(
    _cfg: web::Data<SharedClawdbotConfig>,
    body: web::Json<EnableRequest>,
) -> impl Responder {
    // First get current config to obtain baseHash
    let config_result = gateway_client::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);

            // iMessage channel config:
            // - dmPolicy "allowlist" = only owner (linked self number) can interact; others silently ignored
            // - service "auto" = detect iMessage vs SMS automatically
            // Also ensures agents.defaults.model is set so auto-reply actually works.
            let patch = if body.enabled {
                build_enable_patch(
                    r#"{"channels": {"imessage": {"dmPolicy": "allowlist", "service": "auto"}}}"#,
                    &config_snapshot,
                )
            } else {
                r#"{"channels": {"imessage": null}}"#.to_string()
            };

            match gateway_client::config_patch(&patch, &base_hash, None).await {
                Ok(_) => HttpResponse::Ok().json(GenericResponse {
                    success: true,
                    message: Some(if body.enabled {
                        "iMessage enabled".to_string()
                    } else {
                        "iMessage disabled".to_string()
                    }),
                    configured: None,
                    linked: None,
                }),
                Err(e) => HttpResponse::Ok().json(GenericResponse {
                    success: false,
                    message: Some(format!("Failed to update config: {}", e)),
                    configured: None,
                    linked: None,
                }),
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to get config: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Setup iMessage channel
#[post("/api/clawd/channels/imessage/setup")]
pub async fn imessage_setup(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    // Check iMessage status from gateway
    match gateway_client::get_channel_status(None).await {
        Ok(status) => {
            let (_enabled, _linked, configured) = parse_channel_from_summary(&status, "iMessage");

            if configured {
                HttpResponse::Ok().json(GenericResponse {
                    success: true,
                    message: Some("iMessage is configured".to_string()),
                    configured: Some(true),
                    linked: None,
                })
            } else {
                HttpResponse::Ok().json(GenericResponse {
                    success: false,
                    message: Some("iMessage requires Full Disk Access permission. Go to System Preferences > Privacy & Security > Full Disk Access and add Knapsack.".to_string()),
                    configured: Some(false),
                    linked: None,
                })
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Gateway error: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Get voice channel status
#[get("/api/clawd/channels/voice/status")]
pub async fn voice_status(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    if let Some(bail) = gateway_or_bail().await { return bail; }
    match gateway_client::get_channel_status(None).await {
        Ok(status) => {
            // Voice calls are handled by plugins, check channelSummary for Twilio/Telnyx/etc
            let channel_summary = status
                .get("channelSummary")
                .and_then(|cs| cs.as_array());

            let mut enabled = false;
            let mut provider: Option<String> = None;

            if let Some(lines) = channel_summary {
                for line in lines {
                    if let Some(text) = line.as_str() {
                        let lower = text.to_lowercase();
                        if lower.contains("twilio") || lower.contains("telnyx") || lower.contains("plivo") {
                            enabled = !lower.contains("disabled");
                            if lower.contains("twilio") {
                                provider = Some("twilio".to_string());
                            } else if lower.contains("telnyx") {
                                provider = Some("telnyx".to_string());
                            } else if lower.contains("plivo") {
                                provider = Some("plivo".to_string());
                            }
                            break;
                        }
                    }
                }
            }

            let configured = provider.is_some() && enabled;

            HttpResponse::Ok().json(ChannelStatusResponse {
                success: true,
                enabled,
                configured,
                linked: None,
                provider,
                message: None,
                account: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: None,
            provider: None,
            message: Some(format!("Gateway error: {}", e)),
            account: None,
        }),
    }
}

/// Enable/disable voice channel via config.patch
#[post("/api/clawd/channels/voice/enable")]
pub async fn voice_enable(
    _cfg: web::Data<SharedClawdbotConfig>,
    body: web::Json<EnableRequest>,
) -> impl Responder {
    // First get current config to obtain baseHash
    let config_result = gateway_client::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);

            // Voice calls are handled via plugins - create/remove plugin entry
            let patch = if body.enabled {
                r#"{"plugins": {"entries": {"voice-call": {}}}}"#
            } else {
                r#"{"plugins": {"entries": {"voice-call": null}}}"#
            };

            match gateway_client::config_patch(patch, &base_hash, None).await {
                Ok(_) => HttpResponse::Ok().json(GenericResponse {
                    success: true,
                    message: Some(if body.enabled {
                        "Voice calls enabled. Configure your Twilio/Telnyx credentials to start making calls.".to_string()
                    } else {
                        "Voice calls disabled".to_string()
                    }),
                    configured: None,
                    linked: None,
                }),
                Err(e) => HttpResponse::Ok().json(GenericResponse {
                    success: false,
                    message: Some(format!("Failed to update config: {}", e)),
                    configured: None,
                    linked: None,
                }),
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to get config: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Send a message through a connected channel (WhatsApp or iMessage).
///
/// Wraps the gateway's `send` JSON-RPC method. The frontend calls this
/// to push notification content to the user via their connected channels.
#[post("/api/clawd/channels/send")]
pub async fn send_channel_message(
    _cfg: web::Data<SharedClawdbotConfig>,
    body: web::Json<SendMessageRequest>,
) -> impl Responder {
    let channel = body.channel.to_lowercase();
    if channel != "whatsapp" && channel != "imessage" && channel != "telegram" {
        return HttpResponse::BadRequest().json(SendMessageResponse {
            success: false,
            message: Some("Channel must be 'whatsapp', 'imessage', or 'telegram'".to_string()),
        });
    }

    let idempotency_key = format!(
        "knapsack-{}-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis(),
        rand::random::<u32>()
    );

    let params = serde_json::json!({
        "to": body.to,
        "message": body.message,
        "channel": channel,
        "idempotencyKey": idempotency_key,
    });

    match gateway_client::call_channel_method("send", Some(params), None).await {
        Ok(_result) => HttpResponse::Ok().json(SendMessageResponse {
            success: true,
            message: Some(format!("Message sent via {}", channel)),
        }),
        Err(e) => {
            eprintln!("[channels] send via {} failed: {}", channel, e);
            HttpResponse::Ok().json(SendMessageResponse {
                success: false,
                message: Some(format!("Failed to send: {}", e)),
            })
        }
    }
}

// ── Telegram ────────────────────────────────────────────────────────────

/// Get Telegram channel status
#[get("/api/clawd/channels/telegram/status")]
pub async fn telegram_status(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    if let Some(bail) = gateway_or_bail().await { return bail; }
    match gateway_client::get_channel_status(None).await {
        Ok(status) => {
            let (enabled, _linked, configured) =
                parse_channel_from_summary(&status, "Telegram");

            HttpResponse::Ok().json(ChannelStatusResponse {
                success: true,
                enabled,
                configured,
                linked: Some(configured),
                provider: None,
                message: None,
                account: parse_account_from_summary(&status, "Telegram"),
            })
        }
        Err(e) => {
            log::error!("[channels] telegram_status gateway error: {}", e);
            HttpResponse::Ok().json(ChannelStatusResponse {
                success: false,
                enabled: false,
                configured: false,
                linked: Some(false),
                provider: None,
                message: Some(format!("Gateway error: {}", e)),
                account: None,
            })
        }
    }
}

/// Enable/disable Telegram channel via config.patch
#[post("/api/clawd/channels/telegram/enable")]
pub async fn telegram_enable(
    _cfg: web::Data<SharedClawdbotConfig>,
    body: web::Json<EnableRequest>,
) -> impl Responder {
    let config_result = gateway_client::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);

            let patch = if body.enabled {
                build_enable_patch(
                    r#"{"channels": {"telegram": {"dmPolicy": "pairing"}}}"#,
                    &config_snapshot,
                )
            } else {
                r#"{"channels": {"telegram": null}}"#.to_string()
            };

            match gateway_client::config_patch(&patch, &base_hash, None).await {
                Ok(_) => {
                    if body.enabled {
                        // Auto-approve the first pairing request so the device
                        // owner doesn't need to manually run `openclaw pairing
                        // approve`.  After approval the policy switches to
                        // "allowlist" to block all other senders silently.
                        pairing_auto_approve::spawn_auto_approve("telegram");
                    }
                    HttpResponse::Ok().json(GenericResponse {
                        success: true,
                        message: Some(if body.enabled {
                            "Telegram enabled".to_string()
                        } else {
                            "Telegram disabled".to_string()
                        }),
                        configured: None,
                        linked: None,
                    })
                }
                Err(e) => {
                    log::error!("[channels] telegram_enable config.patch failed: {}", e);
                    HttpResponse::Ok().json(GenericResponse {
                        success: false,
                        message: Some(format!("Failed to update config: {}", e)),
                        configured: None,
                        linked: None,
                    })
                }
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to get config: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Configure Telegram bot token.
///
/// The user provides their Telegram bot token (from @BotFather).
/// This is persisted via config.patch so the gateway can connect.
#[post("/api/clawd/channels/telegram/configure")]
pub async fn telegram_configure(
    _cfg: web::Data<SharedClawdbotConfig>,
    body: web::Json<TelegramConfigureRequest>,
) -> impl Responder {
    let token = body.bot_token.trim();
    if token.is_empty() {
        return HttpResponse::BadRequest().json(GenericResponse {
            success: false,
            message: Some("Bot token is required".to_string()),
            configured: None,
            linked: None,
        });
    }

    // Fail fast if gateway is not reachable instead of hanging on stale connections.
    if !gateway_client::is_gateway_port_open().await {
        gateway_client::ensure_gateway_and_wait().await;
        if !gateway_client::is_gateway_port_open().await {
            return HttpResponse::Ok().json(GenericResponse {
                success: false,
                message: Some("Gateway not reachable — the background service may need to be restarted.".to_string()),
                configured: None,
                linked: None,
            });
        }
    }

    let config_result = gateway_client::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);

            let patch_value = serde_json::json!({
                "channels": {
                    "telegram": {
                        "botToken": token,
                        "dmPolicy": "pairing",
                        // Grammy's default HTTP timeout is 500 seconds, which causes
                        // long-running getUpdates requests and AbortError spam in logs.
                        // 60s is generous for Telegram API calls; the polling interval
                        // (fetch.timeout in runner options) is separate and already 30s.
                        "timeoutSeconds": 60
                    }
                }
            });
            let patch = build_enable_patch(
                &serde_json::to_string(&patch_value).unwrap(),
                &config_snapshot,
            );

            match gateway_client::config_patch(&patch, &base_hash, None).await {
                Ok(_) => {
                    log::info!("[channels] Telegram bot token configured successfully");
                    // Start watching for the owner's first message so we can
                    // auto-approve and lock the channel to allowlist mode.
                    pairing_auto_approve::spawn_auto_approve("telegram");
                    HttpResponse::Ok().json(GenericResponse {
                        success: true,
                        message: Some("Telegram configured. The bot should connect shortly.".to_string()),
                        configured: Some(true),
                        linked: None,
                    })
                }
                Err(e) => {
                    log::error!("[channels] telegram_configure config.patch failed: {}", e);
                    HttpResponse::Ok().json(GenericResponse {
                        success: false,
                        message: Some(format!("Failed to configure: {}", e)),
                        configured: None,
                        linked: None,
                    })
                }
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to get config: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Request body for Telegram bot token configuration.
#[derive(Deserialize)]
struct TelegramConfigureRequest {
    bot_token: String,
}

/// Request body for Telegram token validation.
#[derive(Deserialize)]
struct TelegramValidateRequest {
    bot_token: String,
}

/// Response for Telegram token validation.
#[derive(Serialize)]
struct TelegramValidateResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    /// Bot username returned by Telegram's getMe, e.g. "mybot"
    #[serde(skip_serializing_if = "Option::is_none")]
    bot_username: Option<String>,
    /// Bot display name
    #[serde(skip_serializing_if = "Option::is_none")]
    bot_name: Option<String>,
}

/// Validate a Telegram bot token by calling the Telegram Bot API `getMe`
/// endpoint.  Returns the bot's username so the UI can display
/// "Connected as @botname" immediately after the user pastes a token.
///
/// This endpoint does NOT store anything — it is purely read-only.
/// Call it after `telegram/configure` to get the confirmed bot identity.
#[post("/api/clawd/channels/telegram/validate")]
pub async fn telegram_validate(
    body: web::Json<TelegramValidateRequest>,
) -> impl Responder {
    let token = body.bot_token.trim().to_string();
    if token.is_empty() {
        return HttpResponse::BadRequest().json(TelegramValidateResponse {
            success: false,
            message: Some("Bot token is required".to_string()),
            bot_username: None,
            bot_name: None,
        });
    }

    let url = format!("https://api.telegram.org/bot{}/getMe", token);
    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
    {
        Ok(c) => c,
        Err(e) => {
            return HttpResponse::Ok().json(TelegramValidateResponse {
                success: false,
                message: Some(format!("Failed to build HTTP client: {}", e)),
                bot_username: None,
                bot_name: None,
            });
        }
    };

    match client.get(&url).send().await {
        Ok(resp) => {
            match resp.json::<serde_json::Value>().await {
                Ok(body) => {
                    let ok = body.get("ok").and_then(|v| v.as_bool()).unwrap_or(false);
                    if ok {
                        let username = body
                            .pointer("/result/username")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                        let first_name = body
                            .pointer("/result/first_name")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                        log::info!("[channels] Telegram getMe succeeded: @{:?}", username);
                        HttpResponse::Ok().json(TelegramValidateResponse {
                            success: true,
                            message: None,
                            bot_username: username,
                            bot_name: first_name,
                        })
                    } else {
                        let desc = body
                            .get("description")
                            .and_then(|v| v.as_str())
                            .unwrap_or("Invalid bot token")
                            .to_string();
                        log::warn!("[channels] Telegram getMe rejected token: {}", desc);
                        HttpResponse::Ok().json(TelegramValidateResponse {
                            success: false,
                            message: Some(desc),
                            bot_username: None,
                            bot_name: None,
                        })
                    }
                }
                Err(e) => {
                    log::error!("[channels] Telegram getMe JSON parse error: {}", e);
                    HttpResponse::Ok().json(TelegramValidateResponse {
                        success: false,
                        message: Some(format!("Unexpected response from Telegram: {}", e)),
                        bot_username: None,
                        bot_name: None,
                    })
                }
            }
        }
        Err(e) => {
            log::error!("[channels] Telegram getMe request failed: {}", e);
            HttpResponse::Ok().json(TelegramValidateResponse {
                success: false,
                message: Some(format!(
                    "Network error contacting Telegram API — check your connection: {}",
                    e
                )),
                bot_username: None,
                bot_name: None,
            })
        }
    }
}

// ── WhatsApp login-wait ─────────────────────────────────────────────────

/// Response for WhatsApp login-wait
#[derive(Serialize)]
struct WhatsAppLoginWaitResponse {
    success: bool,
    connected: bool,
    message: Option<String>,
}

/// Wait for the user to scan the WhatsApp QR code and complete login.
///
/// Calls the gateway's `web.login.wait` method which blocks until the
/// Baileys socket connects (i.e. the user scanned the QR) or a timeout
/// is reached.  The frontend should call this after displaying the QR.
#[post("/api/clawd/channels/whatsapp/login-wait")]
pub async fn whatsapp_login_wait(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    let params = serde_json::json!({
        "timeoutMs": 60_000
    });

    match gateway_client::call_channel_method("web.login.wait", Some(params), None).await {
        Ok(result) => {
            let connected = result
                .get("connected")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            let message = result
                .get("message")
                .and_then(|v| v.as_str())
                .unwrap_or(if connected {
                    "WhatsApp connected successfully."
                } else {
                    "WhatsApp login timed out. Please try again."
                })
                .to_string();

            HttpResponse::Ok().json(WhatsAppLoginWaitResponse {
                success: true,
                connected,
                message: Some(message),
            })
        }
        Err(e) => {
            eprintln!("[channels] web.login.wait failed: {}", e);
            HttpResponse::Ok().json(WhatsAppLoginWaitResponse {
                success: false,
                connected: false,
                message: Some(format!("Login wait failed: {}", e)),
            })
        }
    }
}

// ── Channel disconnect (logout) ─────────────────────────────────────────

/// Request body for channel disconnect.
#[derive(Deserialize)]
struct DisconnectRequest {
    /// Optional account ID (defaults to "default").
    #[serde(default)]
    account_id: Option<String>,
}

/// Disconnect WhatsApp: calls the gateway's channel.logout method to
/// clear Baileys credentials, then removes the channel from config.
#[post("/api/clawd/channels/whatsapp/disconnect")]
pub async fn whatsapp_disconnect(
    _cfg: web::Data<SharedClawdbotConfig>,
    body: web::Json<DisconnectRequest>,
) -> impl Responder {
    let account_id = body
        .account_id
        .as_deref()
        .unwrap_or("default")
        .to_string();

    disconnect_channel("whatsapp", &account_id).await
}

/// Shared disconnect logic: logout + remove config with retries.
async fn disconnect_channel(channel: &str, account_id: &str) -> HttpResponse {
    // Fail fast if gateway is not reachable.
    if !gateway_client::is_gateway_port_open().await {
        gateway_client::ensure_gateway_and_wait().await;
        if !gateway_client::is_gateway_port_open().await {
            return HttpResponse::Ok().json(GenericResponse {
                success: false,
                message: Some("Gateway not reachable — the background service may need to be restarted.".to_string()),
                configured: None,
                linked: None,
            });
        }
    }

    // Step 1: Ask the gateway to logout the channel (clears credentials).
    let logout_params = serde_json::json!({
        "channel": channel,
        "accountId": account_id,
    });
    if let Err(e) = gateway_client::call_channel_method(
        "channel.logout",
        Some(logout_params),
        None,
    )
    .await
    {
        eprintln!("[channels] channel.logout({}) failed: {}", channel, e);
        // Continue to config removal even if logout RPC fails — the user
        // still wants the channel removed from config.
        gateway_client::invalidate();
    }

    // Give the gateway a moment to process the logout before we fetch
    // config — logout may update internal state / config hash.
    tokio::time::sleep(Duration::from_millis(500)).await;

    // Step 2: Remove the channel from the gateway config (with retries).
    let patch = format!(r#"{{"channels": {{"{}": null}}}}"#, channel);
    let mut last_err = String::new();

    for attempt in 0..3 {
        if attempt > 0 {
            // Invalidate connection and wait before retry — the gateway
            // may have restarted or the hash changed.
            gateway_client::invalidate();
            tokio::time::sleep(Duration::from_millis(500 * (attempt as u64))).await;
        }

        match gateway_client::config_get(None).await {
            Ok(config_snapshot) => {
                let base_hash = extract_base_hash(&config_snapshot);
                match gateway_client::config_patch(&patch, &base_hash, None).await {
                    Ok(_) => {
                        gateway_client::invalidate();
                        return HttpResponse::Ok().json(GenericResponse {
                            success: true,
                            message: Some(format!("{} disconnected", channel)),
                            configured: None,
                            linked: None,
                        });
                    }
                    Err(e) => {
                        eprintln!(
                            "[channels] config.patch to remove {} failed (attempt {}): {}",
                            channel,
                            attempt + 1,
                            e
                        );
                        last_err = format!("Failed to remove config: {}", e);
                    }
                }
            }
            Err(e) => {
                eprintln!(
                    "[channels] config.get failed during disconnect {} (attempt {}): {}",
                    channel,
                    attempt + 1,
                    e
                );
                last_err = format!("Failed to get config: {}", e);
            }
        }
    }

    HttpResponse::Ok().json(GenericResponse {
        success: false,
        message: Some(last_err),
        configured: None,
        linked: None,
    })
}

/// Disconnect Telegram: calls channel.logout then removes config.
#[post("/api/clawd/channels/telegram/disconnect")]
pub async fn telegram_disconnect(
    _cfg: web::Data<SharedClawdbotConfig>,
    body: web::Json<DisconnectRequest>,
) -> impl Responder {
    let account_id = body
        .account_id
        .as_deref()
        .unwrap_or("default")
        .to_string();

    disconnect_channel("telegram", &account_id).await
}

/// Disconnect iMessage: removes channel from config.
/// (iMessage doesn't have a separate logout flow — it's system-level.)
#[post("/api/clawd/channels/imessage/disconnect")]
pub async fn imessage_disconnect(
    _cfg: web::Data<SharedClawdbotConfig>,
) -> impl Responder {
    // iMessage uses "default" account; no separate logout needed since
    // it's system-level, but disconnect_channel handles the no-op gracefully.
    disconnect_channel("imessage", "default").await
}

// ── Generic channel endpoints ────────────────────────────────────────────
//
// These work for any channel supported by the OpenClaw gateway (slack,
// discord, signal, irc, googlechat, etc.) that follows the token/config
// pattern.  They use the same config.patch mechanism as Telegram.

/// Allowed generic channel names — prevents arbitrary config keys.
const GENERIC_CHANNEL_NAMES: &[&str] = &["slack", "discord", "signal", "irc", "googlechat"];

fn is_valid_generic_channel(name: &str) -> bool {
    GENERIC_CHANNEL_NAMES.contains(&name)
}

/// Get status for a generic channel by parsing channelSummary.
#[get("/api/clawd/channels/generic/{channel}/status")]
pub async fn generic_channel_status(
    _cfg: web::Data<SharedClawdbotConfig>,
    path: web::Path<String>,
) -> impl Responder {
    if let Some(bail) = gateway_or_bail().await { return bail; }
    let channel = path.into_inner();
    if !is_valid_generic_channel(&channel) {
        return HttpResponse::BadRequest().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: None,
            provider: None,
            message: Some(format!("Unknown channel: {}", channel)),
            account: None,
        });
    }

    // The gateway uses the display name in channelSummary (e.g. "Slack", "Discord")
    let display_name = match channel.as_str() {
        "slack" => "Slack",
        "discord" => "Discord",
        "signal" => "Signal",
        "irc" => "IRC",
        "googlechat" => "Google Chat",
        _ => &channel,
    };

    match gateway_client::get_channel_status(None).await {
        Ok(status) => {
            let (enabled, linked, configured) = parse_channel_from_summary(&status, display_name);
            HttpResponse::Ok().json(ChannelStatusResponse {
                success: true,
                enabled,
                configured: configured || linked,
                linked: Some(linked),
                provider: None,
                message: None,
                account: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: Some(false),
            provider: None,
            message: Some(format!("Gateway error: {}", e)),
            account: None,
        }),
    }
}

/// Request body for generic channel configuration.
/// Accepts arbitrary key-value pairs that get merged into the channel config.
#[derive(Deserialize)]
pub struct GenericChannelConfigRequest {
    /// Channel-specific configuration (e.g. {"botToken": "xoxb-..."} for Slack)
    config: serde_json::Value,
}

/// Configure a generic channel by patching gateway config.
#[post("/api/clawd/channels/generic/{channel}/configure")]
pub async fn generic_channel_configure(
    _cfg: web::Data<SharedClawdbotConfig>,
    path: web::Path<String>,
    body: web::Json<GenericChannelConfigRequest>,
) -> impl Responder {
    let channel = path.into_inner();
    if !is_valid_generic_channel(&channel) {
        return HttpResponse::BadRequest().json(GenericResponse {
            success: false,
            message: Some(format!("Unknown channel: {}", channel)),
            configured: None,
            linked: None,
        });
    }

    // Fail fast if gateway is not reachable.
    if !gateway_client::is_gateway_port_open().await {
        gateway_client::ensure_gateway_and_wait().await;
        if !gateway_client::is_gateway_port_open().await {
            return HttpResponse::Ok().json(GenericResponse {
                success: false,
                message: Some("Gateway not reachable — the background service may need to be restarted.".to_string()),
                configured: None,
                linked: None,
            });
        }
    }

    // Merge the user-provided config with standard channel defaults.
    // Discord, Slack, and GoogleChat use nested dm: { policy, allowFrom };
    // Telegram and Signal use top-level dmPolicy / allowFrom.
    // All schemas are .strict() so unrecognized keys cause validation errors.
    let mut channel_config = body.config.clone();
    if let Some(obj) = channel_config.as_object_mut() {
        // Always ensure the channel is enabled
        if !obj.contains_key("enabled") {
            obj.insert("enabled".to_string(), serde_json::json!(true));
        }

        match channel.as_str() {
            // Channels whose schema uses a nested `dm` object (strict zod schema
            // rejects top-level dmPolicy / allowFrom).
            "discord" | "slack" | "googlechat" => {
                // Strip top-level allowFrom/dmPolicy — these are invalid for
                // strict schemas that use nested dm: { policy, allowFrom }.
                obj.remove("allowFrom");
                obj.remove("dmPolicy");

                if !obj.contains_key("dm") {
                    obj.insert("dm".to_string(), serde_json::json!({
                        "policy": "allowlist"
                    }));
                }

                // Discord uses "token" (not "botToken") at top level.
                if channel == "discord" {
                    if let Some(bot_token) = obj.remove("botToken") {
                        if !obj.contains_key("token") {
                            obj.insert("token".to_string(), bot_token);
                        }
                    }
                }
            }
            // Signal uses "account" (not "phoneNumber") and has top-level
            // dmPolicy / allowFrom.
            "signal" => {
                if let Some(phone) = obj.remove("phoneNumber") {
                    if !obj.contains_key("account") {
                        obj.insert("account".to_string(), phone);
                    }
                }
                if !obj.contains_key("dmPolicy") {
                    obj.insert("dmPolicy".to_string(), serde_json::json!("pairing"));
                }
            }
            _ => {
                if !obj.contains_key("dmPolicy") {
                    obj.insert("dmPolicy".to_string(), serde_json::json!("pairing"));
                }
            }
        }
    }

    let config_result = gateway_client::config_get(None).await;
    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);
            let patch_value = serde_json::json!({
                "channels": {
                    channel.clone(): channel_config
                }
            });
            let patch = build_enable_patch(
                &serde_json::to_string(&patch_value).unwrap(),
                &config_snapshot,
            );

            match gateway_client::config_patch(&patch, &base_hash, None).await {
                Ok(_) => {
                    log::info!("[channels] {} configured successfully", channel);
                    // For channels using pairing mode, auto-approve the first
                    // request so the device owner is seamlessly allowlisted.
                    // Channels that already use allowlist (whatsapp, imessage)
                    // won't have pairing requests, so this is a safe no-op.
                    pairing_auto_approve::spawn_auto_approve(&channel);
                    HttpResponse::Ok().json(GenericResponse {
                        success: true,
                        message: Some(format!("{} configured. The channel should connect shortly.", channel)),
                        configured: Some(true),
                        linked: None,
                    })
                }
                Err(e) => {
                    log::error!("[channels] {} configure config.patch failed: {}", channel, e);
                    // Translate common gateway validation errors into user-friendly messages
                    let user_msg = humanize_config_error(&channel, &e);
                    HttpResponse::Ok().json(GenericResponse {
                        success: false,
                        message: Some(user_msg),
                        configured: None,
                        linked: None,
                    })
                }
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to get config: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Disconnect a generic channel: calls channel.logout then removes config.
#[post("/api/clawd/channels/generic/{channel}/disconnect")]
pub async fn generic_channel_disconnect(
    _cfg: web::Data<SharedClawdbotConfig>,
    path: web::Path<String>,
) -> impl Responder {
    let channel = path.into_inner();
    if !is_valid_generic_channel(&channel) {
        return HttpResponse::BadRequest().json(GenericResponse {
            success: false,
            message: Some(format!("Unknown channel: {}", channel)),
            configured: None,
            linked: None,
        });
    }

    // Try channel.logout (best effort — some channels may not support it)
    let logout_params = serde_json::json!({
        "channel": channel,
        "accountId": "default",
    });
    if let Err(e) = gateway_client::call_channel_method(
        "channel.logout",
        Some(logout_params),
        None,
    )
    .await
    {
        log::warn!("[channels] channel.logout({}) failed (non-fatal): {}", channel, e);
        // Invalidate pooled connection after failed logout to ensure
        // config_get uses a fresh connection.
        gateway_client::invalidate();
    }

    // Remove from config
    let config_result = gateway_client::config_get(None).await;
    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);
            let patch = serde_json::json!({ "channels": { channel.clone(): null } });
            match gateway_client::config_patch(
                &serde_json::to_string(&patch).unwrap(),
                &base_hash,
                None,
            )
            .await
            {
                Ok(_) => {
                    gateway_client::invalidate();
                    HttpResponse::Ok().json(GenericResponse {
                        success: true,
                        message: Some(format!("{} disconnected", channel)),
                        configured: None,
                        linked: None,
                    })
                }
                Err(e) => HttpResponse::Ok().json(GenericResponse {
                    success: false,
                    message: Some(format!("Failed to remove config: {}", e)),
                    configured: None,
                    linked: None,
                }),
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to get config: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

// ── Signal CLI install endpoints ──────────────────────────────────────────

/// Response for signal-cli status/install.
#[derive(Serialize)]
struct SignalCliResponse {
    success: bool,
    installed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    cli_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

/// Check if signal-cli is available on this machine.
#[get("/api/clawd/channels/signal/check-cli")]
pub async fn signal_check_cli() -> impl Responder {
    // Try common locations: PATH, Homebrew, /opt, ~/.config/openclaw/tools
    let candidates: Vec<&str> = vec![
        "signal-cli",
        "/usr/local/bin/signal-cli",
        "/opt/signal-cli/bin/signal-cli",
        "/opt/homebrew/bin/signal-cli",
    ];

    // Also check the openclaw tools directory
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .unwrap_or_default();
    let openclaw_tools_path = format!("{}/.config/openclaw/tools/signal-cli", home);

    for candidate in &candidates {
        if let Ok(output) = Command::new(candidate).arg("--version").output() {
            if output.status.success() {
                let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
                return HttpResponse::Ok().json(SignalCliResponse {
                    success: true,
                    installed: true,
                    cli_path: Some(candidate.to_string()),
                    version: if version.is_empty() { None } else { Some(version) },
                    message: None,
                });
            }
        }
    }

    // Check openclaw tools directory (recursive search for signal-cli binary)
    if let Ok(entries) = std::fs::read_dir(&openclaw_tools_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            // Look for signal-cli binary in version subdirectories
            let bin_candidates = vec![
                path.join("bin").join("signal-cli"),
                path.join("signal-cli"),
                path.join("signal-cli-native").join("bin").join("signal-cli"),
            ];
            for bin_path in bin_candidates {
                if bin_path.exists() {
                    if let Ok(output) = Command::new(&bin_path).arg("--version").output() {
                        if output.status.success() {
                            let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
                            return HttpResponse::Ok().json(SignalCliResponse {
                                success: true,
                                installed: true,
                                cli_path: Some(bin_path.to_string_lossy().to_string()),
                                version: if version.is_empty() { None } else { Some(version) },
                                message: None,
                            });
                        }
                    }
                }
            }
        }
    }

    HttpResponse::Ok().json(SignalCliResponse {
        success: true,
        installed: false,
        cli_path: None,
        version: None,
        message: Some("signal-cli not found on this machine".to_string()),
    })
}

/// Install signal-cli automatically.
///
/// On Linux x64: downloads the native GraalVM binary from GitHub releases.
/// On macOS / other: installs via Homebrew.
#[post("/api/clawd/channels/signal/install-cli")]
pub async fn signal_install_cli() -> impl Responder {
    let os = std::env::consts::OS;
    let arch = std::env::consts::ARCH;

    if os == "windows" {
        return HttpResponse::Ok().json(SignalCliResponse {
            success: false,
            installed: false,
            cli_path: None,
            version: None,
            message: Some("Automatic signal-cli installation is not supported on Windows yet.".to_string()),
        });
    }

    // On Linux x64, download the native binary from GitHub releases
    if os == "linux" && arch == "x86_64" {
        return signal_install_from_release().await;
    }

    // On macOS or other platforms, try Homebrew
    signal_install_via_brew().await
}

/// Download and install signal-cli from the official GitHub releases (native binary).
async fn signal_install_from_release() -> HttpResponse {
    // Fetch latest release info
    let client = reqwest::Client::builder()
        .user_agent("knapsack-desktop")
        .timeout(Duration::from_secs(30))
        .build();

    let client = match client {
        Ok(c) => c,
        Err(e) => {
            return HttpResponse::Ok().json(SignalCliResponse {
                success: false,
                installed: false,
                cli_path: None,
                version: None,
                message: Some(format!("Failed to create HTTP client: {}", e)),
            });
        }
    };

    let release_resp = client
        .get("https://api.github.com/repos/AsamK/signal-cli/releases/latest")
        .header("Accept", "application/vnd.github+json")
        .send()
        .await;

    let release_resp = match release_resp {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::Ok().json(SignalCliResponse {
                success: false,
                installed: false,
                cli_path: None,
                version: None,
                message: Some(format!("Failed to fetch release info: {}", e)),
            });
        }
    };

    if !release_resp.status().is_success() {
        return HttpResponse::Ok().json(SignalCliResponse {
            success: false,
            installed: false,
            cli_path: None,
            version: None,
            message: Some(format!("GitHub API returned {}", release_resp.status())),
        });
    }

    let release: serde_json::Value = match release_resp.json().await {
        Ok(v) => v,
        Err(e) => {
            return HttpResponse::Ok().json(SignalCliResponse {
                success: false,
                installed: false,
                cli_path: None,
                version: None,
                message: Some(format!("Failed to parse release JSON: {}", e)),
            });
        }
    };

    let version = release["tag_name"]
        .as_str()
        .unwrap_or("unknown")
        .trim_start_matches('v')
        .to_string();

    // Find the Linux native asset
    let assets = release["assets"].as_array();
    let asset = assets.and_then(|a| {
        a.iter().find(|asset| {
            let name = asset["name"].as_str().unwrap_or("");
            name.contains("Linux") && name.contains("native") && name.ends_with(".tar.gz")
        })
    });

    let asset = match asset {
        Some(a) => a,
        None => {
            return HttpResponse::Ok().json(SignalCliResponse {
                success: false,
                installed: false,
                cli_path: None,
                version: None,
                message: Some("No compatible Linux native release asset found.".to_string()),
            });
        }
    };

    let download_url = match asset["browser_download_url"].as_str() {
        Some(u) => u.to_string(),
        None => {
            return HttpResponse::Ok().json(SignalCliResponse {
                success: false,
                installed: false,
                cli_path: None,
                version: None,
                message: Some("Release asset missing download URL.".to_string()),
            });
        }
    };

    let asset_name = asset["name"].as_str().unwrap_or("signal-cli.tar.gz");

    // Download to temp directory
    let tmp_dir = std::env::temp_dir().join("knapsack-signal-install");
    let _ = std::fs::create_dir_all(&tmp_dir);
    let archive_path = tmp_dir.join(asset_name);

    let download_resp = match client.get(&download_url).send().await {
        Ok(r) => r,
        Err(e) => {
            return HttpResponse::Ok().json(SignalCliResponse {
                success: false,
                installed: false,
                cli_path: None,
                version: None,
                message: Some(format!("Failed to download signal-cli: {}", e)),
            });
        }
    };

    let bytes = match download_resp.bytes().await {
        Ok(b) => b,
        Err(e) => {
            return HttpResponse::Ok().json(SignalCliResponse {
                success: false,
                installed: false,
                cli_path: None,
                version: None,
                message: Some(format!("Failed to read download: {}", e)),
            });
        }
    };

    if let Err(e) = std::fs::write(&archive_path, &bytes) {
        return HttpResponse::Ok().json(SignalCliResponse {
            success: false,
            installed: false,
            cli_path: None,
            version: None,
            message: Some(format!("Failed to save archive: {}", e)),
        });
    }

    // signal-cli auto-install requires tar/chmod which are not available on Windows
    if cfg!(target_os = "windows") {
        let _ = std::fs::remove_file(&archive_path);
        return HttpResponse::Ok().json(SignalCliResponse {
            success: false,
            installed: false,
            cli_path: None,
            version: None,
            message: Some("signal-cli auto-install is not supported on Windows. Please install it manually.".to_string()),
        });
    }

    // Extract to ~/.config/openclaw/tools/signal-cli/<version>
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .unwrap_or_else(|_| "/tmp".to_string());
    let install_dir = format!("{}/.config/openclaw/tools/signal-cli/{}", home, version);
    let _ = std::fs::create_dir_all(&install_dir);

    let extract = Command::new("tar")
        .args(["-xzf", &archive_path.to_string_lossy(), "-C", &install_dir])
        .output();

    // Clean up archive
    let _ = std::fs::remove_file(&archive_path);

    match extract {
        Ok(output) if output.status.success() => {
            // Find the signal-cli binary in the extracted directory
            if let Some(cli_path) = find_signal_cli_binary(&install_dir) {
                // Make it executable
                let _ = Command::new("chmod").args(["+x", &cli_path]).output();

                HttpResponse::Ok().json(SignalCliResponse {
                    success: true,
                    installed: true,
                    cli_path: Some(cli_path),
                    version: Some(version),
                    message: Some("signal-cli installed successfully".to_string()),
                })
            } else {
                HttpResponse::Ok().json(SignalCliResponse {
                    success: false,
                    installed: false,
                    cli_path: None,
                    version: None,
                    message: Some("signal-cli binary not found after extraction".to_string()),
                })
            }
        }
        Ok(output) => HttpResponse::Ok().json(SignalCliResponse {
            success: false,
            installed: false,
            cli_path: None,
            version: None,
            message: Some(format!(
                "Extraction failed: {}",
                String::from_utf8_lossy(&output.stderr)
            )),
        }),
        Err(e) => HttpResponse::Ok().json(SignalCliResponse {
            success: false,
            installed: false,
            cli_path: None,
            version: None,
            message: Some(format!("Failed to run tar: {}", e)),
        }),
    }
}

/// Install signal-cli via Homebrew (macOS / Linux with Homebrew).
async fn signal_install_via_brew() -> HttpResponse {
    // Find Homebrew
    let brew_path = ["/opt/homebrew/bin/brew", "/usr/local/bin/brew"]
        .iter()
        .find(|p| std::path::Path::new(p).exists())
        .map(|s| s.to_string());

    let brew_path = match brew_path {
        Some(p) => p,
        None => {
            return HttpResponse::Ok().json(SignalCliResponse {
                success: false,
                installed: false,
                cli_path: None,
                version: None,
                message: Some(
                    "Homebrew not found. Install Homebrew (https://brew.sh) first, or install signal-cli manually."
                        .to_string(),
                ),
            });
        }
    };

    let install = Command::new(&brew_path)
        .args(["install", "signal-cli"])
        .output();

    match install {
        Ok(output) if output.status.success() => {
            // Find the installed binary
            let which = Command::new("which").arg("signal-cli").output();
            let cli_path = which
                .ok()
                .filter(|o| o.status.success())
                .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

            let version = Command::new(cli_path.as_deref().unwrap_or("signal-cli"))
                .arg("--version")
                .output()
                .ok()
                .filter(|o| o.status.success())
                .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

            HttpResponse::Ok().json(SignalCliResponse {
                success: true,
                installed: true,
                cli_path,
                version,
                message: Some("signal-cli installed via Homebrew".to_string()),
            })
        }
        Ok(output) => HttpResponse::Ok().json(SignalCliResponse {
            success: false,
            installed: false,
            cli_path: None,
            version: None,
            message: Some(format!(
                "Homebrew install failed: {}",
                String::from_utf8_lossy(&output.stderr)
            )),
        }),
        Err(e) => HttpResponse::Ok().json(SignalCliResponse {
            success: false,
            installed: false,
            cli_path: None,
            version: None,
            message: Some(format!("Failed to run Homebrew: {}", e)),
        }),
    }
}

/// Recursively find the signal-cli binary in an extracted directory.
fn find_signal_cli_binary(dir: &str) -> Option<String> {
    let path = std::path::Path::new(dir);
    if !path.is_dir() {
        return None;
    }
    // Check common locations
    let candidates = vec![
        path.join("bin").join("signal-cli"),
        path.join("signal-cli"),
        path.join("signal-cli-native").join("bin").join("signal-cli"),
    ];
    for candidate in &candidates {
        if candidate.exists() {
            return Some(candidate.to_string_lossy().to_string());
        }
    }
    // Walk one level of subdirectories
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let sub = entry.path();
            if sub.is_dir() {
                let sub_candidates = vec![
                    sub.join("bin").join("signal-cli"),
                    sub.join("signal-cli"),
                ];
                for candidate in sub_candidates {
                    if candidate.exists() {
                        return Some(candidate.to_string_lossy().to_string());
                    }
                }
            }
        }
    }
    None
}

// ── Signal CLI registration endpoints ────────────────────────────────────

/// Generic response for signal-cli registration operations.
#[derive(Serialize)]
struct SignalRegResponse {
    success: bool,
    message: Option<String>,
    /// The device link URI (tsdevice://...) for QR code generation.
    #[serde(skip_serializing_if = "Option::is_none")]
    link_uri: Option<String>,
    /// Whether captcha is required for SMS registration.
    #[serde(skip_serializing_if = "Option::is_none")]
    captcha_required: Option<bool>,
    /// The account phone number (returned after successful link).
    #[serde(skip_serializing_if = "Option::is_none")]
    account: Option<String>,
}

#[derive(Deserialize)]
struct SignalLinkRequest {
    /// Path to signal-cli binary.
    cli_path: String,
    /// Device name shown in Signal (defaults to "Knapsack").
    device_name: Option<String>,
}

/// Start the signal-cli link flow. Returns a device link URI for QR code display.
///
/// The `signal-cli link` command prints a `tsdevice:/?uuid=...&pub_key=...` URI
/// to stdout, then blocks waiting for the user to scan it. We capture the URI
/// and return it, while the process continues in the background.
#[post("/api/clawd/channels/signal/link")]
pub async fn signal_link(body: web::Json<SignalLinkRequest>) -> impl Responder {
    let cli_path = body.cli_path.clone();
    let device_name = body.device_name.clone().unwrap_or_else(|| "Knapsack".to_string());

    // Run signal-cli link and capture the link URI from stdout.
    // The command outputs the URI on the first line, then waits for scan.
    // We use a timeout to avoid blocking forever.
    let result = tokio::task::spawn_blocking(move || {
        use std::io::BufRead;
        use std::process::Stdio;

        let mut child = match Command::new(&cli_path)
            .args(["link", "-n", &device_name])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
        {
            Ok(c) => c,
            Err(e) => {
                return Err(format!("Failed to start signal-cli: {}", e));
            }
        };

        let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
        let reader = std::io::BufReader::new(stdout);

        // Read lines looking for the device link URI
        let mut link_uri = None;
        for line in reader.lines() {
            match line {
                Ok(l) => {
                    let trimmed = l.trim().to_string();
                    if trimmed.starts_with("tsdevice:") || trimmed.starts_with("sgnl:") {
                        link_uri = Some(trimmed);
                        break;
                    }
                    // Some versions prefix with text before the URI
                    if let Some(pos) = trimmed.find("tsdevice:") {
                        link_uri = Some(trimmed[pos..].to_string());
                        break;
                    }
                    if let Some(pos) = trimmed.find("sgnl:") {
                        link_uri = Some(trimmed[pos..].to_string());
                        break;
                    }
                }
                Err(e) => {
                    return Err(format!("Error reading signal-cli output: {}", e));
                }
            }
        }

        // Don't kill the child - it needs to keep running to complete the link
        // after the user scans the QR code. It will exit on its own.
        std::mem::forget(child);

        match link_uri {
            Some(uri) => Ok(uri),
            None => Err("signal-cli did not output a link URI. It may need to be updated.".to_string()),
        }
    })
    .await;

    match result {
        Ok(Ok(uri)) => HttpResponse::Ok().json(SignalRegResponse {
            success: true,
            message: Some("Scan this QR code with Signal (Settings > Linked Devices > Link New Device)".to_string()),
            link_uri: Some(uri),
            captcha_required: None,
            account: None,
        }),
        Ok(Err(e)) => HttpResponse::Ok().json(SignalRegResponse {
            success: false,
            message: Some(e),
            link_uri: None,
            captcha_required: None,
            account: None,
        }),
        Err(e) => HttpResponse::Ok().json(SignalRegResponse {
            success: false,
            message: Some(format!("Internal error: {}", e)),
            link_uri: None,
            captcha_required: None,
            account: None,
        }),
    }
}

#[derive(Deserialize)]
struct SignalRegisterRequest {
    /// Path to signal-cli binary.
    cli_path: String,
    /// Phone number in E.164 format (e.g. +15551234567).
    phone_number: String,
    /// Optional captcha token (signalcaptcha://...) if captcha was required.
    captcha: Option<String>,
}

/// Register a phone number with signal-cli (SMS verification path).
///
/// After calling this, the user will receive an SMS with a verification code
/// that must be submitted via the verify endpoint.
#[post("/api/clawd/channels/signal/register")]
pub async fn signal_register(body: web::Json<SignalRegisterRequest>) -> impl Responder {
    let cli_path = body.cli_path.clone();
    let phone_number = body.phone_number.clone();
    let captcha = body.captcha.clone();

    let result = tokio::task::spawn_blocking(move || {
        let mut args = vec![
            "-a".to_string(),
            phone_number.clone(),
            "register".to_string(),
        ];

        if let Some(captcha_token) = &captcha {
            args.push("--captcha".to_string());
            args.push(captcha_token.clone());
        }

        let output = Command::new(&cli_path)
            .args(&args)
            .output()
            .map_err(|e| format!("Failed to run signal-cli: {}", e))?;

        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();

        if output.status.success() {
            Ok((false, "Verification SMS sent. Enter the code you receive.".to_string()))
        } else if stderr.contains("captcha") || stderr.contains("CAPTCHA") || stderr.contains("rate limit") {
            Ok((true, "Captcha required. Please complete the captcha and try again.".to_string()))
        } else {
            Err(format!(
                "Registration failed: {}",
                if !stderr.is_empty() { stderr } else { stdout }
            ))
        }
    })
    .await;

    match result {
        Ok(Ok((captcha_required, msg))) => HttpResponse::Ok().json(SignalRegResponse {
            success: true,
            message: Some(msg),
            link_uri: None,
            captcha_required: Some(captcha_required),
            account: None,
        }),
        Ok(Err(e)) => HttpResponse::Ok().json(SignalRegResponse {
            success: false,
            message: Some(e),
            link_uri: None,
            captcha_required: None,
            account: None,
        }),
        Err(e) => HttpResponse::Ok().json(SignalRegResponse {
            success: false,
            message: Some(format!("Internal error: {}", e)),
            link_uri: None,
            captcha_required: None,
            account: None,
        }),
    }
}

#[derive(Deserialize)]
struct SignalVerifyRequest {
    /// Path to signal-cli binary.
    cli_path: String,
    /// Phone number in E.164 format.
    phone_number: String,
    /// Verification code from SMS.
    code: String,
}

/// Verify a phone number with signal-cli using the SMS code.
#[post("/api/clawd/channels/signal/verify")]
pub async fn signal_verify(body: web::Json<SignalVerifyRequest>) -> impl Responder {
    let cli_path = body.cli_path.clone();
    let phone_number = body.phone_number.clone();
    let code = body.code.clone();

    let result = tokio::task::spawn_blocking(move || {
        let output = Command::new(&cli_path)
            .args(["-a", &phone_number, "verify", &code])
            .output()
            .map_err(|e| format!("Failed to run signal-cli: {}", e))?;

        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();

        if output.status.success() {
            Ok(phone_number)
        } else {
            Err(format!(
                "Verification failed: {}",
                if !stderr.is_empty() { stderr } else { stdout }
            ))
        }
    })
    .await;

    match result {
        Ok(Ok(account)) => HttpResponse::Ok().json(SignalRegResponse {
            success: true,
            message: Some("Phone number verified successfully.".to_string()),
            link_uri: None,
            captcha_required: None,
            account: Some(account),
        }),
        Ok(Err(e)) => HttpResponse::Ok().json(SignalRegResponse {
            success: false,
            message: Some(e),
            link_uri: None,
            captcha_required: None,
            account: None,
        }),
        Err(e) => HttpResponse::Ok().json(SignalRegResponse {
            success: false,
            message: Some(format!("Internal error: {}", e)),
            link_uri: None,
            captcha_required: None,
            account: None,
        }),
    }
}

// ── Allowlist management ──────────────────────────────────────────

/// Response for allowlist queries
#[derive(Serialize)]
struct AllowlistResponse {
    success: bool,
    #[serde(rename = "dmPolicy")]
    dm_policy: String,
    #[serde(rename = "allowFrom")]
    allow_from: Vec<String>,
    message: Option<String>,
}

/// Request body for updating allowlist
#[derive(Deserialize)]
struct AllowlistUpdateRequest {
    /// DM policy: "allowlist", "pairing", "open", "disabled"
    #[serde(rename = "dmPolicy")]
    dm_policy: Option<String>,
    /// List of allowed sender identifiers (phone numbers, usernames, etc.)
    #[serde(rename = "allowFrom")]
    allow_from: Option<Vec<String>>,
}

/// Read the current DM policy and allowlist for a channel from gateway config.
fn read_channel_allowlist(config: &serde_json::Value, channel: &str) -> (String, Vec<String>) {
    let ch = &config["config"]["channels"][channel];

    // Some channels (discord, slack, googlechat) use nested dm: { policy, allowFrom }
    let (policy, allow) = if ch.get("dm").is_some() {
        let dm = &ch["dm"];
        (
            dm.get("policy").and_then(|v| v.as_str()).unwrap_or("allowlist").to_string(),
            dm.get("allowFrom")
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                .unwrap_or_default(),
        )
    } else {
        (
            ch.get("dmPolicy").and_then(|v| v.as_str()).unwrap_or("allowlist").to_string(),
            ch.get("allowFrom")
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                .unwrap_or_default(),
        )
    };
    (policy, allow)
}

/// Get the allowlist and DM policy for any channel.
#[get("/api/clawd/channels/{channel}/allowlist")]
pub async fn channel_allowlist_get(path: web::Path<String>) -> impl Responder {
    let channel = path.into_inner();
    let config_result = gateway_client::config_get(None).await;
    match config_result {
        Ok(config) => {
            let (policy, allow) = read_channel_allowlist(&config, &channel);
            HttpResponse::Ok().json(AllowlistResponse {
                success: true,
                dm_policy: policy,
                allow_from: allow,
                message: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(AllowlistResponse {
            success: false,
            dm_policy: "allowlist".to_string(),
            allow_from: vec![],
            message: Some(format!("Failed to get config: {}", e)),
        }),
    }
}

/// Update the allowlist and/or DM policy for any channel.
#[post("/api/clawd/channels/{channel}/allowlist")]
pub async fn channel_allowlist_update(
    path: web::Path<String>,
    body: web::Json<AllowlistUpdateRequest>,
) -> impl Responder {
    let channel = path.into_inner();
    let config_result = gateway_client::config_get(None).await;
    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);
            let uses_nested_dm = matches!(channel.as_str(), "discord" | "slack" | "googlechat");

            let mut patch_inner = serde_json::Map::new();

            if uses_nested_dm {
                let mut dm = serde_json::Map::new();
                if let Some(ref policy) = body.dm_policy {
                    dm.insert("policy".to_string(), serde_json::json!(policy));
                }
                if let Some(ref allow) = body.allow_from {
                    dm.insert("allowFrom".to_string(), serde_json::json!(allow));
                }
                if !dm.is_empty() {
                    patch_inner.insert("dm".to_string(), serde_json::Value::Object(dm));
                }
            } else {
                if let Some(ref policy) = body.dm_policy {
                    patch_inner.insert("dmPolicy".to_string(), serde_json::json!(policy));
                }
                if let Some(ref allow) = body.allow_from {
                    patch_inner.insert("allowFrom".to_string(), serde_json::json!(allow));
                }
            }

            let patch = serde_json::json!({
                "channels": {
                    channel.clone(): patch_inner
                }
            });

            match gateway_client::config_patch(
                &serde_json::to_string(&patch).unwrap(),
                &base_hash,
                None,
            )
            .await
            {
                Ok(_) => HttpResponse::Ok().json(GenericResponse {
                    success: true,
                    message: Some("Allowlist updated".to_string()),
                    configured: None,
                    linked: None,
                }),
                Err(e) => HttpResponse::Ok().json(GenericResponse {
                    success: false,
                    message: Some(format!("Failed to update allowlist: {}", e)),
                    configured: None,
                    linked: None,
                }),
            }
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to get config: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Open System Preferences to Full Disk Access pane
#[post("/api/clawd/channels/open-full-disk-access")]
pub async fn open_full_disk_access() -> impl Responder {
    // Open System Preferences to Privacy & Security > Full Disk Access
    let result = Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles")
        .spawn();

    match result {
        Ok(_) => HttpResponse::Ok().json(GenericResponse {
            success: true,
            message: Some("Opening System Preferences. Please add Knapsack to Full Disk Access, then restart the app.".to_string()),
            configured: None,
            linked: None,
        }),
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Failed to open System Preferences: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

// ── Channel diagnostics ─────────────────────────────────────────────────

#[derive(Serialize)]
struct ChannelDiagnostics {
    success: bool,
    /// Full channel summary from the gateway
    #[serde(rename = "channelSummary")]
    channel_summary: Vec<String>,
    /// Whether agents.defaults.model is set
    #[serde(rename = "hasModel")]
    has_model: bool,
    /// The model string if set
    model: Option<String>,
    /// Whether any LLM API key env var is set in this process
    #[serde(rename = "hasApiKey")]
    has_api_key: bool,
    /// Which provider's API key is available
    #[serde(rename = "apiKeyProvider")]
    api_key_provider: Option<String>,
    /// Channel configs present in the gateway config
    #[serde(rename = "configuredChannels")]
    configured_channels: Vec<String>,
    /// Issues detected
    issues: Vec<String>,
    /// Auto-repair actions taken
    repairs: Vec<String>,
}

/// Diagnose channel configuration and auto-repair common issues.
///
/// Checks:
/// 1. Which channels are linked vs. configured in gateway config
/// 2. Whether agents.defaults.model is set
/// 3. Whether an LLM API key is available
/// 4. Auto-repairs: adds missing channel config for linked channels,
///    sets model if missing
#[get("/api/clawd/channels/diagnostics")]
pub async fn channel_diagnostics() -> impl Responder {
    let mut issues = Vec::new();
    let mut repairs = Vec::new();

    // Check LLM API key availability in the current process
    let (has_api_key, api_key_provider) = {
        if std::env::var("ANTHROPIC_API_KEY").map(|k| !k.trim().is_empty()).unwrap_or(false) {
            (true, Some("anthropic".to_string()))
        } else if std::env::var("OPENAI_API_KEY").map(|k| !k.trim().is_empty()).unwrap_or(false) {
            (true, Some("openai".to_string()))
        } else if std::env::var("GROQ_API_KEY").map(|k| !k.trim().is_empty()).unwrap_or(false) {
            (true, Some("groq".to_string()))
        } else if std::env::var("GEMINI_API_KEY").map(|k| !k.trim().is_empty()).unwrap_or(false) {
            (true, Some("gemini".to_string()))
        } else {
            (false, None)
        }
    };

    if !has_api_key {
        issues.push("No LLM API key found in environment (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)".to_string());
    }

    // Fetch channel status from gateway
    let channel_summary: Vec<String> = match gateway_client::get_channel_status(None).await {
        Ok(status) => {
            status.get("channelSummary")
                .and_then(|cs| cs.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect::<Vec<_>>())
                .unwrap_or_default()
        }
        Err(e) => {
            return HttpResponse::Ok().json(ChannelDiagnostics {
                success: false,
                channel_summary: vec![],
                has_model: false,
                model: None,
                has_api_key,
                api_key_provider,
                configured_channels: vec![],
                issues: vec![format!("Cannot reach gateway: {}", e)],
                repairs: vec![],
            });
        }
    };

    // Fetch gateway config to check model and channel configs
    let (has_model, model, configured_channels) = match gateway_client::config_get(None).await {
        Ok(snapshot) => {
            let config = snapshot.get("config").unwrap_or(&snapshot);

            // Check model
            let model_val = config.pointer("/agents/defaults/model");
            let (hm, m) = match model_val {
                Some(serde_json::Value::String(s)) if !s.trim().is_empty() => {
                    (true, Some(s.clone()))
                }
                Some(serde_json::Value::Object(o)) => {
                    let primary = o.get("primary").and_then(|v| v.as_str()).unwrap_or("");
                    (!primary.is_empty(), if primary.is_empty() { None } else { Some(primary.to_string()) })
                }
                _ => (false, None),
            };

            // Check which channels are in config
            let mut channels = Vec::new();
            if let Some(ch) = config.get("channels").and_then(|c| c.as_object()) {
                for (name, val) in ch {
                    if !val.is_null() {
                        channels.push(name.clone());
                    }
                }
            }

            // Auto-repair: if model is missing, patch it
            if !hm {
                issues.push("agents.defaults.model is NOT set in gateway config — AI cannot respond".to_string());
                let model_str = resolve_default_model();
                let base_hash = extract_base_hash(&snapshot);
                let patch = serde_json::json!({"agents": {"defaults": {"model": {"primary": model_str}}}}).to_string();
                match gateway_client::config_patch(&patch, &base_hash, None).await {
                    Ok(_) => repairs.push(format!("Set agents.defaults.model to '{}'", model_str)),
                    Err(e) => issues.push(format!("Failed to repair model: {}", e)),
                }
            }

            // ── Web search provider fallback ──────────────────────────────────
            // Priority order:
            //   1. Brave API  (BRAVE_API_KEY present — explicit config or env var)
            //   2. Browser CDP  (bundled Chromium available — /api/clawd/browser/search)
            //   3. DuckDuckGo  (key-free HTTP fallback, browser unavailable)
            //   4. Surface API key prompt  (only if all above fail)
            {
                let brave_key_in_config = snapshot
                    .pointer("/plugins/entries/brave/config/webSearch/apiKey")
                    .and_then(|v| v.as_str())
                    .map(|s| !s.is_empty())
                    .unwrap_or(false)
                    || snapshot
                        .pointer("/tools/web/search/apiKey")
                        .and_then(|v| v.as_str())
                        .map(|s| !s.is_empty())
                        .unwrap_or(false);
                let brave_key_env = std::env::var("BRAVE_API_KEY")
                    .map(|s| !s.trim().is_empty())
                    .unwrap_or(false);
                let has_brave_key = brave_key_in_config || brave_key_env;

                let explicit_provider = snapshot
                    .pointer("/tools/web/search/provider")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();

                if has_brave_key || !explicit_provider.is_empty() {
                    // Brave API key present or provider already explicitly set — nothing to repair.
                    let label = if !explicit_provider.is_empty() {
                        explicit_provider.clone()
                    } else {
                        "brave (API key found)".to_string()
                    };
                    log::info!("[channels] web_search provider: {}", label);
                } else {
                    // No Brave key and no explicit provider.
                    // Check if the bundled browser (CDP) is available — if so it is the
                    // primary search mechanism via /api/clawd/browser/search.
                    let browser_ok = tokio::time::timeout(
                        std::time::Duration::from_secs(3),
                        gateway_client::browser_request(
                            "GET", "/tabs",
                            Some(serde_json::json!({"profile": "openclaw"})),
                            None, None,
                        ),
                    ).await
                    .map(|r| r.is_ok())
                    .unwrap_or(false);

                    if browser_ok {
                        // Browser CDP is available — it serves as the primary search
                        // mechanism via GET /api/clawd/browser/search.
                        // Ensure the gateway web_search tool also has a key-free provider
                        // (DDG) so the AI can use web_search as a secondary path, but
                        // log clearly that browser is the primary.
                        log::info!("[channels] web_search: browser CDP available — using browser as primary search (BRAVE_API_KEY not set)");
                        repairs.push(
                            "Browser CDP available — using /api/clawd/browser/search as primary \
                             web search (BRAVE_API_KEY not set). DuckDuckGo configured as secondary."
                                .to_string(),
                        );
                        // Also wire up DDG as secondary so web_search tool itself works
                        let re_snapshot = gateway_client::config_get(None).await;
                        if let Ok(snap) = re_snapshot {
                            let bh = extract_base_hash(&snap);
                            let ddg_patch = serde_json::json!({
                                "tools": { "web": { "search": { "provider": "duckduckgo" } } }
                            }).to_string();
                            match gateway_client::config_patch(&ddg_patch, &bh, None).await {
                                Ok(_) => log::info!("[channels] web_search: DDG configured as secondary provider"),
                                Err(e) => log::warn!("[channels] web_search DDG secondary patch failed: {}", e),
                            }
                        }
                    } else {
                        // Browser not available — configure DDG as the sole fallback.
                        log::info!("[channels] web_search: browser unavailable — configuring DuckDuckGo (BRAVE_API_KEY not set)");
                        let re_snapshot = gateway_client::config_get(None).await;
                        if let Ok(snap) = re_snapshot {
                            let bh = extract_base_hash(&snap);
                            let ddg_patch = serde_json::json!({
                                "tools": { "web": { "search": { "provider": "duckduckgo" } } }
                            }).to_string();
                            match gateway_client::config_patch(&ddg_patch, &bh, None).await {
                                Ok(_) => {
                                    repairs.push(
                                        "Configured DuckDuckGo as web_search provider \
                                         (BRAVE_API_KEY not set, browser unavailable)."
                                            .to_string(),
                                    );
                                }
                                Err(e) => {
                                    log::warn!("[channels] web_search DDG patch failed: {}", e);
                                    // Both browser and DDG unavailable → surface the API key prompt
                                    issues.push(format!(
                                        "BRAVE_API_KEY not set, browser unavailable, and DuckDuckGo \
                                         fallback patch failed: {}. Set BRAVE_API_KEY to enable web search.",
                                        e
                                    ));
                                }
                            }
                        }
                    }
                }
            }

            // Auto-repair: if sandbox tools are missing, patch them.
            // This is critical after a config reset — without sandbox tools,
            // channel messages (Telegram, WhatsApp, etc.) are silently dropped
            // because the gateway's sandbox mode blocks all tools.
            if !has_sandbox_tools(&snapshot) {
                issues.push("tools.sandbox.tools.allow is missing or incomplete — channel messages cannot use tools".to_string());
                let re_snapshot = gateway_client::config_get(None).await;
                if let Ok(snap) = re_snapshot {
                    let bh = extract_base_hash(&snap);
                    let sandbox_patch = serde_json::json!({
                        "tools": {
                            "allow": ["browser", "group:web", "exec", "process", "group:fs"],
                            "deny": ["canvas", "nodes", "cron", "gateway"],
                            "exec": {"applyPatch": {"enabled": true}},
                            "media": {"image": {"enabled": true}},
                            "sandbox": {
                                "tools": {
                                    "deny": ["canvas", "nodes", "cron", "gateway"],
                                    "allow": [
                                        "exec", "process", "group:fs",
                                        "image", "sessions_list", "sessions_history",
                                        "sessions_send", "sessions_spawn", "session_status",
                                        "browser", "group:web"
                                    ]
                                }
                            }
                        }
                    }).to_string();
                    match gateway_client::config_patch(&sandbox_patch, &bh, None).await {
                        Ok(_) => repairs.push("Added tools.sandbox.tools.allow with browser + web + exec tools".to_string()),
                        Err(e) => issues.push(format!("Failed to repair sandbox tools: {}", e)),
                    }
                }
            }

            // Auto-repair: check if linked channels are missing from config
            for line in &channel_summary {
                let lower = strip_ansi(line).to_lowercase();
                // e.g. "whatsapp: linked +1234567890 auth 2h ago"
                for (ch_name, ch_key) in &[
                    ("whatsapp", "whatsapp"),
                    ("imessage", "imessage"),
                    ("telegram", "telegram"),
                ] {
                    let prefix = format!("{}: ", ch_name);
                    if let Some(status_part) = lower.strip_prefix(&prefix) {
                        if status_part.starts_with("linked") || status_part.starts_with("configured") {
                            if !channels.contains(&ch_key.to_string()) {
                                issues.push(format!(
                                    "Channel '{}' is {} but NOT in gateway config — messages won't be processed",
                                    ch_key, status_part.split_whitespace().next().unwrap_or("linked")
                                ));
                                // Try to repair by adding the channel config
                                let re_snapshot = gateway_client::config_get(None).await;
                                if let Ok(snap) = re_snapshot {
                                    let bh = extract_base_hash(&snap);
                                    let dm_policy = match *ch_key {
                                        "imessage" => r#"{"channels":{"imessage":{"dmPolicy":"allowlist","service":"auto"}}}"#,
                                        _ => &format!(r#"{{"channels":{{"{}": {{"dmPolicy":"pairing"}}}}}}"#, ch_key),
                                    };
                                    match gateway_client::config_patch(dm_policy, &bh, None).await {
                                        Ok(_) => repairs.push(format!("Added channel config for '{}'", ch_key)),
                                        Err(e) => issues.push(format!("Failed to repair channel '{}': {}", ch_key, e)),
                                    }
                                }
                            }
                        }
                    }
                }
            }

            (hm, m, channels)
        }
        Err(e) => {
            issues.push(format!("Cannot fetch gateway config: {}", e));
            (false, None, vec![])
        }
    };

    if !has_model {
        issues.push("agents.defaults.model is NOT set — AI cannot generate responses".to_string());
    }

    HttpResponse::Ok().json(ChannelDiagnostics {
        success: issues.is_empty(),
        channel_summary,
        has_model,
        model,
        has_api_key,
        api_key_provider,
        configured_channels,
        issues,
        repairs,
    })
}

// ── Telegram User Accounts (MTProto, non-bot) ────────────────────────────────
//
// These endpoints enable the onboarding flow that creates real Telegram *user*
// accounts for digital employees and the Knapsack Chief-of-Staff.  Unlike the
// existing bot-token flow (BotFather), user accounts can initiate conversations
// and are not constrained by bot API limitations.
//
// The actual MTProto session management is delegated to the OpenClaw gateway
// (Node.js) via the `telegram.user.*` method namespace over the WebSocket RPC.

/// Request body for requesting a Telegram OTP code.
#[derive(Deserialize)]
struct TelegramUserCodeRequest {
    phone_number: String,
    #[serde(default)]
    agent_id: Option<String>,
}

/// Request body for verifying a Telegram OTP code.
#[derive(Deserialize)]
struct TelegramUserVerifyRequest {
    phone_number: String,
    code: String,
    phone_code_hash: String,
    #[serde(default)]
    agent_id: Option<String>,
}

/// Request body for signing up a brand-new Telegram user account.
#[derive(Deserialize)]
struct TelegramUserSignUpRequest {
    phone_number: String,
    phone_code_hash: String,
    first_name: String,
    #[serde(default)]
    last_name: Option<String>,
    #[serde(default)]
    agent_id: Option<String>,
}

/// Response for OTP code request / Chief-of-Staff setup initiation.
#[derive(Serialize)]
struct TelegramUserCodeResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    /// Opaque hash passed back to the verify step.
    #[serde(skip_serializing_if = "Option::is_none")]
    phone_code_hash: Option<String>,
    /// Whether this phone number already has a Telegram account.
    #[serde(skip_serializing_if = "Option::is_none")]
    is_registered: Option<bool>,
}

/// Response for OTP verify / sign-up.
#[derive(Serialize)]
struct TelegramUserVerifyResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    session: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    is_new: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    display_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
}

/// Response for user / chief-of-staff status queries.
#[derive(Serialize)]
struct TelegramUserStatusResponse {
    success: bool,
    configured: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    user_id: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    display_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    phone: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

/// Helper: proxy a call to the gateway's `telegram.user.*` namespace.
async fn telegram_user_call(method: &str, params: serde_json::Value) -> Result<serde_json::Value, String> {
    if !gateway_client::is_gateway_port_open().await {
        gateway_client::ensure_gateway_and_wait().await;
        if !gateway_client::is_gateway_port_open().await {
            return Err("Gateway not reachable — the background service may need to be restarted.".to_string());
        }
    }
    gateway_client::call_channel_method(method, Some(params), None).await
}

/// Request an OTP for a Telegram user account.
///
/// The gateway calls `auth.sendCode` via MTProto and returns a `phoneCodeHash`
/// that must be passed back during verification.
#[post("/api/clawd/telegram/user/request-code")]
pub async fn telegram_user_request_code(
    body: web::Json<TelegramUserCodeRequest>,
) -> impl Responder {
    let phone = body.phone_number.trim().to_string();
    if phone.is_empty() {
        return HttpResponse::BadRequest().json(TelegramUserCodeResponse {
            success: false,
            message: Some("Phone number is required".to_string()),
            phone_code_hash: None,
            is_registered: None,
        });
    }

    let params = serde_json::json!({
        "phoneNumber": phone,
        "agentId": body.agent_id.as_deref().unwrap_or("default"),
    });

    match telegram_user_call("telegram.user.requestCode", params).await {
        Ok(result) => {
            let success = result.get("success").and_then(|v| v.as_bool()).unwrap_or(false);
            let phone_code_hash = result.get("phoneCodeHash").and_then(|v| v.as_str()).map(|s| s.to_string());
            let is_registered = result.get("isRegistered").and_then(|v| v.as_bool());
            let message = result.get("message").and_then(|v| v.as_str()).map(|s| s.to_string());
            HttpResponse::Ok().json(TelegramUserCodeResponse {
                success,
                message,
                phone_code_hash,
                is_registered,
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramUserCodeResponse {
            success: false,
            message: Some(format!("Failed to request code: {}", e)),
            phone_code_hash: None,
            is_registered: None,
        }),
    }
}

/// Verify a Telegram OTP and sign in to the user account.
///
/// Calls `auth.signIn` via MTProto.  If the phone is not yet registered,
/// returns `is_new: true` so the client can proceed to the sign-up step.
#[post("/api/clawd/telegram/user/verify-code")]
pub async fn telegram_user_verify_code(
    body: web::Json<TelegramUserVerifyRequest>,
) -> impl Responder {
    let phone = body.phone_number.trim().to_string();
    let code = body.code.trim().to_string();
    let hash = body.phone_code_hash.trim().to_string();

    if phone.is_empty() || code.is_empty() || hash.is_empty() {
        return HttpResponse::BadRequest().json(TelegramUserVerifyResponse {
            success: false,
            message: Some("phone_number, code, and phone_code_hash are required".to_string()),
            session: None,
            is_new: None,
            display_name: None,
            username: None,
        });
    }

    let params = serde_json::json!({
        "phoneNumber": phone,
        "code": code,
        "phoneCodeHash": hash,
        "agentId": body.agent_id.as_deref().unwrap_or("default"),
    });

    match telegram_user_call("telegram.user.verifyCode", params).await {
        Ok(result) => {
            let success = result.get("success").and_then(|v| v.as_bool()).unwrap_or(false);
            HttpResponse::Ok().json(TelegramUserVerifyResponse {
                success,
                message: result.get("message").and_then(|v| v.as_str()).map(|s| s.to_string()),
                session: result.get("session").and_then(|v| v.as_str()).map(|s| s.to_string()),
                is_new: result.get("isNew").and_then(|v| v.as_bool()),
                display_name: result.get("displayName").and_then(|v| v.as_str()).map(|s| s.to_string()),
                username: result.get("username").and_then(|v| v.as_str()).map(|s| s.to_string()),
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramUserVerifyResponse {
            success: false,
            message: Some(format!("Verification failed: {}", e)),
            session: None,
            is_new: None,
            display_name: None,
            username: None,
        }),
    }
}

/// Complete sign-up for a brand-new Telegram account.
///
/// Called when `verifyCode` indicates the phone number is not yet registered.
/// Calls `auth.signUp` via MTProto and returns the new session.
#[post("/api/clawd/telegram/user/sign-up")]
pub async fn telegram_user_sign_up(
    body: web::Json<TelegramUserSignUpRequest>,
) -> impl Responder {
    let phone = body.phone_number.trim().to_string();
    let hash = body.phone_code_hash.trim().to_string();
    let first = body.first_name.trim().to_string();

    if phone.is_empty() || hash.is_empty() || first.is_empty() {
        return HttpResponse::BadRequest().json(TelegramUserVerifyResponse {
            success: false,
            message: Some("phone_number, phone_code_hash, and first_name are required".to_string()),
            session: None,
            is_new: None,
            display_name: None,
            username: None,
        });
    }

    let params = serde_json::json!({
        "phoneNumber": phone,
        "phoneCodeHash": hash,
        "firstName": first,
        "lastName": body.last_name.as_deref().unwrap_or(""),
        "agentId": body.agent_id.as_deref().unwrap_or("default"),
    });

    match telegram_user_call("telegram.user.signUp", params).await {
        Ok(result) => {
            let success = result.get("success").and_then(|v| v.as_bool()).unwrap_or(false);
            HttpResponse::Ok().json(TelegramUserVerifyResponse {
                success,
                message: result.get("message").and_then(|v| v.as_str()).map(|s| s.to_string()),
                session: result.get("session").and_then(|v| v.as_str()).map(|s| s.to_string()),
                is_new: Some(true),
                display_name: result.get("displayName").and_then(|v| v.as_str()).map(|s| s.to_string()),
                username: result.get("username").and_then(|v| v.as_str()).map(|s| s.to_string()),
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramUserVerifyResponse {
            success: false,
            message: Some(format!("Sign-up failed: {}", e)),
            session: None,
            is_new: None,
            display_name: None,
            username: None,
        }),
    }
}

/// Get the Telegram user account status for a given agent (or default).
#[get("/api/clawd/telegram/user/status")]
pub async fn telegram_user_status(
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    let agent_id = query.get("agent_id").cloned().unwrap_or_else(|| "default".to_string());

    let params = serde_json::json!({ "agentId": agent_id });

    match telegram_user_call("telegram.user.status", params).await {
        Ok(result) => {
            let configured = result.get("configured").and_then(|v| v.as_bool()).unwrap_or(false);
            HttpResponse::Ok().json(TelegramUserStatusResponse {
                success: true,
                configured,
                user_id: result.get("userId").and_then(|v| v.as_i64()),
                display_name: result.get("displayName").and_then(|v| v.as_str()).map(|s| s.to_string()),
                username: result.get("username").and_then(|v| v.as_str()).map(|s| s.to_string()),
                phone: result.get("phone").and_then(|v| v.as_str()).map(|s| s.to_string()),
                message: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramUserStatusResponse {
            success: false,
            configured: false,
            user_id: None,
            display_name: None,
            username: None,
            phone: None,
            message: Some(format!("Could not fetch status: {}", e)),
        }),
    }
}

/// Initiate the Knapsack Chief-of-Staff user account setup.
///
/// Requests an OTP for the provided phone number so the user can complete
/// verification in the onboarding UI.  The Chief-of-Staff account acts as
/// the shared Telegram identity for the Knapsack workspace, routing inbound
/// messages to the appropriate digital employee.
#[post("/api/clawd/telegram/chief-of-staff/setup")]
pub async fn telegram_chief_of_staff_setup(
    body: web::Json<TelegramUserCodeRequest>,
) -> impl Responder {
    let phone = body.phone_number.trim().to_string();
    if phone.is_empty() {
        return HttpResponse::BadRequest().json(TelegramUserCodeResponse {
            success: false,
            message: Some("Phone number is required for Chief-of-Staff setup".to_string()),
            phone_code_hash: None,
            is_registered: None,
        });
    }

    let params = serde_json::json!({
        "phoneNumber": phone,
        "agentId": "chief-of-staff",
        "role": "chief-of-staff",
        "displayName": "Knapsack",
    });

    match telegram_user_call("telegram.user.requestCode", params).await {
        Ok(result) => {
            let success = result.get("success").and_then(|v| v.as_bool()).unwrap_or(false);
            HttpResponse::Ok().json(TelegramUserCodeResponse {
                success,
                message: result.get("message").and_then(|v| v.as_str()).map(|s| s.to_string()),
                phone_code_hash: result.get("phoneCodeHash").and_then(|v| v.as_str()).map(|s| s.to_string()),
                is_registered: result.get("isRegistered").and_then(|v| v.as_bool()),
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramUserCodeResponse {
            success: false,
            message: Some(format!("Chief-of-Staff setup failed: {}", e)),
            phone_code_hash: None,
            is_registered: None,
        }),
    }
}

/// Get the status of the Knapsack Chief-of-Staff Telegram user account.
#[get("/api/clawd/telegram/chief-of-staff/status")]
pub async fn telegram_chief_of_staff_status() -> impl Responder {
    let params = serde_json::json!({ "agentId": "chief-of-staff" });

    match telegram_user_call("telegram.user.status", params).await {
        Ok(result) => {
            let configured = result.get("configured").and_then(|v| v.as_bool()).unwrap_or(false);
            HttpResponse::Ok().json(TelegramUserStatusResponse {
                success: true,
                configured,
                user_id: result.get("userId").and_then(|v| v.as_i64()),
                display_name: result.get("displayName").and_then(|v| v.as_str()).map(|s| s.to_string()),
                username: result.get("username").and_then(|v| v.as_str()).map(|s| s.to_string()),
                phone: result.get("phone").and_then(|v| v.as_str()).map(|s| s.to_string()),
                message: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramUserStatusResponse {
            success: false,
            configured: false,
            user_id: None,
            display_name: None,
            username: None,
            phone: None,
            message: Some(format!("Could not fetch Chief-of-Staff status: {}", e)),
        }),
    }
}

#[derive(Serialize)]
struct TelegramProvisionBotResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    bot_token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    bot_username: Option<String>,
}

/// Auto-provision the Chief-of-Staff bot token.
///
/// Checks the `KNAPSACK_TG_CHIEF_OF_STAFF_BOT_TOKEN` environment variable for a
/// pre-configured token supplied by the Knapsack backend or deployment config.
/// Returns `success: false` when no token is found so the UI can fall back to
/// manual entry.
#[post("/api/clawd/telegram/chief-of-staff/provision-bot")]
pub async fn telegram_provision_chief_of_staff_bot() -> impl Responder {
    match std::env::var("KNAPSACK_TG_CHIEF_OF_STAFF_BOT_TOKEN") {
        Ok(token) if !token.trim().is_empty() => {
            HttpResponse::Ok().json(TelegramProvisionBotResponse {
                success: true,
                message: None,
                bot_token: Some(token.trim().to_string()),
                bot_username: None,
            })
        }
        _ => HttpResponse::Ok().json(TelegramProvisionBotResponse {
            success: false,
            message: Some("No pre-configured bot token found. Please enter a bot token manually.".to_string()),
            bot_token: None,
            bot_username: None,
        }),
    }
}

// ── Managed Bots (Bot API 9.6) ──────────────────────────────

/// Helper: proxy a call to the gateway's `telegram.bot.*` / `telegram.managedbot.*` namespace.
async fn telegram_bot_call(method: &str, params: serde_json::Value) -> Result<serde_json::Value, String> {
    if !gateway_client::is_gateway_port_open().await {
        gateway_client::ensure_gateway_and_wait().await;
        if !gateway_client::is_gateway_port_open().await {
            return Err("Gateway not reachable — the background service may need to be restarted.".to_string());
        }
    }
    gateway_client::call_channel_method(method, Some(params), None).await
}

#[derive(Deserialize)]
struct TelegramManagedBotDeeplinkRequest {
    manager_username: String,
    suggested_username: String,
    #[serde(default)]
    suggested_name: Option<String>,
}

#[derive(Serialize)]
struct TelegramManagedBotDeeplinkResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    deeplink: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

/// Generate a Managed Bot creation deeplink (Bot API 9.6).
///
/// Returns a `https://t.me/newbot/{manager}/{suggested}` URL that the user can
/// open in Telegram to create a managed bot under the manager bot.
#[post("/api/clawd/telegram/managed-bot/deeplink")]
pub async fn telegram_managed_bot_deeplink(
    body: web::Json<TelegramManagedBotDeeplinkRequest>,
) -> impl Responder {
    let params = serde_json::json!({
        "managerUsername": body.manager_username.trim(),
        "suggestedUsername": body.suggested_username.trim(),
        "suggestedName": body.suggested_name,
    });
    match telegram_bot_call("telegram.managedbot.deeplink", params).await {
        Ok(v) => {
            let deeplink = v.get("deeplink").and_then(|d| d.as_str()).map(|s| s.to_string());
            HttpResponse::Ok().json(TelegramManagedBotDeeplinkResponse {
                success: deeplink.is_some(),
                deeplink,
                message: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramManagedBotDeeplinkResponse {
            success: false,
            deeplink: None,
            message: Some(e),
        }),
    }
}

#[derive(Deserialize)]
struct TelegramManagedBotGetTokenRequest {
    #[allow(dead_code)]
    agent_id: Option<String>,
    manager_token: String,
    bot_username: String,
}

#[derive(Serialize)]
struct TelegramManagedBotTokenResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    bot_id: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

/// Retrieve a managed bot's token via the manager bot (Bot API 9.6).
///
/// Resolves @bot_username → user_id via getChat, then calls getManagedBotToken.
/// The OpenClaw gateway's built-in Telegram channel integration owns polling;
/// this endpoint only retrieves the token so the provision script can persist it.
#[post("/api/clawd/telegram/managed-bot/get-token")]
pub async fn telegram_managed_bot_get_token(
    body: web::Json<TelegramManagedBotGetTokenRequest>,
) -> impl Responder {
    let params = serde_json::json!({
        "managerToken": body.manager_token.trim(),
        "botUsername": body.bot_username.trim().trim_start_matches('@'),
    });
    match telegram_bot_call("telegram.managedbot.getToken", params).await {
        Ok(v) => {
            let token = v.get("token").and_then(|t| t.as_str()).map(|s| s.to_string());
            let username = v.get("username").and_then(|u| u.as_str()).map(|s| s.to_string());
            let bot_id = v.get("botId").and_then(|id| id.as_i64());
            let success = token.is_some();
            let message = if success {
                None
            } else {
                Some("Could not retrieve managed bot token — ensure the bot was created via the deeplink and the manager bot has can_manage_bots enabled.".to_string())
            };
            HttpResponse::Ok().json(TelegramManagedBotTokenResponse {
                success,
                token,
                username,
                bot_id,
                message,
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramManagedBotTokenResponse {
            success: false,
            token: None,
            username: None,
            bot_id: None,
            message: Some(e),
        }),
    }
}

#[derive(Deserialize)]
struct TelegramBotStatusQuery {
    agent_id: String,
}

#[derive(Serialize)]
struct TelegramBotStatusResponse {
    success: bool,
    configured: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    display_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

/// Check whether the OpenClaw channel is active for a given agent's bot.
#[get("/api/clawd/telegram/managed-bot/status")]
pub async fn telegram_managed_bot_status(
    query: web::Query<TelegramBotStatusQuery>,
) -> impl Responder {
    let params = serde_json::json!({ "agentId": query.agent_id.trim() });
    match telegram_bot_call("telegram.bot.status", params).await {
        Ok(v) => {
            let configured = v.get("configured").and_then(|c| c.as_bool()).unwrap_or(false);
            HttpResponse::Ok().json(TelegramBotStatusResponse {
                success: true,
                configured,
                username: v.get("username").and_then(|u| u.as_str()).map(|s| s.to_string()),
                display_name: v.get("displayName").and_then(|d| d.as_str()).map(|s| s.to_string()),
                message: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(TelegramBotStatusResponse {
            success: false,
            configured: false,
            username: None,
            display_name: None,
            message: Some(e),
        }),
    }
}

// ── Per-Agent Child Bot Provisioning (Bot API 9.6) ─────────────────────────

/// Read the openclaw.json config path from the process environment.
/// `OPENCLAW_STATE_DIR` is set by service.rs before the HTTP server starts.
fn agent_bot_config_path() -> Option<std::path::PathBuf> {
    std::env::var("OPENCLAW_STATE_DIR")
        .ok()
        .map(|s| std::path::PathBuf::from(s).join("openclaw.json"))
}

/// Upsert one telegram channel entry (keyed by agent_id) in openclaw.json.
fn upsert_telegram_channel_entry(
    config_path: &std::path::Path,
    agent_id: &str,
    agent_name: &str,
    token: &str,
    username: &str,
) -> Result<(), String> {
    let raw = std::fs::read_to_string(config_path)
        .map_err(|e| format!("read openclaw.json: {e}"))?;
    let mut cfg: serde_json::Value = serde_json::from_str(&raw)
        .map_err(|e| format!("parse openclaw.json: {e}"))?;

    let telegram = cfg
        .as_object_mut()
        .ok_or("config not an object")?
        .entry("channels")
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or("channels not an object")?
        .entry("telegram")
        .or_insert_with(|| serde_json::json!([]));

    let arr = telegram.as_array_mut().ok_or("channels.telegram not an array")?;
    // Remove any existing entry for this agent.
    arr.retain(|e| e.get("agentId").and_then(|v| v.as_str()) != Some(agent_id));
    arr.push(serde_json::json!({
        "id": format!("{}-bot", agent_id),
        "agentId": agent_id,
        "token": token,
        "username": username,
        "description": format!("{} — Dedicated Telegram bot", agent_name),
    }));

    let json = serde_json::to_string_pretty(&cfg).map_err(|e| format!("serialize: {e}"))?;
    std::fs::write(config_path, &json).map_err(|e| format!("write openclaw.json: {e}"))?;
    Ok(())
}

/// Remove a telegram channel entry for an agent from openclaw.json.
#[allow(dead_code)]
fn remove_telegram_channel_entry(config_path: &std::path::Path, agent_id: &str) -> Result<(), String> {
    let raw = std::fs::read_to_string(config_path)
        .map_err(|e| format!("read openclaw.json: {e}"))?;
    let mut cfg: serde_json::Value = serde_json::from_str(&raw)
        .map_err(|e| format!("parse openclaw.json: {e}"))?;

    if let Some(arr) = cfg.pointer_mut("/channels/telegram").and_then(|v| v.as_array_mut()) {
        arr.retain(|e| e.get("agentId").and_then(|v| v.as_str()) != Some(agent_id));
    }

    let json = serde_json::to_string_pretty(&cfg).map_err(|e| format!("serialize: {e}"))?;
    std::fs::write(config_path, &json).map_err(|e| format!("write openclaw.json: {e}"))?;
    Ok(())
}

// ── Deep link ─────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct TelegramAgentBotDeepLinkRequest {
    suggested_username: String,
    agent_name: String,
}

#[derive(Serialize)]
struct TelegramAgentBotDeepLinkResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    deeplink: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

/// Return a `https://t.me/newbot/{manager}/{suggested}` deep link for a child
/// bot.  Reads `TELEGRAM_MANAGER_BOT_USERNAME` from the process environment.
#[post("/api/clawd/telegram/agent-bot/deep-link")]
pub async fn telegram_get_agent_bot_deep_link(
    body: web::Json<TelegramAgentBotDeepLinkRequest>,
) -> impl Responder {
    let manager = std::env::var("TELEGRAM_MANAGER_BOT_USERNAME").unwrap_or_default();
    if manager.trim().is_empty() {
        return HttpResponse::Ok().json(TelegramAgentBotDeepLinkResponse {
            success: false,
            deeplink: None,
            message: Some("TELEGRAM_MANAGER_BOT_USERNAME is not configured.".to_string()),
        });
    }
    let suggested = body.suggested_username.trim().trim_start_matches('@').to_string();
    let name_enc: String = body.agent_name.chars().map(|c| {
        if c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' { c } else { '_' }
    }).collect();
    // tg:// scheme opens the Telegram app directly on macOS/Windows/Linux.
    // https://t.me/ always opens in the browser because Telegram doesn't register
    // as a universal-link handler on desktop OS — only tg:// is intercepted.
    let deeplink = format!(
        "tg://resolve?domain={}&start=newbot_{}",
        manager.trim(),
        suggested,
    );
    HttpResponse::Ok().json(TelegramAgentBotDeepLinkResponse {
        success: true,
        deeplink: Some(deeplink),
        message: None,
    })
}

// ── Provision (single attempt — frontend polls every ~3 s) ────────────────

#[derive(Deserialize)]
struct TelegramProvisionAgentBotRequest {
    agent_id: String,
    agent_name: String,
    suggested_username: String,
}

#[derive(Serialize)]
struct TelegramAgentBotProvisionResponse {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    bot_id: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

/// Single-attempt provision: tries `getManagedBotToken` once.  Returns
/// `success: false` immediately if the child bot hasn't been created yet
/// (frontend polls every 3 s after opening the deep link).
///
/// On success, writes the token + channel entry to openclaw.json and pushes
/// the change to the running gateway via `config.patch`.
#[post("/api/clawd/telegram/agent-bot/provision")]
pub async fn telegram_provision_agent_bot(
    body: web::Json<TelegramProvisionAgentBotRequest>,
) -> impl Responder {
    let manager_token = std::env::var("TELEGRAM_MANAGER_TOKEN").unwrap_or_default();
    if manager_token.trim().is_empty() {
        return HttpResponse::Ok().json(TelegramAgentBotProvisionResponse {
            success: false,
            username: None,
            bot_id: None,
            message: Some("TELEGRAM_MANAGER_TOKEN is not configured.".to_string()),
        });
    }

    let suggested = body.suggested_username.trim().trim_start_matches('@').to_string();
    let params = serde_json::json!({
        "managerToken": manager_token.trim(),
        "botUsername": suggested,
    });

    let result = telegram_bot_call("telegram.managedbot.getToken", params).await;

    match result {
        Ok(v) => {
            let token = v.get("token").and_then(|t| t.as_str()).map(|s| s.to_string());
            let username = v.get("username").and_then(|u| u.as_str()).map(|s| s.to_string());
            let bot_id = v.get("botId").and_then(|id| id.as_i64());

            if let (Some(tok), Some(uname)) = (token.as_deref(), username.as_deref()) {
                // Persist to openclaw.json on disk.
                if let Some(config_path) = agent_bot_config_path() {
                    if let Err(e) = upsert_telegram_channel_entry(
                        &config_path,
                        body.agent_id.trim(),
                        body.agent_name.trim(),
                        tok,
                        uname,
                    ) {
                        eprintln!("[channels] telegram provision: failed to write openclaw.json: {e}");
                    }
                }

                // Push the updated channels.telegram array to the running gateway.
                if let Some(config_path) = agent_bot_config_path() {
                    if let Ok(raw) = std::fs::read_to_string(&config_path) {
                        if let Ok(cfg) = serde_json::from_str::<serde_json::Value>(&raw) {
                            if let Some(tg) = cfg.pointer("/channels/telegram") {
                                let patch = serde_json::json!({
                                    "channels": { "telegram": tg.clone() }
                                });
                                tokio::spawn(async move {
                                    if let Ok(cur) = crate::clawd::gateway_client::config_get(None).await {
                                        if let Some(hash) = cur.get("hash").and_then(|h| h.as_str()) {
                                            if !hash.is_empty() {
                                                let _ = crate::clawd::gateway_client::config_patch(
                                                    &patch.to_string(), hash, None,
                                                ).await;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                }

                HttpResponse::Ok().json(TelegramAgentBotProvisionResponse {
                    success: true,
                    username,
                    bot_id,
                    message: None,
                })
            } else {
                HttpResponse::Ok().json(TelegramAgentBotProvisionResponse {
                    success: false,
                    username: None,
                    bot_id: None,
                    message: Some("Child bot not created yet — complete the deep link flow in Telegram.".to_string()),
                })
            }
        }
        Err(e) => HttpResponse::Ok().json(TelegramAgentBotProvisionResponse {
            success: false,
            username: None,
            bot_id: None,
            message: Some(e),
        }),
    }
}

// ── Token rotation ────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct TelegramRotateAgentBotRequest {
    agent_id: String,
}

/// Rotate a provisioned agent bot's token via `replaceManagedBotToken` and
/// update openclaw.json + the running gateway config.
#[post("/api/clawd/telegram/agent-bot/rotate")]
pub async fn telegram_rotate_agent_bot_token(
    body: web::Json<TelegramRotateAgentBotRequest>,
) -> impl Responder {
    let agent_id = body.agent_id.trim().to_string();

    // Find the current token from openclaw.json.
    let current_token: Option<String> = agent_bot_config_path().and_then(|p| {
        let raw = std::fs::read_to_string(&p).ok()?;
        let cfg: serde_json::Value = serde_json::from_str(&raw).ok()?;
        cfg.pointer("/channels/telegram")?
            .as_array()?
            .iter()
            .find(|e| e.get("agentId").and_then(|v| v.as_str()) == Some(agent_id.as_str()))
            .and_then(|e| e.get("token"))
            .and_then(|t| t.as_str())
            .map(|s| s.to_string())
    });

    let Some(current_tok) = current_token else {
        return HttpResponse::Ok().json(serde_json::json!({
            "success": false,
            "message": format!("No token found for agent '{}'", agent_id)
        }));
    };

    let params = serde_json::json!({ "botToken": current_tok });
    match telegram_bot_call("telegram.managedbot.replaceToken", params).await {
        Ok(v) => {
            let new_token = v.get("token").and_then(|t| t.as_str()).map(|s| s.to_string());
            let username = v.get("username").and_then(|u| u.as_str())
                .or_else(|| v.get("botUsername").and_then(|u| u.as_str()))
                .map(|s| s.to_string());

            if let (Some(tok), Some(uname)) = (new_token.as_deref(), username.as_deref()) {
                if let Some(config_path) = agent_bot_config_path() {
                    if let Ok(raw) = std::fs::read_to_string(&config_path) {
                        if let Ok(cfg) = serde_json::from_str::<serde_json::Value>(&raw) {
                            let agent_name = cfg.pointer("/channels/telegram")
                                .and_then(|a| a.as_array())
                                .and_then(|arr| arr.iter().find(|e| {
                                    e.get("agentId").and_then(|v| v.as_str()) == Some(agent_id.as_str())
                                }))
                                .and_then(|e| e.get("description"))
                                .and_then(|d| d.as_str())
                                .unwrap_or(&agent_id)
                                .to_string();
                            let _ = upsert_telegram_channel_entry(
                                &config_path, &agent_id, &agent_name, tok, uname,
                            );
                        }
                    }
                }
                HttpResponse::Ok().json(serde_json::json!({ "success": true }))
            } else {
                HttpResponse::Ok().json(serde_json::json!({
                    "success": false,
                    "message": "replaceManagedBotToken succeeded but returned no token"
                }))
            }
        }
        Err(e) => HttpResponse::Ok().json(serde_json::json!({ "success": false, "message": e })),
    }
}

// ── Statuses ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct TelegramAgentBotStatusEntry {
    agent_id: String,
    username: String,
    configured: bool,
}

/// Return provisioning status for all agent bots by reading openclaw.json.
#[get("/api/clawd/telegram/agent-bot/statuses")]
pub async fn telegram_get_agent_bot_statuses() -> impl Responder {
    let entries: Vec<TelegramAgentBotStatusEntry> = agent_bot_config_path()
        .and_then(|p| {
            let raw = std::fs::read_to_string(&p).ok()?;
            let cfg: serde_json::Value = serde_json::from_str(&raw).ok()?;
            let arr = cfg.pointer("/channels/telegram")?.as_array()?;
            Some(arr.iter().filter_map(|e| {
                let agent_id = e.get("agentId")?.as_str()?.to_string();
                let username = e.get("username")
                    .and_then(|u| u.as_str())
                    .unwrap_or("")
                    .to_string();
                let configured = e.get("token")
                    .and_then(|t| t.as_str())
                    .map(|t| !t.is_empty())
                    .unwrap_or(false);
                Some(TelegramAgentBotStatusEntry { agent_id, username, configured })
            }).collect())
        })
        .unwrap_or_default();

    HttpResponse::Ok().json(entries)
}
