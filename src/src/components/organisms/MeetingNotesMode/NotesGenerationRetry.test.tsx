// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import NotesGenerationRetry from './NotesGenerationRetry'

afterEach(cleanup)
it('explains missing native identity without retrying automatically', () => {
  const retry = vi.fn()
  render(
    <NotesGenerationRetry
      error={new Error('Sign in to this account before generating meeting notes.')}
      onRetry={retry}
    />,
  )
  expect(screen.getByText('Meeting account needs attention')).toBeTruthy()
  expect(screen.getByText(/Studio may still be connected/)).toBeTruthy()
  expect(retry).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Preview notes' }))
  expect(retry).toHaveBeenCalledOnce()
})
it('does not expose arbitrary provider or note content', () => {
  render(<NotesGenerationRetry error={new Error('private-provider-payload')} onRetry={vi.fn()} />)
  expect(screen.getByText('Note generation didn’t finish')).toBeTruthy()
  expect(screen.queryByText(/private-provider-payload/)).toBeNull()
  expect(screen.getByText(/Existing notes will not change/)).toBeTruthy()
})
