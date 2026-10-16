import { open } from '@tauri-apps/api/shell'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { openGoogleAuthScreen } from './google'

vi.mock('@tauri-apps/api/shell', () => ({ open: vi.fn() }))
vi.mock('../errorHandling', () => ({ logError: vi.fn() }))

describe('Google OAuth browser launch', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'synthetic-client-id')
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('resolves only after the Tauri shell opens the authorization URL', async () => {
    vi.mocked(open).mockResolvedValue(undefined)
    const browserFallback = vi.fn()
    vi.stubGlobal('window', { open: browserFallback })

    await expect(openGoogleAuthScreen('synthetic.scope')).resolves.toBeUndefined()

    expect(open).toHaveBeenCalledOnce()
    expect(browserFallback).not.toHaveBeenCalled()
  })

  it('resolves when the browser fallback opens after a shell failure', async () => {
    vi.mocked(open).mockRejectedValue(new Error('synthetic shell failure'))
    const browserFallback = vi.fn(() => ({}))
    vi.stubGlobal('window', { open: browserFallback })

    await expect(openGoogleAuthScreen('synthetic.scope')).resolves.toBeUndefined()

    expect(browserFallback).toHaveBeenCalledOnce()
  })

  it('rejects when both browser launch paths fail', async () => {
    vi.mocked(open).mockRejectedValue(new Error('synthetic shell failure'))
    vi.stubGlobal('window', { open: vi.fn(() => null) })

    await expect(
      openGoogleAuthScreen('synthetic.scope', undefined, { rejectOnLaunchFailure: true }),
    ).rejects.toThrow(
      'Unable to open Google Auth screen.',
    )
  })

  it('preserves non-rejecting behavior for existing fire-and-forget callers', async () => {
    vi.mocked(open).mockRejectedValue(new Error('synthetic shell failure'))
    vi.stubGlobal('window', { open: vi.fn(() => null) })

    await expect(openGoogleAuthScreen('synthetic.scope')).resolves.toBeUndefined()
  })
})
