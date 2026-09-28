import { request } from 'node:http';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HEALTH_URL = 'http://127.0.0.1:8897/api/clawd/service/status';
const BASE_URL = 'http://127.0.0.1:8897/api/clawd/knapsack/v1';

export function desktopAppForModule(moduleUrl) {
  const filename = fileURLToPath(moduleUrl);
  const marker = '.app/Contents/';
  const index = filename.lastIndexOf(marker);
  return index < 0 ? null : filename.slice(0, index + 4);
}

function probeDesktop() {
  return new Promise(resolve => {
    const req = request(HEALTH_URL, { method: 'GET', timeout: 1000 }, res => {
      res.resume();
      // A 401 also proves the backend is listening. Keep auth errors in the
      // original model request; never put inference credentials in this probe.
      resolve(true);
    });
    req.once('error', () => resolve(false));
    req.once('timeout', () => req.destroy());
    req.end();
  });
}

function launchDesktop(app) {
  return new Promise((resolve, reject) => {
    execFile('/usr/bin/open', ['-g', app], { timeout: 5000 }, error => error ? reject(error) : resolve());
  });
}

export function createDesktopReadiness({
  platform = process.platform,
  moduleUrl = import.meta.url,
  probe = probeDesktop,
  launch = launchDesktop,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  now = Date.now,
  timeoutMs = 30000,
  allowLaunch = process.env.OPENCLAW_QA_DIRECT_GATEWAY !== '1' && process.env.KNAPSACK_QA_DIRECT_GATEWAY !== '1',
} = {}) {
  let starting;
  return async function ensureDesktop(model, signal) {
    if (model.provider !== 'knapsack-local' || String(model.baseUrl).replace(/\/$/, '') !== BASE_URL) return;
    signal?.throwIfAborted();
    if (await probe()) return;
    signal?.throwIfAborted();
    if (!starting) {
      starting = (async () => {
        const app = desktopAppForModule(moduleUrl);
        if (!allowLaunch || platform !== 'darwin' || !app) {
          throw new Error('Knapsack desktop inference is unavailable. Open the Knapsack desktop app and try again.');
        }
        await launch(app);
        const deadline = now() + timeoutMs;
        while (now() < deadline) {
          if (await probe()) return;
          await sleep(250);
        }
        throw new Error('Knapsack opened but its inference service did not become ready. Check the desktop app and try again.');
      })().finally(() => { starting = undefined; });
    }
    // One shared launch; cancelling one caller must not cancel other requests.
    const startup = starting;
    await new Promise((resolve, reject) => {
      const abort = () => reject(signal.reason);
      if (signal?.aborted) abort();
      signal?.addEventListener('abort', abort, { once: true });
      startup.then(resolve, reject).finally(() => signal?.removeEventListener('abort', abort));
    });
  };
}

export const ensureKnapsackDesktopReady = createDesktopReadiness();
