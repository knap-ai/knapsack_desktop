const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const sourceRoot = path.resolve(__dirname, '..')

test('Slack configuration uses named accounts and preserves sibling workspaces', () => {
  const channels = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/clawd/channels.rs'),
    'utf8',
  )

  assert.match(channels, /channels\/slack\/accounts/)
  assert.match(channels, /obj\.remove\("accountId"\)/)
  assert.match(channels, /channel_config\["accounts"\]\[account_id\] = account_config/)
  assert.match(channels, /accounts\"\]\[&account_id\] = serde_json::Value::Null/)
  assert.match(channels, /removing_last_workspace/)
  assert.match(channels, /"slack": null/)
  assert.match(channels, /"signingSecret": null/)
  assert.match(channels, /is_legacy_default && named_account_count == 0/)
})

test('Slack UI can add and remove workspaces independently', () => {
  const chat = fs.readFileSync(
    path.join(sourceRoot, 'src/components/organisms/ClawdChat/index.tsx'),
    'utf8',
  )
  const api = fs.readFileSync(path.join(sourceRoot, 'src/api/channels.ts'), 'utf8')

  assert.match(chat, /Add another Slack workspace/)
  assert.match(chat, /accountId: workspaceId/)
  assert.match(chat, /disconnectSlackAccount\(account\.id\)/)
  assert.match(chat, /slackAccounts\.length === 0 \|\| showSlackAdd/)
  assert.match(api, /getSlackAccounts/)
  assert.match(api, /disconnectSlackAccount/)
})

test('Slack account inventory never serializes credential fields', () => {
  const channels = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/clawd/channels.rs'),
    'utf8',
  )
  const summary = channels.slice(
    channels.indexOf('struct SlackAccountSummary'),
    channels.indexOf('fn valid_channel_account_id'),
  )

  assert.doesNotMatch(summary, /bot_token|app_token|botToken|appToken/)
})
