use actix_web::web::{Bytes, Json};
use actix_web::Error;
use flume::Receiver;
use futures::stream::Stream;

use std::path::PathBuf;
use std::pin::Pin;
use std::sync::RwLock as StdRwLock;
use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc,
};
use std::task::{Context, Poll};
use tokio::sync::Mutex;

use crate::db::models::document::Document;
use crate::db::models::message::Message;
use crate::llm::groq::llm::GroqLlm;
use crate::llm::llama_binding::process::{start, InferenceThreadRequest};
use crate::llm::llama_binding::stop_handler::StopHandler;
use crate::llm::prompt::{
  build_system_message, build_user_message, parse_messages, AdditionalDocument,
};
use crate::llm::types::{ChatCompletionArgs, ChatCompletionLlm, LLMError, Message as LlmMessage, MessageSender};
use crate::server::actix::InferenceThreads;
use anyhow::Result;

use serde::{Deserialize, Serialize};

/// Resolved LLM provider info for meeting notes completion.
struct ResolvedProvider {
  name: String,        // "openai", "anthropic", "gemini", "groq"
  api_key: String,
  model: String,
  base_url: String,    // e.g. "https://api.openai.com/v1"
  is_anthropic: bool,  // Anthropic uses a different API format
}

/// Try to resolve the best available LLM provider from env vars.
/// Priority: active_provider setting → OpenAI → Anthropic → Gemini → Groq
fn resolve_provider() -> Result<ResolvedProvider, LLMError> {
  let active = std::env::var("KNAPSACK_ACTIVE_PROVIDER").unwrap_or_default();
  let openai_key = std::env::var("OPENAI_API_KEY").ok().filter(|k| !k.trim().is_empty());
  let anthropic_key = std::env::var("ANTHROPIC_API_KEY").ok().filter(|k| !k.trim().is_empty());
  let gemini_key = std::env::var("GEMINI_API_KEY").ok().filter(|k| !k.trim().is_empty());
  let groq_key = std::env::var("GROQ_API_KEY").ok().filter(|k| !k.trim().is_empty());
  let openai_model = std::env::var("KNAPSACK_OPENAI_MODEL").unwrap_or_else(|_| "gpt-4o".to_string());

  // Try the user's active provider first
  match active.as_str() {
    "openai" if openai_key.is_some() => return Ok(ResolvedProvider {
      name: "openai".into(),
      api_key: openai_key.unwrap(),
      model: openai_model,
      base_url: "https://api.openai.com/v1".into(),
      is_anthropic: false,
    }),
    "anthropic" if anthropic_key.is_some() => return Ok(ResolvedProvider {
      name: "anthropic".into(),
      api_key: anthropic_key.unwrap(),
      model: "claude-sonnet-4-20250514".into(),
      base_url: "https://api.anthropic.com/v1".into(),
      is_anthropic: true,
    }),
    "gemini" if gemini_key.is_some() => return Ok(ResolvedProvider {
      name: "gemini".into(),
      api_key: gemini_key.unwrap(),
      model: "gemini-2.5-flash".into(),
      base_url: "https://generativelanguage.googleapis.com/v1beta/openai".into(),
      is_anthropic: false,
    }),
    _ => {} // Fall through to priority-based resolution
  }

  // Fallback: try providers in order of preference
  if let Some(key) = openai_key {
    return Ok(ResolvedProvider {
      name: "openai".into(),
      api_key: key,
      model: openai_model,
      base_url: "https://api.openai.com/v1".into(),
      is_anthropic: false,
    });
  }
  if let Some(key) = anthropic_key {
    return Ok(ResolvedProvider {
      name: "anthropic".into(),
      api_key: key,
      model: "claude-sonnet-4-20250514".into(),
      base_url: "https://api.anthropic.com/v1".into(),
      is_anthropic: true,
    });
  }
  if let Some(key) = gemini_key {
    return Ok(ResolvedProvider {
      name: "gemini".into(),
      api_key: key,
      model: "gemini-2.5-flash".into(),
      base_url: "https://generativelanguage.googleapis.com/v1beta/openai".into(),
      is_anthropic: false,
    });
  }
  if let Some(key) = groq_key {
    return Ok(ResolvedProvider {
      name: "groq".into(),
      api_key: key,
      model: "meta-llama/llama-4-maverick-17b-128e-instruct".into(),
      base_url: "https://api.groq.com/openai/v1".into(),
      is_anthropic: false,
    });
  }

  Err(LLMError::ChatCompletionFailed(
    "No API key configured. Please add your API key in Settings.".into(),
  ))
}

