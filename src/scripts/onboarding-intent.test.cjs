const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

async function loadModule() {
  const filename = new URL('../src/utils/onboardingIntent.ts', `file://${__filename}`)
  const source = (await fs.readFile(filename, 'utf8')).replace(
    "import { listen } from '@tauri-apps/api/event'",
    'const listen = async () => () => {}',
  )
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const storage = new Map()
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
    window: { dispatchEvent() {} },
    CustomEvent: class {},
  })
  return { api: module.exports, storage }
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
