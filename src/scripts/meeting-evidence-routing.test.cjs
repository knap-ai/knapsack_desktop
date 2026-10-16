const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8')

test('global chat routes the exact latest-call follow-up to local meeting tools with history', () => {
  const routing = read('src/utils/meetingContextRouting.ts')
  const chat = read('src/components/organisms/ClawdChat/index.tsx')
  assert.match(routing, /what\\s\+happened[\s\S]*?latest\|last\|previous[\s\S]*?call\|meeting/)
  assert.match(chat, /shouldUseDirectMeetingContext\(visibleText\)/)
  assert.match(chat, /seedHistory: buildChatSeedHistory\(msgs\)/)
  assert.match(chat, /fetch\(apiUrl\('\/api\/clawd\/chat'\)/)
})

test('direct meeting path distinguishes calendar metadata from cited saved content', () => {
  const browser = read('src-tauri/src/clawd/browser.rs')
  const meeting = read('src-tauri/src/clawd/meeting_context.rs')
  const tools = read('src-tauri/src/clawd/chat_agent.rs')
  assert.match(tools, /name: "list_recent_meetings"/)
  assert.match(tools, /name: "get_meeting_notes"/)
  assert.match(browser, /calendar entries only prove that an event was scheduled/)
  assert.match(browser, /cite the exact `source\.citation` supplied by the tool/)
  assert.match(browser, /Current local time on this computer/)
  assert.match(browser, /"saved_meeting_notes"/)
  assert.match(meeting, /"has_saved_notes": notes_exist\(tid\)/)
  assert.match(meeting, /let citation = format!\("\[\{\}: \{\} — \{\} — thread \{\}\]"/)
})

test('release-disabled backup copy does not imply continuous cross-device sync', () => {
  const backup = read('src/components/organisms/StateBackupControl.tsx')
  const capability = read('src/utils/releaseCapabilities.ts')
  assert.match(capability, /ACCOUNT_CONTINUITY_ENABLED = false/)
  assert.match(backup, /snapshot backup and cross-computer restore are not available/)
  assert.match(backup, /does not continuously sync meeting notes between computers/)
})
