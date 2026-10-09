import { IThread, ThreadType } from 'src/api/threads'

interface MeetingChatAvailableButtonProps {
  feedKey: string
  itemId: number
  threadId: number
  onSelectMeeting: (feedKey: string, itemId: number) => void
  onOpen: (threadId: number) => void
}

export const findStoredMeetingChatThreadId = (
  threads: IThread[] | undefined,
  hasStoredChat: (threadId: number) => boolean = threadId =>
    Boolean(localStorage.getItem(`moltbot_chat_history:meeting:${threadId}`)),
) =>
  threads?.find(
    thread => thread.threadType === ThreadType.MEETING_NOTES && hasStoredChat(thread.id),
  )?.id

export default function MeetingChatAvailableButton({
  feedKey,
  itemId,
  threadId,
  onSelectMeeting,
  onOpen,
}: MeetingChatAvailableButtonProps) {
  return (
    <button
      type="button"
      className="notetaker-sidebar__meeting-chat-tag notetaker-sidebar__meeting-chat-button"
      onClick={event => {
        event.stopPropagation()
        onSelectMeeting(feedKey, itemId)
        onOpen(threadId)
      }}
    >
      Meeting chat available
    </button>
  )
}
