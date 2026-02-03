use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::process::Command;

use crate::clawd::gateway_ws;
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

/// Helper to parse channel summary from gateway status response
/// The gateway returns channelSummary as an array of strings like:
/// ["WhatsApp: linked +1234567890", "iMessage: not configured", ...]
fn parse_channel_from_summary(status: &serde_json::Value, channel_name: &str) -> (bool, bool, bool) {
    let channel_summary = status
        .get("channelSummary")
        .and_then(|cs| cs.as_array());

    if let Some(lines) = channel_summary {
        for line in lines {
            if let Some(text) = line.as_str() {
                let lower = text.to_lowercase();
                if lower.starts_with(&channel_name.to_lowercase()) {
                    // Parse status from line like "WhatsApp: linked" or "iMessage: not configured"
                    let enabled = !lower.contains("disabled");
                    let linked = lower.contains("linked");
                    let configured = lower.contains("configured") && !lower.contains("not configured");
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
    match gateway_ws::get_channel_status(None).await {
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
    let config_result = gateway_ws::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            // Extract baseHash from snapshot
            let base_hash = config_snapshot
                .get("hash")
                .and_then(|h| h.as_str())
                .unwrap_or("");

            // Create patch to add/update whatsapp channel config
            // The schema expects the channel config directly, not nested under "default"
            let patch = if body.enabled {
                r#"{"channels": {"whatsapp": {}}}"#
            } else {
                // Setting to null removes the channel config, effectively disabling
                r#"{"channels": {"whatsapp": null}}"#
            };

            match gateway_ws::config_patch(patch, base_hash, None).await {
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

/// Start WhatsApp login flow
#[post("/api/clawd/channels/whatsapp/login")]
pub async fn whatsapp_login(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    // Trigger WhatsApp Web login via gateway
    // The channel is "whatsapp" per the clawdbot channel naming
    let params = serde_json::json!({
        "channelId": "whatsapp"
    });

    match gateway_ws::call_channel_method("channel.whatsapp.startLogin", Some(params), None).await {
        Ok(result) => {
            let success = result
                .get("success")
                .and_then(|s| s.as_bool())
                .unwrap_or(true); // Assume success if not explicitly false

            HttpResponse::Ok().json(GenericResponse {
                success,
                message: Some("WhatsApp login started. Check for QR code.".to_string()),
                configured: None,
                linked: Some(success),
            })
        }
        Err(e) => HttpResponse::Ok().json(GenericResponse {
            success: false,
            message: Some(format!("Login failed: {}", e)),
            configured: None,
            linked: None,
        }),
    }
}

/// Get iMessage channel status
#[get("/api/clawd/channels/imessage/status")]
pub async fn imessage_status(_cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
    match gateway_ws::get_channel_status(None).await {
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
    let config_result = gateway_ws::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            // Extract baseHash from snapshot
            let base_hash = config_snapshot
                .get("hash")
                .and_then(|h| h.as_str())
                .unwrap_or("");

            // Create patch to add/update imessage channel config
            // The schema expects the channel config directly, not nested under "default"
            let patch = if body.enabled {
                r#"{"channels": {"imessage": {}}}"#
            } else {
                // Setting to null removes the channel config, effectively disabling
                r#"{"channels": {"imessage": null}}"#
            };

            match gateway_ws::config_patch(patch, base_hash, None).await {
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
    match gateway_ws::get_channel_status(None).await {
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
    match gateway_ws::get_channel_status(None).await {
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
    let config_result = gateway_ws::config_get(None).await;

    match config_result {
        Ok(config_snapshot) => {
            // Extract baseHash from snapshot
            let base_hash = config_snapshot
                .get("hash")
                .and_then(|h| h.as_str())
                .unwrap_or("");

            // Voice calls are handled via plugins - create/remove plugin entry
            let patch = if body.enabled {
                r#"{"plugins": {"entries": {"voice-call": {}}}}"#
            } else {
                r#"{"plugins": {"entries": {"voice-call": null}}}"#
            };

            match gateway_ws::config_patch(patch, base_hash, None).await {
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
