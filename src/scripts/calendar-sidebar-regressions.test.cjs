const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const sourceRoot = path.resolve(__dirname, '..', 'src')

test('upcoming calendar events use the full one-week fetch window', () => {
  const source = fs.readFileSync(path.join(sourceRoot, 'hooks/feed/useFeed.tsx'), 'utf8')

  assert.match(source, /endOfUpcomingWindowSeconds = nowSeconds \+ 7 \* 24 \* 60 \* 60/)
  assert.doesNotMatch(source, /endOfTomorrow/)
})

test('sidebar uses an abbreviated month inside a non-wrapping date label', () => {
  const component = fs.readFileSync(
    path.join(sourceRoot, 'components/organisms/NotetakerSidebar/index.tsx'),
    'utf8',
  )
  const styles = fs.readFileSync(
    path.join(sourceRoot, 'components/organisms/NotetakerSidebar/style.scss'),
    'utf8',
  )

  assert.match(component, /date\.format\('MMM'\)/)
  assert.doesNotMatch(component, /Object\.entries\(upcomingEvents\)\s*\.slice\(0, 5\)/)
  assert.match(styles, /&__calendar-date-meta\s*\{[^}]*white-space:\s*nowrap;/s)
})

test('background sync refreshes every locally connected Google account', () => {
  const connectionHook = fs.readFileSync(
    path.join(sourceRoot, 'hooks/connections/useConnections.tsx'),
    'utf8',
  )
  const googleHook = fs.readFileSync(
    path.join(sourceRoot, 'hooks/connections/useGoogleConnections.tsx'),
    'utf8',
  )

  assert.match(connectionHook, /getConnections\(email, \{ includeAllUsers: true \}\)/)
  assert.match(connectionHook, /await Promise\.all\(\[/)
  assert.match(googleHook, /driveConn\.ownerEmail \|\| email/)
  assert.match(googleHook, /gmailConn\.ownerEmail \|\| email/)
  assert.match(googleHook, /calConn\.ownerEmail \|\| email/)
})

test('aggregate connection keys keep legacy single-account services addressable', () => {
  const api = fs.readFileSync(path.join(sourceRoot, 'api/connections.tsx'), 'utf8')

  assert.match(api, /multiAccountScopes\.has\(scope as ConnectionKeys\)/)
  assert.doesNotMatch(api, /:\s*options\?\.includeAllUsers\s*\?\s*`\$\{scope\}\|\$\{ownerEmail\}`/s)
})

test('failed Google Calendar fetches stay stale and report the owning account', () => {
  const calendar = fs.readFileSync(
    path.resolve(__dirname, '..', 'src-tauri', 'src', 'connections', 'google', 'calendar.rs'),
    'utf8',
  )
  const app = fs.readFileSync(path.join(sourceRoot, 'App.tsx'), 'utf8')

  assert.match(calendar, /let mut sync_succeeded = true;/)
  assert.match(calendar, /Err\(error\) => \{[\s\S]*?sync_succeeded = false;/)
  assert.match(calendar, /if sync_succeeded \{[\s\S]*?delete_calendar_events_removed[\s\S]*?update_last_sync_by_id/)
  assert.match(calendar, /success: sync_succeeded/)
  assert.match(calendar, /owner_email: Some\(email\)/)
  assert.match(app, /calendarConnectionKey\(calendarAccountEmail, event\.payload\.owner_email\)/)
  assert.match(app, /event\.payload\.success \? ConnectionStates\.UP_TO_DATE : ConnectionStates\.FAILED/)
})
