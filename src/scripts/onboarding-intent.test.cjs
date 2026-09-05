const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

async function loadModule(initialUrl = null) {
  const filename = new URL('../src/utils/onboardingIntent.ts', `file://${__filename}`)
  const source = (await fs.readFile(filename, 'utf8')).replace(
    "import { listen } from '@tauri-apps/api/event'",
    'const listen = async () => () => {}',
  ).replace(
    "import { invoke } from '@tauri-apps/api/tauri'",
    `const invoke = async () => ${JSON.stringify(initialUrl)}`,
  )
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const storage = new Map()
  const dispatchedEvents = []
  const module = { exports: {} }
  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    URL,
    Date,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key),
    },
    window: { dispatchEvent(event) { dispatchedEvents.push(event) } },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail } },
  })
  return { api: module.exports, storage, dispatchedEvents }
}

test('UTM-only paid activation is reported once', async () => {
  const { api, storage } = await loadModule()
  const intent = api.parseDeepLink(
    'knapsack://onboard?role=executive-assistant&utm_source=google&utm_medium=cpc&utm_campaign=desktop',
  )
  assert.ok(intent)
  storage.set('ks_onboarding_intent', JSON.stringify(intent))

  assert.equal(api.getActivationAttribution().utm_campaign, 'desktop')
  api.markActivationTracked()
  assert.equal(api.getActivationAttribution(), null)
})

test('organic UTM intent is not reported as a paid activation', async () => {
  const { api, storage } = await loadModule()
  const intent = api.parseDeepLink(
    'knapsack://onboard?role=executive-assistant&utm_source=google&utm_medium=organic',
  )
  storage.set('ks_onboarding_intent', JSON.stringify(intent))
  assert.equal(api.getActivationAttribution(), null)
})

test('paid investment research intent gets a focused starter task', async () => {
  const { api, storage } = await loadModule()
  const intent = api.parseDeepLink(
    'knapsack://onboard?role=investment-research-analyst&gclid=paid-click',
  )
  storage.set('ks_onboarding_intent', JSON.stringify(intent))

  const starter = api.getPaidStarter()
  assert.equal(starter.title, 'Investment Research Analyst')
  assert.match(starter.prompt, /attach a filing or earnings release/i)

  api.savePaidStarter(starter)
  assert.deepEqual(api.getSavedPaidStarter(), starter)
  api.markActivationTracked()
  assert.equal(api.getSavedPaidStarter(), null)
})

test('organic investment research intent keeps the standard onboarding', async () => {
  const { api, storage } = await loadModule()
  const intent = api.parseDeepLink('knapsack://onboard?role=investment-research-analyst')
  storage.set('ks_onboarding_intent', JSON.stringify(intent))
  assert.equal(api.getPaidStarter(), null)
})

test('cold-start protocol URL is consumed from the initial process argument', async () => {
  const initialUrl =
    'knapsack://onboard?role=investment-research-analyst&gclid=cold-start-click'
  const { api, storage, dispatchedEvents } = await loadModule(initialUrl)

  await api.initOnboardingIntent()

  const stored = JSON.parse(storage.get('ks_onboarding_intent'))
  assert.equal(stored.role, 'investment-research-analyst')
  assert.equal(stored.gclid, 'cold-start-click')
  assert.equal(dispatchedEvents[0].type, 'knapsack-onboarding-intent')
})
