use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc, RwLock,
};
use tokio::sync::Mutex;

use actix_web::web::Bytes;
use flume::Sender;

use crate::llm::llama_binding::llm::LlamaBinding;
use crate::llm::llama_binding::prompt::ChatFormat;
use crate::llm::types::Message;
use crate::llm::use_cases::complete::{CompletionRequest, CompletionResponse};

pub struct InferenceThreadRequest {
  pub token_sender: Sender<Bytes>,
  pub abort_flag: Arc<RwLock<AtomicBool>>,

  pub llama_model: Arc<Mutex<LlamaBinding>>,
  pub completion_request: CompletionRequest,
  pub chat_format: ChatFormat,
  pub is_chatting: Arc<Mutex<AtomicBool>>,
  pub messages: Vec<Message>,
}

impl InferenceThreadRequest {
  pub fn is_aborted(&self) -> bool {
    let aborted_by_flag: bool = self
      .abort_flag
      .read()
      .unwrap()
      .load(Ordering::Relaxed)
      .into();
    let disconnected: bool = self.token_sender.is_disconnected();
    aborted_by_flag || disconnected
  }

  pub fn send_comment(&self, message: &str) {
    self
      .token_sender
      .send(Bytes::from(format!(": {} \n\n", message)))
      .unwrap();
  }

  pub fn send_event(&self, event_name: &str) {
    self
      .token_sender
      .send(Bytes::from(format!("event: {} \n\n", event_name)))
      .unwrap();
  }

  pub fn send_done(&self) {
    if self.token_sender.is_disconnected() {
      return;
    }

    self.token_sender.send(Bytes::from("data: [DONE]")).unwrap();
  }

  pub fn send_error(&self, error: String) {
    println!("{}", error);
    self
      .token_sender
      .send(CompletionResponse::to_data_bytes(error))
      .unwrap();
    self.send_done();
  }
}

/// Local llama_cpp inference has been removed — this is a no-op stub.
pub async fn start(req: Arc<InferenceThreadRequest>) {
  tauri::async_runtime::spawn(async move {
    req.send_error(
      "Local llama_cpp inference has been removed. Use Ollama or a cloud provider.".to_string(),
    );
    req.is_chatting.lock().await.store(false, Ordering::Relaxed);
  });
}
