// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readCorrections, writeCorrections } from 'src/utils/nameCorrections'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { NameSpellingReview } from './NameSpellingReview'

const state = vi.hoisted(() => ({
  profile: { uuid: 'A', email: 'a@example.invalid' } as { uuid: string; email: string } | null,
  pending: undefined as Promise<unknown> | undefined,
}))
vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: { getItem: vi.fn(async () => state.pending || state.profile) },
}))
beforeEach(() => {
  localStorage.clear()
  state.profile = { uuid: 'A', email: 'a@example.invalid' }
  state.pending = undefined
})
afterEach(cleanup)
function fields() {
  fireEvent.click(screen.getByText(/Review name spellings/))
  fireEvent.change(screen.getByLabelText('Heard spelling'), { target: { value: 'Jhon' } })
  fireEvent.change(screen.getByLabelText('Preferred spelling'), { target: { value: 'John' } })
}
it('invalidates pending Remember and clears independent captures on A→B→signed-out fixtures', async () => {
  render(
    <NameSpellingReview
      accountEmail="a@example.invalid"
      editor={null}
      text="Jhon"
      onPreview={vi.fn()}
    />,
  )
  fields()
  await waitFor(() =>
    expect((screen.getByText('Remember spelling') as HTMLButtonElement).disabled).toBe(false),
  )
  let release: (v: unknown) => void = () => {}
  state.pending = new Promise(resolve => {
    release = resolve
  })
  fireEvent.click(screen.getByText('Remember spelling'))
  state.profile = { uuid: 'B', email: 'b@example.invalid' }
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  state.pending = undefined
  await act(async () => {
    release({ uuid: 'A', email: 'a@example.invalid' })
  })
  expect(readCorrections('A')).toEqual([])
  expect(readCorrections('B')).toEqual([])
  expect((screen.getByLabelText('Heard spelling') as HTMLInputElement).value).toBe('')
  expect((screen.getByLabelText('Preferred spelling') as HTMLInputElement).value).toBe('')
  expect((screen.getByText('Remember spelling') as HTMLButtonElement).disabled).toBe(true)
  state.profile = null
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  expect((screen.getByText('Remember spelling') as HTMLButtonElement).disabled).toBe(true)
})
it('loads only the matching fixture profile and keeps signed-out state empty even with stale storage', async () => {
  writeCorrections('A', [
    { from: 'Jhon', to: 'John', enabled: true, source: 'explicit', createdAt: 1 },
  ])
  const h = render(
    <NameSpellingReview
      key="A"
      accountEmail="a@example.invalid"
      editor={null}
      text="Jhon"
      onPreview={vi.fn()}
    />,
  )
  await waitFor(() => expect(screen.getByText(/1 remembered/)).toBeTruthy())
  state.profile = { uuid: 'B', email: 'b@example.invalid' }
  h.rerender(
    <NameSpellingReview
      key="B"
      accountEmail="b@example.invalid"
      editor={null}
      text="Jhon"
      onPreview={vi.fn()}
    />,
  )
  await waitFor(() =>
    expect((screen.getByText('Remember spelling') as HTMLButtonElement).disabled).toBe(false),
  )
  expect(screen.getByText(/0 remembered/)).toBeTruthy()
  expect(screen.queryByText('Forget')).toBeNull()
  state.profile = { uuid: 'A', email: 'a@example.invalid' }
  h.rerender(
    <NameSpellingReview key="out" accountEmail="" editor={null} text="Jhon" onPreview={vi.fn()} />,
  )
  await act(async () => {})
  expect(screen.getByText(/0 remembered/)).toBeTruthy()
  expect((screen.getByText('Remember spelling') as HTMLButtonElement).disabled).toBe(true)
  expect(readCorrections('A')).toHaveLength(1)
})
