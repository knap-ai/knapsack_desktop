export default function NotesGenerationRetry({ onRetry }: { onRetry: () => void }) {
  return (
    <section role="alert" className="notetaker-note__retry">
      <div className="notetaker-note__retry-message">
        <strong>Note generation didn’t finish</strong>
        <span>Try generating notes again from this saved meeting.</span>
      </div>
      <button type="button" className="notetaker-note__retry-button" onClick={onRetry}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M20 7v5h-5" />
          <path d="M19.1 12a7.2 7.2 0 1 0-1.8 4.8M20 12l-2.7-3" />
        </svg>
        Retry notes
      </button>
    </section>
  )
}
