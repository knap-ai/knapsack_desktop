/** API helpers for Remote Developer Mode control. */

const API_BASE = 'http://127.0.0.1:8897'

export interface DevProject {
  id: string
  name: string
  description: string
  github_url: string
  dev_url: string
}

export interface DevModeState {
  enabled: boolean
  projects: DevProject[]
  active_project_id: string | null
  source_channel: string | null
  notify_to: string | null
  version: number
  updated_at: number
}

export interface RemoteCommand {
  action: 'enable' | 'disable' | 'set_project' | 'status'
  channel?: string
  notify_to?: string
  name?: string
  description?: string
  github_url?: string
  dev_url?: string
}

export async function getDevState(): Promise<{
  ok: boolean
  state?: DevModeState
}> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/state`)
  return resp.json()
}

export async function sendRemoteCommand(
  cmd: RemoteCommand,
): Promise<{ ok: boolean; message?: string; state?: DevModeState }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/remote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  })
  return resp.json()
}

export async function notifyChannel(
  message: string,
): Promise<{ ok: boolean; sent: boolean; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return resp.json()
}
