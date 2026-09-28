const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/hooks/useFollowThrough.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const flush = () => new Promise(resolve => setImmediate(resolve))
function mount(check, enabled = true, saved = new Map()) {
  let tick, cleanup, calls = 0
  const notices = [], events = [], exports = {}
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === 'react') return { useRef: value => ({ current: value }), useEffect: fn => { cleanup = fn() } }
      if (name === 'src/api/followThrough') return { checkFollowThrough: () => { calls++; return check() } }
      throw Error(name)
    },
    localStorage: { getItem: k => saved.get(k), setItem: (k, v) => saved.set(k, v) },
    Event: class { constructor(type) { this.type = type } },
    window: { setInterval: fn => { tick = fn; return 1 }, clearInterval: () => { tick = undefined }, dispatchEvent: e => events.push(e.type) },
  })
  exports.useFollowThrough(enabled, count => notices.push(count))
  return { notices, events, saved, tick: () => tick?.(), cleanup: () => cleanup?.(), calls: () => calls }
}
const attention = { id: 'one', status: 'attention', dueAt: 100 }
test('one reminder per transition survives remounts and subsequent checks', async () => {
  const app = mount(async () => [attention]); await flush()
  await app.tick(); assert.deepEqual(app.notices, [1])
  app.cleanup()
  const remount = mount(async () => [attention], true, app.saved); await flush()
  assert.deepEqual(remount.notices, [])
  const reply = mount(async () => [{ ...attention, status: 'reply_received' }], true, app.saved); await flush()
  assert.deepEqual(reply.notices, [1])
})
test('missing credentials never produce a no-reply reminder', async () => {
  const app = mount(async () => [{ ...attention, checkError: 'Reconnect Gmail' }]); await flush()
  assert.deepEqual(app.notices, [])
})
test('network failure is retryable and does not emit a false result', async () => {
  let failing = true
  const app = mount(async () => { if (failing) throw Error('offline'); return [attention] }); await flush()
  assert.deepEqual(app.notices, []); assert.deepEqual(app.events, [])
  failing = false; await app.tick(); assert.deepEqual(app.notices, [1])
})
test('background checks cannot overlap or notify after disposal', async () => {
  let complete
  const app = mount(() => new Promise(resolve => { complete = resolve }))
  await app.tick(); assert.equal(app.calls(), 1)
  app.cleanup(); complete([attention]); await flush()
  assert.deepEqual(app.notices, []); assert.deepEqual(app.events, [])
})
test('safe QA mode does not run live checks', async () => {
  const app = mount(async () => [attention], false); await flush()
  assert.equal(app.calls(), 0)
})
