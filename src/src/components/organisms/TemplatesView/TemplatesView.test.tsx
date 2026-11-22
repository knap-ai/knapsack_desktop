// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { IThread } from 'src/api/threads'
import { runNotesGenerationOnce } from 'src/utils/notesGenerationAdmission'
import { afterEach, expect, it, vi } from 'vitest'

import TemplatesView from './index'

vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: { getItem: async () => '', setItem: vi.fn() },
}))
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('disables selection while busy, re-enables in the same drawer, and stays dismissible', async () => {
  vi.useFakeTimers()
  let finish!: () => void
  const work = runNotesGenerationOnce(
    77123,
    'synthetic',
    () =>
      new Promise<void>(resolve => {
        finish = resolve
      }),
  )
  await act(async () => undefined)
  const select = vi.fn(),
    close = vi.fn()
  render(
    <TemplatesView
      thread={{ id: 77123, promptTemplate: 'INTERNAL_MEETING' } as IThread}
      onClose={close}
      setMeetingTemplatePrompt={select}
    />,
  )
  const button = screen.getByRole('button', { name: /Client Discovery/ }) as HTMLButtonElement
  expect(button.disabled).toBe(true)
  expect(screen.getByRole('status').textContent).toMatch(/Updating notes/)
  fireEvent.click(button)
  expect(select).not.toHaveBeenCalled()
  fireEvent.keyDown(button, { key: 'Escape' })
  expect(close).toHaveBeenCalledOnce()
  await act(async () => {
    finish()
    await work
    vi.advanceTimersByTime(200)
  })
  expect(button.disabled).toBe(false)
  fireEvent.click(button)
  await act(async () => undefined)
  expect(select).toHaveBeenCalledOnce()
  expect(button.getAttribute('aria-pressed')).toBe('true')
})
it('keeps full instructions collapsed and retains the old selected state after rejection', async () => {
  render(
    <TemplatesView
      thread={{ id: 77124, promptTemplate: 'INTERNAL_MEETING' } as IThread}
      onClose={vi.fn()}
      setMeetingTemplatePrompt={async () => {
        throw new Error('Synthetic persistence failure')
      }}
    />,
  )
  expect(document.querySelector('details')?.open).toBe(false)
  const old = screen.getByRole('button', { name: /Internal Meeting/ })
  fireEvent.click(screen.getByRole('button', { name: /Client Discovery/ }))
  await act(async () => undefined)
  expect(old.getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('alert').textContent).toBe('Synthetic persistence failure')
})
