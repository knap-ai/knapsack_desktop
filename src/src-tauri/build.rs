use std::fs;
use std::path::Path;

/// Recursively dereference symlinks under the given directory.
///
/// pnpm creates a symlink-based `node_modules` layout where every package is a
/// symlink into `.pnpm/`. Tauri's resource bundler copies these symlinks as-is
/// into the app bundle, where they become dangling (the relative targets no
/// longer resolve). This causes runtime `ERR_MODULE_NOT_FOUND` errors for
/// packages like `chalk`, `fast-xml-parser`, etc.
///
/// This function walks the directory tree and replaces every symlink with a real
/// copy of its target (file or directory). Dangling symlinks are simply removed.
fn dereference_symlinks_recursive(dir: &Path) {
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
        if meta.file_type().is_symlink() {
            if path.exists() {
                // Valid symlink – replace with a copy of the target
                let target_meta = match fs::metadata(&path) {
                    Ok(m) => m,
                    Err(_) => {
                        let _ = fs::remove_file(&path);
                        continue;
                    }
                };
                if target_meta.is_dir() {
                    // Read the real target path before removing the symlink
                    let real_target = match fs::canonicalize(&path) {
                        Ok(t) => t,
                        Err(_) => {
                            let _ = fs::remove_file(&path);
                            continue;
                        }
                    };
                    // Remove the symlink (it's a symlink to a dir, but remove_file works on symlinks)
                    let _ = fs::remove_file(&path);
                    // Copy the directory tree
                    copy_dir_recursive(&real_target, &path);
                } else {
                    // It's a symlink to a file
                    let real_target = match fs::canonicalize(&path) {
                        Ok(t) => t,
                        Err(_) => {
                            let _ = fs::remove_file(&path);
                            continue;
                        }
                    };
                    let _ = fs::remove_file(&path);
                    let _ = fs::copy(&real_target, &path);
                }
            } else {
                // Dangling symlink – just remove it
                let _ = fs::remove_file(&path);
            }
        } else if meta.file_type().is_dir() {
            dereference_symlinks_recursive(&path);
        }
    }
}

/// Recursively copy a directory and all its contents.
fn copy_dir_recursive(src: &Path, dst: &Path) {
    if fs::create_dir_all(dst).is_err() {
        return;
    }
    let entries = match fs::read_dir(src) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        // Use symlink_metadata so we don't follow symlinks in the target tree
        let meta = match src_path.symlink_metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };
        if meta.is_dir() {
            copy_dir_recursive(&src_path, &dst_path);
        } else if meta.is_symlink() {
            // Symlinks inside the .pnpm store – resolve and copy the real file/dir
            if src_path.exists() {
                let real = match fs::canonicalize(&src_path) {
                    Ok(r) => r,
                    Err(_) => continue,
                };
                let real_meta = match fs::metadata(&real) {
                    Ok(m) => m,
                    Err(_) => continue,
                };
                if real_meta.is_dir() {
                    copy_dir_recursive(&real, &dst_path);
                } else {
                    let _ = fs::copy(&real, &dst_path);
                }
            }
            // Skip dangling symlinks inside the store
        } else {
            let _ = fs::copy(&src_path, &dst_path);
        }
    }
}

fn main() {
    // Dereference pnpm symlinks in node_modules so Tauri bundles real files.
    //
    // pnpm creates symlinks throughout node_modules (every package is a symlink
    // into .pnpm/). When Tauri copies these into the app bundle, they become
    // dangling symlinks, causing runtime ERR_MODULE_NOT_FOUND errors.
    //
    // By replacing symlinks with copies of their targets before tauri_build runs,
    // the bundled app contains real files that Node.js can resolve at runtime.
    let node_modules = Path::new("resources/clawdbot/node_modules");
    if node_modules.exists() {
        dereference_symlinks_recursive(node_modules);
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
