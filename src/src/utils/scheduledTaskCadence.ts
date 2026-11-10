export function describeTaskSchedule(schedule: Record<string, unknown> | null): string {
  if (!schedule) return 'Schedule unavailable'
  if (schedule.kind === 'cron') {
    const expression = String(schedule.expr ?? '')
    const match = expression.match(/^(\d{1,2}) (\d{1,2}) \* \* (\*|[0-6])$/)
    if (match && Number(match[1]) < 60 && Number(match[2]) < 24) {
      const day =
        match[3] === '*'
          ? 'Daily'
          : `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][Number(match[3])]}`
      const zone =
        typeof schedule.tz === 'string' && schedule.tz ? schedule.tz : 'timezone not specified'
      return `${day} at ${match[2].padStart(2, '0')}:${match[1].padStart(2, '0')} · ${zone}`
    }
    return `Custom schedule: ${expression || 'unavailable'}${schedule.tz ? ` · ${schedule.tz}` : ''}`
  }
  if (schedule.kind === 'every' && typeof schedule.everyMs === 'number' && schedule.everyMs > 0) {
    const minutes = schedule.everyMs / 60_000
    return minutes < 1
      ? `Every ${schedule.everyMs / 1000} seconds`
      : minutes % 60 === 0
        ? `Every ${minutes / 60} hours`
        : `Every ${minutes} minutes`
  }
  if (schedule.kind === 'at' && typeof schedule.at === 'string') {
    const date = new Date(schedule.at)
    return Number.isNaN(date.getTime())
      ? 'Scheduled time unavailable'
      : `Once · ${date.toLocaleString()}`
  }
  return 'Custom schedule'
}
