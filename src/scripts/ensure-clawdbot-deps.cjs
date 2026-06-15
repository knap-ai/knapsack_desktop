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
const os = require('os');
const { execSync } = require('child_process');

// Source (checked-in) clawdbot dir
const SOURCE_CLAWDBOT_DIR = path.join(__dirname, '..', 'src-tauri', 'resources', 'clawdbot');
// Tauri dev target dir — only present during/after `tauri dev`
const TARGET_CLAWDBOT_DIR = path.join(__dirname, '..', 'src-tauri', 'target', 'debug', 'resources', 'clawdbot');
const FORCE_EXTENSION_LOCAL_DEPS = new Set(['slack', 'telegram', 'whatsapp']);

function runNpmInstall(cwd, label) {
  // Prefer `npm ci` when a lockfile is present — it does a clean install from the
  // lockfile and catches version mismatches that `npm install` silently ignores.
  // Falls back to `npm install` when no lockfile exists (e.g. target debug dir).
  const hasLockfile = fs.existsSync(path.join(cwd, 'npm-shrinkwrap.json'))
    || fs.existsSync(path.join(cwd, 'package-lock.json'));
  const cmd = hasLockfile
    ? 'npm ci --ignore-scripts --no-audit --no-fund'
    : 'npm install --omit=dev --ignore-scripts --no-audit --no-fund';
  console.log(`[ensure-clawdbot-deps] ${hasLockfile ? 'npm ci' : 'npm install'} in ${label}...`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function runtimeDependencySpecs(pkg) {
  return Object.entries(pkg.dependencies || {})
    .filter(([, version]) => typeof version === 'string'
      && !version.startsWith('file:')
      && !version.startsWith('link:')
      && !version.startsWith('workspace:')
      && !version.startsWith('portal:'))
    .map(([dep, version]) => `${dep}@${version}`);
}

function runPluginRuntimeDepsInstall(cwd, label, specs) {
  if (!specs.length) return;
  const quotedSpecs = specs.map((spec) => JSON.stringify(spec)).join(' ');
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'knapsack-plugin-deps-'));
  const cmd = `npm install ${quotedSpecs} --no-save --omit=dev --ignore-scripts --no-audit --no-fund`;
  console.log(`[ensure-clawdbot-deps] npm install targeted runtime deps for ${label}: ${specs.join(', ')}`);
  try {
    execSync(cmd, { cwd: stagingDir, stdio: 'inherit' });
    const sourceNm = path.join(stagingDir, 'node_modules');
    const targetNm = path.join(cwd, 'node_modules');
    fs.mkdirSync(targetNm, { recursive: true });
    for (const entry of fs.readdirSync(sourceNm)) {
      fs.cpSync(path.join(sourceNm, entry), path.join(targetNm, entry), {
        recursive: true,
        force: true,
        verbatimSymlinks: true,
      });
    }
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
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

function findPluginsNeedingRuntimeDeps(clawdbotDir) {
  const extensionsDir = path.join(clawdbotDir, 'dist', 'extensions');
  if (!fs.existsSync(extensionsDir)) return [];
  const rootNodeModules = path.join(clawdbotDir, 'node_modules');
  const plugins = [];
  for (const entry of fs.readdirSync(extensionsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(extensionsDir, entry.name, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const staged = pkg?.openclaw?.bundle?.stageRuntimeDependencies === true;
      if (!staged) continue;
      const pluginDeps = Object.keys(pkg.dependencies || {});
      // Prefer the root bundle's node_modules. This avoids extension-local
      // installs for upstream package.json files that contain workspace: deps.
      if (!FORCE_EXTENSION_LOCAL_DEPS.has(entry.name)
        && pluginDeps.length > 0
        && pluginDeps.every(dep => fs.existsSync(path.join(rootNodeModules, dep)))) {
        continue;
      }
      // Skip if the plugin's own node_modules already has all deps.
      const pluginNodeModules = path.join(extensionsDir, entry.name, 'node_modules');
      if (fs.existsSync(pluginNodeModules)) {
        const allPresent = pluginDeps.every(dep => fs.existsSync(path.join(pluginNodeModules, dep)));
        if (allPresent) continue;
      }
      plugins.push({
        name: entry.name,
        specs: runtimeDependencySpecs(pkg),
      });
    } catch {
      // Ignore unreadable package.json
    }
  }
  return plugins;
}

// Collect the directories to install into (source always; target when present).
const clawdbotDirs = [SOURCE_CLAWDBOT_DIR];
if (fs.existsSync(path.join(TARGET_CLAWDBOT_DIR, 'package.json'))) {
  clawdbotDirs.push(TARGET_CLAWDBOT_DIR);
} else if (fs.existsSync(TARGET_CLAWDBOT_DIR)) {
  console.warn(
    `[ensure-clawdbot-deps] Skipping incomplete target debug clawdbot copy: ${path.relative(path.join(__dirname, '..'), TARGET_CLAWDBOT_DIR)}`,
  );
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
  const pluginsToInstall = findPluginsNeedingRuntimeDeps(dir);
  if (pluginsToInstall.length > 0) {
    console.log(
      `[ensure-clawdbot-deps] Installing runtime deps for ${pluginsToInstall.length} bundled plugin(s) in ${path.relative(path.join(__dirname, '..'), extensionsDir)}: ${pluginsToInstall.map((plugin) => plugin.name).join(', ')}`,
    );
    for (const plugin of pluginsToInstall) {
      try {
        runPluginRuntimeDepsInstall(
          path.join(extensionsDir, plugin.name),
          `extensions/${plugin.name}/`,
          plugin.specs,
        );
      } catch (err) {
        // Non-fatal: a plugin dep failure just means that plugin won't load.
        console.warn(`[ensure-clawdbot-deps] WARNING: failed to install deps for ${plugin.name}: ${err.message}`);
      }
    }
  }
}

// Step 3: ensure the openclaw self-link exists only in copied runtime dirs.
// Do not create it in the source resources/clawdbot tree: node_modules/openclaw
// points back to the clawdbot root, and Tauri's resources/clawdbot/**/* glob
// follows that cycle during dev/build, producing enormous recursive
// cargo:rerun-if-changed paths. service.rs recreates the link at runtime after
// resources have been copied, so the source bundle should remain acyclic.
const sourceSelfLinkPath = path.join(SOURCE_CLAWDBOT_DIR, 'node_modules', 'openclaw');
try {
  const stat = fs.lstatSync(sourceSelfLinkPath);
  if (stat.isSymbolicLink()) {
    fs.unlinkSync(sourceSelfLinkPath);
    console.log('[ensure-clawdbot-deps] Removed source openclaw self-link to prevent Tauri glob recursion');
  }
} catch {
  // absent is fine
}

for (const dir of clawdbotDirs.filter(dir => dir !== SOURCE_CLAWDBOT_DIR)) {
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
