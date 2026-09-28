const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const test = require('node:test')
const ts = require('../node_modules/typescript')

// Execute the production scheduler with React's dependency semantics and fake
// timers. Every status update queues a render with new handler identities.
const app = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8')
const start = app.indexOf('  const clockHandlersRef =')
const end = app.indexOf('  const periodicSyncRef', start)
const source = ts.transpileModule(`function render() { ${app.slice(start, end)} return setClocks }`, {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText

test('renders do not restart the minute clock; ticks use current handlers and clean up', async () => {
  let ref, memo, dependencies, effect, cleanup
  let pendingRenders = 0, updates = 0, latestHandler = 0
  const timers = new Map()
  let timerId = 0
  const context = {
    userEmail: 'qa@example.test', LOCAL_QA_SAFE: false, window: {}, console, Date,
    useRef(value) { return ref ??= { current: value } },
    useCallback(fn, deps) {
      if (!dependencies || deps.some((v, i) => v !== dependencies[i])) { memo = fn; dependencies = deps }
      return memo
    },
    setInterval(fn, ms) { assert.equal(ms, 60000); timers.set(++timerId, fn); return timerId },
    clearInterval(id) { timers.delete(id) },
  }
  vm.createContext(context)
  vm.runInContext(source, context)
  const render = () => {
    const generation = ++latestHandler
    for (const name of ['checkMeetingPrep', 'checkMorningBriefing', 'checkProactiveCheckin', 'handleNotificationsScheduleService', 'handleAutomationsFeedScheduleService']) context[name] = async () => {}
    context.updateMeetingStatuses = () => { assert.equal(generation, latestHandler); updates++; pendingRenders++ }
    const next = context.render()
    if (effect !== next) { cleanup?.(); effect = next; cleanup = next() }
  }
  render()
  await Promise.resolve()
  for (let i = 0; i < 100; i++) { pendingRenders = 0; render(); await Promise.resolve() }
  assert.equal(updates, 1, 'only the initial tick should run before a minute elapses')
  assert.equal(pendingRenders, 0, 'rendering must not enqueue another status update')
  assert.equal(timers.size, 1)
  timers.values().next().value()
  await Promise.resolve()
  assert.equal(updates, 2)
  context.userEmail = ''
  render()
  assert.equal(timers.size, 0, 'sign-out must stop the clock')
})
