const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const recordingContextPath = path.resolve(
  __dirname,
  '..',
  'src/components/organisms/MeetingNotesMode/RecordingContext.tsx',
)
const meetingNotesModePath = path.resolve(
  __dirname,
  '..',
  'src/components/organisms/MeetingNotesMode/index.tsx',
)

test('a backend-confirmed automatic stop queues meeting-note synthesis', () => {
  const source = fs.readFileSync(recordingContextPath, 'utf8')

  assert.match(source, /let backendConfirmedStop = false/)
  assert.match(
    source,
    /await stopRecord\([\s\S]*?backendConfirmedStop = true[\s\S]*?if \(stopSucceeded && \(wasRecording \|\| backendConfirmedStop\)\) \{\s*await generateNotes/,
  )
  assert.doesNotMatch(source, /if \(wasRecording && stopSucceeded\) \{\s*await generateNotes/)
})

test('recorded meetings with a saved transcript recover missing notes once', () => {
  const source = fs.readFileSync(meetingNotesModePath, 'utf8')

  assert.match(source, /const missingNotesRecoveryTriggeredRef = useRef\(false\)/)
  assert.match(
    source,
    /missingNotesRecoveryTriggeredRef\.current = false\s*\n\s*}, \[thread\.id\]\)/,
  )
  assert.match(
    source,
    /thread\.recorded &&[\s\S]*?thread\.savedTranscript &&[\s\S]*?!missingNotesRecoveryTriggeredRef\.current[\s\S]*?missingNotesRecoveryTriggeredRef\.current = true[\s\S]*?recordingHandlers\.generateNotes\(/,
  )
})
