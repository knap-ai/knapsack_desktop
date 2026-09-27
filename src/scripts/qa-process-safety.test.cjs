const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { isProtectedInstalledKnapsackProcess, assertNoInstalledKnapsackListeners, isQaDescendant } = require('./qa-process-safety.cjs');

test('protects renamed gateways and installed resource subprocesses', () => {
  for (const command of ['openclaw', 'openclaw-gateway', 'openclaw gateway run', '',
    '/Applications/Knapsack.app/Contents/Resources/resources/node/bin/node /Applications/Knapsack.app/Contents/Resources/resources/clawdbot/dist/entry.js',
    'C:\\Program Files\\Knapsack\\resources\\node.exe']) {
    assert.equal(isProtectedInstalledKnapsackProcess(command), true, command);
  }
});

test('refuses unrelated gateway before cleanup but permits the QA child tree', () => {
  const records = {
    20: { parent: 1, command: 'openclaw' },
    30: { parent: 10, command: 'node qa-dev-run.cjs' },
    40: { parent: 30, command: 'openclaw' },
    50: { parent: 1, command: '' },
  };
  const lookup = pid => records[pid] || { parent: 0, command: '' };
  assert.throws(() => assertNoInstalledKnapsackListeners([20, 40], lookup, 10), /PID 20/);
  assert.doesNotThrow(() => assertNoInstalledKnapsackListeners([40], lookup, 10));
  assert.throws(() => assertNoInstalledKnapsackListeners([50], lookup, 10), /PID 50/);
  assert.equal(isQaDescendant(20, lookup, 10), false);
  assert.equal(isQaDescendant(40, lookup, 10), true);
});

test('ancestry traversal terminates on malformed process trees', () => {
  assert.equal(isQaDescendant(22, () => ({ parent: 22, command: 'openclaw' }), 10), false);
});

test('real renamed gateway child is owned only by its actual QA parent', async () => {
  const child = spawn(process.execPath, ['-e', 'process.title="openclaw"; console.log("ready"); setInterval(()=>{},1000)'], { stdio: ['ignore', 'pipe', 'ignore'] });
  try {
    await once(child.stdout, 'data');
    assert.doesNotThrow(() => assertNoInstalledKnapsackListeners([child.pid]));
    assert.throws(() => assertNoInstalledKnapsackListeners([child.pid], undefined, 99999999), /cannot interrupt/);
    assert.equal(child.exitCode, null);
  } finally {
    child.kill();
    await once(child, 'exit');
  }
});
