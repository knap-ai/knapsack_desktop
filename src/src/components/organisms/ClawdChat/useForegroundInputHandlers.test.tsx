// @vitest-environment jsdom
import { useRef } from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const tauri = vi.hoisted(() => ({
  handlers: new Map<string, (event: { payload: unknown }) => void>(),
  listen: vi.fn(),
  unlisten: vi.fn(),
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: tauri.listen,
}))

import {
  useForegroundNativeFileDropEvents,
  useVoiceDialogFocusTrap,
} from './useForegroundInputHandlers'

const FileDropHarness = ({ active, onDrop }: {
  active: boolean
  onDrop: (paths: string[]) => void
}) => {
  useForegroundNativeFileDropEvents({
    active,
    onDrop,
    onHover: vi.fn(),
    onCancel: vi.fn(),
  })
  return null
}

const VoiceHarness = ({ active, onClose }: {
  active: boolean
  onClose: () => void
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  useVoiceDialogFocusTrap({ active, dialogRef, onClose })
  return <div ref={dialogRef}>
    <button data-voice-primary>Primary voice control</button>
    <button>Secondary voice control</button>
  </div>
}

afterEach(() => {
  cleanup()
  tauri.handlers.clear()
  vi.clearAllMocks()
})

describe('foreground-only input handlers', () => {
  it('registers native file-drop only while foreground and ignores a stale handler after hiding', async () => {
    tauri.listen.mockImplementation(async (event: string, handler: (event: { payload: unknown }) => void) => {
      tauri.handlers.set(event, handler)
      return tauri.unlisten
    })
    const onDrop = vi.fn()
    const view = render(<FileDropHarness active={false} onDrop={onDrop} />)
    expect(tauri.listen).not.toHaveBeenCalled()

    view.rerender(<FileDropHarness active onDrop={onDrop} />)
    await waitFor(() => expect(tauri.listen).toHaveBeenCalledTimes(3))
    const staleDropHandler = tauri.handlers.get('tauri://file-drop')
    staleDropHandler?.({ payload: ['/tmp/review-only.txt'] })
    expect(onDrop).toHaveBeenCalledWith(['/tmp/review-only.txt'])

    view.rerender(<FileDropHarness active={false} onDrop={onDrop} />)
    await waitFor(() => expect(tauri.unlisten).toHaveBeenCalledTimes(3))
    staleDropHandler?.({ payload: ['/tmp/must-not-attach.txt'] })
    expect(onDrop).toHaveBeenCalledTimes(1)
  })

  it('does not trap Tab or Escape when the voice dialog loses foreground ownership', () => {
    const onClose = vi.fn()
    const view = render(<VoiceHarness active onClose={onClose} />)
    const activeEscape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    window.dispatchEvent(activeEscape)
    expect(activeEscape.defaultPrevented).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(1)

    view.rerender(<VoiceHarness active={false} onClose={onClose} />)
    const hiddenTab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    const hiddenEscape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    window.dispatchEvent(hiddenTab)
    window.dispatchEvent(hiddenEscape)
    expect(hiddenTab.defaultPrevented).toBe(false)
    expect(hiddenEscape.defaultPrevented).toBe(false)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
