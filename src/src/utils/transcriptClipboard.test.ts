import { describe, expect, it, vi } from 'vitest'

import { copyTranscriptText, transcriptBodyForClipboard } from './transcriptClipboard'

describe('transcript clipboard', () => {
  it('copies the transcript body without its stored metadata header', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const body = transcriptBodyForClipboard('Recorded October 23\n\n\nAlex: Hello\nSam: Hi')

    await copyTranscriptText(body, { writeText })

    expect(writeText).toHaveBeenCalledOnce()
    expect(writeText).toHaveBeenCalledWith('Alex: Hello\nSam: Hi')
  })

  it('surfaces clipboard rejection and permits a later retry', async () => {
    const writeText = vi.fn()
      .mockRejectedValueOnce(new Error('Clipboard denied'))
      .mockResolvedValueOnce(undefined)

    await expect(copyTranscriptText('Grounded transcript', { writeText })).rejects.toThrow('Clipboard denied')
    await expect(copyTranscriptText('Grounded transcript', { writeText })).resolves.toBeUndefined()
    expect(writeText).toHaveBeenCalledTimes(2)
  })

  it('rejects empty transcripts before touching the clipboard', async () => {
    const writeText = vi.fn()
    await expect(copyTranscriptText('   ', { writeText })).rejects.toThrow('No transcript')
    expect(writeText).not.toHaveBeenCalled()
  })
})
