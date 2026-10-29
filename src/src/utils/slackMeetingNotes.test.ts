import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildSlackNotesMessage, buildSlackClipboardPayload, copyMeetingNotesForSlack } from './slackMeetingNotes'

const syntheticNotes = `# Decisions

- **Owner:** Ship the rich clipboard fix
- [ ] **Mark** — Validate in Slack

| Item | State |
| --- | --- |
| Clipboard | Ready |`

describe('Slack meeting-note clipboard payload', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses rich HTML while keeping the plain fallback free of literal mrkdwn', () => {
    const payload = buildSlackClipboardPayload(syntheticNotes, 'Synthetic meeting')
    expect(payload.html).toContain('<h3>Decisions</h3>')
    expect(payload.html).toContain('<strong>Owner:</strong>')
    expect(payload.html).toContain('<ul>')
    expect(payload.text).toContain('Owner: Ship the rich clipboard fix')
    expect(payload.text).not.toMatch(/\*[^*]+\*/)
  })

  it('preserves underscores in linked URLs in both clipboard formats', () => {
    const url = 'https://example.com/team_notes/qa_check?run_id=synthetic_1'
    const payload = buildSlackClipboardPayload(`[QA reference](${url})`)
    expect(payload.text).toContain(url)
    expect(payload.html).toContain(`href="${url}"`)
    expect(payload.html).not.toContain('<strong>')
  })

  it('renders synthetic image alt text as inert text in the HTML clipboard payload', () => {
    const maliciousAlt = '</p><img src=x onerror="synthetic()">'
    const payload = buildSlackClipboardPayload(`![${maliciousAlt}](https://example.com/image.png)`)

    expect(payload.text).toContain(maliciousAlt)
    expect(payload.html).toContain(
      '&lt;/p&gt;&lt;img src=x onerror=&quot;synthetic()&quot;&gt;',
    )
    expect(payload.html).not.toContain('<img src=x')
    expect(payload.html).not.toContain('</p><img')
  })

  it('writes both clipboard MIME types when rich clipboard support is available', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn().mockResolvedValue(undefined)
    class TestClipboardItem {
      constructor(public readonly data: Record<string, Blob>) {}
    }
    vi.stubGlobal('navigator', { clipboard: { write, writeText } })
    vi.stubGlobal('ClipboardItem', TestClipboardItem)

    await copyMeetingNotesForSlack(syntheticNotes, 'Synthetic meeting')

    expect(write).toHaveBeenCalledOnce()
    const item = write.mock.calls[0][0][0] as TestClipboardItem
    expect(Object.keys(item.data).sort()).toEqual(['text/html', 'text/plain'])
    expect(writeText).not.toHaveBeenCalled()
  })

  it('falls back to readable plain text if rich clipboard writing fails', async () => {
    const write = vi.fn().mockRejectedValue(new Error('unsupported'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { write, writeText } })
    vi.stubGlobal('ClipboardItem', class { constructor(_: Record<string, Blob>) {} })

    await copyMeetingNotesForSlack(syntheticNotes)

    expect(writeText).toHaveBeenCalledOnce()
    expect(writeText.mock.calls[0][0]).not.toContain('**Owner:**')
  })
})

describe('native Slack tables and readable clipboard constraints',()=>{
 it('sends actual table blocks with original row/column order and inert cell text',()=>{
  const message=buildSlackNotesMessage('# Summary\n\n| Owner | Task |\n| --- | --- |\n| Frida | Review <@U123> |','Fictional meeting')
  const table=message.blocks.find(b=>b.type==='table');expect(table).toMatchObject({type:'table',rows:[[{type:'raw_text',text:'Owner'},{type:'raw_text',text:'Task'}],[{type:'raw_text',text:'Frida'},{type:'raw_text',text:'Review <@U123>'}]]})
  expect(message.text).toContain('Frida');expect(buildSlackClipboardPayload('| A | B |\n| --- | --- |\n| 1 | 2 |').html).toContain('<pre>')
 })
 it('preserves escaped pipes and inline code pipes inside cells',()=>{const m=buildSlackNotesMessage('| A | B |\n| --- | --- |\n| one\\|two | `x|y` |');const t=m.blocks[0];expect(t.type==='table'&&t.rows[1].map(c=>c.text)).toEqual(['one|two','x|y'])})
 it('does not parse a code example as a real table',()=>{const md='```\n| A | B |\n| --- | --- |\n| 1 | 2 |\n```';expect(buildSlackNotesMessage(md).blocks.some(b=>b.type==='table')).toBe(false);expect(buildSlackClipboardPayload(md).text).toContain('| --- | --- |')})
 it('fails oversized tables explicitly without truncation or splitting into unexpected posts',()=>{expect(()=>buildSlackNotesMessage('| A |\n| --- |\n'+Array.from({length:100},()=> '| value |').join('\n'))).toThrow(/100 rows/);expect(()=>buildSlackNotesMessage('| A |\n| --- |\n| '+ 'x'.repeat(10001)+' |')).toThrow(/limits/);expect(()=>buildSlackNotesMessage('x'.repeat(40000))).toThrow(/limits/)})
 it('retains literal underscores and cell values instead of treating every underscore as markup',()=>{const m=buildSlackNotesMessage('| Key | Value |\n| --- | --- |\n| team_id | `a_b` |');const t=m.blocks[0];expect(t.type==='table'&&t.rows[1].map(c=>c.text)).toEqual(['team_id','a_b'])})

})
