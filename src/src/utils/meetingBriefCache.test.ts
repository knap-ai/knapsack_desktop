// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { claimMeetingBrief, forgetMeetingBrief, readMeetingBrief } from './meetingBriefCache'
import { PROFILE_CHANGED_EVENT } from './profileScope'

beforeEach(() => localStorage.clear())
afterEach(() => {
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
  vi.useRealTimers()
})
it('shares one admitted request across navigation and reuses completed local content', async () => {
  const one = claimMeetingBrief('A/calendar/event/occurrence/policy/v2')
  const two = claimMeetingBrief('A/calendar/event/occurrence/policy/v2')
  expect(one.owner).toBe(true)
  expect(two.owner).toBe(false)
  expect(two.flight.promise).toBe(one.flight.promise)
  one.flight.complete({ content: 'Synthetic brief with evidence.', sources: ['Calendar'] })
  const result = await two.flight.promise
  expect(readMeetingBrief('A/calendar/event/occurrence/policy/v2')).toEqual(result)
  expect(readMeetingBrief('B/calendar/event/occurrence/policy/v2')).toBeUndefined()
})
it('explicit refresh invalidates only the selected cached brief', async () => {
  const one = claimMeetingBrief('selected')
  one.flight.complete({ content: 'Old synthetic brief', sources: [] })
  await one.flight.promise
  forgetMeetingBrief('selected')
  expect(readMeetingBrief('selected')).toBeUndefined()
  const next = claimMeetingBrief('selected')
  expect(next.owner).toBe(true)
  next.flight.complete({ content: 'Refreshed synthetic brief', sources: [] })
  await next.flight.promise
})
it.each([PROFILE_CHANGED_EVENT, 'privacy-mode-changed', 'provider-settings-changed'])(
  'cancels an old-account/route request on %s without publishing a late result',
  async event => {
    const one = claimMeetingBrief('A-private-context')
    window.dispatchEvent(new Event(event))
    await expect(one.flight.promise).rejects.toThrow('changed')
    expect(one.flight.signal.aborted).toBe(true)
    one.flight.complete({ content: 'Late private result', sources: ['Calendar'] })
    expect(readMeetingBrief('A-private-context')).toBeUndefined()
  },
)
it('bounds a stuck queue and allows a later explicit attempt', async () => {
  vi.useFakeTimers()
  const one = claimMeetingBrief('hung')
  await vi.advanceTimersByTimeAsync(180000)
  await expect(one.flight.promise).rejects.toThrow('timed out')
  expect(one.flight.signal.aborted).toBe(true)
  const next = claimMeetingBrief('hung')
  expect(next.owner).toBe(true)
  next.flight.complete({ content: 'Recovered synthetic brief', sources: [] })
  await next.flight.promise
})

it('rejects stale admission even when identity changed before a flight could subscribe', async () => {
  const { meetingBriefAuthority } = await import('./meetingBriefCache')
  const origin = meetingBriefAuthority()
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
  expect(() => claimMeetingBrief('late-admission', origin)).toThrow('authority changed')
})
it('cannot repopulate an old brief after a fulfilled promise crosses an account boundary', async () => {
  const { meetingBriefAuthority } = await import('./meetingBriefCache')
  const origin = meetingBriefAuthority()
  let view = ''
  const one = claimMeetingBrief('fulfilled-A', origin)
  const subscriber = one.flight.promise.then(value => {
    if (meetingBriefAuthority() === origin) view = value.content
  })
  one.flight.complete({ content: 'Old A result', sources: [] })
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
  await subscriber
  expect(view).toBe('')
  expect(readMeetingBrief('fulfilled-A', origin)).toBeUndefined()
})
it('fingerprints actual per-provider model settings rather than a nonexistent generic key', async () => {
  const { meetingBriefModelFingerprint } = await import('./meetingBriefCache')
  localStorage.setItem('moltbot_active_provider', 'ollama')
  localStorage.setItem('moltbot_ollama_model', 'model-one')
  const first = meetingBriefModelFingerprint()
  localStorage.setItem('moltbot_ollama_model', 'model-two')
  expect(meetingBriefModelFingerprint()).not.toBe(first)
})
it('refresh remains usable when disk invalidation is denied and does not reuse stale content', async () => {
  const key = 'denied-invalidation-fixture'
  const initial = claimMeetingBrief(key)
  initial.flight.complete({ content: 'Old synthetic brief', sources: [] })
  await initial.flight.promise
  const remove = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
    throw new Error('denied')
  })
  try {
    expect(() => forgetMeetingBrief(key)).not.toThrow()
    expect(readMeetingBrief(key)).toBeUndefined()
    const replacement = claimMeetingBrief(key),
      subscriber = claimMeetingBrief(key)
    expect(replacement.owner).toBe(true)
    expect(subscriber.owner).toBe(false)
    replacement.flight.complete({ content: 'Fresh synthetic brief', sources: [] })
    await subscriber.flight.promise
    expect(readMeetingBrief(key)?.content).toBe('Fresh synthetic brief')
  } finally {
    remove.mockRestore()
  }
})
