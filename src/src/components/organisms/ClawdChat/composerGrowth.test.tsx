// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { ChatInputBar } from './index'

// Module-level native listeners are unrelated to this renderer-only fixture.
vi.mock('@tauri-apps/api/event', () => ({ listen: vi.fn(async () => vi.fn()), emit: vi.fn() }))
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(() => Promise.reject(new Error('fixture_native_io_blocked'))),
  convertFileSrc: vi.fn(),
}))

const props = () => ({
  busy: false,
  providerReady: true,
  hasQueuedMessage: false,
  isRecording: false,
  isStartingRecording: false,
  isTranscribing: false,
  voiceEnabled: false,
  attachedFiles: [],
  onSend: vi.fn(),
  onQueue: vi.fn(),
  onFileSelect: vi.fn(),
  onRemoveFile: vi.fn(),
  onJumpToQuote: vi.fn(),
  onStartRecording: vi.fn(),
  onStopRecording: vi.fn(),
  onStopGeneration: vi.fn(),
  onCancelReply: vi.fn(),
})
const originalScrollHeight = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  'scrollHeight',
)
let contentHeight = 36
beforeEach(() => {
  contentHeight = 36
  Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => contentHeight,
  })
  vi.stubGlobal('innerHeight', 900)
})
afterEach(() => {
  cleanup()
  if (originalScrollHeight)
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', originalScrollHeight)
  else Reflect.deleteProperty(HTMLTextAreaElement.prototype, 'scrollHeight')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it('grows immediately for multiline input and shrinks on deletion and send', () => {
  const p = props()
  render(<ChatInputBar {...p} />)
  const input = screen.getByTestId('qa-clawd-chat-input') as HTMLTextAreaElement
  contentHeight = 240
  fireEvent.input(input, { target: { value: 'First line\nSecond line' } })
  expect(input.style.height).toBe('240px')
  expect(input.style.overflowY).toBe('hidden')
  contentHeight = 70
  fireEvent.input(input, { target: { value: 'Short draft' } })
  expect(input.style.height).toBe('70px')
  contentHeight = 36
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  expect(p.onSend).toHaveBeenCalledWith('Short draft')
  expect(input.value).toBe('')
  expect(input.style.height).toBe('36px')
})
it('sizes restored drafts and dictation, caps only at viewport budget and updates on resize', () => {
  contentHeight = 300
  const p = props()
  const view = render(<ChatInputBar {...p} initialValue={'Restored\ndraft'} initialValueKey={1} />)
  const input = screen.getByTestId('qa-clawd-chat-input') as HTMLTextAreaElement
  expect(input.style.height).toBe('300px')
  contentHeight = 700
  fireEvent.input(input, {
    target: { value: 'Pasted or dictated multiline draft' },
    inputType: 'insertFromPaste',
  })
  expect(input.style.height).toBe('450px')
  expect(input.style.overflowY).toBe('auto')
  vi.stubGlobal('innerHeight', 600)
  fireEvent(window, new Event('resize'))
  expect(input.style.height).toBe('300px')
  contentHeight = 80
  view.rerender(<ChatInputBar {...p} initialValue="Another restored draft" initialValueKey={2} />)
  expect(input.style.height).toBe('80px')
  expect(input.style.overflowY).toBe('hidden')
})
it('keeps Shift+Enter and IME Enter unsent, and retains normal Enter/queue behavior', () => {
  const p = props()
  const view = render(<ChatInputBar {...p} />)
  const input = screen.getByTestId('qa-clawd-chat-input') as HTMLTextAreaElement
  fireEvent.input(input, { target: { value: 'Draft' } })
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
  expect(p.onSend).not.toHaveBeenCalled()
  expect(input.value).toBe('Draft')
  view.rerender(<ChatInputBar {...p} busy />)
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(p.onQueue).toHaveBeenCalledWith('Draft', [])
  expect(input.value).toBe('')
})

it('remeasures wrapped drafts after container width changes and disconnects on exit', () => {
  let remeasure: (() => void) | undefined
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        remeasure = callback
      }
      observe() {
        return undefined
      }
      disconnect: () => void = disconnect
    },
  )
  const view = render(<ChatInputBar {...props()} initialValue="Wrapped draft" />)
  const input = screen.getByTestId('qa-clawd-chat-input') as HTMLTextAreaElement
  Object.defineProperty(input, 'clientWidth', { configurable: true, value: 200 })
  contentHeight = 200
  remeasure?.()
  expect(input.style.height).toBe('200px')
  view.unmount()
  expect(disconnect).toHaveBeenCalledOnce()
})
