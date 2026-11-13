// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { IFeed } from 'src/hooks/feed/useFeed'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import EmailNotificationDrawer from './index'

const f = vi.hoisted(() => ({
  enabled: false,
  save: vi.fn(),
  listener: undefined as undefined | (() => void),
}))
vi.mock('src/hooks/useEmailPopupPreference', () => ({
  useEmailPopupPreference: () => ({ enabled: f.enabled, setEnabled: f.save }),
}))
vi.mock('@tauri-apps/api/event', () => ({
  listen: async (_name: string, handler: () => void) => {
    f.listener = handler
    return () => undefined
  },
}))
vi.mock('src/hooks/dataSources/useEmailAutopilot', () => ({
  EmailImportance: { IMPORTANT: 'IMPORTANT_NEEDS_RESPONSE' },
  AutopilotActions: { MARK_AS_READ: 'MARK_AS_READ', SEND_REPLY: 'SEND_REPLY' },
}))
vi.mock('src/utils/KNAnalytics', () => ({ default: { trackEvent: vi.fn() } }))
vi.mock('src/components/molecules/EmailDraftCard', () => ({
  default: () => <p>Draft view</p>,
}))
vi.mock('src/components/molecules/EmailAutopilotSettings', () => ({
  default: () => <p>Settings view</p>,
}))
vi.mock('src/components/molecules/TakeActionButton', () => ({
  default: ({ label = 'Take Action' }: { label?: string }) => <button>{label}</button>,
}))
const email = {
  message: {
    emailUid: 'synthetic',
    accountEmail: 'a@example.invalid',
    sender: 'Example',
    subject: 'Synthetic email',
    body: 'Synthetic body',
  },
  classification: {
    classification: 'IMPORTANT_NEEDS_RESPONSE',
    summary: ['Summary'],
    actionRequired: 'A long suggested next step that belongs in the body',
  },
}
const feed = {
  classifiedEmails: { IMPORTANT_NEEDS_RESPONSE: [email] },
  emailAutopilotStatus: { status: 'complete' },
  classificationActions: {},
  updateClassificationActions: vi.fn(),
  takeEmailAction: vi.fn(),
} as unknown as IFeed
function Fixture({ busy = false, forceOpen = false }: { busy?: boolean; forceOpen?: boolean }) {
  return (
    <EmailNotificationDrawer
      feed={feed}
      userEmail="a@example.invalid"
      userName="Synthetic"
      onGoToEmail={() => undefined}
      isChatBusy={busy}
      forceOpen={forceOpen}
    />
  )
}
beforeEach(() => {
  vi.useFakeTimers()
  f.enabled = false
  f.save.mockReset()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('does not automatically open without positive consent, even during sustained inference', () => {
  const { rerender } = render(<Fixture />)
  rerender(<Fixture busy />)
  act(() => vi.advanceTimersByTime(6000))
  expect(screen.queryByText('Email Autopilot')).toBeNull()
})
it('permits a one-session manual open without saving consent and clears it on profile switch', () => {
  render(<Fixture forceOpen />)
  expect(screen.getByText('Draft view')).toBeTruthy()
  expect(f.save).not.toHaveBeenCalled()
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  expect(screen.queryByText('Draft view')).toBeNull()
})
it('resizes the collapsed popup with keyboard and mouse and keeps the recommendation out of the action label', () => {
  f.enabled = true
  const { rerender } = render(<Fixture />)
  rerender(<Fixture busy />)
  act(() => vi.advanceTimersByTime(6000))
  const handle = screen.getByRole('button', { name: 'Resize Email Autopilot' })
  const panel = handle.parentElement?.parentElement
  if (!panel) throw new Error('Expected popup panel')
  const before = parseFloat(panel.style.height)
  fireEvent.keyDown(handle, { key: 'ArrowUp' })
  expect(parseFloat(panel.style.height)).toBeGreaterThan(before)
  fireEvent.mouseDown(handle, { clientX: 10, clientY: 200 })
  fireEvent.mouseMove(document, { clientX: 10, clientY: 100 })
  fireEvent.mouseUp(document)
  expect(parseFloat(panel.style.height)).toBeGreaterThan(before + 32)
  expect(screen.getByRole('button', { name: 'Take Action' })).toBeTruthy()
  expect(screen.getByText(/A long suggested next step/).closest('button')).toBeNull()
})
it('cancels a scheduled automatic popup when consent is withdrawn', () => {
  f.enabled = true
  const { rerender } = render(<Fixture />)
  rerender(<Fixture busy />)
  act(() => vi.advanceTimersByTime(1000))
  f.enabled = false
  rerender(<Fixture busy />)
  act(() => vi.advanceTimersByTime(6000))
  expect(screen.queryByText('Email Autopilot')).toBeNull()
})

it('does not reopen from an old account timer even when the next account is also opted in', () => {
  f.enabled = true
  const { rerender } = render(<Fixture />)
  rerender(<Fixture busy />)
  act(() => vi.advanceTimersByTime(1000))
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  act(() => vi.advanceTimersByTime(10000))
  expect(screen.queryByText('Email Autopilot')).toBeNull()
})
