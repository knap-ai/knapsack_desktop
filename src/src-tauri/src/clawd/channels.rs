use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::Duration;

use crate::clawd::gateway_client;
use crate::clawd::sidecar::SharedClawdbotConfig;

/// Response for channel status
#[derive(Serialize)]
struct ChannelStatusResponse {
    success: bool,
    enabled: bool,
    configured: bool,
    linked: Option<bool>,
    provider: Option<String>,
    message: Option<String>,
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

/// Get WhatsApp channel status
#[get("/api/clawd/channels/whatsapp/status")]
pub async fn whatsapp_status(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    match gateway_client::get_channel_status(None).await {
        Ok(status) => {
            let (enabled, linked, _configured) = parse_channel_from_summary(&status, "WhatsApp");

            HttpResponse::Ok().json(ChannelStatusResponse {
                success: true,
                enabled,
                configured: linked,
                linked: Some(linked),
                provider: None,
                message: None,
            })
        }
        Err(e) => HttpResponse::Ok().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: Some(false),
            provider: None,
            message: Some(format!("Gateway error: {}", e)),
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
            // - groupPolicy "allowlist" = only join groups explicitly added
            let patch = if body.enabled {
                r#"{"channels": {"whatsapp": {"allowFrom": ["*"], "dmPolicy": "open"}}}"#
            } else {
                r#"{"channels": {"whatsapp": null}}"#
            };

            match gateway_client::config_patch(patch, &base_hash, None).await {
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
            })
        }
        Err(e) => HttpResponse::Ok().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: None,
            provider: None,
            message: Some(format!("Gateway error: {}", e)),
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
            let patch = if body.enabled {
                r#"{"channels": {"imessage": {"allowFrom": ["*"], "dmPolicy": "open", "service": "auto"}}}"#
            } else {
                r#"{"channels": {"imessage": null}}"#
            };

            match gateway_client::config_patch(patch, &base_hash, None).await {
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
            })
        }
        Err(e) => HttpResponse::Ok().json(ChannelStatusResponse {
            success: false,
            enabled: false,
            configured: false,
            linked: None,
            provider: None,
            message: Some(format!("Gateway error: {}", e)),
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
