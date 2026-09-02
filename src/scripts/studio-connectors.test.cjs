const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const test = require('node:test')
const { transform } = require('esbuild')

let connectorModule

async function loadConnectorModule() {
  if (connectorModule) return connectorModule
  const source = await fs.readFile(new URL('../src/utils/studioConnectors.ts', `file://${__filename}`), 'utf8')
  const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' })
  connectorModule = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
  return connectorModule
}

test('fallback catalog is limited to configured Composio connectors', async () => {
  const { FALLBACK_COMPOSIO_CONNECTORS } = await loadConnectorModule()
  assert.equal(FALLBACK_COMPOSIO_CONNECTORS.length, 25)
  assert.equal(new Set(FALLBACK_COMPOSIO_CONNECTORS.map(connector => connector.id)).size, 25)
})

test('suggests a named unconnected connector', async () => {
  const { detectStudioConnectorSuggestion } = await loadConnectorModule()
  const suggestion = detectStudioConnectorSuggestion('Check the latest issues in Jira', [], [])
  assert.equal(suggestion?.connectors[0]?.id, 'jira')
})

test('does not suggest a named connector that is already connected', async () => {
  const { detectStudioConnectorSuggestion } = await loadConnectorModule()
  const suggestion = detectStudioConnectorSuggestion(
    'Check the latest Jira issues',
    ['jira'],
    [],
  )
  assert.equal(suggestion, null)
})

test('allows an explicit reconnect action for an already connected connector', async () => {
  const { detectStudioConnectorSuggestion } = await loadConnectorModule()
  const suggestion = detectStudioConnectorSuggestion(
    'Reconnect Jira',
    ['jira'],
    [],
    undefined,
    true,
  )
  assert.equal(suggestion?.connectors[0]?.id, 'jira')
  assert.equal(suggestion?.label, 'Reconnect Jira?')
})

test('uses connectors delivered dynamically by Studio', async () => {
  const { detectStudioConnectorSuggestion, normalizeStudioConnectorCatalog } = await loadConnectorModule()
  const catalog = normalizeStudioConnectorCatalog([{
    id: 'future_crm',
    scope: 'future_crm',
    name: 'Future CRM',
    description: 'A connector added after this Desktop build',
    category: 'crm',
    keywords: ['future crm'],
  }])
  const suggestion = detectStudioConnectorSuggestion('Open Future CRM', [], [], catalog)
  assert.equal(suggestion?.connectors[0]?.id, 'future_crm')
})

test('treats a successful empty Studio catalog as authoritative', async () => {
  const { normalizeStudioConnectorCatalog } = await loadConnectorModule()
  assert.deepEqual(normalizeStudioConnectorCatalog([]), [])
})

test('respects dismissed suggestions and ignores unrelated chat', async () => {
  const { detectStudioConnectorSuggestion } = await loadConnectorModule()
  assert.equal(detectStudioConnectorSuggestion('Use Confluence', [], ['confluence']), null)
  assert.equal(detectStudioConnectorSuggestion('Write a birthday poem', [], []), null)
})

test('recognizes explicit inline connection requests', async () => {
  const { isStudioConnectIntent } = await loadConnectorModule()
  assert.equal(isStudioConnectIntent('connect to clickup'), true)
  assert.equal(isStudioConnectIntent('please reconnect Studio'), true)
  assert.equal(isStudioConnectIntent('show my ClickUp tasks'), false)
})

test('recognizes agent responses reporting a missing connector', async () => {
  const { reportsMissingStudioConnector } = await loadConnectorModule()
  assert.equal(reportsMissingStudioConnector('The ClickUp connector is not currently connected.'), true)
  assert.equal(reportsMissingStudioConnector('Connect ClickUp first, then I can create it.'), true)
  assert.equal(reportsMissingStudioConnector('The meeting transcript is not available.'), false)
  assert.equal(reportsMissingStudioConnector('The ClickUp connector is unavailable.'), true)
  assert.equal(reportsMissingStudioConnector('I created the ClickUp task.'), false)
})

