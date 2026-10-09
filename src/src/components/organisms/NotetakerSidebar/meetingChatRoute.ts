import { useCallback, useState } from 'react'

export interface MeetingChatRequest {
  threadId: number
  nonce: number
}

export const nextMeetingChatRequest = (
  current: MeetingChatRequest,
  threadId: number,
): MeetingChatRequest => ({ threadId, nonce: current.nonce + 1 })

export const useMeetingChatRoute = () => {
  const [meetingChatRequest, setMeetingChatRequest] = useState<MeetingChatRequest>({
    threadId: 0,
    nonce: 0,
  })

  const openMeetingChat = useCallback((threadId: number) => {
    setMeetingChatRequest(current => nextMeetingChatRequest(current, threadId))
  }, [])

  const clearMeetingChat = useCallback(() => {
    setMeetingChatRequest(current => nextMeetingChatRequest(current, 0))
  }, [])

  return { meetingChatRequest, openMeetingChat, clearMeetingChat }
}
