use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::Duration;

use crate::clawd::gateway_client;
use crate::clawd::sidecar::SharedClawdbotConfig;

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

/// Build a config.patch JSON string for enabling a channel.
///
/// If `agents.defaults.model` is not already set, the patch includes it so
/// that the auto-reply agent can actually generate responses.
fn build_enable_patch(channel_patch: &str, snapshot: &serde_json::Value) -> String {
    if has_default_model(snapshot) {
        return channel_patch.to_string();
    }
    // Merge channel config with agents.defaults.model
    let model = resolve_default_model();
    let mut patch: serde_json::Value = serde_json::from_str(channel_patch).unwrap();
    patch
        .as_object_mut()
        .unwrap()
        .insert(
            "agents".to_string(),
            serde_json::json!({"defaults": {"model": model}}),
        );
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
            // - allowFrom ["*"] = accept messages from anyone
            // - dmPolicy "open" = auto-reply to all inbound DMs
            // Also ensures agents.defaults.model is set so auto-reply actually works.
            let patch = if body.enabled {
                build_enable_patch(
                    r#"{"channels": {"whatsapp": {"allowFrom": ["*"], "dmPolicy": "open"}}}"#,
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
            // - allowFrom ["*"] = accept messages from anyone
            // - dmPolicy "open" = auto-reply to all inbound DMs
            // - service "auto" = detect iMessage vs SMS automatically
            // Also ensures agents.defaults.model is set so auto-reply actually works.
            let patch = if body.enabled {
                build_enable_patch(
                    r#"{"channels": {"imessage": {"allowFrom": ["*"], "dmPolicy": "open", "service": "auto"}}}"#,
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
                    r#"{"channels": {"telegram": {"allowFrom": ["*"], "dmPolicy": "open"}}}"#,
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
                        "allowFrom": ["*"],
                        "dmPolicy": "open"
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
