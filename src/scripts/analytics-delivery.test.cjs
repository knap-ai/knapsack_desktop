const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

async function loadModule({ trackCode = 200, flushRejects = false } = {}) {
  const filename = new URL('../src/utils/KNAnalytics.ts', `file://${__filename}`)
  let source = await fs.readFile(filename, 'utf8')
  source = source
    .replace("import * as amplitude from '@amplitude/analytics-browser'", "const amplitude = { Identify: class { set() {} } }")
    .replace("import { getAppVersion, getOSInfoString } from '../utils/app'", "const getAppVersion = async () => 'test'; const getOSInfoString = async () => 'test-os'")
    .replace("import { ampli, ApiKey, DefaultConfiguration } from '../ampli'", `
      const ampli = {
        load: () => ({ promise: Promise.resolve() }),
        client: { setGroup() {} },
        amplitude: {
          identify: () => ({ promise: Promise.resolve({ code: 200 }) }),
          logEvent: event => {
            analyticsTestResults.events.push(event);
            return { promise: Promise.resolve({ code: ${trackCode} }) };
          },
        },
        flush: () => {
          analyticsTestResults.flushCalls += 1;
          return {
            promise: ${flushRejects ? "Promise.reject(new Error('flush failed'))" : 'Promise.resolve()'},
          };
        },
      };
      const ApiKey = { default: 'test-key' };
      const DefaultConfiguration = {};
    `)
    .replace("import { extractDomain } from '../utils/emails'", "const extractDomain = email => email.split('@')[1]")

  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  const analyticsTestResults = { events: [], flushCalls: 0 }
  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    analyticsTestResults,
    console,
    Promise,
    setTimeout,
    clearTimeout,
  })
  const Analytics = module.exports.default
  Analytics.TEST_RESULTS = analyticsTestResults
  return Analytics
}

test('queued delivery resolves true only after initialization sends and flushes', async () => {
  const Analytics = await loadModule()
  const delivery = Analytics.trackEventAndFlush('desktop_paid_activation', { gclid: 'paid' })
  await Analytics.initAnalytics('', 'device-id', '')
  assert.equal(await delivery, true)
})

test('failed flush leaves activation delivery unconfirmed', async () => {
  const Analytics = await loadModule({ flushRejects: true })
  const delivery = Analytics.trackEventAndFlush('desktop_paid_activation', { gclid: 'paid' })
  await Analytics.initAnalytics('', 'device-id', '')
  assert.equal(await delivery, false)
})

test('rejected event leaves activation delivery unconfirmed', async () => {
  const Analytics = await loadModule({ trackCode: 400 })
  const delivery = Analytics.trackEventAndFlush('desktop_paid_activation', { gclid: 'paid' })
  await Analytics.initAnalytics('', 'device-id', '')
  assert.equal(await delivery, false)
})

test('pre-initialization delivery wait is bounded and removed from the queue', async () => {
  const Analytics = await loadModule()
  Analytics.PENDING_EVENT_TIMEOUT_MS = 1
  const delivered = await Analytics.trackEventAndFlush('desktop_paid_activation', {
    gclid: 'paid',
  })
  assert.equal(delivered, false)
  assert.equal(Analytics.PENDING_EVENTS.length, 0)
})

test('ordinary queued events retain the SDK retry path without an explicit flush', async () => {
  const Analytics = await loadModule()
  Analytics.trackEvent('ordinary_event', {})
  await Analytics.initAnalytics('', 'device-id', '')
  assert.deepEqual(Analytics.TEST_RESULTS.events, ['ordinary_event'])
  assert.equal(Analytics.TEST_RESULTS.flushCalls, 0)
})
