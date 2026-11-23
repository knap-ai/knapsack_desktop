import { useEffect, useRef, type RefObject } from 'react'

/** Non-modal disclosure: normal Tab order, Escape return, and outside dismissal. */
export function useAssistantControls(
  open: boolean,
  panel: RefObject<HTMLDivElement>,
  trigger: RefObject<HTMLButtonElement>,
  close: () => void,
) {
  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => {
    if (!open) return
    const inside = (target: EventTarget | null) =>
      panel.current?.contains(target as Node) || trigger.current?.contains(target as Node)
    panel.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
    const pointer = (event: MouseEvent) => {
      if (!inside(event.target)) closeRef.current()
    }
    const focus = (event: FocusEvent) => {
      if (!inside(event.target)) closeRef.current()
    }
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      closeRef.current()
      trigger.current?.focus()
    }
    document.addEventListener('mousedown', pointer)
    document.addEventListener('focusin', focus)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', pointer)
      document.removeEventListener('focusin', focus)
      document.removeEventListener('keydown', key)
    }
  }, [open, panel, trigger])
}
