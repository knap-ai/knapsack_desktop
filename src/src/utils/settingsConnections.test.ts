import type { ConnectionStates } from 'src/api/connections'
import { describe, expect, it, vi } from 'vitest'

import {
  groupSettingsGoogleConnections,
  refreshAfterConnectionRemoval,
} from './settingsConnections'

describe('Settings connection inventory', () => {
  const grant = (
    id: number,
    ownerEmail: string,
    key = 'google_gmail_modify',
    account = 'Mark@Example.com ',
  ) => ({ id, ownerEmail, key, calendarAccountEmail: account, state: 'idle' as ConnectionStates })
  it('groups services while preserving distinct profile grants and exact IDs', () => {
    const groups = groupSettingsGoogleConnections(
      {
        a: grant(1, 'a@example.com'),
        b: grant(2, 'b@example.com'),
        c: grant(3, 'a@example.com', 'google_drive_read', 'mark@example.com'),
      },
      '',
    )
    expect(groups).toHaveLength(1)
    expect(groups[0].accountEmail).toBe('mark@example.com')
    expect(groups[0].services.map(item => [item.service, item.grants.map(row => row.id)])).toEqual([
      ['Gmail', [1, 2]],
      ['Drive', [3]],
    ])
  })
  it('keeps distinct accounts and returns authoritative empty state', () => {
    expect(groupSettingsGoogleConnections({}, 'a@example.com')).toEqual([])
    expect(
      groupSettingsGoogleConnections(
        {
          a: grant(1, 'a', 'google_gmail_modify', 'a@example.com'),
          b: grant(2, 'b', 'google_gmail_modify', 'b@example.com'),
        },
        '',
      ),
    ).toHaveLength(2)
  })
  it('refreshes Settings despite failed app refresh', async () => {
    const settings = vi.fn().mockResolvedValue({})
    await expect(
      refreshAfterConnectionRemoval(() => Promise.reject(new Error('app')), settings),
    ).rejects.toThrow('removed')
    expect(settings).toHaveBeenCalledOnce()
  })
  it('reports failed inventory refresh and allows retry', async () => {
    const app = vi.fn().mockResolvedValue(undefined)
    const settings = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({})
    await expect(refreshAfterConnectionRemoval(app, settings)).rejects.toThrow('refresh')
    await expect(refreshAfterConnectionRemoval(app, settings)).resolves.toBeUndefined()
  })
})
