// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), translate: vi.fn(), copy: vi.fn() }))
vi.mock('src/api/transcripts', () => ({ getSavedTranscript: mocks.fetch }))
vi.mock('src/utils/translate', () => ({
  detectLanguage: () => ({ code: 'es', name: 'Spanish' }),
  translateToEnglish: mocks.translate,
}))
vi.mock('src/utils/transcriptClipboard', () => ({
  transcriptBodyForClipboard: (text: string) => text,
  copyTranscriptText: mocks.copy,
}))
import TranscriptView from './index'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const copyButton = () => screen.getByRole('button', { name: 'Copy transcript' }) as HTMLButtonElement
const view = (threadId: number) => <TranscriptView threadId={threadId} onClose={vi.fn()} />
const loaded = async (text: string) => screen.findByText(text)
beforeEach(() => { vi.resetAllMocks(); mocks.copy.mockResolvedValue(undefined) })
afterEach(cleanup)

it('disables copy immediately during a new load, then on failure, and recovers on another thread', async () => {
  const next = deferred<{ content: string }>()
  mocks.fetch.mockResolvedValueOnce({ content: 'Alex: Fictional alpha' }).mockReturnValueOnce(next.promise)
    .mockResolvedValueOnce({ content: 'Alex: Fictional gamma' })
  const { rerender } = render(view(1)); await loaded('Fictional alpha')
  fireEvent.click(copyButton()); await waitFor(() => expect(mocks.copy).toHaveBeenCalledWith('Alex: Fictional alpha'))
  rerender(view(2))
  expect(copyButton().disabled).toBe(true)
  expect(screen.queryByText('Fictional alpha')).toBeNull()
  fireEvent.click(copyButton()); expect(mocks.copy).toHaveBeenCalledTimes(1)
  next.reject(Error('fictional failure')); await loaded('Failed to fetch transcript')
  expect(copyButton().disabled).toBe(true)
  rerender(view(3)); await loaded('Fictional gamma')
  expect(copyButton().disabled).toBe(false)
  expect(screen.queryByText('Failed to fetch transcript')).toBeNull()
})

it.each([false, true])('ignores an out-of-order transcript completion (failure=%s)', async fail => {
  const old = deferred<{ content: string }>()
  mocks.fetch.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ content: 'Alex: Fictional current' })
  const { rerender } = render(view(1)); rerender(view(2)); await loaded('Fictional current')
  if (fail) old.reject(Error('old failure'))
  else old.resolve({ content: 'Alex: Fictional stale' })
  await old.promise.catch(() => undefined)
  fireEvent.click(copyButton())
  await waitFor(() => expect(mocks.copy).toHaveBeenCalledWith('Alex: Fictional current'))
  expect(screen.queryByText('Fictional stale')).toBeNull()
  expect(screen.queryByText('Failed to fetch transcript')).toBeNull()
})

it.each([false, true])('ignores an old translation after A-B-A navigation (failure=%s)', async fail => {
  const old = deferred<string>()
  mocks.translate.mockReturnValue(old.promise)
  mocks.fetch.mockResolvedValueOnce({ content: 'Alex: Fictional original A' })
    .mockReturnValueOnce(new Promise(() => {})).mockResolvedValueOnce({ content: 'Alex: Fictional fresh A' })
  const { rerender } = render(view(1)); await loaded('Fictional original A')
  fireEvent.click(screen.getByRole('button', { name: 'Translate to English' }))
  rerender(view(2)); rerender(view(1)); await loaded('Fictional fresh A')
  if (fail) old.reject(Error('old translation'))
  else old.resolve('Alex: Fictional stale translation')
  await old.promise.catch(() => undefined)
  fireEvent.click(copyButton())
  await waitFor(() => expect(mocks.copy).toHaveBeenCalledWith('Alex: Fictional fresh A'))
  expect(screen.queryByText('Fictional stale translation')).toBeNull()
  expect(screen.queryByText('Translation failed. Please try again.')).toBeNull()
})

it.each([null, { content: '' }])('does not copy a missing or empty transcript: %s', async data => {
  mocks.fetch.mockResolvedValue(data)
  render(view(1))
  await waitFor(() => expect(mocks.fetch).toHaveBeenCalled())
  expect(copyButton().disabled).toBe(true)
  fireEvent.click(copyButton()); expect(mocks.copy).not.toHaveBeenCalled()
})
