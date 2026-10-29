// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Meeting } from 'src/hooks/dataSources/useCalendar'
const mocks = vi.hoisted(() => ({ open: vi.fn() }))
vi.mock('@tauri-apps/api/shell', () => ({ open: mocks.open }))
import { calendarMeetingLinkLabel, getEventUrl, verifiedCalendarVideoUrl } from './meetingUtils'
import { openCalendarMeetingLink, startCalendarRecordingAction } from './calendarMeetingLink'
import CalendarMeetingLink from 'src/components/molecules/CalendarMeetingLink'
const meeting = (id: string, url = 'https://meet.google.com/aaa-bbbb-ccc') => ({
  id, event_id: id, calendar_account_email: 'fictional@example.test', start: 1,
  meeting_platform: 'google_meet', google_meet_url: url,
}) as Meeting
beforeEach(() => { mocks.open.mockReset().mockResolvedValue(undefined) })
afterEach(cleanup)

it.each(['javascript:alert(1)', 'file:///tmp/call', 'data:text/html,call', 'zoommtg://join', 'http://example.test/call', 'https://user:pass@example.test/call', 'https://example.test/\ncall'])('rejects unsafe calendar URL %s', async url => {
  expect(verifiedCalendarVideoUrl(url)).toBeUndefined()
  expect(await openCalendarMeetingLink(meeting(url, url))).toBe(false)
  expect(mocks.open).not.toHaveBeenCalled()
})
it('preserves calendar Zoom and Teams choices instead of guessing a Meet URL', () => {
  expect(getEventUrl({ ...meeting('zoom'), meeting_platform: 'zoom', google_meet_url: '', zoom_url: 'https://zoom.us/j/00000000000' })).toBe('https://zoom.us/j/00000000000')
  expect(getEventUrl({ ...meeting('teams'), meeting_platform: 'teams', google_meet_url: '', teams_url: 'https://teams.microsoft.com/l/meetup-join/fictional' })).toBe('https://teams.microsoft.com/l/meetup-join/fictional')
})
it('only opens on explicit click and deduplicates pending and repeated auto-open actions', async () => {
  let complete!: () => void
  mocks.open.mockReturnValue(new Promise<void>(resolve => { complete = resolve }))
  const m = meeting('duplicate')
  render(<CalendarMeetingLink meeting={m} />)
  expect(mocks.open).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('link', { name: 'Open Google Meet link' }))
  const pending = openCalendarMeetingLink(m)
  await waitFor(() => expect(mocks.open).toHaveBeenCalledTimes(1))
  await act(async () => { complete(); await pending })
  await openCalendarMeetingLink(m)
  expect(mocks.open).toHaveBeenCalledTimes(1)
})
it('browser failure leaves a persistent clickable fallback and allows retry', async () => {
  mocks.open.mockRejectedValueOnce(Error('fictional opener failure'))
  render(<CalendarMeetingLink meeting={meeting('failure')} />)
  fireEvent.click(screen.getByRole('link'))
  await screen.findByText(/Could not open the call/)
  expect(screen.getByRole('link').getAttribute('href')).toBe('https://meet.google.com/aaa-bbbb-ccc')
  fireEvent.click(screen.getByRole('link'))
  await waitFor(() => expect(mocks.open).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(screen.queryByText(/Could not open the call/)).toBeNull())
})
it('an old event or URL completion cannot change the newly selected link or its error', async () => {
  let reject!: (error: Error) => void
  mocks.open.mockReturnValueOnce(new Promise<void>((_, no) => { reject = no }))
  const first = meeting('switch', 'https://meet.google.com/aaa-bbbb-ccc')
  const second = meeting('switch', 'https://teams.microsoft.com/l/meetup-join/fictional')
  const { rerender } = render(<CalendarMeetingLink meeting={first} />)
  fireEvent.click(screen.getByRole('link'))
  await waitFor(() => expect(mocks.open).toHaveBeenCalledWith(first.google_meet_url))
  rerender(<CalendarMeetingLink meeting={second} />)
  await act(async () => { reject(Error('old failure')) })
  expect(screen.queryByText(/Could not open the call/)).toBeNull()
  expect(screen.getByRole('link').getAttribute('href')).toBe(second.google_meet_url)
  fireEvent.click(screen.getByRole('link'))
  await waitFor(() => expect(mocks.open).toHaveBeenLastCalledWith(second.google_meet_url))
})
it('shows a clear no-link state for a selected event without a video URL', () => {
  render(<CalendarMeetingLink meeting={meeting('missing', '')} />)
  expect(screen.queryByRole('link')).toBeNull()
  expect(screen.getByRole('status').textContent).toContain('No video call link')
})

