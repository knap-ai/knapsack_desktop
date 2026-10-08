const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const flush = () => new Promise(resolve => setImmediate(resolve))
const source = name => fs.readFileSync(path.join(__dirname, '../src', name), 'utf8')
const compile = name => ts.transpileModule(source(name), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText
const apiCode = compile('api/stateBackup.ts')
const componentCode = compile('components/organisms/StateBackupControl.tsx')
const pickerCode = compile('components/organisms/AccountDevicePicker.tsx')
const key = 'a1'.repeat(32)
const localStatus = {
  schemaVersion: 1, brainRoot: '/private/gbrain', ownerAccountId: null, deviceId: 'this-device',
  enabled: false, automatic: false, lastBackupAt: null, lastSnapshotId: null, lastError: null,
}
const accountStatus = {
  account_id: 'account-one', enabled: false, device_id: null, epoch: 3, revision: 0, latest_snapshot_id: null,
  recovery_mode: 'account_recovery_v1', key_version: null, account_recovery_available: true,
  account_recovery_unavailable_reason: null,
}
const deviceDirectory = {
  account_id: 'account-one', current_device_id: 'this-device',
  account: { ...accountStatus, enabled: true, device_id: 'source-device', revision: 7, latest_snapshot_id: 'source-snapshot' },
  devices: [{ device_id: 'this-device', name: 'MacBook', platform: 'macos', last_seen: 1000, recently_seen: true, is_writer: false },
            { device_id: 'source-device', name: 'Mac Studio', platform: 'macos', last_seen: 500, recently_seen: false, is_writer: true }],
  checkpoint: { snapshot_id: 'source-snapshot', source_device_id: 'source-device', revision: 7, epoch: 3, created_at: '2026-10-07T00:00:00Z' },
  remote_execution_available: false, continuous_sync_available: false, server_time: 1000,
}
const plain = value => JSON.parse(JSON.stringify(value))

function loadApi(invoke) {
  const exports = {}
  vm.runInNewContext(apiCode, { exports, require: () => ({ invoke }) })
  return exports
}

// A small hook/JSX host exercises the component's event handlers and lifecycle without a browser,
// Tauri process, account request, persistent storage, or an extra test dependency.
function mount(overrides = {}, listener = undefined, dialog = async () => null) {
  const slots = [], effects = [], events = new Map(), calls = []
  let cursor = 0, dirty = false, tree, props = { isOpen: true }, active = true
  const helpers = loadApi(() => { throw new Error('Unexpected real native request') })
  const defaults = {
    getAccountDevices: async () => deviceDirectory,
    registerAccountDevice: async () => deviceDirectory,
    getStateBackupStatus: async () => localStatus,
    getStateBackupAccount: async () => accountStatus,
    enableStateBackup: async () => ({ ...localStatus, enabled: true, ownerAccountId: accountStatus.account_id }),
    backUpStateNow: async () => ({ ...localStatus, enabled: true, lastBackupAt: 1000 }),
    disableStateBackup: async () => localStatus,
    restoreStateBackup: async () => ({ ...localStatus, brainRoot: '/private/restored-generation' }),
    verifyStateBackupIdentity: async () => accountStatus,
    cancelStateBackupIdentity: async () => {},
    cancelStateBackupOperation: async () => {},
    migrateLegacyStateBackup: async () => ({ ...localStatus, brainRoot: '/private/migrated-generation' }),
    ...overrides,
  }
  const api = { ...helpers }
  for (const [name, fn] of Object.entries(defaults)) api[name] = (...args) => { calls.push({ name, args }); return fn(...args) }
  const hooks = {
    useState(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial
      return [slots[i], next => {
        const value = typeof next === 'function' ? next(slots[i]) : next
        if (!Object.is(slots[i], value)) { slots[i] = value; dirty = true }
      }]
    },
    useCallback(callback, deps) {
      const i = cursor++
      if (!slots[i] || deps.some((dep, n) => !Object.is(dep, slots[i].deps[n]))) slots[i] = { deps, callback }
      return slots[i].callback
    },
    useRef(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = { current: initial }
      return slots[i]
    },
    useEffect(fn, deps) {
      const i = cursor++
      if (!slots[i] || deps.some((dep, n) => !Object.is(dep, slots[i].deps[n]))) {
        const old = slots[i]
        slots[i] = { deps }
        effects.push(() => { old?.cleanup?.(); slots[i].cleanup = fn() })
      }
    },
  }
  const jsx = (type, props) => typeof type === 'function' ? type(props) : ({ type, props })
  const picker = {}
  vm.runInNewContext(pickerCode, { exports: picker, require: () => ({ jsx, jsxs: jsx, Fragment: 'fragment' }) })
  const exports = {}
  vm.runInNewContext(componentCode, {
    exports,
    require(name) {
      if (name === 'react') return hooks
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' }
      if (name === './AccountDevicePicker') return picker
      if (name === 'src/api/stateBackup') return api
      if (name === '@tauri-apps/api/event') return { listen: listener || (async (event, callback) => { events.set(event, callback); return () => events.delete(event) }) }
      if (name === '@tauri-apps/api/dialog') return { open: dialog }
      throw Error(name)
    },
  })
  function render() {
    dirty = false; cursor = 0
    tree = exports.default(props)
    effects.splice(0).forEach(fn => fn())
  }
  function elements(node) {
    if (arguments.length === 0) node = tree
    if (Array.isArray(node)) return node.flatMap(elements)
    if (!node || typeof node !== 'object') return []
    return [node, ...elements(node.props?.children ?? null)]
  }
  function text(node) {
    if (arguments.length === 0) node = tree
    if (Array.isArray(node)) return node.map(text).join(' ')
    if (node == null || typeof node === 'boolean') return ''
    if (typeof node !== 'object') return String(node)
    return text(node.props?.children ?? null)
  }
  const apiHost = {
    calls,
    text,
    elements,
    async settle() {
      for (let i = 0; i < 20; i++) {
        await flush()
        if (!active || !dirty) return
        render()
      }
      throw Error('Component did not settle')
    },
    button(label) { return elements().find(el => el.type === 'button' && text(el).replace(/\s+/g, ' ').trim() === label) },
    input() { return elements().find(el => el.type === 'input' && el.props.type !== 'checkbox') },
    checkbox(label) {
      const row = elements().find(el => el.type === 'label' && text(el).includes(label))
      return row && elements(row).find(el => el.type === 'input')
    },
    async click(label) {
      const button = this.button(label)
      assert.ok(button, `Missing button: ${label}`)
      assert.equal(!!button.props.disabled, false, `Disabled button: ${label}`)
      button.props.onClick()
      await this.settle()
    },
    async check(label, checked = true) { this.checkbox(label).props.onChange({ target: { checked } }); await this.settle() },
    async emit(event) { events.get(event)?.({ payload: {} }); await this.settle() },
    async open(isOpen) { props = { isOpen }; render(); await this.settle() },
    unmount() { active = false; slots.forEach(slot => slot?.cleanup?.()) },
    async remount() {
      this.unmount(); slots.length = 0; effects.length = 0; active = true; props = { isOpen: true }
      render(); await this.settle()
    },
  }
  render()
  return apiHost
}

async function setup(app) {
  await app.settle()
  await app.click('Check signed-in account')
  await app.click('Set up encrypted backup')
}

test('native API excludes all key material, preserves epoch fences, and disallows enable takeover', async () => {
  const calls = []
  const api = loadApi(async (...args) => { calls.push(args); return localStatus })
  await api.getStateBackupStatus()
  await api.getStateBackupAccount()
  await api.enableStateBackup({ confirmAccountRecovery: true, automatic: false, expectedEpoch: 5, takeover: true, recoveryKey: key, confirmSaved: true })
  await api.backUpStateNow(key)
  await api.disableStateBackup()
  await api.restoreStateBackup({ snapshotId: 'latest-seen', confirmReplace: true, expectedEpoch: 8, recoveryKey: key })
  assert.deepEqual(plain(calls), [
    ['kn_state_backup_status'], ['kn_state_backup_account'],
    ['kn_state_backup_enable', { confirmAccountRecovery: true, automatic: false, expectedEpoch: 5, takeover: false }],
    ['kn_state_backup_now'], ['kn_state_backup_disable'],
    ['kn_state_backup_restore', { snapshotId: 'latest-seen', confirmReplace: true, expectedEpoch: 8 }],
  ])
  assert.equal('generateStateBackupKey' in api, false)
  assert.equal('isStateBackupKey' in api, false)
  assert.equal(JSON.stringify(calls).includes(key), false)
})

test('opening Settings only reads local status and never reads a remote account', async () => {
  const app = mount(); await app.settle()
  assert.deepEqual(app.calls.map(call => call.name), ['getStateBackupStatus'])
  assert.match(app.text(), /Cloud backup off/)
  assert.match(app.text(), /separate from Privacy Mode/)
  app.unmount()
})

test('setup requires account-recovery and cloud consent, defaults to manual, and never requests a recovery code', async () => {
  const app = mount(); await setup(app)
  assert.equal(app.button('Enable encrypted backup').props.disabled, true)
  assert.equal(app.checkbox('Enable automatic backups').props.checked, false)
  assert.equal(app.input(), undefined)
  assert.match(app.text(), /fresh Google or Microsoft identity verification linked to this same Knapsack account/)
  assert.match(app.text(), /authorized recovery service can recover the encryption key and decrypt/)
  assert.match(app.text(), /not zero-knowledge storage/)
  assert.equal(app.calls.some(call => call.name === 'enableStateBackup'), false)
  await app.check('I understand Knapsack can recover')
  assert.equal(app.button('Enable encrypted backup').props.disabled, true)
  await app.check('I want encrypted GBrain')
  await app.click('Enable encrypted backup')
  assert.deepEqual(plain(app.calls.find(call => call.name === 'enableStateBackup').args[0]), {
    confirmAccountRecovery: true, automatic: false, expectedEpoch: 3,
  })
  assert.equal(app.input(), undefined)
  app.unmount()
})

test('repeat clicks cannot overlap an enable request and automatic backup is separately opt-in', async () => {
  let finish
  const app = mount({ enableStateBackup: () => new Promise(resolve => { finish = resolve }) })
  await setup(app)
  await app.check('I understand Knapsack can recover'); await app.check('I want encrypted GBrain')
  await app.check('Enable automatic backups')
  const button = app.button('Enable encrypted backup')
  button.props.onClick(); button.props.onClick()
  await app.settle()
  assert.equal(app.calls.filter(call => call.name === 'enableStateBackup').length, 1)
  assert.equal(app.calls.find(call => call.name === 'enableStateBackup').args[0].automatic, true)
  assert.ok(app.elements().filter(el => el.type === 'button' && !app.text(el).includes('Cancel identity verification')).every(el => el.props.disabled))
  finish({ ...localStatus, enabled: true, automatic: true }); await app.settle()
  app.unmount()
})

test('account change clears account and recovery consent without restoring old authorization', async () => {
  const app = mount(); await setup(app)
  await app.check('I understand Knapsack can recover'); await app.check('I want encrypted GBrain')
  await app.check('Enable automatic backups'); await app.emit('knapsack-connected')
  assert.equal(app.button('Enable encrypted backup'), undefined)
  await app.click('Check signed-in account'); await app.click('Set up encrypted backup')
  assert.equal(app.checkbox('I understand Knapsack can recover').props.checked, false)
  assert.equal(app.checkbox('I want encrypted GBrain').props.checked, false)
  assert.equal(app.checkbox('Enable automatic backups').props.checked, false)
  assert.equal(app.calls.some(call => call.name === 'enableStateBackup'), false)
  assert.equal(app.input(), undefined)
  app.unmount()
})

test('closing and reopening Settings discards consent, account state, and stale account responses', async () => {
  let finish
  const app = mount({ getStateBackupAccount: () => new Promise(resolve => { finish = resolve }) })
  await app.settle(); await app.click('Check signed-in account')
  await app.open(false); await app.open(true)
  finish(accountStatus); await app.settle()
  assert.equal(app.button('Set up encrypted backup'), undefined)
  assert.equal(app.input(), undefined)
  assert.equal(app.calls.filter(call => call.name === 'getStateBackupAccount').length, 1)
  app.unmount()
})

test('failed commands clear account-recovery consent and redact unexpected key-shaped error material', async () => {
  const app = mount({ enableStateBackup: async () => { throw `Rejected key ${key}` } })
  await setup(app)
  await app.check('I understand Knapsack can recover'); await app.check('I want encrypted GBrain')
  await app.click('Enable encrypted backup')
  assert.equal(app.text().includes(key), false)
  assert.match(app.text(), /Rejected key \[redacted\]/)
  await app.click('Check signed-in account'); await app.click('Set up encrypted backup')
  assert.equal(app.checkbox('I understand Knapsack can recover').props.checked, false)
  app.unmount()
})

test('another device cannot be overwritten through setup; restore pins snapshot and requires confirmation', async () => {
  const app = mount({ getStateBackupAccount: async () => ({ ...accountStatus, enabled: true, device_id: 'other-device', latest_snapshot_id: 'snapshot-seven', epoch: 9 }) })
  await app.settle(); await app.click('Check signed-in account')
  assert.equal(app.button('Set up encrypted backup'), undefined)
  await app.click('Restore latest backup')
  assert.match(app.text(), /other computers can no longer upload/)
  assert.match(app.text(), /no external actions are replayed/)
  assert.equal(app.button('Restore and switch this GBrain').props.disabled, true)
  await app.check('I understand this switches')
  await app.click('Restore and switch this GBrain')
  assert.deepEqual(plain(app.calls.find(call => call.name === 'restoreStateBackup').args[0]), {
    snapshotId: 'snapshot-seven', confirmReplace: true, expectedEpoch: 9,
  })
  assert.match(app.text(), /Restart Knapsack to use the restored GBrain/)
  assert.equal(app.input(), undefined)
  assert.equal(app.button('Check signed-in account'), undefined)
  await app.open(false); await app.open(true)
  assert.match(app.text(), /Restart Knapsack to use the restored GBrain/)
  app.unmount()
})

test('manual and automatic backup use native account recovery with no UI encryption key', async () => {
  const local = { ...localStatus, enabled: true, ownerAccountId: 'account-one', recoveryMode: 'account_recovery_v1' }
  const remote = { ...accountStatus, enabled: true, device_id: 'this-device', latest_snapshot_id: 'snapshot-one', key_version: 'key-version-id' }
  for (const automatic of [false, true]) {
    const app = mount({ getStateBackupStatus: async () => ({ ...local, automatic }), getStateBackupAccount: async () => remote })
    await app.settle(); await app.click('Check signed-in account'); await app.click('Back up now')
    assert.deepEqual(plain(app.calls.find(call => call.name === 'backUpStateNow').args), [])
    assert.equal(app.input(), undefined)
    app.unmount()
  }
})

test('server recovery prerequisites gate enable, backup, and restore without any key fallback', async () => {
  const reasons = {
    kms_not_configured: /recovery key service is not configured/,
    provider_reauthentication_unavailable: /Fresh Google or Microsoft identity verification.*not configured/,
    immutable_account_auth_unavailable: /Verified account identity and recent sign-in integration.*not configured/,
    immutable_account_identity_unavailable: /Verified account identity and recent sign-in integration.*not configured/,
    legacy_private_key_migration_required: /original encrypted archive/,
  }
  for (const [reason, message] of Object.entries(reasons)) {
    const app = mount({
      getStateBackupStatus: async () => ({ ...localStatus, enabled: true, ownerAccountId: 'account-one', recoveryMode: 'account_recovery_v1' }),
      getStateBackupAccount: async () => ({ ...accountStatus, enabled: true, device_id: 'this-device', latest_snapshot_id: 'snapshot-one', key_version: 'opaque-key-version', account_recovery_available: false, account_recovery_unavailable_reason: reason }),
    })
    await app.settle(); await app.click('Check signed-in account')
    assert.match(app.text(), /Account recovery setup required/)
    assert.match(app.text(), message)
    for (const name of ['Change backup settings', 'Back up now', 'Restore latest backup']) {
      const button = app.button(name)
      assert.ok(button)
      assert.equal(button.props.disabled, true)
      button.props.onClick()
    }
    await app.settle()
    assert.equal(app.calls.some(call => ['enableStateBackup', 'backUpStateNow', 'restoreStateBackup'].includes(call.name)), false)
    assert.equal(app.button('Enable encrypted backup'), undefined)
    assert.equal(app.button('Restore and switch this GBrain'), undefined)
    assert.equal(app.input(), undefined)
    assert.equal(app.button('Disable cloud backup').props.disabled, false)
    if (reason === 'provider_reauthentication_unavailable' || reason === 'immutable_account_auth_unavailable' || reason === 'immutable_account_identity_unavailable') {
      assert.match(app.text(), /Ordinary Knapsack sign-in.*does not resolve/)
    }
    app.unmount()
  }
})

test('missing, unknown, or inconsistent recovery capabilities fail closed without provider guessing', async () => {
  const variants = [
    { ...accountStatus, account_recovery_available: undefined, account_recovery_unavailable_reason: undefined },
    { ...accountStatus, account_recovery_available: true, recovery_mode: undefined },
    { ...accountStatus, account_recovery_unavailable_reason: 'unknown_server_requirement' },
    { ...accountStatus, account_recovery_available: false, account_recovery_unavailable_reason: null },
  ]
  for (const remote of variants) {
    const app = mount({ getStateBackupAccount: async () => remote })
    await app.settle(); await app.click('Check signed-in account')
    assert.match(app.text(), /Verified account recovery is unavailable/)
    assert.equal(app.button('Set up encrypted backup').props.disabled, true)
    assert.equal(app.input(), undefined)
    assert.doesNotMatch(app.text(), /unknown_server_requirement/)
    assert.equal(app.calls.some(call => call.name === 'enableStateBackup'), false)
    app.unmount()
  }
})

test('ready first-time account with the service legacy default can initialize verified account recovery', async () => {
  const app = mount({
    getStateBackupAccount: async () => ({ ...accountStatus, recovery_mode: 'private_key_v1', epoch: 0, revision: 0, latest_snapshot_id: null, key_version: null, device_id: null, enabled: false }),
  })
  await setup(app)
  assert.doesNotMatch(app.text(), /Account recovery setup required/)
  assert.equal(app.input(), undefined)
  await app.check('I understand Knapsack can recover'); await app.check('I want encrypted GBrain')
  await app.click('Enable encrypted backup')
  assert.deepEqual(plain(app.calls.find(call => call.name === 'enableStateBackup').args[0]), {
    confirmAccountRecovery: true, automatic: false, expectedEpoch: 0,
  })
  assert.equal(JSON.stringify(app.calls).includes(key), false)
  app.unmount()
})

test('legacy default is only initializable for the exact empty account, never previously claimed or encrypted state', async () => {
  const initial = { ...accountStatus, recovery_mode: 'private_key_v1', epoch: 0, revision: 0, latest_snapshot_id: null, key_version: null, device_id: null, enabled: false }
  const api = loadApi(async () => undefined)
  assert.equal(api.stateBackupRecoveryBlocker(initial), null)
  for (const changed of [
    { epoch: 1 }, { revision: 1 }, { latest_snapshot_id: 'old-ciphertext' },
    { key_version: 'old-key-version' }, { device_id: 'claimed-device' }, { enabled: true },
    { epoch: undefined }, { revision: undefined }, { key_version: undefined },
    { account_recovery_available: false }, { account_recovery_unavailable_reason: 'kms_not_configured' },
  ]) assert.ok(api.stateBackupRecoveryBlocker({ ...initial, ...changed }))
  assert.ok(api.stateBackupRecoveryBlocker(initial, 'private_key_v1'))
})

test('legacy remote or local private-key modes require migration even if availability is reported true', async () => {
  for (const localLegacy of [false, true]) {
    const app = mount({
      getStateBackupStatus: async () => ({ ...localStatus, recoveryMode: localLegacy ? 'private_key_v1' : null }),
      getStateBackupAccount: async () => ({ ...accountStatus, recovery_mode: localLegacy ? 'account_recovery_v1' : 'private_key_v1' }),
    })
    await app.settle(); await app.click('Check signed-in account')
    assert.match(app.text(), /older recovery identity/)
    assert.match(app.text(), /Email sign-in alone cannot unlock/)
    assert.equal(app.button('Set up encrypted backup').props.disabled, true)
    assert.equal(app.input(), undefined)
    app.unmount()
  }
})

test('listener failures block cloud operations and closing/reopening can retry subscriptions', async () => {
  let failed = true
  const app = mount({}, async () => { if (failed) throw Error('event unavailable'); return () => {} })
  await app.settle()
  assert.equal(app.button('Check signed-in account').props.disabled, true)
  assert.match(app.text(), /Could not watch account changes/)
  failed = false
  await app.open(false); await app.open(true)
  assert.equal(app.button('Check signed-in account').props.disabled, false)
  app.unmount()
})

test('cross-account local state blocks setup and restore without uploading or changing ownership', async () => {
  const app = mount({
    getStateBackupStatus: async () => ({ ...localStatus, ownerAccountId: 'different-account' }),
    getStateBackupAccount: async () => ({ ...accountStatus, device_id: 'this-device', latest_snapshot_id: 'snapshot-one' }),
  })
  await app.settle(); await app.click('Check signed-in account')
  assert.match(app.text(), /This local GBrain belongs to another Knapsack account/)
  assert.equal(app.button('Set up encrypted backup'), undefined)
  assert.equal(app.button('Restore latest backup'), undefined)
  assert.equal(app.calls.some(call => ['enableStateBackup', 'restoreStateBackup', 'backUpStateNow'].includes(call.name)), false)
  app.unmount()
})

test('successful restore completing after Settings closes preserves the restart warning', async () => {
  let finish
  const app = mount({
    getStateBackupAccount: async () => ({ ...accountStatus, device_id: 'other-device', latest_snapshot_id: 'snapshot-one' }),
    restoreStateBackup: () => new Promise(resolve => { finish = resolve }),
  })
  await app.settle(); await app.click('Check signed-in account'); await app.click('Restore latest backup')
  await app.check('I understand this switches'); await app.click('Restore and switch this GBrain')
  await app.open(false)
  finish({ ...localStatus, brainRoot: '/private/restored-generation' }); await app.settle()
  await app.open(true)
  assert.match(app.text(), /Restart Knapsack to use the restored GBrain/)
  assert.equal(app.input(), undefined)
  assert.equal(app.button('Check signed-in account'), undefined)
  app.unmount()
})

test('portal unmount and remount cannot overlap a native operation or hide completed restore', async () => {
  let finish
  const app = mount({
    getStateBackupAccount: async () => ({ ...accountStatus, device_id: 'other-device', latest_snapshot_id: 'snapshot-one' }),
    restoreStateBackup: () => new Promise(resolve => { finish = resolve }),
  })
  await app.settle(); await app.click('Check signed-in account'); await app.click('Restore latest backup')
  await app.check('I understand this switches'); await app.click('Restore and switch this GBrain')
  await app.remount()
  assert.equal(app.button('Check signed-in account').props.disabled, true)
  assert.equal(app.input(), undefined)
  finish({ ...localStatus, brainRoot: '/private/restored-generation' }); await app.settle()
  assert.match(app.text(), /Restart Knapsack to use the restored GBrain/)
  await app.remount()
  assert.match(app.text(), /Restart Knapsack to use the restored GBrain/)
  assert.equal(app.button('Check signed-in account'), undefined)
  assert.equal(app.calls.filter(call => call.name === 'restoreStateBackup').length, 1)
  app.unmount()
})

test('restore rejection after committed root change re-reads status and preserves a restart warning', async () => {
  let current = localStatus
  const app = mount({
    getStateBackupStatus: async () => current,
    getStateBackupAccount: async () => ({ ...accountStatus, device_id: 'other-device', latest_snapshot_id: 'snapshot-one' }),
    restoreStateBackup: async () => {
      current = { ...localStatus, brainRoot: '/private/committed-generation' }
      throw 'State committed, but disk durability could not be confirmed. Restart Knapsack and check backup status.'
    },
  })
  await app.settle(); await app.click('Check signed-in account'); await app.click('Restore latest backup')
  await app.check('I understand this switches')
  const previousReads = app.calls.filter(call => call.name === 'getStateBackupStatus').length
  await app.click('Restore and switch this GBrain')
  assert.equal(app.calls.filter(call => call.name === 'getStateBackupStatus').length, previousReads + 1)
  assert.match(app.text(), /Active local folder:.*committed-generation/)
  assert.match(app.text(), /disk durability could not be confirmed/)
  assert.match(app.text(), /active local GBrain changed or could not be verified/)
  assert.equal(app.button('Check signed-in account'), undefined)
  assert.equal(app.input(), undefined)
  await app.remount()
  assert.match(app.text(), /Restart Knapsack and check backup status before continuing/)
  assert.match(app.text(), /Active local folder:.*committed-generation/)
  app.unmount()
})

test('ordinary failed restore with unchanged root remains retryable and never claims success', async () => {
  const app = mount({
    getStateBackupAccount: async () => ({ ...accountStatus, device_id: 'other-device', latest_snapshot_id: 'snapshot-one' }),
    restoreStateBackup: async () => { throw 'Verified account recovery failed' },
  })
  await app.settle(); await app.click('Check signed-in account'); await app.click('Restore latest backup')
  await app.check('I understand this switches'); await app.click('Restore and switch this GBrain')
  assert.match(app.text(), /Verified account recovery failed/)
  assert.doesNotMatch(app.text(), /Backup restored/)
  assert.equal(app.button('Check signed-in account').props.disabled, false)
  assert.equal(app.input(), undefined)
  app.unmount()
})

test('failed restore with unreadable local status blocks further mutations pending restart', async () => {
  let failed = false
  const app = mount({
    getStateBackupStatus: async () => { if (failed) throw 'Cannot read state'; return localStatus },
    getStateBackupAccount: async () => ({ ...accountStatus, device_id: 'other-device', latest_snapshot_id: 'snapshot-one' }),
    restoreStateBackup: async () => { failed = true; throw 'State write failed' },
  })
  await app.settle(); await app.click('Check signed-in account'); await app.click('Restore latest backup')
  await app.check('I understand this switches'); await app.click('Restore and switch this GBrain')
  assert.match(app.text(), /Local GBrain status could not be verified/)
  assert.match(app.text(), /Restart Knapsack and check backup status before continuing/)
  assert.equal(app.button('Check signed-in account'), undefined)
  assert.equal(app.input(), undefined)
  app.unmount()
})

test('disable reports a failed account-side change accurately while confirming local backup stopped', async () => {
  const app = mount({
    getStateBackupStatus: async () => ({ ...localStatus, enabled: true }),
    disableStateBackup: async () => ({ ...localStatus, lastError: 'Local backup is off; server could not be reached' }),
  })
  await app.settle(); await app.click('Disable cloud backup')
  assert.match(app.text(), /Backups stopped on this computer/)
  assert.match(app.text(), /account-side change could not be confirmed/)
  assert.equal(app.button('Disable cloud backup'), undefined)
  app.unmount()
})

test('Cancel clears account-recovery and upload opt-ins without enabling cloud backup', async () => {
  const app = mount(); await setup(app)
  await app.check('I understand Knapsack can recover')
  await app.check('I want encrypted GBrain'); await app.check('Enable automatic backups')
  await app.click('Cancel'); await app.click('Set up encrypted backup')
  assert.equal(app.checkbox('I understand Knapsack can recover').props.checked, false)
  assert.equal(app.checkbox('I want encrypted GBrain').props.checked, false)
  assert.equal(app.checkbox('Enable automatic backups').props.checked, false)
  assert.equal(app.calls.some(call => call.name === 'enableStateBackup'), false)
  app.unmount()
})

test('generic historical-reference warnings appear as local review notices without implying failure or success', async () => {
  const warnings = [
    'Some historical observations refer to removed goal key results.',
    'Some historical runs no longer have an optional candidate reference.',
  ]
  const app = mount({ getStateBackupStatus: async () => ({ ...localStatus, warnings }) })
  await app.settle()
  const notice = app.elements().find(el => el.type === 'aside' && el.props['aria-labelledby'] === 'state-backup-review-title')
  assert.ok(notice)
  assert.match(app.text(notice), /Local state review notices/)
  assert.match(app.text(notice), /preserved as inert evidence/)
  for (const warning of warnings) assert.ok(app.text(notice).includes(warning))
  assert.equal(app.elements(notice).filter(el => el.type === 'li').length, 2)
  assert.equal(app.elements().some(el => el.props.role === 'alert' || el.props.role === 'status'), false)
  assert.equal(app.button('Check signed-in account').props.disabled, false)
  assert.deepEqual(app.calls.map(call => call.name), ['getStateBackupStatus'])
  app.unmount()
})

test('older native status without warnings and empty warnings omit review notices', async () => {
  for (const value of [localStatus, { ...localStatus, warnings: [] }, { ...localStatus, warnings: [' ', ''] }]) {
    const app = mount({ getStateBackupStatus: async () => value })
    await app.settle()
    assert.doesNotMatch(app.text(), /Local state review notices/)
    assert.equal(app.button('Check signed-in account').props.disabled, false)
    app.unmount()
  }
})

test('UI and API contain no key persistence, clipboard writes, browser fetch, or analytics', () => {
  const implementation = source('api/stateBackup.ts') + source('components/organisms/StateBackupControl.tsx')
  assert.doesNotMatch(implementation, /localStorage|sessionStorage|navigator\.clipboard|console\.|KNAnalytics|fetch\(/)
  const api = loadApi(async () => undefined)
  assert.equal(api.stateBackupErrorMessage(`Unexpected secret ${key}`), 'Unexpected secret [redacted]')
  assert.doesNotMatch(implementation, /generateStateBackupKey|isStateBackupKey|recoveryKey|confirmSaved|state-backup-key/)
})

test('recovery identity verification installs metadata without enabling or restoring work', async () => {
  const app = mount()
  await app.settle()
  await app.click('Verify Google recovery identity')
  assert.equal(app.calls.filter(c => c.name === 'verifyStateBackupIdentity').length, 1)
  assert.deepEqual(app.calls.find(c => c.name === 'verifyStateBackupIdentity').args, ['google'])
  assert.equal(app.calls.filter(c => ['enableStateBackup','restoreStateBackup','backUpStateNow','migrateLegacyStateBackup'].includes(c.name)).length, 0)
})

test('closing a pending identity verification cancels it and never creates work', async () => {
  let finish
  const app = mount({ verifyStateBackupIdentity: () => new Promise(resolve => { finish = resolve }) })
  await app.settle()
  await app.click('Verify Microsoft recovery identity')
  await app.open(false)
  assert.ok(app.calls.some(c => c.name === 'cancelStateBackupIdentity'))
  finish(accountStatus)
  await app.settle()
  assert.equal(app.calls.filter(c => ['enableStateBackup','restoreStateBackup','backUpStateNow'].includes(c.name)).length, 0)
})

test('device selection only reviews; offline source can continue a pinned saved checkpoint', async () => {
  const app = mount()
  await app.settle()
  await app.click('Check computers')
  assert.equal(app.calls.filter(c => c.name === 'getAccountDevices').length, 1)
  const source = app.elements().find(el => el.type === 'button' && app.text(el).startsWith('Mac Studio'))
  source.props.onClick(); await app.settle()
  assert.match(app.text(), /source may be offline/)
  assert.match(app.text().replace(/\s+/g, ' '), /Running on Mac Studio remotely is unavailable/)
  assert.equal(app.calls.filter(c => c.name === 'restoreStateBackup').length, 0)
  assert.equal(app.button('Continue checkpoint on this computer').props.disabled, true)
  await app.check('I reviewed this checkpoint')
  await app.click('Continue checkpoint on this computer')
  assert.deepEqual(plain(app.calls.find(c => c.name === 'restoreStateBackup').args[0]), {
    snapshotId: 'source-snapshot', confirmReplace: true, expectedEpoch: 3, expectedRevision: 7, expectedSourceDevice: 'source-device',
  })
  assert.match(app.text(), /Restart/)
  assert.equal(app.calls.filter(c => c.name === 'enableStateBackup').length, 0)
})

test('selecting this computer or a stale checkpoint cannot start a handoff', async () => {
  const app = mount({ getAccountDevices: async () => ({ ...deviceDirectory, checkpoint: { ...deviceDirectory.checkpoint, revision: 6 } }) })
  await app.settle(); await app.click('Check computers')
  for (const name of ['MacBook','Mac Studio']) {
    app.elements().find(el => el.type === 'button' && app.text(el).startsWith(name)).props.onClick()
    await app.settle()
    if (name === 'MacBook') {
      assert.equal(app.button('Continue checkpoint on this computer'), undefined)
      assert.match(app.text(), /already working on this computer/)
    } else {
      assert.equal(app.button('Continue checkpoint on this computer').props.disabled, true)
      assert.equal(app.checkbox('I reviewed this checkpoint').props.disabled, true)
    }
  }
  assert.equal(app.calls.filter(c => c.name === 'restoreStateBackup').length, 0)
})

test('account switch clears computer metadata and reviewed consent', async () => {
  const app = mount(); await app.settle(); await app.click('Check computers')
  app.elements().find(el => el.type === 'button' && app.text(el).startsWith('Mac Studio')).props.onClick()
  await app.settle(); await app.check('I reviewed this checkpoint')
  await app.emit('knapsack-disconnected')
  assert.doesNotMatch(app.text(), /Selected: Mac Studio/)
  assert.equal(app.button('Continue checkpoint on this computer'), undefined)
  assert.equal(app.calls.filter(c => c.name === 'restoreStateBackup').length, 0)
})

test('registration is explicit and repeated clicks cannot queue mutations', async () => {
  let finish
  const app = mount({ registerAccountDevice: () => new Promise(resolve => { finish = resolve }) })
  await app.settle(); await app.click('Check computers')
  assert.equal(app.calls.filter(c => c.name === 'registerAccountDevice').length, 0)
  const register = app.button('Add or rename this computer')
  register.props.onClick(); register.props.onClick(); await app.settle()
  assert.equal(app.calls.filter(c => c.name === 'registerAccountDevice').length, 1)
  await app.open(false)
  finish(deviceDirectory); await app.settle(); await app.open(true)
  assert.doesNotMatch(app.text(), /Mac Studio/)
})


test('closing a pending continuation cancels the operation and never replays consent', async () => {
  let rejectRestore
  const app = mount({ restoreStateBackup: () => new Promise((_, reject) => { rejectRestore = reject }) })
  await app.settle(); await app.click('Check computers')
  app.elements().find(el => el.type === 'button' && app.text(el).startsWith('Mac Studio')).props.onClick()
  await app.settle(); await app.check('I reviewed this checkpoint')
  await app.click('Continue checkpoint on this computer')
  await app.open(false)
  assert.ok(app.calls.some(c => c.name === 'cancelStateBackupOperation'))
  rejectRestore(Error('Operation cancelled')); await app.settle(); await app.open(true)
  assert.equal(app.calls.filter(c => c.name === 'restoreStateBackup').length, 1)
  assert.doesNotMatch(app.text(), /Selected: Mac Studio/)
})


test('collapsing backup settings clears consent without enabling or restoring work', async () => {
  const app = mount(); await setup(app)
  await app.check('I understand Knapsack can recover')
  await app.check('I want encrypted GBrain')
  const settings = app.elements().find(el => el.type === 'details' && app.text(el).startsWith('Backup settings'))
  const closed = { open: false }; settings.props.onToggle({ target: closed, currentTarget: closed }); await app.settle()
  assert.equal(app.button('Enable encrypted backup'), undefined)
  assert.ok(app.calls.some(call => call.name === 'cancelStateBackupIdentity'))
  assert.equal(app.calls.some(call => ['enableStateBackup', 'restoreStateBackup'].includes(call.name)), false)
  await setup(app)
  assert.equal(app.checkbox('I understand Knapsack can recover').props.checked, false)
  assert.equal(app.checkbox('I want encrypted GBrain').props.checked, false)
  app.unmount()
})

test('collapsing backup settings cancels a pending restore and rejects its late result', async () => {
  let finish
  const app = mount({ getStateBackupAccount: async () => ({ ...accountStatus, device_id: 'other-device', latest_snapshot_id: 'saved' }), restoreStateBackup: () => new Promise(resolve => { finish = resolve }) })
  await app.settle(); await app.click('Check signed-in account'); await app.click('Restore latest backup')
  await app.check('I understand this switches'); await app.click('Restore and switch this GBrain')
  const settings = app.elements().find(el => el.type === 'details' && app.text(el).startsWith('Backup settings'))
  const closed = { open: false }; settings.props.onToggle({ target: closed, currentTarget: closed }); await app.settle()
  assert.ok(app.calls.some(call => call.name === 'cancelStateBackupOperation'))
  finish({ ...localStatus, brainRoot: '/private/restored-generation' }); await app.settle()
  assert.equal(app.calls.filter(call => call.name === 'restoreStateBackup').length, 1)
  assert.equal(app.button('Restore and switch this GBrain'), undefined)
  assert.match(app.text(), /Restart Knapsack/)
  app.unmount()
})
