// @vitest-environment jsdom
import { useRef } from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSubmittedChatRequest } from './useSubmittedChatRequest'

const RequestHarness = ({ busy, send, onAccepted }: {
  busy: boolean
  send: (text: string) => Promise<void>
  onAccepted: (id: number) => void
}) => {
  const sendRef = useRef(send)
  sendRef.current = send
  useSubmittedChatRequest({
    submitRequest: { id: 7, text: 'What did I miss?' },
    active: true,
    busy,
    ready: true,
    sendRef,
    onAccepted,
  })
  return null
}

afterEach(cleanup)

describe('submitted chat requests', () => {
  it('accepts a pending What did I miss request when the current hidden turn finishes', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const onAccepted = vi.fn()
    const view = render(<RequestHarness busy send={send} onAccepted={onAccepted} />)
    expect(send).not.toHaveBeenCalled()

    view.rerender(<RequestHarness busy={false} send={send} onAccepted={onAccepted} />)

    await waitFor(() => expect(send).toHaveBeenCalledWith('What did I miss?'))
    expect(onAccepted).toHaveBeenCalledWith(7)
  })
})
