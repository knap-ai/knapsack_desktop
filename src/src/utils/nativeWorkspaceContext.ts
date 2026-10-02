// Keep suggested team prompts on the same authenticated data path as Scout.
export function shouldPrefetchNativeEmailCalendarContext(text: string): boolean {
  if (/\b(browser|website|web\s+ui|tab)\b|\b(click|navigate)\b/i.test(text)) return false
  return /\b(emails?|gmail|inbox|newsletters?|notifications?|calendar|schedule|meetings?|commitments?|priorities|relationships?|opportunities|follow[ -]?ups?|follow up|work patterns|reactive)\b/i.test(text)
    || /\b(prepare|prep|plan|brief|ready)\b.*\b(today|tomorrow|week|weekend)\b/i.test(text)
    || /\bwhat(?:'s| is|s)? (?:going on|happening|on)\b.*\b(today|tomorrow|week)\b/i.test(text)
}

export function nativeContextRequest(text: string, messages: readonly { role: string; text: string }[]): string {
  const continuation = /^(?:try again|retry|check (?:them|it)(?: now)?|can(?:'?t)? you check (?:them|it)(?: now)?)\??[.!]?$/i
  if (!continuation.test(text.trim())) return text
  return [...messages].reverse().find(message => message.role === 'user'
    && !continuation.test(message.text.trim()))?.text || text
}

export function nativeCalendarRange(text: string, now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  let label = "Today's Calendar"
  if (/\b(next|this) week\b/i.test(text)) {
    // Calendar weeks start Monday. Use local date arithmetic across DST.
    start.setDate(start.getDate() - (start.getDay() + 6) % 7
      + (/\bnext week\b/i.test(text) ? 7 : 0))
    end.setTime(start.getTime())
    end.setDate(end.getDate() + 7)
    label = /\bnext week\b/i.test(text) ? "Next Week's Calendar" : "This Week's Calendar"
  } else {
    if (/\btomorrow\b/i.test(text)) {
      start.setDate(start.getDate() + 1)
      label = "Tomorrow's Calendar"
    }
    end.setTime(start.getTime())
    end.setDate(end.getDate() + 1)
  }
  return { start, end, label }
}

export const CONNECTED_DATA_GUIDANCE = `Use the supplied native email/calendar context and connected Studio APIs before browser automation. For additional data, discover the relevant connector's exact tools with list_connector_tools and call them with call_connector_tool. This applies to every teammate, including newsletter summaries, relationship analysis, and follow-ups. A browser login is separate from API authorization. Do not infer disconnected accounts from a browser sign-in page or a failed raw localhost request. Do not ask the user for API tokens. Report the specific tool error if a query fails; use another connected read API when available. Use the browser for email/calendar only when explicitly requested or when the connected APIs do not support the requested operation. Supplied context is a bounded sample, not an exhaustive mailbox search; do not infer that missing messages or events do not exist.`
