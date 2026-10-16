import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildSlackClipboardPayload, copyMeetingNotesForSlack } from './slackMeetingNotes'

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
