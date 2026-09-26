const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const sourceRoot = path.resolve(__dirname, '..')

test('legacy Drive documents receive one account-scoped goal-index backfill', () => {
  const model = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/db/models/drive_document.rs'),
    'utf8',
  )
  const drive = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/connections/google/drive.rs'),
    'utf8',
  )

  assert.match(model, /pub fn needs_goal_index_backfill\(account_email: &str\)/)
  assert.match(model, /drive_goal_index_backfills/)
  assert.match(model, /account_email = \?1 OR account_email = ''/)
  assert.match(model, /pub fn mark_goal_index_backfill_complete\(account_email: &str\)/)
  assert.match(drive, /let backfill_goal_index = DriveDocument::needs_goal_index_backfill\(&account_email\)/)
  assert.match(drive, /running one-time local goal-index backfill/)
  assert.match(drive, /if backfill_goal_index \{[\s\S]*?String::new\(\)/)
  assert.match(drive, /DriveDocument::mark_goal_index_backfill_complete\(&account_email\)/)
})
