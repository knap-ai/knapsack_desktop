// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { useMeetingSynthesis } from 'src/hooks/useMeetingMode'
import { writeCorrections } from 'src/utils/nameCorrections'
import { afterEach, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  profile: { uuid: 'A', name: 'Alice', email: 'a@example.invalid' } as {
    uuid: string
    name: string
    email: string
  } | null,
}))
vi.mock('src/api/transcripts', () => ({
  getTranscript: vi.fn(async () => ({ content: 'Knapsak met Jhon and Anne.' })),
  deleteTranscript: vi.fn(),
}))
vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: {
    getItem: vi.fn(async (key: string) => (key === 'KN_PROFILE' ? state.profile : null)),
  },
}))
vi.mock('src/utils/settings', () => ({
  shouldSaveTranscript: vi.fn(async () => true),
  isSharingEnabled: vi.fn(async () => false),
}))
vi.mock('src/utils/KNAnalytics', () => ({ default: { trackEvent: vi.fn() } }))
vi.mock('src/utils/errorHandling', () => ({ logError: vi.fn() }))
afterEach(cleanup)
it('cancels queued A generation before switching the fixture to B and signed out', async () => {
  localStorage.clear()
  state.profile = { uuid: 'A', name: 'Alice', email: 'a@example.invalid' }
  writeCorrections('A', [
    { from: 'Knapsak', to: 'Knapsack', enabled: true, source: 'explicit', createdAt: 1 },
  ])
  const queue = vi.fn(),
    template = {
      key: 'synthetic',
      title: 'Synthetic',
      prompt: 'Synthetic',
      user_facing_description: '',
    }
  const h = renderHook(
    ({ identity }) => useMeetingSynthesis(null, queue, vi.fn(), template, identity),
    { initialProps: { identity: { name: 'Alice', email: 'a@example.invalid' } } },
  )
  let work: Promise<void>
  act(() => {
    work = h.result.current.synthesizeContent(900401, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  const pending = queue.mock.calls[0][0]
  expect(pending.prompt).toContain('"preferred":"Knapsack"')
  await act(async () => {
    pending.messageStreamCallback('Synthetic A spelling excerpt')
  })
  state.profile = { uuid: 'B', name: 'Bob', email: 'b@example.invalid' }
  h.rerender({ identity: { name: 'Bob', email: 'b@example.invalid' } })
  try {
    expect(pending.signal.aborted).toBe(true)
    expect(h.result.current.streamingMarkdown).toBe('')
  } finally {
    await act(async () => {
      writeCorrections('A', [])
      await work!
    })
    h.unmount()
  }
})
it('cancels on a profile invalidation event without relying on a rerender', async () => {
  state.profile = { uuid: 'A', name: 'Alice', email: 'a@example.invalid' }
  const queue = vi.fn(),
    template = {
      key: 'synthetic',
      title: 'Synthetic',
      prompt: 'Synthetic',
      user_facing_description: '',
    }
  const h = renderHook(() =>
    useMeetingSynthesis(
      null,
      queue,
      vi.fn(),
      template,
      { name: 'Alice', email: 'a@example.invalid' },
      'a@example.invalid',
    ),
  )
  let work: Promise<void>
  act(() => {
    work = h.result.current.synthesizeContent(900403, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  const { PROFILE_CHANGED_EVENT } = await import('src/utils/profileScope')
  state.profile = null
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    await work!
  })
  expect(queue.mock.calls[0][0].signal.aborted).toBe(true)
  h.unmount()
})
it('refuses signed-out generation even if a previous profile is cached', async () => {
  state.profile = { uuid: 'A', name: 'Alice', email: 'a@example.invalid' }
  const queue = vi.fn(),
    template = {
      key: 'synthetic',
      title: 'Synthetic',
      prompt: 'Synthetic',
      user_facing_description: '',
    }
  const h = renderHook(() => useMeetingSynthesis(null, queue, vi.fn(), template, undefined, ''))
  await act(async () => {
    await expect(h.result.current.synthesizeContent(900404, '', undefined)).rejects.toThrow(
      'Sign in',
    )
  })
  expect(queue).not.toHaveBeenCalled()
  h.unmount()
})
it('keeps model hints scoped through A→B→signed-out and ignores late A completion', async () => {
  localStorage.clear()
  state.profile = { uuid: 'A', name: 'Alice', email: 'a@example.invalid' }
  writeCorrections('A', [
    { from: 'Knapsak', to: 'Knapsack', enabled: true, source: 'explicit', createdAt: 1 },
  ])
  writeCorrections('B', [
    { from: 'Jhon', to: 'John', enabled: true, source: 'explicit', createdAt: 2 },
  ])
  const fetcher = vi.fn(() => {
    throw Error('No model or backend network permitted')
  })
  vi.stubGlobal('fetch', fetcher)
  const queue = vi.fn(),
    template = {
      key: 'synthetic',
      title: 'Synthetic',
      prompt: 'Synthetic',
      user_facing_description: '',
    }
  const h = renderHook(
    ({ identity, email }) => useMeetingSynthesis(null, queue, vi.fn(), template, identity, email),
    {
      initialProps: {
        identity: { name: 'Alice', email: 'a@example.invalid' },
        email: 'a@example.invalid',
      },
    },
  )
  let work: Promise<void>
  act(() => {
    work = h.result.current.synthesizeContent(900406, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  const a = queue.mock.calls[0][0]
  expect(a.prompt).toContain('"preferred":"Knapsack"')
  expect(a.prompt).not.toContain('"preferred":"John"')
  const { PROFILE_CHANGED_EVENT } = await import('src/utils/profileScope')
  state.profile = { uuid: 'B', name: 'Bob', email: 'b@example.invalid' }
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    await work!
  })
  h.rerender({ identity: { name: 'Bob', email: 'b@example.invalid' }, email: 'b@example.invalid' })
  act(() => {
    work = h.result.current.synthesizeContent(900406, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledTimes(2))
  const b = queue.mock.calls[1][0]
  expect(b.prompt).toContain('"preferred":"John"')
  expect(b.prompt).not.toContain('"preferred":"Knapsack"')
  expect(b.prompt).toContain('verified first name "Bob"')
  await act(async () => {
    await a.messageFinishCallback('Late synthetic A notes')
  })
  expect(fetcher).not.toHaveBeenCalled()
  state.profile = null
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    await work!
  })
  h.rerender({ identity: { name: '', email: '' }, email: '' })
  await act(async () => {
    await expect(h.result.current.synthesizeContent(900406, '', undefined)).rejects.toThrow(
      'Sign in',
    )
  })
  expect(queue).toHaveBeenCalledTimes(2)
  expect(fetcher).not.toHaveBeenCalled()
  h.unmount()
})
it('uses the captured verified profile name rather than a stale caller name', async () => {
  state.profile = { uuid: 'A', name: 'Bob', email: 'a@example.invalid' }
  const queue = vi.fn(),
    template = {
      key: 'synthetic',
      title: 'Synthetic',
      prompt: 'Synthetic',
      user_facing_description: '',
    }
  const h = renderHook(() =>
    useMeetingSynthesis(
      null,
      queue,
      vi.fn(),
      template,
      { name: 'Alice', email: 'a@example.invalid' },
      'a@example.invalid',
    ),
  )
  let work: Promise<void>
  act(() => {
    work = h.result.current.synthesizeContent(900407, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  expect(queue.mock.calls[0][0].prompt).toContain('verified first name "Bob"')
  expect(queue.mock.calls[0][0].prompt).not.toContain('Alice')
  const { PROFILE_CHANGED_EVENT } = await import('src/utils/profileScope')
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    await work!
  })
  h.unmount()
})
it('cancels pending transcript preparation before queue submission on an account change', async () => {
  state.profile = { uuid: 'A', name: 'Alice', email: 'a@example.invalid' }
  const { getTranscript } = await import('src/api/transcripts')
  let release: (v: unknown) => void = () => {},
    preparing = false
  vi.mocked(getTranscript).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        preparing = true
        release = resolve as (v: unknown) => void
      }),
  )
  const queue = vi.fn(),
    template = {
      key: 'synthetic',
      title: 'Synthetic',
      prompt: 'Synthetic',
      user_facing_description: '',
    }
  const h = renderHook(() =>
    useMeetingSynthesis(
      null,
      queue,
      vi.fn(),
      template,
      { name: 'Alice', email: 'a@example.invalid' },
      'a@example.invalid',
    ),
  )
  let work: Promise<void>
  act(() => {
    work = h.result.current.synthesizeContent(900408, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(preparing).toBe(true))
  const { PROFILE_CHANGED_EVENT } = await import('src/utils/profileScope')
  state.profile = { uuid: 'B', name: 'Bob', email: 'b@example.invalid' }
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    release({ content: 'Synthetic A transcript' })
    await work!
  })
  expect(queue).not.toHaveBeenCalled()
  h.unmount()
})
it('does not publish a completion into B after an already-submitted synthetic local write settles', async () => {
  state.profile = { uuid: 'A', name: 'Alice', email: 'a@example.invalid' }
  let release: (v: unknown) => void = () => {}
  const fetcher = vi.fn(
    () =>
      new Promise(resolve => {
        release = resolve
      }),
  )
  vi.stubGlobal('fetch', fetcher)
  const queue = vi.fn(),
    finished = vi.fn(),
    template = {
      key: 'synthetic',
      title: 'Synthetic',
      prompt: 'Synthetic',
      user_facing_description: '',
    }
  const h = renderHook(() =>
    useMeetingSynthesis(
      null,
      queue,
      finished,
      template,
      { name: 'Alice', email: 'a@example.invalid' },
      'a@example.invalid',
    ),
  )
  let work: Promise<void>
  act(() => {
    work = h.result.current.synthesizeContent(900409, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  let completion: Promise<unknown>
  act(() => {
    completion = queue.mock.calls[0][0].messageFinishCallback('Synthetic A generated notes')
  })
  await waitFor(() => expect(fetcher).toHaveBeenCalledOnce())
  const { PROFILE_CHANGED_EVENT } = await import('src/utils/profileScope')
  state.profile = { uuid: 'B', name: 'Bob', email: 'b@example.invalid' }
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    release({ ok: true, json: async () => ({ success: true }) })
    await work!
    await completion!
  })
  expect(queue.mock.calls[0][0].signal.aborted).toBe(true)
  expect(finished).not.toHaveBeenCalled()
  expect(fetcher).toHaveBeenCalledOnce()
  h.unmount()
})
it('does not cancel same-profile generation when connected-account aliases finish loading', async () => {
  state.profile = { uuid: 'A', name: 'Alice', email: 'a@example.invalid' }
  const queue = vi.fn(),
    template = {
      key: 'synthetic',
      title: 'Synthetic',
      prompt: 'Synthetic',
      user_facing_description: '',
    }
  const h = renderHook(
    ({ emails }) =>
      useMeetingSynthesis(
        null,
        queue,
        vi.fn(),
        template,
        { name: 'Alice', email: 'a@example.invalid', emails },
        'a@example.invalid',
      ),
    { initialProps: { emails: ['a@example.invalid'] } },
  )
  let work: Promise<void>
  act(() => {
    work = h.result.current.synthesizeContent(900411, '', undefined).catch(() => {})
  })
  await waitFor(() => expect(queue).toHaveBeenCalledOnce())
  h.rerender({ emails: ['a@example.invalid', 'alias@example.invalid'] })
  expect(queue.mock.calls[0][0].signal.aborted).toBe(false)
  const { PROFILE_CHANGED_EVENT } = await import('src/utils/profileScope')
  await act(async () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    await work!
  })
  h.unmount()
})
