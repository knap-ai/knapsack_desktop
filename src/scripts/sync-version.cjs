#!/usr/bin/env node
/**
 * sync-version.js — Syncs package-lock.json version with package.json
 *
 * Cross-platform replacement for sync-version.sh.
 * Runs automatically via the npm `prebuild` hook so the lockfile
 * version never drifts from the source of truth in package.json.
 */
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const pkgPath = path.join(projectDir, 'package.json');
const lockPath = path.join(projectDir, 'package-lock.json');

if (!fs.existsSync(lockPath)) {
  console.log('[sync-version] No package-lock.json found — skipping.');
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

if (lock.version === pkg.version) {
  console.log(`[sync-version] package-lock.json already at v${pkg.version} — skipping.`);
  process.exit(0);
}

console.log(`[sync-version] Updating package-lock.json from v${lock.version} to v${pkg.version}...`);

lock.version = pkg.version;
if (lock.packages && lock.packages['']) {
  lock.packages[''].version = pkg.version;
}
fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');

console.log(`[sync-version] package-lock.json synced to v${pkg.version}`);
