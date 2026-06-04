use actix_web::{
  delete, get, post, put,
  web::{self, Json},
  HttpResponse, Responder,
};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::db::models::workspace::{Workspace, WorkspaceDocument};
use crate::library_curator::{self, settings::CuratorSettings};

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

#[derive(Deserialize)]
pub struct UpdateTagsRequest {
  pub tags: Vec<String>,
}

#[derive(Deserialize)]
pub struct SaveChatRequest {
  pub text: String,
  pub title: String,
  pub source_thread_id: Option<u64>,
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
    Ok(workspaces) => HttpResponse::Ok().json(WorkspacesListResponse {
      success: true,
      data: workspaces,
    }),
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
    Ok(()) => match Workspace::find_by_uuid(uuid.clone()) {
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
    },
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

// ── Tag Management ──────────────────────────────────────────────

#[put("/api/knapsack/workspaces/{uuid}/documents/{doc_id}/tags")]
pub async fn update_document_tags(
  path: web::Path<DocumentPath>,
  payload: Json<UpdateTagsRequest>,
) -> impl Responder {
  let params = path.into_inner();
  let tags_json = serde_json::to_string(&payload.tags).unwrap_or_default();
  match WorkspaceDocument::update_tags(params.doc_id, Some(tags_json)) {
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

// ── Save Chat to Workspace ──────────────────────────────────────

#[post("/api/knapsack/workspaces/{uuid}/documents/from-chat")]
pub async fn save_chat_to_workspace(
  path: web::Path<String>,
  payload: Json<SaveChatRequest>,
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

  // Save the chat output as a workspace document.
  // For now we store the text content inline via content_hash as a simple approach.
  // A future enhancement could write .md files to disk and embed them.
  match WorkspaceDocument::create(
    workspace_uuid,
    payload.title.clone(),
    None, // no file path — it's an in-memory chat output
    Some("chat_output".to_string()),
    Some(payload.text.clone()),
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

// ── Library Curator endpoints ───────────────────────────────────

#[derive(Serialize)]
struct CurationStatusResponse {
  success: bool,
  enabled: bool,
  sources_email: bool,
  sources_calendar: bool,
  sources_drive: bool,
  sources_local_files: bool,
  last_run_at: Option<i64>,
}

#[derive(Deserialize)]
pub struct UpdateCurationSettingsRequest {
  pub enabled: Option<bool>,
  pub sources_email: Option<bool>,
  pub sources_calendar: Option<bool>,
  pub sources_drive: Option<bool>,
  pub sources_local_files: Option<bool>,
}

#[derive(Deserialize, Default)]
pub struct WipeLibraryRequest {
  /// If true, also delete user-created (manual) collections.
  #[serde(default)]
  pub include_manual: bool,
}

#[derive(Serialize)]
struct WipeLibraryResponse {
  success: bool,
  deleted_auto: usize,
  deleted_manual: usize,
  error: Option<String>,
}

#[get("/api/knapsack/library/curation-status")]
pub async fn get_curation_status() -> impl Responder {
  let cfg = CuratorSettings::load();
  HttpResponse::Ok().json(CurationStatusResponse {
    success: true,
    enabled: cfg.enabled,
    sources_email: cfg.sources_email,
    sources_calendar: cfg.sources_calendar,
    sources_drive: cfg.sources_drive,
    sources_local_files: cfg.sources_local_files,
    last_run_at: cfg.last_run_at,
  })
}

#[put("/api/knapsack/library/settings")]
pub async fn update_curation_settings(
  payload: Json<UpdateCurationSettingsRequest>,
) -> impl Responder {
  let mut cfg = CuratorSettings::load();
  if let Some(v) = payload.enabled {
    cfg.enabled = v;
  }
  if let Some(v) = payload.sources_email {
    cfg.sources_email = v;
  }
  if let Some(v) = payload.sources_calendar {
    cfg.sources_calendar = v;
  }
  if let Some(v) = payload.sources_drive {
    cfg.sources_drive = v;
  }
  if let Some(v) = payload.sources_local_files {
    cfg.sources_local_files = v;
  }
  let _ = cfg.save();
  HttpResponse::Ok().json(CurationStatusResponse {
    success: true,
    enabled: cfg.enabled,
    sources_email: cfg.sources_email,
    sources_calendar: cfg.sources_calendar,
    sources_drive: cfg.sources_drive,
    sources_local_files: cfg.sources_local_files,
    last_run_at: cfg.last_run_at,
  })
}

#[post("/api/knapsack/library/curate-now")]
pub async fn curate_now() -> impl Responder {
  // Run on the actix worker — the curator is fast enough for an interactive
  // refresh button (cap is ~5k emails + ~hundreds of calendar events).
  match library_curator::run_curation_pass().await {
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

#[post("/api/knapsack/workspaces/{uuid}/promote")]
pub async fn promote_workspace(path: web::Path<String>) -> impl Responder {
  let uuid = path.into_inner();
  match Workspace::promote_to_manual(&uuid) {
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

#[delete("/api/knapsack/library/wipe")]
pub async fn wipe_library(payload: Json<WipeLibraryRequest>) -> impl Responder {
  let req = payload.into_inner();

  // Disable the curator so it doesn't immediately re-populate after wipe.
  let mut cfg = CuratorSettings::load();
  cfg.enabled = false;
  let _ = cfg.save();

  let deleted_auto = match Workspace::wipe_auto_curated() {
    Ok(n) => n,
    Err(e) => {
      return HttpResponse::InternalServerError().json(WipeLibraryResponse {
        success: false,
        deleted_auto: 0,
        deleted_manual: 0,
        error: Some(format!("{:?}", e)),
      });
    }
  };

  let mut deleted_manual = 0;
  if req.include_manual {
    if let Ok(workspaces) = Workspace::find_all() {
      for ws in workspaces {
        if ws.auto_curated.unwrap_or(0) == 0 {
          if Workspace::delete(ws.uuid).is_ok() {
            deleted_manual += 1;
          }
        }
      }
    }
  }

  HttpResponse::Ok().json(WipeLibraryResponse {
    success: true,
    deleted_auto,
    deleted_manual,
    error: None,
  })
}
