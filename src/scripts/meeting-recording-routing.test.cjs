const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = file => fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8')

test('calendar reads recover stale linked accounts and notify the renderer', () => {
  const search = source('../src-tauri/src/search.rs')
  assert.match(search, /get_events\([\s\S]*?find_calendar_connections_by_user_email/)
  assert.match(search, /last_synced\.is_some_and/)
  assert.match(search, /CALENDAR_REFRESH_ATTEMPTS/)
  assert.match(search, /fetch_calendar\(/)
  const app = source('App.tsx')
  assert.match(app, /finish_fetch_calendar[\s\S]*?await syncMeetings\(\)/)
})

test('calendar open and record share a single idempotent note creation path', () => {
  const feed = source('hooks/feed/useFeed.tsx')
  assert.match(feed, /const ensureCalendarFeedItem =/)
  assert.match(feed, /calendarCreationRef\.current\.get\(key\)/)
  assert.match(feed, /const openCalendarEvent = async[\s\S]*?ensureCalendarFeedItem\(meeting\)/)
  assert.match(feed, /const startCalendarMeetingOnce = async[\s\S]*?ensureCalendarFeedItem\(meeting\)/)
  assert.match(feed, /calendarRecordingRef\.current\.get\(key\)/)
  assert.match(feed, /quickNoteCreationRef\.current/)
})

test('record action is immediate and meeting chats stay attached to meetings', () => {
  const home = source('components/templates/Home/Home.tsx')
  const sidebar = source('components/organisms/NotetakerSidebar/index.tsx')
  const notes = source('components/organisms/MeetingNotesMode/index.tsx')
  assert.match(home, /if \(isAnyRecording\) feed\.handleClickRecording\(\)[\s\S]*?else feed\.createNewMeeting\(\)/)
  assert.match(sidebar, /data-testid="qa-record-action"/)
  assert.match(sidebar, /Recent recordings/)
  assert.match(sidebar, /moltbot_chat_history:meeting:/)
  assert.doesNotMatch(sidebar, /Meeting chats · Scout/)
  assert.match(sidebar, /Meeting chat available/)
  assert.match(sidebar, /meeting-chat-indicator/)
  assert.match(notes, /meetingChatRequest\?\.threadId === thread\.id/)
  assert.match(notes, /agentName="Scout"/)
  assert.match(notes, /hasStoredMeetingChat/)
  assert.match(notes, /Continue meeting chat/)
})

test('recent recordings are a subtle jump target below primary meeting navigation', () => {
  const sidebar = source('components/organisms/NotetakerSidebar/index.tsx')
  assert.match(sidebar, /recentRecordingsRef/)
  assert.match(sidebar, /scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/)
  assert.match(sidebar, /className="notetaker-sidebar__recordings-jump"/)
  assert.match(sidebar, /aria-label="Recently saved recordings"/)
  assert.ok(
    sidebar.indexOf('notetaker-sidebar__coming-up') < sidebar.indexOf('aria-label="Recently saved recordings"'),
  )
})

test('goal and loop candidates surface as confirmation-first chat actions', () => {
  const chat = source('components/organisms/ClawdChat/index.tsx')
  assert.match(chat, /detectGoalLoopSuggestions/)
  assert.match(chat, /Review as a measurable goal/)
  assert.match(chat, /Review as a verifiable loop/)
  assert.match(chat, /Do not save anything yet/)
  assert.match(chat, /Do not activate anything yet/)
})

test('follow-up drafts use meeting substance and exclude all of the user identities', () => {
  const emails = source('utils/emails.tsx')
  const home = source('components/templates/Home/Home.tsx')
  const workspace = source('components/organisms/CenterWorkspace/index.tsx')
  assert.match(emails, /What we aligned on/)
  assert.match(emails, /<strong>Next steps<\/strong>/)
  assert.match(emails, /Decisions\|Key Decisions/)
  assert.doesNotMatch(emails, /Great meeting today/)
  for (const file of [home, workspace]) {
    assert.match(file, /meeting\?\.calendar_account_email/)
    assert.match(file, /ownEmails\.has\(p\.email\.trim\(\)\.toLowerCase\(\)\)/)
    assert.match(file, /replace\(\/\\\(\?\\s\*placeholder/)
  }
})

test('meeting selection keeps the current window size until recording starts', () => {
  const notes = source('components/organisms/MeetingNotesMode/index.tsx')
  assert.match(notes, /const isMeetingRecording = recordingHandlers\.isRecording\(thread\.id\)/)
  assert.match(
    notes,
    /useEffect\(\(\) => \{\s*if \(!isMeetingRecording\) return\s*return enterMeetingWindowLayout\(\)\s*\}, \[isMeetingRecording\]\)/,
  )
  assert.doesNotMatch(notes, /useEffect\(\(\) => enterMeetingWindowLayout\(\), \[\]\)/)
})

test('upcoming meetings produce a native reminder without requiring proactive mode', () => {
  const app = source('App.tsx')
  const capture = source('utils/meetingCapture.ts')
  const notifications = source('utils/permissions/notification.tsx')

  assert.match(app, /import \{ sendNotification \} from 'src\/utils\/permissions\/notification'/)
  assert.match(
    app,
    /announcedMeetingCapturesRef\.current\.add\(key\)[\s\S]*?if \(!LOCAL_QA_SAFE\) \{[\s\S]*?void sendNotification\(\{[\s\S]*?title: 'Meeting starting soon'/,
  )
  assert.doesNotMatch(
    app,
    /announcedMeetingCapturesRef\.current\.add\(key\)[\s\S]{0,800}moltbot_proactive_mode/,
  )
  assert.match(capture, /requireMicWindow === false \? 5 \* 60 \* 1000/)
  assert.match(notifications, /await tauriSendNotification\(options\)/)
})

test('meeting chat handle resizes, toggles, and persists panel height', () => {
  const notes = source('components/organisms/MeetingNotesMode/index.tsx')
  const styles = source('main.css')
  assert.match(notes, /MEETING_CHAT_MIN_HEIGHT = 280/)
  assert.match(notes, /MEETING_CHAT_HEIGHT_STORAGE_KEY = 'knapsack:meeting-chat-height'/)
  assert.match(notes, /setPointerCapture\(event\.pointerId\)/)
  assert.match(notes, /drag\.startHeight \+ delta/)
  assert.match(notes, /localStorage\.setItem\(MEETING_CHAT_HEIGHT_STORAGE_KEY/)
  assert.match(notes, /onPointerDown=\{handleMeetingChatResizeStart\}/)
  assert.match(notes, /onPointerMove=\{handleMeetingChatResizeMove\}/)
  assert.match(notes, /onPointerUp=\{handleMeetingChatResizeEnd\}/)
  assert.match(notes, /onKeyDown=\{handleMeetingChatResizeKeyDown\}/)
  assert.match(notes, /aria-label="Resize meeting chat\. Drag up to expand or down to collapse\."/)
  assert.doesNotMatch(notes, /chat-overlay-handle" aria-hidden="true"/)
  assert.match(styles, /\.notetaker-note__chat-overlay-handle[\s\S]*?cursor: ns-resize;/)
  assert.match(styles, /\.notetaker-note__chat-overlay--resizing/)
})

test('inline meeting chat owns the visible recording surface', () => {
  const notes = source('components/organisms/MeetingNotesMode/index.tsx')
  const spotlight = source('../src-tauri/src/spotlight.rs')
  assert.match(notes, /isMeetingRecording && isMeetingChatOpen\s*\? 'hide_recording_indicator'\s*:\s*'restore_recording_indicator'/)
  assert.match(notes, /recordingHandlers\.isAnyRecording/)
  assert.match(notes, /void invoke\(command\)\.catch\(\(\) => \{\}\)/)
  assert.match(notes, /if \(isAnyRecordingRef\.current\) \{\s*void invoke\('restore_recording_indicator'\)\.catch\(\(\) => \{\}\)/)
  assert.match(spotlight, /pub fn restore_recording_indicator[\s\S]*?window\.show\(\)/)
  assert.doesNotMatch(spotlight.match(/pub fn restore_recording_indicator[\s\S]*?(?=\n\#\[tauri::command\]|$)/)?.[0] || '', /recording-indicator-show/)
})

test('meeting follow-up actions visibly expand and reliably refill Scout', () => {
  const notes = source('components/organisms/MeetingNotesMode/index.tsx')
  const chat = source('components/organisms/ClawdChat/index.tsx')
  assert.match(
    notes,
    /openActionItemInMeetingChat[\s\S]*?setMeetingChatInitialInput\(actionItemPrompt\(taskText\)\)[\s\S]*?setMeetingChatInputNonce[\s\S]*?expandMeetingChat\(\)[\s\S]*?setIsMeetingChatOpen\(true\)/,
  )
  assert.match(notes, /initialInputKey=\{meetingChatInputNonce\}/)
  assert.match(chat, /initialValueKey\?: number/)
  assert.match(chat, /\}, \[initialValue, initialValueKey\]\)/)
  assert.match(chat, /initialValueKey=\{initialInputKey\}/)
})

test('isolated UI QA cannot schedule production automations or start a second gateway', () => {
  const app = source('App.tsx')
  const automations = source('hooks/automation/useAutomations.tsx')
  const localStorage = source('utils/KNLocalStorage.ts')
  const launcher = fs.readFileSync(path.join(__dirname, 'qa-dev-run.cjs'), 'utf8')
  assert.match(app, /const LOCAL_QA_SAFE =/)
  assert.match(app, /if \(!LOCAL_QA_SAFE\) \{[\s\S]*?await scheduleRuns\(userEmail\)/)
  assert.match(automations, /VITE_KNAPSACK_LOCAL_QA_SAFE !== '1'/)
  assert.match(localStorage, /if \(import\.meta\.env\.VITE_KNAPSACK_LOCAL_QA_SAFE === '1'\) return/)
  assert.match(launcher, /KNAPSACK_QA_SKIP_GATEWAY/)
  assert.match(launcher, /gateway disabled for local-only UI QA/)
})
