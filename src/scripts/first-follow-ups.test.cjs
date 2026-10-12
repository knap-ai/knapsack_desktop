const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/pages/onboarding/FirstFollowUps.tsx'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
const flush = () => new Promise(resolve => setImmediate(resolve))
function mount({ local = true, ready = true, pending } = {}) {
  const values = ['Alex: I will send the plan. Later: plan is not yet sent.', 'Alex', 'Meeting notes', [], null, false, '', false]
  let index = 0, creates = 0, definitions = 0, calls = []
  const exports = {}, effects = []
  vm.runInNewContext(compiled, { exports, AbortController, TextEncoder, Uint8Array, crypto: { subtle: { digest: async () => new Uint8Array(32).buffer } }, require(name) {
    if (name === 'react') return { useState: initial => { const i = index++; return [values[i] ?? initial, value => { values[i] = typeof value === 'function' ? value(values[i]) : value }] }, useRef: initial => ({ current: initial }), useEffect: fn => effects.push(fn) }
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'fragment' }
    if (name === 'src/api/loops') return { listLoopRuns: async () => [], listLoopDefinitions: async () => [], saveLoopDefinition: async () => { definitions++ }, startLoopRun: async (...args) => { creates++; calls.push(args); if (pending) await pending; return { id: 'fixture-run' } } }
    if (name.endsWith('followUpReadiness')) return { requireFollowUpAiReady: async () => { if (!local) throw Error('Selected AI unavailable. No source has been sent.'); if (!ready) throw Error('No cloud fallback'); } }
    if (name === 'src/utils/localModelSetup') return { localAiReady: async () => ready }
    if (name === 'src/utils/privacyMode') return { initializePrivacyMode: async () => ({ inference: local ? 'local-only' : 'normal' }) }
    if (name.endsWith('mailFollowUps')) return {}
    if (name.endsWith('.scss')) return {}
    if (name.includes('MacIMessageSetup')) return { default: () => null }
    if (name.includes('FollowThroughPanel')) return { default: () => null }
    throw Error(name)
  } })
  const tree = exports.default({ onFinish: async () => {}, onConfigure: () => {} })
  function find(node) { if (!node || typeof node !== 'object') return null; if (node.type === 'button' && node.props.children === 'Use these notes') return node; for (const child of [node.props?.children].flat(Infinity)) { const match = find(child); if (match) return match } return null }
  return { click: () => find(tree).props.onClick(), creates: () => creates, definitions: () => definitions, values, calls, effects }
}
test('unavailable selected cloud AI fails closed before saving source', async () => { const app = mount({ local: false }); app.click(); await flush(); assert.equal(app.creates(), 0); assert.equal(app.definitions(), 0); assert.match(app.values[6], /No source has been sent/) })
test('missing local model fails closed without cloud fallback', async () => { const app = mount({ ready: false }); app.click(); await flush(); assert.equal(app.creates(), 0); assert.match(app.values[6], /No cloud fallback/) })
test('repeated clicks create one review run without extraction or approvals', async () => { let release; const app = mount({ pending: new Promise(r => { release = r }) }); app.click(); app.click(); await flush(); assert.equal(app.creates(), 1); assert.match(app.calls[0][2].context, /Later: plan is not yet sent/); release(); await flush(); assert.equal(app.values[0], '') })
test('mounting saved onboarding does not replay a create action', async () => { const app = mount(); for (const effect of app.effects) effect(); await flush(); assert.equal(app.creates(), 0) })
