const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { qaEnv } = require('./qa-dev-run.cjs')

test('all dev QA modes enable frontend safety guards', () => {
  const previous = process.env.KNAPSACK_QA_SKIP_GATEWAY
  try {
    process.env.KNAPSACK_QA_SKIP_GATEWAY = '1'
    assert.equal(qaEnv().VITE_KNAPSACK_LOCAL_QA_SAFE, '1')
    process.env.KNAPSACK_QA_SKIP_GATEWAY = '0'
    assert.equal(qaEnv().VITE_KNAPSACK_LOCAL_QA_SAFE, '1')
  } finally {
    if (previous === undefined) delete process.env.KNAPSACK_QA_SKIP_GATEWAY
    else process.env.KNAPSACK_QA_SKIP_GATEWAY = previous
  }
})
test('macOS dev QA creates a self-contained signed app bundle', () => {
  const launcher = fs.readFileSync(path.join(__dirname, 'qa-dev-run.cjs'), 'utf8')

  assert.doesNotMatch(launcher, /KNAPSACK_QA_APP_BUNDLE/)
  assert.match(launcher, /prepareOnlyRequested[\s\S]*?path\.join\(os\.tmpdir\(\), "knapsack-qa-prepare"\)/)
  assert.match(launcher, /rootStat\.isSymbolicLink\(\)[\s\S]*?Refusing unsafe QA app root/)
  assert.match(
    launcher,
    /fs\.cpSync\(debugResources, path\.join\(resourcesDir, "resources"\), \{\s*recursive: true,/,
  )
  assert.doesNotMatch(
    launcher,
    /fs\.symlinkSync\(debugResources, path\.join\(resourcesDir, "resources"\)\)/,
  )
  assert.match(launcher, /if \(!localOnly && fs\.existsSync\(debugResources\)\) \{/)
  assert.match(launcher, /prepareMacDevAppBundle\(\{ localOnly \}\)/)
  assert.match(
    launcher,
    /spawnSync\(\s*"codesign",\s*\["--force", "--deep", "--sign", "-", qaAppBundle\]/,
  )
  assert.match(launcher, /spawnSync\("xattr", \["-cr", qaAppBundle\]/)
  assert.match(launcher, /if \(signResult\.status !== 0\) \{\s*throw new Error\(/)
  assert.match(launcher, /if \(prepareOnly\) \{\s*prepareMacDevAppBundle\(\{ localOnly \}\);[\s\S]*?process\.exit\(0\)/)
  assert.match(launcher, /if \(!localOnly && !prepareOnly\) backupExistingLaunchAgentIfNeeded\(\)/)
  assert.match(launcher, /if \(prepareOnly\)[\s\S]*?process\.exit\(0\)[\s\S]*?syncQaGatewayState\(\)/)
  assert.match(launcher, /process\.platform === "darwin" && !prepareOnly/)
})


test('QA disables channel transports unless explicitly opted in', () => {
  const safe = qaEnv({ KNAPSACK_QA_ENABLE_LIVE_CHANNELS: '0', OPENCLAW_SKIP_CHANNELS: '0', OPENCLAW_DESKTOP_AUTO_START_CHANNELS: '1' })
  assert.equal(safe.OPENCLAW_SKIP_CHANNELS, '1')
  assert.equal(safe.OPENCLAW_DESKTOP_AUTO_START_CHANNELS, '0')
  const enabled = qaEnv({ KNAPSACK_QA_ENABLE_LIVE_CHANNELS: '1', OPENCLAW_SKIP_CHANNELS: '0', OPENCLAW_DESKTOP_AUTO_START_CHANNELS: '1' })
  assert.equal(enabled.OPENCLAW_SKIP_CHANNELS, '0')
  assert.equal(enabled.OPENCLAW_DESKTOP_AUTO_START_CHANNELS, '1')
})


test('preserved QA sessions do not overwrite their meeting database', () => {
  const launcher = fs.readFileSync(path.join(__dirname, 'qa-dev-run.cjs'), 'utf8')
  assert.match(launcher, /if \(!preserveQaState \|\| !fs\.existsSync\(qaDbPath\)\) \{\s*seedQaDatabaseFromProd\(\);/)
})

test('local-only QA is fail-closed at every gateway lifecycle boundary', () => {
  const service = fs.readFileSync(
    path.join(__dirname, '../src-tauri/src/clawd/service.rs'),
    'utf8',
  )
  const supervisor = fs.readFileSync(
    path.join(__dirname, '../src-tauri/src/clawd/gateway_supervisor.rs'),
    'utf8',
  )
  const launcher = fs.readFileSync(path.join(__dirname, 'qa-dev-run.cjs'), 'utf8')

  assert.match(service, /pub\(crate\) fn qa_local_only_mode\(\)/)
  assert.match(service, /qa_local_only_enabled\(\s*cfg!\(debug_assertions\)/)
  assert.match(service, /fn kill_process_on_port[\s\S]*?port == 18789 && qa_local_only_mode\(\)/)
  assert.match(service, /fn evict_competing_gateway_plists[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /pub async fn self_heal_gateway_conflict[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /async fn run_gateway_self_heal_cycle[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /pub async fn cycle_service[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /pub fn cleanup_gateway_on_exit[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /fn regenerate_macos_plist_with_current_env[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /fn bootstrap_current_launch_agent_detached[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /async fn write_current_launch_agent_plist[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /pub async fn set_service_enabled[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /pub async fn auto_enable_if_needed[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /gateway self-heal disabled in local-only QA/)
  assert.match(service, /Gateway remains disabled for local-only QA/)
  assert.match(supervisor, /pub async fn ensure_gateway_running[\s\S]*?if super::service::qa_local_only_mode\(\)/)
  assert.match(supervisor, /pub fn kickstart_launch_agent[\s\S]*?if super::service::qa_local_only_mode\(\)/)
  assert.equal(
    [...launcher.matchAll(/if \(!localOnly\) \{\s*bootoutLaunchAgent\(\);\s*killStaleGateways/g)].length,
    3,
  )
  assert.match(launcher, /finally \{\s*if \(!localOnly\) restoreLaunchAgentBackupIfPresent\(\);/)
})
