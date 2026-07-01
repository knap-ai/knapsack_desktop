use crate::error::Error;
use crate::llm::types::{LLMError, Message as LlmMessage, MessageSender};
use crate::utils::log::knap_log_error;
use regex::Regex;
use reqwest::multipart::{Form, Part};
use serde::Deserialize;
use std::collections::BTreeMap;
use std::fs;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};

/// A resolved speech-to-text provider (only OpenAI and Groq support Whisper STT).
struct SttProvider {
  name: &'static str,
  api_key: String,
  base_url: &'static str,
  model: &'static str,
}

fn push_unique_provider(
  providers: &mut Vec<SttProvider>,
  name: &'static str,
  api_key: String,
  base_url: &'static str,
  model: &'static str,
) {
  if providers.iter().any(|provider| provider.name == name) {
    return;
  }
  providers.push(SttProvider {
    name,
    api_key,
    base_url,
    model,
  });
}

/// Resolve the ordered list of available speech-to-text providers.
/// Respects the user's active provider when it supports STT, then appends any
/// other configured STT providers as fallback candidates.
fn resolve_stt_providers() -> Result<Vec<SttProvider>, LLMError> {
  let active = std::env::var("KNAPSACK_ACTIVE_PROVIDER").unwrap_or_default();
  let openai_key = std::env::var("OPENAI_API_KEY")
    .ok()
    .filter(|k| !k.trim().is_empty());
  let groq_key = std::env::var("GROQ_API_KEY")
    .ok()
    .filter(|k| !k.trim().is_empty());
  let mut providers = Vec::new();

  // If the user's active provider supports STT, prefer it.
  match active.as_str() {
    "openai" if openai_key.is_some() => {
      push_unique_provider(
        &mut providers,
        "openai",
        openai_key.clone().unwrap(),
        "https://api.openai.com/v1/audio/transcriptions",
        "whisper-1",
      );
    }
    "groq" if groq_key.is_some() => {
      push_unique_provider(
        &mut providers,
        "groq",
        groq_key.clone().unwrap(),
        "https://api.groq.com/openai/v1/audio/transcriptions",
        "whisper-large-v3-turbo",
      );
    }
    // Anthropic, Gemini, OpenRouter, Knapsack, etc. don't offer STT directly.
    _ => {}
  }

  // Fallback order: prefer Groq (free, fast Whisper API) over OpenAI (paid,
  // tighter rate limits).
  if let Some(key) = groq_key {
    push_unique_provider(
      &mut providers,
      "groq",
      key,
      "https://api.groq.com/openai/v1/audio/transcriptions",
      "whisper-large-v3-turbo",
    );
  }
  if let Some(key) = openai_key {
    push_unique_provider(
      &mut providers,
      "openai",
      key,
      "https://api.openai.com/v1/audio/transcriptions",
      "whisper-1",
    );
  }

  if !providers.is_empty() {
    return Ok(providers);
  }

  Err(LLMError::ChatCompletionFailed(
    "No speech-to-text provider available. Speech-to-text requires a Groq or OpenAI API \
     key (Anthropic and Gemini don't expose a Whisper-compatible endpoint). Groq offers a \
     free tier — add a key in Settings → AI Provider → Groq."
      .into(),
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

/// Send audio to an OpenAI-compatible Whisper transcription endpoint.
/// Retries up to 3 times on 429 (rate-limit) errors with exponential backoff.
async fn speech_to_text(
  provider: &SttProvider,
  audio_file: &PathBuf,
  language: Option<&str>,
  temperature: Option<f32>,
) -> Result<String, Error> {
  use std::time::Duration;

  if !audio_file.exists() {
    return Err(LLMError::ChatCompletionFailed("Audio file does not exist".to_string()).into());
  }

  let file_bytes = tokio::fs::read(&audio_file)
    .await
    .map_err(|_| LLMError::ChatCompletionFailed("Failed to read audio file".to_string()))?;

  let file_name = audio_file
    .file_name()
    .and_then(|n| n.to_str())
    .unwrap_or("audio.flac")
    .to_string();

  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(120))
    .build()
    .map_err(|e| LLMError::ChatCompletionFailed(e.to_string()))?;

  let max_retries = 3u32;
  let mut last_status = None;
  let mut last_error_message: Option<String> = None;

  for attempt in 0..=max_retries {
    let file_part = Part::bytes(file_bytes.clone())
      .file_name(file_name.clone())
      .mime_str("audio/flac")?;

    let mut form = Form::new()
      .part("file", file_part)
      .text("model", provider.model.to_string())
      .text("response_format", "verbose_json");

    if let Some(lang) = language {
      form = form.text("language", lang.to_string());
    }
    if let Some(temp) = temperature {
      form = form.text("temperature", temp.to_string());
    }

    let response = match client
      .post(provider.base_url)
      .header("Authorization", format!("Bearer {}", provider.api_key))
      .multipart(form)
      .send()
      .await
    {
      Ok(response) => response,
      Err(e) => {
        let error_message = e.to_string();
        if (e.is_timeout() || e.is_connect()) && attempt < max_retries {
          let backoff = Duration::from_secs(2u64.pow(attempt + 1));
          log::warn!(
            "[transcribe] {} request error, retrying in {:?} (attempt {}/{}): {}",
            provider.name,
            backoff,
            attempt + 1,
            max_retries,
            error_message
          );
          tokio::time::sleep(backoff).await;
          last_error_message = Some(error_message);
          continue;
        }
        return Err(LLMError::ChatCompletionFailed(error_message).into());
      }
    };

    let status = response.status();

    if status.is_success() {
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
      return Ok(joined_segments);
    }

    last_status = Some(status);

    // Retry on 429 (rate limit) with exponential backoff
    if status == reqwest::StatusCode::TOO_MANY_REQUESTS && attempt < max_retries {
      let backoff = Duration::from_secs(2u64.pow(attempt + 1)); // 2s, 4s, 8s
      log::warn!(
        "[transcribe] {} returned 429, retrying in {:?} (attempt {}/{})",
        provider.name,
        backoff,
        attempt + 1,
        max_retries
      );
      tokio::time::sleep(backoff).await;
      continue;
    }

    if (status.is_server_error() || status == reqwest::StatusCode::REQUEST_TIMEOUT)
      && attempt < max_retries
    {
      let backoff = Duration::from_secs(2u64.pow(attempt + 1));
      log::warn!(
        "[transcribe] {} returned {}, retrying in {:?} (attempt {}/{})",
        provider.name,
        status,
        backoff,
        attempt + 1,
        max_retries
      );
      tokio::time::sleep(backoff).await;
      continue;
    }

    last_error_message = Some(status.to_string());

    break;
  }

  if last_status == Some(reqwest::StatusCode::TOO_MANY_REQUESTS) {
    return Err(
      LLMError::TooManyRequests(format!("{} transcription rate-limited", provider.name)).into(),
    );
  }

  Err(
    LLMError::ChatCompletionFailed(format!(
      "{} transcription failed with status: {}",
      provider.name,
      last_error_message.unwrap_or_else(|| {
        last_status
          .map(|s| s.to_string())
          .unwrap_or_else(|| "unknown".to_string())
      })
    ))
    .into(),
  )
}

pub async fn transcribe_audio(audio_file: &PathBuf, filename: String) -> Result<(), Error> {
  let provider = resolve_stt_provider()?;
  log::info!("[transcribe] Using {} for speech-to-text", provider.name);

  let max_retries = 3;
  let mut current_retry = 0;

  loop {
    match speech_to_text(&provider, audio_file, Some("en"), Some(0.5)).await {
      Ok(transcription) => {
        log::debug!(
          "------------------ {} Transcribed text: {}",
          provider.name,
          transcription
        );
        let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
        let knapsack_data_dir = home_dir.join(".knapsack");
        let transcripts_dir = knapsack_data_dir.join("transcripts");
        fs::create_dir_all(&transcripts_dir)?;

        let transcript_path = transcripts_dir.join(&filename);
        let mut file = OpenOptions::new()
          .create(true)
          .append(true)
          .open(&transcript_path)?;
        file.write_all(transcription.as_bytes())?;
        file.write_all(b"\n ---END-CHUNK---")?;
        file.write_all(b"\n")?;
        log::debug!("WROTE TRANSCRIPT: {:?}", transcript_path);
        return Ok(());
      }
      Err(e) => {
        current_retry += 1;
        let err_str = format!("{:?}", e);

        if current_retry >= max_retries {
          knap_log_error(
            format!("Error transcribing with {}: {}", provider.name, err_str),
            None,
            None,
          );
          return Err(e);
        }

        let should_retry = err_str.contains("os error 10054")
          || err_str.contains("os error 11001")
          || err_str.contains("dns error")
          || err_str.contains("forcibly closed")
          || err_str.contains("connection error")
          || err_str.contains("104");

        if should_retry || current_retry < 2 {
          log::warn!(
            "Transcription failed, retrying ({}/{}). Error: {}",
            current_retry,
            max_retries,
            err_str
          );
          tokio::time::sleep(tokio::time::Duration::from_secs(1 << current_retry)).await;
          continue;
        }

        knap_log_error(
          format!("Error transcribing with {}: {}", provider.name, err_str),
          None,
          None,
        );
        return Err(e);
      }
    }
  }
}

pub async fn finalize_chunk(audio_filename: String, transcript_filename: String) {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let flac_path = knapsack_data_dir.join("audio");
  let audio_path = flac_path.join(&audio_filename);
  match transcribe_audio(&audio_path, transcript_filename).await {
    Ok(_) => {
      if let Err(e) = fs::remove_file(&audio_path) {
        log::error!("Failed to delete audio file after transcription: {:?}", e);
      } else {
        log::info!("Successfully deleted audio file: {:?}", audio_path);
      }
    }
    Err(e) => {
      log::error!("Failed to transcribe audio: {:?}", e);
    }
  }
}

/// Read the accumulated transcript so far and ask the LLM for a brief,
/// actionable meeting insight (something interesting the user should know,
/// a question they should ask, or an action they should take).
pub async fn generate_meeting_insight(
  input_filename: &str,
  output_filename: &str,
) -> Result<String, Error> {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let transcripts_dir = home_dir.join(".knapsack/transcripts");

  let input_content = read_file_content(&transcripts_dir.join(format!("{}.txt", input_filename)))?;
  let output_content =
    read_file_content(&transcripts_dir.join(format!("{}.txt", output_filename)))?;

  let transcript_so_far = merge_transcripts(&input_content, &output_content);

  if transcript_so_far.trim().is_empty() {
    return Ok("Meeting is still getting started...".to_string());
  }

  let messages = vec![
    LlmMessage {
      sender: MessageSender::System,
      content: "You are a real-time meeting assistant observing a live meeting transcript. \
        Based on the transcript so far, provide ONE brief, actionable insight — something \
        interesting the user should know, a question they could ask, or an action they should \
        take. Be specific, concise (1-2 sentences), and directly relevant to the conversation. \
        Do not summarize the meeting. Do not start with 'Based on the transcript'."
        .to_string(),
    },
    LlmMessage {
      sender: MessageSender::User,
      content: format!(
        "Here is the meeting transcript so far:\n\n{}",
        transcript_so_far
      ),
    },
  ];

  use crate::llm::use_cases::complete::multi_provider_completion;
  match multi_provider_completion(messages).await {
    Ok(insight) => Ok(insight),
    Err(e) => {
      log::warn!("[heartbeat] LLM insight generation failed: {:?}", e);
      Err(Error::from(e))
    }
  }
}

pub fn unify_transcript(
  input_filename: &str,
  output_filename: &str,
  transcript_filename: &str,
) -> Result<(), Error> {
  let input_path = Path::new(input_filename);
  let output_path = Path::new(output_filename);
  let transcript_path = Path::new(transcript_filename);

  let input_content = read_file_content(input_path)?;
  let output_content = read_file_content(output_path)?;

  let merged_content = merge_transcripts(&input_content, &output_content);

  write_merged_content(transcript_path, &merged_content)?;

  Ok(())
}

fn read_file_content(path: &Path) -> Result<String, Error> {
  match File::open(path) {
    Ok(file) => {
      let reader = BufReader::new(file);
      let content: String = reader.lines().collect::<Result<Vec<_>, _>>()?.join("\n");
      Ok(content)
    }
    Err(e) => Ok(String::new()),
  }
}

fn merge_transcripts(input: &str, output: &str) -> String {
  let re = Regex::new(r"\[(\d+\.\d+)\s*-\s*(\d+\.\d+)\]:\s*(.+)").unwrap();
  let mut segments: Vec<(f64, bool, String)> = Vec::new();
  let mut result = String::new();

  let input_chunks: Vec<&str> = input.split("---END-CHUNK---").collect();
  let output_chunks: Vec<&str> = output.split("---END-CHUNK---").collect();

  let max_chunks = input_chunks.len().max(output_chunks.len());
  let mut current_speaker: Option<bool> = None;
  let mut current_text = String::new();

  for i in 0..max_chunks {
    let mut combined_segments: Vec<(f64, bool, String)> = Vec::new();

    if let Some(input_chunk) = input_chunks.get(i) {
      for cap in re.captures_iter(input_chunk.trim()) {
        let end: f64 = cap[2].parse().unwrap();
        let text = cap[3].to_string();
        combined_segments.push((end, true, text));
      }
    }

    if let Some(output_chunk) = output_chunks.get(i) {
      for cap in re.captures_iter(output_chunk.trim()) {
        let end: f64 = cap[2].parse().unwrap();
        let text = cap[3].to_string();
        combined_segments.push((end, false, text));
      }
    }

    combined_segments.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));

    for (_, is_input, text) in combined_segments {
      let trimmed_text = text.trim();
      if trimmed_text != "."
        && trimmed_text != "Thank you."
        && trimmed_text != "Thank you"
        && !trimmed_text.is_empty()
      {
        if current_speaker != Some(is_input) {
          if !current_text.is_empty() {
            let prefix = if current_speaker.unwrap() {
              "Me: "
            } else {
              "Them: "
            };
            result.push_str(&format!("{}{}\n", prefix, current_text.trim()));
            current_text.clear();
          }
          current_speaker = Some(is_input);
        }
        if !current_text.is_empty() {
          current_text.push(' ');
        }
        current_text.push_str(trimmed_text);
      }
    }
  }

  if !current_text.is_empty() {
    let prefix = if current_speaker.unwrap() {
      "Me: "
    } else {
      "Them: "
    };
    result.push_str(&format!("{}{}\n", prefix, current_text.trim()));
  }
  result
}

