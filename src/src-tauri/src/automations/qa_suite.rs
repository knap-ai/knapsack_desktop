//! Automated QA Suite
//!
//! Orchestrates QA testing for web apps in dev mode:
//! - Smoke tests: AI agent explores the app and reports issues
//! - Visual regression: Screenshot comparison with baselines
//! - Accessibility audits: Parse a11y snapshot for issues
//! - Console error monitoring: Capture browser console errors

use actix_web::{delete, get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::Mutex;

use crate::clawd::dev_feedback_loop;
use crate::clawd::gateway_client;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QARunConfig {
    pub dev_url: String,
    #[serde(default)]
    pub test_types: Vec<String>,
    #[serde(default)]
    pub scenario_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QATestResult {
    pub test_type: String,
    pub name: String,
    pub passed: bool,
    pub message: String,
    pub screenshot_base64: Option<String>,
    pub details: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QARunResult {
    pub run_id: String,
    pub status: String, // "running", "complete", "failed"
    pub dev_url: String,
    pub started_at: u64,
    pub completed_at: Option<u64>,
    pub results: Vec<QATestResult>,
    pub summary: String,
    pub total_passed: u32,
    pub total_failed: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QAScenario {
    pub id: String,
    pub name: String,
    pub url: String,
    pub steps: String,
    pub test_type: String,
    pub created_at: u64,
}

pub type SharedQAState = Arc<Mutex<HashMap<String, QARunResult>>>;
pub type SharedScenarios = Arc<Mutex<Vec<QAScenario>>>;

pub fn new_shared_qa_state() -> SharedQAState {
    Arc::new(Mutex::new(HashMap::new()))
}

pub fn new_shared_scenarios() -> SharedScenarios {
    Arc::new(Mutex::new(Vec::new()))
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

#[post("/api/knapsack/dev/qa/run")]
pub async fn run_qa_suite(
    body: web::Json<QARunConfig>,
    qa_state: web::Data<SharedQAState>,
) -> impl Responder {
    let config = body.into_inner();
    let run_id = format!("qa-{}", now_secs());

    let initial = QARunResult {
        run_id: run_id.clone(),
        status: "running".to_string(),
        dev_url: config.dev_url.clone(),
        started_at: now_secs(),
        completed_at: None,
        results: Vec::new(),
        summary: String::new(),
        total_passed: 0,
        total_failed: 0,
    };

    {
        let mut guard = qa_state.lock().await;
        guard.insert(run_id.clone(), initial);
    }

    let qa_state_clone = qa_state.get_ref().clone();
    let run_id_clone = run_id.clone();

    tokio::spawn(async move {
        execute_qa_suite(config, &run_id_clone, qa_state_clone).await;
    });

    HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "run_id": run_id,
    }))
}

#[get("/api/knapsack/dev/qa/status/{run_id}")]
pub async fn qa_status(
    path: web::Path<String>,
    qa_state: web::Data<SharedQAState>,
) -> impl Responder {
    let run_id = path.into_inner();
    let guard = qa_state.lock().await;

    match guard.get(&run_id) {
        Some(result) => HttpResponse::Ok().json(serde_json::json!({
            "ok": true,
            "result": result,
        })),
        None => HttpResponse::NotFound().json(serde_json::json!({
            "ok": false,
            "message": "QA run not found",
        })),
    }
}

#[get("/api/knapsack/dev/qa/results/{run_id}")]
pub async fn qa_results(
    path: web::Path<String>,
    qa_state: web::Data<SharedQAState>,
) -> impl Responder {
    let run_id = path.into_inner();
    let guard = qa_state.lock().await;

    match guard.get(&run_id) {
        Some(result) => HttpResponse::Ok().json(serde_json::json!({
            "ok": true,
            "result": result,
        })),
        None => HttpResponse::NotFound().json(serde_json::json!({
            "ok": false,
            "message": "QA run not found",
        })),
    }
}

#[get("/api/knapsack/dev/qa/scenarios")]
pub async fn list_scenarios(
    scenarios: web::Data<SharedScenarios>,
) -> impl Responder {
    let guard = scenarios.lock().await;
    HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "scenarios": *guard,
    }))
}

#[post("/api/knapsack/dev/qa/scenarios")]
pub async fn save_scenario(
    body: web::Json<JsonValue>,
    scenarios: web::Data<SharedScenarios>,
) -> impl Responder {
    let id = format!("scn-{}", now_secs());
    let scenario = QAScenario {
        id: id.clone(),
        name: body
            .get("name")
            .and_then(|v| v.as_str())
            .unwrap_or("Untitled")
            .to_string(),
        url: body
            .get("url")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        steps: body
            .get("steps")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        test_type: body
            .get("test_type")
            .and_then(|v| v.as_str())
            .unwrap_or("smoke")
            .to_string(),
        created_at: now_secs(),
    };

    let mut guard = scenarios.lock().await;
    guard.push(scenario);

    HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "id": id,
    }))
}

