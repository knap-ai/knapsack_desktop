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
  const goalsPanel = fs.readFileSync(
    path.join(sourceRoot, 'src/components/organisms/GBrainView/GoalsPanel.tsx'),
    'utf8',
  )

  assert.match(model, /pub fn needs_goal_index_backfill\(account_email: &str\)/)
  assert.match(model, /drive_goal_index_backfills/)
  assert.match(model, /SELECT NOT EXISTS\([\s\S]*?drive_goal_index_backfills/)
  assert.match(model, /drive_goal_index_backfill_attempts/)
  assert.match(model, /strftime\('%s','now'\) - 86400/)
  assert.match(model, /pub fn mark_goal_index_backfill_complete\(account_email: &str\)/)
  assert.match(drive, /let backfill_goal_index = DriveDocument::needs_goal_index_backfill\(&account_email\)/)
  assert.match(drive, /running one-time local goal-index backfill/)
  assert.match(drive, /if backfill_goal_index \{[\s\S]*?String::new\(\)/)
  assert.match(drive, /Result<Option<Vec<String>>, \(\)>/)
  assert.match(drive, /let \(mut all_documents, mut backfill_content_fetches_succeeded\)/)
  assert.match(drive, /if backfill_goal_index && backfill_content_fetches_succeeded \{/)
  assert.match(drive, /deferred goal-index backfill completion/)
  assert.match(drive, /DriveDocument::mark_goal_index_backfill_complete\(&account_email\)/)
  assert.match(drive, /DriveDocument::record_goal_index_backfill_attempt\(&account_email\)/)
  assert.match(drive, /Could not refresh the local Drive text index[\s\S]*?return \(drive_document, false\)/)
  assert.match(drive, /async fn list_accessible_shared_drives[\s\S]*?\(Vec<SharedDrive>, bool\)/)
  assert.match(drive, /return \(shared_drives, false\)/)
  assert.match(drive, /backfill_content_fetches_succeeded &= shared_drive_enumeration_succeeded/)
  assert.match(goalsPanel, /User-provided planning note/)
  assert.match(goalsPanel, /const fixedEvidence/)
  assert.match(goalsPanel, /const connectedBudget/)
  assert.doesNotMatch(goalsPanel, /evidence\.slice\(0, 30000\)/)
  const email = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/db/models/email.rs'),
    'utf8',
  )
  assert.match(email, /email\.body\.trim\(\)\.is_empty\(\)/)
  assert.match(email, /email\.body\.len\(\)\.max\(1\)/)
  assert.match(email, /pub fn find_goal_evidence\(limit: usize\) -> Result<Vec<Email>>/)
  assert.match(email, /email\.body = body/)
  assert.match(email, /connection\.prepare\([\s\S]*?\?;/)
  assert.match(email, /FROM emails WHERE COALESCE\(is_deleted, 0\) = 0 ORDER BY date DESC LIMIT 500/)
  const goals = fs.readFileSync(path.join(sourceRoot, 'src-tauri/src/clawd/goals.rs'), 'utf8')
  assert.match(goals, /Could not search the synced Gmail index/)
})
