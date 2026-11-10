// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readCorrections } from 'src/utils/nameCorrections'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { NameSpellingReview } from './NameSpellingReview'

vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: { getItem: vi.fn(async () => ({ uuid: 'synthetic-user' })) },
}))
beforeEach(() => localStorage.clear())
afterEach(cleanup)
it('uses native accessible review controls, explicit confirmation and reversible management', async () => {
  const preview = vi.fn()
  render(<NameSpellingReview editor={null} text="Met Knapsak." onPreview={preview} />)
  const summary = screen.getByText(/Review name spellings/)
  expect(summary.tagName).toBe('SUMMARY')
  fireEvent.click(summary)
  fireEvent.click(screen.getByRole('button', { name: 'Review spelling of Knapsak' }))
  expect((screen.getByLabelText('Heard spelling') as HTMLInputElement).value).toBe('Knapsak')
  fireEvent.change(screen.getByLabelText('Heard spelling'), { target: { value: 'Knapsak' } })
  fireEvent.change(screen.getByLabelText('Preferred spelling'), { target: { value: 'Knapsack' } })
  expect(readCorrections('synthetic-user')).toEqual([])
  await waitFor(() =>
    expect((screen.getByText('Remember spelling') as HTMLButtonElement).disabled).toBe(false),
  )
  fireEvent.click(screen.getByText('Remember spelling'))
  await waitFor(() => expect(readCorrections('synthetic-user')).toHaveLength(1))
  expect(screen.getByRole('status').textContent).toContain('Existing notes are unchanged')
  fireEvent.click(screen.getByText('Preview remembered spellings in this note'))
  expect(preview).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('checkbox'))
  await waitFor(() => expect(readCorrections('synthetic-user')[0].enabled).toBe(false))
  fireEvent.click(screen.getByRole('button', { name: 'Forget Knapsak to Knapsack' }))
  await waitFor(() => expect(readCorrections('synthetic-user')).toEqual([]))
})
it('does not learn from generated text or rerenders', async () => {
  const ui = render(<NameSpellingReview editor={null} text="Knapsak" onPreview={vi.fn()} />)
  ui.rerender(<NameSpellingReview editor={null} text="Knapsack" onPreview={vi.fn()} />)
  await waitFor(() =>
    expect((screen.getByText('Remember spelling') as HTMLButtonElement).disabled).toBe(false),
  )
  expect(readCorrections('synthetic-user')).toEqual([])
})

it('prefills a selected corrected spelling without changing the editor or remembering implicitly', async () => {
  const editor = {
    getText: () => 'Knapsack met Acme.',
    state: { selection: { from: 1, to: 9 }, doc: { textBetween: vi.fn(() => 'Knapsack') } },
  } as unknown as import('@tiptap/react').Editor
  render(<NameSpellingReview editor={editor} text="Knapsack met Acme." onPreview={vi.fn()} />)
  fireEvent.click(screen.getByText(/Review name spellings/))
  fireEvent.click(screen.getByText('Use selection as preferred spelling'))
  expect((screen.getByLabelText('Preferred spelling') as HTMLInputElement).value).toBe('Knapsack')
  expect((screen.getByLabelText('Heard spelling') as HTMLInputElement).value).toBe('')
  expect(readCorrections('synthetic-user')).toEqual([])
  expect(editor.getText()).toBe('Knapsack met Acme.')
})

it('allows keyboard activation of tentative spelling controls', async () => {
  const user = userEvent.setup()
  render(<NameSpellingReview editor={null} text="Knapsak" onPreview={vi.fn()} />)
  fireEvent.click(screen.getByText(/Review name spellings/))
  const candidate = screen.getByRole('button', { name: 'Review spelling of Knapsak' })
  candidate.focus()
  await user.keyboard('{Enter}')
  expect((screen.getByLabelText('Heard spelling') as HTMLInputElement).value).toBe('Knapsak')
  expect(screen.getByRole('status')).toBeTruthy()
  expect(readCorrections('synthetic-user')).toEqual([])
})

it('retains a before-selection while the user edits, then remembers the two captured selections only after confirmation', async () => {
  let selected = 'Jhon'
  const editor = {
    getText: () => selected,
    state: { selection: { from: 1, to: 5 }, doc: { textBetween: () => selected } },
  } as unknown as import('@tiptap/react').Editor
  const ui = render(<NameSpellingReview editor={editor} text="Jhon" onPreview={vi.fn()} />)
  fireEvent.click(screen.getByText(/Review name spellings/))
  fireEvent.click(screen.getByText('Use selection as heard spelling'))
  selected = 'John'
  ui.rerender(<NameSpellingReview editor={editor} text="John" onPreview={vi.fn()} />)
  fireEvent.click(screen.getByText('Use selection as preferred spelling'))
  expect((screen.getByLabelText('Heard spelling') as HTMLInputElement).value).toBe('Jhon')
  expect((screen.getByLabelText('Preferred spelling') as HTMLInputElement).value).toBe('John')
  expect(readCorrections('synthetic-user')).toEqual([])
  await waitFor(() =>
    expect((screen.getByText('Remember spelling') as HTMLButtonElement).disabled).toBe(false),
  )
  fireEvent.click(screen.getByText('Remember spelling'))
  await waitFor(() => expect(readCorrections('synthetic-user')).toHaveLength(1))
  expect(readCorrections('synthetic-user')[0]).toMatchObject({
    from: 'Jhon',
    to: 'John',
    source: 'explicit',
  })
})
