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

if (!fs.existsSync(path.join(CLAWDBOT_DIR, 'node_modules'))) {
  console.log('[prune-clawdbot] No node_modules found — skipping.');
  process.exit(0);
}

function getDirSizeMB(dir) {
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
console.log(`[prune-clawdbot] Pruning clawdbot bundle (node_modules: ${beforeNM} MB, extensions: ${beforeExt} MB)...`);

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
  '@node-llama-cpp', 'node-llama-cpp', 'pdfjs-dist', '@napi-rs', '@img',
  'sharp', '@larksuiteoapi', 'typescript', '@cloudflare',
  'web-streams-polyfill', 'bun-types', '@lydell/node-pty',
  '@mozilla/readability', 'linkedom', 'signal-utils', 'sqlite-vec',
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
    saved += size;
    rmDir(target);
    console.log(`[prune-clawdbot]     removed ${pkg} (${size} MB)`);
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

// Step 4: Clean up .cache, docs, source maps, and other non-runtime files
console.log('[prune-clawdbot] 4/5 Cleaning up ancillary files...');

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

pruneArtifacts(nodeModules);

// Also clean up extension-level node_modules (installed by install-bundled-plugin-deps.cjs).
// These can contain test artifacts like __image_snapshots__ with deeply-nested paths that
// exceed the Windows MAX_PATH limit and cause NSIS bundling to fail.
// Subdirectories of packages whose filenames exceed Windows MAX_PATH (260 chars)
// when placed under the full extension node_modules install path. WiX light.exe
// fails with LGHT0103 on these. List the subdir to remove (not the whole package,
// so the CJS dist/ entry point remains usable at runtime).
const LONG_PATH_PACKAGE_SUBDIRS = [
  // @mistralai/mistralai ESM operation files have ~100-char filenames that push
  // the full path past 260 chars. The CJS dist/ tree is unaffected and sufficient.
  path.join('@mistralai', 'mistralai', 'esm'),
];

if (fs.existsSync(distExtensionsDir)) {
  try {
    for (const extEntry of fs.readdirSync(distExtensionsDir, { withFileTypes: true })) {
      if (!extEntry.isDirectory()) continue;
      const extNodeModules = path.join(distExtensionsDir, extEntry.name, 'node_modules');
      if (fs.existsSync(extNodeModules)) {
        console.log(`[prune-clawdbot]     cleaning extension node_modules: ${extEntry.name}`);
        pruneArtifacts(extNodeModules);
        for (const subdir of LONG_PATH_PACKAGE_SUBDIRS) {
          const target = path.join(extNodeModules, subdir);
          if (rmDir(target)) {
            console.log(`[prune-clawdbot]     removed long-path subdir: ${extEntry.name}/node_modules/${subdir.replace(/\\/g, '/')}`);
          }
        }
      }
    }
  } catch { /* skip */ }
}

// Step 5: Report results
console.log('[prune-clawdbot] 5/5 Computing final sizes...');
const afterNM = getDirSizeMB(nodeModules);
const afterExt = getDirSizeMB(extensionsDir);
const totalSaved = (beforeNM + beforeExt) - (afterNM + afterExt);
console.log(`[prune-clawdbot] Pruned: node_modules ${beforeNM} MB -> ${afterNM} MB, extensions ${beforeExt} MB -> ${afterExt} MB`);
console.log(`[prune-clawdbot] Total saved: ~${totalSaved} MB`);
