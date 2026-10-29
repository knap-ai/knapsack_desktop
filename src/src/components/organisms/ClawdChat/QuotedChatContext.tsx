import type { ChatQuote } from 'src/utils/selectedChatContext'

export default function QuotedChatContext({ quote, onJump, onRemove }: {
  quote: ChatQuote; onJump?: (messageId: string) => void; onRemove: () => void
}) {
  return <div className="ClawdReplyPreview ClawdQuotedContext">
    <div className="ClawdReplyPreview__bar" />
    <div className="ClawdReplyPreview__content">
      <button type="button" onClick={() => onJump?.(quote.messageId)} title="Jump to source message">
        Quoted from message
      </button>
      <blockquote>{quote.text}</blockquote>
    </div>
    <button type="button" className="ClawdReplyPreview__cancel" onClick={onRemove} aria-label="Remove quoted context">×</button>
  </div>
}
