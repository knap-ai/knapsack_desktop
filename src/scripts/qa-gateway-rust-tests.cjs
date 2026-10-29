// Run only the gateway isolation unit tests; never start the desktop app.
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { qaEnv, qaCargoBuildEnv, qaRunRoot, qaBundleId } = require('./qa-dev-run.cjs')

function testPlan(inherited = process.env) {
  const home = path.join(qaRunRoot, 'home')
  const state = path.join(qaRunRoot, 'state')
  const env = qaEnv(qaCargoBuildEnv({
    CARGO_HOME: inherited.CARGO_HOME || path.join(os.homedir(), '.cargo'),
    RUSTUP_HOME: inherited.RUSTUP_HOME || path.join(os.homedir(), '.rustup'),
    KNAPSACK_QA_EXPECT_GATEWAY_TESTS: '1',
    KNAPSACK_QA_BUILD_RUN_ID: path.basename(qaRunRoot).slice('knapsack-qa-'.length),
    KNAPSACK_QA_BUILD_BUNDLE_ID: qaBundleId,
    KNAPSACK_QA_BUILD_HOME: home,
    KNAPSACK_QA_BUILD_STATE_DIR: state,
    KNAPSACK_QA_BUILD_CONFIG_PATH: path.join(state, 'openclaw.json'),
    KNAPSACK_QA_BUILD_DATABASE_PATH: path.join(state, 'knapsack-qa.db'),
  }, inherited), inherited)
  return {
    command: 'cargo',
    args: ['test', '--no-default-features', 'synthetic_gateway', '--', '--test-threads=1'],
    options: { cwd: path.join(__dirname, '../src-tauri'), env, stdio: 'inherit' },
  }
}

function run() {
  const plan = testPlan()
  fs.mkdirSync(plan.options.env.HOME, { recursive: true, mode: 0o700 })
  const result = spawnSync(plan.command, plan.args, plan.options)
  if (result.error) console.error(result.error.message)
  process.exitCode = result.status ?? 1
}
if (require.main === module) run()
module.exports = { testPlan }
