// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import StarterKit from '@tiptap/starter-kit'
import { MeetingNotesTable as Table } from 'src/utils/meetingNotesTableExtension'
import { Markdown } from 'tiptap-markdown'
import { afterEach, describe, expect, it } from 'vitest'

import MarkdownDisplay from 'src/components/molecules/MarkdownDisplay'

import { validateNotesProposal } from './meetingNotesEdits'
import { buildSlackClipboardPayload, buildSlackNotesMessage } from './slackMeetingNotes'

const editors: Editor[] = []
function editor(content: string) {
  const e = new Editor({
    extensions: [StarterKit, Table, TableRow, TableHeader, TableCell, TaskList, TaskItem, Markdown],
    content,
  })
  editors.push(e)
  return e
}
afterEach(() => {
  cleanup()
  editors.splice(0).forEach(e => e.destroy())
})
describe('meeting table round trips', () => {
  it('preserves pipes, formatting and columns through save/reopen and undo', () => {
    const e = editor('| Owner | Task |\n| --- | --- |\n| **Jo** | one\\|two |')
    let end = 0
    e.state.doc.descendants((node, pos) => {
      if (node.isText && node.text === 'one|two') end = pos + node.nodeSize
    })
    e.commands.insertContentAt(end, ' updated')
    const saved = e.storage.markdown.getMarkdown()
    const reopened = editor(saved)
    expect(reopened.getHTML()).toContain('one|two')
    expect(reopened.getHTML().match(/<td/g)?.length).toBe(2)
    expect(reopened.getHTML()).toContain('<strong>Jo</strong>')
    e.commands.undo()
    expect(e.getHTML()).toContain('one|two')
    expect(e.getHTML()).not.toContain('updated')
  })
  it('renders and reopens complex HTML table cells without losing paragraphs', () => {
    const e = editor(
      '<table><tbody><tr><th>Owner</th><th>Task</th></tr><tr><td><p>Jo</p></td><td><p>First paragraph</p><p><strong>Second paragraph</strong></p></td></tr></tbody></table>',
    )
    const saved = e.storage.markdown.getMarkdown()
    expect(saved).toContain('<table')
    render(<MarkdownDisplay markdown={saved} />)
    expect(screen.getByRole('table')).toBeTruthy()
    expect(screen.getByText('Second paragraph').tagName).toBe('STRONG')
    expect(editor(saved).getHTML()).toContain('<p><strong>Second paragraph</strong></p>')
    expect(buildSlackClipboardPayload(saved).text).toContain('• Owner: Jo')
    expect(buildSlackClipboardPayload(saved).text).toContain(
      '• Task: First paragraph Second paragraph',
    )
  })
  it('sanitizes HTML tables before rendering', () => {
    const { container } = render(
      <MarkdownDisplay
        markdown={
          '<table><tr><td onclick="bad()">Safe<script>bad()</script><img src=x onerror="bad()"><a href="javascript:bad()">link</a></td></tr></table>'
        }
      />,
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('[onclick], [onerror], [href^="javascript:"]')).toBeNull()
  })
  it('keeps checked table tasks through save/reopen and renders only disabled checkboxes', () => {
    const e = editor(
      '<table><tr><th>Task</th></tr><tr><td><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Completed task</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Pending task</p></div></li></ul></td></tr></table>',
    )
    const saved = e.storage.markdown.getMarkdown()
    render(<MarkdownDisplay markdown={saved} />)
    const inputs = screen.getAllByRole('checkbox') as HTMLInputElement[]
    expect(inputs.map(input => input.checked)).toEqual([true, false])
    expect(inputs.every(input => input.disabled)).toBe(true)
    const reopened = editor(saved)
    expect(reopened.getHTML()).toContain('data-checked="true"')
    expect(reopened.getHTML()).toContain('data-checked="false"')
    expect(buildSlackClipboardPayload(saved).text).toContain('☑ Completed task')
    expect(buildSlackClipboardPayload(saved).text).toContain('☐ Pending task')
  })
  it('does not allow editable inputs or carry input values, form attributes or handlers', () => {
    const { container } = render(
      <MarkdownDisplay
        markdown={
          '<table><tr><td><input type="text" value="secret"><input type="checkbox" checked name="unsafe" value="unsafe" form="unsafe" onclick="bad()" style="position:fixed"></td></tr></table>'
        }
      />,
    )
    const inputs = container.querySelectorAll('input')
    expect(inputs).toHaveLength(1)
    expect(inputs[0].type).toBe('checkbox')
    expect(inputs[0].checked).toBe(true)
    expect(inputs[0].disabled).toBe(true)
    for (const attribute of ['value', 'name', 'form', 'onclick', 'style'])
      expect(inputs[0].hasAttribute(attribute)).toBe(false)
  })
  it('keeps table structure when applying a reviewed AI edit', () => {
    const before = '| Owner | Task |\n| --- | --- |\n| Jo | Review pricing |'
    const proposal = validateNotesProposal(
      JSON.stringify({
        edits: [
          {
            before: 'Review pricing',
            after: 'Review current pricing',
            reason: 'Requested clarification',
          },
        ],
        ambiguities: [],
      }),
      before,
    )
    const e = editor(proposal.notes)
    expect(e.getHTML().match(/<td/g)?.length).toBe(2)
    expect(e.getHTML()).toContain('Review current pricing')
  })
  it('keeps table cells after an HTML paste and save/reopen', () => {
    const e = editor('<p>Intro</p>')
    e.commands.setTextSelection(e.state.doc.content.size - 1)
    e.view.pasteHTML(
      '<table><tr><th>Owner</th><th>Task</th></tr><tr><td>Sam</td><td><strong>Review</strong> one|two</td></tr></table>',
      new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent,
    )
    const reopened = editor(e.storage.markdown.getMarkdown())
    expect(reopened.getHTML()).toContain('<strong>Review</strong> one|two')
    expect(reopened.getHTML().match(/<td/g)?.length).toBe(2)
  })
  it('preserves merged cells in storage and sanitized display', () => {
    const e = editor(
      '<table><tr><th colspan="2">Summary</th></tr><tr><td>Owner</td><td>Jo</td></tr></table>',
    )
    const saved = e.storage.markdown.getMarkdown()
    render(<MarkdownDisplay markdown={saved} />)
    expect(screen.getByRole('columnheader').getAttribute('colspan')).toBe('2')
    expect(editor(saved).getHTML()).toContain('colspan="2"')
  })
})

