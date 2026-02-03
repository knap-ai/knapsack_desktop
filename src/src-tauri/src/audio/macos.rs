use coreaudio_sys::{
  kAudioDevicePropertyDeviceIsRunningSomewhere, kAudioHardwarePropertyDevices,
  kAudioObjectPropertyElementMain, kAudioObjectPropertyScopeGlobal, kAudioObjectSystemObject,
  AudioDeviceID, AudioObjectGetPropertyData, AudioObjectGetPropertyDataSize,
  AudioObjectPropertyAddress,
};
use hound::WavWriter;
use std::fs::File;
use std::io::BufWriter;
use std::path::PathBuf;
use std::sync::mpsc::channel;
use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc, Mutex,
};
use std::{mem, ptr};
use tauri::api::process::Command;
use tokio::time::{sleep, Duration, Instant};

use super::encode::save_chunk;
use super::transcribe::finalize_chunk;
use crate::utils::log::knap_log_error;
use flacenc::bitsink::ByteSink;
use flacenc::component::BitRepr;
use flacenc::config::Encoder;
use flacenc::error::Verified;
use flacenc::error::Verify;
use flacenc::source::MemSource;
use std::fs;
use std::io::Write;
use std::sync::MutexGuard;
use tokio::runtime::Runtime;
use tokio::sync::Semaphore;

lazy_static::lazy_static! {
  static ref OUTPUT_FILE: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
  static ref AUDIO_SEMAPHORE: Arc<Mutex<Option<Arc<Semaphore>>>> = Arc::new(Mutex::new(None));
}

// MacOS imports
#[cfg(target_os = "macos")]
use core_foundation::base::TCFType;
#[cfg(target_os = "macos")]
use core_media::sample_buffer::{CMSampleBuffer, CMSampleBufferRef};

#[cfg(target_os = "macos")]
use core_video::pixel_buffer::CVPixelBuffer;
#[cfg(target_os = "macos")]
use dispatch2::{Queue, QueueAttribute};
#[cfg(target_os = "macos")]
use libc::size_t;

#[cfg(target_os = "macos")]
use objc2::{
  declare_class, extern_methods, msg_send_id, mutability,
  rc::{Allocated, Id},
  runtime::ProtocolObject,
  ClassType, DeclaredClass,
};
#[cfg(target_os = "macos")]
use objc2_foundation::{NSArray, NSError, NSObject, NSObjectProtocol};
#[cfg(target_os = "macos")]
use screen_capture_kit::{
  shareable_content::SCShareableContent,
  stream::{
    SCContentFilter, SCStream, SCStreamConfiguration, SCStreamDelegate, SCStreamOutput,
    SCStreamOutputType,
  },
};

use crate::error::Error;

pub fn set_output_file(filename: &str) {
  let mut output_file = OUTPUT_FILE.lock().unwrap();
  *output_file = Some(filename.to_string());
}

pub fn get_output_file() -> Option<String> {
  let output_file = OUTPUT_FILE.lock().unwrap();
  output_file.clone()
}

pub async fn record_speaker_output(
  is_recording: Arc<AtomicBool>,
  is_paused: Arc<AtomicBool>,
  output_file: &str,
  semaphore: Arc<Semaphore>,
) -> Result<(), Box<dyn std::error::Error>> {
  let mut audio_semaphore = AUDIO_SEMAPHORE.lock().unwrap();
  *audio_semaphore = Some(semaphore.clone());
  drop(audio_semaphore);

  let (tx, rx) = channel();
  SCShareableContent::get_shareable_content_with_completion_closure(
    move |shareable_content, error| {
      let ret = shareable_content.ok_or_else(|| error.unwrap());
      tx.send(ret).unwrap();
    },
  );
  let shareable_content = rx.recv().unwrap();
  if let Err(error) = shareable_content {
    return Err(format!("error: {:?}", error).into());
  }
  let shareable_content = shareable_content.unwrap();
  let displays = shareable_content.displays();
  let display = match displays.first() {
    Some(display) => display,
    None => {
      return Err("No display found".into());
    }
  };
  let filter = SCContentFilter::init_with_display_exclude_windows(
    SCContentFilter::alloc(),
    display,
    &NSArray::new(),
  );
  let configuration: Id<SCStreamConfiguration> = SCStreamConfiguration::new();
  configuration.set_width(display.width() as size_t);
  configuration.set_height(display.height() as size_t);
  configuration.set_captures_audio(true);
  configuration.set_excludes_current_process_audio(false);
  set_output_file(output_file);
  let delegate = Delegate::new();
  let stream_error = ProtocolObject::from_ref(&*delegate);
  let stream = SCStream::init_with_filter(SCStream::alloc(), &filter, &configuration, stream_error);
  let queue = Queue::new("com.screen_capture.queue", QueueAttribute::Serial);
  let output = ProtocolObject::from_ref(&*delegate);
  if let Err(ret) = stream.add_stream_output(output.clone(), SCStreamOutputType::Screen, &queue) {
    return Err(format!("Failed to add screen output: {:?}", ret).into());
  }
  if let Err(ret) = stream.add_stream_output(output, SCStreamOutputType::Audio, &queue) {
    return Err(format!("Failed to add audio output: {:?}", ret).into());
  }
  stream.start_capture(move |result| {
    if let Some(error) = result {
      println!("error: {:?}", error);
      knap_log_error(
        format!("Error in speaker output recording: {:?}", error.to_string()),
        None,
        None,
      );
    }
  });

  while is_recording.load(Ordering::Relaxed) {
    if is_paused.load(Ordering::Relaxed) {
      delegate.ivars().is_paused.store(true, Ordering::Relaxed);
    } else {
      delegate.ivars().is_paused.store(false, Ordering::Relaxed);
    }
    sleep(Duration::from_millis(100)).await;
  }
  stream.stop_capture(move |result| {
    if let Some(error) = result {
      knap_log_error(
        format!("Error in speaker output recording: {:?}", error.to_string()),
        None,
        None,
      );
    }
  });

  Ok(())
}

