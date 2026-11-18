import { readNativeMeeting, type MeetingReadOwner } from 'src/utils/nativeMeetingRead'

export interface NotesSnapshot {
  success: boolean
  data?: {
    notes: string | null
    exists: boolean
    thread_id: number
    revision: string
    recording: { recorded: boolean; transcriptAvailable: boolean } | null
  }
}
export const getSavedMeetingNotes = (threadId: number, owner: MeetingReadOwner) =>
  readNativeMeeting<NotesSnapshot>('read_saved_meeting_notes', threadId, owner, 'notes')
