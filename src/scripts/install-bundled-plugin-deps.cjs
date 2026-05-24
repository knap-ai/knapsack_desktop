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

// Upstream packages occasionally omit the bundle staging hint for plugins that
// Knapsack must ship ready-to-run. Apply those fixes at build time so first
// launch never needs to repair signed resources.
const FORCE_STAGE_RUNTIME_DEPS = new Set(['browser']);

// Channels that Knapsack exposes directly in the UI need their own dependency
// trees bundled with the extension. Root node_modules is still useful for shared
// resolution, but it is not enough for channel-local imports and verifier gates.
const FORCE_EXTENSION_LOCAL_DEPS = new Set(['slack', 'whatsapp']);

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

  if (FORCE_STAGE_RUNTIME_DEPS.has(pluginName) && pkg?.openclaw?.bundle?.stageRuntimeDependencies !== true) {
    pkg.openclaw = pkg.openclaw || {};
    pkg.openclaw.bundle = pkg.openclaw.bundle || {};
    pkg.openclaw.bundle.stageRuntimeDependencies = true;
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`[install-bundled-plugin-deps] ${pluginName}: repaired stageRuntimeDependencies=true`);
  }

  const forceLocalDeps = FORCE_EXTENSION_LOCAL_DEPS.has(pluginName);
  const needsStage = pkg?.openclaw?.bundle?.stageRuntimeDependencies === true || forceLocalDeps;
  if (!needsStage) continue;

  const deps = Object.keys(pkg.dependencies || {});
  if (deps.length === 0) continue;

  const missingRootDeps = deps.filter((dep) => !fs.existsSync(path.join(CLAWDBOT_DIR, 'node_modules', dep)));
  if (!forceLocalDeps && missingRootDeps.length === 0) {
    console.log(`[install-bundled-plugin-deps] ${pluginName}: satisfied by root node_modules`);
    alreadyPresent++;
    continue;
  }

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

// Pass 2: Install plugin runtime deps into the root clawdbot node_modules so
// they are resolvable via NODE_PATH for CJS require() calls.  Shared gateway
// chunks load plugins and may require() these packages from a call site whose
// directory traversal doesn't reach the per-plugin node_modules installed
// above.  service.rs tries the same install at runtime but cannot write to
// C:\Program Files\ on Windows, so we must do it at build time.
const ROOT_NM = path.join(CLAWDBOT_DIR, 'node_modules');
if (!fs.existsSync(ROOT_NM)) {
  console.log('[install-bundled-plugin-deps] Root node_modules not found — skipping Pass 2.');
  process.exit(0);
}

const missingFromRoot = [];
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const pluginName = entry.name;
  if (SKIP_PLUGINS.has(pluginName)) continue;

  const pkgPath = path.join(EXTENSIONS_DIR, pluginName, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;

  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch { continue; }
  if (FORCE_EXTENSION_LOCAL_DEPS.has(pluginName)) continue;
  if (pkg?.openclaw?.bundle?.stageRuntimeDependencies !== true) continue;

  for (const dep of Object.keys(pkg.dependencies || {})) {
    if (!fs.existsSync(path.join(ROOT_NM, dep)) && !missingFromRoot.includes(dep)) {
      missingFromRoot.push(dep);
    }
  }
}

if (missingFromRoot.length === 0) {
  console.log('[install-bundled-plugin-deps] Pass 2: all plugin runtime deps already in root node_modules.');
  process.exit(0);
}

// Read root package.json overrides — packages listed there cannot be installed
// as direct deps (npm throws EOVERRIDE).  Skip them; they're already managed.
let rootOverrides = new Set();
try {
  const rootPkg = JSON.parse(fs.readFileSync(path.join(CLAWDBOT_DIR, 'package.json'), 'utf8'));
  for (const key of Object.keys(rootPkg.overrides || {})) rootOverrides.add(key);
  for (const key of Object.keys(rootPkg.pnpm?.overrides || {})) rootOverrides.add(key);
} catch { /* ignore */ }

console.log(
  `[install-bundled-plugin-deps] Pass 2: installing ${missingFromRoot.length} dep(s) into root node_modules: ${missingFromRoot.join(', ')}...`,
);
let pass2Installed = 0;
let pass2Skipped = 0;
for (const dep of missingFromRoot) {
  if (rootOverrides.has(dep)) {
    console.log(`[install-bundled-plugin-deps] Pass 2: skipping ${dep} (managed by overrides)`);
    pass2Skipped++;
    continue;
  }
  try {
    execSync(
      `npm install ${dep} --no-save --omit=dev --ignore-scripts --no-audit --no-fund`,
      { cwd: CLAWDBOT_DIR, stdio: 'inherit' },
    );
    pass2Installed++;
  } catch (err) {
    console.warn(`[install-bundled-plugin-deps] WARNING: Pass 2 install failed for ${dep}: ${err.message.split('\n')[0]}`);
  }
}
console.log(`[install-bundled-plugin-deps] Pass 2: done (installed=${pass2Installed} skipped=${pass2Skipped}).`);

// Create a self-referencing symlink so that bundled extensions can resolve
// `openclaw/plugin-sdk/*` imports.  The clawdbot package IS the openclaw
// package (same package.json name), so node_modules/openclaw -> .. lets
// Node.js find it via normal package resolution without npm link at runtime.
const selfLinkPath = path.join(CLAWDBOT_DIR, 'node_modules', 'openclaw');
if (!fs.existsSync(selfLinkPath)) {
  try {
    // Windows needs an absolute target for junctions (no admin required).
    // Unix uses a relative symlink which is more portable.
    const isWindows = process.platform === 'win32';
    fs.symlinkSync(
      isWindows ? CLAWDBOT_DIR : '..',
      selfLinkPath,
      isWindows ? 'junction' : 'dir',
    );
    console.log('[install-bundled-plugin-deps] Created openclaw self-link in node_modules/openclaw');
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.warn(`[install-bundled-plugin-deps] WARNING: could not create openclaw self-link: ${err.message}`);
    }
  }
} else {
  console.log('[install-bundled-plugin-deps] openclaw self-link already present');
}
