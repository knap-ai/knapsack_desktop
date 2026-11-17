// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'

import { readTextFile, writeTextFile } from '@tauri-apps/api/fs'

vi.mock('@tauri-apps/api/fs', () => ({
  BaseDirectory: { Home: 1 },
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(async () => {}),
}))
vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn(async (...parts: string[]) => parts.join('/')),
}))
it('single-flights startup hydration so a late disk read cannot resurrect A after B or signout', async () => {
  let release!: (value: string) => void
  vi.mocked(readTextFile).mockImplementation(
    () =>
      new Promise<string>(resolve => {
        release = resolve
      }),
  )
  const { KNLocalStorage } = await import('./KNLocalStorage')
  const read = KNLocalStorage.getItem('KN_PROFILE')
  const B = { uuid: 'B', email: 'b@example.invalid' }
  const write = KNLocalStorage.setItem('KN_PROFILE', B)
  await vi.waitFor(() => expect(readTextFile).toHaveBeenCalledOnce())
  release(JSON.stringify({ KN_PROFILE: { uuid: 'A', email: 'a@example.invalid' } }))
  await Promise.all([read, write])
  await KNLocalStorage.setItem('ordinary-preference', true)
  expect((await KNLocalStorage.getItem('KN_PROFILE')).uuid).toBe('B')
  expect(
    JSON.parse(
      String(
        vi.mocked(writeTextFile).mock.calls[vi.mocked(writeTextFile).mock.calls.length - 1]?.[1],
      ),
    ).KN_PROFILE.uuid,
  ).toBe('B')
  await KNLocalStorage.setItem('KN_PROFILE', undefined)
  await KNLocalStorage.setItem('ordinary-preference', false)
  expect(await KNLocalStorage.getItem('KN_PROFILE')).toBeNull()
  expect(readTextFile).toHaveBeenCalledOnce()
})
