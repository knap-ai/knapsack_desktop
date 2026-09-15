const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const read = relative => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
const app = read('src/App.tsx')
const chat = read('src/components/organisms/ClawdChat/index.tsx')
const capture = read('src/utils/meetingCapture.ts')

test('calendar timing and a real meeting-audio signal gate automatic capture', () => {
  assert.match(capture, /10 \* 60 \* 1000/)
  assert.match(capture, /15 \* 60 \* 1000/)
  assert.match(capture, /durationMs > 4 \* 60 \* 60 \* 1000/)
  assert.match(capture, /item\.threads\?\.some\(thread => thread\.recorded\)/)
  assert.match(capture, /event\.google_meet_url \|\| event\.teams_url \|\| event\.zoom_url/)
  assert.match(app, /listen\('mic-activated'/)
  assert.match(app, /findMeetingCaptureCandidate\(calendarCaptureItems\(\), Date\.now\(\)\)/)
  assert.match(app, /await beginAutomaticMeetingCapture\(scheduledMeeting\)/)
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
  assert.match(chat, /localStorage\.getItem\(VOICE_MODE_STORAGE\) === 'true' && !meetingQuietModeRef\.current/)
  assert.match(chat, /voicePaused=\{meetingQuietMode\}/)
  assert.match(chat, /Voice pauses during meeting recording/)
  assert.match(chat, /setVoiceEnabled\(true\)[\s\S]*?VOICE_MODE_STORAGE, 'true'/)
})
