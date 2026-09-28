const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { AsyncLocalStorage } = require('node:async_hooks');

async function fixture(t) {
  const source = fs.readFileSync(path.join(__dirname, '../src-tauri/resources/clawdbot/dist/selection-hR-AeOeU.js'), 'utf8');
  // Exercise the shipped controller, without starting a gateway or provider.
  const snippet = source.slice(source.indexOf('const TRANSCRIPT_ONLY_OPENCLAW_ASSISTANT_MODELS'), source.indexOf('function installPromptSubmissionLockRelease'));
  const context = { fs, fs$1: fs.promises, statSync: fs.statSync, path, AsyncLocalStorage, Buffer, isSessionWriteLockTimeoutError: () => false };
  vm.createContext(context);
  vm.runInContext(snippet + '\nglobalThis.controller = createEmbeddedAttemptSessionLockController;', context);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'knapsack-session-fence-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'session.jsonl');
  fs.writeFileSync(file, '{"type":"session","id":"one"}\n', { mode: 0o644 });
  const controller = await context.controller({ lockOptions: { sessionFile: file }, acquireSessionWriteLock: async () => ({ release: async () => {} }) });
  await controller.releaseForPrompt();
  return { file, controller };
}

test('permission hardening during inference does not impersonate session takeover', async t => {
  const { file, controller } = await fixture(t);
  fs.chmodSync(file, 0o600);
  await controller.reacquireAfterPrompt();
  await controller.releaseForPrompt();
  fs.chmodSync(file, 0o600);
  await controller.reacquireAfterPrompt();
  assert.equal(controller.hasSessionTakeover(), false);
});

test('metadata tolerance also works after an owned transcript update', async t => {
  const { file, controller } = await fixture(t);
  fs.appendFileSync(file, '{"type":"message","id":"owned"}\n');
  controller.refreshAfterOwnedSessionWrite();
  fs.chmodSync(file, 0o600);
  await controller.reacquireAfterPrompt();
  assert.equal(controller.hasSessionTakeover(), false);
});

test('a concurrent transcript edit still rejects the stale attempt', async t => {
  const { file, controller } = await fixture(t);
  const before = fs.statSync(file);
  fs.writeFileSync(file, '{"type":"session","id":"two"}\n');
  fs.utimesSync(file, before.atime, before.mtime);
  await assert.rejects(controller.reacquireAfterPrompt(), { name: 'EmbeddedAttemptSessionTakeoverError' });
  assert.equal(controller.hasSessionTakeover(), true);
});

test('a replacement transcript still rejects the stale attempt', async t => {
  const { file, controller } = await fixture(t);
  fs.renameSync(file, file + '.old');
  fs.copyFileSync(file + '.old', file);
  await assert.rejects(controller.reacquireAfterPrompt(), { name: 'EmbeddedAttemptSessionTakeoverError' });
});
