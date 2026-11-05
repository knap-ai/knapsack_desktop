import type { Connection } from 'src/api/connections'

const services: Record<string, string> = {
  google_gmail_modify: 'Gmail',
  google_calendar_read: 'Calendar',
  google_drive_read: 'Drive',
}
export const normalizeConnectionEmail = (email?: string) => (email || '').trim().toLowerCase()

/** Presentation only: keep every persisted grant and its owner available for exact removal. */
export function groupSettingsGoogleConnections(
  connections: Record<string, Connection>,
  fallback: string,
) {
  const accounts = new Map<string, Map<string, Connection[]>>()
  for (const connection of Object.values(connections)) {
    const service = services[connection.key]
    if (!service) continue
    const account =
      normalizeConnectionEmail(
        connection.calendarAccountEmail || connection.ownerEmail || fallback,
      ) || 'unknown account'
    const groups = accounts.get(account) || new Map<string, Connection[]>()
    const grants = groups.get(service) || []
    if (
      !grants.some(
        grant => grant.id === connection.id && grant.ownerEmail === connection.ownerEmail,
      )
    )
      grants.push(connection)
    groups.set(service, grants)
    accounts.set(account, groups)
  }
  return Array.from(accounts, ([accountEmail, groups]) => ({
    accountEmail,
    services: Array.from(groups, ([service, grants]) => ({ service, grants })),
  })).sort((a, b) => a.accountEmail.localeCompare(b.accountEmail))
}

/** Refresh Settings independently: a failed background refresh must not hide a completed deletion. */
export async function refreshAfterConnectionRemoval(
  refreshApp: () => Promise<unknown>,
  refreshSettings: () => Promise<unknown>,
) {
  const results = await Promise.allSettled([refreshApp(), refreshSettings()])
  const failed = results.filter(result => result.status === 'rejected')
  if (failed.length)
    throw new Error(
      'Connection removed, but the connection list could not fully refresh. Reopen Settings to retry.',
    )
}
