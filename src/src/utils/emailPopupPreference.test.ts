// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'

import {
  emailPopupOwner,
  readEmailPopupPreference,
  writeEmailPopupPreference,
} from './emailPopupPreference'
import { KNLocalStorage } from './KNLocalStorage'
import { PROFILE_CHANGED_EVENT } from './profileScope'

const fixture = vi.hoisted(() => ({ data: {} as Record<string, unknown> }))
vi.mock('./KNLocalStorage', () => ({
  KNLocalStorage: {
    getItem: vi.fn(async (key: string) => fixture.data[key]),
    setItem: vi.fn(async (key: string, value: unknown) => {
      fixture.data[key] = value
    }),
  },
}))
beforeEach(() => {
  fixture.data = { KN_PROFILE: { uuid: 'A', email: 'a@example.invalid' } }
  vi.clearAllMocks()
})
it('requires positive opt-in; legacy missing, false and true dismissal do not grant it', async () => {
  for (const legacy of [undefined, false, true]) {
    fixture.data.EMAIL_NOTIFICATION_DRAWER_DISMISSED = legacy
    expect((await readEmailPopupPreference()).enabled).toBe(false)
  }
})
it('persists an explicit opt-in only for that profile on this device', async () => {
  const original = await readEmailPopupPreference()
  await writeEmailPopupPreference(original.owner ?? '', original.revision, true)
  expect((await readEmailPopupPreference()).enabled).toBe(true)
  fixture.data.KN_PROFILE = { uuid: 'B', email: 'b@example.invalid' }
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
  expect((await readEmailPopupPreference()).enabled).toBe(false)
  await expect(
    writeEmailPopupPreference(original.owner ?? '', original.revision, true),
  ).rejects.toThrow('Account changed')
  fixture.data.KN_PROFILE = { uuid: 'A', email: 'a@example.invalid' }
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
  await expect(
    writeEmailPopupPreference(original.owner ?? '', original.revision, true),
  ).rejects.toThrow('Account changed')
  const fresh = await readEmailPopupPreference()
  expect(fresh.enabled).toBe(true)
  await writeEmailPopupPreference(fresh.owner ?? '', fresh.revision, false)
  expect((await readEmailPopupPreference()).enabled).toBe(false)
})
it('does not create anonymous or email-only consent', async () => {
  expect(emailPopupOwner({ email: 'a@example.invalid' })).toBeNull()
  fixture.data.KN_PROFILE = null
  expect((await readEmailPopupPreference()).enabled).toBe(false)
})

it('rejects a switch that occurs while the current profile is being read', async () => {
  const original = await readEmailPopupPreference()
  vi.mocked(KNLocalStorage.getItem).mockImplementationOnce(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    return fixture.data.KN_PROFILE
  })
  await expect(
    writeEmailPopupPreference(original.owner ?? '', original.revision, true),
  ).rejects.toThrow('Account changed')
  expect(KNLocalStorage.setItem).not.toHaveBeenCalled()
})
it('restores the in-memory preference when disk persistence fails', async () => {
  const original = await readEmailPopupPreference()
  vi.mocked(KNLocalStorage.setItem).mockImplementationOnce(async (key, value) => {
    fixture.data[key] = value
    throw new Error('Synthetic disk failure')
  })
  await expect(
    writeEmailPopupPreference(original.owner ?? '', original.revision, true),
  ).rejects.toThrow('Synthetic disk failure')
  expect((await readEmailPopupPreference()).enabled).toBe(false)
})
