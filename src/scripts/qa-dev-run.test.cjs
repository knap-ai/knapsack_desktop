const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {
  assertGatewaySnapshotUnchanged,
  assertSyntheticModeRequest,
  normalizeRunId,
  parseDatabaseCounts,
  qaBundleId,
  qaEnv,
  qaRunRoot,
  qaWebKitDataPaths,
  resolveViteLaunch,
} = require('./qa-dev-run.cjs')

const launcherPath = path.join(__dirname, 'qa-dev-run.cjs')

test('synthetic QA environment strips credentials and pins local isolation', () => {
  const env = qaEnv(
    {
      KNAPSACK_QA_SKIP_GATEWAY: '0',
      OPENCLAW_SKIP_CHANNELS: '0',
      OPENCLAW_DESKTOP_AUTO_START_CHANNELS: '1',
      VITE_KN_API_SERVER: 'https://production.example',
      DATABASE_URL: '/production/knapsack.db',
    },
    {
      PATH: '/usr/bin',
      OPENAI_API_KEY: 'secret',
      AWS_SECRET_ACCESS_KEY: 'secret',
      GOOGLE_APPLICATION_CREDENTIALS: '/production/google.json',
      OLLAMA_HOST: 'http://production.example',
      KNAPSACK_REFRESH_TOKEN: 'secret',
      CODEX_HOME: '/private/codex',
    },
  )

  assert.equal(env.PATH, '/usr/bin')
  assert.equal(env.VITE_KNAPSACK_LOCAL_QA_SAFE, '1')
  assert.equal(env.VITE_KN_API_SERVER, 'http://127.0.0.1:8897')
  assert.equal(env.OPENCLAW_SKIP_CHANNELS, '1')
  assert.equal(env.OPENCLAW_DESKTOP_AUTO_START_CHANNELS, '0')
  assert.equal(env.KNAPSACK_QA_SKIP_GATEWAY, '1')
  assert.equal(env.KNAPSACK_QA_SYNTHETIC, '1')
  assert.match(env.DATABASE_URL, /^\/.*knapsack-qa-[^/]+\/state\/knapsack-qa\.db$/)
  assert.equal(env.OPENAI_API_KEY, undefined)
  assert.equal(env.AWS_SECRET_ACCESS_KEY, undefined)
  assert.equal(env.GOOGLE_APPLICATION_CREDENTIALS, undefined)
  assert.equal(env.OLLAMA_HOST, undefined)
  assert.equal(env.KNAPSACK_REFRESH_TOKEN, undefined)
  assert.equal(env.CODEX_HOME, undefined)
})

test('synthetic mode rejects every live or reusable-state opt-in', () => {
  assert.doesNotThrow(() => assertSyntheticModeRequest({}))
  assert.throws(() => assertSyntheticModeRequest({ KNAPSACK_QA_ENABLE_LIVE_CHANNELS: '1' }), /refuses live channels/)
  assert.throws(() => assertSyntheticModeRequest({ KNAPSACK_QA_SKIP_GATEWAY: '0' }), /refuses to start a gateway/)
  assert.throws(() => assertSyntheticModeRequest({ KNAPSACK_QA_PRESERVE_STATE: '1' }), /refuses preserved state/)
})

test('each QA identity is distinct from production and maps to isolated data stores', () => {
  assert.match(qaBundleId, /^ai\.knap\.knapsack\.qa\.[a-z0-9]+$/)
  assert.notEqual(qaBundleId, 'ai.knap.knapsack')
  assert.notEqual(qaBundleId, 'ai.knap.knapsack.dev')
  assert.match(qaRunRoot, /knapsack-qa-/)
  for (const dataPath of qaWebKitDataPaths('/synthetic-home')) {
    assert.match(dataPath, new RegExp(qaBundleId.replace(/\./g, '\\.')))
    assert.doesNotMatch(dataPath, /ai\.knap\.knapsack(?:\/|$)/)
  }
  assert.equal(normalizeRunId(' Test Run!? '), 'test-run')
})

