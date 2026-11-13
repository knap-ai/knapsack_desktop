// @vitest-environment jsdom
import { useState } from 'react'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Workspace } from 'src/api/workspaces'
import { afterEach, expect, it, vi } from 'vitest'

import PersonWorkspace from './index'

const mocks = vi.hoisted(() => ({ get: vi.fn(), chat: vi.fn() }))
vi.mock('src/api/workspaces', async original => ({
  ...(await original<typeof import('src/api/workspaces')>()),
  getWorkspace: mocks.get,
}))
vi.mock('../ClawdChat', () => ({
  default: function MockClawdChat(props: {
    title: string
    contextPrefix: string
    chatId: string
    foregroundActive: boolean
  }) {
    mocks.chat(props)
    const [draft, setDraft] = useState('')
    return (
      <section aria-label={props.title}>
        <p>{props.contextPrefix}</p>
        <textarea
          aria-label="Person chat draft"
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
      </section>
    )
  },
}))

const person: Workspace = {
  id: 1,
  uuid: 'person-a',
  entityType: 'person',
  name: 'Alex',
  entityKey: 'alex@example.test',
  documents: [],
  description: null,
  icon: null,
  createdAt: null,
  updatedAt: null,
  autoCurated: 1,
  lastCuratedAt: null,
}
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})
it('opens the person chat branch without sending and retains an unsent draft on return', () => {
  mocks.get.mockResolvedValue({ success: true, data: person })
  render(<PersonWorkspace workspace={person} userEmail="owner@example.test" onBack={vi.fn()} />)
  expect(mocks.chat).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alex' }))
  expect(screen.getByRole('region', { name: 'Chat about Alex' })).toBeTruthy()
  const props = mocks.chat.mock.calls[mocks.chat.mock.calls.length - 1][0]
  expect(props.contextPrefix).toContain('alex@example.test')
  expect(props.chatId).toBe('person:owner%40example.test:person-a')
  expect(props).not.toHaveProperty('submitRequest')
  fireEvent.change(screen.getByRole('textbox', { name: 'Person chat draft' }), {
    target: { value: 'Unsent synthetic question' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Back to Alex' }))
  expect(mocks.chat.mock.calls[mocks.chat.mock.calls.length - 1][0].foregroundActive).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alex' }))
  expect(
    (screen.getByRole('textbox', { name: 'Person chat draft' }) as HTMLTextAreaElement).value,
  ).toBe('Unsent synthetic question')
})
it('does not offer person chat for a project or missing account', () => {
  mocks.get.mockResolvedValue({ success: true, data: person })
  const { rerender } = render(<PersonWorkspace workspace={person} userEmail="" onBack={vi.fn()} />)
  expect(screen.queryByRole('button', { name: 'Chat about Alex' })).toBeNull()
  rerender(
    <PersonWorkspace
      workspace={{ ...person, entityType: 'project' }}
      userEmail="owner@example.test"
      onBack={vi.fn()}
    />,
  )
  expect(screen.queryByRole('button', { name: 'Chat about Alex' })).toBeNull()
  expect(mocks.chat).not.toHaveBeenCalled()
})
