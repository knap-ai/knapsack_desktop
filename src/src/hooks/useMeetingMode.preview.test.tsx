// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { deleteTranscript, getTranscript } from 'src/api/transcripts'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { cancelNotesGeneration } from 'src/utils/notesGeneration'
import { capturePostMeetingSource } from 'src/utils/postMeetingSource'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { shouldSaveTranscript } from 'src/utils/settings'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useMeetingSynthesis } from './useMeetingMode'

vi.mock('src/api/transcripts', () => ({ getTranscript: vi.fn(), deleteTranscript: vi.fn() }))
vi.mock('src/utils/KNLocalStorage', () => ({ KNLocalStorage: { getItem: vi.fn() } }))
vi.mock('src/utils/settings', () => ({
  shouldSaveTranscript: vi.fn(),
  isSharingEnabled: () => false,
}))
vi.mock('src/utils/postMeetingSource', () => ({ capturePostMeetingSource: vi.fn() }))
vi.mock('src/utils/KNAnalytics', () => ({ default: { trackEvent: vi.fn() } }))
vi.mock('src/utils/errorHandling', () => ({ logError: vi.fn() }))
vi.mock('src/utils/frontendLog', () => ({ pushFrontendLog: vi.fn() }))
const template = {
  key: 'synthetic',
  title: 'Synthetic',
  prompt: 'Synthetic template',
  user_facing_description: '',
}
let owner = { uuid: 'synthetic-owner', email: 'owner@example.test', name: 'Synthetic Owner' },
  nextThread = 8800
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  owner = { uuid: 'synthetic-owner', email: 'owner@example.test', name: 'Synthetic Owner' }
  vi.mocked(getTranscript).mockResolvedValue({
    content: 'Synthetic saved transcript: Alex will review the scope.',
  } as Awaited<ReturnType<typeof getTranscript>>)
  vi.mocked(KNLocalStorage.getItem).mockImplementation(async key =>
    key === 'KN_PROFILE' ? owner : null,
  )
  vi.mocked(shouldSaveTranscript).mockResolvedValue(false)
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) })),
  )
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
function fixture() {
  const queue = vi.fn(),
    finish = vi.fn(),
    thread = nextThread++
  const editor = {
    isDestroyed: false,
    commands: { clearContent: vi.fn() },
    storage: { markdown: { parser: { parse: vi.fn() } } },
    chain: vi.fn(),
  }
  const hook = renderHook(
    ({ email }) =>
      useMeetingSynthesis(
        editor as unknown as Parameters<typeof useMeetingSynthesis>[0],
        queue,
        finish,
        template,
        { email },
        email,
      ),
    { initialProps: { email: owner.email } },
  )
  async function start(
    mode: 'save' | 'preview' = 'preview',
    draft = 'Private synthetic handwritten note',
  ) {
    const queuedBefore = queue.mock.calls.length
    let work!: Promise<void>
    act(() => {
      work = hook.result.current.synthesizeContent(thread, draft, undefined, mode)
    })
    void work.catch(() => {
      /* Rejection is asserted by the owning test. */
    })
    await waitFor(() => expect(queue).toHaveBeenCalledTimes(queuedBefore + 1))
    return { work, request: queue.mock.calls[queue.mock.calls.length - 1][0] }
  }
  return { hook, queue, finish, thread, editor, start }
}
it('preview sends only saved transcript, never writes, edits, cleans retention or emits completion', async () => {
  const f = fixture(),
    { work, request } = await f.start()
  expect(getTranscript).toHaveBeenCalledWith(f.thread, {
    localOnly: true,
    owner: { email: owner.email, uuid: owner.uuid },
  })
  expect(request.additionalDocuments).toEqual([
    {
      title: 'Meeting Transcript',
      content: 'Synthetic saved transcript: Alex will review the scope.',
    },
    { title: 'User Notes', content: '' },
  ])
  act(() => request.messageStreamCallback('Synthetic partial preview'))
  expect(f.hook.result.current.streamingMarkdown).toBe('')
  await act(async () => {
    await request.messageFinishCallback('## Synthetic preview\nA complete source-grounded summary.')
    await work
  })
  expect(f.hook.result.current.retryPreview).toMatchObject({
    threadId: f.thread,
    markdown: '## Synthetic preview\n\nA complete source-grounded summary.',
  })
  expect(f.hook.result.current.isLLMLoading).toBe(false)
  expect(fetch).not.toHaveBeenCalled()
  expect(shouldSaveTranscript).not.toHaveBeenCalled()
  expect(deleteTranscript).not.toHaveBeenCalled()
  expect(capturePostMeetingSource).not.toHaveBeenCalled()
  expect(f.finish).not.toHaveBeenCalled()
  expect(f.editor.commands.clearContent).not.toHaveBeenCalled()
  expect(f.editor.chain).not.toHaveBeenCalled()
  act(() => f.hook.result.current.dismissRetryPreview())
  expect(f.hook.result.current.retryPreview).toBeNull()
  expect(fetch).not.toHaveBeenCalled()
})
it('normal save retains existing persistence, retention and completion behavior', async () => {
  const f = fixture(),
    { work, request } = await f.start('save', 'Synthetic manual note')
  expect(request.additionalDocuments[1].content).toBe('Synthetic manual note')
  await act(async () => {
    await request.messageFinishCallback('## Normal saved synthetic notes')
    await work
  })
  expect(fetch).toHaveBeenCalledOnce()
  expect(deleteTranscript).toHaveBeenCalledWith(f.thread)
  expect(capturePostMeetingSource).toHaveBeenCalledOnce()
  expect(f.finish).toHaveBeenCalledOnce()
  expect(f.hook.result.current.retryPreview).toBeNull()
})
it('repeated previews join once and cannot join a save request', async () => {
  const f = fixture(),
    { work, request } = await f.start()
  let repeated!: Promise<void>, save!: Promise<void>
  act(() => {
    repeated = f.hook.result.current.synthesizeContent(
      f.thread,
      'other unsent draft',
      undefined,
      'preview',
    )
    save = f.hook.result.current.synthesizeContent(f.thread, '', undefined, 'save')
  })
  expect(repeated).toBe(work)
  await expect(save).rejects.toThrow('different notes request')
  expect(f.queue).toHaveBeenCalledOnce()
  await act(async () => {
    await request.messageFinishCallback('Synthetic preview')
    await work
  })
  expect(fetch).not.toHaveBeenCalled()
})
it('provider failure permits explicit retry but ignores stale completion', async () => {
  const f = fixture(),
    first = await f.start()
  await act(async () => {
    first.request.errorCallback(new Error('Synthetic provider failure'))
    await expect(first.work).rejects.toThrow('Synthetic provider failure')
  })
  expect(f.hook.result.current.retryPreview).toBeNull()
  const second = await f.start()
  await act(async () => {
    await first.request.messageFinishCallback('Stale synthetic result')
  })
  expect(f.hook.result.current.retryPreview).toBeNull()
  await act(async () => {
    await second.request.messageFinishCallback('Fresh synthetic preview')
    await second.work
  })
  expect(f.hook.result.current.retryPreview?.markdown).toBe('Fresh synthetic preview')
  expect(fetch).not.toHaveBeenCalled()
})
it('profile change cancels pending preview and late result cannot appear', async () => {
  const f = fixture(),
    { work, request } = await f.start()
  await act(async () => {
    owner = { uuid: 'other', email: 'other@example.test', name: 'Other' }
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    await expect(work).rejects.toThrow('Account changed')
  })
  await act(async () => {
    await request.messageFinishCallback('Late private result')
  })
  expect(f.hook.result.current.retryPreview).toBeNull()
  expect(fetch).not.toHaveBeenCalled()
  expect(deleteTranscript).not.toHaveBeenCalled()
})
it('completed preview clears across an account A to B to A round trip', async () => {
  const f = fixture(),
    { work, request } = await f.start()
  await act(async () => {
    await request.messageFinishCallback('Synthetic account A preview')
    await work
  })
  expect(f.hook.result.current.retryPreview).not.toBeNull()
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  f.hook.rerender({ email: 'other@example.test' })
  expect(f.hook.result.current.retryPreview).toBeNull()
  f.hook.rerender({ email: 'owner@example.test' })
  expect(f.hook.result.current.retryPreview).toBeNull()
})
it('unmount cancels preview and late callbacks cannot save or emit completion', async () => {
  const f = fixture(),
    { work, request } = await f.start()
  f.hook.unmount()
  await expect(work).rejects.toThrow('Account or meeting view changed')
  await request.messageFinishCallback('Late unmounted preview')
  expect(fetch).not.toHaveBeenCalled()
  expect(f.finish).not.toHaveBeenCalled()
  expect(capturePostMeetingSource).not.toHaveBeenCalled()
})
it('empty preview is actionable failure without content writes', async () => {
  const f = fixture(),
    { work, request } = await f.start()
  await act(async () => {
    await request.messageFinishCallback('  ')
    await expect(work).rejects.toThrow('No notes were returned')
  })
  expect(f.hook.result.current.retryPreview).toBeNull()
  expect(fetch).not.toHaveBeenCalled()
  expect(deleteTranscript).not.toHaveBeenCalled()
})
it('explicit cancellation rejects late stream and completion', async () => {
  const f = fixture(),
    { work, request } = await f.start()
  await act(async () => {
    cancelNotesGeneration(f.thread, new Error('Synthetic cancellation'))
    await expect(work).rejects.toThrow('Synthetic cancellation')
  })
  act(() => request.messageStreamCallback('Late synthetic stream'))
  await request.messageFinishCallback('Late synthetic completion')
  expect(f.hook.result.current.streamingMarkdown).toBe('')
  expect(f.hook.result.current.retryPreview).toBeNull()
  expect(fetch).not.toHaveBeenCalled()
})

