/** Local extractive preview. Never sends data or cuts a sentence mid-thought. */
export function notificationBrief(raw: string, maxCharacters = 220): string {
  const clean = raw
    .replace(/<\/(?:p|li|div)>|<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_`]/g, '')
  const items = clean
    .split(/\n+/)
    .map(line => line.replace(/^\s*(?:#{1,6}|[-•]|\d+[.)])\s*/, '').trim())
    .filter(
      line =>
        line &&
        !/^(?:join|dial|meeting id|passcode|password|attendees?|video|location|https?)(?:\s|:)/i.test(
          line,
        ),
    )
    .filter(
      line => !/^(?:summary|context|key points|prep|agenda|decisions|next steps):?$/i.test(line),
    )
  const sentences = items
    .flatMap(line => line.match(/[^.!?]+[.!?](?:\s|$)|[^.!?]+$/gu) || [])
    .map(value => value.trim())
    .filter(value => value.length >= 12)
    .map(value => (/[.!?]$/.test(value) ? value : value + '.'))
  const ranked = [
    ...sentences.slice(0, 1),
    ...sentences
      .slice(1)
      .filter(value =>
        /\b(decid|agree|confirm|review|prepare|ask|discuss|resolve|proposal|next|pending|open)\w*/i.test(
          value,
        ),
      ),
    ...sentences.slice(1),
  ]
  const selected: string[] = []
  for (const sentence of [...new Set(ranked)]) {
    if (selected.length === 2) break
    if ([...selected, sentence].join(' ').length <= maxCharacters) selected.push(sentence)
  }
  return selected.join(' ')
}
