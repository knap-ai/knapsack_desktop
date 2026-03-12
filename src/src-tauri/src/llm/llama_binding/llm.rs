use futures::Stream;
use std::path::Path;

use crate::llm::types::{
  ChatCompletionArgs, ChatCompletionLlm, EmbeddingArgs, EmbeddingLlm, EmbeddingTokensArgs,
  LLMError, MaxTokensArgs, StringToTokensArgs,
};

// Local llama_cpp inference has been removed. The app now uses Ollama for local
// inference and cloud providers (OpenAI, Anthropic, Gemini, Groq) for remote.
// This module retains the LlamaBinding type as a no-op stub so that existing
// call-sites (actix state, SemanticService, handle_llm_complete) still compile.

#[derive(Default)]
pub struct LlamaBinding;

impl ChatCompletionLlm for LlamaBinding {
  async fn chat_completion(
    &self,
    _chat_completion_args: ChatCompletionArgs,
  ) -> Result<String, LLMError> {
    Err(LLMError::Load(
      "Local llama_cpp inference has been removed. Use Ollama or a cloud provider.".to_string(),
    ))
  }

  async fn stream_chat_completion(
    &self,
    _chat_completion_args: ChatCompletionArgs,
  ) -> Result<Box<dyn Stream<Item = String> + Unpin + Send>, LLMError> {
    Err(LLMError::Load(
      "Local llama_cpp inference has been removed. Use Ollama or a cloud provider.".to_string(),
    ))
  }
}

impl EmbeddingLlm for LlamaBinding {
  async fn string_to_tokens(&self, _args: StringToTokensArgs) -> Vec<i32> {
    Vec::new()
  }

  async fn get_max_tokens(&self, _args: MaxTokensArgs) -> usize {
    0
  }

  async fn embed(&self, _embedding_args: EmbeddingArgs) -> Result<Vec<Vec<f32>>, LLMError> {
    Err(LLMError::Embeddings(
      "Local llama_cpp inference has been removed. Use Ollama or a cloud provider.".to_string(),
    ))
  }

  async fn embed_tokens(
    &self,
    _embedding_args: EmbeddingTokensArgs,
  ) -> Result<Vec<Vec<f32>>, LLMError> {
    Err(LLMError::Embeddings(
      "Local llama_cpp inference has been removed. Use Ollama or a cloud provider.".to_string(),
    ))
  }
}
