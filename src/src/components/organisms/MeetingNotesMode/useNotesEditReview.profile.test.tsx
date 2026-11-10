// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { useNotesEditReview } from 'src/components/organisms/MeetingNotesMode/useNotesEditReview'

afterEach(cleanup)
it('does not render A spelling previews when the fixture account changes to B', async () => {
  localStorage.clear()
  const mappings = [
    { from: 'Jhon', to: 'John', enabled: true, source: 'explicit' as const, createdAt: 1 },
  ]
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: { thread_id: 900402, exists: true, notes: 'Jhon owns review.', revision: 'rA' },
      }),
    })),
  )
  let api: ReturnType<typeof useNotesEditReview>
  function Harness({ scope }: { scope: string }) {
    const opts = {
      threadId: 900402,
      accountScope: scope,
      completed: true,
      notes: 'Jhon owns review.',
      context: scope,
      queue: vi.fn(),
      flush: async () => {},
      saved: vi.fn(),
      spellings: () => JSON.stringify(scope === 'A' ? mappings : []),
    }
    api = useNotesEditReview(opts)
    return api.review
  }
  const h = render(<Harness scope="A" />)
  await act(async () => {
    await api.prepareSpellings(mappings)
  })
  expect(screen.getByText('Jhon', { selector: 'del' })).toBeTruthy()
  h.rerender(<Harness scope="B" />)
  await waitFor(() => expect(screen.queryByText('Jhon', { selector: 'del' })).toBeNull())
})
it('cancels a pending snapshot, then blocks signed-out preview and pending apply after a profile event', async () => {
  localStorage.clear()
  const mappings = [
    { from: 'Jhon', to: 'John', enabled: true, source: 'explicit' as const, createdAt: 1 },
  ]
  let release: (v: unknown) => void = () => {},
    pending = true
  const snapshot = {
    ok: true,
    json: async () => ({
      success: true,
      data: { thread_id: 900405, exists: true, notes: 'Jhon owns review.', revision: 'rA' },
    }),
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      pending
        ? new Promise(resolve => {
            release = resolve
          })
        : snapshot,
    ),
  )
  let api: ReturnType<typeof useNotesEditReview>
  let flushRelease: () => void = () => {},
    blockFlush = false
  function Harness({ scope }: { scope: string }) {
    api = useNotesEditReview({
      threadId: 900405,
      accountScope: scope,
      completed: true,
      notes: 'Jhon owns review.',
      context: 'meeting',
      queue: vi.fn(),
      flush: () =>
        blockFlush
          ? new Promise<void>(resolve => {
              flushRelease = resolve
            })
          : Promise.resolve(),
      saved: vi.fn(),
      spellings: () => JSON.stringify(mappings),
    })
    return api.review
  }
  const h = render(<Harness scope="A" />)
  let work: Promise<void>
  act(() => {
    work = api.prepareSpellings(mappings)
  })
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
  h.rerender(<Harness scope="B" />)
  await act(async () => {
    release(snapshot)
    await work!
  })
  expect(screen.queryByText('Apply to saved notes')).toBeNull()
  pending = false
  await act(async () => {
    await api.prepareSpellings(mappings)
  })
  blockFlush = true
  fireEvent.click(screen.getByText('Apply to saved notes'))
  const { PROFILE_CHANGED_EVENT } = await import('src/utils/profileScope')
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  await act(async () => {
    flushRelease()
  })
  expect(vi.mocked(fetch).mock.calls.every(call => !call[1]?.method)).toBe(true)
  h.rerender(<Harness scope="" />)
  await act(async () => {
    await api.prepareSpellings(mappings)
  })
  expect(screen.queryByText('Apply to saved notes')).toBeNull()
})