describe('HTML-backed table clipboard fidelity', () => {
  it('expands row spans without assigning a task to the owner column', () => {
    const html =
      '<table><tr><th>Owner</th><th>Task</th></tr><tr><td rowspan="2">Jo</td><td>Review</td></tr><tr><td>Ship</td></tr></table>'
    const payload = buildSlackClipboardPayload(html)
    expect(payload.text.match(/Owner: Jo/g)).toHaveLength(2)
    expect(payload.text).toContain('Task: Ship')
    expect(payload.text).not.toContain('Owner: Ship')
    const table = buildSlackNotesMessage(html).blocks.find(block => block.type === 'table')
    expect(table?.type === 'table' && table.rows.map(row => row.map(cell => cell.text))).toEqual([
      ['Owner', 'Task'],
      ['Jo', 'Review'],
      ['Jo', 'Ship'],
    ])
  })
  it('expands col spans and retains the following cell position', () => {
    const html =
      '<table><tr><th>Owner</th><th>Task</th><th>Status</th><th>Next</th></tr><tr><td>Jo</td><td colspan="2">Review</td><td>Tomorrow</td></tr></table>'
    const table = buildSlackNotesMessage(html).blocks.find(block => block.type === 'table')
    expect(table?.type === 'table' && table.rows[1].map(cell => cell.text)).toEqual([
      'Jo',
      'Review',
      'Review',
      'Tomorrow',
    ])
    expect(buildSlackClipboardPayload(html).text).toContain('Next: Tomorrow')
  })
  it('keeps destinations and literal Markdown symbols without parsing cell text as markup', () => {
    const html =
      '<table><tr><th>Reference</th></tr><tr><td><a href="https://example.test/plan?a=1&amp;b=2">Plan</a> **literal** *stars* `code` one|two</td></tr></table>'
    const expected = 'Plan (https://example.test/plan?a=1&b=2) **literal** *stars* `code` one|two'
    const payload = buildSlackClipboardPayload(html)
    expect(payload.text).toContain(expected)
    expect(payload.html).toContain('**literal** *stars* `code` one|two')
    expect(payload.html).not.toContain('<strong>literal</strong>')
    const table = buildSlackNotesMessage(html).blocks.find(block => block.type === 'table')
    expect(table?.type === 'table' && table.rows[1][0].text).toBe(expected)
  })
  it('copies checked and unchecked task state and excludes active-content payloads', () => {
    const html =
      '<table><tr><th>Task</th></tr><tr><td><input type="checkbox" checked>Done <input type="checkbox">Pending<script>privateScript()</script><a href="javascript:bad()">Safe label</a></td></tr></table>'
    const payload = buildSlackClipboardPayload(html)
    expect(payload.text).toContain('☑ Done ☐ Pending')
    expect(payload.text).not.toContain('privateScript')
    expect(payload.text).not.toContain('javascript:')
    expect(payload.html).not.toContain('<input')
    expect(payload.html).not.toContain('<script')
  })
  it('does not convert HTML examples inside code fences', () => {
    const example = '```html\n<table><tr><td>Example **literal**</td></tr></table>\n```'
    expect(buildSlackClipboardPayload(example).text).toBe(example)
    expect(buildSlackNotesMessage(example).blocks.some(block => block.type === 'table')).toBe(false)
  })
  it('retains the first data row of a table without column headers', () => {
    const html =
      '<table><tr><td>Jo</td><td>Review</td></tr><tr><td>Sam</td><td>Ship</td></tr></table>'
    const payload = buildSlackClipboardPayload(html)
    expect(payload.text).toContain('Column 1: Jo')
    expect(payload.text).toContain('Column 2: Review')
    expect(payload.text).toContain('Column 1: Sam')
  })
  it('does not truncate the outer table at a nested table closing tag', () => {
    const html =
      '<table><tr><th>Task</th></tr><tr><td>Outer <table><tr><td>Inner</td></tr></table></td></tr><tr><td>Last row</td></tr></table>'
    expect(buildSlackClipboardPayload(html).text).toContain('Task: Outer Inner')
    expect(buildSlackClipboardPayload(html).text).toContain('Task: Last row')
  })
})
