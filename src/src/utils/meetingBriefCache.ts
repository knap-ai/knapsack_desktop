import { PROFILE_CHANGED_EVENT } from './profileScope'

export type SavedMeetingBrief = { content: string; sources: string[]; savedAt: number }
const PREFIX = 'kn-meeting-brief-v1:'
const invalidated = new Set<string>()
let authority = 0
for (const event of [PROFILE_CHANGED_EVENT, 'privacy-mode-changed', 'provider-settings-changed']) {
  window.addEventListener(event, () => {
    authority++
  })
}
export const meetingBriefAuthority = () => authority
export function meetingBriefModelFingerprint(): string {
  const keys = Object.keys(localStorage)
    .filter(
      key =>
        key === 'moltbot_active_provider' ||
        key === 'knapsack_knapsack_model' ||
        /^moltbot_[a-z0-9_-]+_model$/.test(key),
    )
    .sort()
  return JSON.stringify(keys.map(key => [key, localStorage.getItem(key)]))
}

const flights = new Map<string, ReturnType<typeof newFlight>>()
export function readMeetingBrief(
  key: string,
  expectedAuthority = authority,
): SavedMeetingBrief | undefined {
  if (authority !== expectedAuthority || invalidated.has(key)) return undefined
  try {
    const value = JSON.parse(localStorage.getItem(PREFIX + key) || 'null')
    if (
      value &&
      typeof value.content === 'string' &&
      value.content.trim() &&
      value.content.length <= 50000 &&
      Array.isArray(value.sources) &&
      value.sources.every((s: unknown) => typeof s === 'string') &&
      Number.isFinite(value.savedAt)
    )
      return value
  } catch {
    /* Unavailable cache does not change authority. */
  }
}
export function forgetMeetingBrief(key: string): void {
  invalidated.add(key)
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* In-memory invalidation still forces refresh. */
  }
}
function newFlight(key: string) {
  const originAuthority = authority
  const controller = new AbortController()
  let resolve!: (value: SavedMeetingBrief) => void, reject!: (error: Error) => void
  const promise = new Promise<SavedMeetingBrief>((yes, no) => {
    resolve = yes
    reject = no
  })
  // The owner and every subscriber handle failure; retain no unhandled rejection.
  void promise.catch(() => {})
  let settled = false
  const finish = () => {
    settled = true
    clearTimeout(timer)
    window.removeEventListener(PROFILE_CHANGED_EVENT, cancelled)
    window.removeEventListener('privacy-mode-changed', cancelled)
    window.removeEventListener('provider-settings-changed', cancelled)
    flights.delete(key)
  }
  const fail = (error: Error) => {
    if (settled) return
    controller.abort(error)
    finish()
    reject(error)
  }
  const cancelled = () =>
    fail(new Error('Account or privacy policy changed. Refresh the brief when ready.'))
  const timer = setTimeout(
    () => fail(new Error('Brief preparation timed out. Saved notes are unchanged.')),
    180000,
  )
  window.addEventListener(PROFILE_CHANGED_EVENT, cancelled)
  window.addEventListener('privacy-mode-changed', cancelled)
  window.addEventListener('provider-settings-changed', cancelled)
  return {
    promise,
    signal: controller.signal,
    fail,
    complete(value: { content: string; sources: string[] }) {
      if (settled || controller.signal.aborted || authority !== originAuthority) return
      if (!value.content.trim() || value.content.length > 50000) {
        fail(new Error('No complete brief was returned.'))
        return
      }
      const saved = { ...value, sources: value.sources.slice(0, 20), savedAt: Date.now() }
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
        if (keys.length >= 48) {
          const oldest = keys.sort((a, b) => {
            try {
              return (
                JSON.parse(localStorage.getItem(a) || '{}').savedAt -
                JSON.parse(localStorage.getItem(b) || '{}').savedAt
              )
            } catch {
              return 0
            }
          })[0]
          if (oldest) localStorage.removeItem(oldest)
        }
        localStorage.setItem(PREFIX + key, JSON.stringify(saved))
        invalidated.delete(key)
      } catch {
        /* Show the result, but do not claim it was persisted. */
      }
      finish()
      resolve(saved)
    },
  }
}
export function claimMeetingBrief(key: string, expectedAuthority = authority) {
  if (authority !== expectedAuthority) throw new Error('Brief authority changed before admission.')
  const existing = flights.get(key)
  if (existing) return { owner: false, flight: existing }
  const flight = newFlight(key)
  flights.set(key, flight)
  return { owner: true, flight }
}
