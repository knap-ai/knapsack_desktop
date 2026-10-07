const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const root = path.resolve(__dirname, '..')
const service = fs.readFileSync(path.join(root, 'src-tauri/src/clawd/service.rs'), 'utf8')
const chat = fs.readFileSync(path.join(root, 'src/components/organisms/ClawdChat/index.tsx'), 'utf8')
const backup = fs.readFileSync(path.join(root, 'src-tauri/src/state_backup.rs'), 'utf8')
function section(source, start, end) { return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start))) }

test('account sign-in never silently chooses an inference provider', () => {
  const callback = section(service, 'async fn exchange_and_store_knapsack_code(', '#[derive(Deserialize)]\npub struct KnapsackCallbackQuery')
  assert.match(callback, /apply_knapsack_account_sign_in\(&mut tokens, &sign_in\)/)
  assert.doesNotMatch(callback, /tokens\.active_provider\s*=|set_var\("KNAPSACK_ACTIVE_PROVIDER"/)
  assert.match(callback, /save_tokens\(app_handle, &tokens\)\.map_err[\s\S]*?\?;/)
  const apply = section(service, 'fn apply_knapsack_account_sign_in(', 'async fn exchange_and_store_knapsack_code(')
  const written = [...apply.matchAll(/tokens\.([a-z_]+)\s*=/g)].map(row => row[1])
  assert.deepEqual(written.sort(), ['knapsack_access_token', 'knapsack_email', 'knapsack_model', 'knapsack_refresh_token'])
})

test('account disconnect preserves independent BYOK and local routing', () => {
  const disconnect = section(service, 'pub async fn knapsack_disconnect(', '#[derive(Debug, Serialize)]\npub struct StudioConnectionsResponse')
  assert.match(disconnect, /let provider_changed = tokens\.active_provider\.as_deref\(\) == Some\("knapsack"\)/)
  assert.match(disconnect, /else \{ tokens\.active_provider\.clone\(\) \}/)
  assert.match(disconnect, /if provider_changed \{[\s\S]*?set_var\("KNAPSACK_ACTIVE_PROVIDER"/)
  assert.match(chat, /if \(res\?\.provider_changed\) \{[\s\S]*?setSelectedProvider\(next\)/)
})

test('cloud inference selection remains an explicit existing user action', () => {
  assert.match(chat, /Your current AI provider stays selected until you choose Use Knapsack/)
  assert.match(chat, /set-api-key[^\n]*provider: 'knapsack'/)
  assert.match(service, /fn account_sign_in_preserves_byok_local_and_existing_provider_choices/)
})

test('account backup IPC never accepts or returns a raw data key', () => {
  assert.doesNotMatch(backup, /kn_state_backup_generate_key|pub async fn kn_state_backup_[^(]+\([^)]*(?:recovery_key|data_key)/)
  const reply = section(backup, 'struct ManagedKeyReply', 'impl Drop for ManagedKeyReply')
  assert.match(reply, /data_key_b64: String/)
  assert.match(backup, /impl Drop for ManagedKeyReply[\s\S]*?data_key_b64\.zeroize\(\)/)
  assert.doesNotMatch(backup, /RecoveryKey::generate/)
})
