const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
let ts
try { ts = require('../node_modules/typescript') } catch { ts = require('../src-tauri/resources/clawdbot/node_modules/typescript') }
const exports_ = {}
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/utils/scheduledRuns.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: exports_ })
const { scheduledTaskOwner, formatScheduledTaskCadence, formatScheduledTaskDelivery } = exports_
test('desktop session ownership wins over shared gateway main agent', () => {
  assert.equal(scheduledTaskOwner({ agent_id: 'main', session_key: 'agent:main:webchat:dm:ui-agent-polly' }), 'polly')
  assert.equal(scheduledTaskOwner({ agent_id: 'main', session_key: 'ui-agent-atlas' }), 'atlas')
  assert.equal(scheduledTaskOwner({ agent_id: 'agent-coach' }), 'coach')
  assert.equal(scheduledTaskOwner({ agent_id: 'custom-agent' }), 'custom-agent')
})
test('legacy and generic gateway jobs stay unassigned rather than leaking into a teammate', () => {
  for (const task of [{}, { agent_id: 'main' }, { session_key: 'agent:main:slack:direct:someone' }]) assert.equal(scheduledTaskOwner(task), null)
})
test('delivery and cadence preserve meaningful schedule details', () => {
  assert.equal(formatScheduledTaskCadence({kind:'every', everyMs:30000}), 'Every 30 seconds')
  assert.match(formatScheduledTaskCadence({kind:'cron',expr:'0 8 * * *',tz:'America/Los_Angeles'}), /America\/Los_Angeles/)
  assert.equal(formatScheduledTaskDelivery({ mode:'none' }), 'No message delivery')
})
