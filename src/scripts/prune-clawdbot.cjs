#!/usr/bin/env node
/**
 * prune-clawdbot.js — Removes unused extensions, heavy packages, and build-only
 * dependencies from the bundled clawdbot to reduce the Tauri app bundle size.
 *
 * Cross-platform replacement for prune-clawdbot.sh.
 * Runs automatically via the npm `prebuild` hook before `tauri build`.
 */
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const CLAWDBOT_DIR = path.join(SCRIPT_DIR, '..', 'src-tauri', 'resources', 'clawdbot');
const IS_WIN = process.platform === 'win32';

if (!fs.existsSync(path.join(CLAWDBOT_DIR, 'node_modules'))) {
  console.log('[prune-clawdbot] No node_modules found — skipping.');
  process.exit(0);
}

function getDirSizeMB(dir) {
  // Per-file statSync over thousands of files is extremely slow on Windows NTFS.
  // Size reporting is informational only; skip it on Windows.
  if (IS_WIN) return -1;
  if (!fs.existsSync(dir)) return 0;
  let size = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        try {
          const fullPath = path.join(entry.parentPath || entry.path || dir, entry.name);
          size += fs.statSync(fullPath).size;
        } catch { /* skip inaccessible files */ }
      }
    }
  } catch { /* skip inaccessible dirs */ }
  return Math.round(size / (1024 * 1024));
}

function sizeStr(mb) {
  return mb < 0 ? 'N/A' : `${mb} MB`;
}

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  }
  return false;
}

const nodeModules = path.join(CLAWDBOT_DIR, 'node_modules');
const extensionsDir = path.join(CLAWDBOT_DIR, 'extensions');
const distExtensionsDir = path.join(CLAWDBOT_DIR, 'dist', 'extensions');

const beforeNM = getDirSizeMB(nodeModules);
const beforeExt = getDirSizeMB(extensionsDir);
console.log(`[prune-clawdbot] Pruning clawdbot bundle (node_modules: ${sizeStr(beforeNM)}, extensions: ${sizeStr(beforeExt)})...`);

// Step 1: Remove unused extensions (source and compiled dist)
const UNUSED_EXTENSIONS = [
  'bluebubbles', 'copilot-proxy', 'feishu', 'google-antigravity-auth',
  'google-gemini-cli-auth', 'line', 'lobster', 'matrix', 'mattermost',
  'minimax-portal-auth', 'msteams', 'nextcloud-talk', 'nostr', 'open-prose',
  'qwen-portal-auth', 'tlon', 'twitch', 'zalo', 'zalouser',
];

console.log(`[prune-clawdbot] 1/5 Removing ${UNUSED_EXTENSIONS.length} unused extensions (source + dist)...`);
for (const ext of UNUSED_EXTENSIONS) {
  rmDir(path.join(extensionsDir, ext));
  rmDir(path.join(distExtensionsDir, ext));
}

// Step 2: Remove unused heavy packages
// NOTE: 'chalk' must NOT appear here — it is externalized in the dist bundle and
// resolved at runtime from node_modules/chalk/ (a minimal shim committed to git).
// Removing it causes ERR_MODULE_NOT_FOUND on gateway startup.
const UNUSED_PACKAGES = [
  '@node-llama-cpp', 'node-llama-cpp', '@napi-rs', '@img',
  'sharp', '@larksuiteoapi', '@cloudflare',
  'web-streams-polyfill', 'bun-types',
  'signal-utils', 'sqlite-vec',
  // jimp is new in openclaw 2026.4.15 and adds ~10k files (including test image
  // snapshots). Not needed for the Knapsack-bundled gateway use case.
  'jimp', '@jimp',
  // @lancedb is new in openclaw 2026.4.15 (cloud storage for memory-lancedb)
  // and ships 239MB of cross-platform native binaries. Prune it to keep the
  // Windows installer within size limits.
  '@lancedb',
  // devDependencies — build tools and linters not needed at runtime
  'vite', 'unrun', '@rolldown', 'rolldown', 'rolldown-plugin-dts', 'tsdown',
  '@esbuild',
  '@oxlint', '@oxlint-tsgolint', '@oxfmt', 'oxfmt',
  '@typescript', // @typescript/native-preview — TS compiler preview, dev only
  'vitest', '@vitest', '@jscpd',
  'madge', 'precinct', 'filing-cabinet', 'dependency-tree',
  '@lit', '@lit-labs', 'lit', 'lit-html',
  // Type-only packages — not needed at runtime
  '@types', 'jsdom',
  // Syntax highlighting — bundled inline in dist, not required at runtime
  'reprism', 'shiki', '@shikijs',
  // Web framework — not referenced in dist bundle
  'hono',
  // Build/transpile tools — transitive deps of removed packages
  '@babel', 'css-tree', 'enhanced-resolve', 'postcss', 'ast-types',
  // ESLint tooling — not needed at runtime
  '@typescript-eslint',
  // JSON schema tools — not referenced in dist bundle
  'json-schema-to-ts',
  // Vue.js — not referenced in dist bundle
  '@vue',
  // FFI library — not referenced in dist bundle
  'koffi',
  // Packages only used by removed extensions
  'matrix-js-sdk', 'matrix-widget-api', '@matrix-org',
  'nostr-tools', 'libsignal',
];

