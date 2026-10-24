const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { spawn, spawnSync } = require('node:child_process')
const {
  assertGatewaySnapshotUnchanged,
  assertAllowedConnectionCatalog,
  assertPortOwnedBy,
  assertSyntheticModeRequest,
  assertZeroContentCounts,
  normalizeRunId,
  interpretListenerInspection,
  parseDatabaseCounts,
  qaBundleId,
  qaEnv,
  qaRunRoot,
  qaWebKitDataPaths,
  resolveViteLaunch,
  waitForUrl,
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
      SENTRY_DSN: 'https://secret@sentry.example/1',
      VITE_SENTRY_DSN: 'https://secret@sentry.example/2',
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
  assert.match(env.HOME, /^\/.*knapsack-qa-[^/]+\/home$/)
  assert.equal(env.USERPROFILE, env.HOME)
  assert.equal(env.XDG_CONFIG_HOME, path.join(env.HOME, '.config'))
  assert.equal(env.APPDATA, path.join(env.HOME, 'AppData', 'Roaming'))
  assert.equal(env.OPENAI_API_KEY, undefined)
  assert.equal(env.AWS_SECRET_ACCESS_KEY, undefined)
  assert.equal(env.GOOGLE_APPLICATION_CREDENTIALS, undefined)
  assert.equal(env.OLLAMA_HOST, undefined)
  assert.equal(env.KNAPSACK_REFRESH_TOKEN, undefined)
  assert.equal(env.SENTRY_DSN, undefined)
  assert.equal(env.VITE_SENTRY_DSN, undefined)
  assert.equal(env.CODEX_HOME, undefined)
})

test('synthetic mode rejects every live or reusable-state opt-in', () => {
  assert.doesNotThrow(() => assertSyntheticModeRequest({}))
  assert.throws(() => assertSyntheticModeRequest({ KNAPSACK_QA_ENABLE_LIVE_CHANNELS: '1' }), /refuses live channels/)
  assert.throws(() => assertSyntheticModeRequest({ KNAPSACK_QA_SKIP_GATEWAY: '0' }), /refuses to start a gateway/)
  assert.throws(() => assertSyntheticModeRequest({ KNAPSACK_QA_PRESERVE_STATE: '1' }), /refuses preserved state/)
})

test('spawned synthetic process resolves and writes only inside the run home', () => {
  const productionHome = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-production-sentinel-'))
  const sentinel = path.join(productionHome, '.knapsack', 'notes', '42')
  fs.mkdirSync(path.dirname(sentinel), { recursive: true })
  fs.writeFileSync(sentinel, 'production sentinel')
  const child = spawnSync(process.execPath, ['-e', [
    'const fs=require("fs"),os=require("os"),path=require("path");',
    'const probe=path.join(os.homedir(),".knapsack","notes","42");',
    'fs.mkdirSync(path.dirname(probe),{recursive:true});',
    'fs.writeFileSync(probe,"synthetic note");',
    'process.stdout.write(JSON.stringify({home:os.homedir(),probe}));',
  ].join('')], { encoding: 'utf8', env: qaEnv({}, { PATH: process.env.PATH, HOME: productionHome }) })
  assert.equal(child.status, 0, child.stderr)
  const result = JSON.parse(child.stdout)
  assert.equal(result.home, path.join(qaRunRoot, 'home'))
  assert.equal(result.probe, path.join(qaRunRoot, 'home', '.knapsack', 'notes', '42'))
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'production sentinel')
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
  for (const buildKey of [
    'KNAPSACK_QA_BUILD_RUN_ID',
    'KNAPSACK_QA_BUILD_BUNDLE_ID',
    'KNAPSACK_QA_BUILD_HOME',
    'KNAPSACK_QA_BUILD_STATE_DIR',
    'KNAPSACK_QA_BUILD_CONFIG_PATH',
    'KNAPSACK_QA_BUILD_DATABASE_PATH',
  ]) assert.match(launcher, new RegExp(buildKey))
  assert.doesNotMatch(launcher, /ai\.knap\.knapsack\.dev/)
})

