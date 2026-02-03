use hound;
use serde::Serialize;
use std::path::Path;
use crate::error::Error;


use log::{debug, info};

#[derive(Debug, Serialize)]
pub struct TranscriberOutput {
  start_timestamp: i64,
  end_timestamp: i64,
  text: String,
}

impl TranscriberOutput {
  pub fn get_start_timestamp(&self) -> &i64 {
    &self.start_timestamp
  }

  pub fn get_end_timestamp(&self) -> &i64 {
    &self.end_timestamp
  }

  pub fn get_text(&self) -> &str {
    &self.text
  }
}

pub struct Transcriber {
  // ctx: whisper_rs::WhisperContext,
  ctx: String,
}

impl Transcriber {
  pub fn new(model: &str) -> Transcriber {
    log::info!("Loading model: {}", model);
    Transcriber {
      ctx: model.to_string(),
    }

    // Transcriber {
    //   ctx: whisper_rs::WhisperContext::new_with_params(
    //     &model,
    //     whisper_rs::WhisperContextParameters::default(),
    //   )
    //   .expect("failed to load model"),
    // }
  }

  pub fn transcribe(
    &self,
    audio_path: &str,
    //whisper_params: Option<whisper_rs::FullParams>,
  ) -> Result<TranscriberOutput, Error> {
    // let audio_data = parse_audio_file(audio_path)?;

    // let mut state: whisper_rs::WhisperState =
    //   self.ctx.create_state().expect("Failed to create state");
    // let params: whisper_rs::FullParams = match whisper_params {
    //   Some(whisper_params) => whisper_params,
    //   None => whisper_rs::FullParams::new(whisper_rs::SamplingStrategy::Greedy { best_of: 1 }),
    // };

    // state
    //   .full(params, &audio_data[..])
    //   .expect("failed to run the model");

    let mut transcribed_string = "".to_string();
    let mut start_timestamp = 0;
    let mut end_timestamp = 0;

    // let num_segments = state
    //   .full_n_segments()
    //   .expect("failed to get number of segments");
    // for i in 0..num_segments {
    //   let segment = state
    //     .full_get_segment_text(i)
    //     .expect("failed to get segment");
    //   start_timestamp = state
    //     .full_get_segment_t0(i)
    //     .expect("failed to get segment start timestamp");
    //   end_timestamp = state
    //     .full_get_segment_t1(i)
    //     .expect("failed to get segment end timestamp");
    //   log::info!(
    //     "[start: {}, end: {}] - {}",
    //     start_timestamp,
    //     end_timestamp,
    //     segment
    //   );
    //   transcribed_string.push_str(&segment);
    // }

    Ok(TranscriberOutput {
      start_timestamp,
      end_timestamp,
      text: transcribed_string,
    })
  }
}

pub fn parse_audio_file(audio_path: &str) -> Result<Vec<f32>, Error> {
  let mut reader = hound::WavReader::open(audio_path).map_err(Error::from)?;
  let spec = reader.spec();
  log::info!(
    "Input audio format: {} Hz, {} channels, {} bits per sample, {:?}",
    spec.sample_rate,
    spec.channels,
    spec.bits_per_sample,
    spec.sample_format
  );

  let mut samples: Vec<f32> = match spec.sample_format {
    hound::SampleFormat::Float => reader
      .samples::<f32>()
      .collect::<Result<Vec<f32>, _>>()
      .map_err(Error::from)?,
    hound::SampleFormat::Int => {
      if spec.bits_per_sample == 16 {
        reader
          .samples::<i16>()
          .map(|s| s.map(|s| s as f32 / i16::MAX as f32))
          .collect::<Result<Vec<f32>, _>>()
          .map_err(Error::from)?
      } else {
        reader
          .samples::<i32>()
          .map(|s| s.map(|s| s as f32 / i32::MAX as f32))
          .collect::<Result<Vec<f32>, _>>()
          .map_err(Error::from)?
      }
    }
  };

  if spec.channels == 2 {
    samples = samples
      .chunks(2)
      .map(|chunk| (chunk[0] + chunk[1]) / 2.0)
      .collect();
  }

  // Whisper_rs requires 16kHz input
  if spec.sample_rate != 16000 {
    // Simple linear interpolation for resampling
    let scale = spec.sample_rate as f32 / 16000.0;
    let new_len = (samples.len() as f32 / scale) as usize;
    let mut resampled = Vec::with_capacity(new_len);

    for i in 0..new_len - 1 {
      let pos = i as f32 * scale;
      let pos_floor = pos.floor() as usize;
      let pos_ceil = (pos_floor + 1).min(samples.len() - 1);
      let t = pos - pos_floor as f32;

      if pos_floor <= samples.len() - 1 {
        let sample = samples[pos_floor] * (1.0 - t) + samples[pos_ceil] * t;
        resampled.push(sample);
      }
    }
    samples = resampled;
  }

  Ok(samples)
}
