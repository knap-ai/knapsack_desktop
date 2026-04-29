#!/usr/bin/env node
/**
 * verify-clawdbot-bundle.cjs — Verifies that critical clawdbot files exist
 * after pruning and before Tauri bundling. Fails the build early if anything
 * is missing.
 *
 * Run after prune-clawdbot.cjs and before `tauri build`.
 */
const fs = require('fs');
const path = require('path');

const CLAWDBOT_DIR = path.join(__dirname, '..', 'src-tauri', 'resources', 'clawdbot');

// Critical files that must exist in the bundle
const REQUIRED_FILES = [
  'dist/entry.js',
  'dist/index.js',
  'dist/build-info.json',
  'package.json',
];

// Critical directories that must exist and not be empty
const REQUIRED_DIRS = [
  'dist',
  'dist/extensions',
];

let errors = 0;

console.log('[verify-clawdbot] Checking critical clawdbot bundle files...');

for (const file of REQUIRED_FILES) {
  const fullPath = path.join(CLAWDBOT_DIR, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`[verify-clawdbot] MISSING: ${file}`);
    errors++;
  } else {
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      console.error(`[verify-clawdbot] EMPTY: ${file} (0 bytes)`);
      errors++;
    }
  }
}

for (const dir of REQUIRED_DIRS) {
  const fullPath = path.join(CLAWDBOT_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    console.error(`[verify-clawdbot] MISSING DIR: ${dir}`);
    errors++;
  } else {
    const entries = fs.readdirSync(fullPath);
    if (entries.length === 0) {
      console.error(`[verify-clawdbot] EMPTY DIR: ${dir}`);
      errors++;
    }
  }
}

// Verify entry.js is a valid JS file (not truncated)
const entryPath = path.join(CLAWDBOT_DIR, 'dist', 'entry.js');
if (fs.existsSync(entryPath)) {
  const content = fs.readFileSync(entryPath, 'utf8');
  if (content.length < 100) {
    console.error(`[verify-clawdbot] SUSPICIOUS: dist/entry.js is only ${content.length} bytes — possibly truncated`);
    errors++;
  }
  if (!content.includes('#!/')) {
    console.error('[verify-clawdbot] SUSPICIOUS: dist/entry.js missing shebang — possibly corrupted');
    errors++;
  }
}

// Verify package.json has "type": "module" (critical for ESM entry.js)
const rootPkgPath = path.join(CLAWDBOT_DIR, 'package.json');
if (fs.existsSync(rootPkgPath)) {
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  if (rootPkg.type !== 'module') {
    console.error(`[verify-clawdbot] CRITICAL: package.json "type" is "${rootPkg.type}" — must be "module" for ESM entry.js`);
    errors++;
  } else {
    console.log('[verify-clawdbot] package.json type: "module" ✓');
  }
}

// Verify entry.js chunk dependencies exist in dist/
if (fs.existsSync(entryPath)) {
  const content = fs.readFileSync(entryPath, 'utf8');
  const importRegex = /from\s+["']\.\/([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const chunkPath = path.join(CLAWDBOT_DIR, 'dist', match[1]);
    if (!fs.existsSync(chunkPath)) {
      console.error(`[verify-clawdbot] MISSING CHUNK: dist/${match[1]} (imported by entry.js)`);
      errors++;
    }
  }
}

// Verify bundled extensions have required plugin metadata
const extensionsDir = path.join(CLAWDBOT_DIR, 'dist', 'extensions');
if (fs.existsSync(extensionsDir)) {
  const extensions = fs.readdirSync(extensionsDir);
  const extensionsWithPlugin = extensions.filter(ext => {
    const pluginJson = path.join(extensionsDir, ext, 'openclaw.plugin.json');
    return fs.existsSync(pluginJson);
  });
  console.log(`[verify-clawdbot] bundled extensions: ${extensions.length} total, ${extensionsWithPlugin.length} with plugin metadata ✓`);
  if (extensionsWithPlugin.length < 10) {
    console.error(`[verify-clawdbot] SUSPICIOUS: only ${extensionsWithPlugin.length} extensions have plugin metadata — expected many more`);
    errors++;
  }
}

// Verify build-info.json has version info
const buildInfoPath = path.join(CLAWDBOT_DIR, 'dist', 'build-info.json');
if (fs.existsSync(buildInfoPath)) {
  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
  if (!buildInfo.version) {
    console.error('[verify-clawdbot] CRITICAL: dist/build-info.json missing version');
    errors++;
  } else {
    console.log(`[verify-clawdbot] build version: ${buildInfo.version} ✓`);
  }
}

// Verify critical externalized npm packages exist in node_modules.
// The dist bundle externalizes many packages that must be resolvable at runtime.
// These are the packages required by the gateway startup path — if any are missing
// the gateway crashes immediately with ERR_MODULE_NOT_FOUND.
const CRITICAL_PACKAGES = [
  // NOTE: 'openclaw' self-symlink is intentionally absent.  It is created by
  // install-bundled-plugin-deps.cjs for the CI smoke test, but prune-clawdbot.cjs
  // removes it before the Tauri build to prevent Tauri's resources/clawdbot/**/*
  // glob from following the cycle (openclaw -> ..) and spinning forever.
  // service.rs recreates it at runtime after resource extraction.
  'chalk',
  'commander',
  'chokidar',
  'ws',
  'yaml',
  'zod',
  'dotenv',
  'express',
  'undici',
  'ajv',
  'croner',
  'json5',
  'tar',
  'jszip',
  'https-proxy-agent',
  'cli-highlight',
  'markdown-it',
  '@anthropic-ai/vertex-sdk',
  '@mariozechner/pi-coding-agent',
  // typebox renamed from @sinclair/typebox in openclaw 2026.4.24+
  'typebox',
  '@clack/prompts',
  '@modelcontextprotocol/sdk',
  '@slack/web-api',
  'file-type',
];

const nodeModulesDir = path.join(CLAWDBOT_DIR, 'node_modules');
if (fs.existsSync(nodeModulesDir)) {
  const missing = [];
  for (const pkg of CRITICAL_PACKAGES) {
    const pkgJson = path.join(nodeModulesDir, pkg, 'package.json');
    if (!fs.existsSync(pkgJson)) {
      missing.push(pkg);
    }
  }
  if (missing.length > 0) {
    console.error(`[verify-clawdbot] MISSING CRITICAL PACKAGES (${missing.length}):`);
    for (const pkg of missing) {
      console.error(`[verify-clawdbot]   - node_modules/${pkg}/package.json`);
    }
    errors += missing.length;
  } else {
    console.log(`[verify-clawdbot] critical packages: ${CRITICAL_PACKAGES.length} verified in node_modules ✓`);
  }
} else {
  console.error('[verify-clawdbot] CRITICAL: node_modules directory is missing entirely');
  errors++;
}

if (errors > 0) {
  console.error(`\n[verify-clawdbot] ❌ FAILED: ${errors} issue(s) found. Fix before building.`);
  process.exit(1);
} else {
  console.log('[verify-clawdbot] ✅ All critical clawdbot files verified.');
}
