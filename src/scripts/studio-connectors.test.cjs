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
  assert.equal(reportsMissingStudioConnector('I created the ClickUp task.'), false)
})
