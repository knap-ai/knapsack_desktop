// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Workspace, WorkspaceDocument } from 'src/api/workspaces'
import { afterEach, expect, it, vi } from 'vitest'

import WorkspaceView from './index'

const mocks = vi.hoisted(() => ({ get: vi.fn(), timeline: vi.fn() }))
vi.mock('src/api/workspaces', async original => ({
  ...(await original<typeof import('src/api/workspaces')>()),
  getWorkspace: mocks.get,
  getWorkspaceTimeline: (...args: unknown[]) => Promise.resolve(mocks.timeline(...args)).then((value: unknown) => value || { displayName: null, sources: [], truncated: false }),
}))

const documents = [
  {
    id: 1,
    documentName: 'Planning meeting',
    summary: 'Review roadmap',
    autoTags: '["planning"]',
    tags: null,
  },
  {
    id: 2,
    documentName: 'Follow-up email',
    summary: 'Budget agreement',
    autoTags: '[]',
    tags: null,
  },
] as WorkspaceDocument[]
const workspace = {
  uuid: 'synthetic-person',
  name: 'Alex',
  entityType: 'person',
  entityKey: 'alex@example.test',
  documents,
} as Workspace
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})
it('opens selected person chat only on explicit click, without auto-sending a suggested action', () => {
  mocks.get.mockResolvedValue({ success: true, data: workspace })
  localStorage.setItem(
    'knap.library.summary.synthetic-person',
    JSON.stringify({ summary: 'Synthetic summary', nextAction: 'Send an email' }),
  )
  const open = vi.fn(),
    send = vi.fn()
  window.addEventListener('clawd-send-user', send)
  render(<WorkspaceView workspace={workspace} onBack={vi.fn()} onOpenPersonChat={open} />)
  expect(open).not.toHaveBeenCalled()
  expect(screen.queryByTitle('Send to Chat')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alex' }))
  expect(open).toHaveBeenCalledWith(workspace, screen.getByRole('button', { name: 'Chat about Alex' }))
  expect(send).not.toHaveBeenCalled()
  window.removeEventListener('clawd-send-user', send)
})
it('filters saved metadata immediately and handles replacing a previous query', () => {
  mocks.get.mockResolvedValue({ success: true, data: workspace })
  render(<WorkspaceView workspace={workspace} onBack={vi.fn()} />)
  const filter = screen.getByRole('textbox', { name: 'Filter saved items' })
  fireEvent.change(filter, { target: { value: 'roadmap' } })
  expect(screen.getByText('Planning meeting')).toBeTruthy()
  expect(screen.queryByText('Follow-up email')).toBeNull()
  fireEvent.change(filter, { target: { value: 'Budget' } })
  expect(screen.getByText('Follow-up email')).toBeTruthy()
  expect(screen.queryByText('Planning meeting')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
  expect(screen.getByText('Planning meeting')).toBeTruthy()
  expect(screen.getByText('Follow-up email')).toBeTruthy()
})

it('defaults a project to the same story view while keeping its documents accessible', async () => {
  const project = { ...workspace, uuid: 'synthetic-project', name: 'North Star', entityType: 'project' }
  mocks.get.mockResolvedValue({ success: true, data: project })
  render(<WorkspaceView workspace={project} onBack={vi.fn()} />)
  expect(screen.getByRole('heading', { name: 'North Star' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Timeline' }).getAttribute('aria-pressed')).toBe('true')
  await waitFor(() => expect(screen.getByRole('region', { name: 'Timeline' })).toBeTruthy())
  fireEvent.click(screen.getByRole('button', { name: 'Documents · 2' }))
  expect(screen.getByRole('button', { name: '+ Add Files' })).toBeTruthy()
})
it('resolves a proper person name and leaves email secondary', async () => {
  const person = { ...workspace, name: 'alex@example.test' }
  mocks.get.mockResolvedValue({ success: true, data: person })
  mocks.timeline.mockResolvedValue({ displayName: 'Alex Rivera', sources: [], truncated: false })
  render(<WorkspaceView workspace={person} onBack={vi.fn()} />)
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Alex Rivera' })).toBeTruthy())
  expect(screen.queryByRole('heading', { name: 'alex@example.test' })).toBeNull()
  expect(screen.getByText('alex@example.test')).toBeTruthy()
})
