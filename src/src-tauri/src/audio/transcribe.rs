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
