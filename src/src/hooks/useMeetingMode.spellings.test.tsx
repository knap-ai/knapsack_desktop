// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { NameCorrection, writeCorrections } from 'src/utils/nameCorrections'
import { beforeEach, expect, it, vi } from 'vitest'

import { useMeetingSynthesis } from './useMeetingMode'

vi.mock('src/api/transcripts', () => ({
  getTranscript: vi.fn(async () => ({ content: 'Knapsak met Jhon. Speaker A: I own pricing.' })),
  deleteTranscript: vi.fn(),
}))
vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: {
    getItem: vi.fn(async (key: string) =>
      key === 'KN_PROFILE' ? { uuid: 'synthetic-user' } : null,
    ),
  },
}))
vi.mock('src/utils/settings', () => ({
  shouldSaveTranscript: vi.fn(async () => true),
  isSharingEnabled: vi.fn(async () => false),
}))
vi.mock('src/utils/KNAnalytics', () => ({ default: { trackEvent: vi.fn() } }))
vi.mock('src/utils/errorHandling', () => ({ logError: vi.fn() }))
const correction: NameCorrection = {
  from: 'Knapsak',
  to: 'Knapsack',
  enabled: true,
  source: 'explicit',
  createdAt: 1,
}
const template = {
  key: 'synthetic',
  title: 'Synthetic',
  prompt: 'Synthetic template',
  user_facing_description: '',
}
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('No network expected')
    }),
  )
})
it('adds relevant confirmed spellings and first-name attribution on synthesis and regeneration, without changing transcript input', async () => {
  writeCorrections('synthetic-user', [correction])
  const queue = vi.fn()
  const h = renderHook(() =>
    useMeetingSynthesis(null, queue, vi.fn(), template, {
      name: 'Élodie Smith',
      email: 'elodie@example.invalid',
    }),
  )
  let result: Promise<void>
  act(() => {
    result = h.result.current.synthesizeContent(42, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  const first = queue.mock.calls[0][0]
  expect(first.prompt).toContain('"preferred":"Knapsack"')
  expect(first.prompt).toContain('verified first name "Élodie"')
  expect(first.prompt).toContain('Do not mechanically replace pronouns')
  expect(first.additionalDocuments[0].content).toContain('Knapsak met Jhon')
  await act(async () => {
    writeCorrections('synthetic-user', [])
    await result!
  })
  expect(first.signal.aborted).toBe(true)
  act(() => {
    result = h.result.current.synthesizeContent(42, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledTimes(2))
  expect(queue.mock.calls[1][0].prompt).not.toContain('"preferred":"Knapsack"')
  expect(queue.mock.calls[1][0].prompt).toContain('verified first name "Élodie"')
  await act(async () => {
    writeCorrections('synthetic-user', [])
    await result!
  })
  expect(fetch).not.toHaveBeenCalled()
  h.unmount()
})
it('does not reuse another user’s memory or invent a missing first name', async () => {
  writeCorrections('another-user', [correction])
  const queue = vi.fn()
  const h = renderHook(() => useMeetingSynthesis(null, queue, vi.fn(), template))
  let result: Promise<void>
  act(() => {
    result = h.result.current.synthesizeContent(43, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  expect(queue.mock.calls[0][0].prompt).not.toContain('"preferred":"Knapsack"')
  expect(queue.mock.calls[0][0].prompt).toContain('verified first name null')
  await act(async () => {
    writeCorrections('synthetic-user', [])
    await result!
  })
  h.unmount()
})
it('shows queued until dispatch, then writing; cancellation cannot restore writing', async () => {
  const queue = vi.fn()
  const h = renderHook(() => useMeetingSynthesis(null, queue, vi.fn(), template))
  let result: Promise<void>
  act(() => { result = h.result.current.synthesizeContent(44, '', undefined).catch(() => {}) })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  expect(h.result.current.synthesisPhase).toBe('queued')
  const request = queue.mock.calls[0][0]
  act(() => request.requestStartedCallback())
  expect(h.result.current.synthesisPhase).toBe('writing')
  await act(async () => { writeCorrections('synthetic-user', []); await result! })
  expect(h.result.current.synthesisPhase).toBe('idle')
  act(() => request.requestStartedCallback())
  expect(h.result.current.synthesisPhase).toBe('idle')
  h.unmount()
})
it('joins repeated recovery requests instead of cancelling and restarting the same meeting', async () => {
  const queue=vi.fn(),firstFailure=vi.fn();const h=renderHook(()=>useMeetingSynthesis(null,queue,vi.fn(),template));
  let first:Promise<void>, second:Promise<void>;
  act(()=>{first=h.result.current.synthesizeContent(45,'',undefined).catch(firstFailure);second=h.result.current.synthesizeContent(45,'',undefined).catch(()=>{})});
  await waitFor(()=>expect(queue).toHaveBeenCalled());
  expect(queue).toHaveBeenCalledOnce();expect(firstFailure).not.toHaveBeenCalled();expect(queue.mock.calls[0][0].signal.aborted).toBe(false);
  await act(async()=>{writeCorrections('synthetic-user',[]);await Promise.all([first!,second!])});h.unmount();
})