test('native and frontend startup fail closed around synthetic identity and user state', () => {
  const nativeGuard = fs.readFileSync(path.join(__dirname, '../src-tauri/src/qa_launch.rs'), 'utf8')
  const storage = fs.readFileSync(path.join(__dirname, '../src/utils/KNLocalStorage.ts'), 'utf8')
  const analytics = fs.readFileSync(path.join(__dirname, '../src/utils/KNAnalytics.ts'), 'utf8')
  const app = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8')
  const main = fs.readFileSync(path.join(__dirname, '../src-tauri/src/main.rs'), 'utf8')
  const frontendMain = fs.readFileSync(path.join(__dirname, '../src/main.tsx'), 'utf8')
  const updater = fs.readFileSync(path.join(__dirname, '../src/hooks/useAppUpdate.tsx'), 'utf8')
  const audio = fs.readFileSync(path.join(__dirname, '../src-tauri/src/audio/audio.rs'), 'utf8')

  assert.match(nativeGuard, /option_env!\("KNAPSACK_QA_BUILD_BUNDLE_ID"\)/)
  assert.match(nativeGuard, /runtime_matches\(identity, runtime\)/)
  assert.match(nativeGuard, /synthetic_qa_identity_does_not_depend_on_executable_name/)
  assert.match(nativeGuard, /synthetic_qa_identity_rejects_every_altered_isolation_value/)
  assert.match(storage, /if \(import\.meta\.env\.VITE_KNAPSACK_LOCAL_QA_SAFE === '1'\) \{\s*this\.data = \{\}/)
  assert.match(analytics, /static QA_SAFE = import\.meta\.env\.VITE_KNAPSACK_LOCAL_QA_SAFE === '1'/)
  assert.match(analytics, /if \(this\.QA_SAFE \|\| this\.PRIVACY_MODE\) return/)
  assert.match(app, /if \(LOCAL_QA_SAFE\) return\s*const email = auth\.profile/)
  assert.match(app, /if \(!LOCAL_QA_SAFE\) \{\s*invoke\('plugin:autostart\|enable'\)/)
  assert.match(main, /if !qa_launch::is_synthetic_build\(\) \{\s*tauri_plugin_deep_link::prepare/)
  assert.ok(main.indexOf('qa_launch::reject_unmanaged_launch();') < main.indexOf('--internal-mcp-snowflake'))
  assert.match(main, /if !qa_launch::is_synthetic_build\(\) \{\s*builder = builder\.plugin\(tauri_plugin_autostart::init/)
  assert.match(main, /if !qa_launch::is_synthetic_build\(\) \{\s*let deep_link_handle/)
  assert.match(main, /if qa_launch::is_synthetic_build\(\)[\s\S]*?option_env!\("SENTRY_DSN"\)/)
  assert.match(frontendMain, /VITE_KNAPSACK_LOCAL_QA_SAFE === '1' \|\| !telemetryAllowed\(\)/)
  assert.match(updater, /if \(LOCAL_QA_SAFE\) throw new Error\('App updates are disabled in synthetic QA'\)/)
  assert.match(audio, /if synthetic_build \{\s*return Ok\(\(\)\);/)
  assert.match(audio, /synthetic_qa_startup_preserves_staged_production_recordings_with_empty_database/)
})

test('gateway ownership comparison fails closed on any listener change', () => {
  assert.doesNotThrow(() => assertGatewaySnapshotUnchanged({ 18789: [10], 18791: [] }, { 18789: [10], 18791: [] }))
  assert.throws(() => assertGatewaySnapshotUnchanged({ 18789: [10], 18791: [] }, { 18789: [11], 18791: [] }), /ownership change/)
})

test('listener inspection fails closed when tooling or platform cannot verify ownership', () => {
  assert.deepEqual(interpretListenerInspection({ status: 1, stdout: '', stderr: '' }, 'darwin'), [])
  assert.deepEqual(interpretListenerInspection({ status: 0, stdout: '22\n11\n', stderr: '' }, 'darwin'), [11, 22])
  assert.throws(() => interpretListenerInspection({ status: null, stdout: '', stderr: '', error: new Error('ENOENT') }, 'darwin'), /could not verify/)
  assert.throws(() => interpretListenerInspection({ status: 2, stdout: '', stderr: 'permission denied' }, 'darwin'), /could not verify/)
  assert.throws(() => interpretListenerInspection({ status: 1, stdout: '', stderr: '' }, 'win32'), /does not support/)
})

test('readiness ownership rejects absent, wrong, and late foreign listeners', () => {
  const descendant = (pid, _lookup, owner) => pid === owner || pid === owner + 1
  assert.doesNotThrow(() => assertPortOwnedBy(1420, 10, [10, 11], descendant))
  assert.throws(() => assertPortOwnedBy(1420, 10, [], descendant), /not owned/)
  assert.throws(() => assertPortOwnedBy(1420, 10, [10, 99], descendant), /not owned/)
})

test('readiness wait rejects an early child exit', async () => {
  const child = spawn(process.execPath, ['-e', 'process.exit(7)'])
  await assert.rejects(waitForUrl('http://127.0.0.1:65530/', 2_000, child), /exited before readiness/)
})

test('database count parser rejects malformed output and preserves zero checks', () => {
  assert.deepEqual(parseDatabaseCounts('connections=0\nmessages=0\n'), [['connections', 0], ['messages', 0]])
  assert.throws(() => parseDatabaseCounts('not-sqlite-output'), /Unexpected database isolation output/)
  assert.doesNotThrow(() => assertZeroContentCounts('users=0\nmessages=0\n'))
  assert.throws(() => assertZeroContentCounts('users=0\nmessages=1\n'), /messages=1/)
})

test('fresh database permits only static connection catalog rows', () => {
  const staticRows = [
    'google_profile_read|google',
    'google_calendar_read|google',
    'google_drive_read|google',
    'google_gmail_modify|google',
    'microsoft_profile_read|microsoft',
    'microsoft_calendar_read|microsoft',
    'microsoft_outlook_read|microsoft',
    'microsoft_onedrive_read|microsoft',
    'knapsack_access_key|knapsack',
  ].join('\n')
  assert.doesNotThrow(() => assertAllowedConnectionCatalog(staticRows))
  assert.throws(() => assertAllowedConnectionCatalog(staticRows.replace('google_profile_read|google\n', '')), /incomplete/)
  assert.throws(() => assertAllowedConnectionCatalog(`${staticRows}\nwork-account@example.test|gmail\n`), /unexpected connection catalog/)
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
