use std::sync::Once;

use tauri::{
  AppHandle, GlobalShortcutManager, Manager, Wry,
};

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
  shortcut_manager
    .register("Option+k", move || {
      if window.is_visible().unwrap_or(false) {
        window.hide().expect("Failed to hide window");
      } else {
        // position_window_at_the_center_of_the_monitor_with_cursor(&window);
        window.show().expect("Failed to show window");
      };
    })
  .unwrap();
}

#[tauri::command]
pub fn kn_show_app(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("main_window") {
    println!("show_spotlight: 1");
    // panel!(app_handle).show();
    window.show().expect("Failed to show window");
    println!("show_spotlight: 2");
  }
}

#[tauri::command]
pub fn kn_hide_app(app_handle: AppHandle<Wry>) {
  if let Some(window) = app_handle.get_window("main_window") {
    println!("hide_spotlight: 1");
    // panel!(app_handle).order_out(None);
    window.hide().expect("Failed to hide window");
    println!("hide_spotlight: 2");
  }
}

// TODO: do we still need these, if we're using an NSWindow instead of an NSPanel?
#[tauri::command]
pub fn set_window_level_bottom(app_handle: AppHandle<Wry>) {
  if let Some(_window) = app_handle.get_window("main_window") {
    println!("set_window_level_bottom_spotlight: 1");
    // panel!(app_handle).set_level(1); // NSNormalWindowLevel + 1 so it is above your other windows but below the security modal
    println!("set_window_level_bottom_spotlight: 2");
  }
}

#[tauri::command]
pub fn set_window_level_top(app_handle: AppHandle<Wry>) {
  if let Some(_window) = app_handle.get_window("main_window") {
    println!("set_window_level_top_spotlight: 1");
    // panel!(app_handle).set_level(NSMainMenuWindowLevel + 1); 
    // panel!(app_handle).show();
    println!("set_window_level_top_spotlight: 2");
  }
}
