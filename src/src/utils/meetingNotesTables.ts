import type { Element as HastElement, Properties, Root, RootContent, Text } from 'hast'
import type { Plugin } from 'unified'

// The editor stores complex tables as HTML (merged cells, lists, paragraphs).
// Convert only complete table blocks; rehype-sanitize still runs afterwards.
export const rehypeMeetingTables: Plugin<[], Root> = () => tree => {
  const walk = (parent: Root | HastElement) => {
    const children = parent.children as (RootContent | { type: 'raw'; value: string })[]
    for (let index = children.length - 1; index >= 0; index--) {
      const node = children[index]
      if (
        node.type === 'raw' &&
        /^\s*<table[\s>]/i.test(node.value) &&
        typeof DOMParser !== 'undefined'
      ) {
        const document = new DOMParser().parseFromString(node.value, 'text/html')
        const convert = (node: Node): HastElement | Text | null => {
          if (node.nodeType === 3) return { type: 'text', value: node.textContent || '' }
          if (node.nodeType !== 1) return null
          const element = node as Element
          const properties: Properties = {}
          // Table task checkboxes are display-only. Preserve their checked state,
          // but never carry arbitrary input types, values, names or handlers.
          if (element.tagName === 'INPUT') {
            if (element.getAttribute('type')?.toLowerCase() !== 'checkbox') return null
            properties.type = 'checkbox'
            properties.disabled = true
            properties.checked = element.hasAttribute('checked')
          }
          for (const [attr, property] of [
            ['colspan', 'colSpan'],
            ['rowspan', 'rowSpan'],
            ['href', 'href'],
          ]) {
            const value = element.getAttribute(attr)
            if (value)
              properties[property] =
                attr === 'href' ? value : Math.min(100, Math.max(1, Number(value) || 1))
          }
          return {
            type: 'element',
            tagName: element.tagName.toLowerCase(),
            properties,
            children: Array.from(element.childNodes)
              .map(convert)
              .filter((child): child is HastElement | Text => child !== null),
          }
        }
        children.splice(
          index,
          1,
          ...Array.from(document.body.childNodes)
            .map(convert)
            .filter((child): child is HastElement | Text => child !== null),
        )
        continue
      }
      if (node.type === 'element') walk(node)
    }
  }
  walk(tree)
}

/** Plain cell values are kept out of the Markdown parser: literal marks and
 * URLs must survive copying an edited (HTML-backed) table. */
const slackCellText = (node: Node): string => {
  if (node.nodeType === 3) return node.textContent || ''
  if (node.nodeType !== 1) return ''
  const element = node as Element
  if (['SCRIPT', 'STYLE', 'TEMPLATE'].includes(element.tagName)) return ''
  if (element.tagName === 'INPUT' && element.getAttribute('type') === 'checkbox') {
    return element.hasAttribute('checked') ? '☑ ' : '☐ '
  }
  if (element.tagName === 'IMG') return element.getAttribute('alt') || ''
  if (element.tagName === 'BR') return ' '
  const text = Array.from(element.childNodes).map(slackCellText).join('')
  if (element.tagName === 'A') {
    const href = element.getAttribute('href') || ''
    return /^(https?:|mailto:)/i.test(href) && text.trim() !== href ? `${text} (${href})` : text
  }
  return /^(P|DIV|LI|UL|OL|BLOCKQUOTE|PRE|TABLE|TR)$/.test(element.tagName) ? text + ' ' : text
}

const slackHtmlTableRows = (html: string): string[][] | undefined => {
  const table = new DOMParser().parseFromString(html, 'text/html').querySelector('table')
  if (!table || !table.rows.length) return undefined
  const rows = Array.from(table.rows)
  const grid: string[][] = []
  rows.forEach((row, rowIndex) => {
    const current = grid[rowIndex] || (grid[rowIndex] = [])
    let column = 0
    Array.from(row.cells).forEach(cell => {
      while (current[column] !== undefined) column++
      const text = slackCellText(cell).replace(/\s+/g, ' ').trim()
      const height = Math.min(cell.rowSpan || rows.length - rowIndex, rows.length - rowIndex)
      for (let y = 0; y < height; y++) {
        const target = grid[rowIndex + y] || (grid[rowIndex + y] = [])
        for (let x = 0; x < cell.colSpan; x++) target[column + x] = text
      }
      column += cell.colSpan
    })
  })
  const width = Math.max(...grid.map(row => row.length))
  const normalized = grid.map(row => Array.from({ length: width }, (_, i) => row[i] || ''))
  if (!Array.from(rows[0].cells).every(cell => cell.tagName === 'TH')) {
    normalized.unshift(Array.from({ length: width }, (_, i) => `Column ${i + 1}`))
  }
  return normalized
}

/** Replace complete HTML tables with opaque line tokens, preserving code fences.
 * Consumers render each token's cell matrix directly instead of re-parsing it
 * as Markdown. The renderer/sanitizer above is intentionally independent. */
export function extractSlackHtmlTables(markdown: string): {
  source: string
  tables: Map<string, string[][]>
} {
  const tables = new Map<string, string[][]>()
  if (typeof DOMParser === 'undefined') return { source: markdown, tables }
  const fenced: [number, number][] = []
  let offset = 0
  let opening: { start: number; marker: string } | undefined
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/)
    if (marker) {
      if (!opening) opening = { start: offset, marker: marker[1] }
      else if (
        marker[1][0] === opening.marker[0] &&
        marker[1].length >= opening.marker.length &&
        !marker[2].trim()
      ) {
        fenced.push([opening.start, offset + line.length])
        opening = undefined
      }
    }
    offset += line.length + 1
  }
  if (opening) fenced.push([opening.start, markdown.length])
  let prefix = 'KNAPSACK_HTML_TABLE_'
  while (markdown.includes(prefix)) prefix += '_'
  const tags = /<\/?table\b[^>]*>/gi
  let start = -1,
    depth = 0,
    copied = 0,
    source = ''
  for (const match of markdown.matchAll(tags)) {
    const index = match.index || 0
    if (fenced.some(([from, to]) => index >= from && index <= to)) continue
    const closing = /^<\//.test(match[0])
    if (!closing) {
      if (depth++ === 0) start = index
    } else if (depth && --depth === 0) {
      const end = index + match[0].length
      const rows = slackHtmlTableRows(markdown.slice(start, end))
      if (rows) {
        const token = `${prefix}${tables.size}`
        tables.set(token, rows)
        source += markdown.slice(copied, start) + '\n\n' + token + '\n\n'
        copied = end
      }
    }
  }
  return { source: source + markdown.slice(copied), tables }
}
