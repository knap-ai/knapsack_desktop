const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const sourceRoot = path.resolve(__dirname, '..')
const read = (...segments) => fs.readFileSync(path.join(sourceRoot, ...segments), 'utf8')

test('meeting follow-up drafts exclude calendar resources and show the sender mailbox', () => {
  const emailUtils = read('src/utils/emails.tsx')
  const home = read('src/components/templates/Home/Home.tsx')
  const workspace = read('src/components/organisms/CenterWorkspace/index.tsx')
  const drawer = read('src/components/molecules/EmailComposeDrawer/index.tsx')

  assert.match(emailUtils, /export function isCalendarResourceEmail/)
  assert.match(emailUtils, /@resource\.calendar\.google\.com/)
  assert.match(emailUtils, /export function getFollowUpRecipients/)
  assert.match(home, /getFollowUpRecipients\(participants, ownEmails\)/)
  assert.match(workspace, /getFollowUpRecipients\(participants, ownEmails\)/)
  assert.match(home, /senderEmail: userEmail/)
  assert.match(home, /detail\?\.userEmail/)
  assert.match(workspace, /senderEmail: userEmail/)
  assert.match(drawer, />From<\/span>/)
  assert.match(drawer, /No connected sender/)
  assert.match(drawer, /userEmail: senderEmail/)
})

test('follow-up drafts normalize internal ownership language into sender voice', () => {
  const emailUtils = read('src/utils/emails.tsx')
  const browser = read('src-tauri/src/clawd/browser.rs')

  assert.match(emailUtils, /export function normalizeFollowUpEmailVoice/)
  assert.match(emailUtils, /You decided/)
  assert.match(emailUtils, /I’ll/)
  assert.match(browser, /sanitize_email_recipients/)
  assert.match(browser, /A human recipient, subject, and body are all required/)
  assert.match(browser, /Write in the sender's first person/)
})
