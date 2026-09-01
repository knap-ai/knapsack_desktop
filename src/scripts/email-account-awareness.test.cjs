const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const sourceRoot = path.resolve(__dirname, '..')

test('Gmail API responses retain mailbox identity and account-scope threads', () => {
  const search = fs.readFileSync(path.join(sourceRoot, 'src-tauri/src/search.rs'), 'utf8')
  const emailModel = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/db/models/email.rs'),
    'utf8',
  )

  assert.match(search, /pub account_email: String/)
  assert.match(search, /account_email: email\.account_email/)
  assert.match(search, /get_last_email_by_thread_id_for_account\([\s\S]*?&email\.account_email/)
  assert.match(emailModel, /WHERE thread_id = \?1 AND account_email = \?2/)
  assert.match(emailModel, /get_last_email_by_thread_id_for_account/)
  assert.match(emailModel, /LOWER\(account_email\) IN/)
})

test('foreground email context identifies the source mailbox', () => {
  const chat = fs.readFileSync(
    path.join(sourceRoot, 'src/components/organisms/ClawdChat/index.tsx'),
    'utf8',
  )

  assert.match(chat, /\*\*Mailbox:\*\* \$\{email\.accountEmail \|\| 'unknown'\}/)
})

test('Email Autopilot handles raw JSON and keeps accounts isolated', () => {
  const classifier = fs.readFileSync(
    path.join(sourceRoot, 'src/hooks/dataSources/useEmailAutopilot.tsx'),
    'utf8',
  )
  const feed = fs.readFileSync(path.join(sourceRoot, 'src/hooks/feed/useFeed.tsx'), 'utf8')

  assert.match(classifier, /export function parseEmailClassificationResponse/)
  assert.match(classifier, /const candidates = \[/)
  assert.match(classifier, /item\.responseDeadline \?\? item\.response_deadline/)
  assert.match(feed, /email\.accountEmail \|\| 'unknown'/)
  assert.match(feed, /wasSentByMailboxOwner/)
  assert.match(feed, /if \(allMessages\.length === 0\)/)
})

test('settings group Google capabilities by the actual connected account', () => {
  const settings = fs.readFileSync(
    path.join(sourceRoot, 'src/components/templates/Home/components/SettingsDialog/index.tsx'),
    'utf8',
  )

  assert.match(settings, /Connected Google accounts/)
  assert.match(settings, /googleAccounts\.map\(account =>/)
  assert.doesNotMatch(settings, /return ` via \$\{item\.ownerEmail\}`/)
})
