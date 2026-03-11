use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::Duration;

use crate::clawd::gateway_client;
use crate::clawd::sidecar::SharedClawdbotConfig;

/// Quick check: is the gateway port listening?  If not, return a fast error
/// response instead of blocking for 10+ seconds on WebSocket connection attempts.
async fn gateway_or_bail() -> Option<HttpResponse> {
    if !gateway_client::is_gateway_port_open().await {
        Some(HttpResponse::Ok().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: Some(false),
            provider: None,
            message: Some("Gateway not reachable".to_string()),
            account: None,
        }))
    } else {
        None
    }
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
fn resolve_default_model() -> &'static str {
    if std::env::var("ANTHROPIC_API_KEY")
        .map(|k| !k.trim().is_empty())
        .unwrap_or(false)
    {
        return "anthropic/claude-opus-4-6";
    }
    if std::env::var("OPENAI_API_KEY")
        .map(|k| !k.trim().is_empty())
        .unwrap_or(false)
    {
        return "openai/gpt-4o";
    }
    if std::env::var("GROQ_API_KEY")
        .map(|k| !k.trim().is_empty())
        .unwrap_or(false)
    {
        return "groq/llama-3.3-70b-versatile";
    }
    if std::env::var("GEMINI_API_KEY")
        .map(|k| !k.trim().is_empty())
        .unwrap_or(false)
    {
        return "google/gemini-2.0-flash";
    }
    // Fallback — matches the gateway's compiled default
    "anthropic/claude-opus-4-6"
}

/// Check whether `browser.enabled` is already true in the config snapshot.
fn has_browser_enabled(snapshot: &serde_json::Value) -> bool {
    let config = snapshot.get("config").unwrap_or(snapshot);
    config
        .pointer("/browser/enabled")
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
}

/// Build a config.patch JSON string for enabling a channel.
///
/// If `agents.defaults.model` is not already set, the patch includes it so
/// that the auto-reply agent can actually generate responses.
///
/// Also ensures `browser.enabled` is true so the auto-reply agent can use
/// browser automation (e.g. "check my email" from Telegram).
fn build_enable_patch(channel_patch: &str, snapshot: &serde_json::Value) -> String {
    let needs_model = !has_default_model(snapshot);
    let needs_browser = !has_browser_enabled(snapshot);

    if !needs_model && !needs_browser {
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
                let lower = text.to_lowercase();
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
            let lower = text.to_lowercase();
            if lower.starts_with(&prefix) {
                // Find a token starting with '+' and containing digits
                for token in text.split_whitespace() {
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
                    r#"{"channels": {"telegram": {"dmPolicy": "allowlist"}}}"#,
                    &config_snapshot,
                )
            } else {
                r#"{"channels": {"telegram": null}}"#.to_string()
            };

            match gateway_client::config_patch(&patch, &base_hash, None).await {
                Ok(_) => HttpResponse::Ok().json(GenericResponse {
                    success: true,
                    message: Some(if body.enabled {
                        "Telegram enabled".to_string()
                    } else {
                        "Telegram disabled".to_string()
                    }),
                    configured: None,
                    linked: None,
                }),
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

    let config_result = gateway_client::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);

            let patch_value = serde_json::json!({
                "channels": {
                    "telegram": {
                        "botToken": token,
                        "dmPolicy": "allowlist"
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

    // Step 1: Ask the gateway to logout the WhatsApp account (clears
    // Baileys auth directory and stops the monitor).
    let logout_params = serde_json::json!({
        "channel": "whatsapp",
        "accountId": account_id,
    });
    if let Err(e) = gateway_client::call_channel_method(
        "channel.logout",
        Some(logout_params),
        None,
    )
    .await
    {
        eprintln!("[channels] channel.logout(whatsapp) failed: {}", e);
        // Continue to config removal even if logout RPC fails — the user
        // still wants the channel removed from config.
    }

    // Step 2: Remove WhatsApp from the gateway config.
    let config_result = gateway_client::config_get(None).await;
    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);
            let patch = r#"{"channels": {"whatsapp": null}}"#;
            match gateway_client::config_patch(patch, &base_hash, None).await {
                Ok(_) => {
                    // Invalidate pooled connection — the gateway may restart
                    // after config.patch, so next request needs a fresh conn.
                    gateway_client::invalidate();
                    HttpResponse::Ok().json(GenericResponse {
                        success: true,
                        message: Some("WhatsApp disconnected".to_string()),
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

    let logout_params = serde_json::json!({
        "channel": "telegram",
        "accountId": account_id,
    });
    if let Err(e) = gateway_client::call_channel_method(
        "channel.logout",
        Some(logout_params),
        None,
    )
    .await
    {
        eprintln!("[channels] channel.logout(telegram) failed: {}", e);
    }

    let config_result = gateway_client::config_get(None).await;
    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);
            let patch = r#"{"channels": {"telegram": null}}"#;
            match gateway_client::config_patch(patch, &base_hash, None).await {
                Ok(_) => {
                    gateway_client::invalidate();
                    HttpResponse::Ok().json(GenericResponse {
                        success: true,
                        message: Some("Telegram disconnected".to_string()),
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

/// Disconnect iMessage: removes channel from config.
/// (iMessage doesn't have a separate logout flow — it's system-level.)
#[post("/api/clawd/channels/imessage/disconnect")]
pub async fn imessage_disconnect(
    _cfg: web::Data<SharedClawdbotConfig>,
) -> impl Responder {
    let config_result = gateway_client::config_get(None).await;
    match config_result {
        Ok(config_snapshot) => {
            let base_hash = extract_base_hash(&config_snapshot);
            let patch = r#"{"channels": {"imessage": null}}"#;
            match gateway_client::config_patch(patch, &base_hash, None).await {
                Ok(_) => {
                    gateway_client::invalidate();
                    HttpResponse::Ok().json(GenericResponse {
                        success: true,
                        message: Some("iMessage disconnected".to_string()),
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
    let home = std::env::var("HOME").unwrap_or_default();
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

    // Extract to ~/.config/openclaw/tools/signal-cli/<version>
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
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
