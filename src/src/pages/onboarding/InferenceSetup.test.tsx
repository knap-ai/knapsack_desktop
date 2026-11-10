// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import InferenceSetup from './InferenceSetup'

const f = vi.hoisted(() => ({
  privacy: { enabled: false, selected_mode: 'local-only' },
  authenticated: false,
  open: vi.fn(),
  fetch: vi.fn(),
}))
vi.mock('@tauri-apps/api/shell', () => ({ open: f.open }))
vi.mock('src/utils/privacyMode', () => ({
  initializePrivacyMode: async () => f.privacy,
}))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
beforeEach(() => {
  f.privacy = { enabled: false, selected_mode: 'local-only' }
  f.authenticated = false
  f.open.mockReset()
  f.open.mockResolvedValue(undefined)
  f.fetch.mockReset()
  f.fetch.mockImplementation(async (url: string) => ({
    ok: true,
    json: async () =>
      url.endsWith('api-key-status')
        ? {
            success: true,
            has_knapsack: f.authenticated,
            knapsack_email: 'studio@example.invalid',
          }
        : { success: true },
  }))
  vi.stubGlobal('fetch', f.fetch)
})
const mount = () => {
  const next = vi.fn(),
    back = vi.fn()
  render(<InferenceSetup onContinue={next} onBack={back} />)
  return { next, back }
}
it('does not infer Studio authentication from email or auto-select a provider', async () => {
  const { next } = mount()
  await screen.findByText('Connect Knapsack')
  expect(screen.getByText('Use Knapsack').hasAttribute('disabled')).toBe(true)
  expect(f.fetch.mock.calls.every(([url]) => url.endsWith('api-key-status'))).toBe(true)
  fireEvent.click(screen.getByText('Set up later'))
  expect(next).toHaveBeenCalledOnce()
})
it('opens the supported external flow once and cancel waiting never selects a provider', async () => {
  mount()
  const connect = await screen.findByText('Connect Knapsack')
  fireEvent.click(connect)
  fireEvent.click(connect)
  expect(f.open).toHaveBeenCalledTimes(1)
  expect(new URL(f.open.mock.calls[0][0]).pathname).toBe('/desktop-connect')
  fireEvent.click(screen.getByText('Cancel waiting'))
  expect(screen.getByText('Connect Knapsack')).toBeTruthy()
  expect(f.fetch.mock.calls.some(([url]) => url.endsWith('set-api-key'))).toBe(false)
})
it('reuses verified saved credentials, selects only on click, and deduplicates repeated clicks', async () => {
  f.authenticated = true
  mount()
  const use = await screen.findByText('Use Knapsack')
  await waitFor(() => expect(use.hasAttribute('disabled')).toBe(false))
  act(() => {
    use.click()
    use.click()
  })
  await screen.findByText('Provider connected')
  const posts = f.fetch.mock.calls.filter(([url]) => url.endsWith('set-api-key'))
  expect(posts).toHaveLength(1)
  expect(JSON.parse(posts[0][1].body).key).toBe('')
})
it('keeps local-only privacy and makes no cloud selection', async () => {
  f.privacy.enabled = true
  mount()
  await screen.findByText(/cloud setup is disabled/)
  expect(screen.queryByText('Connect Knapsack')).toBeNull()
  expect(f.fetch.mock.calls.some(([url]) => url.endsWith('set-api-key'))).toBe(false)
})
it('rejects a privacy change before selection without weakening it', async () => {
  f.authenticated = true
  mount()
  const use = await screen.findByText('Use Knapsack')
  await waitFor(() => expect(use.hasAttribute('disabled')).toBe(false))
  f.privacy.enabled = true
  fireEvent.click(use)
  await screen.findByRole('alert')
  expect(f.fetch.mock.calls.some(([url]) => url.endsWith('set-api-key'))).toBe(false)
})
it('invalidates credentials and clears setup authority on account change', async () => {
  f.authenticated = true
  const { back } = mount()
  await screen.findByText(/Studio credentials are connected/)
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  expect(screen.getByRole('alert').textContent).toMatch(/Account changed/)
  fireEvent.click(screen.getByText('Back'))
  expect(back).toHaveBeenCalledOnce()
  expect(f.fetch.mock.calls.some(([url]) => url.endsWith('set-api-key'))).toBe(false)
})

it('validates a new API key before saving and retains it on rejection without a fallback write', async () => {
  f.fetch.mockImplementation(async (url: string) => ({
    ok: true,
    json: async () =>
      url.endsWith('api-key-status') ? { success: true } : { success: true, valid: false },
  }))
  mount()
  fireEvent.change(await screen.findByRole('combobox'), {
    target: { value: 'openai' },
  })
  const input = await screen.findByLabelText(/API key/)
  fireEvent.change(input, { target: { value: 'synthetic-key-not-real' } })
  fireEvent.click(screen.getByText('Save and use provider'))
  await screen.findByRole('alert')
  expect((input as HTMLInputElement).value).toBe('synthetic-key-not-real')
  expect(f.fetch.mock.calls.some(([url]) => url.endsWith('validate-api-key'))).toBe(true)
  expect(f.fetch.mock.calls.some(([url]) => url.endsWith('set-api-key'))).toBe(false)
})
it('reopens without retaining an unsubmitted API key', async () => {
  const first = render(<InferenceSetup onContinue={() => undefined} onBack={() => undefined} />)
  fireEvent.change(await screen.findByRole('combobox'), {
    target: { value: 'openai' },
  })
  fireEvent.change(await screen.findByLabelText(/API key/), {
    target: { value: 'synthetic-key-not-real' },
  })
  first.unmount()
  mount()
  fireEvent.change(await screen.findByRole('combobox'), {
    target: { value: 'openai' },
  })
  expect(((await screen.findByLabelText(/API key/)) as HTMLInputElement).value).toBe('')
})
