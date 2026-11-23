import {
  useCallback,
  useEffect,
  useRef,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'

/** Keep focus transfer from destroying a result before its click is delivered. */
export function useSearchResultInteraction(dismiss: () => void) {
  const root = useRef<HTMLDivElement>(null)
  const gesture = useRef<{
    target: HTMLButtonElement
    x: number
    y: number
    cancelled: boolean
    deferredBlur: boolean
    pointerInitiated: boolean
  } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const dismissRef = useRef(dismiss)
  dismissRef.current = dismiss
  const clear = useCallback(() => {
    clearTimeout(timer.current)
    gesture.current = null
  }, [])
  const result = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLButtonElement>('button[data-search-result]')
      : null
  const begin = (event: MouseEvent<HTMLDivElement> | PointerEvent<HTMLDivElement>) => {
    const target = result(event.target)
    if (!target) {
      clear()
      return
    }
    clearTimeout(timer.current)
    gesture.current = {
      target,
      x: event.clientX,
      y: event.clientY,
      cancelled:
        event.button !== 0 || event.ctrlKey || ('isPrimary' in event && event.isPrimary === false),
      deferredBlur: false,
      pointerInitiated: event.type === 'pointerdown',
    }
  }
  useEffect(() => {
    const outside = (event: globalThis.MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        clear()
        dismissRef.current()
      }
    }
    const move = (event: globalThis.MouseEvent) => {
      const value = gesture.current
      if (value && Math.hypot(event.clientX - value.x, event.clientY - value.y) > 8)
        value.cancelled = true
    }
    const cancel = () => {
      const value = gesture.current
      if (value) {
        value.cancelled = true
        if (value.deferredBlur) dismissRef.current()
      }
    }
    const end = (event: globalThis.MouseEvent) => {
      const value = gesture.current
      if (!value) return
      if (!value.target.contains(event.target as Node)) value.cancelled = true
      // Native click follows pointerup/mouseup. Never select on pointerdown/up.
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        if (gesture.current !== value) return
        if (value.deferredBlur && !root.current?.contains(document.activeElement))
          dismissRef.current()
        if (!value.cancelled) gesture.current = null
      }, 400) // Allow delayed compatibility clicks after a touch/pen release.
    }
    document.addEventListener('mousedown', outside, true)
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('mousemove', move, true)
    document.addEventListener('pointermove', move, true)
    document.addEventListener('mouseup', end, true)
    document.addEventListener('pointerup', end, true)
    document.addEventListener('pointercancel', cancel, true)
    document.addEventListener('scroll', cancel, true)
    document.addEventListener('wheel', cancel, { capture: true, passive: true })
    return () => {
      clear()
      document.removeEventListener('mousedown', outside, true)
      document.removeEventListener('pointerdown', outside, true)
      document.removeEventListener('mousemove', move, true)
      document.removeEventListener('pointermove', move, true)
      document.removeEventListener('mouseup', end, true)
      document.removeEventListener('pointerup', end, true)
      document.removeEventListener('pointercancel', cancel, true)
      document.removeEventListener('scroll', cancel, true)
      document.removeEventListener('wheel', cancel, true)
    }
  }, [clear])
  return {
    root,
    onPointerDownCapture: begin,
    onMouseDownCapture: (event: MouseEvent<HTMLDivElement>) => {
      // A primary mouse press should keep the query focused on WebKit too.
      // Compatibility mouse events belong to the same pointer gesture, including cancellation.
      if (!gesture.current?.pointerInitiated) begin(event)
      if (result(event.target) && event.button === 0) event.preventDefault()
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
      const value = gesture.current
      if (value && !value.cancelled) {
        value.deferredBlur = true
        return
      }
      dismissRef.current()
    },
    onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
      if (!result(event.target)) return
      if (event.button !== 0 || event.ctrlKey || (event.detail > 0 && gesture.current?.cancelled)) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      clear()
    },
    onKeyDownCapture: () => clear(),
  }
}
