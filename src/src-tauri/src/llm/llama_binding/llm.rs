use futures::Stream;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use blake3::Hasher;
use dashmap::DashMap;
use llama_cpp::standard_sampler::{SamplerStage, StandardSampler};
use llama_cpp::{EmbeddingsParams, LlamaModel, LlamaParams, LlamaSession, SessionParams, Token};

use tokio::sync::mpsc::{unbounded_channel, UnboundedSender};
use tracing::error;

use crate::llm::types::{
  ChatCompletionArgs, ChatCompletionLlm, EmbeddingArgs, EmbeddingLlm, EmbeddingTokensArgs,
  LLMError, MaxTokensArgs, StringToTokensArgs,
};

use super::completion::CompletionStream;
use super::prompt::{apply_chat_template, ChatFormat};

/// The context tag marking the start of generated dialogue.
pub const ASSISTANT_TAG: &str = "<|ASSISTANT|>";

/// The context tag marking the start of user dialogue.
pub const USER_TAG: &str = "<|USER|>";

/// The context tag marking the start of a tool's output.
pub const TOOL_TAG: &str = "<|TOOL|>";

/// The context tag marking the start of system information.
pub const SYSTEM_TAG: &str = "<|SYSTEM|>";

// TODO this should be in settings
pub const SINGLE_MESSAGE_LIMIT: usize = 1024;
const CONTEXT_SIZE: u32 = 6144;

#[derive(Default)]
pub struct LlamaBinding {
  models: Arc<DashMap<String, UnloadingModel>>,
}

impl LlamaBinding {
  pub async fn get(
    &self,
    model_path: &Path,
    chat_format: ChatFormat,
  ) -> dashmap::mapref::one::Ref<String, UnloadingModel> {
    let key = model_path.to_string_lossy().to_string();

    if !self.models.contains_key(&key) {
      println!("************* Model not found in cache, loading... ****************");
      let model = UnloadingModel::new(model_path, chat_format).await;
      self.models.insert(key.clone(), model);
    }

    // PANIC SAFETY: Just inserted the element if it isn't already inside the map, so must be present in the map
    self.models.get(&key).unwrap()
  }
}

impl ChatCompletionLlm for LlamaBinding {
  async fn chat_completion(
    &self,
    chat_completion_args: ChatCompletionArgs,
  ) -> Result<String, LLMError> {
    let model = self
      .get(Path::new(&chat_completion_args.model), ChatFormat::Llama3)
      .await;
    model.chat_completions(chat_completion_args).await
  }

  async fn stream_chat_completion(
    &self,
    chat_completion_args: ChatCompletionArgs,
  ) -> Result<Box<dyn Stream<Item = String> + Unpin + Send>, LLMError> {
    let model = self
      .get(Path::new(&chat_completion_args.model), ChatFormat::Llama3)
      .await;
    model.stream_chat_completions(chat_completion_args).await
  }
}

impl EmbeddingLlm for LlamaBinding {
  async fn string_to_tokens(&self, args: StringToTokensArgs) -> Vec<i32> {
    let model = self
      .get(Path::new(&args.model_path), ChatFormat::Llama3)
      .await;
    model
      .string_to_tokens(args.data)
      .into_iter()
      .map(|item| item.0)
      .collect()
  }

  async fn get_max_tokens(&self, args: MaxTokensArgs) -> usize {
    let model = self
      .get(Path::new(&args.model_path), ChatFormat::Llama3)
      .await;
    model.max_n_ctx.clone()
  }

  async fn embed(&self, embedding_args: EmbeddingArgs) -> Result<Vec<Vec<f32>>, LLMError> {
    let model = self
      .get(Path::new(&embedding_args.model), ChatFormat::Llama3)
      .await;
    model.embeddings(embedding_args.inputs).await
  }

  async fn embed_tokens(
    &self,
    embedding_args: EmbeddingTokensArgs,
  ) -> Result<Vec<Vec<f32>>, LLMError> {
    let model = self
      .get(Path::new(&embedding_args.model), ChatFormat::Llama3)
      .await;
    model
      .embeddings_tokens(
        embedding_args
          .inputs
          .into_iter()
          .map(|item| item.into_iter().map(|item| Token(item)).collect::<Vec<_>>())
          .collect::<Vec<_>>(),
      )
      .await
  }
}

/// A [`LlamaModel`] (as well as its associated [`LlamaSession`]s) that unloads itself from memory after not being used
/// for a period of time.
struct UnloadingModel {
  model: LlamaModel,
  path: PathBuf,
  chat_format: ChatFormat,
  sessions: Arc<DashMap<SessionId, LlamaSession>>,
  // maintenance_thread: JoinHandle<()>,
  finished_tx: UnboundedSender<(SessionId, LlamaSession)>,
  max_n_ctx: usize,
  model_filename: String,
}