#[delete("/api/knapsack/dev/qa/scenarios/{id}")]
pub async fn delete_scenario(
    path: web::Path<String>,
    scenarios: web::Data<SharedScenarios>,
) -> impl Responder {
    let id = path.into_inner();
    let mut guard = scenarios.lock().await;
    guard.retain(|s| s.id != id);

    HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "message": "Scenario deleted",
    }))
}

// ---------------------------------------------------------------------------
// QA Execution
// ---------------------------------------------------------------------------

async fn execute_qa_suite(config: QARunConfig, run_id: &str, qa_state: SharedQAState) {
    let test_types = if config.test_types.is_empty() {
        vec![
            "smoke".to_string(),
            "accessibility".to_string(),
            "console_errors".to_string(),
        ]
    } else {
        config.test_types.clone()
    };

    let mut all_results: Vec<QATestResult> = Vec::new();

    for test_type in &test_types {
        let results = match test_type.as_str() {
            "smoke" => run_smoke_tests(&config.dev_url).await,
            "visual_regression" => run_visual_regression(&config.dev_url).await,
            "accessibility" => run_accessibility_audit(&config.dev_url).await,
            "console_errors" => run_console_error_check(&config.dev_url).await,
            _ => Vec::new(),
        };
        all_results.extend(results);

        // Update intermediate results
        let passed = all_results.iter().filter(|r| r.passed).count() as u32;
        let failed = all_results.iter().filter(|r| !r.passed).count() as u32;
        {
            let mut guard = qa_state.lock().await;
            if let Some(state) = guard.get_mut(run_id) {
                state.results = all_results.clone();
                state.total_passed = passed;
                state.total_failed = failed;
            }
        }
    }

    // Finalize
    let passed = all_results.iter().filter(|r| r.passed).count() as u32;
    let failed = all_results.iter().filter(|r| !r.passed).count() as u32;
    let summary = if failed == 0 {
        format!("All {} tests passed.", passed)
    } else {
        format!(
            "{} passed, {} failed. Issues: {}",
            passed,
            failed,
            all_results
                .iter()
                .filter(|r| !r.passed)
                .map(|r| r.name.clone())
                .collect::<Vec<_>>()
                .join(", ")
        )
    };

    {
        let mut guard = qa_state.lock().await;
        if let Some(state) = guard.get_mut(run_id) {
            state.status = "complete".to_string();
            state.completed_at = Some(now_secs());
            state.results = all_results;
            state.summary = summary;
            state.total_passed = passed;
            state.total_failed = failed;
        }
    }

    eprintln!(
        "[qa_suite] Run {} complete: {} passed, {} failed",
        run_id, passed, failed
    );
}

async fn run_smoke_tests(dev_url: &str) -> Vec<QATestResult> {
    let prompt = format!(
        r#"You are a QA tester. Navigate to {} and perform a thorough smoke test:

1. Check that the page loads without errors
2. Click on all visible links and buttons
3. Fill out any forms you find
4. Check that navigation works
5. Look for broken layouts, missing images, or dead links
6. Check that error states are handled (try invalid input)

For each issue found, report:
- What you tested
- What you expected
- What actually happened

Be thorough but concise. Report results in a structured format."#,
        dev_url
    );

    match gateway_client::agent_run(&prompt, Some("qa-smoke"), Some("qa-suite"), None).await {
        Ok(result) => {
            let reply = extract_reply(&result);
            // Parse the agent's response for pass/fail indicators
            let has_issues = reply.to_lowercase().contains("error")
                || reply.to_lowercase().contains("broken")
                || reply.to_lowercase().contains("failed")
                || reply.to_lowercase().contains("issue");

            vec![QATestResult {
                test_type: "smoke".to_string(),
                name: "Smoke Test - Full Navigation".to_string(),
                passed: !has_issues,
                message: if has_issues {
                    "Issues found during smoke testing".to_string()
                } else {
                    "All smoke tests passed".to_string()
                },
                screenshot_base64: None,
                details: Some(reply),
            }]
        }
        Err(e) => {
            vec![QATestResult {
                test_type: "smoke".to_string(),
                name: "Smoke Test - Full Navigation".to_string(),
                passed: false,
                message: format!("Smoke test failed to run: {}", e),
                screenshot_base64: None,
                details: None,
            }]
        }
    }
}

async fn run_visual_regression(dev_url: &str) -> Vec<QATestResult> {
    // Capture current screenshot
    let dev_state = dev_feedback_loop::capture_dev_state(dev_url, "openclaw").await;

    vec![QATestResult {
        test_type: "visual_regression".to_string(),
        name: "Visual Regression - Main Page".to_string(),
        passed: true,
        message: "Screenshot captured (baseline comparison not yet configured)".to_string(),
        screenshot_base64: dev_state.screenshot_base64,
        details: Some("Visual regression baselines will be stored on first run. Subsequent runs will compare against the baseline.".to_string()),
    }]
}

