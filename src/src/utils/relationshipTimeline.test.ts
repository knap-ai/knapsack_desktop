import type { RelationshipSource, WorkspaceDocument } from 'src/api/workspaces'
import { expect, it } from 'vitest'

import {
  buildRelationshipTimeline,
  safeTimelineDestination,
  workspaceDisplayName,
} from './relationshipTimeline'

const doc = (id: number, title: string) =>
  ({
    id,
    documentName: title,
    sourceType: 'email',
    sourceId: String(id),
    createdAt: 1900000000,
    summary: 'Saved summary',
    tags: null,
    autoTags: null,
  }) as WorkspaceDocument
const source = (id: number, occurredAt: number | null, account = 'a@example.test') =>
  ({
    documentId: id,
    sourceId: String(id),
    kind: 'email',
    occurredAt,
    dateKind: 'occurred',
    url: null,
    account,
    available: true,
  }) as RelationshipSource
it('uses proper saved or evidence names for people and project titles', () => {
  expect(
    workspaceDisplayName({ name: 'alex@example.test', entityType: 'person' }, 'Alex Rivera'),
  ).toBe('Alex Rivera')
  expect(workspaceDisplayName({ name: 'Corrected Name', entityType: 'person' }, 'Old Name')).toBe(
    'Corrected Name',
  )
  expect(workspaceDisplayName({ name: 'alex@example.test', entityType: 'person' })).toBe(
    'Unnamed contact',
  )
  expect(workspaceDisplayName({ name: 'North Star', entityType: 'project' })).toBe('North Star')
})
it('orders by evidence date, leaves unknown dates last and suggests size without inventing outcomes', () => {
  const story = buildRelationshipTimeline(
    [doc(1, 'Partnership proposal'), doc(2, 'Check in'), doc(3, 'Undated')],
    [source(1, 1800000000), source(2, 1700000000), source(3, null)],
  )
  expect(story.map(item => item.title)).toEqual(['Check in', 'Partnership proposal', 'Undated'])
  expect(story[1].significance).toBe('major')
  expect(story[2].date).toBeNull()
})
it('clusters exact same-week subjects and retains source identities across inboxes', () => {
  const start = Date.UTC(2026, 10, 16) / 1000
  const story = buildRelationshipTimeline(
    [doc(1, 'Project kickoff'), doc(2, 'Re: Project kickoff'), doc(3, 'Project kickoff')],
    [source(1, start), source(2, start + 3600, 'b@example.test'), source(3, start + 8 * 86400)],
  )
  expect(story).toHaveLength(3)
  expect(story[0].sources).toHaveLength(1)
  expect(story[1].sources[0].evidence.account).toBe('b@example.test')
})
it('rejects executable or credential-bearing source links', () => {
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,x',
    'file:///etc/passwd',
    'https://user:secret@example.test',
    'http://localhost:8897/delete',
    '/tmp/script.sh',
  ])
    expect(safeTimelineDestination(value)).toBeNull()
  expect(
    safeTimelineDestination('https://mail.google.com/mail/?authuser=a%40example.test#all/id')?.kind,
  ).toBe('web')
  expect(safeTimelineDestination('/tmp/report.pdf')?.kind).toBe('file')
})
