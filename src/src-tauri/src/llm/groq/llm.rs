use crate::error::Error;
use crate::llm::types::{ChatCompletionArgs, ChatCompletionLlm, LLMError, Message, MessageSender};
use futures::{stream, Stream};
use groq_api_rs::completion::{
  client::{CompletionOption, Groq},
  message::Message as GroqMessage,
  request::builder,
  response::ErrorResponse,
};
use reqwest::multipart::{Form, Part};
use serde::Deserialize;
use serde_json::Value;
use std::path::PathBuf;

pub struct GroqLlm {
  api_key: String,
}

fn groq_api_key() -> Result<String, LLMError> {
  std::env::var("GROQ_API_KEY")
    .map(|k| k.trim().to_string())
    .ok()
    .filter(|k| !k.is_empty())
    .ok_or_else(|| LLMError::ChatCompletionFailed(
      "GROQ_API_KEY environment variable is not set. Please add your Groq API key in Settings.".to_string()
    ))
}

#[derive(Deserialize, Debug)]
struct TranscriptSegment {
  start: f32,
  end: f32,
  text: String,
}

#[derive(Deserialize, Debug)]
struct TranscriptionResponse {
  text: String,
  segments: Vec<TranscriptSegment>,
}

impl GroqLlm {
  pub fn new() -> Result<Self, LLMError> {
    let api_key = groq_api_key()?;
    Ok(GroqLlm { api_key })
  }

  pub fn message_to_groq_message(&self, message: Message) -> GroqMessage {
    match message.sender {
      MessageSender::User => GroqMessage::UserMessage {
        role: Some("user".to_string()),
        content: Some(message.content),
        name: None,
        tool_call_id: None,
      },
      MessageSender::Bot => GroqMessage::AssistantMessage {
        role: Some("assistant".to_string()),
        content: Some(message.content),
        name: None,
        tool_calls: None,
        tool_call_id: None,
      },
      MessageSender::System => GroqMessage::SystemMessage {
        role: Some("system".to_string()),
        content: Some(message.content),
        name: None,
        tool_call_id: None,
      },
    }
  }

  pub fn handle_chat_completion_request_error(&self, error: anyhow::Error) -> LLMError {
    let result = error.downcast::<ErrorResponse>();
    match result {
      Ok(error_response) => {
        if error_response.code == 429 {
          return LLMError::TooManyRequests("TOO_MANY_REQUESTS".to_string());
        } else if error_response.code.is_client_error() {
          return LLMError::ChatCompletionClientFailed(error_response.code.as_u16().to_string());
        }
        return LLMError::ChatCompletionFailed("Chat completion failed".to_string());
      }
      Err(_) => return LLMError::ChatCompletionFailed("Chat completion failed".to_string()),
    }
  }

  pub async fn chat_completion_request(
    &self,
    model: &str,
    messages: Vec<Message>,
    stream: bool,
  ) -> anyhow::Result<CompletionOption> {
    let request = builder::RequestBuilder::new(model.to_string()).with_stream(stream);

    let mut client = Groq::new(&self.api_key);
    client.add_messages(
      messages
        .into_iter()
        .map(|message| self.message_to_groq_message(message))
        .collect(),
    );
    client.create(request).await
  }

  pub async fn speech_to_text_request(
    &self,
    audio_file: &PathBuf,
    language: Option<String>,
    temperature: Option<f32>,
  ) -> Result<String, Error> {
    if !audio_file.exists() {
      return Err(LLMError::ChatCompletionFailed("Audio file does not exist".to_string()).into());
    }

    let file_bytes = match tokio::fs::read(&audio_file).await {
      Ok(bytes) => bytes,
      Err(_) => {
        return Err(LLMError::ChatCompletionFailed("Failed to read audio file".to_string()).into())
      }
    };

    let file_name = audio_file
      .file_name()
      .and_then(|n| n.to_str())
      .unwrap_or("audio.flac");

    let file_part = Part::bytes(file_bytes)
      .file_name(file_name.to_string())
      .mime_str("audio/flac")?;

    // let lexicon_prompt = "The audio is a recording of a company meeting. The following terms may appear in the audio: Knapsack, Knap, Knaps, Wealthbox, Redtail, CRM, PreciseFP.";

    let mut form = Form::new()
      .part("file", file_part)
      .text("model", "whisper-large-v3-turbo")
      .text("response_format", "verbose_json");
      // .text("prompt", lexicon_prompt);

    if let Some(lang) = language {
      form = form.text("language", lang);
    }

    if let Some(temp) = temperature {
      form = form.text("temperature", temp.to_string());
    }

    let client = reqwest::Client::new();
    let response = client
      .post("https://api.groq.com/openai/v1/audio/transcriptions")
      .header("Authorization", format!("Bearer {}", self.api_key))
      .multipart(form)
      .send()
      .await
      .map_err(|e| LLMError::ChatCompletionFailed(e.to_string()))?;

    if !response.status().is_success() {
      return Err(
        LLMError::ChatCompletionFailed(format!(
          "API request failed with status: {}",
          response.status()
        ))
        .into(),
      );
    }

    let transcription: TranscriptionResponse = response
      .json()
      .await
      .map_err(|e| LLMError::ChatCompletionFailed(e.to_string()))?;

    let joined_segments = transcription
      .segments
      .iter()
      .map(|segment| {
        format!(
          "[{:.2} - {:.2}]: {}",
          segment.start, segment.end, segment.text
        )
      })
      .collect::<Vec<String>>()
      .join("\n");
    Ok(joined_segments)
  }
}

impl ChatCompletionLlm for GroqLlm {
  async fn chat_completion(
    &self,
    chat_completion_args: ChatCompletionArgs,
  ) -> Result<String, LLMError> {
    let result = self
      .chat_completion_request(
        &chat_completion_args.model,
        chat_completion_args.messages,
        false,
      )
      .await;

    match result {
      Ok(completion_option) => match completion_option {
        CompletionOption::NonStream(response) => {
          let choice = response.choices.first().unwrap().to_owned();
          Ok(choice.message.content.to_string())
        }
        _ => Err(LLMError::ChatCompletionFailed(
          "Invalid response".to_string(),
        )),
      },
      Err(error) => Err(self.handle_chat_completion_request_error(error)),
    }
  }

  // Todo: Implement real stream
  async fn stream_chat_completion(
    &self,
    chat_completion_args: ChatCompletionArgs,
  ) -> Result<Box<dyn futures::Stream<Item = String> + Unpin + Send>, LLMError> {
    let result = self
      .chat_completion_request(
        &chat_completion_args.model,
        chat_completion_args.messages,
        false,
      )
      .await;
    match result {
      Ok(completion_option) => match completion_option {
        CompletionOption::NonStream(response) => {
          let choice = response.choices.first().unwrap().to_owned();
          Ok(
            Box::new(stream::iter(vec![choice.message.content.to_string()]))
              as Box<dyn Stream<Item = String> + Unpin + Send>,
          )
        }
        _ => Err(LLMError::ChatCompletionFailed(
          "Invalid response".to_string(),
        )),
      },
      Err(error) => Err(self.handle_chat_completion_request_error(error)),
    }
  }
}
