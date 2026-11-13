import { KNLocalStorage } from './KNLocalStorage'
import { getProfileRevision } from './profileScope'

export const EMAIL_POPUP_PREFERENCE_CHANGED = 'kn-email-popup-preference-changed'
const PREFIX = 'email_popup_opt_in_v1:'

// Positive, device-local consent. Legacy dismissal values never imply consent.
export const emailPopupOwner = (profile: { uuid?: string; email?: string } | null | undefined) =>
  profile?.uuid && profile?.email ? `${profile.uuid}:${profile.email.trim().toLowerCase()}` : null

export async function readEmailPopupPreference() {
  const revision = getProfileRevision()
  const owner = emailPopupOwner(await KNLocalStorage.getItem('KN_PROFILE'))
  const enabled = owner ? (await KNLocalStorage.getItem(PREFIX + owner)) === true : false
  return {
    owner,
    revision,
    enabled: getProfileRevision() === revision && enabled,
  }
}

export async function writeEmailPopupPreference(owner: string, revision: number, enabled: boolean) {
  const current = await readEmailPopupPreference()
  if (getProfileRevision() !== revision || current.owner !== owner || current.revision !== revision)
    throw new Error('Account changed. Reopen this setting.')
  // The destination key is bound to the original identity, even if a switch occurs during persistence.
  try {
    await KNLocalStorage.setItem(PREFIX + owner, enabled)
  } catch (error) {
    // KNLocalStorage mutates its cache before disk persistence. Restore that cache
    // too, so a failed positive opt-in cannot silently enable a later component.
    await KNLocalStorage.setItem(PREFIX + owner, current.enabled).catch(() => undefined)
    throw error
  }
  window.dispatchEvent(new Event(EMAIL_POPUP_PREFERENCE_CHANGED))
}
