use coreaudio_sys::{
  kAudioDevicePropertyDeviceIsRunningSomewhere, kAudioHardwarePropertyDevices,
  kAudioObjectPropertyElementMain, kAudioObjectPropertyScopeGlobal, kAudioObjectSystemObject,
  AudioDeviceID, AudioObjectGetPropertyData, AudioObjectGetPropertyDataSize,
  AudioObjectPropertyAddress, AudioBufferList, AudioTimeStamp, OSStatus,
};
use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc, Mutex,
};
use std::{mem, ptr};
use tokio::time::{sleep, Duration, Instant};

use super::encode::save_chunk;
use super::transcribe::finalize_chunk;
use crate::utils::log::knap_log_error;
use flacenc::config::Encoder;
use flacenc::error::Verify;
use tokio::runtime::Runtime;
use tokio::sync::Semaphore;

lazy_static::lazy_static! {
  static ref OUTPUT_FILE: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
  static ref AUDIO_SEMAPHORE: Arc<Mutex<Option<Arc<Semaphore>>>> = Arc::new(Mutex::new(None));
}

// Core Audio Tap FFI declarations.
// CATapDescription is an Objective-C class; we interact with it via objc runtime messages.
// AudioHardwareCreateProcessTap / DestroyProcessTap are C functions in CoreAudio.framework.
#[cfg(target_os = "macos")]
extern "C" {
  fn AudioHardwareCreateProcessTap(
    tap_description: *mut libc::c_void, // CATapDescription*
    tap_id: *mut AudioDeviceID,
  ) -> OSStatus;

  fn AudioHardwareDestroyProcessTap(tap_id: AudioDeviceID) -> OSStatus;

  fn AudioHardwareCreateAggregateDevice(
    desc: *const libc::c_void, // CFDictionaryRef
    aggregate_device_id: *mut AudioDeviceID,
  ) -> OSStatus;

  fn AudioHardwareDestroyAggregateDevice(
    aggregate_device_id: AudioDeviceID,
  ) -> OSStatus;

  fn AudioDeviceCreateIOProcIDWithBlock(
    io_proc_id: *mut *mut libc::c_void, // AudioDeviceIOProcID*
    device: AudioDeviceID,
    dispatch_queue: *mut libc::c_void, // dispatch_queue_t
    io_block: *mut libc::c_void,       // Block
  ) -> OSStatus;

  fn AudioDeviceCreateIOProcID(
    device: AudioDeviceID,
    proc_: *const libc::c_void,
    client_data: *mut libc::c_void,
    io_proc_id: *mut *mut libc::c_void,
  ) -> OSStatus;

  fn AudioDeviceStart(
    device: AudioDeviceID,
    io_proc_id: *mut libc::c_void,
  ) -> OSStatus;

  fn AudioDeviceStop(
    device: AudioDeviceID,
    io_proc_id: *mut libc::c_void,
  ) -> OSStatus;

  fn AudioDeviceDestroyIOProcID(
    device: AudioDeviceID,
    io_proc_id: *mut libc::c_void,
  ) -> OSStatus;
}

// Property selectors for reading tap format
#[cfg(target_os = "macos")]
const K_AUDIO_TAP_PROPERTY_FORMAT: u32 = u32::from_be_bytes(*b"tfmt");

use crate::error::Error;

pub fn set_output_file(filename: &str) {
  let mut output_file = OUTPUT_FILE.lock().unwrap();
  *output_file = Some(filename.to_string());
}

pub fn get_output_file() -> Option<String> {
  let output_file = OUTPUT_FILE.lock().unwrap();
  output_file.clone()
}

/// Shared state for the IO proc callback to accumulate audio samples
/// and periodically save them as FLAC chunks (same as the old ScreenCaptureKit delegate).
#[cfg(target_os = "macos")]
struct TapAudioState {
  samples: Vec<f32>,
  chunk_counter: u32,
  last_save: Instant,
  is_paused: Arc<AtomicBool>,
  sample_rate: u32,
  channels: u32,
}

