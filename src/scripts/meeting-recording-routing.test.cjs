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

test('record action is immediate and meeting chats remain discoverable', () => {
  const home = source('components/templates/Home/Home.tsx')
  const sidebar = source('components/organisms/NotetakerSidebar/index.tsx')
  const notes = source('components/organisms/MeetingNotesMode/index.tsx')
  assert.match(home, /if \(isAnyRecording\) feed\.handleClickRecording\(\)[\s\S]*?else feed\.createNewMeeting\(\)/)
  assert.match(sidebar, /data-testid="qa-record-action"/)
  assert.match(sidebar, /Recent recordings/)
  assert.match(sidebar, /Meeting chats/)
  assert.match(sidebar, /moltbot_chat_history:meeting:/)
  assert.match(notes, /meetingChatRequest\?\.threadId === thread\.id/)
  assert.match(notes, /agentName="Scout"/)
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
