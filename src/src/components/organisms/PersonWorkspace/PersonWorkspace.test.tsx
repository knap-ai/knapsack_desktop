// @vitest-environment jsdom
import { useState } from 'react'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Workspace } from 'src/api/workspaces'
import { afterEach, expect, it, vi } from 'vitest'

import PersonWorkspace from './index'

const mocks = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn(), chat: vi.fn() }))
vi.mock('src/api/workspaces', async original => ({
  ...(await original<typeof import('src/api/workspaces')>()),
  getWorkspace: mocks.get,
  updateWorkspace: mocks.update,
}))
vi.mock('../ClawdChat', () => ({
  default: function MockClawdChat(props: {
    title: string
    contextPrefix: string
    chatId: string
    foregroundActive: boolean
    onBusyChange?: (busy: boolean) => void
  }) {
    mocks.chat(props)
    const [draft, setDraft] = useState('')
    return (
      <section aria-label={props.title}>
        <p>{props.contextPrefix}</p>
        <button onClick={()=>props.onBusyChange?.(true)}>Start synthetic reply</button>
        <button onClick={()=>props.onBusyChange?.(false)}>Finish synthetic reply</button>
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
  fireEvent.click(screen.getByRole('button', { name: 'Minimize person chat' }))
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

it('uses the saved corrected person snapshot for title and identity without losing an existing draft', async () => {
  mocks.get.mockResolvedValue({ success: true, data: person })
  const corrected = { ...person, name: 'Alexa Corrected' }
  mocks.update.mockResolvedValue({ success: true, data: corrected })
  const { rerender } = render(<PersonWorkspace workspace={person} userEmail="owner@example.test" onBack={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alex' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Person chat draft' }), { target: { value: 'Keep synthetic draft' } })
  fireEvent.click(screen.getByRole('button', { name: 'Minimize person chat' }))
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
  fireEvent.change(screen.getByDisplayValue('Alex'), { target: { value: corrected.name } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Chat about Alexa Corrected' })).toBeTruthy())
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alexa Corrected' }))
  expect(screen.getByRole('region', { name: 'Chat about Alexa Corrected' })).toBeTruthy()
  const props = mocks.chat.mock.calls[mocks.chat.mock.calls.length - 1][0]
  expect(props.contextPrefix).toContain('"name":"Alexa Corrected"')
  expect(props.contextPrefix).toContain('alex@example.test')
  expect(props.chatId).toBe('person:owner%40example.test:person-a')
  expect((screen.getByRole('textbox', { name: 'Person chat draft' }) as HTMLTextAreaElement).value).toBe('Keep synthetic draft')
  expect(screen.getByRole('button', { name: 'Minimize person chat' })).toBeTruthy()
  rerender(<PersonWorkspace workspace={person} userEmail="other@example.test" onBack={vi.fn()} />)
  expect(screen.queryByRole('textbox', { name: 'Person chat draft' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alex' }))
  const other = mocks.chat.mock.calls[mocks.chat.mock.calls.length - 1][0]
  expect(other.chatId).toBe('person:other%40example.test:person-a')
  expect(other.contextPrefix).toContain('"name":"Alex"')
  expect(other.contextPrefix).not.toContain('Alexa Corrected')
  fireEvent.click(screen.getByRole('button', { name: 'Minimize person chat' }))
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alex' }))
  expect(mocks.chat.mock.calls[mocks.chat.mock.calls.length - 1][0].contextPrefix).not.toContain('Alexa Corrected')
})
it('does not automatically reopen person chat after sign-out and return to the account', () => {
  mocks.get.mockResolvedValue({ success: true, data: person })
  const { rerender } = render(<PersonWorkspace workspace={person} userEmail="owner@example.test" onBack={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alex' }))
  expect(screen.getByRole('textbox', { name: 'Person chat draft' })).toBeTruthy()
  rerender(<PersonWorkspace workspace={person} userEmail="" onBack={vi.fn()} />)
  expect(screen.queryByRole('textbox', { name: 'Person chat draft' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Chat about Alex' })).toBeNull()
  rerender(<PersonWorkspace workspace={person} userEmail="owner@example.test" onBack={vi.fn()} />)
  expect(screen.queryByRole('textbox', { name: 'Person chat draft' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Chat about Alex' }))
  expect(screen.getByRole('textbox', { name: 'Person chat draft' })).toBeTruthy()
})

it('opens over the visible profile, preserves the mounted draft and restores launcher focus on minimize', () => {
 mocks.get.mockResolvedValue({success:true,data:person});const onBack=vi.fn();render(<PersonWorkspace workspace={person} userEmail="owner@example.test" onBack={onBack}/>);
 const launch=screen.getByRole('button',{name:'Chat about Alex'});fireEvent.click(launch);
 const overlay=screen.getByRole('region',{name:'Person chat'});expect(overlay.className).toContain('notetaker-note__chat-overlay');expect(screen.getByRole('heading',{name:'Alex'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Start synthetic reply'}));fireEvent.click(screen.getByRole('button',{name:'Minimize person chat'}));
 expect(document.activeElement).toBe(launch);expect(overlay.hasAttribute('hidden')).toBe(true);expect(screen.getByText('Person chat is still working').textContent).toContain('still working');expect(onBack).not.toHaveBeenCalled();
 fireEvent.click(launch);expect(screen.getByRole('region',{name:'Person chat'})).toBe(overlay);
 const props=mocks.chat.mock.calls[mocks.chat.mock.calls.length-1][0];expect(props.compact).toBe(true);expect(props.active).toBe(true);expect(props.foregroundActive).toBe(true);expect(props).not.toHaveProperty('initialInput');expect(props).not.toHaveProperty('submitRequest');
 const handle=screen.getByRole('button',{name:'Resize person chat. Drag up to expand or down to collapse.'});fireEvent.keyDown(handle,{key:'ArrowUp'});expect(overlay.style.height).toBe('500px');
})
