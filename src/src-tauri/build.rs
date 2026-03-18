use std::fs;
use std::path::Path;

/// Remove a symlink (or junction on Windows) regardless of whether it points to
/// a file or directory. On Unix `remove_file` works for all symlinks. On Windows,
/// directory symlinks and junctions require `remove_dir`.
fn remove_symlink(path: &Path) {
    // Try remove_file first (works for file symlinks on all platforms,
    // and for all symlinks on Unix).
    if fs::remove_file(path).is_err() {
        // On Windows, directory symlinks / junctions need remove_dir.
        let _ = fs::remove_dir(path);
    }
}

/// Returns true if `path` is a symlink or, on Windows, an NTFS junction.
/// pnpm uses junctions (not symlinks) on Windows because they don't require
/// admin privileges. Rust's `is_symlink()` returns false for junctions, so we
/// detect them via `read_link()` — it succeeds for both symlinks and junctions
/// (any reparse point).
fn is_symlink_or_junction(path: &Path, meta: &fs::Metadata) -> bool {
    if meta.file_type().is_symlink() {
        return true;
    }
    #[cfg(windows)]
    {
        // On Windows, junctions are directories that are reparse points.
        // fs::read_link() succeeds for junctions, so use it as the detector.
        if meta.file_type().is_dir() {
            return fs::read_link(path).is_ok();
        }
    }
    let _ = path; // suppress unused warning on non-Windows
    false
}

/// Recursively dereference symlinks (and junctions on Windows) under the given
/// directory.
///
/// pnpm creates a symlink-based `node_modules` layout where every package is a
/// symlink (or junction on Windows) into `.pnpm/`. Tauri's resource bundler
/// copies these as-is into the app bundle, where they become dangling. This
/// causes runtime `ERR_MODULE_NOT_FOUND` errors for packages like `chalk`,
/// `fast-xml-parser`, etc.
///
/// This function walks the directory tree and replaces every symlink/junction
/// with a real copy of its target. Dangling ones are simply removed.
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
        if is_symlink_or_junction(&path, &meta) {
            if path.exists() {
                // Valid symlink/junction – replace with a copy of the target
                let target_meta = match fs::metadata(&path) {
                    Ok(m) => m,
                    Err(_) => {
                        remove_symlink(&path);
                        continue;
                    }
                };
                if target_meta.is_dir() {
                    let real_target = match fs::canonicalize(&path) {
                        Ok(t) => t,
                        Err(_) => {
                            remove_symlink(&path);
                            continue;
                        }
                    };
                    remove_symlink(&path);
                    copy_dir_recursive(&real_target, &path);
                } else {
                    let real_target = match fs::canonicalize(&path) {
                        Ok(t) => t,
                        Err(_) => {
                            remove_symlink(&path);
                            continue;
                        }
                    };
                    remove_symlink(&path);
                    let _ = fs::copy(&real_target, &path);
                }
            } else {
                // Dangling symlink/junction – just remove it
                remove_symlink(&path);
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
