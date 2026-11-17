// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'

import DataFetcher from './data_fetch'

afterEach(() => vi.unstubAllGlobals())
it('does not turn a failed cache read into a successful empty inbox', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) })
  vi.stubGlobal('fetch', fetch)
  await expect(
    new DataFetcher().getRecentGmailMessages(7, 5000, true, ['a@example.test']),
  ).rejects.toThrow()
})
it('preserves an explicit mailbox scope and distinguishes genuine empty results', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ success: true, display_docs: [] }) })
  vi.stubGlobal('fetch', fetch)
  await expect(
    new DataFetcher().getRecentGmailMessages(7, 5000, true, ['a@example.test']),
  ).resolves.toEqual([])
  expect(JSON.parse(fetch.mock.calls[0][1].body).account_emails).toEqual(['a@example.test'])
  fetch.mockClear()
  await expect(new DataFetcher().getRecentGmailMessages(7, 5000, true, [])).resolves.toEqual([])
  expect(fetch).not.toHaveBeenCalled()
})
it('rejects malformed successful cache responses in strict mode', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
  )
  await expect(
    new DataFetcher().getRecentGmailMessages(7, 5000, true, ['a@example.test']),
  ).rejects.toThrow('invalid message list')
})
