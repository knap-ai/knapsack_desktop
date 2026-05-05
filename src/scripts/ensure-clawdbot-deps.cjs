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
 *
 * In `tauri dev` mode, Tauri copies resources from the source tree into
 * src-tauri/target/debug/resources/ and runs the gateway from there.
 * This script installs deps in both the source dir AND the target debug dir
 * (when it exists) so that hot-reload cycles don't lose npm packages.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Source (checked-in) clawdbot dir
const SOURCE_CLAWDBOT_DIR = path.join(__dirname, '..', 'src-tauri', 'resources', 'clawdbot');
// Tauri dev target dir — only present during/after `tauri dev`
const TARGET_CLAWDBOT_DIR = path.join(__dirname, '..', 'src-tauri', 'target', 'debug', 'resources', 'clawdbot');

function runNpmInstall(cwd, label) {
  // Prefer `npm ci` when a lockfile is present — it does a clean install from the
  // lockfile and catches version mismatches that `npm install` silently ignores.
  // Falls back to `npm install` when no lockfile exists (e.g. target debug dir).
  const hasLockfile = fs.existsSync(path.join(cwd, 'package-lock.json'));
  const cmd = hasLockfile
    ? 'npm ci --ignore-scripts --no-audit --no-fund'
    : 'npm install --omit=dev --ignore-scripts --no-audit --no-fund';
  console.log(`[ensure-clawdbot-deps] ${hasLockfile ? 'npm ci' : 'npm install'} in ${label}...`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function needsMainInstall(clawdbotDir) {
  const nodeModules = path.join(clawdbotDir, 'node_modules');
  if (!fs.existsSync(nodeModules)) return true;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(clawdbotDir, 'package.json'), 'utf8'));
    const deps = pkg.dependencies || {};
    return Object.entries(deps).some(([dep, requiredVersion]) => {
      const depDir = path.join(nodeModules, dep);
      if (!fs.existsSync(depDir)) return true; // missing
      // Check for major-version mismatch on ^-ranges (e.g. jiti@^2 installed as v1).
      // npm install will correct it; we just need to detect it here.
      const caretMatch = requiredVersion.match(/^\^(\d+)\./);
      if (caretMatch) {
        try {
          const installed = JSON.parse(fs.readFileSync(path.join(depDir, 'package.json'), 'utf8'));
          const installedMajor = parseInt((installed.version || '0').split('.')[0], 10);
          const requiredMajor = parseInt(caretMatch[1], 10);
          if (installedMajor !== requiredMajor) return true; // wrong major version
        } catch { /* can't read version — leave it */ }
      }
      return false;
    });
  } catch {
    return true;
  }
}

function findPluginsNeedingRuntimeDeps(extensionsDir) {
  if (!fs.existsSync(extensionsDir)) return [];
  const plugins = [];
  for (const entry of fs.readdirSync(extensionsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(extensionsDir, entry.name, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const staged = pkg?.openclaw?.bundle?.stageRuntimeDependencies === true;
      if (!staged) continue;
      // Skip if the plugin's own node_modules already has all deps.
      const pluginNodeModules = path.join(extensionsDir, entry.name, 'node_modules');
      if (fs.existsSync(pluginNodeModules)) {
        const pluginDeps = Object.keys(pkg.dependencies || {});
        const allPresent = pluginDeps.every(dep => fs.existsSync(path.join(pluginNodeModules, dep)));
        if (allPresent) continue;
      }
      plugins.push(entry.name);
    } catch {
      // Ignore unreadable package.json
    }
  }
  return plugins;
}

// Collect the directories to install into (source always; target when present).
const clawdbotDirs = [SOURCE_CLAWDBOT_DIR];
if (fs.existsSync(TARGET_CLAWDBOT_DIR)) {
  clawdbotDirs.push(TARGET_CLAWDBOT_DIR);
}

// Step 1: install main clawdbot deps in each dir.
for (const dir of clawdbotDirs) {
  if (!fs.existsSync(dir)) continue;
  if (needsMainInstall(dir)) {
    try {
      runNpmInstall(dir, path.relative(path.join(__dirname, '..'), dir));
    } catch (err) {
      console.error('[ensure-clawdbot-deps] clawdbot npm install failed:', err.message);
      process.exit(1);
    }
  }
}

// Step 2: install runtime deps for bundled plugins that need them.
for (const dir of clawdbotDirs) {
  const extensionsDir = path.join(dir, 'dist', 'extensions');
  if (!fs.existsSync(extensionsDir)) continue;
  const pluginsToInstall = findPluginsNeedingRuntimeDeps(extensionsDir);
  if (pluginsToInstall.length > 0) {
    console.log(
      `[ensure-clawdbot-deps] Installing runtime deps for ${pluginsToInstall.length} bundled plugin(s) in ${path.relative(path.join(__dirname, '..'), extensionsDir)}: ${pluginsToInstall.join(', ')}`,
    );
    for (const plugin of pluginsToInstall) {
      try {
        runNpmInstall(path.join(extensionsDir, plugin), `extensions/${plugin}/`);
      } catch (err) {
        // Non-fatal: a plugin dep failure just means that plugin won't load.
        console.warn(`[ensure-clawdbot-deps] WARNING: failed to install deps for ${plugin}: ${err.message}`);
      }
    }
  }
}

// Step 3: ensure the openclaw self-link exists in each clawdbot dir so that
// bundled extensions can resolve `openclaw/plugin-sdk/*` imports at runtime.
for (const dir of clawdbotDirs) {
  if (!fs.existsSync(dir)) continue;
  const selfLinkPath = path.join(dir, 'node_modules', 'openclaw');
  if (!fs.existsSync(selfLinkPath)) {
    try {
      const isWindows = process.platform === 'win32';
      fs.mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
      fs.symlinkSync(
        isWindows ? dir : '..',
        selfLinkPath,
        isWindows ? 'junction' : 'dir',
      );
      console.log(`[ensure-clawdbot-deps] Created openclaw self-link in ${path.relative(path.join(__dirname, '..'), dir)}/node_modules/openclaw`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.warn(`[ensure-clawdbot-deps] WARNING: could not create openclaw self-link: ${err.message}`);
      }
    }
  }
}

console.log('[ensure-clawdbot-deps] Done.');