let saved = 0;
console.log(`[prune-clawdbot] 2/5 Removing ${UNUSED_PACKAGES.length} unused packages...`);
for (const pkg of UNUSED_PACKAGES) {
  const target = path.join(nodeModules, pkg);
  if (fs.existsSync(target)) {
    const size = getDirSizeMB(target);
    if (size >= 0) saved += size;
    rmDir(target);
    console.log(`[prune-clawdbot]     removed ${pkg}${size >= 0 ? ` (${size} MB)` : ''}`);
  }
}

// Remove broken symlinks in .bin/
const binDir = path.join(nodeModules, '.bin');
if (fs.existsSync(binDir)) {
  try {
    for (const entry of fs.readdirSync(binDir)) {
      const linkPath = path.join(binDir, entry);
      try {
        const stat = fs.lstatSync(linkPath);
        if (stat.isSymbolicLink()) {
          try { fs.statSync(linkPath); } catch { fs.unlinkSync(linkPath); }
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
}

// Step 3: Remove specific build-artifact subdirectories from kept packages
console.log('[prune-clawdbot] 3/5 Removing build-artifact subdirectories...');
const SPECIFIC_DIRS_TO_REMOVE = [
  // C source for libopus — 376 files, build-only, never executed at runtime
  '@discordjs/opus/deps',
  // CSS/SCSS themes — not needed for Node.js terminal output
  'highlight.js/styles',
  'highlight.js/scss',
];
for (const relDir of SPECIFIC_DIRS_TO_REMOVE) {
  const target = path.join(nodeModules, relDir);
  if (rmDir(target)) {
    console.log(`[prune-clawdbot]     removed ${relDir}`);
  }
}

// Step 4: Clean up .cache, docs, source maps, and other non-runtime files.
// On Windows, individual file stat/unlink across thousands of entries is extremely
// slow on NTFS (can take 2+ hours). node_modules gets tarred before WiX anyway,
// so the per-file savings don't affect installer build time or file count — skip it.

// Exact filenames (case-insensitive) that are legal/doc text, never needed at runtime
const REMOVE_EXACT_NAMES = new Set([
  'license', 'licence', 'notice', 'copying', 'authors',
  'license.txt', 'licence.txt', 'notice.txt', 'copying.txt',
  'license.md', 'licence.md',
  '.gitattributes', '.npmignore', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'binding.gyp',
]);

function walkAndRemove(dir, predicate) {
  if (!fs.existsSync(dir)) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (predicate(entry.name, true)) {
          rmDir(fullPath);
        } else {
          walkAndRemove(fullPath, predicate);
        }
      } else if (entry.isFile() && predicate(entry.name, false)) {
        try { fs.unlinkSync(fullPath); } catch { /* skip */ }
      }
    }
  } catch { /* skip */ }
}

const REMOVE_DIRS = new Set([
  '.cache', 'docs', 'example', 'examples', 'test', 'tests', '__tests__',
  '__image_snapshots__', 'benchmark', 'benchmarks', '.github',
]);
function pruneArtifacts(dir) {
  walkAndRemove(dir, (name, isDir) => {
    if (isDir) return REMOVE_DIRS.has(name);
    const lower = name.toLowerCase();
    // Legal/doc files
    if (REMOVE_EXACT_NAMES.has(lower)) return true;
    // Changelog and similar — only doc/text extensions, never runtime .js/.cjs/.mjs modules
    const ext = lower.slice(lower.lastIndexOf('.'));
    const isRuntimeModule = ext === '.js' || ext === '.cjs' || ext === '.mjs';
    if (!isRuntimeModule && (lower.startsWith('changelog') || lower.startsWith('changes')
        || lower.startsWith('history') || lower.startsWith('authors'))) return true;
    // Source maps, TypeScript source/declarations, and docs — never needed at JS runtime
    return name.endsWith('.map')
      || name.endsWith('.ts') || name.endsWith('.cts') || name.endsWith('.mts')
      || name.endsWith('.md') || name.endsWith('.MD');
  });
}

// Directory-only pruning (no per-file stat/unlink). Fast enough to run on Windows.
// Recursively removes directories whose name is in dirNameSet, never touches individual files.
function pruneDirectoriesOnly(dir, dirNameSet) {
  if (!fs.existsSync(dir)) return;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(dir, entry.name);
      if (dirNameSet.has(entry.name)) {
        rmDir(fullPath);
      } else {
        pruneDirectoriesOnly(fullPath, dirNameSet);
      }
    }
  } catch { /* skip */ }
}

