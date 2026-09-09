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

test('periodic calendar refresh rediscovers accounts without UI-state timer churn', () => {
  const app = fs.readFileSync(path.join(sourceRoot, 'App.tsx'), 'utf8')
  const connectionHook = fs.readFileSync(
    path.join(sourceRoot, 'hooks/connections/useConnections.tsx'),
    'utf8',
  )

  assert.match(
    app,
    /const refreshedConnections = await handlers\.fetchConnections\(userEmail\)[\s\S]*?await handlers\.syncConnections\(userEmail, refreshedConnections\)/,
  )
  assert.match(
    app,
    /try \{[\s\S]*?handlers\.fetchConnections\(userEmail\)[\s\S]*?\} catch \(error\) \{[\s\S]*?await handlers\.syncMeetings\(\)/,
  )
  assert.doesNotMatch(
    app,
    /const fiveMinutesInterval = setInterval[\s\S]*?syncConnections\(userEmail, connections\)/,
  )
  assert.match(connectionHook, /return discoveredConnections/)
  assert.match(connectionHook, /\},\n\s*\[\],\n\s*\)/)
  assert.match(app, /const periodicSyncRef = useRef\(/)
  assert.match(app, /void runBackgroundSync\(\)/)
  assert.match(app, /setInterval\(runBackgroundSync, MINUTE_MS \* 5\)[\s\S]*?\}, \[userEmail\]\)/)
  assert.match(
    app,
    /listen\('custom-focus'[\s\S]*?await fetchConnections\(email\)[\s\S]*?await syncConnections\(email, refreshedConnections\)/,
  )
  assert.doesNotMatch(app, /listen\('custom-focus'[\s\S]*?getGoogleGmailConnections\(connections\)/)
})

test('Gmail sync reports real completion and tolerates malformed messages', () => {
  const gmail = fs.readFileSync(
    path.resolve(__dirname, '..', 'src-tauri', 'src', 'connections', 'google', 'gmail.rs'),
    'utf8',
  )

  assert.match(gmail, /let sync_succeeded = fetching_day_result\.is_ok\(\);/)
  assert.match(gmail, /FetchEmailEventPayload \{\s*success: sync_succeeded,/)
  assert.doesNotMatch(gmail, /FetchEmailEventPayload \{ success: true \}/)
  assert.match(gmail, /\.messages\.unwrap_or_default\(\)/)
  assert.match(gmail, /\.payload\s*\.ok_or_else/)
  assert.doesNotMatch(gmail, /list_request\.doit\(\)\.await\.unwrap\(\)/)
  assert.doesNotMatch(gmail, /task\.await\.unwrap\(\)/)
  assert.doesNotMatch(gmail, /message(?:\.clone\(\))?\.id\.unwrap\(\)/)
  assert.doesNotMatch(gmail, /semaphore_clone\.acquire\(\)\.await\.unwrap\(\)/)
  assert.doesNotMatch(gmail, /from_utf8\([^)]*\)\s*\.expect\(/)
  assert.match(gmail, /had_fetch_errors_clone\.store\(true, Ordering::Relaxed\)/)
  assert.match(gmail, /Email::mark_deleted_emails[\s\S]*?update_last_sync_by_id[\s\S]*?if had_fetch_errors\.load\(Ordering::Relaxed\)/)
  assert.doesNotMatch(gmail, /if had_fetch_errors\.load\(Ordering::Relaxed\) \{\s*return Err/)
})

test('failed Gmail fetches stay failed and identify the precise mailbox', () => {
  const gmail = fs.readFileSync(
    path.resolve(__dirname, '..', 'src-tauri', 'src', 'connections', 'google', 'gmail.rs'),
    'utf8',
  )
  const app = fs.readFileSync(path.join(sourceRoot, 'App.tsx'), 'utf8')

  assert.match(gmail, /account_email: Some\(account_email\.clone\(\)\)/)
  assert.match(gmail, /owner_email: Some\(email\.clone\(\)\)/)
  assert.match(app, /gmailConnectionKey\(event\.payload\.account_email, event\.payload\.owner_email\)/)
  assert.match(app, /ConnectionStates\.FAILED/)
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
