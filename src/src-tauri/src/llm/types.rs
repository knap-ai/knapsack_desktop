use std::future::Future;

use futures::Stream;
use serde::Serialize;
use thiserror::Error;

#[derive(Clone)]
pub enum MessageSender {
  User,
  Bot,
  System,
}

#[derive(Clone)]
pub struct Message {
  pub sender: MessageSender,
  pub content: String,
}

#[derive(Default)]
pub struct ChatCompletionArgs {
  pub model: String,
  pub messages: Vec<Message>,
  pub temperature: Option<f32>,
  pub max_tokens: Option<u32>,
  pub tools: Option<String>,
}

#[derive(Default)]
pub struct EmbeddingArgs {
  pub model: String,
  pub inputs: Vec<String>,
}

pub struct EmbeddingTokensArgs {
  pub model: String,
  pub inputs: Vec<Vec<i32>>,
}

pub struct StringToTokensArgs {
  pub model_path: String,
  pub data: String,
}

pub struct MaxTokensArgs {
  pub model_path: String,
}

pub type BoxedFuture<'a, T> = Box<dyn Future<Output = T> + Send + Unpin + 'a>;

#[derive(Serialize, Error, Debug)]
pub enum LLMError {
  #[error("failed to advance context: {0}")]
  Advance(String),
  #[error("failed to load the model: {0}")]
  Load(String),
  #[error("failed to create a new session: {0}")]
  SessionCreationFailed(String),
  #[error("failed to create embeddings: {0}")]
  Embeddings(String), // Embeddings may involve session creation, advancing, and other things, so it should have its own error
  #[error("Too many requests: {0}")]
  TooManyRequests(String),
  #[error("Client side error: {0}")]
  ChatCompletionClientFailed(String),
  #[error("failed to complete chat: {0}")]
  ChatCompletionFailed(String),
}

pub trait ChatCompletionLlm {
  async fn chat_completion(
    &self,
    chat_completion_args: ChatCompletionArgs,
  ) -> Result<String, LLMError>;
  async fn stream_chat_completion(
    &self,
    chat_completion_args: ChatCompletionArgs,
  ) -> Result<Box<dyn Stream<Item = String> + Unpin + Send>, LLMError>;
}

pub trait EmbeddingLlm {
  async fn embed(&self, embedding_args: EmbeddingArgs) -> Result<Vec<Vec<f32>>, LLMError>;
  async fn embed_tokens(
    &self,
    embedding_args: EmbeddingTokensArgs,
  ) -> Result<Vec<Vec<f32>>, LLMError>;
  async fn string_to_tokens(&self, args: StringToTokensArgs) -> Vec<i32>;
  async fn get_max_tokens(&self, args: MaxTokensArgs) -> usize;
}
