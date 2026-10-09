const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const ts = require('typescript')

const source = fs.readFileSync(path.join(__dirname, '../src/components/organisms/MeetingNotesMode/index.tsx'), 'utf8').replace(/\r\n/g, '\n')
const start = source.indexOf('  const fetchNotes = async')
const end = source.indexOf('\n\n  const checkTranscriptSaved', start)
assert.ok(start >= 0 && end > start, 'load the actual notes hydration function')
const code = ts.transpileModule(source.slice(start, end) + '\n exports.fetchNotes = fetchNotes;', {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

function fixture(data, current = 44, responseOk = true) {
  const state = { notes: 'stale previous notes', synthesis: 'stale synthesis notes', editor: 'stale editor', loading: true, writes: 0, gets: 0 }
  const exports = {}
  vm.runInNewContext(code, {
    exports, thread: { id: 44 }, KN_API_NOTES: 'fixture-notes', activeNotesThreadIdRef: { current },
    fetch: async (url, opts) => {
      assert.equal(url, 'fixture-notes/44'); assert.equal(opts.method, 'GET'); state.gets++
      return { ok: responseOk, json: async () => ({ data }) }
    },
    editor: {
      storage: { markdown: { parser: { parse: text => text } } },
      commands: { setContent: (text, emitUpdate = true) => { state.editor = text; if (emitUpdate) state.writes++ } },
    },
    normalizeMeetingNotesMarkdown: text => text,
    setNotesMarkdown: text => { state.notes = text }, setMarkdown: text => { state.synthesis = text },
    setIsInitialLoading: value => { state.loading = value },
    logError: () => { throw Error('unexpected fixture error') }, DOMException, Error,
  })
  return { state, read: exports.fetchNotes }
}

test('saved notes GET displays content without scheduling autosave', async () => {
  const f = fixture({ exists: true, notes: 'Fictional saved meeting notes' })
  assert.equal(await f.read(), 'Fictional saved meeting notes')
  assert.equal(f.state.notes, 'Fictional saved meeting notes')
  assert.equal(f.state.editor, 'Fictional saved meeting notes')
  assert.equal(f.state.writes, 0); assert.equal(f.state.loading, false)
})

test('HTTP 200 with exists=false clears both notes states without creating an empty note', async () => {
  const f = fixture({ exists: false, notes: null })
  assert.equal(await f.read(), null)
  assert.equal(f.state.notes, ''); assert.equal(f.state.synthesis, ''); assert.equal(f.state.editor, '')
  assert.equal(f.state.writes, 0); assert.equal(f.state.loading, false)
})

test('an absent data envelope is not interpreted as saved notes', async () => {
  const f = fixture(undefined)
  assert.equal(await f.read(), null); assert.equal(f.state.notes, '')
  assert.equal(f.state.writes, 0); assert.equal(f.state.gets, 1)
})

test('a late response for the previous meeting cannot change the current editor', async () => {
  const f = fixture({ exists: true, notes: 'Fictional previous meeting' }, 45)
  assert.equal(await f.read(), null); assert.equal(f.state.editor, 'stale editor')
  assert.equal(f.state.notes, 'stale previous notes'); assert.equal(f.state.writes, 0)
})

test('an aborted read cannot clear a newly selected meeting', async () => {
  const f = fixture({ exists: false })
  assert.equal(await f.read({ aborted: true }), null)
  assert.equal(f.state.editor, 'stale editor'); assert.equal(f.state.notes, 'stale previous notes')
  assert.equal(f.state.writes, 0)
})


test('failed synthesis rendering cannot enqueue an empty autosave after persistence', () => {
  const hook = fs.readFileSync(path.join(__dirname, '../src/hooks/useMeetingMode.tsx'), 'utf8').replace(/\r\n/g, '\n')
  const start = hook.indexOf('  const insertLLMResponse = ')
  const end = hook.indexOf('\n\n  const saveNotes = ', start)
  assert.ok(start >= 0 && end > start)
  const code = ts.transpileModule(hook.slice(start, end) + '\n exports.render=insertLLMResponse;', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const out = {}, autosaves = []
  vm.runInNewContext(code, { exports: out, setContent: () => {}, setMarkdown: () => {} })
  const editor = {
    storage: { markdown: { parser: { parse: text => text } } },
    commands: { clearContent: (emitUpdate = true) => { if (emitUpdate) autosaves.push('') } },
    chain: () => ({ focus: () => { throw Error('fictional editor insertion failure') } }),
  }
  assert.throws(() => out.render(editor, 'Already persisted fictional notes'), /fictional editor insertion failure/)
  assert.deepEqual(autosaves, [], 'editor-only failure must not schedule empty notes over the durable save')
  let rendered
  const chain = { focus: () => chain, insertContent: text => { rendered = text; return chain }, run: () => { autosaves.push(rendered) } }
  editor.chain = () => chain
  editor.getHTML = () => rendered
  editor.storage.markdown.getMarkdown = () => rendered
  out.render(editor, 'Already persisted fictional notes')
  assert.deepEqual(autosaves, ['Already persisted fictional notes'], 'successful insertion still updates the final notes state')
})

function incidentHook() {
  const states = []; let cursor = 0, queued
  const effects = { writes: [], deleted: 0, finished: 0 }
  const modules = {
    react: { useState: initial => { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], v => { states[i] = v }] }, useCallback: cb => cb },
    'src/api/connections': {},
    'src/api/transcripts': { getTranscript: async (_id, opts) => { assert.equal(opts.localOnly, true); return { content: 'Fictional transcript' } }, deleteTranscript: async () => { effects.deleted++ } },
    'src/prompts': { NOTES_SYNTHESIS_PROMPT: '{MEETING_INFO_PROMPT}' },
    'src/utils/constants': { KN_API_NOTES: 'fixture-notes' },
    'src/utils/errorHandling': { logError: () => {} }, 'src/utils/KNAnalytics': { default: { trackEvent: () => {} } },
    'src/utils/KNLocalStorage': { KNLocalStorage: { getItem: async () => null } },
    'src/utils/settings': { isSharingEnabled: () => false, shouldSaveTranscript: async () => false },
    'src/utils/meetingNotesMarkdown': { normalizeMeetingNotesMarkdown: x => x }, './auth/useAuth': { PROFILE_KEY: 'fixture' },
  }
  const out = {}
  const source = fs.readFileSync(path.join(__dirname, '../src/hooks/useMeetingMode.tsx'), 'utf8').replace(/import\.meta\.env/g, '({})')
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    exports: out, require: id => { assert.ok(modules[id], id); return modules[id] }, Error,
    fetch: async (_url, options) => { effects.writes.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ success: true }) } },
  })
  return { effects, queue: () => queued, render: () => { cursor = 0; return out.useMeetingSynthesis(null, item => { queued = item }, () => { effects.finished++ }, { key: 'fixture', prompt: 'fixture' }) } }
}
function incidentCompletion(failure) {
  const app = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8').replace(/\r\n/g, '\n')
  const begin = app.indexOf('  const chatMessagesAskBot = useCallback('), end = app.indexOf('\n\n  useEffect(', begin)
  const out = {}
  vm.runInNewContext(ts.transpileModule(app.slice(begin, end) + '\nexports.run=chatMessagesAskBot;', { fileName: 'fixture.tsx', compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } }).outputText, {
    exports: out, useCallback: cb => cb, Error, diagnosticNow: () => 0, emitDiagnostic: () => {},
    getHasOnboarded: async () => { if (failure === 'onboarding') throw Error('synthetic onboarding error'); return true },
    KNAnalytics: { trackEvent: () => {} }, userEmail: 'fixture', userName: 'fixture', handleErrorContact: () => {}, logError: () => {},
    dataFetcher: { getChatCompletionStream: async () => { if (failure === 'HTTP500') throw Error('synthetic HTTP500'); return { read: async () => { const e = Error('synthetic failed stream'); if (failure === 'abort') e.name = 'AbortError'; throw e } } } },
    readCompletionStream: async reader => reader.read(), KN_CHAT_MESSAGE_MAX_STREAM_READS: 100,
  })
  return out.run
}
for (const failure of ['HTTP500', 'abort', 'failed-stream', 'onboarding', 'empty-response']) {
  test(`${failure} settles generation without overwriting notes/deleting transcript, then retry succeeds`, async () => {
    const f = incidentHook(), pending = f.render().synthesizeContent(44, 'Existing notes', undefined)
    pending.catch(() => {})
    for (let i = 0; i < 16 && !f.queue(); i++) await Promise.resolve()
    assert.ok(f.queue())
    if (failure === 'empty-response') await f.queue().messageFinishCallback('')
    else await incidentCompletion(failure)(f.queue())
    await assert.rejects(pending)
    const failed = f.render()
    assert.equal(failed.isLLMLoading, false); assert.equal(failed.synthesisPhase, 'idle'); assert.equal(failed.streamingMarkdown, '')
    assert.ok(failed.error); assert.equal(failed.errorThreadId, 44)
    assert.deepEqual(f.effects.writes, []); assert.equal(f.effects.deleted, 0); assert.equal(f.effects.finished, 0)
    const retry = failed.synthesizeContent(44, 'Existing notes', undefined)
    for (let i = 0; i < 16; i++) await Promise.resolve()
    await f.queue().messageFinishCallback('Fictional retry notes'); await retry
    assert.equal(f.render().error, null); assert.equal(f.effects.writes.length, 1)
    assert.equal(f.effects.writes[0].notes, 'Fictional retry notes'); assert.equal(f.effects.finished, 1)
  })
}

