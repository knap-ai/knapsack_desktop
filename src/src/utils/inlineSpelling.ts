import type { Element, ElementContent, Root, RootContent } from 'hast'

import { spellingMatches, type SpellingEdit } from './nameCorrections'

export function exactSpellingOccurrences(markdown: string, name: string): SpellingEdit[] {
  return spellingMatches(markdown, [
    { from: name, to: `${name} Corrected`, enabled: true, source: 'explicit', createdAt: 0 },
  ])
}

/** Only raw-identical editable Markdown text; never code, URLs or quotations. */
export function inlineSpellingPlugin(markdown: string, names: string[]) {
  const matches = names.flatMap(name => exactSpellingOccurrences(markdown, name))
  return () => (tree: Root) => {
    const visit = (parent: Root | Element) => {
      if (
        !parent.children ||
        (parent.type === 'element' &&
          ['a', 'code', 'pre', 'blockquote'].includes(parent.tagName)) ||
        (parent.type === 'element' &&
          parent.tagName === 'li' &&
          Array.isArray(parent.properties.className) &&
          parent.properties.className.includes('task-list-item'))
      )
        return
      parent.children = (parent.children as RootContent[]).flatMap<RootContent>(node => {
        if (node.type !== 'text') {
          if (node.type === 'element') visit(node)
          return [node]
        }
        const start = node.position?.start?.offset,
          end = node.position?.end?.offset
        if (start == null || end == null || markdown.slice(start, end) !== node.value) return [node]
        const spans = matches
          .filter(m => m.from >= start && m.to <= end)
          .filter((m, i, all) => !all.some((n, j) => i !== j && n.from < m.to && n.to > m.from))
          .sort((a, b) => a.from - b.from)
        let cursor = start
        const result: ElementContent[] = []
        for (const span of spans) {
          result.push({ type: 'text', value: markdown.slice(cursor, span.from) })
          result.push({
            type: 'element',
            tagName: 'span',
            properties: { dataSpellingFrom: span.from, dataSpellingTo: span.to },
            children: [{ type: 'text', value: span.before }],
          })
          cursor = span.to
        }
        result.push({ type: 'text', value: markdown.slice(cursor, end) })
        return result
      }) as ElementContent[]
    }
    visit(tree)
  }
}