/// Call an OpenAI-compatible chat completions endpoint (works for OpenAI, Groq, Gemini).
async fn openai_compatible_completion(
  provider: &ResolvedProvider,
  messages: &[LlmMessage],
) -> Result<String, LLMError> {
  let client = reqwest::Client::new();
  let msgs: Vec<serde_json::Value> = messages.iter().map(|m| {
    let role = match m.sender {
      MessageSender::System => "system",
      MessageSender::User => "user",
      MessageSender::Bot => "assistant",
    };
    serde_json::json!({"role": role, "content": &m.content})
  }).collect();

  let body = serde_json::json!({
    "model": &provider.model,
    "messages": msgs,
  });

  let url = format!("{}/chat/completions", &provider.base_url);
  let resp = client.post(&url)
    .header("Authorization", format!("Bearer {}", &provider.api_key))
    .header("Content-Type", "application/json")
    .json(&body)
    .send()
    .await
    .map_err(|e| LLMError::ChatCompletionFailed(format!("{} request failed: {}", provider.name, e)))?;

  let status = resp.status();
  let text = resp.text().await
    .map_err(|e| LLMError::ChatCompletionFailed(format!("{} response read failed: {}", provider.name, e)))?;

  if status == reqwest::StatusCode::TOO_MANY_REQUESTS {
    return Err(LLMError::TooManyRequests(format!("{} rate limited", provider.name)));
  }
  if !status.is_success() {
    return Err(LLMError::ChatCompletionFailed(format!("{} error ({}): {}", provider.name, status, text)));
  }

  let json: serde_json::Value = serde_json::from_str(&text)
    .map_err(|e| LLMError::ChatCompletionFailed(format!("{} JSON parse failed: {}", provider.name, e)))?;

  json["choices"][0]["message"]["content"]
    .as_str()
    .map(|s| s.to_string())
    .ok_or_else(|| LLMError::ChatCompletionFailed(format!("{}: no content in response", provider.name)))
}

/// Call the Anthropic Messages API.
async fn anthropic_completion(
  provider: &ResolvedProvider,
  messages: &[LlmMessage],
) -> Result<String, LLMError> {
  let client = reqwest::Client::new();

  // Anthropic requires system message separate from messages array
  let mut system_text = String::new();
  let mut msgs: Vec<serde_json::Value> = Vec::new();
  for m in messages {
    match m.sender {
      MessageSender::System => {
        if !system_text.is_empty() { system_text.push('\n'); }
        system_text.push_str(&m.content);
      }
      MessageSender::User => msgs.push(serde_json::json!({"role": "user", "content": &m.content})),
      MessageSender::Bot => msgs.push(serde_json::json!({"role": "assistant", "content": &m.content})),
    }
  }

  let mut body = serde_json::json!({
    "model": &provider.model,
    "max_tokens": 4096,
    "messages": msgs,
  });
  if !system_text.is_empty() {
    body["system"] = serde_json::json!(system_text);
  }

  let resp = client.post("https://api.anthropic.com/v1/messages")
    .header("x-api-key", &provider.api_key)
    .header("anthropic-version", "2023-06-01")
    .header("Content-Type", "application/json")
    .json(&body)
    .send()
    .await
    .map_err(|e| LLMError::ChatCompletionFailed(format!("Anthropic request failed: {}", e)))?;

  let status = resp.status();
  let text = resp.text().await
    .map_err(|e| LLMError::ChatCompletionFailed(format!("Anthropic response read failed: {}", e)))?;

  if status == reqwest::StatusCode::TOO_MANY_REQUESTS {
    return Err(LLMError::TooManyRequests("Anthropic rate limited".into()));
  }
  if !status.is_success() {
    return Err(LLMError::ChatCompletionFailed(format!("Anthropic error ({}): {}", status, text)));
  }

  let json: serde_json::Value = serde_json::from_str(&text)
    .map_err(|e| LLMError::ChatCompletionFailed(format!("Anthropic JSON parse failed: {}", e)))?;

  // Anthropic returns content as an array of blocks
  json["content"][0]["text"]
    .as_str()
    .map(|s| s.to_string())
    .ok_or_else(|| LLMError::ChatCompletionFailed("Anthropic: no text in response".into()))
}

