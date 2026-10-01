const test = require('node:test')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { readFile } = require('node:fs/promises')
async function policy() {
  const source = await readFile(`${__dirname}/../src-tauri/resources/clawdbot/dist/knapsack-privacy-policy.js`, 'utf8')
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}
test('local policy rejects cloud routes, remote Ollama and cloud models', async () => {
  const { authorizeDesktopModel: allow } = await policy()
  const local = { enabled: true, mode: 'local-only' }
  const model = { provider: 'ollama', id: 'qwen3:8b', baseUrl: 'http://localhost:11434' }
  assert.equal(allow(model, '', local), model)
  for (const changed of [{ baseUrl: 'http://localhost.evil.test' }, { baseUrl: 'https://ollama.com' }, { id: 'qwen3:cloud' }, { provider: 'openai' }]) {
    assert.throws(() => allow({ ...model, ...changed }, '', local), /Privacy Mode/)
  }
})
test('ZDR routes bind Groq confirmation to actual credentials and force TrustedRouter floor', async () => {
  const { authorizeDesktopModel: allow } = await policy()
  const cloud = { enabled: true, mode: 'zero-retention', groq_zdr_fingerprint: createHash('sha256').update('test-key').digest('hex') }
  const groq = { provider: 'groq', id: 'openai/gpt-oss-120b', baseUrl: 'https://api.groq.com/openai/v1' }
  assert.equal(allow(groq, 'test-key', cloud), groq)
  for (const key of ['', 'other-key', undefined]) assert.throws(() => allow(groq, key, cloud), /Privacy Mode/)
  assert.throws(() => allow({ ...groq, id: 'groq/compound' }, 'test-key', cloud), /Privacy Mode/)
  const tr = { provider: 'trustedrouter', id: 'zdr', baseUrl: 'https://api.trustedrouter.com/v1' }
  assert.equal(allow(tr, 'key', cloud).id, 'trustedrouter/zdr')
  assert.throws(() => allow({ ...tr, id: 'trustedrouter/auto' }, 'key', cloud), /Privacy Mode/)
  assert.throws(() => allow({ ...tr, baseUrl: 'https://api.trustedrouter.com.evil.test' }, 'key', cloud), /Privacy Mode/)
  assert.throws(() => allow({ ...tr, provider: 'knapsack-local', baseUrl: 'http://127.0.0.1:8897' }, 'key', cloud), /Privacy Mode/)
})
test('every retry rechecks changed policy before invoking transport', async () => {
  const { withDesktopPrivacy } = await policy()
  let current = { enabled: false }; let uploads = 0
  const stream = withDesktopPrivacy(() => ++uploads, () => 'test-key', () => current)
  const model = { provider: 'openai', id: 'test', baseUrl: 'https://api.openai.com/v1' }
  assert.equal(stream(model, {}, {}), 1)
  current = { enabled: true, mode: 'local-only' }
  assert.throws(() => stream(model, {}, {}), /Privacy Mode/)
  assert.equal(uploads, 1)
})
test('transport checks actual URL, credentials and payload after model transforms', async () => {
  const { authorizeDesktopRequest: check } = await policy()
  const cloud = { enabled: true, mode: 'zero-retention', groq_zdr_fingerprint: createHash('sha256').update('test-key').digest('hex') }
  const model = { provider: 'groq', id: 'safe', baseUrl: 'https://api.groq.com' }
  const body = JSON.stringify({ model: 'openai/gpt-oss-120b', messages: [] })
  check(model, 'https://api.groq.com/openai/v1/chat/completions', { authorization: 'Bearer test-key' }, body, cloud)
  assert.throws(() => check(model, 'https://evil.test', { authorization: 'Bearer test-key' }, body, cloud), /Privacy Mode/)
  assert.throws(() => check(model, 'https://api.groq.com', { authorization: 'Bearer other-key' }, body, cloud), /Privacy Mode/)
  assert.throws(() => check(model, 'https://api.groq.com', { authorization: 'Bearer test-key' }, JSON.stringify({ model: 'groq/compound' }), cloud), /Privacy Mode/)
  assert.throws(() => check({ provider: 'trustedrouter' }, 'https://api.trustedrouter.com/v1/chat/completions', {}, JSON.stringify({ model: 'auto' }), cloud), /Privacy Mode/)
})

test('Knapsack ZDR allows only production cloud and the exact desktop proxy', async () => {
  const { authorizeDesktopModel: allow, authorizeDesktopRequest: check } = await policy()
  const cloud = { enabled: true, mode: 'zero-retention' }
  const model = { provider: 'knapsack-local', id: 'default', baseUrl: 'http://127.0.0.1:8897/api/clawd/knapsack/v1' }
  assert.equal(allow(model, '', cloud), model)
  check(model, `${model.baseUrl}/chat/completions`, {}, JSON.stringify({ model: 'auto' }), cloud)
  for (const baseUrl of ['http://127.0.0.1:8898/api/clawd/knapsack/v1', 'http://localhost:8897/api/clawd/knapsack/v1', 'http://127.0.0.1:8897/other', 'http://127.0.0.1:8897/api/clawd/knapsack/v1?target=evil']) {
    assert.throws(() => allow({ ...model, baseUrl }, '', cloud), /Privacy Mode/)
  }
  assert.throws(() => allow(model, '', { enabled: true, mode: 'local-only' }), /Privacy Mode/)
  const direct = { provider: 'knapsack', id: 'auto', baseUrl: 'https://api.knapsack.ai' }
  assert.equal(allow(direct, '', cloud), direct)
  for (const baseUrl of ['http://api.knapsack.ai', 'https://api.knapsack.ai.evil.test', 'https://api.knapsack.ai:8443']) {
    assert.throws(() => allow({ ...direct, baseUrl }, '', cloud), /Privacy Mode/)
  }
})
