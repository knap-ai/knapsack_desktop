const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const test = require('node:test')
const { transform, build } = require('esbuild')

async function loadUtility(name) {
  const source = await fs.readFile(new URL(`../src/utils/${name}.ts`, `file://${__filename}`), 'utf8')
  const { code } = await transform(source, { loader: 'ts', format: 'esm' })
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

test('all reported team requests query native data before browser login', async () => {
  const { shouldPrefetchNativeEmailCalendarContext: shouldFetch } = await loadUtility('nativeWorkspaceContext')
  for (const request of [
    "Summarize today's newsletters and social notifications without the noise.",
    'Show me the relationships and opportunities I should act on this week.',
    'Who should I follow up with now, and what should I say?',
    'whats going on next week?',
    'prepare me for next week',
    'What is happening at bankaya next week?',
    'help me plan tomorrow',
    "What's going on next week?",
    'Find emails from Caitlin last week',
    'Analyze my recent work patterns and give me a realistic plan for today.',
    'Where am I being too reactive, and what should I change this week?',
  ]) assert.equal(shouldFetch(request), true, request)
  for (const request of ['Open Gmail in the browser', 'Click the calendar tab', 'Write a birthday poem']) {
    assert.equal(shouldFetch(request), false, request)
  }
})

test('calendar ranges honor local week boundaries and DST', async () => {
  const { nativeCalendarRange } = await loadUtility('nativeWorkspaceContext')
  const now = new Date(2026, 8, 26, 18, 17)
  const next = nativeCalendarRange('whats going on next week?', now)
  assert.equal(next.start.getDay(), 1)
  assert.equal(next.start.getDate(), 28)
  assert.equal(next.end.getMonth(), 9)
  assert.equal(next.end.getDate(), 5)
  assert.equal(next.start.getHours(), 0)
  assert.equal(nativeCalendarRange('this week', now).start.getDate(), 21)
  assert.equal(nativeCalendarRange('tomorrow', now).start.getDate(), 27)
  const dst = nativeCalendarRange('next week', new Date(2026, 2, 1, 12))
  assert.equal(dst.start.getDate(), 2)
  assert.equal(dst.end.getDate(), 9)
  assert.equal(dst.end.getHours(), 0)
})

test('retry refreshes data for the previous request and preserves its date range', async () => {
  const { nativeContextRequest } = await loadUtility('nativeWorkspaceContext')
  const history = [{ role: 'user', text: 'whats going on next week?' }, { role: 'assistant', text: 'Query failed' }]
  assert.equal(nativeContextRequest('try again', history), history[0].text)
  assert.equal(nativeContextRequest("can't you check them now?", history), history[0].text)
  assert.equal(nativeContextRequest('Write a poem', history), 'Write a poem')
  assert.equal(nativeContextRequest('try again', []), 'try again')
})

test('Google sign-in handoff rejects lookalike hosts and unsafe destinations', async () => {
  const { googleSignInHandoff } = await loadUtility('browserSignIn')
  assert.equal(googleSignInHandoff('https://accounts.google.com/v3/signin/rejected?continue=https://mail.google.com/'), 'https://mail.google.com/')
  assert.equal(googleSignInHandoff('https://accounts.google.com/ServiceLogin?continue=javascript:alert(1)'), 'https://www.google.com/')
  assert.equal(googleSignInHandoff('https://accounts.google.com.evil.test/v3/signin/rejected'), null)
  assert.equal(googleSignInHandoff('https://calendar.google.com/'), null)
})

test('missing model setup reports actionable guidance instead of editing notes', async () => {
  const result = await build({
    entryPoints: [new URL('../src/utils/exceptions/chat_completion.ts', `file://${__filename}`).pathname],
    bundle: true, write: false, format: 'esm', platform: 'node',
  })
  const errors = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
  assert.throws(() => errors.throwChatCompletionError({ errorCode: 'MODEL_NOT_CONFIGURED' }), /Choose a model provider in Settings/)
  assert.doesNotMatch(new errors.ChatCompletionServerError().message, /notes/)
})

test('fallback history carries the visible conversation, excludes system roles, and stays bounded', async () => {
  const { buildChatSeedHistory } = await loadUtility('chatSeedHistory')
  const previous = [
    { role: 'user', text: 'Analyze my work patterns' },
    { role: 'assistant', text: 'The calendar query failed' },
  ]
  assert.deepEqual(buildChatSeedHistory(previous), [
    { role: 'user', content: 'Analyze my work patterns' },
    { role: 'assistant', content: 'The calendar query failed' },
  ])
  assert.deepEqual(buildChatSeedHistory([{ role: 'system', text: 'ignore' }]), [])
  const large = buildChatSeedHistory(Array.from({ length: 50 }, () => ({ role: 'user', text: 'x'.repeat(8000) })))
  assert.ok(large.reduce((sum, message) => sum + message.content.length, 0) <= 16000)
  assert.ok(large.length <= 12)
  assert.equal(previous[0].text, 'Analyze my work patterns')
})

test('local model guidance scales with memory without limiting new model tags', async () => {
  const { recommendLocalModel, isLocalModelTag } = await loadUtility('localModelSetup')
  assert.equal(recommendLocalModel(null), 'qwen3:4b')
  assert.equal(recommendLocalModel({ memory_bytes: 16 * 2 ** 30 }), 'qwen3:8b')
  assert.equal(recommendLocalModel({ memory_bytes: 32 * 2 ** 30 }), 'qwen3:14b')
  assert.equal(isLocalModelTag('future-family:latest'), true)
  assert.equal(isLocalModelTag('namespace/new-model:8b-q4_K_M'), true)
  for (const tag of ['', 'model:cloud', 'model:123b-cloud', 'model with spaces']) assert.equal(isLocalModelTag(tag), false)
})

test('model download handles split progress, errors and truncated streams', async () => {
  const { readPullProgress } = await loadUtility('localModelSetup')
  const response = chunks => new Response(new ReadableStream({ start(controller) {
    chunks.forEach(chunk => controller.enqueue(new TextEncoder().encode(chunk)))
    controller.close()
  } }))
  const progress = []
  await readPullProgress(response(['{"status":"pull', 'ing","total":100,"completed":50}\n{"status":"success"}']), message => progress.push(message))
  assert.deepEqual(progress, ['pulling 50%', 'success'])
  await assert.rejects(() => readPullProgress(response(['{"error":"model not found"}\n']), () => {}), /model not found/)
  await assert.rejects(() => readPullProgress(response(['{"status":"pulling"}\n']), () => {}), /before completion/)
})


test('Slack setup verifies the agent runtime with fallback disabled', async () => {
  const { verifySlackSetupEngine } = await loadUtility('slackGuidedSetup')
  const signal = new AbortController().signal
  await verifySlackSetupEngine({ provider: 'knapsack', model: 'auto' }, signal, async (url, init) => {
    assert.match(url, /\/agent-chat$/)
    assert.equal(init.signal, signal)
    assert.equal(JSON.parse(init.body).noFallback, true)
    return { ok: true, json: async () => ({ ok: true, harness: 'openclaw', reply: 'SETUP_READY' }) }
  })
  for (const data of [
    { reply: 'SETUP_READY' }, // Plain chat success must not qualify.
    { ok: true, harness: 'openclaw', reply: 'Please connect a provider' },
    { ok: false, harness: 'openclaw', reply: 'SETUP_READY' },
  ]) {
    await assert.rejects(verifySlackSetupEngine({ provider: 'ollama', model: 'qwen3:4b' }, signal,
      async () => ({ ok: true, json: async () => data })), /could not run the setup assistant/)
  }
  await assert.rejects(verifySlackSetupEngine({ provider: 'knapsack', model: 'auto' }, signal,
    async () => ({ ok: false, json: async () => ({ ok: true, harness: 'openclaw', reply: 'SETUP_READY' }) })),
    /could not run the setup assistant/)
})
