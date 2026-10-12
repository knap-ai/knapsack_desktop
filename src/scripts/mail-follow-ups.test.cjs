const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/pages/onboarding/mailFollowUps.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
function fixture(handler) {
  const exports = {}, calls = []
  vm.runInNewContext(compiled, { exports, require: () => ({ KN_SERVER_HOST: 'http://unusable.invalid' }), fetch: async (url, options) => {
    const body = JSON.parse(options.body); calls.push({ url, body, signal: options.signal })
    return handler(body)
  } })
  return { api: exports, calls }
}
test('Outlook uses its native read-only endpoint and explicit connected account', async () => {
  const app = fixture(async body => ({ ok: true, json: async () => body.action === 'accounts' ? { accounts: ['alex@example.com'] } : { source: 'full latest conversation', owner: 'alex@example.com', skipped: 0 } }))
  const result = await app.api.readFollowUpThreads('alex@example.com', new AbortController().signal, 'outlook')
  assert.equal(result.owner, 'alex@example.com')
  assert.equal(app.calls.length, 2)
  assert.equal(app.calls[1].body.action, 'scan')
  assert.equal(app.calls[1].body.account_email, 'alex@example.com')
  assert.match(app.calls[1].url, /outlook\/follow-up-source$/)
})
test('missing selected Outlook account never starts mailbox scan', async () => {
  const app = fixture(async () => ({ ok: true, json: async () => ({ accounts: ['other@example.com'] }) }))
  await assert.rejects(app.api.readFollowUpThreads('alex@example.com', undefined, 'outlook'), /no longer connected/)
  assert.equal(app.calls.length, 1)
})
test('Outlook refresh/API failure does not return source', async () => {
  const app = fixture(async body => ({ ok: body.action === 'accounts', json: async () => body.action === 'accounts' ? { accounts: ['alex@example.com'] } : { error: 'Outlook refresh failed' } }))
  await assert.rejects(app.api.readFollowUpThreads('alex@example.com', undefined, 'outlook'), /refresh failed/)
})
test('canceled Outlook response is discarded before returning source', async () => {
  const abort = new AbortController()
  const app = fixture(async body => ({ ok: true, json: async () => {
    if (body.action === 'accounts') return { accounts: ['alex@example.com'] }
    abort.abort(); return { source: 'late source', skipped: 0 }
  } }))
  await assert.rejects(app.api.readFollowUpThreads('alex@example.com', abort.signal, 'outlook'), /canceled/)
})
