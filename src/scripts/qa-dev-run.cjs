#!/usr/bin/env node
/**
 * Stable dev launcher for desktop QA.
 *
 * `tauri dev` watches the whole src-tauri tree, including the large mutable
 * clawdbot resource bundle. Gateway dependency staging can touch that tree and
 * trigger rebuild loops. This launcher uses the same dev frontend port but runs
 * the compiled debug binary directly, so the QA loop has a steady app process.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const projectDir = path.resolve(__dirname, '..');
const tauriDir = path.join(projectDir, 'src-tauri');
const binary = path.join(tauriDir, 'target', 'debug', process.platform === 'win32' ? 'knapsack.exe' : 'knapsack');
const viteBin = path.join(projectDir, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
const launchAgentPlist = path.join(
  process.env.HOME || '',
  'Library',
  'LaunchAgents',
  'ai.knap.knapsack.clawdbot.plist',
);

function qaEnv(extra = {}) {
  const env = { ...process.env, ...extra };
  for (const key of Object.keys(env)) {
    if (key === 'CODEX_SANDBOX_NETWORK_DISABLED' || key.startsWith('CODEX_')) {
      delete env[key];
    }
  }
  return env;
}

function runChecked(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || projectDir,
    stdio: 'inherit',
    env: options.env || qaEnv(),
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function waitForUrl(url, timeoutMs = 30_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
        } else {
          setTimeout(attempt, 500);
        }
      });
      req.setTimeout(1000, () => req.destroy());
    };
    attempt();
  });
}

function waitForFile(file, timeoutMs = 30_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (fs.existsSync(file)) {
        resolve();
      } else if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${file}`));
      } else {
        setTimeout(attempt, 500);
      }
    };
    attempt();
  });
}

function waitForFreshLaunchAgentPlist(minMtimeMs, timeoutMs = 45_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      try {
        if (fs.existsSync(launchAgentPlist) && fs.statSync(launchAgentPlist).mtimeMs >= minMtimeMs) {
          const plist = readLaunchAgentPlist();
          const entry = plist.ProgramArguments?.[1] || '';
          if (entry.startsWith(path.join(projectDir, 'src-tauri', 'resources', 'clawdbot'))) {
            resolve(plist);
            return;
          }
        }
      } catch {
        // Keep polling while the app is writing the plist.
      }

      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for a fresh dev Clawdbot LaunchAgent plist`));
      } else {
        setTimeout(attempt, 500);
      }
    };
    attempt();
  });
}

function readLaunchAgentPlist() {
  const result = spawnSync('plutil', ['-convert', 'json', '-o', '-', launchAgentPlist], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    throw new Error(`Could not read Clawdbot LaunchAgent plist${stderr ? `: ${stderr}` : ''}`);
  }
  return JSON.parse(result.stdout);
}

function bootoutLaunchAgent() {
  if (process.platform !== 'darwin') return;
  const uid = process.getuid?.();
  if (typeof uid !== 'number') return;
  const domain = `gui/${uid}`;
  const service = `${domain}/ai.knap.knapsack.clawdbot`;
  spawnSync('launchctl', ['bootout', service], { stdio: 'ignore' });
  spawnSync('launchctl', ['bootout', domain, launchAgentPlist], { stdio: 'ignore' });
}

function killStaleGateways() {
  if (process.platform !== 'darwin') return;
  spawnSync('pkill', ['-TERM', '-f', 'openclaw-gateway'], { stdio: 'ignore' });

  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    const holders = gatewayPortHolderPids();
    if (holders.length === 0) return;
    sleep(150);
  }

  const holders = gatewayPortHolderPids();
  if (holders.length > 0) {
    console.warn(`[qa-dev-run] Force-killing stale gateway port holder(s): ${holders.join(', ')}`);
    spawnSync('kill', ['-KILL', ...holders], { stdio: 'ignore' });
  }
}

function killStaleOpenClawChrome() {
  if (process.platform !== 'darwin') return;
  const profileNeedles = [
    path.join('.openclaw', 'browser-profiles', 'openclaw'),
    path.join('clawdbot', 'browser', 'openclaw', 'user-data'),
  ];
  for (const profileNeedle of profileNeedles) {
    spawnSync('pkill', ['-TERM', '-f', profileNeedle], { stdio: 'ignore' });
  }

  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    const holders = openClawChromePids(profileNeedles);
    if (holders.length === 0) return;
    sleep(150);
  }

  const holders = openClawChromePids(profileNeedles);
  if (holders.length > 0) {
    console.warn(`[qa-dev-run] Force-killing stale OpenClaw Chrome profile process(es): ${holders.join(', ')}`);
    spawnSync('kill', ['-KILL', ...holders], { stdio: 'ignore' });
  }
}

function gatewayPortHolderPids() {
  const result = spawnSync('lsof', ['-tiTCP:18789', '-sTCP:LISTEN'], {
    encoding: 'utf8',
  });
  if (result.status !== 0 || !result.stdout) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((pid) => /^\d+$/.test(pid) && pid !== String(process.pid));
}

function openClawChromePids(profileNeedles) {
  const pids = new Set();
  for (const profileNeedle of profileNeedles) {
    const result = spawnSync('pgrep', ['-f', profileNeedle], {
      encoding: 'utf8',
    });
    if (result.status !== 0 || !result.stdout) continue;
    for (const line of result.stdout.split(/\r?\n/)) {
      const pid = line.trim();
      if (/^\d+$/.test(pid) && pid !== String(process.pid)) pids.add(pid);
    }
  }
  return [...pids];
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Busy wait is acceptable here: this is a short process-cleanup gate before
    // launching the dev app, and it avoids adding another async dependency.
  }
}

function startDirectGatewayFromPlist() {
  if (process.platform !== 'darwin') return null;
  const plist = readLaunchAgentPlist();
  const args = plist.ProgramArguments;
  if (!Array.isArray(args) || args.length < 2) {
    throw new Error('Clawdbot LaunchAgent plist did not include ProgramArguments');
  }

  const entry = args[1] || '';
  if (!entry.startsWith(path.join(projectDir, 'src-tauri', 'resources', 'clawdbot'))) {
    console.warn(`[qa-dev-run] Skipping direct gateway: plist is not targeting this checkout (${entry})`);
    return null;
  }

  console.log('[qa-dev-run] Starting direct dev gateway from LaunchAgent plist');
  bootoutLaunchAgent();
  killStaleGateways();
  return spawn(args[0], args.slice(1), {
    cwd: tauriDir,
    stdio: 'inherit',
    env: qaEnv({
      ...(plist.EnvironmentVariables || {}),
      OPENCLAW_QA_DIRECT_GATEWAY: '1',
    }),
  });
}

function latestMtimeMs(dir, shouldInclude) {
  let latest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'target') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      latest = Math.max(latest, latestMtimeMs(fullPath, shouldInclude));
      continue;
    }
    if (entry.isFile() && shouldInclude(fullPath)) {
      latest = Math.max(latest, fs.statSync(fullPath).mtimeMs);
    }
  }
  return latest;
}

function binaryNeedsRebuild() {
  if (!fs.existsSync(binary)) return true;
  const binaryMtime = fs.statSync(binary).mtimeMs;
  const rustSourceMtime = Math.max(
    latestMtimeMs(path.join(tauriDir, 'src'), (file) => file.endsWith('.rs')),
    fs.statSync(path.join(tauriDir, 'Cargo.toml')).mtimeMs,
    fs.statSync(path.join(tauriDir, 'build.rs')).mtimeMs,
  );
  return rustSourceMtime > binaryMtime;
}

async function main() {
  runChecked(process.execPath, [path.join(projectDir, 'scripts', 'ensure-clawdbot-deps.cjs')]);

  if (binaryNeedsRebuild()) {
    const tauriConfig = JSON.stringify({
      tauri: {
        bundle: {
          resources: [
            'resources/signin_success.html',
            'resources/signin_error.html',
          ],
        },
      },
    });
    runChecked('cargo', ['build', '--no-default-features'], {
      cwd: tauriDir,
      env: qaEnv({ TAURI_CONFIG: tauriConfig }),
    });
  }

  const vite = spawn(viteBin, ['--host', '127.0.0.1', '--port', '1420', '--strictPort'], {
    cwd: projectDir,
    stdio: 'inherit',
    env: qaEnv(),
  });
  let gateway = null;
  let shuttingDown = false;

  const cleanup = () => {
    shuttingDown = true;
    if (!vite.killed) vite.kill('SIGTERM');
    if (gateway && !gateway.killed) gateway.kill('SIGTERM');
  };
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });
  process.on('exit', cleanup);

  const startManagedGateway = () => {
    gateway = startDirectGatewayFromPlist();
    if (!gateway) return;
    gateway.on('exit', (code, signal) => {
      if (shuttingDown) return;
      console.warn(
        `[qa-dev-run] Direct gateway exited (${signal || code}); restarting in 3s`,
      );
      setTimeout(() => {
        if (!shuttingDown) startManagedGateway();
      }, 3000);
    });
  };

  await waitForUrl('http://127.0.0.1:1420/');
  bootoutLaunchAgent();
  killStaleGateways();
  killStaleOpenClawChrome();

  const app = spawn(binary, [], {
    cwd: tauriDir,
    stdio: 'inherit',
    env: qaEnv({ KNAPSACK_QA_DIRECT_GATEWAY: '1' }),
  });
  const appStartedAt = Date.now();
  await waitForUrl('http://127.0.0.1:8897/api/clawd/service/status', 45_000);
  await waitForFreshLaunchAgentPlist(appStartedAt, 60_000);
  startManagedGateway();
  app.on('exit', (code, signal) => {
    cleanup();
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code || 0);
    }
  });
}

main().catch((err) => {
  console.error(`[qa-dev-run] ${err.message}`);
  process.exit(1);
});
