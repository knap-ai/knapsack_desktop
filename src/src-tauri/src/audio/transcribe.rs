use crate::error::Error;
use crate::llm::groq::llm::GroqLlm;
use crate::utils::log::knap_log_error;
use regex::Regex;
use std::collections::BTreeMap;
use std::fs;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};

pub async fn transcribe_audio(audio_file: &PathBuf, filename: String) -> Result<(), Error> {
  let groq = GroqLlm::new()?;
  match groq
    .speech_to_text_request(audio_file, Some("en".to_string()), Some(0.5))
    .await
  {
    Ok(transcription) => {
      log::debug!(
        "------------------ Groq Transcribed text: {}",
        transcription
      );
      let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
      let knapsack_data_dir = home_dir.join(".knapsack");
      let transcripts_dir = knapsack_data_dir.join("transcripts");
      fs::create_dir_all(&transcripts_dir)?;

      let transcript_path = transcripts_dir.join(filename);

      let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&transcript_path)?;
      file.write_all(transcription.as_bytes())?;
      file.write_all(b"\n ---END-CHUNK---")?;
      file.write_all(b"\n")?;
      log::debug!("WROTE TRANSCRIPT: {:?}", transcript_path);
      Ok(())
    }
    Err(e) => {
      knap_log_error(format!("Error transcribing with Groq: {:?}", e), None, None);
      Err(e)
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

    assert!(result.contains("Me:"), "Should contain 'Me:' prefix for input");
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
    assert!(result.is_empty(), "Empty inputs should produce empty output");
  }

  #[test]
  fn test_merge_transcripts_only_input() {
    let input = "[0.00 - 5.00]: Solo speaker content\n ---END-CHUNK---\n";
    let result = merge_transcripts(input, "");

    assert!(result.contains("Me:"), "Should label input as 'Me:'");
    assert!(result.contains("Solo speaker content"));
    assert!(!result.contains("Them:"), "Should not have 'Them:' with no output");
  }

  #[test]
  fn test_merge_transcripts_only_output() {
    let output = "[0.00 - 5.00]: Remote speaker content\n ---END-CHUNK---\n";
    let result = merge_transcripts("", output);

    assert!(result.contains("Them:"), "Should label output as 'Them:'");
    assert!(result.contains("Remote speaker content"));
    assert!(!result.contains("Me:"), "Should not have 'Me:' with no input");
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
