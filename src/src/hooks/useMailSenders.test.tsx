// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { getConnections, type Connection } from 'src/api/connections'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useMailSenders } from './useMailSenders'

vi.mock('src/api/connections', () => ({ getConnections: vi.fn() }))
const grant = {
  id: 8,
  key: 'google_gmail_modify',
  ownerEmail: 'linked@example.test',
  calendarAccountEmail: 'mailbox@example.test',
} as Connection
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
describe('draft sender discovery', () => {
  it('finds saved mailboxes outside an empty sync map without choosing another owner', async () => {
    vi.mocked(getConnections).mockResolvedValue({ saved: grant })
    const { result } = renderHook(() => useMailSenders({}, 'primary@example.test', true))
    await waitFor(() => expect(result.current.senders).toHaveLength(1))
    expect(result.current.senders[0]).toMatchObject({
      ownerEmail: 'linked@example.test',
      requiresSelection: true,
    })
    expect(getConnections).toHaveBeenCalledWith(
      'primary@example.test',
      expect.objectContaining({ includeAllUsers: true }),
    )
  })
  it('honors an authoritative empty inventory instead of resurrecting stale sync grants', async () => {
    vi.mocked(getConnections).mockResolvedValue({})
    const { result } = renderHook(() =>
      useMailSenders(
        { stale: { ...grant, ownerEmail: 'primary@example.test' } },
        'primary@example.test',
        true,
      ),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.senders).toEqual([])
  })
  it('shows inventory failure and supports an explicit refresh', async () => {
    vi.mocked(getConnections)
      .mockRejectedValueOnce(new Error('synthetic failure'))
      .mockResolvedValueOnce({ saved: grant })
    const { result } = renderHook(() => useMailSenders({}, 'primary@example.test', true))
    await waitFor(() => expect(result.current.error).toContain('draft is preserved'))
    result.current.refresh()
    await waitFor(() => expect(result.current.senders).toHaveLength(1))
    expect(result.current.error).toBe('')
  })
})