pub fn count_microphone_users() -> u64 {
  let address = AudioObjectPropertyAddress {
    mSelector: kAudioHardwarePropertyDevices,
    mScope: kAudioObjectPropertyScopeGlobal,
    mElement: kAudioObjectPropertyElementMain,
  };

  let mut size = 0u32;
  let status = unsafe {
    AudioObjectGetPropertyDataSize(
      kAudioObjectSystemObject,
      &address,
      0,
      ptr::null(),
      &mut size,
    )
  };
  if status != 0 {
    return 0;
  }

  let num_devices = size as usize / mem::size_of::<AudioDeviceID>();
  if num_devices == 0 {
    return 0;
  }

  let mut devices: Vec<AudioDeviceID> = Vec::with_capacity(num_devices);
  let status = unsafe {
    AudioObjectGetPropertyData(
      kAudioObjectSystemObject,
      &address,
      0,
      ptr::null(),
      &mut size,
      devices.as_mut_ptr() as *mut _,
    )
  };
  if status != 0 {
    return 0;
  }

  unsafe {
    devices.set_len(num_devices);
  }

  let address_in_use = AudioObjectPropertyAddress {
    mSelector: kAudioDevicePropertyDeviceIsRunningSomewhere,
    mScope: kAudioObjectPropertyScopeGlobal,
    mElement: kAudioObjectPropertyElementMain,
  };

  let count = devices
    .iter()
    .filter(|&&device_id| {
      let mut in_use: u32 = 0;
      let mut prop_size = mem::size_of::<u32>() as u32;

      let status_in_use = unsafe {
        AudioObjectGetPropertyData(
          device_id,
          &address_in_use,
          0,
          ptr::null(),
          &mut prop_size,
          &mut in_use as *mut u32 as *mut _,
        )
      };
      status_in_use == 0 && in_use != 0
    })
    .count();

  count as u64
}

/*
 *
 * Everything below here is Objective-C
 * binding code to interface with ScreenCaptureKit.
 *
 */

pub struct DelegateIvars {
  samples: Arc<Mutex<Vec<f32>>>,
  config: Arc<Mutex<Option<Verified<Encoder>>>>,
  chunk_counter: Arc<Mutex<u32>>,
  last_save: Arc<Mutex<Instant>>,
  is_paused: Arc<AtomicBool>,
}

