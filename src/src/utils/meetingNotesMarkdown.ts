/**
 * Repairs common streaming/model Markdown glitches without changing the
 * substance of the meeting notes. This keeps display and edit mode aligned.
 */
export const normalizeMeetingNotesMarkdown = (markdown: string): string => {
  if (!markdown) return ''

  return markdown
    .replace(/\r\n?/g, '\n')
    // Models occasionally stream a bold section label with the closing marks
    // on the following line: "**Decisions\n**".
    .replace(/^\s*\*\*([^*\n]{2,100})\n\*\*\s*$/gm, '## $1')
    // A standalone bold label is a section heading in our notes templates.
    .replace(/^\s*\*\*([^*\n]{2,100})\*\*\s*$/gm, '## $1')
    // Normalize typographic bullets so Markdown renderers preserve nesting.
    .replace(/^(\s*)[•‣]\s+/gm, '$1- ')
    // Ensure headings are separated from the content on both sides.
    .replace(/([^\n])\n(#{1,6}\s+)/g, '$1\n\n$2')
    .replace(/^(#{1,6}\s+[^\n]+)\n(?!\n)/gm, '$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
