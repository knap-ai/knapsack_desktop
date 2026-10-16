use std::sync::Once;

use tauri::{AppHandle, GlobalShortcutManager, Manager, Wry};

#[macro_export]
macro_rules! panel {
  ($app_handle:expr) => {{
    let handle = $app_handle.app_handle();

    let panel = handle
      .state::<$crate::spotlight::State>()
      .0
      .lock()
      .unwrap()
      .panel
      .clone();

    panel.unwrap()
  }};
}

static INIT: Once = Once::new();
pub static WINDOW_LABEL: &str = "main";
static WINDOW_CORNER_RADIUS: f64 = 9.0;

#[tauri::command]
fn toggle_window_visibility(app_handle: AppHandle<Wry>) {
  let window = app_handle.get_window("main_window").unwrap();

  if window.is_visible().unwrap() {
    window.hide().unwrap();
  } else {
    window.show().unwrap();
    window.set_focus().unwrap();
  }
}

#[tauri::command]
pub fn kn_init_app(app_handle: AppHandle<Wry>) {
  log::debug!("init_spotlight_window");
  INIT.call_once(|| {
    log::debug!("init_spotlight_window call_once");
    register_shortcut(app_handle);
  });
}

fn register_shortcut(app_handle: AppHandle<Wry>) {
  let mut shortcut_manager = app_handle.global_shortcut_manager();
  let window = app_handle.get_window(WINDOW_LABEL).unwrap();
  window.show().expect("Failed to show window");
  // let panel = panel!(app_handle);
  if let Err(e) = shortcut_manager.register("Option+k", move || {
    if window.is_visible().unwrap_or(false) {
      window.hide().expect("Failed to hide window");
    } else {
      // position_window_at_the_center_of_the_monitor_with_cursor(&window);
      window.show().expect("Failed to show window");
    };
  }) {
    log::warn!("Failed to register Option+k shortcut: {}", e);
  }

  // Quick Chat entry points are intentionally retired. Keep the hidden overlay
  // window and its stored conversation data for history/migration purposes, but
  // do not register a shortcut that can open the broken surface.
}

#[tauri::command]
pub fn kn_show_app(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("main") {
    log::debug!("show_spotlight: 1");
    // panel!(app_handle).show();
    window.show().expect("Failed to show window");
    log::debug!("show_spotlight: 2");
  }
}

#[tauri::command]
pub fn kn_hide_app(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("main") {
    log::debug!("hide_spotlight: 1");
    // panel!(app_handle).order_out(None);
    window.hide().expect("Failed to hide window");
    log::debug!("hide_spotlight: 2");
  }
}

// ── Overlay (Quick Chat Panel) commands ──

#[tauri::command]
pub fn show_overlay_window(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("overlay") {
    window.show().expect("Failed to show overlay window");
    window.set_focus().expect("Failed to focus overlay window");
  }
}

#[tauri::command]
pub fn hide_overlay_window(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("overlay") {
    window.hide().expect("Failed to hide overlay window");
  }
}

#[tauri::command]
pub fn toggle_overlay_window(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("overlay") {
    if window.is_visible().unwrap_or(false) {
      window.hide().expect("Failed to hide overlay window");
    } else {
      window.show().expect("Failed to show overlay window");
      window.set_focus().expect("Failed to focus overlay window");
    }
  }
}

// ── Recording indicator floating pill commands ──

#[tauri::command]
pub fn show_recording_indicator(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("recording-indicator") {
    if !app_handle.state::<crate::RecordingState>().capture_is_active() {
      let _ = window.hide();
      return;
    }
    window.show().expect("Failed to show recording indicator");
    window
      .emit("recording-indicator-show", {})
      .unwrap_or_default();
  }
}

/// Restore the persistent pill after a meeting-only surface has hidden it.
/// Unlike the recording-start command, this deliberately does not emit the
/// start event, so an in-progress elapsed timer is preserved.
#[tauri::command]
pub fn restore_recording_indicator(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("recording-indicator") {
    if app_handle.state::<crate::RecordingState>().capture_is_active() {
      let _ = window.show();
    } else {
      let _ = window.hide();
    }
  }
}

#[tauri::command]
pub fn hide_recording_indicator(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("recording-indicator") {
    window.hide().expect("Failed to hide recording indicator");
  }
}

// TODO: do we still need these, if we're using an NSWindow instead of an NSPanel?
#[tauri::command]
pub fn set_window_level_bottom(app_handle: AppHandle<Wry>) {
  if let Some(_window) = app_handle.get_window("main_window") {
    log::debug!("set_window_level_bottom_spotlight: 1");
    // panel!(app_handle).set_level(1); // NSNormalWindowLevel + 1 so it is above your other windows but below the security modal
    log::debug!("set_window_level_bottom_spotlight: 2");
  }
}

#[tauri::command]
pub fn set_window_level_top(app_handle: AppHandle<Wry>) {
  if let Some(_window) = app_handle.get_window("main_window") {
    log::debug!("set_window_level_top_spotlight: 1");
    // panel!(app_handle).set_level(NSMainMenuWindowLevel + 1);
    // panel!(app_handle).show();
    log::debug!("set_window_level_top_spotlight: 2");
  }
}
