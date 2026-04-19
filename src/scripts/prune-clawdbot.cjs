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

const beforeNM = getDirSizeMB(nodeModules);
const beforeExt = getDirSizeMB(extensionsDir);
console.log(`[prune-clawdbot] Pruning clawdbot bundle (node_modules: ${beforeNM} MB, extensions: ${beforeExt} MB)...`);

// Step 1: Remove unused extensions
const UNUSED_EXTENSIONS = [
  'bluebubbles', 'copilot-proxy', 'feishu', 'google-antigravity-auth',
  'google-gemini-cli-auth', 'line', 'lobster', 'matrix', 'mattermost',
  'minimax-portal-auth', 'msteams', 'nextcloud-talk', 'nostr', 'open-prose',
  'qwen-portal-auth', 'tlon', 'twitch', 'zalo', 'zalouser',
];

console.log(`[prune-clawdbot] 1/3 Removing ${UNUSED_EXTENSIONS.length} unused extensions...`);
for (const ext of UNUSED_EXTENSIONS) {
  rmDir(path.join(extensionsDir, ext));
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
  '@oxlint', '@oxlint-tsgolint', '@oxfmt',
  '@typescript', // @typescript/native-preview — TS compiler preview, dev only
  'vitest', '@vitest', '@jscpd',
  'madge', 'precinct', 'filing-cabinet', 'dependency-tree',
  '@lit', '@lit-labs', 'lit',
];

let saved = 0;
console.log(`[prune-clawdbot] 2/3 Removing ${UNUSED_PACKAGES.length} unused packages...`);
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

// Step 3: Clean up .cache, docs, and source maps
console.log('[prune-clawdbot] 3/3 Cleaning up ancillary files...');

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

const REMOVE_DIRS = new Set(['.cache', 'docs', 'example', 'examples', 'test', 'tests', '__tests__', '__image_snapshots__']);
walkAndRemove(nodeModules, (name, isDir) => {
  if (isDir) return REMOVE_DIRS.has(name);
  return name.endsWith('.map');
});

const afterNM = getDirSizeMB(nodeModules);
const afterExt = getDirSizeMB(extensionsDir);
const totalSaved = (beforeNM + beforeExt) - (afterNM + afterExt);
console.log(`[prune-clawdbot] Pruned: node_modules ${beforeNM} MB -> ${afterNM} MB, extensions ${beforeExt} MB -> ${afterExt} MB`);
console.log(`[prune-clawdbot] Total saved: ~${totalSaved} MB`);
