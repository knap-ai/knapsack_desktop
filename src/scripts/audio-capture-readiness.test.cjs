const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const read = relativePath =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')

test('system audio permission is based on the Core Audio tap probe', () => {
  const source = read('src-tauri/src/audio/permission.rs')
  const start = source.indexOf('fn check_system_audio_permission_macos() -> bool')
  const end = source.indexOf('fn check_macos_version_sufficient()', start)
  const permissionCheck = source.slice(start, end)

  assert.match(permissionCheck, /catch_unwind\(check_system_audio_via_tap_probe\)/)
  assert.doesNotMatch(permissionCheck, /check_screen_capture_via_cg_preflight\(\)/)
  assert.match(source, /"all_granted": mic_granted && system_audio_granted/)
})

test('recording waits for speaker capture before starting the microphone', () => {
  const source = read('src-tauri/src/audio/audio.rs')
  const outputStart = source.indexOf('let startup_result = timeout(')
  const microphoneStart = source.indexOf('let mic_thread = handle.spawn_blocking', outputStart)

  assert.ok(outputStart > 0, 'speaker readiness wait is present')
  assert.ok(microphoneStart > outputStart, 'microphone starts after speaker readiness')
  assert.match(source, /"code": "system_audio_start_failed"/)
  assert.match(source, /"code": "system_audio_start_timeout"/)
  assert.doesNotMatch(source, /is_meeting_recording && !has_system_audio_permission/)
})

test('meeting permission setup requires microphone and system audio', () => {
  const source = read('src/components/molecules/AudioPermissionChecker/index.tsx')

  assert.match(source, /if \(micPermission && systemAudioPermission\)/)
  assert.match(source, /Enable system audio access/)
  assert.doesNotMatch(source, /system audio \(optional/)
})

test('Windows acknowledges readiness when the WASAPI stream starts', () => {
  const source = read('src-tauri/src/audio/windows.rs')
  const start = source.indexOf('pub fn capture_loop(')
  const end = source.indexOf('pub fn stop_recording(', start)
  const captureLoop = source.slice(start, end)

  assert.match(captureLoop, /audio_client\.start_stream\(\)\?/)
  assert.match(captureLoop, /startup_tx\.send\(Ok\(\(\)\)\)/)

  const speakerStart = source.indexOf('pub async fn record_speaker_output(')
  const speakerOutput = source.slice(speakerStart)
  assert.match(speakerOutput, /audio_recorder\.start_recording\(startup_tx\)/)
  assert.doesNotMatch(speakerOutput, /Ok\(_\) => \{\s*let _ = startup_tx\.send/)
})

test('Linux keeps the supported microphone-only recording path', () => {
  const source = read('src-tauri/src/audio/audio.rs')
  const outputStart = source.indexOf('// Start system audio before the microphone')
  const microphoneStart = source.indexOf('let mic_thread = handle.spawn_blocking', outputStart)
  const speakerStartup = source.slice(outputStart, microphoneStart)

  assert.match(speakerStartup, /#\[cfg\(any\(target_os = "macos", target_os = "windows"\)\)\]/)
})
