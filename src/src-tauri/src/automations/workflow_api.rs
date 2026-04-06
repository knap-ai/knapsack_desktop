use actix_web::{delete, get, post, put, web, HttpResponse};
use chrono::Utc;
use serde::Deserialize;
use uuid::Uuid;

use crate::db::models::browser_workflow::BrowserWorkflow;
use crate::db::models::browser_workflow_run::BrowserWorkflowRun;

use super::workflow_executor;

#[derive(Deserialize)]
pub struct CreateWorkflowRequest {
    pub name: String,
    pub description: Option<String>,
    pub start_url: String,
    pub steps_json: String,
    pub browser_profile: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateWorkflowRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub start_url: Option<String>,
    pub steps_json: Option<String>,
    pub browser_profile: Option<String>,
    pub is_active: Option<bool>,
}

/// GET /api/knapsack/browser_workflows
#[get("/api/knapsack/browser_workflows")]
pub async fn get_workflows() -> HttpResponse {
    let workflows = BrowserWorkflow::find_all();
    HttpResponse::Ok().json(workflows)
}

/// GET /api/knapsack/browser_workflows/{uuid}
#[get("/api/knapsack/browser_workflows/{uuid}")]
pub async fn get_workflow(path: web::Path<String>) -> HttpResponse {
    let uuid = path.into_inner();
    match BrowserWorkflow::find_by_uuid(&uuid) {
        Ok(Some(workflow)) => HttpResponse::Ok().json(workflow),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({"error": "Workflow not found"})),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({"error": e.to_string()})),
    }
}

/// POST /api/knapsack/browser_workflows
#[post("/api/knapsack/browser_workflows")]
pub async fn create_workflow(body: web::Json<CreateWorkflowRequest>) -> HttpResponse {
    let now = Utc::now().timestamp();
    let mut workflow = BrowserWorkflow {
        id: None,
        uuid: Uuid::new_v4().to_string(),
        name: body.name.clone(),
        description: body.description.clone().unwrap_or_default(),
        start_url: body.start_url.clone(),
        steps_json: body.steps_json.clone(),
        browser_profile: body.browser_profile.clone().unwrap_or_else(|| "openclaw".to_string()),
        is_active: true,
        created_at: now,
        updated_at: now,
    };

    match workflow.create() {
        Ok(()) => HttpResponse::Ok().json(workflow),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({"error": format!("{:?}", e)})),
    }
}

/// PUT /api/knapsack/browser_workflows/{uuid}
#[put("/api/knapsack/browser_workflows/{uuid}")]
pub async fn update_workflow(
    path: web::Path<String>,
    body: web::Json<UpdateWorkflowRequest>,
) -> HttpResponse {
    let uuid = path.into_inner();
    let existing = match BrowserWorkflow::find_by_uuid(&uuid) {
        Ok(Some(w)) => w,
        Ok(None) => return HttpResponse::NotFound().json(serde_json::json!({"error": "Not found"})),
        Err(e) => return HttpResponse::InternalServerError().json(serde_json::json!({"error": e.to_string()})),
    };

    let updated = BrowserWorkflow {
        id: existing.id,
        uuid: existing.uuid,
        name: body.name.clone().unwrap_or(existing.name),
        description: body.description.clone().unwrap_or(existing.description),
        start_url: body.start_url.clone().unwrap_or(existing.start_url),
        steps_json: body.steps_json.clone().unwrap_or(existing.steps_json),
        browser_profile: body.browser_profile.clone().unwrap_or(existing.browser_profile),
        is_active: body.is_active.unwrap_or(existing.is_active),
        created_at: existing.created_at,
        updated_at: Utc::now().timestamp(),
    };

    match updated.update() {
        Ok(()) => HttpResponse::Ok().json(updated),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({"error": format!("{:?}", e)})),
    }
}

/// DELETE /api/knapsack/browser_workflows/{id}
#[delete("/api/knapsack/browser_workflows/{id}")]
pub async fn delete_workflow(path: web::Path<u64>) -> HttpResponse {
    let id = path.into_inner();
    match BrowserWorkflow::delete(id) {
        Ok(()) => HttpResponse::Ok().json(serde_json::json!({"deleted": true})),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({"error": format!("{:?}", e)})),
    }
}

/// POST /api/knapsack/browser_workflows/{uuid}/execute
/// Execute a workflow (hybrid: literal replay first, LLM fallback on failure)
#[post("/api/knapsack/browser_workflows/{uuid}/execute")]
pub async fn execute_workflow(path: web::Path<String>) -> HttpResponse {
    let uuid = path.into_inner();
    let workflow = match BrowserWorkflow::find_by_uuid(&uuid) {
        Ok(Some(w)) => w,
        Ok(None) => return HttpResponse::NotFound().json(serde_json::json!({"error": "Workflow not found"})),
        Err(e) => return HttpResponse::InternalServerError().json(serde_json::json!({"error": e.to_string()})),
    };

    let now = Utc::now().timestamp();
    let mut run = BrowserWorkflowRun {
        id: None,
        workflow_uuid: workflow.uuid.clone(),
        automation_run_id: None,
        status: "running".to_string(),
        started_at: Some(now),
        completed_at: None,
        result_json: None,
        error_message: None,
        screenshot_path: None,
    };
    if let Err(e) = run.create() {
        return HttpResponse::InternalServerError().json(serde_json::json!({"error": format!("{:?}", e)}));
    }

    match workflow_executor::execute_workflow(&workflow).await {
        Ok(result) => {
            run.status = "completed".to_string();
            run.completed_at = Some(Utc::now().timestamp());
            run.result_json = Some(serde_json::to_string(&result).unwrap_or_default());
            let _ = run.update();
            HttpResponse::Ok().json(serde_json::json!({
                "run": run,
                "result": result,
            }))
        }
        Err(e) => {
            run.status = "failed".to_string();
            run.completed_at = Some(Utc::now().timestamp());
            run.error_message = Some(format!("{:?}", e));
            let _ = run.update();
            HttpResponse::InternalServerError().json(serde_json::json!({
                "run": run,
                "error": format!("{:?}", e),
            }))
        }
    }
}

/// GET /api/knapsack/browser_workflows/{uuid}/runs
#[get("/api/knapsack/browser_workflows/{uuid}/runs")]
pub async fn get_workflow_runs(path: web::Path<String>) -> HttpResponse {
    let uuid = path.into_inner();
    let runs = BrowserWorkflowRun::find_by_workflow_uuid(&uuid);
    HttpResponse::Ok().json(runs)
}
