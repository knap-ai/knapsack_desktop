#!/usr/bin/env node
/**
 * install-bundled-plugin-deps.cjs — Pre-installs runtime dependencies for
 * bundled plugins that declare `openclaw.bundle.stageRuntimeDependencies: true`.
 *
 * Run at BUILD TIME (after `npm ci` for the main clawdbot package), before
 * `tauri build`, so plugin node_modules are included in the installer bundle.
 *
 * WHY THIS IS NEEDED:
 * The fallback in service.rs that installs these deps at runtime cannot write
 * to the app's install directory on production systems — on Windows the app
 * lands in C:\Program Files\ (read-only without admin), and on macOS inside
 * the signed app bundle (also read-only).  Pre-bundling the deps at build time
 * is the correct fix; the runtime fallback remains as a best-effort safety net.
 *
 * SKIP_PLUGINS:
 * Plugins listed here are excluded from build-time installation because their
 * dependencies are too large, require a separate download step (e.g. browsers),
 * or rely on native compilation that may not succeed in all CI environments.
 * These plugins' deps can still be installed at runtime by the service.rs
 * fallback when the environment allows it.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLAWDBOT_DIR = path.join(__dirname, '..', 'src-tauri', 'resources', 'clawdbot');
const EXTENSIONS_DIR = path.join(CLAWDBOT_DIR, 'dist', 'extensions');

// Excluded from build-time installation:
// - diffs: playwright-core (~30 MB package + requires a separate browser
//   download at runtime anyway; not needed for messaging workflows)
const SKIP_PLUGINS = new Set(['diffs']);

if (!fs.existsSync(EXTENSIONS_DIR)) {
  console.log('[install-bundled-plugin-deps] dist/extensions not found — skipping.');
  process.exit(0);
}

const entries = fs.readdirSync(EXTENSIONS_DIR, { withFileTypes: true });
let installed = 0;
let alreadyPresent = 0;
let skipped = 0;

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const pluginName = entry.name;

  if (SKIP_PLUGINS.has(pluginName)) {
    console.log(`[install-bundled-plugin-deps] ${pluginName}: skipped (in SKIP_PLUGINS)`);
    skipped++;
    continue;
  }

  const pluginDir = path.join(EXTENSIONS_DIR, pluginName);
  const pkgPath = path.join(pluginDir, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    continue;
  }

  const needsStage = pkg?.openclaw?.bundle?.stageRuntimeDependencies === true;
  if (!needsStage) continue;

  const deps = Object.keys(pkg.dependencies || {});
  if (deps.length === 0) continue;

  // Skip if all deps are already installed (e.g. re-running during development).
  const nmDir = path.join(pluginDir, 'node_modules');
  if (fs.existsSync(nmDir) && deps.every(dep => fs.existsSync(path.join(nmDir, dep)))) {
    console.log(`[install-bundled-plugin-deps] ${pluginName}: already present`);
    alreadyPresent++;
    continue;
  }

  console.log(`[install-bundled-plugin-deps] ${pluginName}: installing ${deps.join(', ')}...`);
  try {
    execSync('npm install --omit=dev --ignore-scripts --no-audit --no-fund', {
      cwd: pluginDir,
      stdio: 'inherit',
    });
    console.log(`[install-bundled-plugin-deps] ${pluginName}: done`);
    installed++;
  } catch (err) {
    // Non-fatal: the plugin simply won't load at runtime if its dep is missing.
    console.warn(
      `[install-bundled-plugin-deps] WARNING: npm install failed for ${pluginName}: ${err.message}`,
    );
  }
}

console.log(
  `[install-bundled-plugin-deps] Finished. installed=${installed} already-present=${alreadyPresent} skipped=${skipped}`,
);
