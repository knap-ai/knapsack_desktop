// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'

import { getSavedMeetingNotes } from './meetingNotesRead'
import { getTranscript } from './transcripts'

const invoke = vi.hoisted(() => vi.fn())
vi.mock('@tauri-apps/api/tauri', () => ({ invoke }))
vi.mock('./connections', () => ({ getApiToken: vi.fn() }))
vi.mock('src/utils/errorHandling', () => ({ logError: vi.fn() }))
vi.mock('src/utils/KNLocalStorage', () => ({ KNLocalStorage: { getItem: vi.fn() } }))
vi.mock('src/utils/settings', () => ({ isSharingEnabled: vi.fn() }))
const owner = { email: 'owner@example.test', uuid: 'owner-a' }
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
  vi.useRealTimers()
})
it('reads through bound IPC even when the HTTP queue cannot run', async () => {
  const fetch = vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}))
  invoke.mockResolvedValue({ content: 'Saved transcript', threadId: 44 })
  expect((await getTranscript(44, { localOnly: true, owner })).content).toBe('Saved transcript')
  expect(invoke).toHaveBeenCalledWith('read_saved_notes_transcript', {
    threadId: 44,
    expectedEmail: owner.email,
    expectedUuid: owner.uuid,
  })
  expect(fetch).not.toHaveBeenCalled()
})
it('fails closed without a bound account', async () => {
  await expect(getTranscript(44, { localOnly: true })).rejects.toThrow('Account changed')
  expect(invoke).not.toHaveBeenCalled()
})
it('never falls back to HTTP or exposes native response payloads', async () => {
  const fetch = vi.spyOn(window, 'fetch')
  invoke.mockRejectedValue('private native payload')
  await expect(getTranscript(44, { localOnly: true, owner })).rejects.toThrow(
    'Could not read the saved meeting transcript',
  )
  expect(fetch).not.toHaveBeenCalled()
})
it('bounds a stalled read and permits a new explicit read', async () => {
  vi.useFakeTimers()
  let finish!: (value: unknown) => void
  invoke
    .mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = resolve
        }),
    )
    .mockResolvedValue({ content: 'Fresh transcript' })
  const pending = getTranscript(44, { localOnly: true, owner })
  const rejected = expect(pending).rejects.toThrow('timed out')
  await vi.advanceTimersByTimeAsync(15000)
  await rejected
  finish({ content: 'Late old transcript' })
  expect((await getTranscript(44, { localOnly: true, owner })).content).toBe('Fresh transcript')
  expect(invoke).toHaveBeenCalledTimes(2)
})

it('saved-note hydration uses the same bound native read lane', async () => {
  const fetch = vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}))
  invoke.mockResolvedValue({
    success: true,
    data: { thread_id: 44, exists: true, notes: 'Saved notes' },
  })
  expect((await getSavedMeetingNotes(44, owner)).data?.notes).toBe('Saved notes')
  expect(invoke).toHaveBeenCalledWith('read_saved_meeting_notes', {
    threadId: 44,
    expectedEmail: owner.email,
    expectedUuid: owner.uuid,
  })
  expect(fetch).not.toHaveBeenCalled()
})
