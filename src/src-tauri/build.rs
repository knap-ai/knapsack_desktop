use std::fs;
use std::path::Path;

/// Remove broken symlinks under the given directory (non-recursive into subdirs).
/// Tauri's resource bundler fails when it encounters dangling symlinks created
/// by npm but pointing at pruned packages.
fn remove_broken_symlinks(dir: &Path) {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        // Check if it's a symlink whose target doesn't exist
        if path.symlink_metadata().map_or(false, |m| m.file_type().is_symlink()) && !path.exists()
        {
            let _ = fs::remove_file(&path);
        }
    }
}

fn main() {
    // Clean up broken symlinks left by pruned npm packages (e.g. typescript, node-llama-cpp).
    // These cause tauri_build::build() to fail with "does not exist" errors.
    remove_broken_symlinks(Path::new(
        "resources/clawdbot/node_modules/.bin",
    ));
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
