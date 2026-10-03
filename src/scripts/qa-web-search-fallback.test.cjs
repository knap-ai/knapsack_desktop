const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src-tauri/resources/clawdbot/dist/runtime-JrxuINJZ.js'), 'utf8');
const runtime = source.slice(source.indexOf('function isStructuredAvailabilityError('), source.indexOf('//#endregion', source.indexOf('async function runWebSearch(')));
function fixture({ explicit = false, result = { error: 'missing_kimi_api_key' }, fallback = { provider: 'browser', result: { results: [] } } } = {}) {
  let calls = 0;
  const context = vm.createContext({
    resolveWebSearchRuntimeConfig: () => ({}), resolveSearchConfig: () => ({}),
    getActiveRuntimeWebToolsMetadata: () => ({}),
    resolveWebSearchCandidates: () => [{ id: 'kimi', createTool: () => ({ execute: async () => result }) }],
    hasExplicitWebSearchSelection: () => explicit,
    runDesktopBrowserWebSearchFallback: async () => { calls++; return fallback; },
  });
  const run = vm.runInContext(runtime + '\nrunWebSearch', context);
  return { run: () => run({ args: { query: 'weather' } }), calls: () => calls };
}
test('auto-selected provider missing credentials uses desktop fallback', async () => {
  const f = fixture(); assert.equal((await f.run()).provider, 'browser'); assert.equal(f.calls(), 1);
});
test('explicit provider choice does not silently use browser', async () => {
  const f = fixture({ explicit: true }); assert.equal((await f.run()).result.error, 'missing_kimi_api_key'); assert.equal(f.calls(), 0);
});
test('unavailable desktop fallback preserves original error', async () => {
  const f = fixture({ fallback: null }); await assert.rejects(f.run(), /missing_kimi_api_key/); assert.equal(f.calls(), 1);
});
test('successful provider and unrelated errors do not use fallback', async () => {
  for (const result of [{ results: [] }, { error: 'rate_limit' }]) {
    const f = fixture({ result }); assert.deepEqual((await f.run()).result, result); assert.equal(f.calls(), 0);
  }
});
