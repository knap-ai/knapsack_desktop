// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'

import { PROFILE_CHANGED_EVENT } from './profileScope'

vi.mock('@tauri-apps/api/fs', () => ({
  BaseDirectory: { Home: 1 },
  readTextFile: vi.fn(async () => '{}'),
  writeTextFile: vi.fn(async () => {}),
}))
vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn(async (...parts: string[]) => parts.join('/')),
}))
it('emits a payload-free identity invalidation only for identity changes, using mocked files', async () => {
  const { KNLocalStorage } = await import('./KNLocalStorage')
  const events: Event[] = []
  const listener = (event: Event) => events.push(event)
  window.addEventListener(PROFILE_CHANGED_EVENT, listener)
  try {
    await KNLocalStorage.setItem('KN_PROFILE', {
      uuid: 'A',
      email: 'a@example.invalid',
      name: 'Alice',
    })
    await KNLocalStorage.setItem('KN_PROFILE', {
      uuid: 'A',
      email: 'a@example.invalid',
      name: 'Alice',
      profile_image: 'synthetic',
    })
    expect(events).toHaveLength(1)
    await KNLocalStorage.setItem('KN_PROFILE', {
      uuid: 'B',
      email: 'b@example.invalid',
      name: 'Bob',
    })
    await KNLocalStorage.setItem('KN_PROFILE', undefined)
    expect(events).toHaveLength(3)
    for (const event of events) expect((event as CustomEvent).detail).toBeUndefined()
  } finally {
    window.removeEventListener(PROFILE_CHANGED_EVENT, listener)
  }
})
