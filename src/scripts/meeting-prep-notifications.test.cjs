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

test('the minute clock uses rich prep and retains the configured join-and-record reminder', () => {
  assert.match(app, /checkMeetingPrep\(\)/)
  assert.match(app, /await handleNotificationsScheduleService\(date\)/)
  assert.match(app, /let tickInFlight = false/)
  assert.match(notifications, /canSendNotification\('meeting_prep', false\)/)
  assert.match(notifications, /if \(wasDelivered\)[\s\S]*?persistPreppedMeetingId/)
  assert.match(notifications, /const didOpen = await openNotificationWindow\([\s\S]*?if \(!didOpen\) return response[\s\S]*?await recordNotification/)
})

test('slow prep generation cannot block the time-sensitive minute scheduler', () => {
  assert.match(app, /void checkMeetingPrep\(\)/)
  assert.doesNotMatch(app, /await checkMeetingPrep\(\)/)
  assert.match(app, /void checkMorningBriefing\(date\)/)
  assert.match(app, /void checkProactiveCheckin\(date\)/)
})

test('a notification is considered delivered only when its window opens', () => {
  const automations = read('src/hooks/automation/useAutomations.tsx')
  const native = read('src-tauri/src/main.rs')
  assert.match(automations, /const notificationWindowReservedRef = useRef\(false\)/)
  assert.match(automations, /if \(notificationWindowReservedRef\.current\) \{[\s\S]*?if \(!replaceExisting\) return false/)
  assert.match(automations, /notificationWindowReservedRef\.current = true/)
  assert.match(automations, /replaceExisting = false/)
  assert.match(automations, /await invoke\('close_notification_window'\)/)
  assert.match(automations, /minutesUntil <= leadTime[\s\S]*?minutesUntil > 0/)
  assert.match(automations, /const didShow = await invoke<boolean>\('show_notification_window'/)
  assert.match(automations, /if \(!didShow\) \{[\s\S]*?return false[\s\S]*?setIsNotificationWindowShowing\(true\)\s*return true/)
  assert.match(automations, /Error showing notification window[\s\S]*?return false/)
  assert.match(native, /async fn show_notification_window[\s\S]*?\) -> bool/)
  assert.match(native, /if let Ok\(Some\(monitor\)\) = window\.current_monitor\(\)/)
  assert.match(native, /return false;[\s\S]*?window\.show\(\)\.is_err\(\)/)
  assert.match(automations, /const occurrenceIdentifier = `\$\{meeting\.eventId \|\| meeting\.id\}:\$\{startTime\.valueOf\(\)\}`/)
  assert.match(automations, /includes\(occurrenceIdentifier\)/)
  assert.match(automations, /sentIdentifiers: \[[\s\S]*?occurrenceIdentifier/)
})

test('channel delivery does not depend on opening a local notification window', () => {
  const didOpen = notifications.indexOf('const didOpen = await openNotificationWindow(')
  const channels = notifications.indexOf('const deliverToChannels = async', didOpen)
  const retry = notifications.indexOf('if (!didOpen) return response', didOpen)
  assert.ok(didOpen >= 0 && channels > didOpen && retry > channels)
})

test('a blocked notification cannot replace the visible notification payload', () => {
  const didOpen = notifications.indexOf('const didOpen = await openNotificationWindow(')
  const pendingUpdate = notifications.indexOf('if (didOpen) {\n                  pendingInsightRef.current = parsed', didOpen)
  assert.ok(didOpen >= 0 && pendingUpdate > didOpen)
})

test('meeting prep channel delivery is deduplicated while the local surface retries', () => {
  assert.match(notifications, /KN_PREPPED_MEETING_CHANNEL_IDS/)
  assert.match(notifications, /preppedMeetingChannelIdsRef\.current\.has\(resolvedChannelDeliveryKey\)/)
  assert.match(notifications, /getMeetingPrepNotificationKey\(meetingNeedingPrep\)/)
  assert.match(notifications, /JSON\.stringify\(\[\.\.\.preppedMeetingChannelIdsRef\.current\]\)/)
  assert.match(notifications, /inFlightMeetingChannelIdsRef/)
  assert.match(notifications, /Promise<boolean>/)
  assert.match(notifications, /if \(!channelDelivered\) \{[\s\S]*?retryOnFailure/)
})

test('morning briefing is marked sent only after it is delivered', () => {
  const delivery = notifications.indexOf("const delivered = await generateAndShowNotification(")
  const marker = notifications.indexOf('if (delivered && !force)', delivery)
  assert.ok(delivery >= 0 && marker > delivery)
})

test('morning channel delivery is deduplicated without suppressing local retries', () => {
  assert.match(notifications, /`morning-briefing:\$\{dayjs\(now\)\.format\('YYYY-MM-DD'\)\}`/)
  assert.match(notifications, /KN_PREPPED_MEETING_CHANNEL_IDS/)
  assert.doesNotMatch(notifications, /KN_MORNING_BRIEFING_CHANNEL_DATE/)
})

test('channel-only email alerts update the notification throttle', () => {
  assert.match(
    notifications,
    /channelDelivered && notificationType === 'email_alert' && !didOpen[\s\S]*?recordNotification\(notificationType\)/,
  )
})

test('channel delivery retries separately from a successful local prep and deduplicates email batches', () => {
  assert.match(notifications, /const resolvedChannelDeliveryKey/)
  assert.match(notifications, /email-alert:\$\{parsed\.notificationTitle\}:\$\{parsed\.notificationBody\}/)
  assert.match(notifications, /const deliverToChannels = async \(retryOnFailure: boolean\)/)
  assert.match(notifications, /notificationType === 'pre_meeting_prep' \|\| notificationType === 'morning_briefing'/)
  assert.match(notifications, /void deliverToChannels\(false\)/)
})

test('meeting prep notifications request concise, evidence-grounded key points', () => {
  assert.match(prompt, /2 or 3 short, concrete prep points separated by bullets/)
  assert.match(prompt, /why the meeting matters, the most important open thread, and the best move/)
})
