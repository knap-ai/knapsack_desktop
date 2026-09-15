const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const ts = require('typescript')

const read = relative => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
const app = read('src/App.tsx')
const chat = read('src/components/organisms/ClawdChat/index.tsx')
const capture = read('src/utils/meetingCapture.ts')
const compiledCapture = ts.transpileModule(capture, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const captureModule = { exports: {} }
new Function('module', 'exports', compiledCapture)(captureModule, captureModule.exports)
const { findMeetingCaptureCandidate, meetingCaptureKey } = captureModule.exports

const eventItem = (overrides = {}) => ({
  id: 1,
  title: 'Design review',
  timestamp: new Date(1_000_000),
  calendarEvent: {
    start: 1_000,
    end: 2_000,
    event_id: 'event-1',
    calendar_account_email: 'mark@example.com',
    google_meet_url: 'https://meet.google.com/example',
    participants: [{ email: 'mark@example.com' }, { email: 'pat@example.com' }],
  },
  ...overrides,
})

test('calendar timing and a real meeting-audio signal gate automatic capture', () => {
  assert.match(capture, /10 \* 60 \* 1000/)
  assert.match(capture, /15 \* 60 \* 1000/)
  assert.match(capture, /durationMs > 4 \* 60 \* 60 \* 1000/)
  assert.match(capture, /item\.threads\?\.some\(thread => thread\.recorded\)/)
  assert.match(capture, /event\.google_meet_url \|\| event\.teams_url \|\| event\.zoom_url/)
  assert.match(app, /listen\('mic-activated'/)
  assert.match(app, /const scheduledMeeting = isRecognizedMeetingApp\(appInfo\)[\s\S]*?findMeetingCaptureCandidate/)
  assert.match(app, /findMeetingCaptureCandidate\(calendarCaptureItems\(\), Date\.now\(\)\)/)
  assert.match(app, /await beginAutomaticMeetingCapture\(scheduledMeeting\)/)
})

test('candidate selection enforces timing, meeting evidence, and recording history', () => {
  const eligible = eventItem()
  assert.equal(findMeetingCaptureCandidate([eligible], 950_000), eligible)
  assert.equal(meetingCaptureKey(eligible), 'mark@example.com:event-1')
  assert.equal(findMeetingCaptureCandidate([eligible], 300_000), null)
  assert.equal(findMeetingCaptureCandidate([eventItem({ threads: [{ recorded: true }] })], 1_100_000), null)
  assert.equal(findMeetingCaptureCandidate([eventItem({
    calendarEvent: { start: 1_000, end: 2_000, event_id: 'no-signal', participants: [] },
  })], 1_100_000), null)
  assert.equal(findMeetingCaptureCandidate([eventItem({
    calendarEvent: { start: 1_000, end: 20_000, event_id: 'all-day', participants: [{}, {}] },
  })], 1_100_000), null)
})

test('active meetings outrank upcoming meetings and the heads-up window stays narrow', () => {
  const active = eventItem({ id: 2, calendarEvent: { ...eventItem().calendarEvent, event_id: 'active', start: 1_000 } })
  const upcoming = eventItem({ id: 3, calendarEvent: { ...eventItem().calendarEvent, event_id: 'upcoming', start: 1_150 } })
  assert.equal(findMeetingCaptureCandidate([upcoming, active], 1_100_000), active)
  assert.equal(findMeetingCaptureCandidate([upcoming], 1_040_000, { requireMicWindow: false }), upcoming)
  assert.equal(findMeetingCaptureCandidate([upcoming], 900_000, { requireMicWindow: false }), null)
})

test('users get a cancellable heads-up and existing recording controls remain authoritative', () => {
  assert.match(app, /phase: 'ready' \| 'recording'/)
  assert.match(app, /Ready to capture/)
  assert.match(app, /ignoredMeetingCapturesRef\.current\.add\(meetingCaptureNotice\.key\)/)
  assert.match(app, /await isRecordingStatus\(\)/)
  assert.match(app, /listen\('stop_recording',[\s\S]*?setMeetingQuietMode\(false\)/)
})

test('meeting capture silences voice without losing the user voice preference', () => {
  assert.match(chat, /knapsack-meeting-quiet-mode/)
  assert.match(chat, /resumeVoiceAfterMeetingRef\.current = voiceEnabled \|\| voiceSessionOpen/)
  assert.match(chat, /localStorage\.getItem\(VOICE_MODE_STORAGE\) === 'true' &&[\s\S]*?!meetingQuietModeRef\.current/)
  assert.match(chat, /voicePaused=\{meetingQuietMode\}/)
  assert.match(chat, /Voice pauses during meeting recording/)
  assert.match(chat, /setVoiceEnabled\(true\)[\s\S]*?VOICE_MODE_STORAGE, 'true'/)
})