function incidentTranscript(fetchImpl) {
  const s = fs.readFileSync(path.join(__dirname, '../src/api/transcripts.tsx'), 'utf8')
  const begin = s.indexOf('export async function getTranscript('), end = s.indexOf('\nexport const deleteTranscript', begin)
  const out = {}, timers = new Map(); let sharingReads = 0
  vm.runInNewContext(ts.transpileModule(s.slice(begin, end).replace(/import\.meta\.env/g, '({})'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    exports: out, fetch: fetchImpl, AbortController, Error, KN_API_GET_TRANSCRIPT: 'fixture',
    setTimeout: (callback, ms) => { timers.set(1, { callback, ms }); return 1 }, clearTimeout: id => timers.delete(id),
    KNLocalStorage: { getItem: () => { sharingReads++; throw Error('optional sharing must not run') } }, PROFILE_KEY: 'fixture', logError: () => {},
  })
  return { read: out.getTranscript, timers, sharingReads: () => sharingReads }
}
test('local synthesis transcript read never waits for optional sharing', async () => {
  const f = incidentTranscript(async () => ({ ok: true, json: async () => ({ success: true, data: { content: 'Fictional local transcript' } }) }))
  assert.equal((await f.read(44, { localOnly: true })).content, 'Fictional local transcript'); assert.equal(f.timers.size, 0); assert.equal(f.sharingReads(), 0)
})
test('transcript HTTP500 fails instead of treating success-shaped payload as usable', async () => {
  const f = incidentTranscript(async () => ({ ok: false, json: async () => ({ success: true, data: { content: 'Must not generate' } }) }))
  await assert.rejects(f.read(44, { localOnly: true }), /Could not read/); assert.equal(f.timers.size, 0)
})
test('stalled transcript read aborts at bounded deadline and can be retried', async () => {
  let calls = 0
  const f = incidentTranscript(async (_url, { signal }) => {
    if (++calls === 1) return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Fetch is aborted', 'AbortError'))))
    return { ok: true, json: async () => ({ success: true, data: { content: 'Retry transcript' } }) }
  })
  const stalled = f.read(44, { localOnly: true }); assert.equal(f.timers.get(1).ms, 15000)
  f.timers.get(1).callback(); await assert.rejects(stalled, /timed out/); assert.equal(f.timers.size, 0)
  assert.equal((await f.read(44, { localOnly: true })).content, 'Retry transcript')
})

function inferenceClock(latency) {
  let now = 0, next = 0, requests = 0, backendFinished = 0
  const timers = new Map(), out = {}, retry = {}
  const context = {
    Error, AbortController,
    setTimeout: (callback, delay) => { timers.set(++next, { callback, at: now + delay }); return next },
    clearTimeout: id => timers.delete(id),
    fetch: (_url, { signal }) => {
      requests++
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => { const e = Error('Fetch is aborted'); e.name = 'AbortError'; reject(e) })
        context.setTimeout(() => { backendFinished++; resolve({ ok: true, body: { getReader: () => ({ synthetic: true }) } }) }, latency)
      })
    },
  }
  const retrySource = fs.readFileSync(path.join(__dirname, '../src/utils/retryUtils.ts'), 'utf8')
  vm.runInNewContext(ts.transpileModule(retrySource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    ...context, exports: retry,
    require: id => id === './errorHandling' ? { logError: () => {} } : { getResponseErrorCodeAndMessage: async () => ({ message: 'fixture' }) },
  })
  const fetcher = fs.readFileSync(path.join(__dirname, '../src/utils/data_fetch.tsx'), 'utf8')
  const start = fetcher.indexOf('  public async getChatCompletionStream('), end = fetcher.indexOf('\n  public async ', start + 10)
  const method = 'class Fixture {\n' + fetcher.slice(start, end) + '\n}\nexports.Fixture=Fixture;'
  vm.runInNewContext(ts.transpileModule(method, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    exports: out, Error, retryFetch: retry.retryFetch, HttpError: retry.HttpError,
    KN_API_STREAM_LLM_COMPLETE: 'fixture-inference', logError: () => {}, throwChatCompletionError: () => { throw Error('synthetic completion failure') },
  })
  return {
    start: kind => new out.Fixture().getChatCompletionStream('fixture', 'fixture', 'fixture', '', [], [], undefined, undefined, kind),
    counts: () => ({ requests, backendFinished }),
    advance: async until => {
      for (let i = 0; i < 12; i++) await Promise.resolve()
      while (true) {
        const due = [...timers].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0]
        if (!due) break
        now = due[1].at; timers.delete(due[0]); due[1].callback()
        for (let i = 0; i < 12; i++) await Promise.resolve()
      }
      now = until
    },
  }
}
test('notes waits for delayed native fallback beyond60seconds without retrying generation POST', async () => {
  const f = inferenceClock(106000), request = f.start('notes'); request.catch(() => {})
  await f.advance(65000); assert.equal(f.counts().requests, 1)
  await f.advance(106000)
  assert.equal((await request).synthetic, true)
  assert.equal(f.counts().requests, 1); assert.equal(f.counts().backendFinished, 1)
})
test('notes deadline abort submits once and ignores late backend success after consumer failure', async () => {
  const f = inferenceClock(200000), request = f.start('notes'); request.catch(() => {})
  await f.advance(180000); await assert.rejects(request, /Fetch is aborted/)
  assert.equal(f.counts().requests, 1); assert.equal(f.counts().backendFinished, 0)
  await f.advance(200000)
  assert.equal(f.counts().requests, 1); assert.equal(f.counts().backendFinished, 1)
  await assert.rejects(request, /Fetch is aborted/)
})
test('other completion callers retain their existing60second retry policy', async () => {
  const f = inferenceClock(200000), request = f.start('completion'); request.catch(() => {})
  await f.advance(181000); await assert.rejects(request, /Fetch is aborted/)
  assert.equal(f.counts().requests, 3)
})