impl UnloadingModel {
  /// Creates a new instance of this model, provided it's [`Path`].
  ///
  /// This function is lazy and does not actually load the model into system memory, the model must be accessed in
  /// order to be loaded.
  async fn new(model_path: &Path, chat_format: ChatFormat) -> Self {
    let sessions: Arc<DashMap<SessionId, LlamaSession>> = Default::default();
    let (tx, _) = unbounded_channel();

    let model = match get_or_init_model(model_path).await {
      Ok(model) => model,
      Err(e) => {
        error!("Failed to load model: {}", e);
        panic!("Failed to load model: {}", e);
      }
    };
    let max_n_ctx = model.train_len();
    let model_filename = model_path
      .file_name()
      .unwrap()
      .to_string_lossy()
      .to_string();

    Self {
      model,
      path: model_path.to_path_buf(),
      chat_format,
      sessions,
      // maintenance_thread,
      finished_tx: tx,
      max_n_ctx,
      model_filename,
    }
  }

  fn string_to_tokens(&self, data: String) -> Vec<Token> {
    let data_bytes = data.as_bytes();
    self.model.tokenize_bytes(data_bytes, true, false).unwrap()
  }

  /// Returns **`true`** if this model is currently loaded in system memory, **`false`** otherwise.
  async fn loaded(&self) -> bool {
    true
  }

  /// Either takes an existing chat [`LlamaSession`] compatible with the provided prompt from the
  /// `sessions` collection, or creates a new one.
  ///
  /// The matching [`SessionId`] and the new context derived from `prompt` are also returned.
  async fn take_chat_session<'a>(&self, prompt: &'a str) -> (LlamaSession, SessionId, &'a str) {
    let (id, new_context) = SessionId::chat(prompt);

    let session_perishable = if let Some((_, session)) = self.sessions.remove(&id) {
      session
    } else {
      error!("No matching session found, creating new one");
      get_or_init_session(&self.model)
        .await
        .expect("Failed to create llam session")
    };

    println!("New context: {}", new_context);
    (session_perishable, id, new_context)
  }

  /// Computes the full chat completions for the provided [`CompletionArgs`].
  async fn chat_completions(&self, args: ChatCompletionArgs) -> Result<String, LLMError> {
    let prompt = apply_chat_template(args.messages, self.chat_format);
    let model_guard = &self.model;
    let params = SessionParams {
      n_ctx: CONTEXT_SIZE,
      n_batch: 512,
      ..Default::default()
    };

    let mut session = model_guard
      .create_session(params)
      .map_err(move |e| LLMError::SessionCreationFailed(e.to_string()))?;

    session
      .advance_context_async(&prompt)
      .await
      .map_err(move |e| LLMError::Advance(e.to_string()))?;

    let repetition_penalty_stage = SamplerStage::RepetitionPenalty {
      repetition_penalty: 1.1,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      last_n: 512,
    };
    let stages: Vec<SamplerStage> = vec![repetition_penalty_stage];
    let sampler = StandardSampler::new_softmax(stages, 1);
    let handle = session.start_completing_with(sampler, SINGLE_MESSAGE_LIMIT);

    if let Ok(handle) = handle {
      Ok(handle.into_string_async().await)
    } else {
      Err(LLMError::Advance("Failed to advance context".to_string()))
    }
  }

  /// Return a [`Box`]ed [`Stream`] of chat completions computed for the provided
  /// [`CompletionArgs`].
  async fn stream_chat_completions(
    &self,
    args: ChatCompletionArgs,
  ) -> Result<Box<dyn Stream<Item = String> + Unpin + Send>, LLMError> {
    let full_prompt = apply_chat_template(args.messages, self.chat_format);

    let (session, id, _) = self.take_chat_session(full_prompt.as_str()).await;

    let sampler = StandardSampler::default();
    let tx = self.finished_tx.clone();

    Ok(Box::new(
      CompletionStream::new(session, id, full_prompt.as_str(), sampler, tx).await?,
    ))
  }

  async fn embeddings(&self, inputs: Vec<String>) -> Result<Vec<Vec<f32>>, LLMError> {
    let params = EmbeddingsParams {
      ..Default::default()
    };
    self
      .model
      .embeddings_async(&inputs, params)
      .await
      .map_err(move |e| LLMError::Embeddings(e.to_string()))
  }

  async fn embeddings_tokens(&self, inputs: Vec<Vec<Token>>) -> Result<Vec<Vec<f32>>, LLMError> {
    let params = EmbeddingsParams {
      ..Default::default()
    };
    self
      .model
      .embeddings_token_async(inputs, params)
      .await
      .map_err(move |e| LLMError::Embeddings(e.to_string()))
  }
}

