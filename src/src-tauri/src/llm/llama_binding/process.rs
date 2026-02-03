use futures::StreamExt;
use std::path::PathBuf;
use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc, RwLock,
};
use tokio::sync::Mutex;

use actix_web::web::Bytes;
use flume::Sender;

use crate::llm::llama_binding::llm::LlamaBinding;
use crate::llm::llama_binding::prompt::ChatFormat;
use crate::llm::types::{ChatCompletionArgs, ChatCompletionLlm, Message};
use crate::llm::use_cases::complete::{CompletionRequest, CompletionResponse};

pub struct InferenceThreadRequest {
  pub token_sender: Sender<Bytes>,
  pub abort_flag: Arc<RwLock<AtomicBool>>,

  pub llama_model: Arc<Mutex<LlamaBinding>>,
  pub completion_request: CompletionRequest,
  //pub llm_path: Arc<PathBuf>,
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

// Perhaps might be better to clone the model for each thread...
pub async fn start(req: Arc<InferenceThreadRequest>) {
  tauri::async_runtime::spawn(async move {
    let maximum_token_count = req.completion_request.get_max_tokens();

    let llama = req.llama_model.lock().await;

    log::debug!("Feeding prompt {}", req.completion_request.prompt);
    req.send_event("FEEDING_PROMPT");

    // let mut stream = match llama
    //   .stream_chat_completion(ChatCompletionArgs {
    //     model: String::from(req.llm_path.to_str().unwrap()),
    //     messages: req.messages.clone(),
    //     ..Default::default()
    //   })
    //   .await
    // {
    //   Ok(stream) => stream,
    //   Err(e) => {
    //     req.send_error(e.to_string());
    //     req.is_chatting.lock().await.store(false, Ordering::Relaxed);
    //     panic!("Error streaming response.");
    //   }
    // };

    // println!("generating tokens... up to max {}", maximum_token_count);
    // let mut tokens_processed = 0;

    // let _stop_handler = req.completion_request.get_stop_handler(&llama);

    // req.send_event("GENERATING_TOKENS");

    // let stop_strings = [
    //   "<|end|>",
    //   "<end>",
    //   "<|eos|>",
    //   "<eos>",
    //   "<|eot_id|>",
    //   "<end_of_turn>",
    //   "</end_of_turn>",
    //   "</s>",
    // ];

    // while let Some(completion) = stream.next().await {
    //   if tokens_processed >= maximum_token_count || req.is_aborted() {
    //     break;
    //   }
    //   print!("{completion}");
    //   if stop_strings.contains(&completion.as_str()) {
    //     break;
    //   }
    //   match req
    //     .token_sender
    //     .send(CompletionResponse::to_data_bytes(completion))
    //   {
    //     Ok(_) => {}
    //     Err(_) => {
    //       break;
    //     }
    //   }
    //   tokens_processed += 1;
    // }

    // if !req.token_sender.is_disconnected() {
    //   req.send_done();
    //   req.is_chatting.lock().await.store(false, Ordering::Relaxed);
    // }
  });
}
