use std::fs;
use std::path::Path;

/// Recursively remove broken symlinks under the given directory.
/// With hoisted node_modules (.npmrc node-linker=hoisted), the only symlinks
/// should be in .bin/. Clean up any dangling ones that could trip up Tauri.
fn remove_broken_symlinks_recursive(dir: &Path) {
  let entries = match fs::read_dir(dir) {
    Ok(e) => e,
    Err(_) => return,
  };
  for entry in entries.flatten() {
    let path = entry.path();
    let meta = match path.symlink_metadata() {
      Ok(m) => m,
      Err(_) => continue,
    };
    if meta.file_type().is_symlink() && !path.exists() {
      // Dangling symlink – remove it
      if fs::remove_file(&path).is_err() {
        let _ = fs::remove_dir(&path);
      }
    } else if meta.file_type().is_dir() {
      remove_broken_symlinks_recursive(&path);
    }
  }
}

fn main() {
  let is_release = std::env::var("PROFILE").as_deref() == Ok("release");
  let node_modules = Path::new("resources/clawdbot/node_modules");
  let openclaw_self_link = node_modules.join("openclaw");

  // These cleanup steps are only needed for release bundles — they're slow
  // (can take minutes on large node_modules trees) and unnecessary for dev.
  if is_release {
    // Remove .pnpm virtual store — not needed at runtime with hoisted
    // node_modules, and it contains thousands of internal symlinks that
    // bloat the bundle and can break Tauri's resource copier.
    let pnpm_store = node_modules.join(".pnpm");
    if pnpm_store.exists() {
      let _ = fs::remove_dir_all(&pnpm_store);
    }

    // Clean up any broken symlinks (e.g. in .bin/) that could cause
    // tauri_build to fail.
    if node_modules.exists() {
      remove_broken_symlinks_recursive(node_modules);
    }
  }

  // Keep the source resource tree acyclic for Tauri's resources/clawdbot/**/*
  // glob. The runtime recreates node_modules/openclaw -> .. after resources
  // are copied, so it should not exist while Cargo/Tauri are scanning.
  if let Ok(meta) = openclaw_self_link.symlink_metadata() {
    if meta.file_type().is_symlink() {
      let _ = fs::remove_file(&openclaw_self_link);
    }
  }

  // Fail the build early if the bundled Node.js binary is missing.
  // The binary is downloaded by `scripts/prepare-node.sh` (runs automatically
  // via the npm `prebuild` hook). If you're seeing this error, run:
  //
  //   cd src && bash scripts/prepare-node.sh
  //
  let node_bin = if cfg!(target_os = "windows") {
    "resources/node/node.exe"
  } else {
    "resources/node/node"
  };

  if !Path::new(node_bin).exists() {
    println!(
      "cargo:warning=\n\
             ╔══════════════════════════════════════════════════════════════╗\n\
             ║  MISSING: {}  ║\n\
             ║                                                            ║\n\
             ║  Run:  cd src && node scripts/prepare-node.cjs              ║\n\
             ║                                                            ║\n\
             ║  This downloads the Node.js binary that gets bundled into  ║\n\
             ║  the app. Without it, Clawd/clawdbot won't work.           ║\n\
             ╚══════════════════════════════════════════════════════════════╝",
      node_bin,
    );
    // In release builds, fail hard. In dev, warn only (system node works as fallback).
    if std::env::var("PROFILE").as_deref() == Ok("release") {
      panic!(
        "Bundled Node.js binary not found at `{}`. \
                 Run `node scripts/prepare-node.cjs` from the src/ directory.",
        node_bin
      );
    }
  }

  tauri_build::build()
}
