use flacenc::bitsink::ByteSink;
use flacenc::component::BitRepr;
use flacenc::config::Encoder;
use flacenc::error::Verify;
use flacenc::source::MemSource;
use std::fs;

pub fn save_chunk(samples: Vec<i32>, filename: String, channel: usize, sample_rate: usize) {
  let config = Encoder::default()
    .into_verified()
    .expect("Config data error.");

  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack/");
  let flac_path = knapsack_data_dir.join("audio/");
  if !flac_path.exists() {
    fs::create_dir_all(&flac_path).expect("Failed to create directory");
  }
  let output_path = flac_path.join(&filename);

  let source = MemSource::from_samples(&samples, channel, 16, sample_rate);

  match flacenc::encode_with_fixed_block_size(&config, source, config.block_size) {
    Ok(flac_stream) => {
      let mut sink = ByteSink::new();
      flac_stream.write(&mut sink);

      if let Err(e) = std::fs::write(&output_path, sink.as_slice()) {
        eprintln!("Failed to write chunk {}: {}", filename, e);
      } else {
        println!("Successfully wrote FLAC file: {:?}", output_path);
      }
    }
    Err(e) => {
      eprintln!("Encode failed for chunk {}: {:?}", filename, e);
    }
  }
}