if (IS_WIN) {
  console.log('[prune-clawdbot] 4/5 Skipping ancillary file cleanup on Windows (node_modules will be tarred).');
} else {
  console.log('[prune-clawdbot] 4/5 Cleaning up ancillary files...');
  pruneArtifacts(nodeModules);
}

// Also clean up extension-level node_modules (installed by install-bundled-plugin-deps.cjs).
// These can contain test artifacts like __image_snapshots__ with deeply-nested paths that
// exceed the Windows MAX_PATH limit and cause WiX LGHT0103 errors.
// On non-Windows: full pruneArtifacts (dirs + per-file cleanup).
// On Windows: pruneDirectoriesOnly (dirs only, fast) + LONG_PATH_PACKAGE_SUBDIRS for known
// packages whose filenames themselves are too long even without test-artifact dirs.
// After pruning on Windows, each extension's node_modules is tar-packed into a single
// node_modules.tar. This keeps WiX under its 65535-file CAB limit (LGHT0306): large dep
// trees (@jimp, @aws-sdk, @discordjs, @slack, etc.) across all extensions can collectively
// exceed this limit. service.rs extracts each tar at gateway startup.
// Subdirectories of packages whose filenames exceed Windows MAX_PATH (260 chars)
// when placed under the full extension node_modules install path. WiX light.exe
// fails with LGHT0103 on these. List the subdir to remove (not the whole package,
// so the CJS dist/ entry point remains usable at runtime).
const LONG_PATH_PACKAGE_SUBDIRS = [
  // @mistralai/mistralai ESM and src TypeScript operation files have ~100-char
  // filenames that push the full path past 260 chars on Windows. The CJS dist/
  // tree is unaffected and sufficient at runtime.
  path.join('@mistralai', 'mistralai', 'esm'),
  path.join('@mistralai', 'mistralai', 'src'),
];

const EXTENSION_UNUSED_PACKAGES = [
  // Optional native image acceleration pulled in under WhatsApp/Jimp. The
  // channel only needs Jimp's JS QR/media path for Knapsack's bundled runtime,
  // and keeping Sharp adds platform-native payloads that push WhatsApp over the
  // extension-local size gate.
  '@img',
  'sharp',
];

if (fs.existsSync(distExtensionsDir)) {
  try {
    for (const extEntry of fs.readdirSync(distExtensionsDir, { withFileTypes: true })) {
      if (!extEntry.isDirectory()) continue;
      const extNodeModules = path.join(distExtensionsDir, extEntry.name, 'node_modules');
      if (fs.existsSync(extNodeModules)) {
        console.log(`[prune-clawdbot]     cleaning extension node_modules: ${extEntry.name}`);
        if (IS_WIN) {
          pruneDirectoriesOnly(extNodeModules, REMOVE_DIRS);
        } else {
          pruneArtifacts(extNodeModules);
        }
        for (const subdir of LONG_PATH_PACKAGE_SUBDIRS) {
          const target = path.join(extNodeModules, subdir);
          if (rmDir(target)) {
            console.log(`[prune-clawdbot]     removed long-path subdir: ${extEntry.name}/node_modules/${subdir.replace(/\\/g, '/')}`);
          }
        }
        for (const pkg of EXTENSION_UNUSED_PACKAGES) {
          const target = path.join(extNodeModules, pkg);
          if (rmDir(target)) {
            console.log(`[prune-clawdbot]     removed extension package: ${extEntry.name}/node_modules/${pkg}`);
          }
        }

        // On Windows: tar-pack extension node_modules to stay under WiX's 65535-file
        // CAB limit (LGHT0306). Large dep trees (e.g. @jimp, @aws-sdk, @slack,
        // @discordjs) across all extensions easily exceed this limit.
        // Packing into one tar per extension reduces thousands of files to one.
        // service.rs extracts each tar at gateway startup before launching Node.js.
        if (IS_WIN) {
          const extDir = path.join(distExtensionsDir, extEntry.name);
          try {
            const { spawnSync } = require('child_process');
            const result = spawnSync('tar', ['-cf', 'node_modules.tar', 'node_modules'], {
              cwd: extDir,
              stdio: 'pipe',
            });
            if (result.status === 0) {
              fs.rmSync(extNodeModules, { recursive: true, force: true });
              console.log(`[prune-clawdbot]     tarred extension node_modules: ${extEntry.name}`);
            } else {
              const err = result.stderr ? result.stderr.toString().trim() : 'unknown error';
              console.warn(`[prune-clawdbot]     WARNING: tar failed for ${extEntry.name}: ${err}`);
            }
          } catch (e) {
            console.warn(`[prune-clawdbot]     WARNING: could not tar ${extEntry.name}: ${e.message}`);
          }
        }
      }
    }
  } catch { /* skip */ }
}

