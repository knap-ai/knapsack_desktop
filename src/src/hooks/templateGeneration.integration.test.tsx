// @vitest-environment jsdom
import { useState } from 'react'

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { deleteTranscript, getTranscript } from 'src/api/transcripts'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { shouldSaveTranscript } from 'src/utils/settings'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useTemplateNotesGeneration } from '../components/organisms/MeetingNotesMode/useTemplateNotesGeneration'

import { useMeetingSynthesis } from './useMeetingMode'

vi.mock('src/api/transcripts', () => ({ getTranscript: vi.fn(), deleteTranscript: vi.fn() }))
vi.mock('src/utils/KNLocalStorage', () => ({ KNLocalStorage: { getItem: vi.fn() } }))
vi.mock('src/utils/settings', () => ({
  shouldSaveTranscript: vi.fn(),
  isSharingEnabled: () => false,
}))
vi.mock('src/utils/postMeetingSource', () => ({ capturePostMeetingSource: vi.fn() }))
vi.mock('src/utils/KNAnalytics', () => ({ default: { trackEvent: vi.fn() } }))
vi.mock('src/utils/errorHandling', () => ({ logError: vi.fn() }))
vi.mock('src/utils/frontendLog', () => ({ pushFrontendLog: vi.fn() }))
const template = {
  key: 'synthetic',
  title: 'Synthetic',
  prompt: 'Synthetic template',
  user_facing_description: '',
}
let owner = { uuid: 'synthetic-owner', email: 'owner@example.test', name: 'Synthetic Owner' },
  nextThread = 8800
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  owner = { uuid: 'synthetic-owner', email: 'owner@example.test', name: 'Synthetic Owner' }
  vi.mocked(getTranscript).mockResolvedValue({
    content: 'Synthetic saved transcript: Alex will review the scope.',
  } as Awaited<ReturnType<typeof getTranscript>>)
  vi.mocked(KNLocalStorage.getItem).mockImplementation(async key =>
    key === 'KN_PROFILE' ? owner : null,
  )
  vi.mocked(shouldSaveTranscript).mockResolvedValue(false)
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) })),
  )
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function scene(mode: 'save' | 'preview' = 'save') {
  const queue = vi.fn(),
    failures: unknown[] = [],
    finish = vi.fn()
  const thread = nextThread++
  function Screen() {
    const [selected, select] = useState('A'),
      [email, setEmail] = useState(owner.email),
      [id, setId] = useState(thread),
      [draft, setDraft] = useState('Synthetic manual draft'),
      [editing, setEditing] = useState(false)
    const t = { ...template, key: selected, prompt: 'Template ' + selected }
    const h = useMeetingSynthesis(null, queue, finish, t, { email }, email)
    const generate = async () => {
      try {
        await h.synthesizeContent(id, draft, undefined, mode)
      } catch (e) {
        failures.push(e)
      }
    }
    const pending = useTemplateNotesGeneration({
      template: selected,
      scope: JSON.stringify([email, id]),
      threadId: id,
      enabled: true,
      blocked: editing,
      generate,
    })
    return (
      <>
        <button onClick={() => void generate()}>Start</button>
        <button
          onClick={() => {
            owner = { ...owner, email: 'other@example.test' }
            setEmail(owner.email)
          }}
        >
          Switch account
        </button>
        <button onClick={() => setId(id + 1)}>Switch thread</button>
        <button onClick={() => setEditing(!editing)}>Toggle editing</button>
        <input aria-label="Draft" value={draft} onChange={e => setDraft(e.target.value)} />
        <select aria-label="Template" value={selected} onChange={e => select(e.target.value)}>
          {['A', 'B', 'C'].map(x => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <output>{h.retryPreview?.markdown}</output>
        {pending && <p role="status">Template change pending</p>}
      </>
    )
  }
  const view = render(<Screen />)
  return { queue, failures, view, finish }
}
async function start(f: ReturnType<typeof scene>) {
  fireEvent.click(screen.getByText('Start'))
  await waitFor(() => expect(f.queue).toHaveBeenCalledTimes(1))
}
function select(value: string) {
  fireEvent.change(screen.getByLabelText('Template'), { target: { value } })
}
async function complete(f: ReturnType<typeof scene>, index = 0) {
  await act(async () => {
    await f.queue.mock.calls[index][0].messageFinishCallback('Synthetic notes ' + index)
  })
}
it('runs latest C after delayed A, without duplicate jobs; saves only through existing notes route', async () => {
  vi.mocked(shouldSaveTranscript).mockResolvedValue(true)
  const f = scene()
  await start(f)
  select('B')
  select('C')
  expect(screen.getByText('Template change pending')).toBeTruthy()
  expect(f.queue).toHaveBeenCalledTimes(1)
  await complete(f)
  await waitFor(() => expect(f.queue).toHaveBeenCalledTimes(2))
  const request = f.queue.mock.calls[1][0]
  expect(JSON.stringify(request)).toContain('Template C')
  expect(request.additionalDocuments[1].content).toBe('Synthetic manual draft')
  await complete(f, 1)
  expect(f.queue).toHaveBeenCalledTimes(2)
  expect(f.failures).toEqual([])
  expect(deleteTranscript).not.toHaveBeenCalled()
  expect(fetch).toHaveBeenCalledTimes(2)
  for (const [url] of vi.mocked(fetch).mock.calls)
    expect(String(url)).toMatch(/\/api\/knapsack\/notes$/)
})
it('A then B generates B exactly once after A settles', async () => {
  const f = scene('preview')
  await start(f)
  select('B')
  await complete(f)
  await waitFor(() => expect(f.queue).toHaveBeenCalledTimes(2))
  expect(JSON.stringify(f.queue.mock.calls[1][0])).toContain('Template B')
  await complete(f, 1)
  expect(f.failures).toEqual([])
  expect(fetch).not.toHaveBeenCalled()
})
it.each(['Switch account', 'Switch thread'])(
  'does not replay a pending selection across %s',
  async label => {
    const f = scene('preview')
    await start(f)
    select('B')
    fireEvent.click(screen.getByText(label))
    await complete(f)
    await act(async () => {
      await new Promise(r => setTimeout(r, 20))
    })
    expect(f.queue).toHaveBeenCalledTimes(1)
    expect(fetch).not.toHaveBeenCalled()
  },
)
it('profile invalidation without a rerender still cancels queued work', async () => {
  const f = scene('preview')
  await start(f)
  select('B')
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  await complete(f)
  await act(async () => {
    await new Promise(r => setTimeout(r, 20))
  })
  expect(f.queue).toHaveBeenCalledTimes(1)
  expect(fetch).not.toHaveBeenCalled()
})
it('defers while editing and uses the latest draft only after editing ends', async () => {
  vi.mocked(shouldSaveTranscript).mockResolvedValue(true)
  const f = scene()
  await start(f)
  select('B')
  fireEvent.click(screen.getByText('Toggle editing'))
  fireEvent.change(screen.getByLabelText('Draft'), {
    target: { value: 'Newer preserved manual draft' },
  })
  await complete(f)
  expect(f.queue).toHaveBeenCalledTimes(1)
  expect((screen.getByLabelText('Draft') as HTMLInputElement).value).toBe(
    'Newer preserved manual draft',
  )
  fireEvent.click(screen.getByText('Toggle editing'))
  await waitFor(() => expect(f.queue).toHaveBeenCalledTimes(2))
  expect(f.queue.mock.calls[1][0].additionalDocuments[1].content).toBe(
    'Newer preserved manual draft',
  )
  await complete(f, 1)
})
it('returning to A and unmounting discard pending requests', async () => {
  const f = scene('preview')
  await start(f)
  select('B')
  select('A')
  f.view.unmount()
  await complete(f)
  expect(f.queue).toHaveBeenCalledTimes(1)
  expect(fetch).not.toHaveBeenCalled()
})

it('a failed A releases admission for the newest selection without duplicate queueing', async () => {
  const f = scene('preview')
  await start(f)
  select('B')
  select('B')
  await act(async () => {
    f.queue.mock.calls[0][0].errorCallback(new Error('Synthetic failure'))
  })
  await waitFor(() => expect(f.queue).toHaveBeenCalledTimes(2))
  expect(JSON.stringify(f.queue.mock.calls[1][0])).toContain('Template B')
  await complete(f, 1)
  expect(f.queue).toHaveBeenCalledTimes(2)
  expect(f.failures).toHaveLength(1)
  expect(fetch).not.toHaveBeenCalled()
})

it('opening the editor during admitted B does not leave a permanent pending label or duplicate B', async () => {
  const f = scene('preview')
  await start(f)
  select('B')
  await complete(f)
  await waitFor(() => expect(f.queue).toHaveBeenCalledTimes(2))
  fireEvent.click(screen.getByText('Toggle editing'))
  await complete(f, 1)
  await waitFor(() => expect(screen.queryByText('Template change pending')).toBeNull())
  fireEvent.click(screen.getByText('Toggle editing'))
  expect(f.queue).toHaveBeenCalledTimes(2)
})
