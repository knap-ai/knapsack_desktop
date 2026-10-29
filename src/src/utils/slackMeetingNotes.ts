const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const protectMarkdownLinks = (
  value: string,
  renderLink: (label: string, url: string) => string,
  renderImageAlt: (alt: string) => string = alt => alt,
) => {
  const protectedValues: string[] = []
  const protect = (rendered: string) => {
    const token = `\u0000KNAPSACKLINK${protectedValues.length}\u0000`
    protectedValues.push(rendered)
    return token
  }
  const protectedText = value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt: string) => protect(renderImageAlt(alt)))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label: string, url: string) =>
      protect(renderLink(label, url)),
    )
  return {
    value: protectedText,
    restore: (rendered: string) => rendered.replace(/\u0000KNAPSACKLINK(\d+)\u0000/g, (_, index: string) =>
      protectedValues[Number(index)] || '',
    ),
  }
}

const stripInlineMarkdown = (value: string) => {
  const protectedLinks = protectMarkdownLinks(value, (label, url) => `${label} (${url})`)
  return protectedLinks.restore(protectedLinks.value.replace(/(\*\*|__|~~)([\s\S]+?)\1/g, '$2').replace(/(?<!\w)([*_])([^*_]+?)\1(?!\w)/g, '$2').replace(/`+([^`]*?)`+/g, '$1')).trim()
}

const renderInlineHtml = (value: string) => {
  const protectedLinks = protectMarkdownLinks(
    value,
    (label, url) => `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`,
    escapeHtml,
  )
  const rendered = escapeHtml(protectedLinks.value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
  return protectedLinks.restore(rendered)
}

const tableCells = (line: string) => {
  const cells:string[]=[];let cell='',code=false
  const source=line.trim().replace(/^\||(?<!\\)\|$/g,'')
  for(let i=0;i<source.length;i++){
    if(source[i]==='\\' && source[i+1]==='|'){cell+='|';i++;continue}
    if(source[i]==='`')code=!code
    if(source[i]==='|' && !code){cells.push(stripInlineMarkdown(cell));cell=''}else cell+=source[i]
  }
  cells.push(stripInlineMarkdown(cell));return cells
}

const isTableDivider = (line = '') => {
  const cells = tableCells(line)
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}

const renderPlainTable = (rows: string[][]) => {
  const columnCount = Math.max(...rows.map(row => row.length))
  const widths = Array.from({ length: columnCount }, (_, column) =>
    Math.max(...rows.map(row => (row[column] || '').length)),
  )
  const renderRow = (row: string[]) =>
    widths.map((width, column) => (row[column] || '').padEnd(width)).join('  |  ').trimEnd()
  const divider = widths.map(width => '─'.repeat(Math.max(width, 3))).join('──┼──')
  return [renderRow(rows[0]), divider, ...rows.slice(1).map(renderRow)]
}

export type SlackClipboardPayload = {
  text: string
  html: string
}

/**
 * Slack does not parse API `mrkdwn` markers pasted as plain text. Keep a
 * readable marker-free fallback and put the formatting in text/html, which
 * may preserve some formatting when pasted. Native table blocks require the API.
 */
export const buildSlackClipboardPayload = (markdown: string, title?: string): SlackClipboardPayload => {
  const sourceLines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const plain: string[] = []
  const html: string[] = []
  let listOpen = false
  let codeFence = ''
  const closeList = () => {
    if (listOpen) html.push('</ul>')
    listOpen = false
  }

  if (title?.trim()) {
    const cleanTitle = stripInlineMarkdown(title)
    plain.push(cleanTitle, '')
    html.push(`<h2>${escapeHtml(cleanTitle)}</h2>`)
  }

  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index]
    const fenceMarker = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMarker || codeFence) {
      closeList(); plain.push(line); html.push(`<pre>${escapeHtml(line)}</pre>`)
      if(fenceMarker){if(!codeFence)codeFence=fenceMarker[1][0];else if(fenceMarker[1][0]===codeFence)codeFence=''}
      continue
    }
    if (line.includes('|') && isTableDivider(sourceLines[index + 1])) {
      closeList()
      const rows = [tableCells(line)]
      index += 2
      while (index < sourceLines.length && sourceLines[index].includes('|')) {
        rows.push(tableCells(sourceLines[index]))
        index += 1
      }
      index -= 1
      const rendered = renderPlainTable(rows)
      plain.push(...rendered)
      html.push(`<pre>${escapeHtml(rendered.join('\n'))}</pre>`)
      continue
    }

    const heading = line.match(/^#{1,6}\s+(.+)$/)
    if (heading) {
      closeList()
      plain.push(stripInlineMarkdown(heading[1]))
      html.push(`<h3>${renderInlineHtml(heading[1])}</h3>`)
      continue
    }

    const task = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/)
    const bullet = line.match(/^\s*[-*]\s+(.+)$/)
    if (task || bullet) {
      if (!listOpen) html.push('<ul>')
      listOpen = true
      const content = task ? task[2] : bullet![1]
      const prefix = task ? (/[xX]/.test(task[1]) ? '☑ ' : '☐ ') : '• '
      plain.push(prefix + stripInlineMarkdown(content))
      html.push(`<li>${task ? escapeHtml(prefix.trim() + ' ') : ''}${renderInlineHtml(content)}</li>`)
      continue
    }

    closeList()
    if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) {
      plain.push('──────────')
      html.push('<hr>')
    } else if (!line.trim()) {
      plain.push('')
      html.push('<br>')
    } else {
      plain.push(stripInlineMarkdown(line))
      html.push(`<p>${renderInlineHtml(line)}</p>`)
    }
  }
  closeList()

  return {
    text: plain.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    html: `<div>${html.join('')}</div>`,
  }
}

