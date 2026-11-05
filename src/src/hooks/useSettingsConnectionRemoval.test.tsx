// @vitest-environment jsdom
import { useState } from 'react'

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Connection, ConnectionStates } from 'src/api/connections'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConnectionGrantRemove } from 'src/components/templates/Home/components/SettingsDialog/ConnectionGrantRemove'

import { useSettingsConnectionRemoval } from './useSettingsConnectionRemoval'

afterEach(cleanup)
const grant: Connection = {
  id: 42,
  key: 'google_gmail_modify',
  state: 'idle' as ConnectionStates,
  ownerEmail: 'old@example.com',
  calendarAccountEmail: 'mail@example.com',
}
function Fixture({
  remove,
  refreshApp = async () => undefined,
}: {
  remove: (id: number) => Promise<unknown>
  refreshApp?: () => Promise<unknown>
}) {
  const [rows, setRows] = useState([grant])
  const removal = useSettingsConnectionRemoval({
    deleteConnection: remove,
    onRemoved: connection => setRows(items => items.filter(item => item.id !== connection.id)),
    refreshApp,
    refreshSettings: async () => undefined,
  })
  return (
    <>
      {rows.map(connection => (
        <ConnectionGrantRemove
          key={connection.id}
          connection={connection}
          service="Gmail"
          busy={removal.removingId !== null}
          onRemove={removal.remove}
        />
      ))}
      {!rows.length && <p>No connections</p>}
      {removal.error && <p role="alert">{removal.error}</p>}
    </>
  )
}
describe('exact saved connection removal', () => {
  it('requires owner-labelled confirmation and cancel makes no request', () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    render(<Fixture remove={remove} />)
    fireEvent.click(screen.getByText('Remove'))
    expect(screen.getByText(/from Knapsack profile old@example.com/)).toBeTruthy()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Remove this connection')).toBeNull()
    expect(remove).not.toHaveBeenCalled()
  })
  it('confirms exact ID without auth email and double click sends once', async () => {
    let finish!: () => void
    const remove = vi.fn(
      () =>
        new Promise<void>(resolve => {
          finish = resolve
        }),
    )
    render(<Fixture remove={remove} />)
    fireEvent.click(screen.getByText('Remove'))
    const button = screen.getByText('Remove this connection')
    act(() => {
      button.click()
      button.click()
    })
    expect(remove).toHaveBeenCalledExactlyOnceWith(42)
    await act(async () => finish())
    expect(screen.getByText('No connections')).toBeTruthy()
  })
  it('retains failed grant and offers retry with visible failure', async () => {
    const remove = vi
      .fn()
      .mockRejectedValueOnce(new Error('Could not remove connection'))
      .mockResolvedValueOnce(undefined)
    render(<Fixture remove={remove} />)
    fireEvent.click(screen.getByText('Remove'))
    fireEvent.click(screen.getByText('Remove this connection'))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not remove'))
    expect(screen.queryByText('No connections')).toBeNull()
    fireEvent.click(screen.getByText('Remove this connection'))
    await waitFor(() => expect(screen.getByText('No connections')).toBeTruthy())
    expect(remove).toHaveBeenCalledTimes(2)
  })
  it('keeps final empty inventory when background refresh fails', async () => {
    render(
      <Fixture
        remove={vi.fn().mockResolvedValue(undefined)}
        refreshApp={async () => {
          throw new Error('offline')
        }}
      />,
    )
    fireEvent.click(screen.getByText('Remove'))
    fireEvent.click(screen.getByText('Remove this connection'))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Connection removed'),
    )
    expect(screen.getByText('No connections')).toBeTruthy()
    expect(screen.queryByText('Remove')).toBeNull()
  })
})
