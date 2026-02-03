use std::collections::VecDeque;
use std::fs::File;
use std::io::prelude::*;
use std::path::PathBuf;
use std::sync::mpsc;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use tauri::api::process::Command;
use tokio::time::{sleep, Duration};
use wasapi::*;
use super::encode::save_chunk;
use super::transcribe::finalize_chunk;
use std::time::Instant;
use tokio::runtime::Runtime;
use tokio::sync::Semaphore;

use crate::error::Error;

pub struct AudioRecorder {
  is_recording: Arc<AtomicBool>,
  captured_data: Arc<Mutex<Vec<f32>>>,
  output_path: Arc<String>,
  last_save: Arc<Mutex<Instant>>,
  chunk_counter: Arc<Mutex<u32>>,
  semaphore: Arc<Semaphore>,
  is_paused: Arc<AtomicBool>,
}

pub fn get_output_path(filename: &str) -> PathBuf {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  return knapsack_data_dir.join(format!("{}.raw", filename));
}

impl AudioRecorder {
  pub fn new(semaphore: Arc<Semaphore>) -> Self {
    AudioRecorder {
      is_recording: Arc::new(AtomicBool::new(false)),
      captured_data: Arc::new(Mutex::new(Vec::new())),
      output_path: Arc::new("".to_string()),
      last_save: Arc::new(Mutex::new(Instant::now())),
      chunk_counter: Arc::new(Mutex::new(0)),
      semaphore,
      is_paused: Arc::new(AtomicBool::new(false)),
    }
  }

  pub fn start_recording(&self) -> Result<(), Error> {
    let _res = match initialize_mta().ok() {
      Ok(_) => Some(()),
      Err(_) => {
        log::error!("Error initializting mta");
        None
      }
    };

    let (tx_capt, rx_capt): (
      std::sync::mpsc::SyncSender<Vec<f32>>,
      std::sync::mpsc::Receiver<Vec<f32>>,
  ) = mpsc::sync_channel(2);

    let is_recording_clone = self.is_recording.clone();
    let captured_data = self.captured_data.clone();
    let chunk_counter = self.chunk_counter.clone();
    let semaphore = self.semaphore.clone();
    let output_path = self.output_path.clone();
    let _handle = thread::Builder::new()
      .name("Capture".to_string())
      .spawn(move || {
        let result = Self::capture_loop(tx_capt, is_recording_clone);
        if let Err(err) = result {
          log::error!("Capture failed with error {}", err);
        }
      })?;

    {
      let mut last_save = self.last_save.lock().unwrap();
      *last_save = Instant::now();
    }
    let last_save = self.last_save.clone();
    let mut samples: Vec<f32> = Vec::new();
    loop {
      match rx_capt.recv() {
        Ok(chunk) => {
          {
            let mut captured_data = self.captured_data.lock().unwrap();
            captured_data.extend(chunk.clone());
          }
           samples.extend(chunk);
           let mut last_save = last_save.lock().unwrap();
           let now = Instant::now();
           if now.duration_since(*last_save).as_secs() >= 150 {
               let mut counter = chunk_counter.lock().unwrap();
               let chunk_filename = format!("{}_{}.flac", output_path, *counter);
               let transcript_filename = format!("{}.txt", output_path);
 
               let semaphore_clone = semaphore.clone();
               let samples_to_save: Vec<f32>;
               {
                let mut captured_data = self.captured_data.lock().unwrap();
                samples_to_save = captured_data.drain(..).collect();
              }
              if  !self.is_paused.load(Ordering::SeqCst) {
               std::thread::spawn(move || {
                   let rt = Runtime::new().unwrap();
                   rt.block_on(async {
                       let permit = semaphore_clone.acquire().await.unwrap();
                       let samples_i32: Vec<i32> = samples_to_save
                                    .iter()
                                    .map(|&sample| (sample * i16::MAX as f32) as i16 as i32)
                                    .collect();
                       save_chunk(samples_i32, chunk_filename.clone(), 1, 44100);
                       finalize_chunk(chunk_filename, transcript_filename).await;
                       drop(permit);
                   });
               });
 
               *last_save = now;
               *counter += 1;
              } else{
                *last_save = now;
              }
           }
        }
        Err(err) => {
          log::error!("Some error {}", err);
          return Ok(());
        }
      }
      sleep(Duration::from_millis(100));
      if !self.is_recording.load(Ordering::SeqCst) {
        log::info!("################ stopping writing of speaker recording");
        break;
      }
    }
    Ok(())
  }

