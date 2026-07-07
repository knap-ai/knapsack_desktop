#!/usr/bin/env node
/**
 * Measures the direct OpenClaw gateway live signal used as a guardrail for
 * Knapsack's 15-second startup goal.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');

const PROJECT_DIR = path.join(__dirname, '..');
const CLAWDBOT_DIR = path.join(PROJECT_DIR, 'src-tauri', 'resources', 'clawdbot');
const ENTRY = path.join(CLAWDBOT_DIR, 'dist', 'entry.js');
const TIMEOUT_MS = Number(process.env.KNAPSACK_GATEWAY_LIVE_TIMEOUT_MS || 15000);
const TOKEN = `knapsack-gateway-live-${process.pid}`;
const LIVE_MARKERS = [
  'http server listening (',
  'ready (',
  '[health-monitor] started',
];

if (!fs.existsSync(ENTRY)) {
  console.error(`[gateway-live] Missing ${ENTRY}`);
  process.exit(1);
}

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'knapsack-gateway-live-'));
let child;
let output = '';
let settled = false;
const startedAt = Date.now();

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (!address || typeof address === 'string') {
          reject(new Error('could not allocate a free loopback port'));
          return;
        }
        resolve(String(address.port));
      });
    });
  });
}

function cleanup() {
  if (child && !child.killed) child.kill('SIGTERM');
  try {
    fs.rmSync(stateDir, { recursive: true, force: true });
  } catch {
    // best effort
  }
}

function finish(ok, message) {
  if (settled) return;
  settled = true;
  cleanup();
  if (ok) {
    console.log(message);
    process.exit(0);
  }
  console.error(message);
  console.error('--- gateway output tail ---');
  console.error(output.split(/\r?\n/).slice(-120).join('\n'));
  process.exit(1);
}

process.on('SIGINT', () => finish(false, '[gateway-live] interrupted'));
process.on('SIGTERM', () => finish(false, '[gateway-live] terminated'));
process.on('exit', cleanup);

let timeout;

function onData(chunk) {
  output += chunk.toString();
  if (output.length > 200000) output = output.slice(-200000);
  if (LIVE_MARKERS.some((marker) => output.includes(marker))) {
    clearTimeout(timeout);
    const elapsed = Date.now() - startedAt;
    finish(
      elapsed <= TIMEOUT_MS,
      `[gateway-live] ${elapsed <= TIMEOUT_MS ? 'OK' : 'FAIL'}: gateway live in ${elapsed}ms (limit ${TIMEOUT_MS}ms)`,
    );
  }
}

async function main() {
  const port = process.env.KNAPSACK_GATEWAY_LIVE_PORT || await findFreePort();
  const env = {
    ...process.env,
    OPENCLAW_STATE_DIR: stateDir,
    OPENCLAW_HOME: stateDir,
    OPENCLAW_GATEWAY_TOKEN: TOKEN,
    OPENCLAW_GATEWAY_PORT: port,
    OPENCLAW_TEST_FAST: '1',
    OPENCLAW_NO_RESPAWN: '1',
    OPENCLAW_DISABLE_BONJOUR: '1',
    OPENCLAW_GATEWAY_STARTUP_WARMUP_TIMEOUT_MS:
      process.env.OPENCLAW_GATEWAY_STARTUP_WARMUP_TIMEOUT_MS || '2000',
    OPENCLAW_CHANNEL_STARTUP_HANDOFF_TIMEOUT_MS:
      process.env.OPENCLAW_CHANNEL_STARTUP_HANDOFF_TIMEOUT_MS || '3000',
    OPENCLAW_DEFER_STARTUP_SIDECARS:
      process.env.OPENCLAW_DEFER_STARTUP_SIDECARS || '1',
  };

  child = spawn(process.execPath, [
    ENTRY,
    'gateway',
    'run',
    '--allow-unconfigured',
    '--verbose',
    '--force',
    '--bind',
    'loopback',
    '--auth',
    'token',
    '--token',
    TOKEN,
    '--port',
    port,
  ], {
    cwd: CLAWDBOT_DIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  timeout = setTimeout(() => {
    finish(false, `[gateway-live] FAIL: gateway did not become live within ${TIMEOUT_MS}ms`);
  }, TIMEOUT_MS);

  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  child.on('error', (error) => {
    clearTimeout(timeout);
    finish(false, `[gateway-live] FAIL: ${error.message}`);
  });
  child.on('exit', (code, signal) => {
    if (!settled) {
      clearTimeout(timeout);
      finish(false, `[gateway-live] FAIL: gateway exited before live signal (code=${code}, signal=${signal})`);
    }
  });
}

main().catch((error) => finish(false, `[gateway-live] FAIL: ${error.message}`));
