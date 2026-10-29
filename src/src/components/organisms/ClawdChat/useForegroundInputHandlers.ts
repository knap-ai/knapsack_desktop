import { listen as tauriListen } from '@tauri-apps/api/event'
import { useEffect, useRef } from 'react'

type CurrentRef<T> = { current: T }

export const useVoiceDialogFocusTrap = ({
  active,
  dialogRef,
  onClose,
}: {
  active: boolean
  dialogRef: CurrentRef<HTMLElement | null>
  onClose: () => void
}) => {
  useEffect(() => {
    if (!active) return
    const frame = requestAnimationFrame(() => {
      const dialog = dialogRef.current
      const primary = dialog?.querySelector<HTMLElement>('[data-voice-primary]:not(:disabled)')
      const firstEnabled = dialog?.querySelector<HTMLElement>('button:not(:disabled), [tabindex]:not([tabindex="-1"])')
      ;(primary || firstEnabled)?.focus()
    })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex]:not([tabindex="-1"])'),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active, dialogRef, onClose])
}

export const useForegroundNativeFileDropEvents = ({
  active,
  onDrop,
  onHover,
  onCancel,
}: {
  active: boolean
  onDrop: (paths: string[]) => void | Promise<void>
  onHover: () => void
  onCancel: () => void
}) => {
  const onDropRef = useRef(onDrop)
  const onHoverRef = useRef(onHover)
  const onCancelRef = useRef(onCancel)
  onDropRef.current = onDrop
  onHoverRef.current = onHover
  onCancelRef.current = onCancel

  useEffect(() => {
    if (!active) return
    let cancelled = false
    const cleanups: Array<() => void> = []
    const registerCleanup = (unlisten: () => void) => {
      if (cancelled) unlisten()
      else cleanups.push(unlisten)
    }

    ;(async () => {
      registerCleanup(await tauriListen<string[]>('tauri://file-drop', event => {
        if (!cancelled) void onDropRef.current(event.payload)
      }))
      registerCleanup(await tauriListen<string[]>('tauri://file-drop-hover', () => {
        if (!cancelled) onHoverRef.current()
      }))
      registerCleanup(await tauriListen('tauri://file-drop-cancelled', () => {
        if (!cancelled) onCancelRef.current()
      }))
    })()

    return () => {
      cancelled = true
      cleanups.forEach(cleanup => cleanup())
    }
  }, [active])
}
