// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { createNotesAutosave } from 'src/utils/notesAutosave'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useMeetingSynthesis } from './useMeetingMode'

const state = vi.hoisted(() => ({
  profile: { uuid: 'A', email: 'a@example.invalid', name: 'Alice', sharing_permission: 1 } as {
    uuid: string
    email: string
    name: string
    sharing_permission: number
  } | null,
}))
vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: {
    getItem: vi.fn(async (key: string) => (key === 'KN_PROFILE' ? state.profile : null)),
  },
}))
vi.mock('src/api/transcripts', () => ({
  getTranscript: vi.fn(async () => ({ content: 'Synthetic meeting transcript' })),
  deleteTranscript: vi.fn(),
}))
vi.mock('src/api/connections', () => ({
  getApiToken: vi.fn(async (email: string) => `synthetic-token:${email}`),
}))
vi.mock('src/utils/settings', () => ({
  isSharingEnabled: vi.fn(() => true),
  shouldSaveTranscript: vi.fn(async () => true),
}))
vi.mock('src/utils/KNAnalytics', () => ({ default: { trackEvent: vi.fn() } }))
vi.mock('src/utils/errorHandling', () => ({ logError: vi.fn() }))
const template = {
  key: 'synthetic',
  title: 'Synthetic',
  prompt: 'Synthetic',
  user_facing_description: '',
}
const profileA = { uuid: 'A', email: 'a@example.invalid', name: 'Alice', sharing_permission: 1 }
const profileB = { uuid: 'B', email: 'b@example.invalid', name: 'Bob', sharing_permission: 1 }
const response = (data: unknown) => ({ ok: true, json: async () => data }) as Response
function harness(queue = vi.fn()) {
  return renderHook(
    ({ profile }) =>
      useMeetingSynthesis(
        null,
        queue,
        vi.fn(),
        template,
        { name: profile?.name, email: profile?.email },
        profile?.email || '',
      ),
    { initialProps: { profile: state.profile } },
  )
}
beforeEach(() => {
  state.profile = { ...profileA }
})
afterEach(cleanup)
it('blocks the reviewed manual-save race after A local persistence resumes under B', async () => {
  const { getApiToken } = await import('src/api/connections')
  vi.mocked(getApiToken).mockClear()
  let acknowledge!: (v: Response) => void
  const fetcher = vi.fn(
    () =>
      new Promise<Response>(resolve => {
        acknowledge = resolve
      }),
  )
  vi.stubGlobal('fetch', fetcher)
  const h = harness()
  let work: Promise<void>
  act(() => {
    work = h.result.current.saveNotes(920001, 'Synthetic private A note')
  })
  void work!.catch(() => {})
  await waitFor(() => expect(fetcher).toHaveBeenCalledOnce())
  state.profile = { ...profileB }
  h.rerender({ profile: state.profile })
  await act(async () => {
    acknowledge(response({ success: true }))
    await expect(work!).rejects.toThrow('Account changed')
  })
  expect(fetcher).toHaveBeenCalledOnce()
  expect(getApiToken).not.toHaveBeenCalled()
  h.unmount()
})
it('invalidates an old render callback across A→B→A even if it is only invoked afterward', async () => {
  const fetcher = vi.fn(() => {
    throw Error('No stale save request permitted')
  })
  vi.stubGlobal('fetch', fetcher)
  const h = harness(),
    old = h.result.current.saveNotes
  state.profile = { ...profileB }
  h.rerender({ profile: state.profile })
  state.profile = { ...profileA }
  h.rerender({ profile: state.profile })
  await act(async () => {
    await expect(old(920002, 'Old queued A note')).rejects.toThrow('Account changed')
  })
  expect(fetcher).not.toHaveBeenCalled()
  h.unmount()
})
it('uses the save bound at the real debounce admission and ignores stale account completions', async () => {
  const fetcher = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url).endsWith('/api/files/notes')) return response({ success: true })
    if (init?.method === 'POST') return response({ success: true })
    return response({ success: true, data: { filename: 'synthetic' } })
  })
  vi.stubGlobal('fetch', fetcher)
  const h = harness(),
    saved = vi.fn(),
    failed = vi.fn(),
    autosave = createNotesAutosave({ saved, failed })
  autosave(920003, 'A note', h.result.current.bindNotesSave())
  state.profile = { ...profileB }
  h.rerender({ profile: state.profile })
  await act(async () => {
    await autosave.flush()
  })
  expect(fetcher).not.toHaveBeenCalled()
  expect(saved).not.toHaveBeenCalled()
  expect(failed).not.toHaveBeenCalled()
  autosave(920003, 'B note', h.result.current.bindNotesSave())
  await act(async () => {
    await autosave.flush()
  })
  const upload = fetcher.mock.calls.find(v => String(v[0]).endsWith('/api/files/notes'))!
  expect(JSON.parse(String(upload[1]?.body))).toMatchObject({ uuid: 'B', notes: 'B note' })
  expect(upload[1]?.headers).toMatchObject({
    Authorization: 'Bearer synthetic-token:b@example.invalid',
  })
  expect(saved).toHaveBeenCalledExactlyOnceWith(920003, 'B note')
  autosave.cancel()
  h.unmount()
})
it('cancels pending outbound metadata on sign-out without requesting any credentials', async () => {
  const { getApiToken } = await import('src/api/connections')
  vi.mocked(getApiToken).mockClear()
  let release!: (v: Response) => void
  const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
    init?.method === 'POST'
      ? response({ success: true })
      : new Promise<Response>(resolve => {
          release = resolve
        }),
  )
  vi.stubGlobal('fetch', fetcher)
  const h = harness()
  let work: Promise<void>
  act(() => {
    work = h.result.current.saveNotes(920004, 'A note')
  })
  void work!.catch(() => {})
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  state.profile = null
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    await expect(work!).rejects.toThrow('Account changed')
  })
  h.rerender({ profile: null })
  release(response({ success: true, data: { filename: 'late' } }))
  await act(async () => {})
  expect(getApiToken).not.toHaveBeenCalled()
  expect(fetcher).toHaveBeenCalledTimes(2)
  h.unmount()
})
it('keeps the manual-edit generation cancellation when the debounce invokes a bound save directly', async () => {
  const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
    init?.method === 'POST'
      ? response({ success: true })
      : response({ success: true, data: { filename: 'synthetic' } }),
  )
  vi.stubGlobal('fetch', fetcher)
  const queue = vi.fn(),
    h = harness(queue)
  let generation: Promise<void>
  act(() => {
    generation = h.result.current.synthesizeContent(920005, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  const pending = queue.mock.calls[0][0],
    autosave = createNotesAutosave({ saved: vi.fn(), failed: vi.fn() })
  autosave(920005, 'Manual draft', h.result.current.bindNotesSave())
  await act(async () => {
    await autosave.flush()
    await generation!
  })
  expect(pending.signal.aborted).toBe(true)
  const count = fetcher.mock.calls.length
  await act(async () => {
    await pending.messageFinishCallback('Stale generated notes')
  })
  expect(fetcher).toHaveBeenCalledTimes(count)
  expect(
    fetcher.mock.calls
      .filter(v => v[1]?.method === 'POST')
      .every(v => JSON.parse(String(v[1]?.body)).notes === 'Manual draft'),
  ).toBe(true)
  autosave.cancel()
  h.unmount()
})
