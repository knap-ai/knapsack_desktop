use std::path::Path;

fn main() {
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
             ║  Run:  cd src && bash scripts/prepare-node.sh              ║\n\
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
                 Run `bash scripts/prepare-node.sh` from the src/ directory.",
                node_bin
            );
        }
    }

    tauri_build::build()
}