declare_class!(
  struct Delegate;

  unsafe impl ClassType for Delegate {
    type Super = NSObject;
    type Mutability = mutability::Mutable;
    const NAME: &'static str = "StreamOutputSampleBufferDelegate";
  }

  impl DeclaredClass for Delegate {
    type Ivars = DelegateIvars;
  }

  unsafe impl NSObjectProtocol for Delegate {}

  unsafe impl SCStreamOutput for Delegate {
    #[method(stream:didOutputSampleBuffer:ofType:)]
    unsafe fn stream_did_output_sample_buffer(&self, _stream: &SCStream, sample_buffer: CMSampleBufferRef, of_type: SCStreamOutputType) {

      match of_type {
        SCStreamOutputType::Screen => {
          let sample_buffer = CMSampleBuffer::wrap_under_get_rule(sample_buffer);
          if let Some(image_buffer) = sample_buffer.get_image_buffer() {
            if let Some(_pixel_buffer) = image_buffer.downcast::<CVPixelBuffer>() {
              // This is commented out because we don't actually
              // need to record the screen.
              // println!("pixel buffer: {:?}", _pixel_buffer);
            }
          }
        },
        SCStreamOutputType::Audio => {
          let sample_buffer = CMSampleBuffer::wrap_under_get_rule(sample_buffer);

          if let Some(block_buffer) = sample_buffer.get_data_buffer() {
              let length = block_buffer.get_data_length();
              let mut data = vec![0u8; length as usize];

              let _res = match block_buffer.copy_data_bytes(0, data.as_mut_slice()) {
                  Ok(r) => r,
                  Err(e) => {
                      println!("Audio Data Error: {:?}", e);
                      return;
                  }
              };

              if let Ok(mut samples) = self.ivars().samples.lock() {
                  for chunk in data.chunks_exact(8) {
                      if let (Ok(left), Ok(right)) = (chunk[..4].try_into(), chunk[4..].try_into()) {
                          let left_sample = f32::from_le_bytes(left);
                          let right_sample = f32::from_le_bytes(right);

                          let mono_sample = left_sample + right_sample;

                          samples.push(mono_sample);
                      }
                  }

                  let now = Instant::now();
                  let mut last_save = self.ivars().last_save.lock().unwrap();
                  if now.duration_since(*last_save) >= Duration::from_secs(150) {
                    if self.ivars().is_paused.load(Ordering::Relaxed) {
                      *last_save = now;
                      let chunk: Vec<f32> = samples.drain(..).collect();

                    } else{
                      let mut counter = self.ivars().chunk_counter.lock().unwrap();
                      self.save_chunk_mac(samples, *counter);
                      *counter += 1;
                      *last_save = now;
                    }
                  }
              }
          }
      },
        _ => {}
      }
    }
  }

unsafe impl SCStreamDelegate for Delegate {
  #[method(stream:didStopWithError:)]
  unsafe fn stream_did_stop_with_error(&self, _stream: &SCStream, error: &NSError) {
    println!("error: {:?}", error);
  }
}

unsafe impl Delegate {
  #[method_id(init)]
  fn init(this: Allocated<Self>) -> Option<Id<Self>> {
    let config = Encoder::default().into_verified().expect("Config data error.");
    println!("Encoder config: {:?}", config);

    let this = this.set_ivars(DelegateIvars {
      samples: Arc::new(Mutex::new(Vec::new())),
      config: Arc::new(Mutex::new(Some(config))),
      chunk_counter: Arc::new(Mutex::new(0)),
      last_save: Arc::new(Mutex::new(Instant::now())),
      is_paused: Arc::new(AtomicBool::new(false)),
    });
    unsafe { msg_send_id![super(this), init] }
  }
}
);

impl Delegate {
  fn save_chunk_mac(&self, mut samples: MutexGuard<Vec<f32>>, counter: u32) {
    let chunk: Vec<f32> = samples.drain(..).collect();

    let base_filename = get_output_file().unwrap_or_else(|| "default".to_string());
    let filename = format!("{}_{}.flac", base_filename, counter);
    let transcript_filename = format!("{}.txt", base_filename);
    let semaphore = {
      let guard = AUDIO_SEMAPHORE.lock().unwrap();
      let semaphore = guard.clone().unwrap();
      drop(guard); // Explicitly drop the guard to release the lock
      semaphore
    };

    std::thread::spawn(move || {
      let semaphore = semaphore.clone();
      let rt = Runtime::new().unwrap();
      rt.block_on(async {
        let permit = semaphore.acquire().await.unwrap();
        let samples_16bit: Vec<i32> = chunk
          .iter()
          .map(|&s| (s * i16::MAX as f32) as i16 as i32)
          .collect();
        save_chunk(samples_16bit, filename.clone(), 1, 48000);
        finalize_chunk(filename, transcript_filename).await;
        drop(permit);
      });
    });
  }
}

impl Drop for Delegate {
  fn drop(&mut self) {
    let samples = self.ivars().samples.lock().unwrap();
    let counter = *self.ivars().chunk_counter.lock().unwrap();
    self.save_chunk_mac(samples, counter);
  }
}

extern_methods!(
  unsafe impl Delegate {
    #[method_id(new)]
    pub fn new() -> Id<Self>;
  }
);
