#!/usr/bin/env node
/**
 * ensure-clawdbot-deps.cjs — Installs clawdbot node_modules if missing.
 *
 * After the node_modules pruning change, CI installs deps at build time
 * but `tauri dev` skips the prebuild hook.  This script ensures the
 * gateway can start during local development.
 *
 * Also installs runtime deps for bundled plugins that declare
 * `openclaw.bundle.stageRuntimeDependencies: true` (e.g. telegram needs
 * grammy, discord needs discord.js, slack needs @slack/bolt, etc.).
 * The upstream `scripts/postinstall-bundled-plugins.mjs` that normally
 * handles this is not included in the dist bundle.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLAWDBOT_DIR = path.join(__dirname, '..', 'src-tauri', 'resources', 'clawdbot');
const NODE_MODULES = path.join(CLAWDBOT_DIR, 'node_modules');
const EXTENSIONS_DIR = path.join(CLAWDBOT_DIR, 'dist', 'extensions');

function runNpmInstall(cwd, label) {
  console.log(`[ensure-clawdbot-deps] npm install in ${label}...`);
  execSync('npm install --omit=dev --ignore-scripts --no-audit --no-fund', {
    cwd,
    stdio: 'inherit',
  });
}

function findPluginsNeedingRuntimeDeps() {
  if (!fs.existsSync(EXTENSIONS_DIR)) return [];
  const plugins = [];
  for (const entry of fs.readdirSync(EXTENSIONS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(EXTENSIONS_DIR, entry.name, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const staged = pkg?.openclaw?.bundle?.stageRuntimeDependencies === true;
      if (!staged) continue;
      // Skip if the plugin's own node_modules already exists.
      if (fs.existsSync(path.join(EXTENSIONS_DIR, entry.name, 'node_modules'))) continue;
      plugins.push(entry.name);
    } catch {
      // Ignore unreadable package.json
    }
  }
  return plugins;
}

// Step 1: install the main clawdbot deps if missing.
if (!fs.existsSync(NODE_MODULES)) {
  try {
    runNpmInstall(CLAWDBOT_DIR, 'clawdbot/');
  } catch (err) {
    console.error('[ensure-clawdbot-deps] clawdbot npm install failed:', err.message);
    process.exit(1);
  }
}

// Step 2: install runtime deps for bundled plugins that need them.
const pluginsToInstall = findPluginsNeedingRuntimeDeps();
if (pluginsToInstall.length > 0) {
  console.log(
    `[ensure-clawdbot-deps] Installing runtime deps for ${pluginsToInstall.length} bundled plugin(s): ${pluginsToInstall.join(', ')}`,
  );
  for (const plugin of pluginsToInstall) {
    try {
      runNpmInstall(path.join(EXTENSIONS_DIR, plugin), `extensions/${plugin}/`);
    } catch (err) {
      // Non-fatal: a plugin dep failure just means that plugin won't load.
      console.warn(`[ensure-clawdbot-deps] WARNING: failed to install deps for ${plugin}: ${err.message}`);
    }
  }
}

console.log('[ensure-clawdbot-deps] Done.');
