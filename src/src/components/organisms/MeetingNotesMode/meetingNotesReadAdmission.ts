type ReadState = {
  aborted: boolean
  sameMeeting: boolean
  sameProfile: boolean
  sameEdit: boolean
  currentHydration: boolean
  forSynthesis: boolean
}

export function classifyMeetingNotesRead(s: ReadState) {
  if (s.aborted || !s.sameMeeting || !s.sameProfile || !s.sameEdit)
    return s.forSynthesis ? 'reject-synthesis' : 'ignore'
  if (s.forSynthesis) return 'read-for-synthesis'
  return s.currentHydration ? 'hydrate' : 'ignore'
}

type SavedSnapshot = {
  threadId: number
  accountEmail: string
  profileRevision: number
  transcriptAvailable: boolean
  notesExist: boolean
}

export function hasVerifiedMissingMeetingNotes(
  s: SavedSnapshot | null,
  threadId: number,
  accountEmail: string,
  profileRevision: number,
): boolean {
  return !!s && !!accountEmail && s.threadId === threadId
    && s.accountEmail.toLowerCase() === accountEmail.toLowerCase()
    && s.profileRevision === profileRevision
    && s.transcriptAvailable === true && s.notesExist === false
}
