#!/usr/bin/env node
/**
 * sync-version.js — Syncs versioned metadata with package.json
 *
 * Cross-platform replacement for sync-version.sh.
 * Runs automatically via the npm build/dev hooks so local Tauri metadata
 * and the lockfile never drift from the source of truth in package.json.
 */
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const pkgPath = path.join(projectDir, 'package.json');
const lockPath = path.join(projectDir, 'package-lock.json');
const tauriConfPath = path.join(projectDir, 'src-tauri', 'tauri.conf.json');
const cargoTomlPath = path.join(projectDir, 'src-tauri', 'Cargo.toml');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
let changed = false;

if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  if (lock.version !== pkg.version) {
    console.log(`[sync-version] Updating package-lock.json from v${lock.version} to v${pkg.version}...`);
    lock.version = pkg.version;
    if (lock.packages && lock.packages['']) {
      lock.packages[''].version = pkg.version;
    }
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
    changed = true;
  }
} else {
  console.log('[sync-version] No package-lock.json found — skipping lockfile sync.');
}

if (fs.existsSync(tauriConfPath)) {
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
  const currentTauriVersion = tauriConf?.package?.version;
  if (currentTauriVersion !== pkg.version) {
    console.log(
      `[sync-version] Updating tauri.conf.json from v${currentTauriVersion || 'unknown'} to v${pkg.version}...`,
    );
    tauriConf.package = tauriConf.package || {};
    tauriConf.package.version = pkg.version;
    fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
    changed = true;
  }
}

if (fs.existsSync(cargoTomlPath)) {
  const cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
  const versionLinePattern = /^version\s*=\s*"([^"]+)"/m;
  const match = cargoToml.match(versionLinePattern);
  const currentCargoVersion = match?.[1];
  if (currentCargoVersion && currentCargoVersion !== pkg.version) {
    console.log(
      `[sync-version] Updating Cargo.toml from v${currentCargoVersion} to v${pkg.version}...`,
    );
    const nextCargoToml = cargoToml.replace(versionLinePattern, `version = "${pkg.version}"`);
    fs.writeFileSync(cargoTomlPath, nextCargoToml);
    changed = true;
  }
}

if (!changed) {
  console.log(`[sync-version] Versioned metadata already at v${pkg.version} — skipping.`);
} else {
  console.log(`[sync-version] Versioned metadata synced to v${pkg.version}`);
}
