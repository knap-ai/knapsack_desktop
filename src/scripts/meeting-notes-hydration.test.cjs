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
