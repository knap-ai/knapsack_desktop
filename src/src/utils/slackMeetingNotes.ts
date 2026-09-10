const stripInlineMarkdown = (value: string) =>
  value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .trim()

const tableCells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map(cell => stripInlineMarkdown(cell))

const isTableDivider = (line = '') => {
  const cells = tableCells(line)
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}

const renderSlackTable = (rows: string[][]) => {
  const columnCount = Math.max(...rows.map(row => row.length))
  const widths = Array.from({ length: columnCount }, (_, column) =>
    Math.max(...rows.map(row => (row[column] || '').length)),
  )
  const renderRow = (row: string[]) =>
    widths
      .map((width, column) => (row[column] || '').padEnd(width))
      .join('  |  ')
      .trimEnd()
  const divider = widths.map(width => '─'.repeat(Math.max(width, 3))).join('──┼──')
  return ['```', renderRow(rows[0]), divider, ...rows.slice(1).map(renderRow), '```']
}

const formatSlackLine = (line: string) =>
  line
    .replace(/^#{1,6}\s+(.+)$/, '*$1*')
    .replace(/^\s*[-*]\s+\[[ xX]\]\s+/, match => (/[xX]/.test(match) ? '☑ ' : '☐ '))
    .replace(/^\s*[-*]\s+/, '• ')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<$2|$1>')
    .replace(/\*\*([^*]+)\*\*/g, '*$1*')
    .replace(/__([^_]+)__/g, '*$1*')
    .replace(/^\s*(?:---+|___+|\*\*\*+)\s*$/, '──────────')

/**
 * Produce clipboard text that renders cleanly in Slack's message composer.
 * Slack has no native Markdown table syntax, so GFM tables become aligned,
 * monospace tables while headings, emphasis, tasks, links, and lists use
 * Slack's supported mrkdwn conventions.
 */
export const formatMeetingNotesForSlack = (markdown: string, title?: string) => {
  const sourceLines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const output: string[] = []

  if (title?.trim()) output.push(`*${stripInlineMarkdown(title)}*`, '')

  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index]
    if (line.includes('|') && isTableDivider(sourceLines[index + 1])) {
      const rows = [tableCells(line)]
      index += 2
      while (index < sourceLines.length && sourceLines[index].includes('|')) {
        rows.push(tableCells(sourceLines[index]))
        index += 1
      }
      index -= 1
      output.push(...renderSlackTable(rows))
      continue
    }
    output.push(formatSlackLine(line))
  }

  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
