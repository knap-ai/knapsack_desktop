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
  assert.doesNotMatch(feed, /lastEmailId/)
  assert.match(feed, /accountEmail\?: string/)
  assert.match(feed, /email\.message\.accountEmail \|\| userEmail/)
  assert.match(feed, /updatedEmail\.message\.accountEmail/)
})

test('settings group Google capabilities by the actual connected account', () => {
  const settings = fs.readFileSync(
    path.join(sourceRoot, 'src/components/templates/Home/components/SettingsDialog/index.tsx'),
    'utf8',
  )

  assert.match(settings, /Connected Google accounts/)
  assert.match(settings, /googleAccounts\.map\(account =>/)
  assert.match(settings, /item\.calendarAccountEmail \|\| item\.ownerEmail/)
  assert.doesNotMatch(settings, /return ` via \$\{item\.ownerEmail\}`/)
})

test('Gmail actions and replies select the precise connected account', () => {
  const connectionsApi = fs.readFileSync(
    path.join(sourceRoot, 'src/api/connections.tsx'),
    'utf8',
  )
  const gmailService = fs.readFileSync(path.join(sourceRoot, 'src/utils/gmailService.ts'), 'utf8')
  const gmailBackend = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/connections/google/gmail.rs'),
    'utf8',
  )
  const authBackend = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/connections/google/auth.rs'),
    'utf8',
  )

  assert.match(connectionsApi, /accountEmail\?: string/)
  assert.match(connectionsApi, /query\.set\('account_email', accountEmail\)/)
  assert.match(gmailService, /ConnectionKeys\.GOOGLE_GMAIL,[\s\S]*?senderEmail/)
  assert.match(gmailBackend, /account_email: Option<String>/)
  assert.match(gmailBackend, /find_by_user_email_scope_and_calendar_account/)
  assert.match(authBackend, /account_email: Option<String>/)
  assert.match(authBackend, /find_by_user_email_scope_and_calendar_account/)
})
