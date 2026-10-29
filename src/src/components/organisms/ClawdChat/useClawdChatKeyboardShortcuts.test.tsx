// @vitest-environment jsdom
import { useRef } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useClawdChatKeyboardShortcuts } from './useClawdChatKeyboardShortcuts'

const KeyboardHarness = ({ active, stopGeneration, clearHistory }: {
  active: boolean
  stopGeneration: () => void
  clearHistory: () => void
}) => {
  const chatFindInputRef = useRef<HTMLInputElement | null>(null)
  const chatInputElementRef = useRef<HTMLTextAreaElement | null>(null)
  const stopGenerationRef = useRef(stopGeneration)
  const clearHistoryRef = useRef(clearHistory)
  const openChatFindRef = useRef(vi.fn())
  const closeChatFindRef = useRef(vi.fn())
  stopGenerationRef.current = stopGeneration
  clearHistoryRef.current = clearHistory

  useClawdChatKeyboardShortcuts({
    active,
    voiceSessionOpen: false,
    chatFindOpen: false,
    chatFindInputRef,
    chatInputElementRef,
    stopGenerationRef,
    clearHistoryRef,
    openChatFindRef,
    closeChatFindRef,
  })

  return <textarea ref={chatInputElementRef} aria-label="Chat input" />
}

afterEach(cleanup)

describe('ClawdChat global keyboard shortcuts', () => {
  it('removes destructive shortcuts while inactive and restores them when active again', () => {
    const stopGeneration = vi.fn()
    const clearHistory = vi.fn()
    const view = render(
      <KeyboardHarness active stopGeneration={stopGeneration} clearHistory={clearHistory} />,
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'Backspace', ctrlKey: true, shiftKey: true })
    expect(stopGeneration).toHaveBeenCalledTimes(1)
    expect(clearHistory).toHaveBeenCalledTimes(1)

    view.rerender(
      <KeyboardHarness active={false} stopGeneration={stopGeneration} clearHistory={clearHistory} />,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'Backspace', metaKey: true, shiftKey: true })
    expect(stopGeneration).toHaveBeenCalledTimes(1)
    expect(clearHistory).toHaveBeenCalledTimes(1)

    view.rerender(
      <KeyboardHarness active stopGeneration={stopGeneration} clearHistory={clearHistory} />,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(stopGeneration).toHaveBeenCalledTimes(2)
  })
})