it('continues recording when the browser opener fails, with an independent link error', async () => {
  mocks.open.mockRejectedValueOnce(Error('fictional browser failure'))
  const m = meeting('independent-record')
  const record = vi.fn().mockResolvedValue('recording started')
  render(<CalendarMeetingLink meeting={m} />)
  let result: string | undefined
  await act(async () => { result = await startCalendarRecordingAction(m, record) })
  expect(result).toBe('recording started')
  expect(record).toHaveBeenCalledTimes(1)
  await screen.findByText(/Could not open the call/)
})
it('opens the call even when recording fails, and preserves the recording error', async () => {
  const m = meeting('independent-browser')
  const record = vi.fn().mockRejectedValue(Error('fictional recording failure'))
  await expect(startCalendarRecordingAction(m, record)).rejects.toThrow('fictional recording failure')
  await waitFor(() => expect(mocks.open).toHaveBeenCalledWith(m.google_meet_url))
})
it('prefers the actual calendar conference entry point over a description-derived provider link', () => {
  expect(getEventUrl({ ...meeting('structured'), meeting_platform: 'zoom', zoom_url: 'https://zoom.us/j/00000000000' }))
    .toBe('https://meet.google.com/aaa-bbbb-ccc')
})

it.each([
  ['https://zoom.us/j/00000000000', 'Open Zoom link'],
  ['https://fictional.zoom.us/j/00000000000', 'Open Zoom link'],
  ['https://zoom.com/j/00000000000', 'Open Zoom link'],
  ['https://meet.google.com/aaa-bbbb-ccc', 'Open Google Meet link'],
  ['https://teams.microsoft.com/l/meetup-join/fictional', 'Open Teams link'],
  ['https://teams.live.com/meet/fictional', 'Open Teams link'],
  ['https://teams.cloud.microsoft/meet/fictional', 'Open Teams link'],
  ['https://calls.example.test/fictional', 'Open meeting link'],
  ['https://zoom.us.example.test/j/00000000000', 'Open meeting link'],
  ['https://example.test/meet.google.com', 'Open meeting link'],
])('labels the actual calendar URL %s as %s, ignoring event display/provider guesses', (url, label) => {
  const m = { ...meeting(`label-${url}`, url), title: 'Zoom or Teams?', meeting_platform: 'zoom', zoom_url: 'https://zoom.us/j/11111111111' }
  render(<CalendarMeetingLink meeting={m} />)
  const link = screen.getByRole('link', { name: label })
  expect(link.textContent?.trim()).toBe(label)
  expect(link.getAttribute('href')).toBe(url)
  expect(mocks.open).not.toHaveBeenCalled()
})
it.each(['javascript:alert(1)', 'https://zoom.us@example.test/call', 'not a URL', undefined])('invalid URLs get no provider claim or clickable link: %s', url => {
  expect(calendarMeetingLinkLabel(url)).toBe('Open meeting link')
  render(<CalendarMeetingLink meeting={meeting(`invalid-label-${url}`, url || '')} />)
  expect(screen.queryByRole('link')).toBeNull()
  expect(screen.getByRole('status').textContent).toContain('No video call link')
})
