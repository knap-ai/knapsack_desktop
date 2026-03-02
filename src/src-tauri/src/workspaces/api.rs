use actix_web::{
    delete, get, post, put,
    web::{self, Json},
    HttpResponse, Responder,
};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::db::models::workspace::{Workspace, WorkspaceDocument};

// ── Request / Response types ──────────────────────────────────

#[derive(Deserialize)]
pub struct CreateWorkspaceRequest {
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateWorkspaceRequest {
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
}

#[derive(Deserialize)]
pub struct AddDocumentRequest {
    pub document_name: String,
    pub document_path: Option<String>,
    pub document_type: Option<String>,
    pub content_hash: Option<String>,
}

#[derive(Deserialize)]
pub struct WorkspaceSearchRequest {
    pub query: String,
    pub top: Option<usize>,
}

#[derive(Serialize)]
struct WorkspaceResponse {
    success: bool,
    data: Option<Workspace>,
    error: Option<String>,
}

#[derive(Serialize)]
struct WorkspacesListResponse {
    success: bool,
    data: Vec<Workspace>,
}

#[derive(Serialize)]
struct DocumentResponse {
    success: bool,
    data: Option<WorkspaceDocument>,
    error: Option<String>,
}

#[derive(Serialize)]
struct GenericResponse {
    success: bool,
    error: Option<String>,
}

#[derive(Serialize)]
struct SearchResultItem {
    pub id: String,
    pub score: f32,
    pub payload: serde_json::Value,
}

#[derive(Serialize)]
struct SearchResponse {
    success: bool,
    results: Vec<SearchResultItem>,
    error: Option<String>,
}

// ── Endpoints ─────────────────────────────────────────────────

#[post("/api/knapsack/workspaces")]
pub async fn create_workspace(payload: Json<CreateWorkspaceRequest>) -> impl Responder {
    match Workspace::create(
        payload.name.clone(),
        payload.description.clone(),
        payload.icon.clone(),
    ) {
        Ok(workspace) => HttpResponse::Ok().json(WorkspaceResponse {
            success: true,
            data: Some(workspace),
            error: None,
        }),
        Err(e) => HttpResponse::InternalServerError().json(WorkspaceResponse {
            success: false,
            data: None,
            error: Some(format!("{:?}", e)),
        }),
    }
}

#[get("/api/knapsack/workspaces")]
pub async fn list_workspaces() -> impl Responder {
    match Workspace::find_all_with_documents() {
        Ok(workspaces) => {
            HttpResponse::Ok().json(WorkspacesListResponse {
                success: true,
                data: workspaces,
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "error": format!("{:?}", e),
        })),
    }
}

#[get("/api/knapsack/workspaces/{uuid}")]
pub async fn get_workspace(path: web::Path<String>) -> impl Responder {
    let uuid = path.into_inner();
    match Workspace::find_by_uuid(uuid.clone()) {
        Ok(Some(mut workspace)) => {
            if let Ok(docs) = WorkspaceDocument::find_by_workspace(uuid) {
                workspace.documents = Some(docs);
            }
            HttpResponse::Ok().json(WorkspaceResponse {
                success: true,
                data: Some(workspace),
                error: None,
            })
        }
        Ok(None) => HttpResponse::NotFound().json(WorkspaceResponse {
            success: false,
            data: None,
            error: Some("Workspace not found".to_string()),
        }),
        Err(e) => HttpResponse::InternalServerError().json(WorkspaceResponse {
            success: false,
            data: None,
            error: Some(format!("{:?}", e)),
        }),
    }
}

#[put("/api/knapsack/workspaces/{uuid}")]
pub async fn update_workspace(
    path: web::Path<String>,
    payload: Json<UpdateWorkspaceRequest>,
) -> impl Responder {
    let uuid = path.into_inner();
    match Workspace::update(
        uuid.clone(),
        payload.name.clone(),
        payload.description.clone(),
        payload.icon.clone(),
    ) {
        Ok(()) => {
            match Workspace::find_by_uuid(uuid.clone()) {
                Ok(Some(mut workspace)) => {
                    if let Ok(docs) = WorkspaceDocument::find_by_workspace(uuid) {
                        workspace.documents = Some(docs);
                    }
                    HttpResponse::Ok().json(WorkspaceResponse {
                        success: true,
                        data: Some(workspace),
                        error: None,
                    })
                }
                _ => HttpResponse::Ok().json(GenericResponse {
                    success: true,
                    error: None,
                }),
            }
        }
        Err(e) => HttpResponse::InternalServerError().json(GenericResponse {
            success: false,
            error: Some(format!("{:?}", e)),
        }),
    }
}

#[delete("/api/knapsack/workspaces/{uuid}")]
pub async fn delete_workspace(path: web::Path<String>) -> impl Responder {
    let uuid = path.into_inner();
    match Workspace::delete(uuid) {
        Ok(()) => HttpResponse::Ok().json(GenericResponse {
            success: true,
            error: None,
        }),
        Err(e) => HttpResponse::InternalServerError().json(GenericResponse {
            success: false,
            error: Some(format!("{:?}", e)),
        }),
    }
}

#[post("/api/knapsack/workspaces/{uuid}/documents")]
pub async fn add_document(
    path: web::Path<String>,
    payload: Json<AddDocumentRequest>,
) -> impl Responder {
    let workspace_uuid = path.into_inner();

    // Verify workspace exists
    match Workspace::find_by_uuid(workspace_uuid.clone()) {
        Ok(None) => {
            return HttpResponse::NotFound().json(DocumentResponse {
                success: false,
                data: None,
                error: Some("Workspace not found".to_string()),
            });
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(DocumentResponse {
                success: false,
                data: None,
                error: Some(format!("{:?}", e)),
            });
        }
        _ => {}
    }

    match WorkspaceDocument::create(
        workspace_uuid,
        payload.document_name.clone(),
        payload.document_path.clone(),
        payload.document_type.clone(),
        payload.content_hash.clone(),
    ) {
        Ok(doc) => HttpResponse::Ok().json(DocumentResponse {
            success: true,
            data: Some(doc),
            error: None,
        }),
        Err(e) => HttpResponse::InternalServerError().json(DocumentResponse {
            success: false,
            data: None,
            error: Some(format!("{:?}", e)),
        }),
    }
}

#[derive(Deserialize)]
pub struct DocumentPath {
    uuid: String,
    doc_id: u64,
}

#[delete("/api/knapsack/workspaces/{uuid}/documents/{doc_id}")]
pub async fn remove_document(path: web::Path<DocumentPath>) -> impl Responder {
    let params = path.into_inner();
    match WorkspaceDocument::delete_scoped(params.doc_id, &params.uuid) {
        Ok(true) => HttpResponse::Ok().json(GenericResponse {
            success: true,
            error: None,
        }),
        Ok(false) => HttpResponse::NotFound().json(GenericResponse {
            success: false,
            error: Some("Document not found in this workspace".to_string()),
        }),
        Err(e) => HttpResponse::InternalServerError().json(GenericResponse {
            success: false,
            error: Some(format!("{:?}", e)),
        }),
    }
}

#[post("/api/knapsack/workspaces/{uuid}/search")]
pub async fn workspace_search(
    path: web::Path<String>,
    payload: Json<WorkspaceSearchRequest>,
) -> impl Responder {
    let workspace_uuid = path.into_inner();
    let _top = payload.top.unwrap_or(10);
    let _query = payload.query.clone();

    // Verify workspace exists
    match Workspace::find_by_uuid(workspace_uuid.clone()) {
        Ok(None) => {
            return HttpResponse::NotFound().json(SearchResponse {
                success: false,
                results: vec![],
                error: Some("Workspace not found".to_string()),
            });
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(SearchResponse {
                success: false,
                results: vec![],
                error: Some(format!("{:?}", e)),
            });
        }
        _ => {}
    }

    // Workspace-scoped semantic search.
    // When the embedding service is enabled, this would filter Qdrant results
    // by workspace_uuid in the payload metadata. For now, return an empty
    // result set since the embedding pipeline is currently disabled in the
    // codebase (see main.rs setup comments).
    //
    // When RAG is fully enabled, the filter would look like:
    //   json!({
    //       "must": [{
    //           "key": "workspace_uuid",
    //           "match": { "value": workspace_uuid }
    //       }]
    //   })

    HttpResponse::Ok().json(SearchResponse {
        success: true,
        results: vec![],
        error: None,
    })
}
