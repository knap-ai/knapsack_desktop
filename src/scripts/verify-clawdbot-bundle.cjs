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
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

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

// Verify all relative JS imports inside dist resolve. Some bundled chunks use
// dynamic imports that entry.js does not reference directly; missing those files
// only appears at runtime (for example, `openclaw doctor --fix`).
function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walkFiles(fullPath, out);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(fullPath);
    }
  }
  return out;
}

function stripQueryOrHash(specifier) {
  return specifier.split(/[?#]/, 1)[0];
}

function resolveRelativeJsImport(importerPath, specifier) {
  const clean = stripQueryOrHash(specifier);
  const resolved = path.resolve(path.dirname(importerPath), clean);
  if (path.extname(resolved)) return resolved;
  return `${resolved}.js`;
}

const tarEntryCache = new Map();

function listTarEntries(tarPath) {
  if (tarEntryCache.has(tarPath)) return tarEntryCache.get(tarPath);
  const result = spawnSync('tar', ['-tf', tarPath], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  if (result.status !== 0) {
    console.error(`[verify-clawdbot] CRITICAL: unable to inspect ${path.relative(CLAWDBOT_DIR, tarPath)}`);
    if (result.stderr) console.error(result.stderr.trim());
    errors++;
    tarEntryCache.set(tarPath, []);
    return [];
  }
  const entries = result.stdout
    .split(/\r?\n/)
    .map((entry) => entry.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, ''))
    .filter(Boolean);
  tarEntryCache.set(tarPath, entries);
  return entries;
}

function extensionDependencyExists(extensionDir, dependencyName) {
  const nodeModules = path.join(extensionDir, 'node_modules');
  if (fs.existsSync(path.join(nodeModules, dependencyName))) return true;

  const tarPath = path.join(extensionDir, 'node_modules.tar');
  if (!fs.existsSync(tarPath)) return false;

  const dependencyPrefix = `node_modules/${dependencyName}`;
  return listTarEntries(tarPath).some(
    (entry) => entry === dependencyPrefix || entry.startsWith(`${dependencyPrefix}/`)
  );
}

const distDir = path.join(CLAWDBOT_DIR, 'dist');
const relativeImportRegexes = [
  /(?:^|[;\n]\s*)import\s+(?:[^"';]+?\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/g,
  /(?:^|[;\n]\s*)export\s+[^"';]+?\s+from\s+["'](\.{1,2}\/[^"']+)["']/g,
  // Matches dynamic import() — both `await import(...)` (space before "import")
  // and call-expression forms like `foo(import(...))`, assignments, etc.
  /(?:^|[=({[,;:\n\s]\s*)import\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g,
];

for (const jsFile of walkFiles(distDir)) {
  // Remove comments first so JSDoc type references like
  // `@type {import("./foo")}` are not treated as runtime imports.
  const content = fs
    .readFileSync(jsFile, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  for (const regex of relativeImportRegexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const targetPath = resolveRelativeJsImport(jsFile, match[1]);
      if (!fs.existsSync(targetPath)) {
        const importer = path.relative(CLAWDBOT_DIR, jsFile);
        const target = path.relative(CLAWDBOT_DIR, targetPath);
        console.error(
          `[verify-clawdbot] MISSING RELATIVE IMPORT: ${target} (imported by ${importer})`
        );
        errors++;
      }
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

  for (const requiredChannel of ['telegram', 'slack', 'imessage', 'whatsapp']) {
    const dir = path.join(extensionsDir, requiredChannel);
    const pkg = path.join(dir, 'package.json');
    if (!fs.existsSync(dir) || !fs.existsSync(pkg)) {
      console.error(`[verify-clawdbot] CRITICAL: required Knapsack channel extension missing: ${requiredChannel}`);
      errors++;
      continue;
    }
    const packageJson = JSON.parse(fs.readFileSync(pkg, 'utf8'));
    const channelId = packageJson?.openclaw?.channel?.id;
    if (channelId !== requiredChannel) {
      console.error(`[verify-clawdbot] CRITICAL: ${requiredChannel} package.json does not declare openclaw.channel.id=${requiredChannel}`);
      errors++;
    }
  }

  const whatsappExtensionDir = path.join(extensionsDir, 'whatsapp');
  for (const requiredDep of ['baileys', 'jimp', '@pinojs/redact', 'whatsapp-rust-bridge']) {
    if (!extensionDependencyExists(whatsappExtensionDir, requiredDep)) {
      console.error(`[verify-clawdbot] CRITICAL: WhatsApp bundled dependency missing: ${requiredDep}`);
      errors++;
    }
  }
  const whatsappPkgPath = path.join(extensionsDir, 'whatsapp', 'package.json');
  if (fs.existsSync(whatsappPkgPath)) {
    const whatsappPkg = JSON.parse(fs.readFileSync(whatsappPkgPath, 'utf8'));
    const authSpecifier = whatsappPkg?.openclaw?.channel?.persistedAuthState?.specifier;
    if (authSpecifier !== './dist/auth-presence.js') {
      console.error('[verify-clawdbot] CRITICAL: WhatsApp persistedAuthState must point at built dist/auth-presence.js');
      errors++;
    }
  }
}

// Bundled extension modules import the SDK through the package name `openclaw`.
// In the signed desktop app that package is resolved through Jiti aliases rather
// than a real node_modules/openclaw symlink. If bundled dist/extensions/*.js is
// loaded natively, startup model/provider discovery crashes before /health.
const sdkAliasChunks = fs.existsSync(distDir)
  ? fs.readdirSync(distDir).filter((name) => /^sdk-alias-.*\.js$/.test(name))
  : [];
const sdkAliasChunk = sdkAliasChunks.length === 1 ? path.join(distDir, sdkAliasChunks[0]) : null;
if (!sdkAliasChunk) {
  console.error('[verify-clawdbot] MISSING: dist/sdk-alias-*.js — plugin loader alias runtime not found');
  errors++;
} else {
  const content = fs.readFileSync(sdkAliasChunk, 'utf8');
  if (!content.includes('fsCache: false')) {
    console.error('[verify-clawdbot] CRITICAL: plugin Jiti loader must disable fsCache to keep signed app bundles sealed');
    errors++;
  }
  if (!content.includes('if (isBundledPluginDistModulePath(modulePath)) return shouldPreferNativeModuleLoad(modulePath);')) {
    console.error('[verify-clawdbot] CRITICAL: bundled dist/extensions modules should prefer native loading for built JS to avoid signed-bundle Jiti transpilation');
    errors++;
  }
}

const rootAliasPath = path.join(CLAWDBOT_DIR, 'dist', 'plugin-sdk', 'root-alias.cjs');
if (fs.existsSync(rootAliasPath)) {
  const content = fs.readFileSync(rootAliasPath, 'utf8');
  if (!content.includes('fsCache: false')) {
    console.error('[verify-clawdbot] CRITICAL: plugin-sdk/root-alias.cjs must disable Jiti fsCache in signed app bundles');
    errors++;
  }
}

const modelCatalogChunks = fs.existsSync(distDir)
  ? fs.readdirSync(distDir).filter((name) => /^model-catalog-.*\.js$/.test(name))
  : [];
let modelCatalogEntry = null;
for (const name of modelCatalogChunks) {
  const candidate = path.join(distDir, name);
  const content = fs.readFileSync(candidate, 'utf8');
  if (content.includes('loadModelCatalog') && content.includes('findModelCatalogEntry')) {
    modelCatalogEntry = candidate;
    break;
  }
}

if (process.platform === 'win32') {
  console.log('[verify-clawdbot] bundled model catalog smoke: skipped on Windows CI; static sealed-bundle loader checks still apply ✓');
} else if (sdkAliasChunk && modelCatalogEntry) {
  const modelCatalogUrl = pathToFileURL(modelCatalogEntry).href;
  const smoke = spawnSync(process.execPath, ['--input-type=module', '-e', `
    process.env.OPENCLAW_BUNDLED_PLUGINS_DIR = ${JSON.stringify(extensionsDir)};
    process.env.OPENCLAW_TEST_ONLY_PROVIDER_PLUGIN_IDS = 'openai,anthropic';
    const catalog = await import(${JSON.stringify(modelCatalogUrl)});
    const models = await catalog.loadModelCatalog({ readOnly: true, useCache: false });
    if (!Array.isArray(models)) throw new Error('model catalog did not return an array');
    console.log(models.length);
  `], {
    cwd: CLAWDBOT_DIR,
    env: {
      ...process.env,
      OPENCLAW_BUNDLED_PLUGINS_DIR: extensionsDir,
      OPENCLAW_TEST_ONLY_PROVIDER_PLUGIN_IDS: 'openai,anthropic',
    },
    encoding: 'utf8',
    timeout: 120000,
  });
  if (smoke.status !== 0) {
    console.error('[verify-clawdbot] CRITICAL: bundled model catalog smoke failed');
    if (smoke.error) console.error(String(smoke.error));
    if (smoke.signal) console.error(`[verify-clawdbot] smoke terminated by signal: ${smoke.signal}`);
    if (smoke.stderr) console.error(smoke.stderr.trim());
    errors++;
  } else {
    console.log(`[verify-clawdbot] bundled model catalog smoke: ${smoke.stdout.trim()} models ✓`);
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
  'undici',
  'ajv',
  'croner',
  'json5',
  'tar',
  'jszip',
  'markdown-it',
  '@earendil-works/pi-coding-agent',
  '@earendil-works/pi-ai',
  '@earendil-works/pi-agent-core',
  'typebox',
  '@clack/core',
  '@clack/prompts',
  '@agentclientprotocol/sdk',
  '@modelcontextprotocol/sdk',
  '@openclaw/fs-safe',
  '@openclaw/proxyline',
  'file-type',
  // jiti is used by gateway dist chunks for plugin loading.  Must be v2+
  // (v2 exports createJiti; v1 does not, causing a runtime SyntaxError).
  'jiti',
  // added in openclaw 2026.4.26
  'web-push',
  // added/kept in openclaw 2026.5.x startup and gateway paths
  'express',
  'kysely',
  'grammy',
  '@google/genai',
  'playwright-core',
  'qrcode',
  'tokenjuice',
  'tslog',
];

// Packages that must be a specific minimum major version.
// A wrong-major install (e.g. jiti v1 when v2 is required) is as bad as missing.
const REQUIRED_MAJOR_VERSIONS = {
  jiti: 2,
  zod: 4,
  undici: 8,
  typebox: 1,
};

const nodeModulesDir = path.join(CLAWDBOT_DIR, 'node_modules');
if (fs.existsSync(nodeModulesDir)) {
  const missing = [];
  for (const pkg of CRITICAL_PACKAGES) {
    const pkgJson = path.join(nodeModulesDir, pkg, 'package.json');
    if (!fs.existsSync(pkgJson)) {
      missing.push(pkg);
      continue;
    }
    // Check minimum major version when required.
    const minMajor = REQUIRED_MAJOR_VERSIONS[pkg];
    if (minMajor !== undefined) {
      try {
        const installed = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
        const installedMajor = parseInt((installed.version || '0').split('.')[0], 10);
        if (installedMajor < minMajor) {
          console.error(
            `[verify-clawdbot] WRONG VERSION: node_modules/${pkg} is v${installed.version} — need v${minMajor}+`
          );
          errors++;
        }
      } catch { /* unreadable package.json — already caught as missing above */ }
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

// Verify bundled Node.js toolchain in resources/node/
// On Windows: node.exe must exist AND node_modules/npm/bin/npm-cli.js must
// be present so plugins can stage their bundled runtime deps at first run.
// Missing npm was the root cause of all five plugins failing on Windows with
// "Unable to resolve a safe npm executable on Windows".
const NODE_DIR = path.join(__dirname, '..', 'src-tauri', 'resources', 'node');
const isWindows = process.platform === 'win32';
const nodeBin = path.join(NODE_DIR, isWindows ? 'node.exe' : 'node');

if (!fs.existsSync(nodeBin)) {
  console.error(`[verify-clawdbot] MISSING: resources/node/${isWindows ? 'node.exe' : 'node'} — run: node scripts/prepare-node.cjs`);
  errors++;
} else {
  console.log(`[verify-clawdbot] node binary: resources/node/${isWindows ? 'node.exe' : 'node'} ✓`);
}

if (isWindows) {
  const npmCliPath = path.join(NODE_DIR, 'node_modules', 'npm', 'bin', 'npm-cli.js');
  if (!fs.existsSync(npmCliPath)) {
    console.error('[verify-clawdbot] MISSING: resources/node/node_modules/npm/bin/npm-cli.js');
    console.error('[verify-clawdbot]   Plugin runtime deps will fail on Windows. Run: node scripts/prepare-node.cjs');
    errors++;
  } else {
    console.log('[verify-clawdbot] npm toolchain: resources/node/node_modules/npm/bin/npm-cli.js ✓');
  }
}

// Verify that critical plugins with non-trivial runtime dependencies have
// stageRuntimeDependencies: true.  Without this flag the Tauri service.rs
// runtime dep installer skips the plugin, leaving deps uninstalled.
// This check exists because the flag was previously missing from the browser
// plugin, causing playwright-core to never be installed → browser tool
// failures → stuck sessions → gateway reconnection loop.
const REQUIRED_STAGE_RUNTIME_DEPS_PLUGINS = [
  'browser',   // playwright-core — core browser/navigate tool
];

if (fs.existsSync(extensionsDir)) {
  for (const pluginName of REQUIRED_STAGE_RUNTIME_DEPS_PLUGINS) {
    const pkgPath = path.join(extensionsDir, pluginName, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      console.error(`[verify-clawdbot] MISSING PLUGIN: dist/extensions/${pluginName}/package.json — required plugin not found`);
      errors++;
      continue;
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const hasFlag = pkg?.openclaw?.bundle?.stageRuntimeDependencies === true;
    if (!hasFlag) {
      console.error(
        `[verify-clawdbot] MISSING FLAG: dist/extensions/${pluginName}/package.json` +
        ` is missing openclaw.bundle.stageRuntimeDependencies=true — ` +
        `runtime deps (e.g. playwright-core) will not be installed on user machines.`
      );
      errors++;
    } else {
      console.log(`[verify-clawdbot] plugin ${pluginName}: stageRuntimeDependencies ✓`);
    }
  }
}

if (errors > 0) {
  console.error(`\n[verify-clawdbot] ❌ FAILED: ${errors} issue(s) found. Fix before building.`);
  process.exit(1);
} else {
  console.log('[verify-clawdbot] ✅ All critical clawdbot files verified.');
}
