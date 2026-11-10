// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { readCorrections } from 'src/utils/nameCorrections'
import { Markdown } from 'tiptap-markdown'
import { afterEach, expect, it, vi } from 'vitest'

import { NameSpellingReview } from './NameSpellingReview'

vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: {
    getItem: vi.fn(async () => ({ uuid: 'synthetic-editor', email: 'editor@example.invalid' })),
  },
}))
afterEach(cleanup)
it('preserves editor selection/export and does not learn from text transactions, hydration, generated insertion or history', async () => {
  localStorage.clear()
  let editor: Editor
  function Harness() {
    const instance = useEditor({
      extensions: [StarterKit, Markdown],
      content: '<p>🚀 Met <strong>Jhon</strong> yesterday.</p>',
    })
    if (!instance) return null
    editor = instance
    return (
      <>
        <NameSpellingReview
          accountEmail="editor@example.invalid"
          editor={instance}
          text=""
          onPreview={vi.fn()}
        />
        <EditorContent editor={instance} />
      </>
    )
  }
  render(<Harness />)
  await waitFor(() => expect(editor).toBeTruthy())
  const original = editor!.storage.markdown.getMarkdown(),
    text = editor!.getText()
  const summary = screen.getByText(/Review name spellings/)
  summary.focus()
  expect(document.activeElement).toBe(summary)
  fireEvent.click(summary)
  expect(screen.getByText(/may be sent to/)).toBeTruthy()
  let start = 0
  editor!.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === 'Jhon') start = pos
  })
  act(() => {
    editor!.commands.setTextSelection({ from: start, to: start + 4 })
  })
  fireEvent.click(screen.getByText('Use selection as heard spelling'))
  expect(
    editor!.state.doc.textBetween(editor!.state.selection.from, editor!.state.selection.to),
  ).toBe('Jhon')
  expect(editor!.storage.markdown.getMarkdown()).toBe(original)
  expect(editor!.getText()).toBe(text)
  await act(async () => {
    editor!.commands.insertContentAt({ from: start, to: start + 4 }, 'John')
  })
  act(() => {
    editor!.commands.undo()
    editor!.commands.redo()
  })
  act(() => {
    editor!.commands.setContent('<p>🚀 Met <strong>John</strong> yesterday.</p>', false)
  })
  act(() => {
    editor!.commands.insertContentAt(editor!.state.doc.content.size - 1, ' Synthetic generation.')
  })
  expect(readCorrections('synthetic-editor')).toEqual([])
  let preferred = 0
  editor!.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === 'John') preferred = pos
  })
  act(() => {
    editor!.commands.setTextSelection({ from: preferred, to: preferred + 4 })
  })
  const before = editor!.storage.markdown.getMarkdown(),
    selection = editor!.state.doc.textBetween(
      editor!.state.selection.from,
      editor!.state.selection.to,
    )
  fireEvent.click(screen.getByText('Use selection as preferred spelling'))
  expect(selection).toBe('John')
  expect((screen.getByLabelText('Preferred spelling') as HTMLInputElement).value).toBe('John')
  expect((screen.getByLabelText('Heard spelling') as HTMLInputElement).value).toBe('Jhon')
  const user = userEvent.setup()
  screen.getByText('Remember spelling').focus()
  await user.keyboard('{Enter}')
  await waitFor(() => expect(readCorrections('synthetic-editor')).toHaveLength(1))
  expect(editor!.storage.markdown.getMarkdown()).toBe(before)
  expect(
    editor!.state.doc.textBetween(editor!.state.selection.from, editor!.state.selection.to),
  ).toBe(selection)
  expect(editor!.getHTML()).not.toContain('Review name spellings')
  fireEvent.click(summary)
  expect((summary.parentElement as HTMLDetailsElement).open).toBe(false)
  editor!.destroy()
})
