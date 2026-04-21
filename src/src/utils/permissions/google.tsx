import { open } from '@tauri-apps/api/shell'

import { GOOGLE_OAUTH2_AUTH_URL, KN_API_GOOGLE_SIGNIN_REDIRECT } from '../constants'
import { logError } from '../errorHandling'

export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GoogleAuthError'
  }
}

// Module-level flag.  Set before opening the OAuth browser window so the
// signin_success listener in App.tsx knows to treat this as an "add calendar"
// flow rather than a primary login.
let _pendingCalendarAddEmail: string | null = null

/** Store the primary user email before triggering the add-calendar OAuth flow. */
export const setPendingCalendarAddEmail = (email: string): void => {
  _pendingCalendarAddEmail = email
}

/** Consume (read + clear) the pending calendar-add email. */
export const consumePendingCalendarAddEmail = (): string | null => {
  const email = _pendingCalendarAddEmail
  _pendingCalendarAddEmail = null
  return email
}

export const openGoogleAuthScreen = (scope: string) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    const error = new GoogleAuthError(
      'Google OAuth client ID is not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file.'
    )
    logError(error, {
      additionalInfo: 'VITE_GOOGLE_CLIENT_ID is missing or empty',
      error: error.message,
    })
    console.error(error.message)
    throw error
  }

  const params = new URLSearchParams({
    response_type: 'code',
    redirect_uri: KN_API_GOOGLE_SIGNIN_REDIRECT,
    client_id: clientId,
    access_type: 'offline',
    scope,
    prompt: 'consent',
  })

  const fullUrl = `${GOOGLE_OAUTH2_AUTH_URL}?${params.toString()}`
  console.log('[Google OAuth] Opening URL:', fullUrl)
  console.log('[Google OAuth] redirect_uri:', KN_API_GOOGLE_SIGNIN_REDIRECT)

  const popup = window.open(fullUrl, '_blank', 'noopener,noreferrer')
  if (!popup) {
    try {
      open(fullUrl)
    } catch (error: any) {
      logError(new Error('Error opening Google Auth screen:'), {
        additionalInfo: '',
        error: error.message,
      })
      console.error('Error opening Google Auth screen:', error)
      throw error
    }
  }
}

/** Open the OAuth flow to add an additional Google Calendar account.
 *  The resulting signin_success event will be handled as an add-calendar
 *  flow (not a full re-login) because we store the primary email here. */
export const openAddGoogleCalendarScreen = (
  primaryEmail: string,
  calendarScope: string,
): void => {
  setPendingCalendarAddEmail(primaryEmail)
  openGoogleAuthScreen(calendarScope)
}