// Step 5: Replace the openclaw self-symlink before Tauri resource bundling.
// install-bundled-plugin-deps.cjs creates node_modules/openclaw -> .. so the
// CI smoke test (which runs before prune) can resolve 'openclaw/plugin-sdk/*'
// imports.  But 'openclaw -> ..' is a cycle: Tauri's 'resources/clawdbot/**/*'
// glob follows it and recurses into clawdbot/ infinitely, causing the macOS
// build to spin for hours before failing.  Production macOS cannot recreate it
// inside the signed app, so prune replaces the cycle with a tiny package alias.
const openclawLink = path.join(nodeModules, 'openclaw');
try {
  const linkStat = fs.lstatSync(openclawLink);
  if (linkStat.isSymbolicLink()) {
    fs.unlinkSync(openclawLink);
    console.log('[prune-clawdbot] Removed openclaw self-symlink (prevents Tauri glob cycle)');
  }
} catch { /* not present — nothing to do */ }

// Production macOS bundles cannot recreate node_modules/openclaw at runtime
// without mutating the signed app. Keep a tiny non-cyclic package alias in the
// bundle so native-loaded bundled channel plugins can resolve
// `openclaw/plugin-sdk/*` imports without the old `openclaw -> ..` symlink.
function createOpenClawPackageAlias() {
  if (!fs.existsSync(nodeModules)) return;
  const rootPkgPath = path.join(CLAWDBOT_DIR, 'package.json');
  if (!fs.existsSync(rootPkgPath)) return;

  let rootPkg;
  try {
    rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  } catch {
    return;
  }

  const aliasDir = path.join(nodeModules, 'openclaw');
  fs.rmSync(aliasDir, { recursive: true, force: true });
  fs.mkdirSync(aliasDir, { recursive: true });

  const mappedExports = {};
  for (const [key, value] of Object.entries(rootPkg.exports || {})) {
    if (key === '.') {
      mappedExports[key] = './index.js';
      continue;
    }
    if (!key.startsWith('./plugin-sdk')) continue;
    if (typeof value === 'string') {
      mappedExports[key] = value.replace('./dist/plugin-sdk/', './plugin-sdk/');
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      mappedExports[key] = Object.fromEntries(
        Object.entries(value).map(([condition, target]) => [
          condition,
          typeof target === 'string'
            ? target.replace('./dist/plugin-sdk/', './plugin-sdk/')
            : target,
        ]),
      );
    }
  }

  fs.writeFileSync(
    path.join(aliasDir, 'package.json'),
    `${JSON.stringify({
      name: 'openclaw-bundle-alias',
      type: 'module',
      private: true,
      exports: mappedExports,
    }, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(aliasDir, 'index.js'),
    "export * from '../../dist/index.js';\n",
  );

  const sdkTarget = path.join('..', '..', 'dist', 'plugin-sdk');
  const sdkLink = path.join(aliasDir, 'plugin-sdk');
  try {
    fs.symlinkSync(sdkTarget, sdkLink, 'dir');
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.warn(`[prune-clawdbot] WARNING: could not create openclaw/plugin-sdk alias symlink: ${err.message}`);
    }
  }

  // plugin-sdk files import shared hashed chunks as `../chunk-*.js`.
  // Mirror the root JS files as non-recursive symlinks so those relative imports
  // resolve without restoring the old cyclic `openclaw -> ..` package link.
  for (const entry of fs.readdirSync(path.join(CLAWDBOT_DIR, 'dist'), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const target = path.join('..', '..', 'dist', entry.name);
    const link = path.join(aliasDir, entry.name);
    try {
      fs.symlinkSync(target, link);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.warn(`[prune-clawdbot] WARNING: could not create openclaw chunk alias ${entry.name}: ${err.message}`);
      }
    }
  }
  console.log('[prune-clawdbot] Created non-cyclic openclaw package alias for bundled plugin SDK imports');
}

createOpenClawPackageAlias();

// Step 6: Report results
if (!IS_WIN) {
  console.log('[prune-clawdbot] 6/6 Computing final sizes...');
  const afterNM = getDirSizeMB(nodeModules);
  const afterExt = getDirSizeMB(extensionsDir);
  const totalSaved = (beforeNM + beforeExt) - (afterNM + afterExt);
  console.log(`[prune-clawdbot] Pruned: node_modules ${sizeStr(beforeNM)} -> ${sizeStr(afterNM)}, extensions ${sizeStr(beforeExt)} -> ${sizeStr(afterExt)}`);
  console.log(`[prune-clawdbot] Total saved: ~${totalSaved} MB`);
} else {
  console.log('[prune-clawdbot] 6/6 Done (size reporting skipped on Windows).');
}
