#!/usr/bin/env node
/**
 * Reports duplicated packages in the bundled OpenClaw runtime tree.
 *
 * This is intentionally read-only. Pass --enforce to fail on obvious bundle
 * bloat, such as extension-local node_modules directories above the limit.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const CLAWDBOT_DIR = path.join(PROJECT_DIR, 'src-tauri', 'resources', 'clawdbot');
const EXTENSIONS_DIR = path.join(CLAWDBOT_DIR, 'dist', 'extensions');
const ENFORCE = process.argv.includes('--enforce');
const MAX_EXTENSION_MB = Number(process.env.CLAWDBOT_MAX_EXTENSION_NODE_MODULES_MB || 50);
const ALLOW_LARGE_EXTENSIONS = new Set(
  (process.env.CLAWDBOT_ALLOW_LARGE_EXTENSIONS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

function formatMB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function dirSizeBytes(dir) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      try {
        if (entry.isDirectory()) stack.push(fullPath);
        else if (entry.isFile()) total += fs.statSync(fullPath).size;
      } catch {
        // Ignore files that disappear during local dev churn.
      }
    }
  }
  return total;
}

function collectPackagesFromNodeModules(nodeModulesDir, out) {
  if (!fs.existsSync(nodeModulesDir)) return;
  let entries = [];
  try {
    entries = fs.readdirSync(nodeModulesDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    if (entry.name.startsWith('@')) {
      const scopeDir = path.join(nodeModulesDir, entry.name);
      let scoped = [];
      try {
        scoped = fs.readdirSync(scopeDir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const scopedEntry of scoped) {
        if (scopedEntry.isDirectory()) {
          collectPackage(path.join(scopeDir, scopedEntry.name), out);
        }
      }
    } else {
      collectPackage(path.join(nodeModulesDir, entry.name), out);
    }
  }
}

function collectPackage(pkgDir, out) {
  const pkgPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.name) {
      out.push({
        name: pkg.name,
        version: pkg.version || '',
        dir: pkgDir,
        size: dirSizeBytes(pkgDir),
      });
    }
  } catch {
    return;
  }

  collectPackagesFromNodeModules(path.join(pkgDir, 'node_modules'), out);
}

function collectAllPackages(root) {
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.name === 'node_modules') {
        collectPackagesFromNodeModules(fullPath, out);
      } else {
        stack.push(fullPath);
      }
    }
  }
  return out;
}

function collectExtensionNodeModules() {
  if (!fs.existsSync(EXTENSIONS_DIR)) return [];
  return fs
    .readdirSync(EXTENSIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const nodeModules = path.join(EXTENSIONS_DIR, entry.name, 'node_modules');
      return {
        name: entry.name,
        path: nodeModules,
        size: dirSizeBytes(nodeModules),
        present: fs.existsSync(nodeModules),
      };
    })
    .filter((entry) => entry.present)
    .sort((a, b) => b.size - a.size);
}

if (!fs.existsSync(CLAWDBOT_DIR)) {
  console.error(`[clawdbot-duplicates] Missing ${CLAWDBOT_DIR}`);
  process.exit(1);
}

const packages = collectAllPackages(CLAWDBOT_DIR);
const byName = new Map();
for (const pkg of packages) {
  if (!byName.has(pkg.name)) byName.set(pkg.name, []);
  byName.get(pkg.name).push(pkg);
}

const duplicated = [...byName.entries()]
  .filter(([, items]) => items.length > 1)
  .map(([name, items]) => ({
    name,
    count: items.length,
    versions: [...new Set(items.map((item) => item.version))].sort(),
    size: items.reduce((sum, item) => sum + item.size, 0),
  }))
  .sort((a, b) => b.count - a.count || b.size - a.size);

const duplicatedBySize = [...duplicated].sort((a, b) => b.size - a.size);
const extensionNodeModules = collectExtensionNodeModules();
const rootNodeModules = path.join(CLAWDBOT_DIR, 'node_modules');

console.log('[clawdbot-duplicates] Bundle size summary');
console.log(`  clawdbot: ${formatMB(dirSizeBytes(CLAWDBOT_DIR))}`);
console.log(`  root node_modules: ${formatMB(dirSizeBytes(rootNodeModules))}`);
console.log(`  package instances: ${packages.length}`);
console.log(`  duplicated package names: ${duplicated.length}`);

console.log('\n[clawdbot-duplicates] Largest extension node_modules');
for (const entry of extensionNodeModules.slice(0, 25)) {
  console.log(`  ${formatMB(entry.size).padStart(9)}  ${entry.name}`);
}

console.log('\n[clawdbot-duplicates] Most duplicated package names');
for (const item of duplicated.slice(0, 40)) {
  console.log(
    `  ${String(item.count).padStart(3)}x  ${item.name}  versions=${item.versions.join(',')}`,
  );
}

console.log('\n[clawdbot-duplicates] Largest repeated package footprints');
for (const item of duplicatedBySize.slice(0, 25)) {
  console.log(
    `  ${formatMB(item.size).padStart(9)}  ${String(item.count).padStart(3)}x  ${item.name}  versions=${item.versions.join(',')}`,
  );
}

let failures = 0;
if (ENFORCE) {
  for (const entry of extensionNodeModules) {
    const sizeMb = entry.size / 1024 / 1024;
    if (sizeMb > MAX_EXTENSION_MB && !ALLOW_LARGE_EXTENSIONS.has(entry.name)) {
      console.error(
        `[clawdbot-duplicates] FAIL: dist/extensions/${entry.name}/node_modules is ${formatMB(entry.size)}; limit is ${MAX_EXTENSION_MB} MB`,
      );
      failures++;
    }
  }
}

if (failures > 0) process.exit(1);
