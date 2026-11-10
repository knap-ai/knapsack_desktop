import { describe, expect, it } from 'vitest'

import { describeTaskSchedule } from './scheduledTaskCadence'

describe('scheduled task cadence labels', () => {
  it('describes daily and weekly time without inferring a missing timezone', () => {
    expect(describeTaskSchedule({ kind: 'cron', expr: '30 7 * * *', tz: 'America/New_York' })).toBe(
      'Daily at 07:30 · America/New_York',
    )
    expect(describeTaskSchedule({ kind: 'cron', expr: '0 8 * * 1' })).toBe(
      'Every Monday at 08:00 · timezone not specified',
    )
  })
  it('keeps unsupported and invalid cron expressions explicit', () => {
    expect(describeTaskSchedule({ kind: 'cron', expr: '*/15 8-17 * * 1-5' })).toContain(
      'Custom schedule: */15 8-17 * * 1-5',
    )
    expect(describeTaskSchedule({ kind: 'cron', expr: '99 44 * * *' })).toContain(
      'Custom schedule:',
    )
  })
  it('retains fractional intervals and rejects invalid dates', () => {
    expect(describeTaskSchedule({ kind: 'every', everyMs: 90000 })).toBe('Every 1.5 minutes')
    expect(describeTaskSchedule({ kind: 'at', at: 'invalid' })).toBe('Scheduled time unavailable')
    expect(describeTaskSchedule(null)).toBe('Schedule unavailable')
  })
})
