import { useEffect, useRef } from 'react'

type CurrentRef<T> = { current: T }

interface SubmittedChatRequestOptions {
  submitRequest?: { id: number; text: string }
  active: boolean
  busy: boolean
  ready: boolean
  sendRef: CurrentRef<((text: string) => void | Promise<void>) | null>
  onAccepted?: (id: number) => void
}

export const useSubmittedChatRequest = ({
  submitRequest,
  active,
  busy,
  ready,
  sendRef,
  onAccepted,
}: SubmittedChatRequestOptions) => {
  const submittedRequest = useRef<number | null>(null)
  useEffect(() => {
    if (!submitRequest || submittedRequest.current === submitRequest.id || !active || busy || !ready) return
    if (!sendRef.current) return
    submittedRequest.current = submitRequest.id
    onAccepted?.(submitRequest.id)
    void sendRef.current(submitRequest.text)
  }, [submitRequest, active, busy, ready, sendRef, onAccepted])
}
