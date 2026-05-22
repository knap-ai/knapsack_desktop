#!/usr/bin/env node
/**
 * prepare-node.js — Downloads the Node.js binary for bundling into the Knapsack app.
 *
 * Cross-platform replacement for prepare-node.sh.
 * Runs automatically via the npm `prebuild` hook (before `tsc && vite build`),
 * so every `tauri build` gets the right binary without manual intervention.
 *
 * Override the version:  NODE_VERSION=22.19.0 node scripts/prepare-node.js
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

const NODE_VERSION = process.env.NODE_VERSION || '22.19.0';
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
  const universalBuild = osName === 'darwin' && process.env.UNIVERSAL_BUILD === 'true';
  const binName = osName === 'win' ? 'node.exe' : 'node';
  const targetBin = path.join(TARGET_DIR, binName);

  // Skip download if the correct version is already present
  if (fs.existsSync(targetBin)) {
    try {
      const currentVersion = execSync(`"${targetBin}" --version`, { encoding: 'utf8' }).trim();
      if (currentVersion === `v${NODE_VERSION}`) {
        if (universalBuild) {
          // Verify it's already a universal binary
          const lipoInfo = execSync(`lipo -info "${targetBin}"`, { encoding: 'utf8' });
          if (lipoInfo.includes('x86_64') && lipoInfo.includes('arm64')) {
            console.log(`[prepare-node] Node.js v${NODE_VERSION} universal binary already present — skipping download.`);
            return;
          }
          console.log('[prepare-node] Found single-arch binary, need universal — re-downloading.');
        } else {
          const npmPkgDest = path.join(TARGET_DIR, 'node_modules', 'npm', 'bin', 'npm-cli.js');
          if (!fs.existsSync(npmPkgDest)) {
            console.log(`[prepare-node] Node.js v${NODE_VERSION} already present but npm package missing — re-downloading to extract npm.`);
          } else {
            console.log(`[prepare-node] Node.js v${NODE_VERSION} (${osName}-${arch}) already present — skipping download.`);
            return;
          }
        }
      } else {
        console.log(`[prepare-node] Found ${currentVersion}, need v${NODE_VERSION} — re-downloading.`);
      }
    } catch {
      console.log('[prepare-node] Existing binary failed version check — re-downloading.');
    }
    fs.unlinkSync(targetBin);
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prepare-node-'));

  try {
    if (universalBuild) {
      // macOS universal build: download both architectures and combine with lipo
      console.log('[prepare-node] Building universal Node.js binary for macOS (arm64 + x64)...');

      for (const dlArch of ['arm64', 'x64']) {
        const archive = `node-v${NODE_VERSION}-darwin-${dlArch}.tar.gz`;
        const url = `https://nodejs.org/dist/v${NODE_VERSION}/${archive}`;
        const archivePath = path.join(tmpDir, archive);
        console.log(`[prepare-node]   Downloading ${url}`);
        await download(url, archivePath);
        const prefix = `node-v${NODE_VERSION}-darwin-${dlArch}`;
        execSync(`tar -xzf "${archivePath}" -C "${tmpDir}" "${prefix}/bin/node"`, { stdio: 'inherit' });
        fs.renameSync(path.join(tmpDir, prefix, 'bin', 'node'), path.join(tmpDir, `node-${dlArch}`));
      }

      console.log('[prepare-node] Creating universal binary with lipo...');
      execSync(`lipo -create "${path.join(tmpDir, 'node-arm64')}" "${path.join(tmpDir, 'node-x64')}" -output "${targetBin}"`, { stdio: 'inherit' });
      fs.chmodSync(targetBin, 0o755);

      // Extract npm from the arm64 archive (npm is platform-independent JS)
      const arm64Prefix = `node-v${NODE_VERSION}-darwin-arm64`;
      const arm64Archive = path.join(tmpDir, `${arm64Prefix}.tar.gz`);
      execSync(`tar -xzf "${arm64Archive}" -C "${tmpDir}" "${arm64Prefix}/lib/node_modules/npm"`, { stdio: 'inherit' });
      const npmPkgSrc = path.join(tmpDir, arm64Prefix, 'lib', 'node_modules', 'npm');
      const npmPkgDest = path.join(TARGET_DIR, 'node_modules', 'npm');
      if (fs.existsSync(npmPkgSrc)) {
        fs.cpSync(npmPkgSrc, npmPkgDest, { recursive: true });
        console.log(`[prepare-node] ✓ npm package installed at ${npmPkgDest}`);
      } else {
        console.warn('[prepare-node] Warning: lib/node_modules/npm not found in Node.js archive — plugin runtime deps may require system npm');
      }

    } else {
      // Single-architecture download
      const ext = osName === 'win' ? 'zip' : 'tar.gz';
      const archive = `node-v${NODE_VERSION}-${osName}-${arch}.${ext}`;
      const url = `https://nodejs.org/dist/v${NODE_VERSION}/${archive}`;
      const archivePath = path.join(tmpDir, archive);

      console.log(`[prepare-node] Downloading Node.js v${NODE_VERSION} for ${osName}-${arch}...`);
      console.log(`[prepare-node]   ${url}`);

      await download(url, archivePath);

      console.log('[prepare-node] Extracting node binary...');
      const prefix = `node-v${NODE_VERSION}-${osName}-${arch}`;

      if (osName === 'win') {
        execSync(`tar -xf "${archivePath}" -C "${tmpDir}" "${prefix}/node.exe" "${prefix}/node_modules/npm"`, { stdio: 'inherit' });
        fs.copyFileSync(path.join(tmpDir, prefix, 'node.exe'), targetBin);
        const npmPkgSrc = path.join(tmpDir, prefix, 'node_modules', 'npm');
        const npmPkgDest = path.join(TARGET_DIR, 'node_modules', 'npm');
        if (fs.existsSync(npmPkgSrc)) {
          fs.cpSync(npmPkgSrc, npmPkgDest, { recursive: true });
          console.log(`[prepare-node] ✓ npm package installed at ${npmPkgDest}`);
        } else {
          console.warn('[prepare-node] Warning: node_modules/npm not found in Node.js archive — plugin runtime deps may fail on Windows');
        }
      } else {
        execSync(`tar -xzf "${archivePath}" -C "${tmpDir}" "${prefix}/bin/node"`, { stdio: 'inherit' });
        fs.copyFileSync(path.join(tmpDir, prefix, 'bin', 'node'), targetBin);
        fs.chmodSync(targetBin, 0o755);
        try {
          execSync(`tar -xzf "${archivePath}" -C "${tmpDir}" "${prefix}/lib/node_modules/npm"`, { stdio: 'inherit' });
          const npmPkgSrc = path.join(tmpDir, prefix, 'lib', 'node_modules', 'npm');
          const npmPkgDest = path.join(TARGET_DIR, 'node_modules', 'npm');
          if (fs.existsSync(npmPkgSrc)) {
            fs.cpSync(npmPkgSrc, npmPkgDest, { recursive: true });
            console.log(`[prepare-node] ✓ npm package installed at ${npmPkgDest}`);
          } else {
            console.warn('[prepare-node] Warning: lib/node_modules/npm not found in Node.js archive — plugin runtime deps may require system npm');
          }
        } catch {
          console.warn('[prepare-node] Warning: could not extract npm from Node.js archive — plugin runtime deps may require system npm');
        }
      }
    }
  } finally {
    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // Verify
  try {
    const installedVersion = execSync(`"${targetBin}" --version`, { encoding: 'utf8' }).trim();
    if (installedVersion !== `v${NODE_VERSION}`) {
      throw new Error(`Expected v${NODE_VERSION}, got ${installedVersion}`);
    }
    if (universalBuild) {
      const lipoInfo = execSync(`lipo -info "${targetBin}"`, { encoding: 'utf8' }).trim();
      console.log(`[prepare-node] ✓ Node.js ${installedVersion} universal binary installed at ${targetBin}`);
      console.log(`[prepare-node]   ${lipoInfo}`);
    } else {
      console.log(`[prepare-node] ✓ Node.js ${installedVersion} installed at ${targetBin}`);
    }
  } catch (e) {
    console.error(`ERROR: Verification failed — ${e.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
