#!/usr/bin/env node
/**
 * prepare-node.js — Downloads the Node.js binary for bundling into the Knapsack app.
 *
 * Cross-platform replacement for prepare-node.sh.
 * Runs automatically via the npm `prebuild` hook (before `tsc && vite build`),
 * so every `tauri build` gets the right binary without manual intervention.
 *
 * Override the version:  NODE_VERSION=22.15.0 node scripts/prepare-node.js
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

const NODE_VERSION = process.env.NODE_VERSION || '22.14.0';
const SCRIPT_DIR = __dirname;
const PROJECT_DIR = path.resolve(SCRIPT_DIR, '..');
const TARGET_DIR = path.join(PROJECT_DIR, 'src-tauri', 'resources', 'node');

// ---------------------------------------------------------------------------
// Detect OS
// ---------------------------------------------------------------------------
function getOS() {
  const platform = process.platform;
  if (platform === 'darwin') return 'darwin';
  if (platform === 'linux') return 'linux';
  if (platform === 'win32') return 'win';
  throw new Error(`Unsupported OS: ${platform}`);
}

// ---------------------------------------------------------------------------
// Detect architecture
// ---------------------------------------------------------------------------
function getArch() {
  const arch = process.arch;
  if (arch === 'x64') return 'x64';
  if (arch === 'arm64') return 'arm64';
  throw new Error(`Unsupported architecture: ${arch}`);
}

// ---------------------------------------------------------------------------
// Download a file
// ---------------------------------------------------------------------------
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = url.startsWith('https') ? https.get : http.get;
    get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`Download failed: HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  const osName = getOS();
  const arch = getArch();
  const binName = osName === 'win' ? 'node.exe' : 'node';
  const targetBin = path.join(TARGET_DIR, binName);

  // Skip download if the correct version is already present
  if (fs.existsSync(targetBin)) {
    try {
      const currentVersion = execSync(`"${targetBin}" --version`, { encoding: 'utf8' }).trim();
      if (currentVersion === `v${NODE_VERSION}`) {
        console.log(`[prepare-node] Node.js v${NODE_VERSION} (${osName}-${arch}) already present — skipping download.`);
        return;
      }
      console.log(`[prepare-node] Found ${currentVersion}, need v${NODE_VERSION} — re-downloading.`);
    } catch {
      console.log('[prepare-node] Existing binary failed version check — re-downloading.');
    }
    fs.unlinkSync(targetBin);
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  // Download
  const ext = osName === 'win' ? 'zip' : 'tar.gz';
  const archive = `node-v${NODE_VERSION}-${osName}-${arch}.${ext}`;
  const url = `https://nodejs.org/dist/v${NODE_VERSION}/${archive}`;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prepare-node-'));
  const archivePath = path.join(tmpDir, archive);

  console.log(`[prepare-node] Downloading Node.js v${NODE_VERSION} for ${osName}-${arch}...`);
  console.log(`[prepare-node]   ${url}`);

  await download(url, archivePath);

  // Extract just the node binary
  console.log('[prepare-node] Extracting node binary...');
  const prefix = `node-v${NODE_VERSION}-${osName}-${arch}`;

  if (osName === 'win') {
    // Use tar (available on Windows 10+) to extract from zip
    execSync(`tar -xf "${archivePath}" -C "${tmpDir}" "${prefix}/node.exe"`, { stdio: 'inherit' });
    fs.copyFileSync(path.join(tmpDir, prefix, 'node.exe'), targetBin);
  } else {
    execSync(`tar -xzf "${archivePath}" -C "${tmpDir}" "${prefix}/bin/node"`, { stdio: 'inherit' });
    fs.copyFileSync(path.join(tmpDir, prefix, 'bin', 'node'), targetBin);
    fs.chmodSync(targetBin, 0o755);
  }

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });

  // Verify
  try {
    const installedVersion = execSync(`"${targetBin}" --version`, { encoding: 'utf8' }).trim();
    if (installedVersion !== `v${NODE_VERSION}`) {
      throw new Error(`Expected v${NODE_VERSION}, got ${installedVersion}`);
    }
    console.log(`[prepare-node] Node.js ${installedVersion} installed at ${targetBin}`);
  } catch (e) {
    console.error(`ERROR: Verification failed — ${e.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
