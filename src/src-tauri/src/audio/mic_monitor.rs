use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use tauri::AppHandle;

/// Start monitoring the default audio input device.
/// Emits `mic-activated` to the main window whenever the microphone turns on
/// (from any app), as long as Knapsack itself is not already recording.
/// macOS only; no-op on other platforms.
#[cfg(target_os = "macos")]
pub fn start_mic_monitor(app: AppHandle, is_knapsack_recording: Arc<AtomicBool>) {
    tauri::async_runtime::spawn(async move {
        run_monitor(app, is_knapsack_recording).await;
    });
}

#[cfg(not(target_os = "macos"))]
pub fn start_mic_monitor(_app: AppHandle, _is_knapsack_recording: Arc<AtomicBool>) {}

#[cfg(target_os = "macos")]
async fn run_monitor(app: AppHandle, is_knapsack_recording: Arc<AtomicBool>) {
    use std::time::{Duration, Instant};
    use tokio::time::sleep;

    let cooldown = Duration::from_secs(30);
    let mut was_active = false;
    let mut last_notified = Instant::now()
        .checked_sub(cooldown)
        .unwrap_or_else(Instant::now);

    loop {
        sleep(Duration::from_millis(500)).await;

        let active = is_default_input_active();

        if active && !was_active {
            let knapsack_recording = is_knapsack_recording.load(Ordering::Relaxed);
            let cooldown_elapsed = last_notified.elapsed() >= cooldown;

            if !knapsack_recording && cooldown_elapsed {
                if let Some(window) = app.get_window("main") {
                    let _ = window.emit("mic-activated", ());
                }
                last_notified = Instant::now();
            }
        }

        was_active = active;
    }
}

/// Query whether the system's default audio input device is currently in use
/// by any process (including Knapsack itself — the caller must filter that).
#[cfg(target_os = "macos")]
fn is_default_input_active() -> bool {
    use coreaudio_sys::{
        kAudioDevicePropertyDeviceIsRunningSomewhere, kAudioObjectPropertyElementMain,
        kAudioObjectPropertyScopeGlobal, kAudioObjectSystemObject, AudioDeviceID,
        AudioObjectGetPropertyData, AudioObjectPropertyAddress,
    };
    use std::{mem, ptr};

    // FourCC for kAudioHardwarePropertyDefaultInputDevice = 'dIn '
    const K_DEFAULT_INPUT_DEVICE: u32 = u32::from_be_bytes(*b"dIn ");

    let addr = AudioObjectPropertyAddress {
        mSelector: K_DEFAULT_INPUT_DEVICE,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain,
    };

    let mut device_id: AudioDeviceID = 0;
    let mut size = mem::size_of::<AudioDeviceID>() as u32;
    let status = unsafe {
        AudioObjectGetPropertyData(
            kAudioObjectSystemObject,
            &addr,
            0,
            ptr::null(),
            &mut size,
            &mut device_id as *mut AudioDeviceID as *mut _,
        )
    };
    if status != 0 || device_id == 0 {
        return false;
    }

    let running_addr = AudioObjectPropertyAddress {
        mSelector: kAudioDevicePropertyDeviceIsRunningSomewhere,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain,
    };
    let mut in_use: u32 = 0;
    let mut prop_size = mem::size_of::<u32>() as u32;
    let status = unsafe {
        AudioObjectGetPropertyData(
            device_id,
            &running_addr,
            0,
            ptr::null(),
            &mut prop_size,
            &mut in_use as *mut u32 as *mut _,
        )
    };
    status == 0 && in_use != 0
}
