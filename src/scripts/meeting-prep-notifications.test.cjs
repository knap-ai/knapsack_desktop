const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8')
const notifications = read('src/hooks/notifications/useBackgroundNotifications.tsx')
const app = read('src/App.tsx')
const prompt = read('src/prompts.ts')

test('meeting prep reminders are occurrence-specific and tolerant of delayed ticks', () => {
  assert.match(notifications, /return `\$\{meeting\.eventId \|\| meeting\.id\}:\$\{occurrenceStart\}`/)
  assert.match(notifications, /return minutesUntil >= 10 && minutesUntil <= 30/)
})

test('the minute clock uses rich meeting prep rather than the generic exact-minute reminder', () => {
  assert.match(app, /checkMeetingPrep\(\)/)
  assert.doesNotMatch(app, /handleNotificationsScheduleService\(date\)/)
  assert.match(notifications, /canSendNotification\('meeting_prep', false\)/)
  assert.match(notifications, /if \(wasDelivered\)[\s\S]*?persistPreppedMeetingId/)
  assert.match(notifications, /const didOpen = await openNotificationWindow\([\s\S]*?if \(!didOpen\) return response[\s\S]*?await recordNotification/)
})

test('a notification is considered delivered only when its window opens', () => {
  const automations = read('src/hooks/automation/useAutomations.tsx')
  assert.match(automations, /if \(isNotificationWindowShowing\) return false/)
  assert.match(automations, /setIsNotificationWindowShowing\(true\)\s*return true/)
  assert.match(automations, /Error showing notification window[\s\S]*?return false/)
})

test('meeting prep notifications request concise, evidence-grounded key points', () => {
  assert.match(prompt, /2 or 3 short, concrete prep points separated by bullets/)
  assert.match(prompt, /why the meeting matters, the most important open thread, and the best move/)
})
