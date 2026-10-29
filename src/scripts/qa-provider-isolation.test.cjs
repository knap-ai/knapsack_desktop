const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const source = file => fs.readFileSync(path.join(__dirname, '../src-tauri/src', file), 'utf8')

test('all adjacent provider/service mutations stop before handler side effects', () => {
  const service = source('clawd/service.rs')
  const routes = [...service.matchAll(/#\[(post|put|delete)\("([^"]+)"\)\]\s*pub async fn (\w+)/g)]
    .filter(match => match[2].startsWith('/api/clawd/service/') || match[2].startsWith('/api/knapsack/ollama/'))
  assert.ok(routes.length >= 16)
  for (const match of routes) {
    const declaration = service.indexOf(`fn ${match[3]}(`)
    const body = service.slice(service.indexOf('{', declaration) + 1)
    assert.match(body, /^\s*if crate::qa_launch::is_synthetic_build\(\) \{ return crate::qa_api::denied\(\); \}/, match[2])
  }
})
test('token persistence, propagation, candidate discovery and model metadata have compiled QA guards', () => {
  const service = source('clawd/service.rs')
  for (const name of ['save_tokens', 'sync_portable_api_key_auth_profiles', 'sync_portable_api_key_auth_config', 'privacy_provider_candidates', 'propagate_llm_keys_to_env', 'fetch_ollama_model_runtime_details']) {
    const declaration = service.indexOf(`fn ${name}(`)
    assert.ok(declaration >= 0, name)
    const body = service.slice(service.indexOf('{', declaration) + 1)
    assert.match(body, /^\s*if crate::qa_launch::is_synthetic_build\(\) \{ return/, name)
  }
})
function assertHttpIsolationOrder(auth) {
  auth = auth.replace(/\r\n/g, '\n')
  const call = auth.slice(auth.indexOf('  fn call(&self, req: ServiceRequest)'))
  const policy = call.indexOf('crate::qa_api::response_for(')
  const authorization = call.indexOf('if !request_is_authorized(')
  const dispatch = call.indexOf('service\n        .call(req)')
  assert.ok(authorization >= 0 && dispatch >= 0)
  assert.ok(policy > authorization && policy < dispatch)
  assert.match(call, /req\.path\(\), req\.method\(\)\.as_str\(\), crate::qa_launch::is_synthetic_build\(\)/)
}
test('HTTP isolation intercepts authorized requests before route execution', () => {
  assertHttpIsolationOrder(source('server/auth.rs'))
})
test('HTTP isolation order remains enforced with Windows checkout line endings', () => {
  assertHttpIsolationOrder(source('server/auth.rs').replace(/\r?\n/g, '\r\n'))
})
test('HTTP isolation order check still rejects a missing policy or dispatch', () => {
  const auth = source('server/auth.rs')
  assert.throws(() => assertHttpIsolationOrder(auth.replace('crate::qa_api::response_for(', 'missing_policy(')))
  assert.throws(() => assertHttpIsolationOrder(auth.replace(/service\s*\.call\(req\)/, 'missing_dispatch(req)')))
})

test('public sign-in callback and exchange reject compiled QA before HTTP or storage', () => {
  const service = source('clawd/service.rs')
  for (const name of ['knapsack_auth_callback', 'exchange_and_store_knapsack_code', 'exchange_knapsack_code']) {
    const declaration = service.indexOf(`fn ${name}(`)
    assert.ok(declaration >= 0, name)
    const body = service.slice(service.indexOf('{', declaration) + 1)
    assert.match(body, /^\s*if crate::qa_launch::is_synthetic_build\(\) \{ return/, name)
  }
  const policy = source('qa_api.rs')
  assert.match(policy, /path\.starts_with\("\/api\/auth\/"\)/)
})
