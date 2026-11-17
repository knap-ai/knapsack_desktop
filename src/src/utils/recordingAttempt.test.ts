import { afterEach, expect, it, vi } from 'vitest'

import { confirmRecordingAttempt } from './recordingAttempt'

afterEach(() => vi.useRealTimers())
it('a quick explicit Stop cancels admission before polling', async () => {
  vi.useFakeTimers()
  let current = true
  const read = vi.fn()
  const attempt = confirmRecordingAttempt(1, () => current, read)
  current = false
  await vi.advanceTimersByTimeAsync(300)
  expect(await attempt).toBe(false)
  expect(read).not.toHaveBeenCalled()
})
it('a late A poll cannot acknowledge B or revive A after supersession', async () => {
  vi.useFakeTimers()
  let current = true
  let resolve!: (value: { isRecording: boolean; threadId: number }) => void
  const read = vi.fn(
    () => new Promise<{ isRecording: boolean; threadId: number }>(r => (resolve = r)),
  )
  const attempt = confirmRecordingAttempt(1, () => current, read)
  await vi.advanceTimersByTimeAsync(300)
  current = false
  resolve({ isRecording: true, threadId: 2 })
  expect(await attempt).toBe(false)
})
it('requires native thread identity even if a stale attempt key remains current', async () => {
  vi.useFakeTimers()
  const attempt = confirmRecordingAttempt(
    1,
    () => true,
    async () => ({ isRecording: true, threadId: 2 }),
  )
  await vi.advanceTimersByTimeAsync(300)
  expect(await attempt).toBe(false)
})
it('acknowledges its own active recording', async () => {
  vi.useFakeTimers()
  const attempt = confirmRecordingAttempt(
    1,
    () => true,
    async () => ({ isRecording: true, threadId: 1 }),
  )
  await vi.advanceTimersByTimeAsync(300)
  expect(await attempt).toBe(true)
})