export const formatMeetingNotesForSlack = (markdown: string, title?: string) =>
  buildSlackClipboardPayload(markdown, title).text

export async function copyMeetingNotesForSlack(markdown: string, title?: string): Promise<void> {
  const payload = buildSlackClipboardPayload(markdown, title)
  const clipboard = navigator.clipboard
  if (clipboard?.write && typeof ClipboardItem !== 'undefined') {
    try {
      await clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([payload.text], { type: 'text/plain' }),
          'text/html': new Blob([payload.html], { type: 'text/html' }),
        }),
      ])
      return
    } catch {
      // Older WebKit/Tauri builds can expose write() but reject rich MIME data.
    }
  }
  await clipboard.writeText(payload.text)
}

export type SlackNotesBlock = { type: 'section'; text: { type:'plain_text'; text:string; emoji:false } } | { type:'table'; rows:{ type:'raw_text'; text:string }[][]; column_settings:{ is_wrapped:true }[] }
/** Native table blocks are API-only. Never advertise the clipboard as Block Kit. */
export function buildSlackNotesMessage(markdown:string,title?:string):{text:string;blocks:SlackNotesBlock[]} {
  const blocks:SlackNotesBlock[]=[]
  const lines=markdown.replace(/\r\n?/g,'\n').split('\n')
  let pending:string[]=[], fence=''
  const flush=()=>{const text=buildSlackClipboardPayload(pending.join('\n')).text;pending=[];const characters=Array.from(text);for(let start=0;start<characters.length;start+=2900){blocks.push({type:'section',text:{type:'plain_text',text:characters.slice(start,start+2900).join(''),emoji:false}})}}
  if(title?.trim())pending.push(title,'')
  for(let i=0;i<lines.length;i++){
    const marker=lines[i].match(/^\s*(`{3,}|~{3,})/)
    if(marker){if(!fence)fence=marker[1][0];else if(marker[1][0]===fence)fence='';pending.push(lines[i]);continue}
    if(!fence && lines[i].includes('|') && isTableDivider(lines[i+1])){
      flush();const rows=[tableCells(lines[i])];i+=2
      while(i<lines.length && lines[i].includes('|') && lines[i].trim()){rows.push(tableCells(lines[i]));i++}i--
      const columns=Math.max(...rows.map(row=>row.length))
      if(rows.length>100 || columns>20)throw new Error('Native Slack tables support at most 100 rows and 20 columns. Copy these notes instead.')
      blocks.push({type:'table',rows:rows.map(row=>Array.from({length:columns},(_,column)=>({type:'raw_text' as const,text:row[column]||''}))),column_settings:Array.from({length:columns},()=>({is_wrapped:true as const}))})
    }else pending.push(lines[i])
  }
  flush()
  const text=buildSlackClipboardPayload(markdown,title).text
  const cellCharacters=blocks.reduce((sum,b)=>sum+(b.type==='table'?b.rows.flat().reduce((n,c)=>n+Array.from(c.text).length,0):0),0)
  if(!text || Array.from(text).length>39000 || !blocks.length || blocks.length>50 || cellCharacters>10000)throw new Error('Notes exceed Slack message limits. Copy them instead; nothing was truncated.')
  return {text,blocks}
}