fn write_merged_content(path: &Path, content: &str) -> Result<(), Error> {
  let mut file = OpenOptions::new()
    .write(true)
    .truncate(true)
    .create(true)
    .open(path)?;

  file.write_all(content.as_bytes())?;
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::io::Read as IoRead;
  use tempfile::TempDir;

  #[test]
  fn test_merge_transcripts_basic_conversation() {
    let input = "[0.00 - 2.50]: Hello, how are you?\n ---END-CHUNK---\n";
    let output = "[1.00 - 3.00]: I'm doing well thanks\n ---END-CHUNK---\n";

    let result = merge_transcripts(input, output);

    assert!(
      result.contains("Me:"),
      "Should contain 'Me:' prefix for input"
    );
    assert!(
      result.contains("Them:"),
      "Should contain 'Them:' prefix for output"
    );
    assert!(
      result.contains("Hello, how are you?"),
      "Should contain input text"
    );
    assert!(
      result.contains("I'm doing well thanks"),
      "Should contain output text"
    );
  }

  #[test]
  fn test_merge_transcripts_filters_noise() {
    let input = "[0.00 - 1.00]: Thank you.\n[1.00 - 2.00]: .\n[2.00 - 3.00]: Actual content here\n ---END-CHUNK---\n";
    let output = "";

    let result = merge_transcripts(input, output);

    assert!(
      !result.contains("Thank you."),
      "Should filter out 'Thank you.'"
    );
    assert!(
      result.contains("Actual content here"),
      "Should keep real content"
    );
  }

  #[test]
  fn test_merge_transcripts_empty_inputs() {
    let result = merge_transcripts("", "");
    assert!(
      result.is_empty(),
      "Empty inputs should produce empty output"
    );
  }

  #[test]
  fn test_merge_transcripts_only_input() {
    let input = "[0.00 - 5.00]: Solo speaker content\n ---END-CHUNK---\n";
    let result = merge_transcripts(input, "");

    assert!(result.contains("Me:"), "Should label input as 'Me:'");
    assert!(result.contains("Solo speaker content"));
    assert!(
      !result.contains("Them:"),
      "Should not have 'Them:' with no output"
    );
  }

  #[test]
  fn test_merge_transcripts_only_output() {
    let output = "[0.00 - 5.00]: Remote speaker content\n ---END-CHUNK---\n";
    let result = merge_transcripts("", output);

    assert!(result.contains("Them:"), "Should label output as 'Them:'");
    assert!(result.contains("Remote speaker content"));
    assert!(
      !result.contains("Me:"),
      "Should not have 'Me:' with no input"
    );
  }

  #[test]
  fn test_merge_transcripts_multiple_chunks() {
    let input = "[0.00 - 2.00]: First chunk input\n ---END-CHUNK---\n[0.00 - 2.00]: Second chunk input\n ---END-CHUNK---\n";
    let output = "[1.00 - 3.00]: First chunk output\n ---END-CHUNK---\n[1.00 - 3.00]: Second chunk output\n ---END-CHUNK---\n";

    let result = merge_transcripts(input, output);

    assert!(result.contains("First chunk input"));
    assert!(result.contains("First chunk output"));
    assert!(result.contains("Second chunk input"));
    assert!(result.contains("Second chunk output"));
  }

  #[test]
  fn test_merge_transcripts_interleaved_timestamps() {
    let input = "[0.00 - 1.00]: Hi there\n[4.00 - 5.00]: Yes I agree\n ---END-CHUNK---\n";
    let output = "[2.00 - 3.00]: Nice to meet you\n[6.00 - 7.00]: Great\n ---END-CHUNK---\n";

    let result = merge_transcripts(input, output);
    let lines: Vec<&str> = result.lines().collect();

    // Segments should be sorted by end timestamp, so order should be:
    // Me: Hi there (end 1.00)
    // Them: Nice to meet you (end 3.00)
    // Me: Yes I agree (end 5.00)
    // Them: Great (end 7.00)
    assert_eq!(lines.len(), 4, "Should have 4 speaker turns");
    assert!(lines[0].starts_with("Me:"));
    assert!(lines[1].starts_with("Them:"));
    assert!(lines[2].starts_with("Me:"));
    assert!(lines[3].starts_with("Them:"));
  }

  #[test]
  fn test_merge_transcripts_consecutive_same_speaker_merged() {
    let input = "[0.00 - 1.00]: First sentence\n[1.00 - 2.00]: Second sentence\n ---END-CHUNK---\n";
    let output = "";

    let result = merge_transcripts(input, output);
    let lines: Vec<&str> = result.lines().collect();

    // Consecutive segments from the same speaker should be merged into one line
    assert_eq!(
      lines.len(),
      1,
      "Consecutive same-speaker segments should merge"
    );
    assert!(lines[0].contains("First sentence"));
    assert!(lines[0].contains("Second sentence"));
  }

  #[test]
  fn test_unify_transcript_with_temp_files() {
    let dir = TempDir::new().unwrap();

    let input_path = dir.path().join("input.txt");
    let output_path = dir.path().join("output.txt");
    let transcript_path = dir.path().join("unified.txt");

    fs::write(
      &input_path,
      "[0.00 - 2.00]: Hello from mic\n ---END-CHUNK---\n",
    )
    .unwrap();
    fs::write(
      &output_path,
      "[1.00 - 3.00]: Hello from speaker\n ---END-CHUNK---\n",
    )
    .unwrap();

    let result = unify_transcript(
      input_path.to_str().unwrap(),
      output_path.to_str().unwrap(),
      transcript_path.to_str().unwrap(),
    );

    assert!(result.is_ok(), "unify_transcript should succeed");

    let content = fs::read_to_string(&transcript_path).unwrap();
    assert!(content.contains("Hello from mic"));
    assert!(content.contains("Hello from speaker"));
  }

  #[test]
  fn test_unify_transcript_missing_input_file() {
    let dir = TempDir::new().unwrap();

    let input_path = dir.path().join("nonexistent_input.txt");
    let output_path = dir.path().join("output.txt");
    let transcript_path = dir.path().join("unified.txt");

    fs::write(
      &output_path,
      "[0.00 - 2.00]: Speaker output\n ---END-CHUNK---\n",
    )
    .unwrap();

    let result = unify_transcript(
      input_path.to_str().unwrap(),
      output_path.to_str().unwrap(),
      transcript_path.to_str().unwrap(),
    );

    // Should succeed even if input file doesn't exist (read_file_content returns empty string)
    assert!(
      result.is_ok(),
      "Should handle missing input file gracefully"
    );

    let content = fs::read_to_string(&transcript_path).unwrap();
    assert!(content.contains("Speaker output"));
  }

  #[test]
  fn test_write_merged_content_creates_file() {
    let dir = TempDir::new().unwrap();
    let path = dir.path().join("test_output.txt");

    let result = write_merged_content(&path, "test content");
    assert!(result.is_ok());

    let content = fs::read_to_string(&path).unwrap();
    assert_eq!(content, "test content");
  }

  #[test]
  fn test_write_merged_content_overwrites_existing() {
    let dir = TempDir::new().unwrap();
    let path = dir.path().join("test_output.txt");

    fs::write(&path, "old content").unwrap();
    let result = write_merged_content(&path, "new content");
    assert!(result.is_ok());

    let content = fs::read_to_string(&path).unwrap();
    assert_eq!(content, "new content");
  }

  #[test]
  fn test_read_file_content_existing_file() {
    let dir = TempDir::new().unwrap();
    let path = dir.path().join("readable.txt");
    fs::write(&path, "line1\nline2\nline3").unwrap();

    let result = read_file_content(&path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), "line1\nline2\nline3");
  }

  #[test]
  fn test_read_file_content_missing_file() {
    let path = Path::new("/tmp/definitely_does_not_exist_knapsack_test.txt");
    let result = read_file_content(path);

    // Should return Ok with empty string, not an error
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), "");
  }
}
