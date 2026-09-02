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
  assert.match(emailModel, /WHERE email_uid = \?11 AND account_email = \?13/)
  assert.match(emailModel, /get_last_email_by_thread_id_for_account/)
  assert.match(emailModel, /strip_prefix\("microsoft:"\)[\s\S]*?unwrap_or\(account_email\)/)
  assert.match(emailModel, /TRIM\(account_email\) = ''[\s\S]*?LOWER\(sender\) LIKE \?3/)
  assert.match(emailModel, /LOWER\(account_email\) IN/)
  assert.match(emailModel, /account_email[\s\S]*?\.strip_prefix\("microsoft:"\)/)
  assert.match(emailModel, /UPDATE emails SET account_email = \?2[\s\S]*?TRIM\(account_email\) = ''[\s\S]*?LOWER\(sender\) LIKE/)
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
  assert.match(classifier, /Email classifier omitted or duplicated one or more messages/)
  assert.match(classifier, /\): Promise<void> => new Promise\(resolve => \{/)
  assert.match(classifier, /await handleSuccessMessagesClassified/)
  assert.match(classifier, /await handleFailMessagesClassified/)
  assert.match(feed, /email\.accountEmail \|\| 'unknown'/)
  assert.match(feed, /wasSentByMailboxOwner/)
  assert.match(feed, /if \(allMessages\.length === 0\)/)
  assert.doesNotMatch(feed, /lastEmailId/)
  assert.match(feed, /successfullyClassifiedMessageKeys/)
  assert.match(feed, /importance === EmailImportance\.UNCLASSIFIED/)
  assert.match(feed, /failedMessageKeys/)
  assert.match(feed, /!failedMessageKeys\.has\(emailMessageKey\(email\.message\)\)/)
  assert.match(feed, /accountEmail\?: string/)
  assert.match(feed, /email\.message\.accountEmail \|\| userEmail/)
  assert.match(feed, /updatedEmail\.message\.accountEmail/)
  assert.match(feed, /const connectedEmailAccountEmails = useMemo/)
  assert.match(feed, /connection\.key === ConnectionKeys\.MICROSOFT_OUTLOOK/)
  assert.match(feed, /connection\.calendarAccountEmail \|\| connection\.ownerEmail/)
  assert.match(feed, /emailAccountAddress\(email\.accountEmail\.trim\(\)\.toLowerCase\(\)\)/)
  assert.match(feed, /draftEmailReply\([\s\S]*?emailAccountAddress\(email\.message\.accountEmail\)/)
  assert.match(feed, /let newMessages = allThreadMessages\.filter\([\s\S]*?!successfullyClassifiedMessageKeys\.has\(emailMessageKey\(message\)\)/)
  assert.match(feed, /const emailAutopilotRunRef = useRef<Promise<void> \| null>/)
  assert.match(feed, /const emailAutopilotRerunPendingRef = useRef\(false\)/)
  assert.match(feed, /if \(emailAutopilotRunRef\.current\) \{\s*emailAutopilotRerunPendingRef\.current = true/)
  assert.match(feed, /do \{[\s\S]*?await runEmailAutopilotOnce\(\)[\s\S]*?\} while \(emailAutopilotRerunPendingRef\.current\)/)
  assert.match(feed, /emailAutopilotCycleMessageKeysRef\.current\.has\(emailMessageKey\(message\)\)/)
  assert.match(feed, /emailAutopilotCycleMessageKeysRef\.current\.clear\(\)/)
  assert.match(feed, /await emailAutopilot\.classifyEmails/)
  assert.match(feed, /await executeClassification\(batch\)/)
  assert.ok((feed.match(/connectedEmailAccountEmails\.length > 0 \? connectedEmailAccountEmails : undefined/g) || []).length >= 2)
})

test('connection refresh preserves provider ownership metadata', () => {
  const connectionHook = fs.readFileSync(
    path.join(sourceRoot, 'src/hooks/connections/useConnections.tsx'),
    'utf8',
  )

  assert.match(connectionHook, /calendarAccountEmail, ownerEmail/)
  assert.match(connectionHook, /calendarAccountEmail, ownerEmail \}/)
})

test('full Email Autopilot preserves each message provider for actions', () => {
  const autopilot = fs.readFileSync(
    path.join(sourceRoot, 'src/components/molecules/EmailAutopilot/index.tsx'),
    'utf8',
  )

  assert.match(autopilot, /sourceProvider\?: ConnectionKeys\.GOOGLE_PROFILE/)
  assert.match(autopilot, /const provider = sourceProvider \|\|/)
  assert.match(autopilot, /profileProvider=\{email\.provider\}/)
  assert.match(autopilot, /onDraftGenerationComplete=\{\(\) => setGeneratingDraftKey\(''\)\}/)
  assert.match(autopilot, /selectedProvider[\s\S]*?selectedEmail\.accountEmail,[\s\S]*?selectedProvider/)
})

test('account-awareness does not delete legacy unscoped email history', () => {
  const migrationsRoot = path.join(sourceRoot, 'src-tauri/src/migrations')
  const migrationSql = fs
    .readdirSync(migrationsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry => ['up.sql', 'down.sql'].map(file => path.join(migrationsRoot, entry.name, file)))
    .filter(file => fs.existsSync(file))
    .map(file => fs.readFileSync(file, 'utf8'))
    .join('\n')

  assert.doesNotMatch(
    migrationSql,
    /DELETE\s+FROM\s+emails[\s\S]*?TRIM\(account_email\)\s*=\s*''/i,
  )
})

test('notification drawer preserves mailbox identity for actions', () => {
  const drawer = fs.readFileSync(
    path.join(sourceRoot, 'src/components/molecules/EmailNotificationDrawer/index.tsx'),
    'utf8',
  )

  assert.match(drawer, /const drawerEmailKey/)
  assert.match(drawer, /key=\{drawerEmailKey\(currentEmail, userEmail\)\}/)
  assert.match(drawer, /setGeneratingDraftKey\(drawerEmailKey\(currentEmail, userEmail\)\)/)
  assert.match(drawer, /onDraftGenerationComplete=\{\(\) => setGeneratingDraftKey\(''\)\}/)
  assert.match(drawer, /accountEmail\?: string/)
  assert.match(drawer, /sourceProvider\?: ConnectionKeys\.GOOGLE_PROFILE/)
  assert.match(drawer, /handleEmailActionTaken\([\s\S]*?sourceProvider/)
  assert.match(drawer, /profileProvider=\{currentEmail\.provider\}/)
  assert.match(drawer, /feed\.takeEmailAction\([\s\S]*?accountEmail/)
  assert.match(drawer, /setSessionDismissedIds\([\s\S]*?drawerEmailKey\(pendingEmail, userEmail\)/)
})

test('Outlook cache rows are mailbox-scoped for mixed-provider Autopilot', () => {
  const outlook = fs.readFileSync(
    path.join(sourceRoot, 'src-tauri/src/connections/microsoft/outlook.rs'),
    'utf8',
  )

  assert.match(outlook, /Email::find_by_uid_and_account\(&email_data\.id, account_email\)/)
  assert.match(outlook, /account_email: account_email\.to_string\(\)/)
  assert.match(outlook, /fetch_outlook_emails\(email\.clone\(\), update_user_connection\.token\.clone\(\), 7, true\)/)
  assert.match(outlook, /format!\("microsoft:\{\}", email\.trim\(\)\.to_ascii_lowercase\(\)\)/)
  assert.match(outlook, /Email::mark_deleted_emails\(&all_email_uuids, i64::from\(days\), &account_key\)/)
  assert.match(outlook, /Email::claim_unscoped_uid_for_account\(&email_data\.id, account_email\)/)
  assert.match(outlook, /if email_entry\.id\.is_some\(\)/)
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
