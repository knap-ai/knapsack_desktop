import { useEffect } from 'react'

type CurrentRef<T> = { current: T }

interface ClawdChatKeyboardShortcutOptions {
  active: boolean
  voiceSessionOpen: boolean
  chatFindOpen: boolean
  chatFindInputRef: CurrentRef<HTMLInputElement | null>
  chatInputElementRef: CurrentRef<HTMLTextAreaElement | null>
  stopGenerationRef: CurrentRef<() => void>
  clearHistoryRef: CurrentRef<() => void>
  openChatFindRef: CurrentRef<() => void>
  closeChatFindRef: CurrentRef<() => void>
}

export const useClawdChatKeyboardShortcuts = ({
  active,
  voiceSessionOpen,
  chatFindOpen,
  chatFindInputRef,
  chatInputElementRef,
  stopGenerationRef,
  clearHistoryRef,
  openChatFindRef,
  closeChatFindRef,
}: ClawdChatKeyboardShortcutOptions) => {
  useEffect(() => {
    if (!active) return
    const handleKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (voiceSessionOpen) return
      if (event.key === 'Escape') {
        const activeElement = document.activeElement
        if (chatFindOpen && activeElement === chatFindInputRef.current) {
          event.preventDefault()
          closeChatFindRef.current()
          return
        }
        stopGenerationRef.current()
      }
      if (mod && event.shiftKey && event.key === 'Backspace') {
        event.preventDefault()
        clearHistoryRef.current()
      }
      if (mod && !event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        openChatFindRef.current()
      }
      if (mod && !event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault()
        chatInputElementRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    active,
    chatFindInputRef,
    chatFindOpen,
    chatInputElementRef,
    clearHistoryRef,
    closeChatFindRef,
    openChatFindRef,
    stopGenerationRef,
    voiceSessionOpen,
  ])
}
