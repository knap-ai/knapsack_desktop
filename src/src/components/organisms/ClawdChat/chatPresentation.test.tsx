// @vitest-environment jsdom
import { useRef, useState } from 'react'

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { scheduleChatFollow, visibleScopedMessages } from './chatPresentation'
import { useAssistantControls } from './useAssistantControls'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
it('retains genuine history and standalone onboarding without changing stored rows', () => {
  const rows = ['welcome-1', 'example-1', 'user-1', 'assistant-1'].map(id => ({ msg: { id } }))
  expect(visibleScopedMessages(rows, false)).toBe(rows)
  expect(visibleScopedMessages(rows, true).map(row => row.msg.id)).toEqual([
    'user-1',
    'assistant-1',
  ])
  expect(rows).toHaveLength(4)
})
it('follows streamed content but rechecks scrollback before paint', () => {
  let callback!: FrameRequestCallback
  vi.stubGlobal('requestAnimationFrame', (next: FrameRequestCallback) => {
    callback = next
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  const element = document.createElement('div')
  document.body.append(element)
  Object.defineProperty(element, 'scrollHeight', { value: 1000 })
  let follow = true
  scheduleChatFollow(element, () => follow)
  follow = false
  callback(0)
  expect(element.scrollTop).toBe(0)
  scheduleChatFollow(element, () => follow)
  follow = true
  callback(0)
  expect(element.scrollTop).toBe(1000)
  element.remove()
})
it('cancels obsolete frames and does not scroll a removed conversation', () => {
  let callback!: FrameRequestCallback
  const cancel = vi.fn()
  vi.stubGlobal('requestAnimationFrame', (next: FrameRequestCallback) => {
    callback = next
    return 7
  })
  vi.stubGlobal('cancelAnimationFrame', cancel)
  const element = document.createElement('div')
  Object.defineProperty(element, 'scrollHeight', { value: 1000 })
  scheduleChatFollow(element, () => true)()
  expect(cancel).toHaveBeenCalledWith(7)
  callback(0)
  expect(element.scrollTop).toBe(0)
})
function Disclosure() {
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null)
  useAssistantControls(open, panel, trigger, () => setOpen(false))
  return (
    <>
      <button ref={trigger} aria-expanded={open} onClick={() => setOpen(value => !value)}>
        Options
      </button>
      {open && (
        <div ref={panel}>
          <button disabled>Unavailable</button>
          <button>Enabled</button>
          <button>Clear</button>
        </div>
      )}
      <button>Outside</button>
    </>
  )
}
it('focuses a usable control and Escape returns to trigger over repeated opens', () => {
  render(<Disclosure />)
  for (let i = 0; i < 2; i++) {
    fireEvent.click(screen.getByText('Options'))
    expect(document.activeElement).toBe(screen.getByText('Enabled'))
    fireEvent.keyDown(screen.getByText('Enabled'), { key: 'Escape' })
    expect(screen.queryByText('Clear')).toBeNull()
    expect(document.activeElement).toBe(screen.getByText('Options'))
  }
})
it('dismisses on focus leaving or outside press, preserving inner pointer use', () => {
  render(<Disclosure />)
  fireEvent.click(screen.getByText('Options'))
  fireEvent.mouseDown(screen.getByText('Clear'))
  expect(screen.getByText('Clear')).toBeTruthy()
  act(() => screen.getByText('Outside').focus())
  expect(screen.queryByText('Clear')).toBeNull()
  fireEvent.click(screen.getByText('Options'))
  fireEvent.mouseDown(screen.getByText('Outside'))
  expect(screen.queryByText('Clear')).toBeNull()
})
