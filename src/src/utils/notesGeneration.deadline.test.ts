import { afterEach, expect, it, vi } from 'vitest'

import { NOTES_GENERATION_DEADLINE_MS, NotesGeneration } from './notesGeneration'

afterEach(() => vi.useRealTimers())
it('retains the bounded deadline and identifies queue versus provider wait without source content', () => {
  vi.useFakeTimers()
  const queued = new NotesGeneration(9901)
  queued.phase = 'queued'
  vi.advanceTimersByTime(NOTES_GENERATION_DEADLINE_MS - 1)
  expect(queued.signal.aborted).toBe(false)
  vi.advanceTimersByTime(1)
  expect(queued.signal.reason.message).toContain('AI queue wait')
  queued.finish()
  const writing = new NotesGeneration(9902)
  writing.phase = 'writing'
  vi.advanceTimersByTime(NOTES_GENERATION_DEADLINE_MS)
  expect(writing.signal.reason.message).toContain('AI request or response')
  expect(writing.id).not.toBe(queued.id)
  writing.finish()
})
