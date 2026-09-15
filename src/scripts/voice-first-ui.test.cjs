const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const chat = fs.readFileSync(path.join(__dirname, '..', 'src/components/organisms/ClawdChat/index.tsx'), 'utf8')
const styles = fs.readFileSync(path.join(__dirname, '..', 'src/components/organisms/ClawdChat/style.scss'), 'utf8')

test('the composer microphone starts listening on the first click', () => {
  assert.match(chat, /onClick=\{isRecording \? onStopRecording : onStartRecording\}/)
  assert.match(chat, /onStartRecording=\{openVoiceSession\}/)
  assert.match(chat, /const openVoiceSession = useCallback\(\(\) => \{[\s\S]*?setVoiceSessionOpen\(true\)[\s\S]*?void startRecording\(\)/)
  assert.doesNotMatch(chat, /voiceEnabled \? onStartRecording : onToggleVoice/)
})

test('voice session reports real lifecycle states and keeps type and sound controls', () => {
  assert.match(chat, /isStartingRecording \? 'Connecting microphone' : isRecording \? 'Listening' : isTranscribing \? 'Turning speech into text' : busy \? 'Thinking' : isSpeaking \? 'Speaking'/)
  assert.match(chat, /aria-label="Switch to typing"/)
  assert.match(chat, /event\.key === 'Escape'[\s\S]*?closeVoiceSession\(\)/)
  assert.match(chat, /if \(e\.key === 'Escape'\) \{\s*if \(voiceSessionOpen\) return/)
  assert.match(chat, /requestAnimationFrame\(\(\) => chatInputElementRef\.current\?\.focus\(\)\)/)
  assert.match(chat, /aria-pressed=\{voiceEnabled\}/)
  assert.match(chat, /onClick=\{isRecording \? stopRecording : openVoiceSession\}/)
  assert.match(chat, /if \(voiceStartPendingRef\.current\) return/)
  assert.match(styles, /\.ClawdVoiceSession \{[\s\S]*?position: absolute;/)
  assert.match(styles, /prefers-reduced-motion: reduce/)
})

test('closing a voice session discards unfinished capture and stops playback', () => {
  assert.match(chat, /const discardedVoiceRecordersRef = useRef<WeakSet<MediaRecorder>>/)
  assert.match(chat, /const recordingChunks: Blob\[\] = \[\]/)
  assert.match(chat, /let silenceTimeout: ReturnType<typeof setTimeout> \| null = null/)
  assert.match(chat, /if \(audioContext\.state !== 'closed'\)/)
  assert.doesNotMatch(chat, /audioContextRef|analyserRef|silenceTimeoutRef/)
  assert.match(chat, /const closeVoiceSession = useCallback\(\(\) => \{[\s\S]*?if \(mediaRecorder\) \{[\s\S]*?discardedVoiceRecordersRef\.current\.add\(mediaRecorder\)[\s\S]*?if \(mediaRecorder\.state !== 'inactive'\)[\s\S]*?mediaRecorder\.stop\(\)[\s\S]*?stopCurrentAudio\(\)/)
  assert.match(chat, /if \(discardedVoiceRecordersRef\.current\.has\(recorder\)\) \{[\s\S]*?return/)
  assert.match(chat, /if \(voicePlaybackTokenRef\.current !== playbackToken\) return/)
})
