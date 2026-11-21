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
            : 'Generate a preview from the saved transcript. Existing notes will not change.'}
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
        Preview notes
      </button>
    </section>
  )
}
