// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { getProfileRevision } from 'src/utils/profileScope'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { writeTextFile } from '@tauri-apps/api/fs'

import { useAuth } from './useAuth'

vi.mock('@tauri-apps/api/fs', () => ({
  BaseDirectory: { Home: 1 },
  readTextFile: vi.fn(async () => '{}'),
  writeTextFile: vi.fn(async () => {}),
}))
vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn(async (...parts: string[]) => parts.join('/')),
}))
vi.mock('src/api/connections', () => ({
  signout: vi.fn(async () => {}),
  updateLastSeen: vi.fn(async () => ({ success: false })),
}))
const A = {
  uuid: 'A',
  email: 'a@example.invalid',
  name: 'Alice',
  profile_image: null as unknown as string,
}
const B = {
  uuid: 'B',
  email: 'b@example.invalid',
  name: 'Bob',
  profile_image: null as unknown as string,
}
beforeEach(async () => {
  vi.mocked(writeTextFile).mockResolvedValue()
  await KNLocalStorage.setItem('KN_PROFILE', A)
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
it.each(['B', 'signed-out'])(
  'does not let a late A avatar/profile refresh overwrite %s',
  async next => {
    let release!: (value: Blob) => void
    const avatar = new Promise<Blob>(resolve => {
      release = resolve
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ blob: () => avatar })),
    )
    const h = renderHook(() => useAuth())
    await waitFor(() => expect(h.result.current.profile?.uuid).toBe('A'))
    const revision = getProfileRevision()
    let late!: Promise<void>
    act(() => {
      late = h.result.current.updateProfile(
        { ...A, profile_image: 'https://avatar.example.invalid/a' },
        revision,
      )
    })
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
    await act(async () => {
      await h.result.current.updateProfile(next === 'B' ? B : undefined)
    })
    await act(async () => {
      release(new Blob(['synthetic']))
      await late
    })
    expect((await KNLocalStorage.getItem('KN_PROFILE'))?.uuid).toBe(next === 'B' ? 'B' : undefined)
    expect(h.result.current.profile?.uuid).toBe(next === 'B' ? 'B' : undefined)
  },
)
it('compares origin revision inside storage admission', async () => {
  const old = getProfileRevision()
  await KNLocalStorage.setItem('KN_PROFILE', B)
  expect(await KNLocalStorage.setItemIfCurrent('KN_PROFILE', A, old)).toBeNull()
  expect((await KNLocalStorage.getItem('KN_PROFILE')).uuid).toBe('B')
})
it('serializes durable writes so an older profile cannot land last', async () => {
  let release!: () => void
  vi.mocked(writeTextFile)
    .mockClear()
    .mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          release = resolve
        }),
    )
  const a = KNLocalStorage.setItem('KN_PROFILE', A)
  await waitFor(() => expect(writeTextFile).toHaveBeenCalledOnce())
  const b = KNLocalStorage.setItem('KN_PROFILE', B)
  await Promise.resolve()
  expect(writeTextFile).toHaveBeenCalledOnce()
  release()
  await Promise.all([a, b])
  expect(JSON.parse(String(vi.mocked(writeTextFile).mock.calls[1][1])).KN_PROFILE.uuid).toBe('B')
})
it('returns persistence failure instead of acknowledging an unsaved UI profile', async () => {
  const h = renderHook(() => useAuth())
  await waitFor(() => expect(h.result.current.profile?.uuid).toBe('A'))
  vi.mocked(writeTextFile).mockRejectedValueOnce(new Error('synthetic disk failure'))
  await act(async () => {
    await expect(h.result.current.updateProfile(B, getProfileRevision())).rejects.toThrow(
      'synthetic disk failure',
    )
  })
  expect(h.result.current.profile?.uuid).toBe('A')
})
