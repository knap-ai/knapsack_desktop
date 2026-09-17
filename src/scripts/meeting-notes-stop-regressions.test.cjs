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
const notesApiPath = path.resolve(__dirname, '..', 'src-tauri/src/api/notes.rs')

test('a backend-confirmed automatic stop queues meeting-note synthesis', () => {
  const source = fs.readFileSync(recordingContextPath, 'utf8')

  assert.match(source, /let backendConfirmedStop = false/)
  assert.match(
    source,
    /await stopRecord\([\s\S]*?backendConfirmedStop = true[\s\S]*?if \(stopSucceeded && \(wasRecording \|\| backendConfirmedStop\)\) \{[\s\S]*?const persistedNotes = await fetchNotes\(\)[\s\S]*?persistedNotes \?\? notesMarkdown/,
  )
  assert.doesNotMatch(source, /if \(wasRecording && stopSucceeded\) \{\s*await generateNotes/)
})

test('opening a recorded meeting never regenerates notes as a navigation side effect', () => {
  const source = fs.readFileSync(meetingNotesModePath, 'utf8')
  const notesApiSource = fs.readFileSync(notesApiPath, 'utf8')

  const fetchNotesBody = source.match(/const fetchNotes = async[\s\S]*?\n  const checkTranscriptSaved = async/)?.[0] || ''
  assert.match(fetchNotesBody, /const notesExist = data\?\.data\?\.exists === true/)
  assert.doesNotMatch(fetchNotesBody, /generateNotes\(/)
  assert.doesNotMatch(source, /missingNotesRecoveryTriggeredRef/)
  assert.match(notesApiSource, /struct GetNotesResponse \{[\s\S]*?exists: bool/)
  assert.match(notesApiSource, /let exists = notes\.is_some\(\)/)
})

test('note generation exposes one inline progress treatment', () => {
  const source = fs.readFileSync(meetingNotesModePath, 'utf8')
  const styles = fs.readFileSync(path.resolve(__dirname, '..', 'src/main.css'), 'utf8')

  assert.doesNotMatch(source, /notetaker-note__post-meeting-banner/)
  assert.doesNotMatch(source, /notetaker-note__processing-pill/)
  assert.doesNotMatch(styles, /notetaker-note__post-meeting-banner/)
  assert.doesNotMatch(styles, /notetaker-note__processing-pill/)
  assert.match(source, /Stream synthesized notes into the page as they arrive/)
  assert.match(source, /notetaker-note__processing/)
})

test('meeting brief collapses when note generation begins', () => {
  const source = fs.readFileSync(meetingNotesModePath, 'utf8')

  assert.match(
    source,
    /React\.useLayoutEffect\(\(\) => \{\s*if \(showNotesProcessing\) \{\s*setBriefPrepExpanded\(false\)\s*\}\s*\}, \[showNotesProcessing, thread\.id\]\)/,
  )
  assert.match(source, /onClick=\{\(\) => setBriefPrepExpanded\(prev => !prev\)\}/)
})

test('meeting navigation clears notes and rejects a late response from the previous meeting', async () => {
  const source = fs.readFileSync(meetingNotesModePath, 'utf8')

  assert.match(
    source,
    /React\.useLayoutEffect\(\(\) => \{[\s\S]*?setNotesMarkdown\(''\)[\s\S]*?editor\?\.commands\.setContent\('', false\)[\s\S]*?}, \[thread\.id\]\)/,
  )
  assert.match(source, /const notesController = new AbortController\(\)/)
  assert.match(source, /void fetchNotes\(notesController\.signal\)/)
  assert.match(source, /notesController\.abort\(\)/)
  assert.match(source, /signal,[\s\S]*?activeNotesThreadIdRef\.current !== requestedThreadId/)

  let activeThreadId = 1
  let renderedNotes = ''
  const deferred = () => {
    let resolve
    const promise = new Promise(done => { resolve = done })
    return { promise, resolve }
  }
  const firstMeeting = deferred()
  const secondMeeting = deferred()

  const loadNotes = async (threadId, request) => {
    const notes = await request.promise
    if (activeThreadId !== threadId) return
    renderedNotes = notes
  }

  const firstLoad = loadNotes(1, firstMeeting)
  activeThreadId = 2
  renderedNotes = ''
  const secondLoad = loadNotes(2, secondMeeting)

  secondMeeting.resolve('Notes for meeting two')
  await secondLoad
  firstMeeting.resolve('Private notes for meeting one')
  await firstLoad

  assert.equal(renderedNotes, 'Notes for meeting two')
})
