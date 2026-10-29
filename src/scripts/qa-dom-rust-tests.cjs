// Protocol/controller tests under compiled QA identity; never launch a native app.
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const { testPlan } = require('./qa-gateway-rust-tests.cjs')
const required = [
 'synthetic_qa_dom_results_are_nonce_bound_allowlisted_and_single_use',
 'synthetic_qa_dom_expired_or_oversized_results_are_ignored',
 'synthetic_qa_dom_preflight_gate_requires_compiled_identity',
 'synthetic_qa_dom_script_contains_only_fixed_dispatch_and_serialized_values',
 'synthetic_qa_dom_wait_has_a_hard_timeout',
]
function completedAll(output){return required.every(name=>output.includes(`::${name} ... ok`))}
function run(){
 const plan = testPlan()
 plan.args[2] = 'synthetic_qa_dom'
 fs.mkdirSync(plan.options.env.HOME, { recursive: true, mode: 0o700 })
 const result = spawnSync(plan.command, plan.args, {...plan.options,encoding:'utf8',stdio:['ignore','pipe','inherit']})
 const output=result.stdout||'';process.stdout.write(output)
 if (result.error) console.error(result.error.message)
 if(result.status===0&&!completedAll(output))console.error('Compiled-QA probe tests did not all execute; refusing a skipped/zero-test pass.')
 process.exitCode = result.status===0&&completedAll(output)?0:(result.status||1)
}
if(require.main===module)run()
module.exports={completedAll,required}
