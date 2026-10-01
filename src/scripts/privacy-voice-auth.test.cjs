const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const { transform } = require('esbuild')
async function load(name) {
  const source = await fs.readFile(`${__dirname}/../src/utils/${name}.ts`, 'utf8')
  const { code } = await transform(source, { loader: 'ts', format: 'esm' })
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}
test('temporary sync errors preserve Google connections; explicit revocation reconnects', async () => {
  const { googleReconnectRequired: check } = await load('googleSyncAuth')
  for (const message of ['400 - Too many open files', '401 Unauthorized', '400 Bad Request', '524 timeout', 'Failed to fetch', '400 - failed to refresh API access token']) assert.equal(check(new Error(message)), false, message)
  assert.equal(check(new Error('400 - Invalid refresh token. Please reconnect')), true)
  assert.equal(check(new Error('invalid_grant')), true)
})
test('Groq-only voice works without OpenAI; network and HTTP failure fall through', async () => {
  const { speechCandidates, transcribeWithFallback: run } = await load('speechTranscription')
  const groq = speechCandidates({ openai_key: ' ', groq_key: 'groq-test' })
  assert.deepEqual(groq.map(c => c.provider), ['groq'])
  const original = global.fetch
  try {
    global.fetch = async (url, init) => {
      assert.equal(url, 'https://api.groq.com/openai/v1/audio/transcriptions')
      assert.equal(init.body.get('model'), 'whisper-large-v3-turbo')
      return new Response(JSON.stringify({ text: 'hello' }))
    }
    assert.equal((await run(new Blob(['audio']), 'webm', groq, new AbortController().signal, () => false)).text, 'hello')
    for (const first of [() => { throw new TypeError('Load failed') }, () => new Response('', { status: 401 }), () => new Response('', { status: 429 })]) {
      let calls = 0
      global.fetch = async () => ++calls === 1 ? first() : new Response(JSON.stringify({ text: 'fallback' }))
      const result = await run(new Blob(['audio']), 'webm', speechCandidates({ openai_key: 'openai-test', groq_key: 'groq-test' }), new AbortController().signal, () => false)
      assert.equal(result.auth.provider, 'groq')
      assert.equal(calls, 2)
    }
  } finally { global.fetch = original }
})
test('timeout falls back but cancellation and Privacy Mode never upload to another provider', async () => {
  const { speechCandidates, transcribeWithFallback: run } = await load('speechTranscription')
  const candidates = speechCandidates({ openai_key: 'openai-test', groq_key: 'groq-test' })
  const original = global.fetch
  try {
    let calls = 0
    global.fetch = async (_, init) => {
      if (++calls === 2) return new Response(JSON.stringify({ text: 'recovered' }))
      return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted'))))
    }
    assert.equal((await run(new Blob(['audio']), 'webm', candidates, new AbortController().signal, () => false, 10)).auth.provider, 'groq')
    global.fetch = async () => { throw new Error('must not upload') }
    await assert.rejects(run(new Blob(), 'webm', candidates, new AbortController().signal, () => true), /Privacy Mode/)
    const cancelled = new AbortController(); cancelled.abort()
    await assert.rejects(run(new Blob(), 'webm', candidates, cancelled.signal, () => false), /cancelled/)
    calls = 0
    global.fetch = async () => { calls++; throw new Error('network') }
    await assert.rejects(run(new Blob(), 'webm', candidates, new AbortController().signal, () => calls > 0), /Privacy Mode/)
    assert.equal(calls, 1)
  } finally { global.fetch = original }
})
test('voice policy rejects OpenAI before upload and permits only authorized Groq', async () => {
  const { speechCandidates, transcribeWithFallback: run } = await load('speechTranscription')
  const original = global.fetch; const uploads = []
  try {
    global.fetch = async url => { uploads.push(url); return new Response(JSON.stringify({ text: 'private speech' })) }
    const authorize = async auth => { if (auth.provider !== 'groq') throw new Error('not eligible') }
    const result = await run(new Blob(['audio']), 'webm', speechCandidates({ openai_key: 'test-openai', groq_key: 'test-groq' }), new AbortController().signal, () => false, 100, authorize)
    assert.equal(result.auth.provider, 'groq')
    assert.deepEqual(uploads, ['https://api.groq.com/openai/v1/audio/transcriptions'])
  } finally { global.fetch = original }
})

test('every voice provider is permitted by the packaged app connection policies', async () => {
  const { speechCandidates } = await load('speechTranscription')
  const config = JSON.parse(await fs.readFile(`${__dirname}/../src-tauri/tauri.conf.json`, 'utf8'))
  const connect = config.tauri.security.csp.split(';').find(d => d.trim().startsWith('connect-src ')).trim().split(/\s+/).slice(1)
  for (const candidate of speechCandidates({ openai_key: 'test', groq_key: 'test' })) {
    const origin = new URL(candidate.endpoint).origin
    assert.ok(connect.includes(origin), `${origin} must be allowed by packaged CSP`)
    assert.ok(config.tauri.allowlist.http.scope.includes(`${origin}/**`), `${origin} must be allowed by native HTTP scope`)
  }
})