#[cfg(target_os = "macos")]
lazy_static::lazy_static! {
  static ref TAP_AUDIO_STATE: Arc<Mutex<Option<TapAudioState>>> = Arc::new(Mutex::new(None));
}

/// The C-level IO proc callback invoked by Core Audio when audio data is available
/// from the aggregate device (which includes the tap).
#[cfg(target_os = "macos")]
unsafe extern "C" fn tap_io_proc(
  _device: AudioDeviceID,
  _now: *const AudioTimeStamp,
  input_data: *const AudioBufferList,
  _input_time: *const AudioTimeStamp,
  _output_data: *mut AudioBufferList,
  _output_time: *const AudioTimeStamp,
  client_data: *mut libc::c_void,
) -> OSStatus {
  if input_data.is_null() {
    return 0;
  }

  let buffer_list = &*input_data;
  if buffer_list.mNumberBuffers == 0 {
    return 0;
  }

  let mut state_guard = match TAP_AUDIO_STATE.lock() {
    Ok(g) => g,
    Err(_) => return 0,
  };

  let state = match state_guard.as_mut() {
    Some(s) => s,
    None => return 0,
  };

  if state.is_paused.load(Ordering::Relaxed) {
    return 0;
  }

  // Process all buffers — typically one buffer with interleaved float32 samples
  for i in 0..buffer_list.mNumberBuffers as usize {
    let buffer = &buffer_list.mBuffers[i];
    if buffer.mData.is_null() || buffer.mDataByteSize == 0 {
      continue;
    }

    let data_ptr = buffer.mData as *const f32;
    let num_samples = buffer.mDataByteSize as usize / std::mem::size_of::<f32>();
    let num_channels = buffer.mNumberChannels.max(1) as usize;
    let samples_slice = std::slice::from_raw_parts(data_ptr, num_samples);

    // Mix down to mono (same as old ScreenCaptureKit code)
    if num_channels >= 2 {
      for frame in samples_slice.chunks_exact(num_channels) {
        let left = frame[0];
        let right = frame[1];
        state.samples.push(left + right);
      }
    } else {
      state.samples.extend_from_slice(samples_slice);
    }
  }

  // Periodic chunk saving (every 150 seconds, same interval as before)
  let now = Instant::now();
  if now.duration_since(state.last_save) >= Duration::from_secs(150) {
    let chunk: Vec<f32> = state.samples.drain(..).collect();
    let counter = state.chunk_counter;
    state.chunk_counter += 1;
    state.last_save = now;

    // Spawn off saving to avoid blocking the audio thread
    save_chunk_async(chunk, counter);
  }

  0
}

