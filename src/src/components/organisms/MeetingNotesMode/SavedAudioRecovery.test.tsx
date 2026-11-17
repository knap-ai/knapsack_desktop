// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import SavedAudioRecovery from './SavedAudioRecovery'

const invoke = vi.hoisted(() => vi.fn())
vi.mock('@tauri-apps/api/tauri', () => ({ invoke }))
const props = {
  pendingAudio: 2,
  transcriptionError: null,
  setTranscriptionError: vi.fn(),
  reconnecting: false,
  reconnectTranscription: vi.fn(),
}
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
it('offers recovery for saved audio without a current recording error, with no automatic replay', async () => {
  let finish!: () => void
  invoke.mockImplementation(
    () =>
      new Promise<void>(resolve => {
        finish = resolve
      }),
  )
  render(<SavedAudioRecovery {...props} />)
  expect(screen.getByRole('status').textContent).toContain('waiting')
  expect(screen.queryByRole('alert')).toBeNull()
  expect(invoke).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Retry saved audio' }))
  fireEvent.click(screen.getByRole('button', { name: 'Resuming transcription…' }))
  expect(invoke).toHaveBeenCalledTimes(1)
  expect(invoke).toHaveBeenCalledWith('resume_saved_transcription')
  finish()
  await waitFor(() => expect(screen.getByRole('button').hasAttribute('disabled')).toBe(false))
})
it('retains retry after a failed attempt', async () => {
  invoke.mockRejectedValue(new Error('unavailable'))
  render(<SavedAudioRecovery {...props} />)
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => expect(props.setTranscriptionError).toHaveBeenCalled())
  expect(screen.getByRole('button').textContent).toBe('Retry saved audio')
})
it('keeps sign-in limited to authentication failures', () => {
  render(<SavedAudioRecovery {...props} transcriptionError="Session expired" />)
  expect(screen.getByRole('alert')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Sign in to Knapsack' }))
  expect(props.reconnectTranscription).toHaveBeenCalledTimes(1)
  expect(invoke).not.toHaveBeenCalled()
})
it('does not offer recovery without pending audio', () => {
  render(<SavedAudioRecovery {...props} pendingAudio={0} />)
  expect(screen.queryByRole('button')).toBeNull()
})
