import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesktopReadiness, desktopAppForModule } from '../src-tauri/resources/clawdbot/dist/knapsack-desktop-readiness.js';
const model = { provider: 'knapsack-local', baseUrl: 'http://127.0.0.1:8897/api/clawd/knapsack/v1' };
const moduleUrl = 'file:///Applications/Knapsack.app/Contents/Resources/resources/clawdbot/dist/knapsack-desktop-readiness.js';

test('missing backend wakes the containing app and waits before model fetch', async () => {
  let listening = false; const events = [];
  const ensure = createDesktopReadiness({ platform: 'darwin', moduleUrl,
    probe: async () => { events.push('probe'); return listening; },
    launch: async app => { assert.equal(app, '/Applications/Knapsack.app'); events.push('launch'); },
    sleep: async () => { listening = true; },
  });
  await ensure(model); events.push('model-fetch');
  assert.deepEqual(events, ['probe', 'launch', 'probe', 'probe', 'model-fetch']);
  await ensure(model);
  assert.equal(events.filter(x => x === 'launch').length, 1);
});

test('concurrent requests share one launch', async () => {
  let launches = 0; let ready = false;
  const ensure = createDesktopReadiness({ platform: 'darwin', moduleUrl,
    probe: async () => ready, launch: async () => { launches++; }, sleep: async () => { ready = true; } });
  await Promise.all([ensure(model), ensure(model), ensure(model)]);
  assert.equal(launches, 1);
});

test('other providers and nonstandard endpoints never launch a desktop app', async () => {
  const ensure = createDesktopReadiness({ probe: () => { throw Error('unexpected probe'); } });
  await ensure({ ...model, provider: 'openai' });
  await ensure({ ...model, baseUrl: 'https://example.com/v1' });
  await ensure({ ...model, baseUrl: 'http://127.0.0.1:9999/v1' });
});

test('startup timeout is actionable and a later request can recover', async () => {
  let clock = 0; let ready = false; let launches = 0;
  const ensure = createDesktopReadiness({ platform: 'darwin', moduleUrl, timeoutMs: 10,
    now: () => clock, probe: async () => ready, launch: async () => { launches++; },
    sleep: async () => { clock += 10; } });
  await assert.rejects(ensure(model), /did not become ready/);
  ready = true; await ensure(model); assert.equal(launches, 1);
});

test('cancelled requests do not launch and unsupported environments explain recovery', async () => {
  const controller = new AbortController(); controller.abort();
  const ensure = createDesktopReadiness({ platform: 'linux', probe: async () => false });
  await assert.rejects(ensure(model, controller.signal), { name: 'AbortError' });
  await assert.rejects(ensure(model), /Open the Knapsack desktop app/);
});

test('launch failure is retryable and relocated app paths are preserved', async () => {
  assert.equal(desktopAppForModule('file:///Users/test/My%20Apps/Knapsack.app/Contents/Resources/x.js'), '/Users/test/My Apps/Knapsack.app');
  assert.equal(desktopAppForModule('file:///repo/dist/x.js'), null);
  let attempts = 0; let ready = false;
  const ensure = createDesktopReadiness({ platform: 'darwin', moduleUrl, probe: async () => ready,
    launch: async () => { if (++attempts === 1) throw Error('launch failed'); ready = true; } });
  await assert.rejects(ensure(model), /launch failed/);
  await ensure(model); assert.equal(attempts, 2);
});

test('QA never wakes the production app when its isolated backend is absent', async () => {
  const ensure = createDesktopReadiness({ platform: 'darwin', moduleUrl, allowLaunch: false,
    probe: async () => false, launch: async () => { assert.fail('must not launch'); } });
  await assert.rejects(ensure(model), /Open the Knapsack desktop app/);
});

test('one cancelled caller does not cancel shared startup', async () => {
  let ready = false; let releaseLaunch;
  const controller = new AbortController();
  const ensure = createDesktopReadiness({ platform: 'darwin', moduleUrl, probe: async () => ready,
    launch: () => new Promise(resolve => { releaseLaunch = () => { ready = true; resolve(); }; }) });
  const cancelled = ensure(model, controller.signal);
  const remaining = ensure(model);
  await new Promise(resolve => setImmediate(resolve));
  controller.abort();
  await assert.rejects(cancelled, { name: 'AbortError' });
  releaseLaunch();
  await remaining;
});
