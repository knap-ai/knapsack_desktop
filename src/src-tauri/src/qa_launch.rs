//! The generated QA app is only safe with the launcher's isolated environment.
//! Finder launches do not inherit it and would otherwise open production data.
use std::path::Path;

fn needs_launcher(executable: &Path, supervised: bool, database: bool, state: bool) -> bool {
  executable.file_name().and_then(|name| name.to_str()) == Some("Knapsack Dev")
    && !(supervised && database && state)
}

pub fn reject_unmanaged_launch() {
  let executable = match std::env::current_exe() {
    Ok(path) => path,
    Err(_) => return,
  };
  let configured = |key| std::env::var_os(key).map(|value| !value.is_empty()).unwrap_or(false);
  if needs_launcher(
    &executable,
    std::env::var("KNAPSACK_QA_DIRECT_GATEWAY").as_deref() == Ok("1"),
    configured("DATABASE_URL"),
    configured("OPENCLAW_STATE_DIR"),
  ) {
    tauri::api::dialog::blocking::message(
      None::<&tauri::Window>,
      "Start Knapsack Dev with the QA launcher",
      "This development app needs an isolated database and gateway. Start it with the project's qa:dev command instead of opening it directly. Your production app and data have not been changed.",
    );
    std::process::exit(1);
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn finder_launch_cannot_fall_back_to_production() {
    let dev = Path::new("/tmp/Knapsack Dev.app/Contents/MacOS/Knapsack Dev");
    assert!(needs_launcher(dev, false, false, false));
    assert!(needs_launcher(dev, true, false, true));
    assert!(needs_launcher(dev, true, true, false));
    assert!(!needs_launcher(dev, true, true, true));
    assert!(!needs_launcher(Path::new("/Applications/Knapsack.app/Contents/MacOS/Knapsack"), false, false, false));
  }
}
