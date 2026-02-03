use futures::Stream;
use std::pin::Pin;
use std::task::{Context, Poll};

use llama_cpp::standard_sampler::StandardSampler;
use llama_cpp::{CompletionHandle, LlamaSession, TokensToStrings};
use tokio::sync::mpsc::UnboundedSender;
use tracing::error;

use crate::db::models::document::Document;
use crate::llm::types::LLMError;

use super::llm::{SessionId, SINGLE_MESSAGE_LIMIT};

#[derive(Debug, Clone)]
pub struct CompletionArgs {
  pub user_email: String,
  pub user_name: String,
  pub prompt: String,
  pub documents: Vec<Document>,
  pub is_local: bool,
  pub one_shot: bool,
  pub seed: Option<u32>,
  pub frequency_penalty: f32,
  pub context_hint: Option<u32>,
}

impl Default for CompletionArgs {
  fn default() -> Self {
    Self {
      user_email: "".to_string(),
      user_name: "".to_string(),
      prompt: "".to_string(),
      documents: Vec::new(),
      is_local: true,
      one_shot: false,
      seed: None,
      frequency_penalty: 0.0,
      context_hint: None,
    }
  }
}

/// A [`Stream`] of [`Token`]s returned by a [`LlamaCppSession::stream_complete`] call.
pub struct CompletionStream {
  /// Handle to the model completions handle.
  pub handle: TokensToStrings<CompletionHandle>,

  /// The session used for generation completions.
  pub session: LlamaSession,

  /// The `session`'s id.
  session_id: Option<SessionId>,

  /// A sender used to send both `session` and `session_id` once generation is completion
  finished_tx: Option<UnboundedSender<(SessionId, LlamaSession)>>,
  // The object signaling that `model` is currently active.
  // _model_signal: ActiveSignal,
  // The object signaling that `session` is currently active.
  // _session_signal: Option<ActiveSignal>,
}

impl CompletionStream {
  /// Constructs a new [`CompletionStream`].
  ///
  /// ## Arguments
  /// * `session` - The session used to generate completions.
  /// * `session_id` - The [`SessionId`] associated with `session`.
  /// * `new_context` - The context used to advance the session.
  /// * `model` - The [`LlamaModel`] that `session` is associated with.
  /// * `model_signal` - The `model`'s associated [`ActiveSignal`].
  /// * `sample` - The [`StandardSampler`] used to generate completions.
  /// * `end_token` - An [`UnboundedSender`] used to send both `session` and `session` once
  /// generation finishes.
  pub async fn new(
    mut session: LlamaSession,
    mut session_id: SessionId,
    new_context: &str,
    // model: LlamaModel,
    // model_signal: ActiveSignal,
    sampler: StandardSampler,
    finished_tx: UnboundedSender<(SessionId, LlamaSession)>,
  ) -> Result<Self, LLMError> {
    // let mut session_guard = get_or_init_session(model).await?;

    session
      .advance_context_async(new_context)
      .await
      .map_err(move |e| LLMError::Advance(e.to_string()))?;
    session_id.advance(new_context);

    let handle = session.start_completing_with(sampler, SINGLE_MESSAGE_LIMIT);

    if let Ok(handle) = handle {
      Ok(Self {
        handle: handle.into_strings(),
        session,
        session_id: Some(session_id),
        finished_tx: Some(finished_tx),
        // _model_signal: model_signal,
        // _session_signal: Some(session_signal),
      })
    } else {
      Err(LLMError::Advance("Failed to advance context".to_string()))
    }
  }

  pub async fn new_oneshot(
    mut session: LlamaSession,
    new_context: &str,
    // model_signal: ActiveSignal,
    sampler: StandardSampler,
  ) -> Result<Self, LLMError> {
    session
      .advance_context_async(new_context)
      .await
      .map_err(move |e| LLMError::Advance(e.to_string()))?;
    let handle = session.start_completing_with(sampler, SINGLE_MESSAGE_LIMIT);
    // .map_err(|e| LLMError::Advance(e.to_string()))?;

    if let Ok(handle) = handle {
      Ok(Self {
        handle: handle.into_strings(),
        session,
        session_id: None,
        finished_tx: None,
        // _model_signal: model_signal,
        // _session_signal: None,
      })
    } else {
      Err(LLMError::Advance("Failed to advance context".to_string()))
    }
  }
}

impl Stream for CompletionStream {
  type Item = String;

  fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
    match std::pin::pin!(&mut self.handle).poll_next(cx) {
      Poll::Ready(Some(val)) => {
        if let Some(id) = &mut self.session_id {
          id.advance(&val);
        }
        Poll::Ready(Some(val))
      }
      Poll::Ready(None) => Poll::Ready(None),
      Poll::Pending => Poll::Pending,
    }
  }
}

impl Drop for CompletionStream {
  fn drop(&mut self) {
    if let Some(id) = self.session_id.take() {
      if let Some(channel) = self.finished_tx.take() {
        channel
          .send((id, self.session.clone()))
          .unwrap_or_else(move |e| error!("Failed to send session to maintenance thread: {e}"));
      }
    }
  }
}