  pub fn capture_loop(
    tx_capt: std::sync::mpsc::SyncSender<Vec<f32>>,
    is_recording: Arc<AtomicBool>,
  ) -> Result<(), Box<dyn std::error::Error>> {
    // Use `Direction::Capture` for normal capture,
    // or `Direction::Render` for loopback mode (for capturing from a playback device).
    // Use Render direction with loopback mode for capturing speaker output
    let device = get_default_device(&Direction::Render)?;
    println!("-------- DEVICE DETAILS: {:?}", device.get_state());
    println!("-------- DEVICE DETAILS: {:?}", device.get_friendlyname());
    println!("-------- DEVICE DETAILS: {:?}", device.get_description());

    let mut audio_client = device.get_iaudioclient()?;

    let desired_format = WaveFormat::new(32, 32, &SampleType::Float, 44100, 2, None);

    let blockalign = desired_format.get_blockalign();
    log::info!("Desired capture format: {:?}", desired_format);

    let (def_time, min_time) = audio_client.get_periods()?;
    log::info!("default period {}, min period {}", def_time, min_time);

    match audio_client.initialize_client(
      &desired_format,
      def_time,
      &Direction::Capture,
      &ShareMode::Shared,
      true,
    ) {
      Ok(_) => log::debug!("initialized capture"),
      Err(e) => {
        log::error!("Failed to initialize audio client: {:?}", e.to_string());
        return Err(e.into());
      }
    };
    log::info!("initialized capture");

    // log::info!("audio_client: {:?}", audio_client);

    let h_event = audio_client.set_get_eventhandle()?;
    // log::info!("h_event: {:?}", h_event);

    let buffer_frame_count = audio_client.get_bufferframecount()?;
    let chunksize = buffer_frame_count as usize;
    log::info!("buffer_frame_count: {:?}", buffer_frame_count);

    let render_client = match audio_client.get_audiocaptureclient() {
      Ok(r) => r,
      Err(e) => {
        log::info!("ERROR - couldn't get CaptureClient: {:?}",
        e.to_string());
        return Err(e)
      }
    };
    // log::info!("render_client: {:?}", render_client);
    log::info!("render client!");

    let mut sample_queue: VecDeque<u8> = VecDeque::with_capacity(
      100 * blockalign as usize * (1024 + 2 * buffer_frame_count as usize),
    );
    log::info!("sample_queue: {:?}", sample_queue.len());
    let session_control = audio_client.get_audiosessioncontrol()?;

    log::info!("state before start: {:?}", session_control.get_state());
    audio_client.start_stream()?;
    log::info!("state after start: {:?}", session_control.get_state());

    loop {
      while sample_queue.len() > (blockalign as usize * chunksize) {
        let mut chunk = vec![0f32; chunksize];
                for i in 0..chunksize {
                    let left = f32::from_le_bytes([
                        sample_queue.pop_front().unwrap(),
                        sample_queue.pop_front().unwrap(),
                        sample_queue.pop_front().unwrap(),
                        sample_queue.pop_front().unwrap(),
                    ]);
                    let right = f32::from_le_bytes([
                        sample_queue.pop_front().unwrap(),
                        sample_queue.pop_front().unwrap(),
                        sample_queue.pop_front().unwrap(),
                        sample_queue.pop_front().unwrap(),
                    ]);
                    chunk[i] = (left + right); // Convert to mono
                }
                tx_capt.send(chunk)?;
      }
      // log::info!("capturing");
      render_client.read_from_device_to_deque(&mut sample_queue)?;
      if h_event.wait_for_event(3000).is_err() {
        log::warn!("Timeout occurred, adding silence to maintain capture");
        // Add silence (zeros) equivalent to one buffer frame count
        let silence = vec![0u8; blockalign as usize * buffer_frame_count as usize];
        sample_queue.extend(silence);
      }

      if !(is_recording.load(Ordering::SeqCst)) {
        log::info!("stopping recording of speaker");
        audio_client.stop_stream()?;
        break;
      }
    }
    Ok(())
  }

  pub fn stop_recording(&self) {
    println!("ABOUT TO START the atomic bool change");
    // self.is_recording.store(false, Ordering::SeqCst);
    println!("FINISHED the atomic bool change");
    let semaphore = self.semaphore.clone();
        let output_path = self.output_path.clone();
        let chunk_counter = self.chunk_counter.clone();
        let final_samples: Vec<f32> = {
          let mut captured_data = self.captured_data.lock().unwrap();
          std::mem::take(&mut *captured_data)
      };
        std::thread::spawn(move || {
            let rt = Runtime::new().unwrap();
            rt.block_on(async {
                let permit = semaphore.acquire().await.unwrap();

                let mut counter = chunk_counter.lock().unwrap();
                let chunk_filename = format!("{}_{}.flac", output_path, *counter);
                let transcript_filename = format!("{}.txt", output_path);
            if !final_samples.is_empty() {
                let samples_i32: Vec<i32> = final_samples
                    .iter()
                    .map(|&sample| (sample * i16::MAX as f32) as i16 as i32)
                    .collect();
                save_chunk(samples_i32, chunk_filename.clone(), 1, 44100);
                finalize_chunk(chunk_filename, transcript_filename).await;

                *counter += 1;
            }
                drop(permit);
            });
        });
  }


}
pub fn count_microphone_users() -> u64 {
  // TODO:
  return 2 as u64;
}

pub async fn record_speaker_output(
  is_recording: Arc<AtomicBool>,
  is_paused: Arc<AtomicBool>,
  output_file: &str,
  semaphore: Arc<Semaphore>
) -> Result<(), Box<dyn std::error::Error>> {
  println!("------- RECORDING WINDOWS SPEAKER OUTPUT -------");
  let audio_recorder = AudioRecorder {
    is_recording: is_recording.clone(),
    captured_data: Arc::new(Mutex::new(Vec::new())),
    output_path: Arc::new(output_file.to_string()),
    last_save: Arc::new(Mutex::new(Instant::now())),
    chunk_counter: Arc::new(Mutex::new(0)),
    semaphore,
    is_paused: is_paused.clone(),
  };

  // Start recording and keep running until is_recording becomes false
  let res = match audio_recorder.start_recording() {
    Ok(_) => {
      while is_recording.load(Ordering::SeqCst) {
        sleep(Duration::from_millis(100)).await;
      }
      println!("STOPPING RECORDING...");
      audio_recorder.stop_recording();
      println!("STOPPED RECORDING!");
      Ok(())
    },
    Err(_) => Err(format!("Failed to start recording.").into()),
  };
  res
}
