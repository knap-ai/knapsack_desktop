// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RelationshipSource, WorkspaceDocument } from 'src/api/workspaces'
import { afterEach, expect, it, vi } from 'vitest'

import RelationshipTimeline from './RelationshipTimeline'

const mocks = vi.hoisted(() => ({ open: vi.fn() }))
vi.mock('@tauri-apps/api/shell', () => ({ open: mocks.open }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
const documents = [
  {
    id: 1,
    documentName: 'Project kickoff',
    sourceType: 'calendar',
    sourceId: '42',
    summary: 'Agreed scope',
    tags: null,
    autoTags: null,
  },
] as WorkspaceDocument[]
const source = {
  documentId: 1,
  sourceId: '42',
  kind: 'calendar',
  occurredAt: 1700000000,
  dateKind: 'occurred',
  url: null,
  available: true,
  account: 'test@example.test',
} as RelationshipSource
it('opens the exact source only on explicit click', () => {
  const open = vi.fn().mockResolvedValue(undefined)
  render(
    <RelationshipTimeline
      documents={documents}
      evidence={{ displayName: null, sources: [source], truncated: false }}
      loading={false}
      error={false}
      onRetry={vi.fn()}
      onOpenCalendar={open}
    />,
  )
  expect(open).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Calendar event ↗' }))
  expect(open).toHaveBeenCalledWith(source)
  expect(mocks.open).not.toHaveBeenCalled()
})
it('recovers evidence loading without inventing a story', () => {
  const retry = vi.fn()
  render(
    <RelationshipTimeline
      documents={documents}
      evidence={null}
      loading={false}
      error={true}
      onRetry={retry}
    />,
  )
  expect(screen.queryByRole('heading', { name: 'Project kickoff' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Retry timeline' }))
  expect(retry).toHaveBeenCalledOnce()
})
