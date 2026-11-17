// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'

import { readTextFile, writeTextFile } from '@tauri-apps/api/fs'

vi.mock('@tauri-apps/api/fs', () => ({
  BaseDirectory: { Home: 1 },
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(async () => {}),
}))
vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn(async (...parts: string[]) => parts.join('/')),
}))
beforeEach(() => {
  vi.resetModules()
  vi.mocked(writeTextFile).mockClear()
})
it.each(['unreadable', 'malformed'])(
  'does not turn an unreadable prior opt-out into default-on: %s',
  async kind => {
    if (kind === 'unreadable')
      vi.mocked(readTextFile).mockRejectedValueOnce(new Error('permission denied'))
    else vi.mocked(readTextFile).mockResolvedValueOnce('{"KN_AUTO_RECORD_MEETINGS":false,broken')
    const { canAutomaticallyRecord, setAutoRecordPreference } =
      await import('./autoRecordPreference')
    expect(await canAutomaticallyRecord()).toBe(false)
    await expect(setAutoRecordPreference(true)).rejects.toThrow('not overwritten')
    expect(writeTextFile).not.toHaveBeenCalled()
  },
)
it('keeps a valid saved explicit opt-out', async () => {
  vi.mocked(readTextFile).mockResolvedValueOnce('{"KN_AUTO_RECORD_MEETINGS":false}')
  const { canAutomaticallyRecord } = await import('./autoRecordPreference')
  expect(await canAutomaticallyRecord()).toBe(false)
})
it('uses default-on only for a verified fresh missing store', async () => {
  vi.mocked(readTextFile).mockRejectedValueOnce(new Error('No such file or directory (os error 2)'))
  const { canAutomaticallyRecord } = await import('./autoRecordPreference')
  expect(await canAutomaticallyRecord()).toBe(true)
})

it('failed opt-in cannot enable capture through the optimistic settings cache', async () => {
  vi.mocked(readTextFile).mockResolvedValueOnce('{"KN_AUTO_RECORD_MEETINGS":false}')
  const { canAutomaticallyRecord, setAutoRecordPreference } = await import('./autoRecordPreference')
  expect(await canAutomaticallyRecord()).toBe(false)
  vi.mocked(writeTextFile).mockRejectedValueOnce(new Error('disk full'))
  await expect(setAutoRecordPreference(true)).rejects.toThrow('disk full')
  expect(await canAutomaticallyRecord()).toBe(false)
  await setAutoRecordPreference(true)
  expect(await canAutomaticallyRecord()).toBe(true)
})

it('serializes two failed conflicting writes without restoring an uncommitted opt-in', async () => {
  vi.mocked(readTextFile).mockResolvedValueOnce('{"KN_AUTO_RECORD_MEETINGS":false}')
  const { canAutomaticallyRecord, setAutoRecordPreference } = await import('./autoRecordPreference')
  vi.mocked(writeTextFile).mockRejectedValueOnce(new Error('first disk failure'))
  // A's rollback must finish before B reads its before-image.
  vi.mocked(writeTextFile).mockResolvedValueOnce(undefined)
  vi.mocked(writeTextFile).mockRejectedValueOnce(new Error('second disk failure'))
  const first = setAutoRecordPreference(true),
    second = setAutoRecordPreference(false)
  const results = await Promise.allSettled([first, second])
  expect(results.every(r => r.status === 'rejected')).toBe(true)
  expect(await canAutomaticallyRecord()).toBe(false)
  const snapshots = vi
    .mocked(writeTextFile)
    .mock.calls.map(call => JSON.parse(String(call[1])).KN_AUTO_RECORD_MEETINGS)
  expect(snapshots).toEqual([true, false, false, false])
})
it('a later successful opt-out survives a prior failed enable', async () => {
  vi.mocked(readTextFile).mockResolvedValueOnce('{"KN_AUTO_RECORD_MEETINGS":false}')
  const { canAutomaticallyRecord, setAutoRecordPreference } = await import('./autoRecordPreference')
  vi.mocked(writeTextFile).mockRejectedValueOnce(new Error('failed enable'))
  const results = await Promise.allSettled([
    setAutoRecordPreference(true),
    setAutoRecordPreference(false),
  ])
  expect(results[0].status).toBe('rejected')
  expect(results[1].status).toBe('fulfilled')
  expect(await canAutomaticallyRecord()).toBe(false)
})
