// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'

import DataFetcher from './data_fetch'

vi.mock('./errorHandling', () => ({ logError: vi.fn() }))
afterEach(() => vi.unstubAllGlobals())
it('surfaces a native configuration failure without retrying or exposing its response body', async () => {
  const fetch = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          error_code: 'MODEL_NOT_CONFIGURED',
          message: 'synthetic-private-provider-detail',
        }),
        { status: 400 },
      ),
  )
  vi.stubGlobal('fetch', fetch)
  await expect(
    new DataFetcher().getChatCompletionStream(
      'owner@example.test',
      'Owner',
      'Synthetic prompt',
      '',
      [],
      [],
      undefined,
      undefined,
      'notes',
      new AbortController().signal,
    ),
  ).rejects.toThrow('model provider')
  expect(fetch).toHaveBeenCalledOnce()
})
it('never surfaces arbitrary provider response content and keeps notes single-attempt', async () => {
  const fetch = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          error_code: 'UNRECOGNIZED',
          message: 'synthetic-private-provider-detail',
        }),
        { status: 403 },
      ),
  )
  vi.stubGlobal('fetch', fetch)
  const request = new DataFetcher().getChatCompletionStream(
    'owner@example.test',
    'Owner',
    'Synthetic prompt',
    '',
    [],
    [],
    undefined,
    undefined,
    'notes',
    new AbortController().signal,
  )
  await expect(request).rejects.toThrow('not authorized (HTTP 403)')
  expect(fetch).toHaveBeenCalledOnce()
})
it('does not turn cancellation into a retry or generic provider error', async () => {
  const fetch = vi.fn(async () => {
    throw new DOMException('Synthetic abort', 'AbortError')
  })
  vi.stubGlobal('fetch', fetch)
  await expect(
    new DataFetcher().getChatCompletionStream(
      'owner@example.test',
      'Owner',
      'Synthetic prompt',
      '',
      [],
      [],
      undefined,
      undefined,
      'notes',
      new AbortController().signal,
    ),
  ).rejects.toHaveProperty('name', 'AbortError')
  expect(fetch).toHaveBeenCalledOnce()
})

it('also preserves typed errors for a single-attempt legacy notes caller without a signal', async () => {
  const fetch = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          error_code: 'MODEL_NOT_CONFIGURED',
          message: 'synthetic-private-provider-detail',
        }),
        { status: 400 },
      ),
  )
  vi.stubGlobal('fetch', fetch)
  await expect(
    new DataFetcher().getChatCompletionStream(
      'owner@example.test',
      'Owner',
      'Synthetic prompt',
      '',
      [],
      [],
      undefined,
      undefined,
      'notes',
    ),
  ).rejects.toThrow('model provider')
  expect(fetch).toHaveBeenCalledOnce()
})
