const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const ts = require('typescript')

const sourcePath = path.join(__dirname, '../src/utils/meetingFollowUp.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: sourcePath,
}).outputText
const loaded = { exports: {} }
new Function('module', 'exports', 'require', compiled)(loaded, loaded.exports, require)

const {
  buildFollowUpEmailBody,
  buildFollowUpEmailSubject,
  filterFollowUpRecipients,
  sanitizeMeetingTitle,
} = loaded.exports

const hanwhaNotes = `# (PLACEHOLDER) Hanwha | Vault remediation status sync

# Summary
The team reviewed live journaling readiness, the remediation evidence pack, and the remaining penetration-test work.

## Highlights
- The evidence pack is ready for review, but live journaling still needs end-to-end confirmation.
- BW Cyber will schedule the web application penetration test later this week.

## Action Items
| Owner | Completed | Next step | Blocker |
| --- | --- | --- | --- |
| You | Built the detailed remediation evidence pack. | Support content updates and chatbot reactivation after live journaling is confirmed. | Awaiting BW Cyber pen-test completion and Hanwha mailbox confirmation. |
| Carlos Hernandez | Permissioned Young Ji Lee for the shared journaling mailbox. | Test mailbox population and help Young Ji Lee complete Outlook setup. | Microsoft propagation delay. |
| Robert Smith | Reviewed the remediation evidence pack. | Meet Gabriel to allocate resources for web application penetration testing. | Resource confirmation with Gabriel. |`

test('removes placeholder markers from follow-up subjects and body titles', () => {
  assert.equal(
    sanitizeMeetingTitle('(PLACEHOLDER) Hanwha | Vault remediation status sync'),
    'Hanwha | Vault remediation status sync',
  )
  assert.equal(
    buildFollowUpEmailSubject('(PLACEHOLDER) Hanwha | Vault remediation status sync'),
    'Follow-up: Hanwha | Vault remediation status sync',
  )
})

test('excludes the signed-in user and duplicate addresses from follow-up recipients', () => {
  const recipients = filterFollowUpRecipients([
    { name: 'Mark Heynen', email: 'mark@knap.ai' },
    { name: 'Carlos Hernandez', email: 'carlos.hernandez@hanwha.nyc' },
    { name: 'Carlos', email: 'CARLOS.HERNANDEZ@HANWHA.NYC' },
    { name: 'Robert Smith', email: 'robert.smith@bwcyberservices.com' },
  ], 'MARK@KNAP.AI', 'Mark Heynen')

  assert.deepEqual(recipients.map(recipient => recipient.email), [
    'carlos.hernandez@hanwha.nyc',
    'robert.smith@bwcyberservices.com',
  ])
})

test('builds a specific group follow-up from decisions, owners, next steps, and blockers', () => {
  const body = buildFollowUpEmailBody(
    hanwhaNotes,
    '(PLACEHOLDER) Hanwha | Vault remediation status sync',
    'Mark Heynen',
    'Carlos Hernandez',
    3,
  )

  assert.match(body, /<p>Hi all,<\/p>/)
  assert.match(body, /<strong>What we aligned on<\/strong>/)
  assert.match(body, /<strong>Next steps<\/strong>/)
  assert.match(body, /<strong>Mark:<\/strong> Support content updates and chatbot reactivation/)
  assert.match(body, /<strong>Carlos Hernandez:<\/strong> Test mailbox population/)
  assert.match(body, /<strong>Open dependencies<\/strong>/)
  assert.match(body, /Microsoft propagation delay/)
  assert.doesNotMatch(body, /PLACEHOLDER|Great meeting today|I’ll follow up on the next steps/)
})

test('meeting chat opts out of generic welcome messages and starter prompts', () => {
  const meetingSource = fs.readFileSync(
    path.join(__dirname, '../src/components/organisms/MeetingNotesMode/index.tsx'),
    'utf8',
  )
  const chatSource = fs.readFileSync(
    path.join(__dirname, '../src/components/organisms/ClawdChat/index.tsx'),
    'utf8',
  )

  assert.match(meetingSource, /title="Scout · Meeting chat"[\s\S]*?showWelcome=\{false\}/)
  assert.match(chatSource, /if \(!showWelcome\) return \[\]/)
  assert.match(chatSource, /showWelcome \|\| !m\.id\.startsWith\('welcome-'\)/)
})
