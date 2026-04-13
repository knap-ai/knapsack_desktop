#!/usr/bin/env node
/**
 * ensure-clawdbot-deps.cjs — Installs clawdbot node_modules if missing.
 *
 * After the node_modules pruning change, CI installs deps at build time
 * but `tauri dev` skips the prebuild hook.  This script ensures the
 * gateway can start during local development.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLAWDBOT_DIR = path.join(__dirname, '..', 'src-tauri', 'resources', 'clawdbot');
const NODE_MODULES = path.join(CLAWDBOT_DIR, 'node_modules');

if (fs.existsSync(NODE_MODULES)) {
  // Already installed — nothing to do.
  process.exit(0);
}

console.log('[ensure-clawdbot-deps] node_modules missing — running npm install in clawdbot/...');
try {
  execSync('npm install --omit=dev', { cwd: CLAWDBOT_DIR, stdio: 'inherit' });
  console.log('[ensure-clawdbot-deps] Done.');
} catch (err) {
  console.error('[ensure-clawdbot-deps] npm install failed:', err.message);
  process.exit(1);
}
