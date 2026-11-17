// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { listWorkspaces } from 'src/api/workspaces'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, expect, it, vi } from 'vitest'

import { useScopedLibrarySearch } from './useScopedLibrarySearch'

vi.mock('src/api/workspaces', () => ({ listWorkspaces: vi.fn() }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
it('drops an old account response and resets visible search on profile change', async () => {
  let release!: (value: unknown) => void
  vi.mocked(listWorkspaces).mockReturnValue(
    new Promise(resolve => {
      release = value => resolve(value as Awaited<ReturnType<typeof listWorkspaces>>)
    }) as ReturnType<typeof listWorkspaces>,
  )
  const reset = vi.fn()
  const { result } = renderHook(() => useScopedLibrarySearch('private', reset))
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  await act(async () =>
    release({ success: true, data: [{ uuid: 'account-a', name: 'private A' }] }),
  )
  expect(reset).toHaveBeenCalledOnce()
  expect(result.current.results).toEqual([])
  expect(result.current.loading).toBe(false)
})
it('ignores stale query responses while exposing current failures honestly', async () => {
  let release!: (value: unknown) => void
  vi.mocked(listWorkspaces)
    .mockReturnValueOnce(
      new Promise(resolve => {
        release = value => resolve(value as Awaited<ReturnType<typeof listWorkspaces>>)
      }) as ReturnType<typeof listWorkspaces>,
    )
    .mockRejectedValueOnce(new Error('offline'))
  const reset = vi.fn()
  const { result, rerender } = renderHook(({ query }) => useScopedLibrarySearch(query, reset), {
    initialProps: { query: 'old' },
  })
  rerender({ query: 'new' })
  await waitFor(() => expect(result.current.error).toBe(true))
  await act(async () => release({ success: true, data: [{ name: 'old private result' }] }))
  expect(result.current.results).toEqual([])
  expect(result.current.error).toBe(true)
})
