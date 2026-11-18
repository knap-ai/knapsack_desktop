// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { RecordingProvider, useRecording } from './RecordingContext'

const mocks = vi.hoisted(() => ({ stop: vi.fn(), log: vi.fn(), emit: vi.fn() }))
vi.mock('src/api/recording', () => ({
  isRecordingStatus: vi.fn(async () => ({ isRecording: false })),
  stopRecord: mocks.stop,
  startRecord: vi.fn(),
  pauseRecord: vi.fn(),
}))
vi.mock('@tauri-apps/api/event', () => ({ emit: mocks.emit }))
vi.mock('@tauri-apps/api/tauri', () => ({ invoke: vi.fn() }))
vi.mock('src/utils/errorHandling', () => ({ logError: mocks.log }))
vi.mock('src/utils/KNAnalytics', () => ({ default: { trackEvent: vi.fn() } }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
it('clears loading after failure even when the final background refresh never settles', async () => {
  mocks.stop.mockResolvedValue(true)
  const read = vi
    .fn()
    .mockResolvedValueOnce('Existing edits')
    .mockImplementation(() => new Promise(() => {}))
  const synthesize = vi
    .fn()
    .mockRejectedValue(new Error('Reading the saved transcript timed out. Please retry.'))
  const save = vi.fn(),
    transcriptStatus = vi.fn().mockResolvedValue(undefined)
  const h = renderHook(() => useRecording(), { wrapper: RecordingProvider })
  await act(async () => {
    await h.result.current.stopRecording(
      read,
      vi.fn(),
      synthesize,
      save,
      transcriptStatus,
      'stale draft',
      196,
      true,
      undefined,
    )
  })
  expect(h.result.current.isLoadingNotes(196)).toBe(false)
  expect(synthesize).toHaveBeenCalledExactlyOnceWith(196, 'Existing edits', undefined)
  expect(read).toHaveBeenCalledTimes(1)
  expect(save).not.toHaveBeenCalled()
  expect(mocks.emit).not.toHaveBeenCalled()
  expect(transcriptStatus).toHaveBeenCalledOnce()
})
it('clears loading when reading existing notes fails before synthesis', async () => {
  mocks.stop.mockResolvedValue(true)
  const read = vi.fn().mockRejectedValue(new Error('Notes unavailable')),
    synthesize = vi.fn()
  const h = renderHook(() => useRecording(), { wrapper: RecordingProvider })
  await act(async () => {
    await expect(
      h.result.current.stopRecording(
        read,
        vi.fn(),
        synthesize,
        vi.fn(),
        vi.fn().mockResolvedValue(undefined),
        '',
        196,
        true,
        undefined,
      ),
    ).rejects.toThrow('Notes unavailable')
  })
  expect(h.result.current.isLoadingNotes(196)).toBe(false)
  expect(synthesize).not.toHaveBeenCalled()
})
it('preserves stop failure without attempting generation', async () => {
  mocks.stop.mockRejectedValue(new Error('Stop failed'))
  const read = vi.fn(),
    synthesize = vi.fn()
  const h = renderHook(() => useRecording(), { wrapper: RecordingProvider })
  await act(async () => {
    await expect(
      h.result.current.stopRecording(
        read,
        vi.fn(),
        synthesize,
        vi.fn(),
        vi.fn(),
        '',
        196,
        true,
        undefined,
      ),
    ).rejects.toThrow('Stop failed')
  })
  expect(h.result.current.isLoadingNotes(196)).toBe(false)
  expect(read).not.toHaveBeenCalled()
  expect(synthesize).not.toHaveBeenCalled()
})
