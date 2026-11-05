import { useState } from 'react'

import type { Connection } from 'src/api/connections'

export function ConnectionGrantRemove({
  connection,
  service,
  busy,
  onRemove,
}: {
  connection: Connection
  service: string
  busy: boolean
  onRemove: (connection: Connection) => Promise<unknown>
}) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div>
      <button type="button" disabled={busy} onClick={() => setConfirm(true)}>
        Remove
      </button>
      {confirm && (
        <div
          role="group"
          aria-label="Confirm connection removal"
          className="p-3 border rounded text-sm"
        >
          <p>
            Remove {service} for {connection.calendarAccountEmail || connection.ownerEmail} from
            Knapsack profile {connection.ownerEmail || 'unknown'}?
          </p>
          <p>
            This removes only this saved connection from Knapsack. Other services and profiles stay
            connected; Google authorization is not revoked.
          </p>
          <div className="flex gap-4 mt-2">
            <button type="button" disabled={busy} onClick={() => void onRemove(connection)}>
              {busy ? 'Removing…' : 'Remove this connection'}
            </button>
            <button type="button" disabled={busy} onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
