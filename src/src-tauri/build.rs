use std::fs;
use std::path::Path;

/// Recursively remove broken symlinks under the given directory.
/// Tauri's resource bundler fails when it encounters dangling symlinks created
/// by pnpm/npm pointing at pruned or missing packages.
/// pnpm uses symlinks throughout node_modules (not just .bin/), so we must
/// walk the entire tree.
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
            // Dangling symlink – remove it (file or dir symlink)
            let _ = fs::remove_file(&path);
        } else if meta.file_type().is_dir() {
            remove_broken_symlinks_recursive(&path);
        }
    }
}

fn main() {
    // Clean up broken symlinks left by pruned pnpm/npm packages.
    // pnpm creates symlinks throughout node_modules (not just .bin/), and after
    // git checkout or merge these can become dangling, causing tauri_build to
    // fail with "does not exist" errors.
    remove_broken_symlinks_recursive(Path::new(
        "resources/clawdbot/node_modules",
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
