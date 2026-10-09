// @vitest-environment jsdom

import { useState } from 'react'

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IThread, ThreadType } from 'src/api/threads'
import { afterEach, describe, expect, it, vi } from 'vitest'

import MeetingChatAvailableButton, {
  findStoredMeetingChatThreadId,
} from './MeetingChatAvailableButton'
import { useMeetingChatRoute } from './meetingChatRoute'

afterEach(cleanup)

const thread = (id: number, threadType: ThreadType): IThread => ({
  id,
  threadType,
  date: new Date(0),
  hideFollowUp: false,
  messages: [],
})

describe('meeting chat sidebar routing', () => {
  it('selects the stored meeting-notes thread rather than another thread', () => {
    const threads = [
      thread(8, ThreadType.CHAT),
      thread(21, ThreadType.MEETING_NOTES),
      thread(34, ThreadType.MEETING_NOTES),
    ]

    expect(findStoredMeetingChatThreadId(threads, id => id === 34)).toBe(34)
    expect(findStoredMeetingChatThreadId(threads, () => false)).toBeUndefined()
  })

  it('opens the exact thread without also activating the notes row', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const onSelectMeeting = vi.fn()
    const onNotesSelect = vi.fn()

    render(
      <div onClick={onNotesSelect}>
        <MeetingChatAvailableButton
          feedKey="Today, Oct 8th"
          itemId={901}
          threadId={34}
          onSelectMeeting={onSelectMeeting}
          onOpen={onOpen}
        />
      </div>,
    )

    await user.click(screen.getByRole('button', { name: 'Meeting chat available' }))

    expect(onSelectMeeting).toHaveBeenCalledWith('Today, Oct 8th', 901)
    expect(onOpen).toHaveBeenCalledOnce()
    expect(onOpen).toHaveBeenCalledWith(34)
    expect(onNotesSelect).not.toHaveBeenCalled()
  })

  it('supports native keyboard activation', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()

    render(
      <MeetingChatAvailableButton
        feedKey="today"
        itemId={902}
        threadId={55}
        onSelectMeeting={vi.fn()}
        onOpen={onOpen}
      />,
    )
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Meeting chat available' }),
    )

    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(onOpen).toHaveBeenNthCalledWith(1, 55)
    expect(onOpen).toHaveBeenNthCalledWith(2, 55)
  })

  it('clears an open chat on ordinary meeting selection and opens a new thread explicitly', async () => {
    const user = userEvent.setup()

    function Harness() {
      const { meetingChatRequest, openMeetingChat, clearMeetingChat } = useMeetingChatRoute()
      const [selectedMeeting, setSelectedMeeting] = useState('none')

      return (
        <>
          <MeetingChatAvailableButton
            feedKey="today"
            itemId={903}
            threadId={34}
            onSelectMeeting={vi.fn()}
            onOpen={threadId => {
              setSelectedMeeting('meeting-a')
              openMeetingChat(threadId)
            }}
          />
          <button
            type="button"
            onClick={() => {
              setSelectedMeeting('meeting-b')
              clearMeetingChat()
            }}
          >
            Open meeting notes
          </button>
          <button type="button" onClick={() => openMeetingChat(77)}>
            Open other meeting chat
          </button>
          <output aria-label="selected meeting">{selectedMeeting}</output>
          {meetingChatRequest.threadId !== 0 && (
            <section aria-label={`Meeting chat ${meetingChatRequest.threadId}`}>
              Thread {meetingChatRequest.threadId}
            </section>
          )}
        </>
      )
    }

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Meeting chat available' }))
    expect(screen.getByRole('region', { name: 'Meeting chat 34' })).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Open meeting notes' }))
    expect(screen.getByLabelText('selected meeting').textContent).toBe('meeting-b')
    expect(screen.queryByRole('region', { name: /Meeting chat/ })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Open other meeting chat' }))
    expect(screen.getByRole('region', { name: 'Meeting chat 77' })).not.toBeNull()
    expect(screen.queryByRole('region', { name: 'Meeting chat 34' })).toBeNull()
  })
})