/// Complete using the best available provider. Falls back through providers on failure.
async fn multi_provider_completion(
  messages: Vec<LlmMessage>,
) -> Result<String, LLMError> {
  let provider = resolve_provider()?;
  log::info!("[notes] Using {} ({}) for meeting notes completion", provider.name, provider.model);

  let result = if provider.is_anthropic {
    anthropic_completion(&provider, &messages).await
  } else {
    openai_compatible_completion(&provider, &messages).await
  };

  match result {
    Ok(text) => Ok(text),
    Err(e) => {
      log::warn!("[notes] {} failed: {}. Trying Groq fallback...", provider.name, e);
      // If primary provider fails and it wasn't Groq, try Groq as fallback
      if provider.name != "groq" {
        if let Ok(groq) = GroqLlm::new() {
          let primary = "meta-llama/llama-4-maverick-17b-128e-instruct".to_string();
          match groq.chat_completion(ChatCompletionArgs {
            model: primary,
            messages: messages.clone(),
            ..Default::default()
          }).await {
            Ok(text) => return Ok(text),
            Err(groq_err) => log::warn!("[notes] Groq fallback also failed: {}", groq_err),
          }
        }
      }
      Err(e)
    }
  }
}

use crate::llm::llama_binding::llm::LlamaBinding;
use crate::llm::llama_binding::prompt::ChatFormat;

use crate::memory::semantic::SemanticService;

#[derive(Serialize)]
struct Choice {
  text: String,
}

#[derive(Serialize)]
pub struct CompletionResponse {
  choices: Vec<Choice>,
}

impl CompletionResponse {
  pub fn to_data_bytes(text: String) -> Bytes {
    let completion_response = CompletionResponse {
      choices: vec![Choice { text }],
    };

    let serialized = serde_json::to_string(&completion_response).unwrap();

    Bytes::from(format!("data: {}\n\n", serialized))
  }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum StopSequence {
  Single(String),
  Multiple(Vec<String>),
}

impl StopSequence {
  fn as_ref(&self) -> &[String] {
    match self {
      StopSequence::Single(s) => std::slice::from_ref(s),
      StopSequence::Multiple(v) => v.as_slice(),
    }
  }
}

impl Default for StopSequence {
  fn default() -> Self {
    StopSequence::Multiple(vec![
      "AI: ".to_string(),
      "Human: ".to_string(),
      "</s>".to_string(),
    ])
  }
}

pub struct AbortStream {
  pub stream: Pin<Box<dyn Stream<Item = Bytes> + Send>>,
  pub abort_flag: Arc<StdRwLock<AtomicBool>>,
  pub thread: (),
}

impl AbortStream {
  pub fn new(
    receiver: Receiver<Bytes>,
    abort_flag: Arc<StdRwLock<AtomicBool>>,
    thread: (),
  ) -> Self {
    AbortStream {
      stream: Box::pin(receiver.into_stream()),
      abort_flag,
      thread,
    }
  }
}

impl Stream for AbortStream {
  type Item = Result<Bytes, Error>;

  fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
    match self.stream.as_mut().poll_next(cx) {
      Poll::Ready(Some(bytes)) => Poll::Ready(Some(Ok(bytes))),
      Poll::Ready(None) => {
        let abort_flag_guard = self.abort_flag.write().unwrap();
        abort_flag_guard.store(true, Ordering::Relaxed);
        // self.thread.abort();
        Poll::Ready(None)
      }
      Poll::Pending => Poll::Pending,
    }
  }
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct CompletionRequest {
  pub user_email: String,
  pub user_name: String,
  pub prompt: String,
  pub semantic_search_query: Option<String>,
  pub is_local: bool,
  pub documents: Option<Vec<u64>>,
  pub additional_documents: Option<Vec<AdditionalDocument>>,
  pub thread_id: Option<u64>,
  sampler: Option<String>,

  stream: Option<bool>,

  max_tokens: Option<usize>,

  seed: Option<u64>,
  temperature: Option<f32>,
  top_k: Option<usize>,
  top_p: Option<f32>,
  frequency_penalty: Option<f32>,
  presence_penalty: Option<f32>,

  stop_sequences: Option<StopSequence>,
  stop: Option<StopSequence>,
}

impl CompletionRequest {
  pub fn get_max_tokens(&self) -> usize {
    let max_tokens = self.max_tokens.unwrap_or(usize::MAX);
    if max_tokens == 0 {
      usize::MAX
    } else {
      max_tokens
    }
  }

  pub fn get_stop_handler(&self, model: &LlamaBinding) -> StopHandler {
    let default_seq = StopSequence::default();
    let stop_sequence = if let Some(stop) = self.stop.as_ref() {
      stop.as_ref()
    } else if let Some(stop_sequences) = self.stop_sequences.as_ref() {
      stop_sequences.as_ref()
    } else {
      default_seq.as_ref()
    };

    StopHandler::new(model, stop_sequence)
  }
}

pub async fn handle_llm_complete(
  payload: Json<CompletionRequest>,
  llama_model: &Arc<Mutex<LlamaBinding>>,
  // llm_path: &Arc<PathBuf>,
  inference_threads: &InferenceThreads,
  is_chatting: &Arc<Mutex<AtomicBool>>,
  semantic_service: &Arc<Mutex<Option<SemanticService>>>,
) -> Result<AbortStream, LLMError> {

  is_chatting.lock().await.store(true, Ordering::Relaxed);

  let abort_flag = Arc::new(StdRwLock::new(AtomicBool::new(false)));

  let mut messages = Vec::new();
  if let Some(thread_id) = payload.thread_id.clone() {
    messages = Message::find_by_thread_id(thread_id).unwrap();
  }

  let documents: Option<Vec<Document>> = payload.0.documents.clone().map(|docs| {
    docs
      .into_iter()
      .filter_map(|doc| Document::find_by_id(doc).ok().flatten())
      .collect()
  });
  let prompt = payload.0.prompt.clone();
  let semantic_search_query = payload.0.semantic_search_query.clone();
  let user_email = payload.0.user_email.clone();
  let user_name = payload.0.user_name.clone();

  let mut chat_completion_messages = Vec::new();
  chat_completion_messages.push(build_system_message(user_name, user_email));
  let mut previous_messages = parse_messages(messages.clone());
  chat_completion_messages.append(&mut previous_messages);
  let user_message = build_user_message(
    prompt,
    semantic_search_query,
    documents,
    semantic_service.clone(),
    payload.0.additional_documents.clone(),
  )
  .await;
  chat_completion_messages.push(
    user_message,
  );

  if payload.0.is_local {
    let (token_sender, receiver) = flume::unbounded::<Bytes>();
    let inf_thread = Arc::new(InferenceThreadRequest {
      llama_model: llama_model.clone(),
      chat_format: ChatFormat::Llama3,
      abort_flag: abort_flag.clone(),
      token_sender,
      messages: chat_completion_messages,
      completion_request: payload.0,
      // llm_path: llm_path.clone(),
      is_chatting: is_chatting.clone(),
    });

    inference_threads.lock().await.push(inf_thread.clone());

    Ok(AbortStream::new(
      receiver,
      abort_flag.clone(),
      start(inf_thread).await,
    ))
  } else {
    is_chatting.lock().await.store(false, Ordering::Relaxed);

    // Use whatever LLM provider the user has configured (OpenAI, Anthropic, Gemini)
    // with Groq as a fallback. No longer requires a Groq API key.
    let response = multi_provider_completion(chat_completion_messages).await;

    response.map(|response_text| {
      let bytes = CompletionResponse::to_data_bytes(response_text);
      let (sender, receiver) = flume::unbounded::<Bytes>();
      sender.send(bytes).unwrap();

      AbortStream::new(receiver, abort_flag.clone(), ())
    })
  }
}