test('chat applies account-wide connector context and inline recovery to gateway replies', async () => {
  const chatSource = await fs.readFile(
    new URL('../src/components/organisms/ClawdChat/index.tsx', `file://${__filename}`),
    'utf8',
  )
  assert.match(chatSource, /trusted account-wide connector inventory/)
  assert.match(chatSource, /userText: text/)
  assert.match(chatSource, /surfaceMissingStudioConnector\(displayText\)/)
  assert.match(chatSource, /studioAvailableConnectorsRef\.current,\s*true,/)
})

test('settings exposes multi-account Slack OAuth separately from agent channels', async () => {
  const settingsSource = await fs.readFile(
    new URL('../src/components/templates/Home/components/SettingsDialog/index.tsx', `file://${__filename}`),
    'utf8',
  )
  const serviceSource = await fs.readFile(
    new URL('../src-tauri/src/clawd/service.rs', `file://${__filename}`),
    'utf8',
  )
  const actixSource = await fs.readFile(
    new URL('../src-tauri/src/server/actix.rs', `file://${__filename}`),
    'utf8',
  )

  assert.match(settingsSource, /Slack accounts/)
  assert.match(settingsSource, /Connect another/)
  assert.match(settingsSource, /does not add an agent to Slack/)
  assert.match(settingsSource, /studio-connectors\/slack\/oauth-start/)
  assert.match(settingsSource, /studio-connectors\/accounts\/\$\{connectionId\}/)
  assert.match(serviceSource, /start_studio_connector_oauth/)
  assert.match(serviceSource, /remove_studio_connector_account/)
  assert.match(actixSource, /service\(clawd::service::start_studio_connector_oauth\)/)
})

test('embedded browser tab and screenshot polling are independently serialized', async () => {
  const browserSource = await fs.readFile(
    new URL('../src/components/organisms/EmbeddedBrowserSidebar/index.tsx', `file://${__filename}`),
    'utf8',
  )
  assert.match(browserSource, /tabsPendingRef/)
  assert.match(browserSource, /window\.setTimeout\(pollTabs, TABS_INTERVAL_MS\)/)
  assert.match(browserSource, /window\.setTimeout\(pollScreenshot, SCREENSHOT_INTERVAL_MS\)/)
  const tabPoller = browserSource.slice(browserSource.indexOf('const pollTabs'), browserSource.indexOf('const pollScreenshot'))
  const screenshotPollerStart = browserSource.indexOf('const pollScreenshot')
  const screenshotPoller = browserSource.slice(
    screenshotPollerStart,
    browserSource.indexOf('}, [refreshScreenshot])', screenshotPollerStart),
  )
  assert.doesNotMatch(tabPoller, /refreshScreenshot/)
  assert.doesNotMatch(screenshotPoller, /refreshTabs/)
  assert.doesNotMatch(browserSource, /window\.setInterval\(refreshScreenshot/)
  assert.doesNotMatch(browserSource, /const tabsTimer = window\.setInterval/)
})

test('group runtime bypasses single-agent shortcuts and aborts timed-out members', async () => {
  const browserBackendSource = await fs.readFile(
    new URL('../src-tauri/src/clawd/browser.rs', `file://${__filename}`),
    'utf8',
  )
  const harnessSource = await fs.readFile(
    new URL('../src-tauri/src/clawd/harness.rs', `file://${__filename}`),
    'utf8',
  )
  const gatewaySource = await fs.readFile(
    new URL('../src-tauri/src/clawd/gateway_client.rs', `file://${__filename}`),
    'utf8',
  )
  assert.match(browserBackendSource, /if !is_group_agent_request\(&body\)/)
  assert.match(browserBackendSource, /google_capability_reply\(email, user_text\)/)
  assert.match(harnessSource, /abort_chat_session\(&session_key, None\)/)
  assert.match(gatewaySource, /"chat\.abort"/)
})
