import { listen } from '@tauri-apps/api/event'

/**
 * Onboarding intent carried in from the website.
 *
 * A visitor who clicks the Executive Assistant ad and lands on
 * /executive-assistant should meet the Executive Assistant on first launch, not
 * a four-way picker. The website's thank-you page opens
 * knapsack://onboard?role=executive-assistant&attr_id=... after the download; the Rust side
 * forwards that URL as a "deep-link-received" event and this module turns it
 * into a stored intent the onboarding screens can read.
 *
 * The intent is persisted because the deep link usually arrives before the
 * onboarding UI has mounted.
 */

const STORAGE_KEY = 'ks_onboarding_intent'
export const ONBOARDING_INTENT_EVENT = 'knapsack-onboarding-intent'

/** Landing-page role slug -> agent template id in agentTemplates.ts. */
export const ROLE_TO_TEMPLATE: Record<string, string> = {
  'executive-assistant': 'scout',
  'enterprise-sdr': 'atlas',
  'daily-coach': 'coach',
  'email-autopilot': 'polly',
  // Roles below have landing pages but no agent template yet. Left unmapped on
  // purpose: preselecting the wrong worker is worse than showing the picker.
}

export interface OnboardingIntent {
  /** Agent template id to preselect, e.g. "scout". */
  templateId?: string
  /** Original landing-page slug, kept for analytics. */
  role?: string
  /** Ad attribution id set by the website, for joining this install to a click. */
  attrId?: string
  gclid?: string
  receivedAt: number
}

function read(): OnboardingIntent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OnboardingIntent) : null
  } catch {
    return null
  }
}

function write(intent: OnboardingIntent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(intent))
  } catch {
    /* storage unavailable; the picker just shows its default */
  }
}

/** Parses knapsack://onboard?role=…&attr_id=… into an intent. */
export function parseDeepLink(url: string): OnboardingIntent | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'knapsack:' || parsed.hostname !== 'onboard') return null

    const params = parsed.searchParams
    const role = params.get('role') || undefined
    const templateId = role ? ROLE_TO_TEMPLATE[role] : undefined

    if (!templateId && !role) return null

    return {
      templateId,
      role,
      attrId: params.get('attr_id') || undefined,
      gclid: params.get('gclid') || undefined,
      receivedAt: Date.now(),
    }
  } catch {
    return null
  }
}

/**
 * Starts listening for deep links. Call once at app startup.
 * Returns an unlisten function.
 */
export async function initOnboardingIntent(): Promise<() => void> {
  return listen<string | string[]>('deep-link-received', event => {
    const payload = event.payload
    const url = Array.isArray(payload) ? payload[0] : payload
    if (typeof url !== 'string') return

    const intent = parseDeepLink(url)
    if (intent) {
      write(intent)
      window.dispatchEvent(
        new CustomEvent<OnboardingIntent>(ONBOARDING_INTENT_EVENT, { detail: intent }),
      )
    }
  })
}

/** The stored intent, if the app was opened from a role page. */
export function getOnboardingIntent(): OnboardingIntent | null {
  return read()
}

/** Clears the intent once onboarding has consumed it. */
export function clearOnboardingIntent() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to do */
  }
}
