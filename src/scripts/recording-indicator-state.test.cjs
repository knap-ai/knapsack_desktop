const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
let ts
try { ts = require('typescript') } catch { ts = require('../src-tauri/resources/clawdbot/node_modules/typescript') }

function mountIndicator(initialStatus) {
  let status = initialStatus
  const values = [], effects = [], intervals = new Map(), calls = [], listeners = new Map()
  let cursor = 0, effectCursor = 0, intervalId = 0
  const react = {
    useState(initial) {
      const index = cursor++
      if (!(index in values)) values[index] = initial
      return [values[index], value => { values[index] = typeof value === 'function' ? value(values[index]) : value }]
    },
    useCallback(fn) { return fn },
    useEffect(fn, deps) {
      const index = effectCursor++, prev = effects[index]
      if (!prev || deps.some((value, i) => value !== prev.deps[i])) {
        prev?.cleanup?.()
        effects[index] = { deps, cleanup: fn() }
      }
    },
  }
  const source = fs.readFileSync(path.join(__dirname, '../src/components/molecules/RecordingIndicator/index.tsx'), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === 'react') return react
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) }
      if (name === '@tauri-apps/api/tauri') return { invoke: async command => { calls.push(command) } }
      if (name === '@tauri-apps/api/event') return { listen: async (event, fn) => { listeners.set(event, fn); return () => listeners.delete(event) } }
      if (name === '@tauri-apps/api/window') return { appWindow: { startDragging() {} } }
      if (name === 'src/api/recording') return { isRecordingStatus: async () => status }
      throw new Error(name)
    },
    setInterval(fn) { intervals.set(++intervalId, fn); return intervalId },
    clearInterval(id) { intervals.delete(id) },
  })
  const render = () => { cursor = effectCursor = 0; return exports.default() }
  return { calls, intervals, render, listeners, setStatus(next) { status = next } }
}
const flush = () => new Promise(resolve => setImmediate(resolve))
function findButton(node) {
  if (!node || typeof node !== 'object') return undefined
  if (node.type === 'button') return node
  return [node.props?.children].flat(Infinity).map(findButton).find(Boolean)
}

test('an idle backend dismisses a phantom indicator and never starts its timer', async () => {
  const app = mountIndicator({ success: true, isRecording: false })
  app.render(); await flush(); app.render()
  assert.deepEqual(app.calls, ['hide_recording_indicator'])
  assert.equal(app.intervals.size, 1, 'only the status poll runs while idle')
})

test('capture starts the timer; stopping or failed startup hides it and stops ticking', async () => {
  for (const next of [{ isRecording: false }, { isRecording: true, isStarting: true }, { isRecording: false, isStopping: true }]) {
    const app = mountIndicator({ success: true, isRecording: true, threadId: 42 })
    app.render(); await flush(); app.render()
    assert.equal(app.intervals.size, 2)
    assert.deepEqual(app.calls, [])
    app.setStatus({ success: true, ...next })
    await [...app.intervals.values()][0](); app.render()
    assert.deepEqual(app.calls, ['hide_recording_indicator'])
    assert.equal(app.intervals.size, 1)
  }
})

test('Stop invokes the native active-meeting route without a mounted meeting listener', async () => {
  const app = mountIndicator({ success: true, isRecording: true, threadId: 42 })
  app.render(); await flush()
  const button = findButton(app.render())
  await button.props.onClick({ stopPropagation() {} })
  assert.deepEqual(app.calls, ['emit_stop_events'])
})

test('a status transport failure does not claim an active recording stopped', async () => {
  const app = mountIndicator({ success: true, isRecording: true, threadId: 42 })
  app.render(); await flush(); app.render()
  app.setStatus(false)
  await [...app.intervals.values()][0](); app.render()
  assert.deepEqual(app.calls, [])
  assert.equal(app.intervals.size, 2)
})

test('HTTP capture uses the managed native recording state', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src-tauri/src/server/actix.rs'), 'utf8')
  assert.match(source, /app_handle\.state::<RecordingState>\(\)\.inner\(\)\.clone\(\)/)
  assert.doesNotMatch(source, /let recording_state = RecordingState::default\(\)/)
})


test('an idle response issued before capture starts cannot hide the new recording', async () => {
  let resolveIdle
  const oldResponse = new Promise(resolve => { resolveIdle = resolve })
  const app = mountIndicator(oldResponse)
  app.render()
  app.setStatus({ success: true, isRecording: true, threadId: 42 })
  app.listeners.get('recording-indicator-show')()
  resolveIdle({ success: true, isRecording: false })
  await flush()
  await [...app.intervals.values()][0](); app.render()
  assert.deepEqual(app.calls, [])
  assert.equal(app.intervals.size, 2)
})

test('native recording navigation recovers a missing or stale renderer item by thread identity', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/hooks/feed/useFeed.tsx'), 'utf8')
  const body = source.slice(source.indexOf('  const handleClickRecording ='), source.indexOf('  const getRecordingFeedItemTitle ='))
  for (const cached of [false, true]) {
    const active = { id: 9, timestamp: new Date(), threads: [{ id: 42 }] }
    let selected, tab, inventory = { today: cached ? [active] : [] }, reads = 0
    const compiled = ts.transpileModule(`${body}\nexports.open = handleClickRecording`, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
    const exports = {}
    vm.runInNewContext(compiled, {
      exports,
      feedContent: inventory,
      recordingFeedItem: { id: 8, threads: [{ id: 41 }] },
      getFeedItems: async () => { reads++; return [active] },
      KNDateUtils: { timelineKeyFromTimestamp: () => 'today' },
      setFeedContent: updater => { inventory = updater(inventory) },
      setSelectedFeedItem: item => { selected = item },
      setSubTab: value => { tab = value },
      SubTabChoices: { Workspace: 'workspace' },
    })
    await exports.open(42)
    assert.equal(selected, active)
    assert.equal(tab, 'workspace')
    assert.equal(reads, cached ? 0 : 1)
    assert.equal(inventory.today.length, 1)
    await assert.rejects(exports.open(999), /active recording could not be opened/)
  }
  const app = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8')
  assert.match(app, /await feedRef.current.handleClickRecording\(event.payload\?\.threadId\)/)
})
