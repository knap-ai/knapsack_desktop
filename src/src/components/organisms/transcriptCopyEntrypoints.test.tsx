// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSavedTranscript: vi.fn(),
  invoke: vi.fn().mockResolvedValue({ microphone: true, screen_recording: true, all_granted: true }),
}))

vi.mock('@tauri-apps/api/tauri', () => ({ invoke: mocks.invoke }))
vi.mock('src/api/transcripts', () => ({ getSavedTranscript: mocks.getSavedTranscript }))
vi.mock('src/api/threads', () => ({ ThreadType: { MEETING_NOTES: 'MEETING_NOTES' } }))
vi.mock('src/api/connections', () => ({
  getConnectedIdentityEmails: () => [],
  hasCalendarCapability: () => true,
  hasEmailCapability: () => false,
}))
vi.mock('src/utils/translate', () => ({
  detectLanguage: () => null,
  translateToEnglish: vi.fn(),
}))
vi.mock('src/components/organisms/MeetingNotesMode', () => ({ default: () => null }))
vi.mock('src/components/molecules/AudioPermissionChecker', () => ({ default: () => null }))
vi.mock('src/components/organisms/TemplatesView', () => ({ default: () => null }))
vi.mock('src/components/organisms/InsightsView', () => ({ default: () => null }))
vi.mock('src/components/molecules/MeetingTasks', () => ({ default: () => null }))
vi.mock('/assets/images/dataSources/gcal.svg', () => ({ default: '' }))

import MeetingsTabView from 'src/components/organisms/MeetingsTabView'
import TranscriptView from 'src/components/organisms/TranscriptView'

const transcript = 'Recorded October 23\n\n\nAlex: Hello from the meeting'

const setClipboard = (writeText: ReturnType<typeof vi.fn>) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
}

const renderShareMenu = (handleErrorContact = vi.fn()) => {
  const notesThread = { id: 42, threadType: 'MEETING_NOTES' }
  const selectedMeeting = {
    id: 7,
    threads: [notesThread],
    timestamp: new Date('2026-10-23T12:00:00Z'),
    getCalendarEvent: () => undefined,
    getTitle: () => 'Fixture meeting',
  }
  const feed = {
    currentFeedItem: () => selectedMeeting,
    unselectFeedItem: vi.fn(),
    setThread: vi.fn(),
    setIsRecording: vi.fn(),
  }
  render(<MeetingsTabView
    feed={feed as never}
    addToLLMQueue={vi.fn()}
    copyToClipboard={vi.fn()}
    handleErrorContact={handleErrorContact}
    recordingHandlers={{ isRecording: () => false } as never}
  />)
  fireEvent.click(screen.getByTitle('Share meeting notes'))
  return handleErrorContact
}

beforeEach(() => {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    },
  })
  localStorage.setItem('micPermissionGranted', 'true')
  localStorage.setItem('screenPermissionGranted', 'true')
  localStorage.setItem('permissionsDismissed', 'true')
  mocks.getSavedTranscript.mockReset().mockResolvedValue({ content: transcript })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('transcript copy entrypoints', () => {
  it('copies from the share menu and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard(writeText)
    renderShareMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Copy transcript' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Alex: Hello from the meeting'))
    expect(screen.getByRole('status').textContent).toBe('Transcript copied')
  })

  it('keeps the share menu available and announces clipboard failure', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'))
    const handleErrorContact = vi.fn()
    setClipboard(writeText)
    renderShareMenu(handleErrorContact)

    fireEvent.click(screen.getByRole('button', { name: 'Copy transcript' }))

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Copy failed'))
    expect(screen.getByRole('button', { name: 'Copy transcript' })).toBeTruthy()
    expect(handleErrorContact).toHaveBeenCalledWith('Clipboard denied')
  })

  it('copies from the transcript viewer icon and announces success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard(writeText)
    render(<TranscriptView threadId={42} onClose={vi.fn()} />)
    await screen.findByText('Hello from the meeting')

    fireEvent.click(screen.getByRole('button', { name: 'Copy transcript' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Alex: Hello from the meeting'))
    expect(screen.getByRole('status').textContent).toBe('Transcript copied')
  })

  it('announces viewer clipboard failure and permits a repeated click', async () => {
    const writeText = vi.fn()
      .mockRejectedValueOnce(new Error('Clipboard denied'))
      .mockResolvedValueOnce(undefined)
    setClipboard(writeText)
    render(<TranscriptView threadId={42} onClose={vi.fn()} />)
    await screen.findByText('Hello from the meeting')
    const copy = screen.getByRole('button', { name: 'Copy transcript' })

    fireEvent.click(copy)
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Could not copy transcript'))
    fireEvent.click(copy)
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Transcript copied'))
    expect(writeText).toHaveBeenCalledTimes(2)
  })
})
