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
  'package.json',
  'node_modules/fast-xml-parser/package.json',
  'node_modules/fast-xml-parser/src/fxp.js',
];

// Critical directories that must exist and not be empty
const REQUIRED_DIRS = [
  'dist',
  'node_modules',
  'node_modules/fast-xml-parser',
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

// Verify fast-xml-parser version matches expected
const fxpPkgPath = path.join(CLAWDBOT_DIR, 'node_modules', 'fast-xml-parser', 'package.json');
if (fs.existsSync(fxpPkgPath)) {
  const fxpPkg = JSON.parse(fs.readFileSync(fxpPkgPath, 'utf8'));
  if (!fxpPkg.version || !fxpPkg.version.startsWith('5.')) {
    console.error(`[verify-clawdbot] WRONG VERSION: fast-xml-parser is ${fxpPkg.version}, expected 5.x`);
    errors++;
  } else {
    console.log(`[verify-clawdbot] fast-xml-parser version: ${fxpPkg.version} ✓`);
  }
}

if (errors > 0) {
  console.error(`\n[verify-clawdbot] ❌ FAILED: ${errors} issue(s) found. Fix before building.`);
  process.exit(1);
} else {
  console.log('[verify-clawdbot] ✅ All critical clawdbot files verified.');
}
