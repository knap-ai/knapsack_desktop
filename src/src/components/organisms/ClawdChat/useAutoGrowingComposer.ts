import { useCallback, useLayoutEffect, type RefObject } from 'react'

/** Size the shared main/scoped composer without changing its value or selection. */
export function useAutoGrowingComposer(ref: RefObject<HTMLTextAreaElement>) {
  const resize = useCallback(() => {
    const element = ref.current
    if (!element) return
    const viewportHeight = window.visualViewport?.height || window.innerHeight
    // Reserve the other half of a small window for conversation and controls.
    const cap = Math.max(36, Math.floor(viewportHeight / 2))
    const border = element.offsetHeight - element.clientHeight
    element.style.maxHeight = `${cap}px`
    element.style.height = 'auto'
    const contentHeight = element.scrollHeight + Math.max(0, border)
    element.style.height = `${Math.min(cap, Math.max(36, contentHeight))}px`
    element.style.overflowY = contentHeight > cap ? 'auto' : 'hidden'
  }, [ref])

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    resize()
    // Native input covers paste, dictation and IME as well as ordinary typing.
    element.addEventListener('input', resize)
    window.addEventListener('resize', resize)
    window.visualViewport?.addEventListener('resize', resize)
    let lastWidth = element.clientWidth
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            if (element.clientWidth !== lastWidth) {
              lastWidth = element.clientWidth
              resize()
            }
          })
    observer?.observe(element)
    return () => {
      element.removeEventListener('input', resize)
      window.removeEventListener('resize', resize)
      window.visualViewport?.removeEventListener('resize', resize)
      observer?.disconnect()
    }
  }, [ref, resize])

  return resize
}
