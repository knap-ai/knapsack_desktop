// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'

import {
  AUTO_RECORD_MEETINGS,
  canAutomaticallyRecord,
  setAutoRecordPreference,
} from './autoRecordPreference'
import { KNLocalStorage } from './KNLocalStorage'

vi.mock('./KNLocalStorage', () => ({
  KNLocalStorage: {
    defaultsAreReadable: vi.fn(async () => true),
    getItem: vi.fn(),
    setItem: vi.fn(async () => {}),
  },
}))
it.each([
  [null, true],
  [true, true],
  [false, false],
  ['true', false],
  [{}, false],
])('interprets stored %j as %s without rewriting preferences', async (value, expected) => {
  vi.mocked(KNLocalStorage.getItem).mockResolvedValueOnce(value)
  vi.mocked(KNLocalStorage.setItem).mockClear()
  expect(await canAutomaticallyRecord()).toBe(expected)
  expect(KNLocalStorage.setItem).not.toHaveBeenCalled()
})
it('fails closed on unavailable preferences', async () => {
  vi.mocked(KNLocalStorage.getItem).mockRejectedValueOnce(new Error('synthetic read error'))
  expect(await canAutomaticallyRecord()).toBe(false)
})
it('persists explicit opt-out under the positive per-device key', async () => {
  await setAutoRecordPreference(false)
  expect(KNLocalStorage.setItem).toHaveBeenCalledWith(AUTO_RECORD_MEETINGS, false)
})
