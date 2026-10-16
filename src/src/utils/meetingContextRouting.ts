/**
 * OpenClaw owns its own tool catalog and cannot call the desktop's in-process
 * meeting-note tools. Route meeting-history questions through direct chat,
 * whose tool loop has authoritative access to the local transcript DB and
 * ~/.knapsack/notes files.
 */
export function shouldUseDirectMeetingContext(userText: string): boolean {
  const text = userText.trim().toLowerCase()
  if (!text) return false
  if (/\b(our|the)\s+(chat|call|conversation|discussion)\s+with\b/.test(text)) return true
  if (/\bwhat\s+(?:did|was)\s+we\s+(?:discuss|decide|agree|cover)\b/.test(text)) return true

  const hasDatedConversation =
    /\b(chat|call|conversation|discussion|meeting)\b/.test(text) &&
    /\b(?:on\s+)?\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?\b/.test(text)
  if (hasDatedConversation) return true

  const hasRetrievalIntent = /\b(find|show|open|search|summari[sz]e|recap|tell|what|where|review|read)\b/.test(text)
  const hasHistoricalCue = /\b(last|previous|earlier|past|yesterday|today|with|from|about|notes?|transcript|said|discussed|decided)\b/.test(text)
  if (/\b(meeting notes?|transcript)\b/.test(text) && (hasRetrievalIntent || hasHistoricalCue)) return true
  if (/\brecording\b/.test(text) && hasRetrievalIntent &&
      /\b(said|discussed|summary|summari[sz]e|recap|transcript|notes?|from|of)\b/.test(text)) return true
  return /\bmeeting\b/.test(text) && hasRetrievalIntent && hasHistoricalCue
}
