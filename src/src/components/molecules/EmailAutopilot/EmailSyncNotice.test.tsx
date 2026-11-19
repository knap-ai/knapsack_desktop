// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ConnectionStates } from 'src/api/connections'
import EmailSyncNotice from './EmailSyncNotice'
afterEach(cleanup)
it('keeps per-account failure discoverable beside a quiet status control', () => {
  render(<EmailSyncNotice accounts={[{ account: 'a@example.test', provider: 'Gmail', queryAccount: 'a@example.test', state: ConnectionStates.FAILED }]} busy={false} onRetry={vi.fn()} />)
  expect(screen.getByRole('status').textContent).toBe('Inbox sync needs attention')
  fireEvent.click(screen.getByLabelText('Inbox status: needs attention'))
  expect(screen.getByRole('alert').textContent).toContain('Results may be incomplete')
})
it('supports explicit retry without masking a refresh error as an empty inbox', () => {
  const retry = vi.fn(); render(<EmailSyncNotice accounts={[]} busy={false} error="Saved view could not refresh" onRetry={retry} />)
  fireEvent.click(screen.getByLabelText('Inbox status: needs attention'))
  fireEvent.click(screen.getByRole('button', { name: 'Retry email view' })); expect(retry).toHaveBeenCalledOnce()
})