test('launcher has no production seeding or gateway/LaunchAgent mutation path', () => {
  const launcher = fs.readFileSync(launcherPath, 'utf8')
  for (const forbidden of [
    'seedQaDatabaseFromProd',
    'seedQaProviderTokensFromProd',
    'seedQaConfigFromProd',
    'syncQaGatewayState',
    'bootoutLaunchAgent',
    'killStaleGateways',
    'removeQaLaunchAgent',
    'restoreLaunchAgent',
    'launchctl',
    'LaunchAgents',
    'startDirectGateway',
  ]) assert.doesNotMatch(launcher, new RegExp(forbidden))
  assert.match(launcher, /gatewayListenerSnapshot\(\)/)
  assert.match(launcher, /assertGatewaySnapshotUnchanged\(gatewayBefore\)/)
  assert.match(launcher, /channels: \{\}/)
  assert.match(launcher, /productionSeeded: false/)
})

test('bundle metadata and compile-time identity both use the run-specific bundle ID', () => {
  const launcher = fs.readFileSync(launcherPath, 'utf8')
  assert.match(launcher, /CFBundleIdentifier<\/key><string>\$\{qaBundleId\}<\/string>/)
  assert.match(launcher, /identifier: qaBundleId/)
  assert.match(launcher, /\.knapsack-qa-bundle-id/)
  assert.match(launcher, /fs\.readFileSync\(buildIdentityMarker[\s\S]*?!== qaBundleId/)
  assert.doesNotMatch(launcher, /ai\.knap\.knapsack\.dev/)
})

test('gateway ownership comparison fails closed on any listener change', () => {
  assert.doesNotThrow(() => assertGatewaySnapshotUnchanged({ 18789: [10], 18791: [] }, { 18789: [10], 18791: [] }))
  assert.throws(() => assertGatewaySnapshotUnchanged({ 18789: [10], 18791: [] }, { 18789: [11], 18791: [] }), /ownership change/)
})

test('database count parser rejects malformed output and preserves zero checks', () => {
  assert.deepEqual(parseDatabaseCounts('connections=0\nmessages=0\n'), [['connections', 0], ['messages', 0]])
  assert.throws(() => parseDatabaseCounts('not-sqlite-output'), /Unexpected database isolation output/)
})

test('Vite uses an installed JS entrypoint when the platform shim is missing', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-vite-test-'))
  const viteJs = path.join(temp, 'vite.js')
  fs.writeFileSync(viteJs, '')
  const launch = resolveViteLaunch({ binPath: path.join(temp, 'missing-vite'), jsPath: viteJs })
  assert.equal(launch.command, process.execPath)
  assert.equal(launch.args[0], viteJs)
  assert.throws(
    () => resolveViteLaunch({ binPath: path.join(temp, 'missing-vite'), jsPath: path.join(temp, 'missing-vite.js') }),
    /Run the repository setup/,
  )
})

test('Rust local-only mode guards every gateway lifecycle boundary', () => {
  const service = fs.readFileSync(path.join(__dirname, '../src-tauri/src/clawd/service.rs'), 'utf8')
  const supervisor = fs.readFileSync(path.join(__dirname, '../src-tauri/src/clawd/gateway_supervisor.rs'), 'utf8')
  assert.match(service, /pub\(crate\) fn qa_local_only_mode\(\)/)
  assert.match(service, /fn kill_process_on_port[\s\S]*?port == 18789 && qa_local_only_mode\(\)/)
  assert.match(service, /pub async fn self_heal_gateway_conflict[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /pub fn cleanup_gateway_on_exit[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(service, /pub async fn set_service_enabled[\s\S]*?if qa_local_only_mode\(\)/)
  assert.match(supervisor, /pub async fn ensure_gateway_running[\s\S]*?if super::service::qa_local_only_mode\(\)/)
  assert.match(supervisor, /pub fn kickstart_launch_agent[\s\S]*?if super::service::qa_local_only_mode\(\)/)
})