/// Save accumulated audio samples as a FLAC chunk (runs in a background thread).
fn save_chunk_async(chunk: Vec<f32>, counter: u32) {
  let base_filename = get_output_file().unwrap_or_else(|| "default".to_string());
  let filename = format!("{}_{}.flac", base_filename, counter);
  let transcript_filename = format!("{}.txt", base_filename);
  let semaphore = {
    let guard = AUDIO_SEMAPHORE.lock().unwrap();
    let semaphore = guard.clone().unwrap();
    drop(guard);
    semaphore
  };

  std::thread::spawn(move || {
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

/// Record system audio using Core Audio Taps (macOS 14.4+).
/// This uses `AudioHardwareCreateProcessTap` with `CATapDescription`,
/// which triggers `kTCCServiceAudioCapture` ("System Audio Recording Only")
/// instead of the full "Screen & System Audio Recording" permission.
pub async fn record_speaker_output(
  is_recording: Arc<AtomicBool>,
  is_paused: Arc<AtomicBool>,
  output_file: &str,
  semaphore: Arc<Semaphore>,
) -> Result<(), Box<dyn std::error::Error>> {
  #[cfg(not(target_os = "macos"))]
  {
    return Err("Core Audio Taps are only available on macOS".into());
  }

  #[cfg(target_os = "macos")]
  {
    use objc2::runtime::{AnyClass, AnyObject};
    use objc2::{msg_send, msg_send_id, rc::Id};
    use core_foundation::base::{CFRelease, TCFType};
    use core_foundation::string::CFString;
    use core_foundation::dictionary::CFDictionary;
    use core_foundation::number::CFNumber;
    use core_foundation::boolean::CFBoolean;

    // Store semaphore for chunk saving
    {
      let mut audio_semaphore = AUDIO_SEMAPHORE.lock().unwrap();
      *audio_semaphore = Some(semaphore.clone());
    }

    set_output_file(output_file);

    // --- Step 1: Create CATapDescription ---
    // CATapDescription is an Objective-C class in CoreAudio.framework
    let tap_desc_class = AnyClass::get("CATapDescription")
      .ok_or("CATapDescription class not found — requires macOS 14.2+")?;

    // Create a stereo global tap that captures all system audio
    // (excluding our own process to avoid feedback)
    let our_pid = std::process::id() as i32;
    let our_pid_ns: Id<AnyObject> = unsafe {
      let ns_number_class = AnyClass::get("NSNumber").unwrap();
      msg_send_id![ns_number_class, numberWithInt: our_pid]
    };
    let exclude_pids: Id<AnyObject> = unsafe {
      let ns_array_class = AnyClass::get("NSArray").unwrap();
      msg_send_id![ns_array_class, arrayWithObject: &*our_pid_ns]
    };

    let tap_desc: Id<AnyObject> = unsafe {
      let alloc: Id<AnyObject> = msg_send_id![tap_desc_class, alloc];
      msg_send_id![alloc, initStereoGlobalTapButExcludeProcesses: &*exclude_pids]
    };

    // Configure the tap
    unsafe {
      // CATapMuteBehaviorUnmuted = 1 — don't mute the audio for the user
      let _: () = msg_send![&*tap_desc, setMuteBehavior: 1i32];
      // Make it private so it doesn't show up as an audio device to other apps
      let _: () = msg_send![&*tap_desc, setPrivate: true];
    }

    // Get the tap's UUID (needed for aggregate device configuration)
    let tap_uuid: Id<AnyObject> = unsafe {
      msg_send_id![&*tap_desc, uuid]
    };
    let tap_uuid_string: Id<AnyObject> = unsafe {
      msg_send_id![&*tap_uuid, UUIDString]
    };
    let tap_uuid_str: *const libc::c_char = unsafe {
      msg_send![&*tap_uuid_string, UTF8String]
    };
    let tap_uuid_rust = unsafe {
      std::ffi::CStr::from_ptr(tap_uuid_str).to_str().unwrap().to_string()
    };
    log::info!("[audio tap] Tap UUID: {}", tap_uuid_rust);

    // --- Step 2: Create the process tap ---
    let mut tap_id: AudioDeviceID = 0;
    let status = unsafe {
      AudioHardwareCreateProcessTap(
        &*tap_desc as *const AnyObject as *mut libc::c_void,
        &mut tap_id,
      )
    };
    if status != 0 {
      return Err(format!(
        "AudioHardwareCreateProcessTap failed with status {}. \
         Ensure the app has 'System Audio Recording' permission in System Settings.",
        status
      ).into());
    }
    log::info!("[audio tap] Created process tap with ID {}", tap_id);

    // --- Step 3: Create aggregate device with the tap ---
    // Build the tap sub-device entry
    let tap_uid_cf = CFString::new(&tap_uuid_rust);
    let sub_tap_uid_key = CFString::from_static_string("uid");
    let sub_tap_dict = CFDictionary::from_CFType_pairs(&[
      (sub_tap_uid_key.as_CFType(), tap_uid_cf.as_CFType()),
    ]);

    let taps_array = core_foundation::array::CFArray::from_CFTypes(&[sub_tap_dict]);

    // Aggregate device properties
    let agg_name = CFString::new("KnapsackAudioTapAggregate");
    let agg_uid = CFString::new(&format!("ai.knapsack.audio-tap-aggregate-{}", tap_uuid_rust));

    let name_key = CFString::from_static_string("name");
    let uid_key = CFString::from_static_string("uid");
    let tap_list_key = CFString::from_static_string("taps");
    let tap_auto_start_key = CFString::from_static_string("tap_auto_start");
    let private_key = CFString::from_static_string("private");

    let aggregate_dict = CFDictionary::from_CFType_pairs(&[
      (name_key.as_CFType(), agg_name.as_CFType()),
      (uid_key.as_CFType(), agg_uid.as_CFType()),
      (tap_list_key.as_CFType(), taps_array.as_CFType()),
      (tap_auto_start_key.as_CFType(), CFBoolean::false_value().as_CFType()),
      (private_key.as_CFType(), CFBoolean::true_value().as_CFType()),
    ]);

    let mut aggregate_device_id: AudioDeviceID = 0;
    let status = unsafe {
      AudioHardwareCreateAggregateDevice(
        aggregate_dict.as_concrete_TypeRef() as *const libc::c_void,
        &mut aggregate_device_id,
      )
    };
    if status != 0 {
      unsafe { AudioHardwareDestroyProcessTap(tap_id); }
      return Err(format!(
        "AudioHardwareCreateAggregateDevice failed with status {}",
        status
      ).into());
    }
    log::info!("[audio tap] Created aggregate device with ID {}", aggregate_device_id);

    // --- Step 4: Initialize audio state ---
    {
      let mut state = TAP_AUDIO_STATE.lock().unwrap();
      *state = Some(TapAudioState {
        samples: Vec::new(),
        chunk_counter: 0,
        last_save: Instant::now(),
        is_paused: is_paused.clone(),
        sample_rate: 48000,
        channels: 2,
      });
    }

    // --- Step 5: Create IO proc and start capturing ---
    let mut io_proc_id: *mut libc::c_void = ptr::null_mut();
    let status = unsafe {
      AudioDeviceCreateIOProcID(
        aggregate_device_id,
        tap_io_proc as *const libc::c_void,
        ptr::null_mut(),
        &mut io_proc_id,
      )
    };
    if status != 0 {
      unsafe {
        AudioHardwareDestroyAggregateDevice(aggregate_device_id);
        AudioHardwareDestroyProcessTap(tap_id);
      }
      return Err(format!(
        "AudioDeviceCreateIOProcID failed with status {}",
        status
      ).into());
    }
    log::info!("[audio tap] Created IO proc, starting capture...");

    let status = unsafe { AudioDeviceStart(aggregate_device_id, io_proc_id) };
    if status != 0 {
      unsafe {
        AudioDeviceDestroyIOProcID(aggregate_device_id, io_proc_id);
        AudioHardwareDestroyAggregateDevice(aggregate_device_id);
        AudioHardwareDestroyProcessTap(tap_id);
      }
      return Err(format!(
        "AudioDeviceStart failed with status {}",
        status
      ).into());
    }
    log::info!("[audio tap] System audio capture started successfully");

    // --- Step 6: Wait until recording stops ---
    while is_recording.load(Ordering::Relaxed) {
      sleep(Duration::from_millis(100)).await;
    }

    // --- Step 7: Stop and clean up ---
    log::info!("[audio tap] Stopping system audio capture...");
    unsafe {
      AudioDeviceStop(aggregate_device_id, io_proc_id);
      AudioDeviceDestroyIOProcID(aggregate_device_id, io_proc_id);
      AudioHardwareDestroyAggregateDevice(aggregate_device_id);
      AudioHardwareDestroyProcessTap(tap_id);
    }

    // Save any remaining samples
    {
      let mut state_guard = TAP_AUDIO_STATE.lock().unwrap();
      if let Some(mut state) = state_guard.take() {
        if !state.samples.is_empty() {
          let chunk: Vec<f32> = state.samples.drain(..).collect();
          save_chunk_async(chunk, state.chunk_counter);
        }
      }
    }

    log::info!("[audio tap] System audio capture stopped and cleaned up");
    Ok(())
  }
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