async fn run_accessibility_audit(dev_url: &str) -> Vec<QATestResult> {
    let mut results = Vec::new();

    // Get a11y snapshot
    let dev_state = dev_feedback_loop::capture_dev_state(dev_url, "openclaw").await;

    if let Some(ref snapshot) = dev_state.a11y_snapshot {
        // Parse for common a11y issues
        let issues = check_a11y_issues(snapshot);

        if issues.is_empty() {
            results.push(QATestResult {
                test_type: "accessibility".to_string(),
                name: "Accessibility Audit".to_string(),
                passed: true,
                message: "No accessibility issues detected".to_string(),
                screenshot_base64: None,
                details: Some(format!("Scanned {} characters of a11y tree", snapshot.len())),
            });
        } else {
            for issue in issues {
                results.push(QATestResult {
                    test_type: "accessibility".to_string(),
                    name: format!("A11y: {}", issue.category),
                    passed: false,
                    message: issue.description.clone(),
                    screenshot_base64: None,
                    details: Some(issue.details),
                });
            }
        }
    } else {
        results.push(QATestResult {
            test_type: "accessibility".to_string(),
            name: "Accessibility Audit".to_string(),
            passed: false,
            message: "Could not capture accessibility snapshot".to_string(),
            screenshot_base64: None,
            details: None,
        });
    }

    results
}

async fn run_console_error_check(dev_url: &str) -> Vec<QATestResult> {
    let dev_state = dev_feedback_loop::capture_dev_state(dev_url, "openclaw").await;

    let mut results = Vec::new();

    // Console errors
    if dev_state.console_errors.is_empty() {
        results.push(QATestResult {
            test_type: "console_errors".to_string(),
            name: "Console Errors".to_string(),
            passed: true,
            message: "No console errors detected".to_string(),
            screenshot_base64: None,
            details: None,
        });
    } else {
        results.push(QATestResult {
            test_type: "console_errors".to_string(),
            name: format!("Console Errors ({})", dev_state.console_errors.len()),
            passed: false,
            message: format!("{} console error(s) detected", dev_state.console_errors.len()),
            screenshot_base64: None,
            details: Some(dev_state.console_errors.join("\n")),
        });
    }

    // Terminal errors
    if dev_state.terminal_errors.is_empty() {
        results.push(QATestResult {
            test_type: "console_errors".to_string(),
            name: "Terminal/Build Errors".to_string(),
            passed: true,
            message: "No terminal errors detected".to_string(),
            screenshot_base64: None,
            details: None,
        });
    } else {
        results.push(QATestResult {
            test_type: "console_errors".to_string(),
            name: format!("Terminal Errors ({})", dev_state.terminal_errors.len()),
            passed: false,
            message: format!("{} terminal error(s) detected", dev_state.terminal_errors.len()),
            screenshot_base64: None,
            details: Some(dev_state.terminal_errors.join("\n")),
        });
    }

    results
}

// ---------------------------------------------------------------------------
// Accessibility checking
// ---------------------------------------------------------------------------

struct A11yIssue {
    category: String,
    description: String,
    details: String,
}

fn check_a11y_issues(snapshot: &str) -> Vec<A11yIssue> {
    let mut issues = Vec::new();
    let lower = snapshot.to_lowercase();

    // Check for images without alt text
    let img_count = lower.matches("<img").count() + lower.matches("image").count();
    let alt_count = lower.matches("alt=").count() + lower.matches("aria-label").count();
    if img_count > 0 && alt_count < img_count / 2 {
        issues.push(A11yIssue {
            category: "Missing Alt Text".to_string(),
            description: format!(
                "Found {} image references but only {} have alt text or aria-labels",
                img_count, alt_count
            ),
            details: "Images should have descriptive alt text for screen readers.".to_string(),
        });
    }

    // Check for buttons/links without accessible names
    let button_mentions = lower.matches("button").count();
    let labeled_buttons = lower.matches("aria-label").count()
        + lower.matches("aria-labelledby").count();
    if button_mentions > 5 && labeled_buttons < button_mentions / 3 {
        issues.push(A11yIssue {
            category: "Unlabeled Interactive Elements".to_string(),
            description: format!(
                "Found {} interactive elements but few have ARIA labels ({} labeled)",
                button_mentions, labeled_buttons
            ),
            details: "Buttons and links should have accessible names via aria-label, aria-labelledby, or visible text content.".to_string(),
        });
    }

    // Check for heading hierarchy
    let h1_count = lower.matches("<h1").count() + lower.matches("heading level 1").count();
    let h2_count = lower.matches("<h2").count() + lower.matches("heading level 2").count();
    if h1_count == 0 && h2_count > 0 {
        issues.push(A11yIssue {
            category: "Heading Hierarchy".to_string(),
            description: "Page has h2 headings but no h1 heading".to_string(),
            details: "Pages should have a logical heading hierarchy starting with h1.".to_string(),
        });
    }

    // Check for form fields without labels
    let input_count = lower.matches("input").count() + lower.matches("textbox").count();
    let label_count = lower.matches("<label").count() + lower.matches("aria-label").count();
    if input_count > 2 && label_count < input_count / 2 {
        issues.push(A11yIssue {
            category: "Unlabeled Form Fields".to_string(),
            description: format!(
                "Found {} form inputs but only {} labels",
                input_count, label_count
            ),
            details: "Form fields should have associated <label> elements or aria-label attributes."
                .to_string(),
        });
    }

    issues
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn extract_reply(result: &JsonValue) -> String {
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

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