async fn get_or_init_model(path: &Path) -> Result<LlamaModel, LLMError> {
  let path = path.to_path_buf();
  let args = LlamaParams {
    n_gpu_layers: i32::MAX as u32,
    ..Default::default()
  };
  println!(
    "LLM: Loading {} into memory...",
    path.clone().to_string_lossy()
  );
  let llama_model =
    LlamaModel::load_from_file(path.clone(), args).map_err(move |e| LLMError::Load(e.to_string()));
  println!(
    "Done loading {} into memory!",
    path.clone().to_string_lossy()
  );
  llama_model
}

async fn get_or_init_session(model: &LlamaModel) -> Result<LlamaSession, LLMError> {
  let mut params = SessionParams::default();
  let n_threads = 6;

  params.n_threads = n_threads;
  params.n_threads_batch = n_threads;
  params.n_ctx = CONTEXT_SIZE;

  model
    .create_session(params)
    .map_err(move |e| LLMError::SessionCreationFailed(e.to_string()))
}

/// An object representing an unique identifier for a session context.
#[derive(Default, Clone)]
pub struct SessionId {
  /// The context [`Hasher`].
  hasher: Hasher,
  /// The length of the current context.
  len: usize,
}

impl SessionId {
  /// Creates a [`SessionId`] from a prompt.
  ///
  /// This function makes a few assumptions about the provided prompt, given that it is dedicated
  /// to chat sessions. It is assumed that the prompt ends with [`ASSISTANT_TAG`], and that it
  /// probably contains [`ASSISTANT_TAG`], [`USER_TAG`], [`TOOL_TAG`] and/or [`SYSTEM_TAG`].
  ///
  /// Besides returning the new [`SessionId`] instance, the new context in the prompt is also
  /// returned, found based to the positions of the tags.
  ///
  /// # Note
  ///
  /// The new [`SessionId`] returned by this function must be advanced using the returned new context,
  /// before being advanced with inference content. The reason it isn't already advance with the
  /// new context, is for the purpose of finding matching [`SessionId`]s in the endpoint.
  fn chat(prompt: &str) -> (Self, &str) {
    let idx = if prompt.ends_with(ASSISTANT_TAG) {
      if let Some(start) = prompt[..prompt.len() - ASSISTANT_TAG.len()].rfind(ASSISTANT_TAG) {
        // Another assistant tag is found, the is previous context
        if let Some(tag_idx) = find_any(
          &prompt[start + ASSISTANT_TAG.len()..],
          &[ASSISTANT_TAG, USER_TAG, TOOL_TAG, SYSTEM_TAG],
        ) {
          start + ASSISTANT_TAG.len() + tag_idx
        } else {
          // This should be unreachable error!("Could not find any tags after the last assistant message");
          0
        }
      } else {
        // No other assistant tag is found, this is the first prompt
        0
      }
    } else {
      error!("Chat prompt doesn't end with the assistant tag");
      0
    };

    let old_context = &prompt[..idx];
    let new_context = &prompt[idx..];

    let mut hasher = Hasher::new();
    hasher.update(old_context.as_bytes());

    let id = Self {
      hasher,
      len: old_context.len(),
    };
    (id, new_context)
  }

  // A function to advance the current session context with the provided [`str`] slice.
  //
  // ## Notes
  // The received slice should contain only new dialogue, as old dialogue is already hashed in this
  // [`SessionId`] and "stored" in the corresponding [`LlamaSession`].
  pub fn advance(&mut self, new_context: &str) {
    self.hasher.update(new_context.as_bytes());
    self.len += new_context.len();
  }
}

impl core::hash::Hash for SessionId {
  fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
    let blake_hash = self.hasher.finalize();
    for byte in blake_hash.as_bytes() {
      state.write_u8(*byte);
    }
  }
}

impl PartialEq for SessionId {
  fn eq(&self, other: &Self) -> bool {
    self.len == other.len && self.hasher.finalize() == other.hasher.finalize()
  }
}

impl Eq for SessionId {}

/// Helper function that finds the first of several substrings in a string, returning the index if
/// one was found
///
/// # Note
/// Internally, calls `find` from [`core::str`].
fn find_any(text: &str, patterns: &[&str]) -> Option<usize> {
  let mut idxs = vec![];
  for pattern in patterns {
    if let Some(idx) = text.find(pattern) {
      idxs.push(idx);
    }
  }

  if idxs.len() > 0 {
    let mut min = usize::MAX;
    for idx in idxs {
      if idx < min {
        min = idx;
      }
    }
    Some(min)
  } else {
    None
  }
}
