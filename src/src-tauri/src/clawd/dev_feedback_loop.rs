//! Live Dev Feedback Loop Engine
//!
//! Core engine for the "1 engineer = 10" developer mode enhancement.
//! Implements the write → run → capture → evaluate → fix cycle:
//!
//! 1. Agent writes code via `agent_run`
//! 2. Dev server hot-reloads
//! 3. System captures: screenshot, console errors, terminal output, a11y snapshot
//! 4. Evaluates for errors
//! 5. If errors found → feeds back into agent for self-correction
//! 6. Repeats until clean or max iterations reached

use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::Mutex;

use crate::clawd::gateway_client;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevState {
    pub screenshot_base64: Option<String>,
    pub console_errors: Vec<String>,
    pub terminal_errors: Vec<String>,
    pub a11y_snapshot: Option<String>,
    pub page_title: Option<String>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackResult {
    pub has_errors: bool,
    pub feedback_prompt: String,
    pub severity: FeedbackSeverity,
    pub error_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedbackSeverity {
    None,
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoopIteration {
    pub iteration: u32,
    pub max_iterations: u32,
    pub agent_reply: String,
    pub dev_state: DevState,
    pub feedback: FeedbackResult,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackLoopResult {
    pub success: bool,
    pub iterations_used: u32,
    pub max_iterations: u32,
    pub final_agent_reply: String,
    pub final_dev_state: DevState,
    pub iteration_history: Vec<LoopIteration>,
    pub remaining_errors: Vec<String>,
}

/// In-progress state for a running feedback loop, polled by the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackLoopStatus {
    pub run_id: String,
    pub status: LoopStatus,
    pub current_iteration: u32,
    pub max_iterations: u32,
    pub last_feedback: Option<String>,
    pub last_screenshot_base64: Option<String>,
    pub error_count: usize,
    pub agent_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LoopStatus {
    Running,
    Success,
    MaxIterationsReached,
    Failed,
    Cancelled,
}

/// Shared state for all active feedback loops, keyed by run_id.
pub type SharedLoopState = Arc<Mutex<std::collections::HashMap<String, FeedbackLoopStatus>>>;

/// Create a new shared state instance (call once at server startup).
pub fn new_shared_state() -> SharedLoopState {
    Arc::new(Mutex::new(std::collections::HashMap::new()))
}

// ---------------------------------------------------------------------------
// Capture
// ---------------------------------------------------------------------------

/// Capture the current state of a dev server by querying the browser control
/// APIs through the gateway.
pub async fn capture_dev_state(dev_url: &str, profile: &str) -> DevState {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let query = serde_json::json!({"profile": profile});

    // Navigate to the dev URL first (ensures the page is loaded)
    let _ = gateway_client::browser_request(
        "POST",
        "/navigate",
        Some(query.clone()),
        Some(serde_json::json!({"url": dev_url})),
        None,
    )
    .await;

    // Wait for hot-reload to settle
    tokio::time::sleep(Duration::from_secs(2)).await;

    // Capture screenshot
    let screenshot_base64 = match gateway_client::browser_request(
        "GET",
        "/screenshot",
        Some(query.clone()),
        None,
        None,
    )
    .await
    {
        Ok(val) => val
            .get("base64")
            .or_else(|| val.get("screenshot"))
            .or_else(|| val.get("data"))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .or_else(|| {
                if val.is_string() {
                    Some(val.as_str().unwrap().to_string())
                } else {
                    None
                }
            }),
        Err(e) => {
            eprintln!("[dev_feedback_loop] screenshot capture failed: {}", e);
            None
        }
    };

    // Capture console errors
    let console_errors = match gateway_client::browser_request(
        "GET",
        "/console",
        Some(serde_json::json!({"profile": profile, "level": "error", "limit": 50})),
        None,
        None,
    )
    .await
    {
        Ok(val) => extract_console_errors(&val),
        Err(e) => {
            eprintln!("[dev_feedback_loop] console capture failed: {}", e);
            Vec::new()
        }
    };

    // Capture terminal output (look for error patterns)
    let terminal_errors = capture_terminal_errors();

    // Capture a11y snapshot
    let a11y_snapshot = match gateway_client::browser_request(
        "GET",
        "/snapshot",
        Some(serde_json::json!({"profile": profile, "format": "ai"})),
        None,
        None,
    )
    .await
    {
        Ok(val) => {
            if val.is_string() {
                Some(val.as_str().unwrap().to_string())
            } else {
                val.get("snapshot")
                    .or_else(|| val.get("text"))
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string())
                    .or_else(|| Some(val.to_string()))
            }
        }
        Err(e) => {
            eprintln!("[dev_feedback_loop] a11y snapshot failed: {}", e);
            None
        }
    };

    // Extract page title from snapshot if available
    let page_title = a11y_snapshot
        .as_ref()
        .and_then(|s| {
            // Try to extract title from the a11y tree text
            s.lines()
                .find(|line| line.contains("title:") || line.contains("Title:"))
                .map(|line| line.trim().to_string())
        });

    DevState {
        screenshot_base64,
        console_errors,
        terminal_errors,
        a11y_snapshot,
        page_title,
        timestamp: now,
    }
}

/// Read terminal output from PTY sessions and extract error lines.
fn capture_terminal_errors() -> Vec<String> {
    let output = crate::pty::read_terminal_output(None, 200);
    let mut errors = Vec::new();

    let error_pattern = regex::Regex::new(
        r"(?i)\b(error|panic|fatal|failed|exception|traceback|segfault|ECONNREFUSED|ENOENT|SyntaxError|TypeError|ReferenceError|cannot find module)\b"
    ).unwrap();

    let ignore_pattern = regex::Regex::new(
        r"(?i)\b(0 errors?|no errors?|error\.ts|errorHandling|error-boundary|error_log|loglevel)"
    ).unwrap();

    for (_session_id, lines) in &output {
        for line in lines {
            if error_pattern.is_match(line) && !ignore_pattern.is_match(line) {
                errors.push(line.clone());
            }
        }
    }

    // Limit to most recent errors
    if errors.len() > 20 {
        errors = errors.into_iter().rev().take(20).collect();
        errors.reverse();
    }

    errors
}

fn extract_console_errors(val: &JsonValue) -> Vec<String> {
    let mut errors = Vec::new();

    // Try entries array
    let entries = val
        .get("entries")
        .or_else(|| val.get("logs"))
        .and_then(|v| v.as_array());

    if let Some(entries) = entries {
        for entry in entries {
            let msg = entry
                .get("message")
                .or_else(|| entry.get("text"))
                .and_then(|v| v.as_str())
                .unwrap_or("");
            if !msg.is_empty() {
                errors.push(msg.to_string());
            }
        }
    }

    errors
}

// ---------------------------------------------------------------------------
// Evaluate
// ---------------------------------------------------------------------------

/// Evaluate captured dev state for errors and build a feedback prompt.
pub fn evaluate_dev_state(state: &DevState) -> FeedbackResult {
    let mut issues: Vec<String> = Vec::new();

    // Console errors
    if !state.console_errors.is_empty() {
        issues.push(format!(
            "BROWSER CONSOLE ERRORS ({}):\n{}",
            state.console_errors.len(),
            state
                .console_errors
                .iter()
                .enumerate()
                .map(|(i, e)| format!("  {}. {}", i + 1, truncate(e, 300)))
                .collect::<Vec<_>>()
                .join("\n")
        ));
    }

    // Terminal/build errors
    if !state.terminal_errors.is_empty() {
        issues.push(format!(
            "TERMINAL/BUILD ERRORS ({}):\n{}",
            state.terminal_errors.len(),
            state
                .terminal_errors
                .iter()
                .enumerate()
                .map(|(i, e)| format!("  {}. {}", i + 1, truncate(e, 300)))
                .collect::<Vec<_>>()
                .join("\n")
        ));
    }

    let error_count = state.console_errors.len() + state.terminal_errors.len();

    if issues.is_empty() {
        return FeedbackResult {
            has_errors: false,
            feedback_prompt: String::new(),
            severity: FeedbackSeverity::None,
            error_count: 0,
        };
    }

    let severity = match error_count {
        0 => FeedbackSeverity::None,
        1..=2 => FeedbackSeverity::Low,
        3..=5 => FeedbackSeverity::Medium,
        6..=10 => FeedbackSeverity::High,
        _ => FeedbackSeverity::Critical,
    };

    let feedback_prompt = format!(
        "After your last code changes, the following errors were detected on the running dev server:\n\n{}\n\nPlease fix these errors. Focus on the root cause — don't just suppress the errors.",
        issues.join("\n\n")
    );

    FeedbackResult {
        has_errors: true,
        feedback_prompt,
        severity,
        error_count,
    }
}

// ---------------------------------------------------------------------------
// Feedback Loop
// ---------------------------------------------------------------------------

/// Run the full feedback loop: agent_run → capture → evaluate → repeat.
///
/// `shared_state` is used to expose progress to the frontend via polling.
/// `on_iteration` is called after each iteration for custom handling.
pub async fn run_with_feedback(
    task_prompt: &str,
    dev_url: &str,
    agent_id: &str,
    channel: &str,
    max_iterations: u32,
    shared_state: Option<SharedLoopState>,
    run_id: &str,
) -> FeedbackLoopResult {
    let profile = "openclaw";
    let mut iteration_history: Vec<LoopIteration> = Vec::new();
    let mut accumulated_feedback = String::new();
    let mut last_agent_reply = String::new();
    let mut last_dev_state = DevState {
        screenshot_base64: None,
        console_errors: Vec::new(),
        terminal_errors: Vec::new(),
        a11y_snapshot: None,
        page_title: None,
        timestamp: 0,
    };

    for iteration in 1..=max_iterations {
        // Build the prompt: original task + accumulated feedback
        let full_prompt = if accumulated_feedback.is_empty() {
            task_prompt.to_string()
        } else {
            format!(
                "{}\n\n--- FEEDBACK FROM PREVIOUS ITERATION ({}/{}) ---\n\n{}",
                task_prompt,
                iteration - 1,
                max_iterations,
                accumulated_feedback
            )
        };

        // Update shared state
        if let Some(ref state) = shared_state {
            let mut guard = state.lock().await;
            guard.insert(
                run_id.to_string(),
                FeedbackLoopStatus {
                    run_id: run_id.to_string(),
                    status: LoopStatus::Running,
                    current_iteration: iteration,
                    max_iterations,
                    last_feedback: if accumulated_feedback.is_empty() {
                        None
                    } else {
                        Some(truncate(&accumulated_feedback, 500))
                    },
                    last_screenshot_base64: None,
                    error_count: 0,
                    agent_id: agent_id.to_string(),
                },
            );
        }

        eprintln!(
            "[dev_feedback_loop] Iteration {}/{} for agent '{}' (run: {})",
            iteration, max_iterations, agent_id, run_id
        );

        // 1. Run the agent
        let agent_reply = match gateway_client::agent_run(
            &full_prompt,
            Some(agent_id),
            Some(channel),
            None,
        )
        .await
        {
            Ok(result) => {
                // Extract reply text from gateway response
                result
                    .pointer("/result/payloads")
                    .and_then(|p| p.as_array())
                    .map(|payloads| {
                        payloads
                            .iter()
                            .filter_map(|p| p.get("text").and_then(|t| t.as_str()))
                            .collect::<Vec<_>>()
                            .join("\n\n")
                    })
                    .unwrap_or_else(|| {
                        result
                            .get("summary")
                            .and_then(|s| s.as_str())
                            .unwrap_or("(empty reply)")
                            .to_string()
                    })
            }
            Err(e) => {
                eprintln!(
                    "[dev_feedback_loop] agent_run failed on iteration {}: {}",
                    iteration, e
                );
                // Record failure and stop
                let dev_state = capture_dev_state(dev_url, profile).await;
                let loop_iter = LoopIteration {
                    iteration,
                    max_iterations,
                    agent_reply: format!("Agent error: {}", e),
                    dev_state: dev_state.clone(),
                    feedback: FeedbackResult {
                        has_errors: true,
                        feedback_prompt: format!("Agent failed: {}", e),
                        severity: FeedbackSeverity::Critical,
                        error_count: 1,
                    },
                    timestamp: now_secs(),
                };
                iteration_history.push(loop_iter);

                update_final_status(
                    &shared_state,
                    run_id,
                    LoopStatus::Failed,
                    iteration,
                    max_iterations,
                    agent_id,
                )
                .await;

                return FeedbackLoopResult {
                    success: false,
                    iterations_used: iteration,
                    max_iterations,
                    final_agent_reply: format!("Agent error: {}", e),
                    final_dev_state: dev_state,
                    iteration_history,
                    remaining_errors: vec![format!("Agent failed: {}", e)],
                };
            }
        };

        last_agent_reply = agent_reply.clone();

        // 2. Capture dev server state
        let dev_state = capture_dev_state(dev_url, profile).await;
        last_dev_state = dev_state.clone();

        // 3. Evaluate
        let feedback = evaluate_dev_state(&dev_state);

        // Update shared state with capture results
        if let Some(ref state) = shared_state {
            let mut guard = state.lock().await;
            if let Some(status) = guard.get_mut(run_id) {
                status.current_iteration = iteration;
                status.error_count = feedback.error_count;
                status.last_feedback = if feedback.has_errors {
                    Some(truncate(&feedback.feedback_prompt, 500))
                } else {
                    None
                };
                status.last_screenshot_base64 = dev_state.screenshot_base64.clone();
            }
        }

        // Record iteration
        let loop_iter = LoopIteration {
            iteration,
            max_iterations,
            agent_reply: truncate(&agent_reply, 2000),
            dev_state: DevState {
                // Don't store full screenshot in history to save memory
                screenshot_base64: None,
                ..dev_state.clone()
            },
            feedback: feedback.clone(),
            timestamp: now_secs(),
        };
        iteration_history.push(loop_iter);

        eprintln!(
            "[dev_feedback_loop] Iteration {}/{}: errors={}, severity={:?}",
            iteration, max_iterations, feedback.error_count, feedback.severity
        );

        // 4. If clean → done
        if !feedback.has_errors {
            eprintln!(
                "[dev_feedback_loop] Clean state after {} iteration(s) for agent '{}'",
                iteration, agent_id
            );

            update_final_status(
                &shared_state,
                run_id,
                LoopStatus::Success,
                iteration,
                max_iterations,
                agent_id,
            )
            .await;

            return FeedbackLoopResult {
                success: true,
                iterations_used: iteration,
                max_iterations,
                final_agent_reply: agent_reply,
                final_dev_state: dev_state,
                iteration_history,
                remaining_errors: Vec::new(),
            };
        }

        // 5. Append feedback for next iteration
        accumulated_feedback = feedback.feedback_prompt.clone();
    }

    // Max iterations reached
    eprintln!(
        "[dev_feedback_loop] Max iterations ({}) reached for agent '{}'. Remaining errors: {}",
        max_iterations,
        agent_id,
        last_dev_state.console_errors.len() + last_dev_state.terminal_errors.len()
    );

    update_final_status(
        &shared_state,
        run_id,
        LoopStatus::MaxIterationsReached,
        max_iterations,
        max_iterations,
        agent_id,
    )
    .await;

    let remaining: Vec<String> = last_dev_state
        .console_errors
        .iter()
        .chain(last_dev_state.terminal_errors.iter())
        .cloned()
        .collect();

    FeedbackLoopResult {
        success: false,
        iterations_used: max_iterations,
        max_iterations,
        final_agent_reply: last_agent_reply,
        final_dev_state: last_dev_state,
        iteration_history,
        remaining_errors: remaining,
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async fn update_final_status(
    shared_state: &Option<SharedLoopState>,
    run_id: &str,
    status: LoopStatus,
    iteration: u32,
    max_iterations: u32,
    agent_id: &str,
) {
    if let Some(ref state) = shared_state {
        let mut guard = state.lock().await;
        if let Some(s) = guard.get_mut(run_id) {
            s.status = status;
            s.current_iteration = iteration;
        } else {
            guard.insert(
                run_id.to_string(),
                FeedbackLoopStatus {
                    run_id: run_id.to_string(),
                    status,
                    current_iteration: iteration,
                    max_iterations,
                    last_feedback: None,
                    last_screenshot_base64: None,
                    error_count: 0,
                    agent_id: agent_id.to_string(),
                },
            );
        }
    }
}

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}…", &s[..max_len])
    }
}
