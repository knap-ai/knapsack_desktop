export type ScheduledTask = {
  id: string
  name: string
  enabled: boolean
  agent_id?: string | null
  session_key?: string | null
  schedule: Record<string, unknown> | null
  next_run_at_ms: number | null
  delivery: Record<string, unknown> | null
}

export function scheduledTaskOwner(task: ScheduledTask): string | null {
  // Desktop teammates share the gateway's main agent, but have separate sessions.
  const session = task.session_key?.match(/(?:^|:)ui-agent-([^:]+)$/)?.[1]
  if (session) return session
  const agent = task.agent_id?.replace(/^agent-/, '')
  return agent && agent !== 'main' ? agent : null
}

export function formatScheduledTaskCadence(schedule: ScheduledTask['schedule']): string {
  if (!schedule) return 'Schedule unavailable'
  if (schedule.kind === 'cron') return `${String(schedule.expr ?? 'Custom schedule')}${schedule.tz ? ` · ${schedule.tz}` : ''}`
  if (schedule.kind === 'every' && typeof schedule.everyMs === 'number') {
    const minutes = schedule.everyMs / 60_000
    return minutes < 1 ? `Every ${schedule.everyMs / 1000} seconds` : minutes % 60 === 0 ? `Every ${minutes / 60} hours` : `Every ${minutes} minutes`
  }
  if (schedule.kind === 'at' && typeof schedule.at === 'string') {
    const date = new Date(schedule.at)
    return Number.isNaN(date.getTime()) ? 'Scheduled time unavailable' : `Once · ${date.toLocaleString()}`
  }
  return 'Custom schedule'
}

export function formatScheduledTaskDelivery(delivery: ScheduledTask['delivery']): string {
  if (delivery?.mode === 'none') return 'No message delivery'
  if (typeof delivery?.channel === 'string') return `Delivery: ${delivery.channel}`
  return 'Default delivery'
}
