use actix_web::web::{Data, Json};
use serde_json::json;

use std::path::PathBuf;

use std::sync::{atomic::AtomicBool, Arc};
use tokio::sync::Mutex;

use actix_web::{post, HttpResponse};

use crate::llm::llama_binding::llm::LlamaBinding;
use crate::llm::types::LLMError;
use crate::llm::use_cases::complete::{handle_llm_complete, CompletionRequest};
use crate::llm::use_cases::stop::handle_stop_llm_execution;
use crate::memory::semantic::SemanticService;
use crate::server::actix::InferenceThreads;

#[post("/api/knapsack/llm_complete")]
async fn llm_complete(
  payload: Json<CompletionRequest>,
  llama_model: Data<Arc<Mutex<LlamaBinding>>>,
  //llm_path: Data<Arc<PathBuf>>,
  inference_threads: Data<InferenceThreads>,
  is_chatting: Data<Arc<Mutex<AtomicBool>>>,
  semantic_service: Data<Arc<Mutex<Option<SemanticService>>>>,
) -> HttpResponse {
  let response = handle_llm_complete(
    payload,
    llama_model.get_ref(),
    // llm_path.get_ref(),
    inference_threads.get_ref(),
    is_chatting.get_ref(),
    semantic_service.get_ref(),
  )
  .await;
  match response {
    Ok(stream) => HttpResponse::Ok()
      .append_header(("Content-Type", "text/event-stream"))
      .append_header(("Cache-Control", "no-cache"))
      .keep_alive()
      .streaming(stream),
    Err(error) => match error {
      LLMError::TooManyRequests(e) => {
        let message = format!("{}", e);
        HttpResponse::TooManyRequests()
          .json(json!({ "success": false, "error_code": "TOO_MANY_REQUESTS", "message": message
        }))
      },
      LLMError::ChatCompletionClientFailed(e) => {
        let message = format!("{}", e);
        HttpResponse::BadRequest()
        .json(json!({ "success": false, "error_code": "CHAT_COMPLETION_CLIENT_FAILED", "message": message }))
      },
      LLMError::ChatCompletionFailed(e) => {
        let message = format!("{}", e);
        HttpResponse::InternalServerError()
        .json(json!({ "success": false, "error_code": "CHAT_COMPLETION_FAILED", "message": message }))
      },
      e => {
        let message = format!("{}", e);
        HttpResponse::BadRequest()
        .json(json!({ "success": false, "error_code": "UNKNOWN_ERROR", "message": message }))}
        ,
    },
  }
}

#[post("/api/knapsack/stop_llm_execution")]
async fn stop_llm_execution(
  data: Data<InferenceThreads>,
  is_chatting: Data<Arc<Mutex<AtomicBool>>>,
) -> HttpResponse {
  handle_stop_llm_execution(data.get_ref(), is_chatting.get_ref()).await;
  HttpResponse::Ok().json(json!({ "success": true }))
}
