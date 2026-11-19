export default function NotesGenerationRetry({
  onRetry,
  error,
}: {
  onRetry: () => void
  error?: Error | null
}) {
  // Only render known local guidance, never a raw provider response or note text.
  const needsAccount =
    error?.message === 'Sign in to this account before generating meeting notes.' ||
    error?.message === 'Account changed before note generation was admitted.'

  return (
    <section role="alert" className="notetaker-note__retry">
      <div className="notetaker-note__retry-message">
        <strong>
          {needsAccount ? 'Meeting account needs attention' : 'Note generation didn’t finish'}
        </strong>
        <span>
          {needsAccount
            ? 'The account identity for saved notes is unavailable. Studio may still be connected. Your transcript and notes are unchanged.'
            : 'Try generating notes again from this saved meeting.'}
        </span>
      </div>
      <button type="button" className="notetaker-note__retry-button" onClick={onRetry}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M20 7v5h-5" />
          <path d="M19.1 12a7.2 7.2 0 1 0-1.8 4.8M20 12l-2.7-3" />
        </svg>
        Retry notes
      </button>
    </section>
  )
}

/** Recovery is offered from saved evidence, even without an in-memory error. */
export function MissingMeetingNotesRecovery({transcriptAvailable,onRetry}:{transcriptAvailable:boolean;onRetry:()=>void}) {
  return <section className="notetaker-note__retry" aria-label="Meeting notes recovery">
    <div className="notetaker-note__retry-message"><strong>Meeting notes are not saved yet</strong><span>{transcriptAvailable ? 'Your saved transcript is available. Retry notes when you are ready.' : 'No saved transcript is available yet. Your recording is preserved.'}</span></div>
    {transcriptAvailable && <button type="button" className="notetaker-note__retry-button" onClick={onRetry}>Retry notes</button>}
  </section>
}
