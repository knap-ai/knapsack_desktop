// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { PrivacyModeStatus } from 'src/utils/privacyMode'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import PrivacyModeControl from './PrivacyModeControl'

const mocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  save: vi.fn(),
  open: vi.fn(),
  status: {} as PrivacyModeStatus,
}))
vi.mock('src/utils/privacyMode', () => ({
  privacyModeStatus: () => mocks.status,
  initializePrivacyMode: mocks.initialize,
  setPrivacyMode: mocks.save,
}))
vi.mock('@tauri-apps/api/shell', () => ({ open: mocks.open }))
vi.mock('./LocalSpeechSetup', () => ({ default: () => <p>Local speech setup fixture</p> }))
vi.mock('src/pages/onboarding/PrivacySetup', () => ({
  default: () => <p>Local AI setup fixture</p>,
}))

beforeEach(() => {
  mocks.status = {
    enabled: true,
    policy_version: 1,
    inference: 'zero-retention',
    selected_mode: 'zero-retention',
    telemetry: 'disabled',
    manifest_sha256: '',
    provider_selection: 'knapsack',
  }
  mocks.initialize.mockResolvedValue(mocks.status)
  mocks.save.mockImplementation(async (enabled, mode) => {
    mocks.status = {
      ...mocks.status,
      enabled,
      selected_mode: mode,
      inference: enabled ? mode : 'normal',
    }
    window.dispatchEvent(new Event('privacy-mode-changed'))
    return mocks.status
  })
  mocks.open.mockResolvedValue(undefined)
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})
async function openDialog() {
  render(<PrivacyModeControl />)
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /Privacy:/ }).hasAttribute('disabled')).toBe(false),
  )
  fireEvent.click(screen.getByRole('button', { name: /Privacy:/ }))
  expect(screen.getByRole('heading', { name: 'AI privacy' })).toBeTruthy()
}
it('opening, closing and reopening explains privacy without changing policy or provider', async () => {
  await openDialog()
  expect(screen.getByText(/Usage and billing records may remain/)).toBeTruthy()
  expect(screen.getByText(/Backups are separate/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  fireEvent.click(screen.getByRole('button', { name: /Privacy:/ }))
  expect(screen.getByRole('heading', { name: 'AI privacy' })).toBeTruthy()
  expect(mocks.save).not.toHaveBeenCalled()
  expect(fetch).not.toHaveBeenCalled()
})
it('keeps Groq confirmation required and sends the same explicit approved route', async () => {
  await openDialog()
  fireEvent.click(screen.getByText('Other cloud providers'))
  const use = screen.getByRole('button', { name: 'Confirm and use Groq' })
  expect(use.hasAttribute('disabled')).toBe(true)
  fireEvent.click(use)
  expect(fetch).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('checkbox', { name: /I enabled ZDR for AI and speech/ }))
  expect(use.hasAttribute('disabled')).toBe(false)
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ has_groq_key: true, success: true }),
  } as Response)
  fireEvent.click(use)
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(true, 'zero-retention', true, false))
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
  expect(JSON.parse(String(vi.mocked(fetch).mock.calls[1][1]?.body))).toEqual({
    provider: 'groq',
    key: '',
    model: 'openai/gpt-oss-120b',
  })
})
it('retains on-device setup and changes policy only after explicit selection', async () => {
  await openDialog()
  fireEvent.click(screen.getByRole('button', { name: /^On-device/ }))
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(true, 'local-only', undefined))
  expect(screen.getByText('Set up on-device AI and speech')).toBeTruthy()
  expect(screen.getByText('Local speech setup fixture')).toBeTruthy()
  expect(fetch).not.toHaveBeenCalled()
})
it('explains standard provider policy when Off is explicitly selected', async () => {
  await openDialog()
  fireEvent.click(screen.getByRole('button', { name: /^Off/ }))
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(false, 'zero-retention', undefined))
  expect(screen.getByText(/Analytics may be enabled/)).toBeTruthy()
})
it('opens only the chosen public reference and never treats it as a privacy change', async () => {
  await openDialog()
  const link = screen.getByRole('link', { name: /On-device AI — Ollama local FAQ/ })
  expect(link.getAttribute('href')).toBe('https://docs.ollama.com/faq')
  fireEvent.click(link)
  expect(mocks.open).toHaveBeenCalledWith('https://docs.ollama.com/faq')
  expect(mocks.save).not.toHaveBeenCalled()
  expect(fetch).not.toHaveBeenCalled()
})
it('keeps a failed provider connection actionable without changing policy', async () => {
  await openDialog()
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ has_knapsack: false }),
  } as Response)
  fireEvent.click(screen.getByRole('button', { name: 'Use Knapsack' }))
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toContain('Connect this provider'),
  )
  expect(mocks.save).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Done' }).hasAttribute('disabled')).toBe(false)
})
