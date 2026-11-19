import type { LoopCandidate } from 'src/api/loops'

export default function LoopCandidateCard({
  candidate,
  pending,
  onDismiss,
  onObserve,
}: {
  candidate: LoopCandidate
  pending: boolean
  onDismiss: () => void
  onObserve: () => void
}) {
  return (
    <article>
      <div>
        <span className="LoopSignal">
          {candidate.signalType === 'completed_recording'
            ? 'Completed recording'
            : `Inbound email · ${candidate.accountIdentity || 'account unknown'}`}
        </span>
        <h3>{candidate.title}</h3>
        <p>{candidate.reason}</p>
        {candidate.signalType.startsWith('inbound_email_') && candidate.context && (
          <details>
            <summary>Source email</summary>
            <pre className="LoopCandidateEvidence">{candidate.context}</pre>
          </details>
        )}
        <span className="LoopConfidence">
          {candidate.signalType.startsWith('inbound_email_')
            ? 'From saved email evidence'
            : `${Math.round(candidate.confidence * 100)}% confidence · signal: ${candidate.signalId}`}
        </span>
        {candidate.targetIdentity && (
          <span className="LoopConfidence">Target: {candidate.targetIdentity}</span>
        )}
      </div>
      <div className="LoopCandidateActions">
        <button onClick={onDismiss}>Dismiss</button>
        <button className="is-primary" disabled={pending} onClick={onObserve}>
          {pending
            ? 'Preparing…'
            : candidate.loopId === 'starter-inbox-observation'
              ? 'Observe'
              : 'Observe & prepare'}
        </button>
      </div>
    </article>
  )
}
