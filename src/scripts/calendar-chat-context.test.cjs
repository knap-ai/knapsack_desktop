const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const { transform } = require('esbuild')
async function load(events) {
  const utility = await fs.readFile(`${__dirname}/../src/utils/nativeWorkspaceContext.ts`, 'utf8')
  const compiled = await transform(utility, { loader: 'ts', format: 'esm' })
  const utils = await import(`data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`)
  const component = await fs.readFile(`${__dirname}/../src/components/organisms/ClawdChat/index.tsx`, 'utf8')
  const source = component.slice(component.indexOf('async function fetchEmailCalendarContext('), component.indexOf('// Maps skill names'))
  const { code } = await transform(source, { loader: 'ts', format: 'cjs' })
  let query
  const fetchContext = new Function('DataFetcher', 'nativeCalendarRange', 'getCalendarEvents', 'dayjs', 'truncateWithNotice', 'MAX_NATIVE_PREFETCH_CONTEXT_CHARS', code + '\nreturn fetchEmailCalendarContext;')(
    class { async getRecentGmailMessages() { return [] } async getRecentCalendarEvents() { return [] } },
    text => utils.nativeCalendarRange(text, new Date(2026, 9, 2, 14)),
    async (start, end) => { query = { start, end }; return events },
    require('dayjs'), text => text, 48000,
  )
  return { fetchContext, query: () => query }
}
test('weekly planning supplies work and personal events with account identities', async () => {
  const { fetchContext, query } = await load([
    { title: 'Leadership review', calendar_account_email: 'owner@company.example', start: 1791226800, end: 1791228600, attendees_json: 'not valid JSON' },
    { title: 'School pickup', calendar_account_email: 'owner@gmail.com', start: 1791313200, end: 1791315000, attendees_json: '[]' },
  ])
  const result = await fetchContext(false, 'prepare me for next week')
  assert.equal(result.hasConnectedData, true)
  assert.match(result.text, /Leadership review.*Calendar account: owner@company.example/)
  assert.match(result.text, /School pickup.*Calendar account: owner@gmail.com/)
  assert.equal(new Date(query().start * 1000).getDate(), 5)
  assert.equal(new Date((query().end + 1) * 1000).getDate(), 12)
})
test('empty synced calendars are not presented as proof of no remote events', async () => {
  const { fetchContext } = await load([])
  const result = await fetchContext(false, 'What is happening at bankaya next week?')
  assert.equal(result.hasConnectedData, false)
  assert.match(result.text, /does not establish whether remote calendars contain unsynced events/)
})

test('weekend planning queries Saturday through Monday rather than today', async () => {
  for (const [request, startDay, endDay] of [['prepare me for this weekend', 3, 5], ['plan next weekend', 10, 12]]) {
    const { fetchContext, query } = await load([])
    await fetchContext(false, request)
    assert.equal(new Date(query().start * 1000).getDate(), startDay)
    assert.equal(new Date((query().end + 1) * 1000).getDate(), endDay)
  }
})
