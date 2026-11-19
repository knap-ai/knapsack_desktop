// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import InlineSpellingNotes from './InlineSpellingNotes'
import { readCorrections } from 'src/utils/nameCorrections'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
const mocks = vi.hoisted(() => ({ profile: { email: 'owner@example.test', uuid: 'owner' } }))
vi.mock('src/utils/KNLocalStorage', () => ({ KNLocalStorage: { getItem: vi.fn(async () => mocks.profile) } }))
afterEach(() => { cleanup(); localStorage.clear(); mocks.profile = { email: 'owner@example.test', uuid: 'owner' } })
const text = '**Alice Rivera** met Alice Rivera.\n\n`Alice Rivera`\n\n[Reference](https://example.test/Alice%20Rivera)'
async function open(onChange = vi.fn()) {
  render(<InlineSpellingNotes markdown={text} accountEmail="owner@example.test" names={['Alice Rivera']} onChange={onChange} />)
  fireEvent.click(screen.getAllByRole('button', { name: 'Correct spelling: Alice Rivera' })[0])
  await screen.findByRole('dialog')
  fireEvent.change(screen.getByLabelText('Correct spelling'), { target: { value: 'Alicia Rivera' } })
  return onChange
}
it('changes only the chosen exact occurrence, preserving formatting and code', async () => {
  const change = await open(); fireEvent.click(screen.getByRole('button', { name: 'Apply correction' }))
  await waitFor(() => expect(change).toHaveBeenCalledWith(text.replace('**Alice Rivera**', '**Alicia Rivera**')))
  expect(readCorrections('owner')).toEqual([])
})
it('applies all editable occurrences only with an explicit check and remembers separately', async () => {
  const change = await open()
  fireEvent.click(screen.getByLabelText('Apply to all exact occurrences in these notes'))
  fireEvent.click(screen.getByLabelText('Remember for future notes on this device'))
  fireEvent.click(screen.getByRole('button', { name: 'Apply correction' }))
  await waitFor(() => expect(change).toHaveBeenCalledWith(text.replace('**Alice Rivera** met Alice Rivera.', '**Alicia Rivera** met Alicia Rivera.')))
  expect(readCorrections('owner')[0].to).toBe('Alicia Rivera')
})
it('cancel and profile changes leave notes and memory untouched', async () => {
  const change = await open(); fireEvent.click(screen.getByRole('button', { name: 'Cancel' })); expect(change).not.toHaveBeenCalled()
  fireEvent.click(screen.getAllByRole('button', { name: 'Correct spelling: Alice Rivera' })[0]); await screen.findByRole('dialog')
  mocks.profile = { email: 'other@example.test', uuid: 'other' }; window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull()); expect(change).not.toHaveBeenCalled(); expect(readCorrections('other')).toEqual([])
})
it('keeps a failed save open and never remembers an unsaved correction', async () => {
  const save = vi.fn().mockRejectedValue(new Error('Synthetic disk failure'))
  render(<InlineSpellingNotes markdown={text} accountEmail="owner@example.test" names={['Alice Rivera']} onApplyCorrection={save} />)
  fireEvent.click(screen.getAllByRole('button', { name: 'Correct spelling: Alice Rivera' })[0]); await screen.findByRole('dialog')
  fireEvent.change(screen.getByLabelText('Correct spelling'), { target: { value: 'Alicia Rivera' } })
  fireEvent.click(screen.getByLabelText('Remember for future notes on this device'))
  fireEvent.click(screen.getByRole('button', { name: 'Apply correction' }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Synthetic disk failure')
  expect(screen.getByRole('dialog')).toBeTruthy(); expect(readCorrections('owner')).toEqual([])
})
it('never nests correction buttons in actionable task links', () => {
  render(<InlineSpellingNotes markdown="- [ ] Follow up with Alice Rivera" names={['Alice Rivera']} accountEmail="owner@example.test" onTaskAction={vi.fn()} />)
  expect(screen.queryByRole('button', { name: 'Correct spelling: Alice Rivera' })).toBeNull()
  expect(document.querySelector('a button')).toBeNull()
})
