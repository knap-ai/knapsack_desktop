const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../src-tauri/src/clawd')
const boundaries = {
  'gateway_client.rs': ['connect_and_handshake', 'get_or_connect', 'gateway_request_pooled_inner', 'gateway_request_agent_inner', 'resolve_token', 'ensure_gateway_best_effort', 'spawn_reconnect_task', 'ensure_reconnect_if_needed', 'ensure_gateway_and_wait', 'apply_runtime_browser_config', 'is_gateway_port_open', 'gateway_ws_handshake_open', 'ensure_browser_config', 'get_gateway_token', 'read_token_from_config'],
  'gateway_ws.rs': ['gateway_request_once', 'gateway_request', 'get_gateway_token', 'read_token_from_json', 'ensure_gateway_best_effort'],
  'gateway_supervisor.rs': ['is_gateway_healthy', 'wait_for_gateway_ready'],
  'session_watcher.rs': ['spawn', 'poll_once'],
}
for (const [file, names] of Object.entries(boundaries)) {
  test(`${file}: QA stops before connection, credential, config, task or probe side effects`, () => {
    const source = fs.readFileSync(path.join(root, file), 'utf8')
    for (const name of names) {
      const declaration = source.indexOf(`fn ${name}(`)
      assert.ok(declaration >= 0, name)
      const body = source.slice(source.indexOf('{', declaration) + 1)
      assert.match(body, /^\s*if super::service::qa_local_only_mode\(\) \{ return(?: [^;]*)?; \}/, name)
    }
  })
}
test('the boundary policy cannot be disabled by changing runtime environment on a compiled QA binary', () => {
  const service = fs.readFileSync(path.join(root, 'service.rs'), 'utf8')
  assert.match(service, /synthetic_build \|\| \(debug_build && qa_local_only_value\(value\)\)/)
  assert.match(service, /fn qa_local_only_mode\(\)[\s\S]*?crate::qa_launch::is_synthetic_build\(\)/)
})
