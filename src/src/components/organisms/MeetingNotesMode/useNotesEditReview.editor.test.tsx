// @vitest-environment jsdom
import { useEffect, useState } from 'react'

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { writeCorrections } from 'src/utils/nameCorrections'
import { Markdown } from 'tiptap-markdown'
import { afterEach, expect, it, vi } from 'vitest'

import { NameSpellingReview } from './NameSpellingReview'
import { useNotesEditReview } from './useNotesEditReview'

vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: {
    getItem: vi.fn(async () => ({ uuid: 'editor-acceptance', email: 'editor@example.invalid' })),
  },
}))
afterEach(cleanup)
it('pages 32 actual-editor occurrences, selectively applies canonical expansions, protects source Markdown and undoes all batches', async () => {
  localStorage.clear()
  const mappings = [
    { from: 'Jhon', to: 'John', enabled: true, source: 'explicit' as const, createdAt: 1 },
    { from: 'Anne', to: 'Anne Marie', enabled: true, source: 'explicit' as const, createdAt: 2 },
  ]
  writeCorrections('editor-acceptance', mappings)
  const original =
    '🚀 Met **Jhon** yesterday. **Jhon**son owns review.\n\n' +
    Array.from({ length: 30 }, (_, i) => `Jhon follows up on item ${i}.`).join('\n\n') +
    '\n\n    Jhon.run()\n\n[profile]: /people/Jhon\n\nAnne owns pricing.'
  let notes = original,
    revision = 'r0',
    counter = 0,
    editor: Editor
  const archive = new Map<string, { notes: string; revision: string }>()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method)
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { thread_id: 900410, exists: true, notes, revision },
          }),
        }
      const request = JSON.parse(String(init.body))
      expect(request.expected_revision).toBe(revision)
      const previous = { notes, revision }
      if (request.restore_revision) {
        const old = archive.get(request.restore_revision)!
        notes = old.notes
        revision = old.revision
      } else {
        notes = request.notes
        revision = `r${++counter}`
      }
      const revision_id = `archive${archive.size}`
      archive.set(revision_id, previous)
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: { thread_id: 900410, notes, revision, revision_id },
        }),
      }
    }),
  )
  function Harness() {
    const [body, setBody] = useState(original)
    const instance = useEditor({ extensions: [StarterKit, Markdown] })
    useEffect(() => {
      if (instance) {
        editor = instance
        instance.commands.setContent(instance.storage.markdown.parser.parse(original), false)
      }
    }, [instance])
    const review = useNotesEditReview({
      accountScope: 'editor-acceptance',
      threadId: 900410,
      completed: true,
      notes: body,
      context: 'synthetic',
      queue: () => {
        throw Error('No model calls permitted')
      },
      flush: async () => {},
      spellings: () => JSON.stringify(mappings),
      saved: value => {
        setBody(value)
        instance?.commands.setContent(instance.storage.markdown.parser.parse(value), false)
      },
    })
    return (
      <>
        <NameSpellingReview
          accountEmail="editor@example.invalid"
          editor={instance}
          text={body}
          onPreview={() => void review.prepareSpellings(mappings)}
        />
        <EditorContent editor={instance} />
        {review.review}
      </>
    )
  }
  render(<Harness />)
  await waitFor(() => expect(editor).toBeTruthy())
  fireEvent.click(screen.getByText(/Review name spellings/))
  await waitFor(() =>
    expect(
      (screen.getByText('Preview remembered spellings in this note') as HTMLButtonElement).disabled,
    ).toBe(false),
  )
  fireEvent.click(screen.getByText('Preview remembered spellings in this note'))
  await waitFor(() =>
    expect(screen.getAllByRole('checkbox', { name: /Apply spelling occurrence/ })).toHaveLength(30),
  )
  const boxes = screen.getAllByRole('checkbox', { name: /Apply spelling occurrence/ })
  for (const box of boxes.slice(1)) fireEvent.click(box)
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(screen.getByText('Review next spelling batch')).toBeTruthy())
  expect(notes).toContain('🚀 Met **John** yesterday. **Jhon**son')
  expect(notes).toContain('    Jhon.run()')
  expect(notes).toContain('[profile]: /people/Jhon')
  fireEvent.click(screen.getByText('Review next spelling batch'))
  await waitFor(() => expect(screen.getByText('Review later matches')).toBeTruthy())
  fireEvent.click(screen.getByText('Review later matches'))
  expect(screen.getAllByRole('checkbox', { name: /Apply spelling occurrence/ })).toHaveLength(1)
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(notes).toContain('Anne Marie owns pricing.'))
  await waitFor(() => expect(screen.getByText('Review next spelling batch')).toBeTruthy())
  fireEvent.click(screen.getByText('Review next spelling batch'))
  await waitFor(() =>
    expect(screen.getAllByRole('checkbox', { name: /Apply spelling occurrence/ })).toHaveLength(30),
  )
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(screen.queryByText('Review next spelling batch')).toBeNull())
  expect(editor!.getText()).toContain('Anne Marie owns pricing.')
  expect(editor!.getText()).not.toContain('Anne Marie Marie')
  expect(editor!.getText()).toContain('Jhonson owns review.')
  expect(editor!.getText()).toContain('Jhon.run()')
  expect(notes).toContain('    Jhon.run()')
  expect(notes).toContain('[profile]: /people/Jhon')
  for (let i = 0; i < 3; i++) {
    fireEvent.click(screen.getByText('Undo notes edit'))
    await waitFor(() =>
      expect(screen.queryByText('Preparing or saving notes revision…')).toBeNull(),
    )
  }
  expect(notes).toBe(original)
  expect(editor!.getText()).toContain('Anne owns pricing.')
  act(() => editor!.destroy())
})
