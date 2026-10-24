// @vitest-environment jsdom
import { useEffect, useReducer, useRef, useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  initialMeetingChatLifecycle,
  meetingChatLauncherLabel,
  meetingChatLifecycleReducer,
} from 'src/utils/meetingChatLifecycle'
import { handleHomeEscape } from 'src/components/templates/Home/homeEscape'

vi.mock('src/components/organisms/ClawdChat', () => ({
  default: ({ foregroundActive, onBusyChange }: { foregroundActive: boolean; onBusyChange: (busy: boolean) => void }) => {
    const [result, setResult] = useState('No result yet')
    return <div data-testid="mounted-clawd-chat" data-foreground-active={String(foregroundActive)}>
      <span>{result}</span>
      <button onClick={() => onBusyChange(true)}>Ask delayed question</button>
      <button onClick={() => { setResult('Completed while minimized'); onBusyChange(false) }}>Complete question</button>
      <button onClick={() => { setResult('Cancelled while minimized'); onBusyChange(false) }}>Cancel question</button>
    </div>
  },
}))

import MeetingChatPanel from './MeetingChatPanel'

const noop = () => {}

const Harness = () => {
  const [lifecycle, dispatch] = useReducer(meetingChatLifecycleReducer, {
    ...initialMeetingChatLifecycle,
    mounted: true,
  })
  return <>
    <button onClick={() => dispatch({ type: 'minimize' })}>Repeat minimize</button>
    {lifecycle.mounted && <MeetingChatPanel
      height={460}
      minimized={lifecycle.minimized}
      resizing={false}
      onMinimize={() => dispatch({ type: 'minimize' })}
      onResizeClick={noop}
      onResizePointerDown={noop}
      onResizePointerMove={noop}
      onResizePointerUp={noop}
      onResizeKeyDown={noop}
      onBusyChange={busy => dispatch({ type: 'set-busy', busy })}
      chatProps={{} as never}
    />}
    {lifecycle.minimized && <button onClick={() => dispatch({ type: 'open' })}>{meetingChatLauncherLabel(lifecycle)}</button>}
  </>
}

const EscapeProtectedHarness = () => {
  const [selected, setSelected] = useState(true)
  const [lifecycle, dispatch] = useReducer(meetingChatLifecycleReducer, {
    ...initialMeetingChatLifecycle,
    mounted: true,
  })
  const minimizedRef = useRef(lifecycle.minimized)
  minimizedRef.current = lifecycle.minimized

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => handleHomeEscape(event, {
      // Home registers one stable window listener. Read the latest minimized
      // state through a ref so this test covers the same lifetime behavior.
      preserveMeetingSelection: minimizedRef.current,
      errorCallback: noop,
      stopLLMExecution: noop,
      unselectFeedItem: () => setSelected(false),
      showWelcome: noop,
    })
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!selected) return <span>Meeting selection cleared</span>
  return <>
    <MeetingChatPanel
      height={460}
      minimized={lifecycle.minimized}
      resizing={false}
      onMinimize={() => dispatch({ type: 'minimize' })}
      onResizeClick={noop}
      onResizePointerDown={noop}
      onResizePointerMove={noop}
      onResizePointerUp={noop}
      onResizeKeyDown={noop}
      onBusyChange={busy => dispatch({ type: 'set-busy', busy })}
      chatProps={{} as never}
    />
    {lifecycle.minimized && <button onClick={() => dispatch({ type: 'open' })}>{meetingChatLauncherLabel(lifecycle)}</button>}
  </>
}

afterEach(cleanup)

describe('mounted meeting chat behavior', () => {
  it('finishes a pending question while minimized and restores the same result', () => {
    render(<Harness />)
    const mountedChat = screen.getByTestId('mounted-clawd-chat')
    fireEvent.click(screen.getByText('Ask delayed question'))
    fireEvent.click(screen.getByRole('button', { name: 'Minimize meeting chat' }))
    expect(screen.getByRole('button', { name: 'Meeting chat is still working — reopen' })).toBeTruthy()
    expect(screen.getByTestId('mounted-clawd-chat')).toBe(mountedChat)
    expect(screen.getByTestId('mounted-clawd-chat').dataset.foregroundActive).toBe('false')

    fireEvent.click(screen.getByText('Complete question'))
    expect(screen.getByRole('button', { name: 'Meeting chat minimized — reopen' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Meeting chat minimized — reopen' }))
    expect(screen.getByText('Completed while minimized')).toBeTruthy()
    expect(screen.getByTestId('mounted-clawd-chat')).toBe(mountedChat)
    expect(screen.getByTestId('mounted-clawd-chat').dataset.foregroundActive).toBe('true')
  })

  it('preserves cancellation and tolerates repeated minimize actions', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText('Ask delayed question'))
    fireEvent.click(screen.getByRole('button', { name: 'Minimize meeting chat' }))
    fireEvent.click(screen.getByText('Repeat minimize'))
    fireEvent.click(screen.getByText('Cancel question'))
    expect(screen.getByRole('button', { name: 'Meeting chat minimized — reopen' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Meeting chat minimized — reopen' }))
    expect(screen.getByText('Cancelled while minimized')).toBeTruthy()
  })

  it('keeps the selected meeting mounted when Escape is pressed elsewhere while minimized', () => {
    render(<EscapeProtectedHarness />)
    const mountedChat = screen.getByTestId('mounted-clawd-chat')
    fireEvent.click(screen.getByText('Ask delayed question'))
    fireEvent.click(screen.getByRole('button', { name: 'Minimize meeting chat' }))

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByText('Meeting selection cleared')).toBeNull()
    expect(screen.getByTestId('mounted-clawd-chat')).toBe(mountedChat)
    fireEvent.click(screen.getByText('Complete question'))
    fireEvent.click(screen.getByRole('button', { name: 'Meeting chat minimized — reopen' }))
    expect(screen.getByText('Completed while minimized')).toBeTruthy()
  })

  it('keeps the existing Escape navigation behavior when no chat is minimized', () => {
    render(<EscapeProtectedHarness />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByText('Meeting selection cleared')).toBeTruthy()
  })
})
