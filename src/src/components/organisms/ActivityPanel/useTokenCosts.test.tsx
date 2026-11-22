// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, expect, it, vi } from 'vitest'

import { USAGE_TIMEOUT_MS, useTokenCosts } from './useTokenCosts'

const summary = {
  success: true,
  totalCostUsd: 2,
  totalRequests: 3,
  totalInputTokens: 100,
  totalOutputTokens: 20,
  byModel: [],
}
const response = (value: unknown) => ({ ok: true, json: async () => value }) as Response
const good = (url: string) =>
  Promise.resolve(
    response(
      url.includes('summary')
        ? summary
        : url.includes('recent')
          ? { success: true, records: [] }
          : { success: true, dailyCostUsd: 1, monthlyCostUsd: 2 },
    ),
  )
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
it('loads totals and distinguishes a successful empty ledger from unavailable data', async () => {
  vi.stubGlobal('fetch', vi.fn(good))
  const { result } = renderHook(() => useTokenCosts())
  expect(result.current.summary).toBeNull()
  expect(result.current.records).toBeNull()
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(result.current.summary?.totalInputTokens).toBe(100)
  expect(result.current.records).toEqual([])
})
it('bounds hung JSON, loads independent totals, avoids overlapping refresh and recovers', async () => {
  vi.useFakeTimers()
  const fetch = vi.fn((url: string) =>
    url.includes('recent')
      ? Promise.resolve({ ok: true, json: () => new Promise(() => undefined) })
      : good(url),
  )
  vi.stubGlobal('fetch', fetch)
  const { result } = renderHook(() => useTokenCosts())
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1)
  })
  act(() => {
    result.current.fetchData()
    result.current.fetchData()
  })
  expect(fetch).toHaveBeenCalledTimes(3)
  await act(async () => {
    await vi.advanceTimersByTimeAsync(USAGE_TIMEOUT_MS)
  })
  expect(result.current.isLoading).toBe(false)
  expect(result.current.error).toContain('could not be loaded')
  expect(result.current.summary?.totalRequests).toBe(3)
  expect(result.current.records).toBeNull()
  fetch.mockImplementation(good)
  await act(async () => {
    result.current.fetchData()
    await vi.advanceTimersByTimeAsync(1)
  })
  expect(result.current.error).toBe('')
  expect(result.current.records).toEqual([])
})
it('surfaces HTTP, application and malformed failures without private payloads', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce(response({ success: false, error: 'private' }))
      .mockResolvedValueOnce(response({ success: true, dailyCostUsd: 'bad' })),
  )
  const { result } = renderHook(() => useTokenCosts())
  await waitFor(() => expect(result.current.error).not.toBe(''))
  expect(result.current.summary).toBeNull()
  expect(result.current.records).toBeNull()
  expect(result.current.budget).toBeNull()
  expect(result.current.error).not.toContain('private')
})
it('ignores late range/profile responses and aborts on unmount', async () => {
  let finish!: (value: Response) => void
  const fetch = vi.fn((url: string, options?: RequestInit) =>
    (void options, url.includes('summary'))
      ? new Promise<Response>(resolve => {
          finish = resolve
        })
      : good(url),
  )
  vi.stubGlobal('fetch', fetch)
  const { result, unmount } = renderHook(() => useTokenCosts())
  const old = finish
  await act(async () => {
    result.current.setDays(7)
  })
  await act(async () => {
    old(response(summary))
  })
  expect(result.current.summary).toBeNull()
  const oldProfile = finish
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    oldProfile(response(summary))
  })
  expect(result.current.summary).toBeNull()
  const signal = fetch.mock.calls[fetch.mock.calls.length - 1]?.[1]?.signal
  unmount()
  expect(signal?.aborted).toBe(true)
})

it('times out even when the fetch transport ignores abort', async () => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise(() => undefined)),
  )
  const { result } = renderHook(() => useTokenCosts())
  await act(async () => {
    await vi.advanceTimersByTimeAsync(USAGE_TIMEOUT_MS)
  })
  expect(result.current.isLoading).toBe(false)
  expect(result.current.error).toContain('could not be loaded')
  expect(result.current.summary).toBeNull()
})
