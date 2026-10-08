const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/components/organisms/GBrainView/FollowThroughPanel.tsx'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
function render(status = 'proposed', sentId) {
  const item = { id: 'fixture', runId: 'fixture-run', status, sentId, proposal: { owner: 'alex@example.com', action: 'Send proposal', quote: 'I will send the proposal.', draft: '' } }
  const exports = {}; let hooks = 0
  const jsx = (type, props) => typeof type === 'function' ? type(props) : { type, props }
  vm.runInNewContext(compiled, { exports, require(name) {
    if (name === 'react') return { useState: initial => [hooks++ === 0 ? [item] : initial, () => {}], useRef: initial => ({ current: initial }), useEffect: () => {}, useCallback: fn => fn }
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' }
    if (name === 'src/api/followThrough') return {}
    if (name === 'src/pages/onboarding/followUpReadiness') return {}
    if (name === 'src/utils/constants') return { KN_SERVER_HOST: 'http://unusable.invalid' }
    throw Error(name)
  } })
  const tree = exports.default({ run: { id: 'fixture-run', loopId: 'onboarding-follow-ups', context: 'Source: https://outlook.office.com/mail/id/fixture' }, brainRoot: '' })
  const nodes = []
  function visit(node) { if (node == null || typeof node === 'boolean') return; if (Array.isArray(node)) return node.forEach(visit); if (typeof node === 'object') { nodes.push(node); visit(node.props?.children) } }
  visit(tree)
  function text(node) { if (Array.isArray(node)) return node.map(text).join(' '); if (node && typeof node === 'object') return text(node.props?.children); return typeof node === 'string' ? node : '' }
  return { text: text(tree), nodes }
}
test('Outlook unlinked review offers reminders and explicitly excludes automatic reply checks', () => {
  const ui = render()
  assert.match(ui.text, /Outlook replies are not monitored automatically/)
  assert.match(ui.text, /Confirm & remind me/)
  assert.match(ui.text, /Until then, this is a reminder only/)
  const action = ui.nodes.find(node => node.type === 'button' && node.props.children === 'Confirm & remind me')
  assert.equal(action.props.disabled, true, 'ownership/latest-source review and date are required')
  assert.doesNotMatch(ui.text, /Confirm & track Gmail replies/)
})
test('unlinked active follow-up is labeled reminder scheduled or due', () => {
  assert.match(render('tracking').text, /Reminder scheduled/)
  assert.match(render('attention').text, /Reminder due/)
  assert.match(render('tracking').text, /Link sent Gmail message/)
})
test('existing linked Gmail follow-up keeps explicit Gmail reply wording', () => {
  const ui = render('proposed', 'verified-gmail-sent')
  assert.match(ui.text, /Confirm & track Gmail replies/)
  assert.doesNotMatch(ui.text, /Confirm & remind me/)
})