it('missing native identity fails closed before reading or queueing any transcript', async () => {
  const f = fixture()
  vi.mocked(KNLocalStorage.getItem).mockResolvedValue(null)
  let work!: Promise<void>
  act(() => {
    work = f.hook.result.current.synthesizeContent(
      f.thread,
      'Unsent handwritten notes',
      undefined,
      'preview',
    )
  })
  await act(async () => {
    await expect(work).rejects.toThrow('Sign in to this account')
  })
  expect(getTranscript).not.toHaveBeenCalled()
  expect(f.queue).not.toHaveBeenCalled()
  expect(fetch).not.toHaveBeenCalled()
})

it('preview deadline expires without saving, and late completion stays detached', async () => {
  vi.useFakeTimers()
  const f = fixture()
  let work!: Promise<void>
  act(() => {
    work = f.hook.result.current.synthesizeContent(f.thread, '', undefined, 'preview')
  })
  void work.catch(() => {
    /* Rejection is asserted below. */
  })
  await act(async () => {
    for (let i = 0; i < 60; i++) await Promise.resolve()
  })
  expect(f.queue).toHaveBeenCalledOnce()
  const request = f.queue.mock.calls[0][0]
  await act(async () => {
    await vi.advanceTimersByTimeAsync(180000)
    await expect(work).rejects.toThrow('timed out')
  })
  await request.messageFinishCallback('Late synthetic deadline result')
  expect(f.hook.result.current.retryPreview).toBeNull()
  expect(f.hook.result.current.isLLMLoading).toBe(false)
  expect(fetch).not.toHaveBeenCalled()
  expect(deleteTranscript).not.toHaveBeenCalled()
  expect(f.finish).not.toHaveBeenCalled()
})

it('an identity-prop round trip cannot revive a preview without a profile event', async () => {
  const f = fixture(),
    { work, request } = await f.start()
  await act(async () => {
    await request.messageFinishCallback('Old synthetic identity preview')
    await work
  })
  expect(f.hook.result.current.retryPreview).not.toBeNull()
  f.hook.rerender({ email: 'other@example.test' })
  expect(f.hook.result.current.retryPreview).toBeNull()
  f.hook.rerender({ email: 'owner@example.test' })
  expect(f.hook.result.current.retryPreview).toBeNull()
})
