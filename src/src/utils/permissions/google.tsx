import { open } from '@tauri-apps/api/shell'

import { GOOGLE_OAUTH2_AUTH_URL, KN_API_GOOGLE_SIGNIN_REDIRECT } from '../constants'
import { logError } from '../errorHandling'

export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GoogleAuthError'
  }
}

// Module-level pending-add-account state.  Set before opening the OAuth browser
// window so the signin_success listener in App.tsx knows this is an
// "add account" flow rather than a primary login.
type PendingAddAccountFlow = {
  primaryEmail: string
  type: 'calendar' | 'drive' | 'gmail'
}

let _pendingAddAccountFlow: PendingAddAccountFlow | null = null

/** Store the primary user email and connection type before triggering an add-account OAuth flow. */
export const setPendingAddAccountFlow = (primaryEmail: string, type: 'calendar' | 'drive' | 'gmail'): void => {
  _pendingAddAccountFlow = { primaryEmail, type }
}

/** Consume (read + clear) the pending add-account flow state. */
export const consumePendingAddAccountFlow = (): PendingAddAccountFlow | null => {
  const flow = _pendingAddAccountFlow
  _pendingAddAccountFlow = null
  return flow
}

const buildAddAccountState = (primaryEmail: string, type: PendingAddAccountFlow['type']) =>
  `knapsack_add_account:${type}:${encodeURIComponent(primaryEmail)}`

export const parsePendingAddAccountState = (state?: string | null): PendingAddAccountFlow | null => {
  if (!state?.startsWith('knapsack_add_account:')) {
    return null
  }

  const [, type, encodedPrimaryEmail] = state.split(':')
  if (
    (type !== 'calendar' && type !== 'drive' && type !== 'gmail') ||
    !encodedPrimaryEmail
  ) {
    return null
  }

  try {
    return {
      primaryEmail: decodeURIComponent(encodedPrimaryEmail),
      type,
    }
  } catch {
    return null
  }
}

/** @deprecated Use setPendingAddAccountFlow / consumePendingAddAccountFlow instead. */
export const setPendingCalendarAddEmail = (email: string): void =>
  setPendingAddAccountFlow(email, 'calendar')

/** @deprecated Use consumePendingAddAccountFlow instead. */
export const consumePendingCalendarAddEmail = (): string | null => {
  const flow = consumePendingAddAccountFlow()
  if (!flow || flow.type !== 'calendar') return null
  return flow.primaryEmail
}

export const openGoogleAuthScreen = (scope: string, state?: string) => {
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
  if (state) {
    params.set('state', state)
  }

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

/** Open the OAuth flow to add an additional Google Calendar account. */
export const openAddGoogleCalendarScreen = (
  primaryEmail: string,
  calendarScope: string,
): void => {
  setPendingAddAccountFlow(primaryEmail, 'calendar')
  // userinfo.email is required so the backend can identify which Google account
  // was just authorized and store it as the calendar_account_email.
  const scopeWithEmail = `${calendarScope} https://www.googleapis.com/auth/userinfo.email`
  openGoogleAuthScreen(scopeWithEmail, buildAddAccountState(primaryEmail, 'calendar'))
}

/** Open the OAuth flow to add an additional Google Drive account. */
export const openAddGoogleDriveScreen = (
  primaryEmail: string,
): void => {
  setPendingAddAccountFlow(primaryEmail, 'drive')
  const scope = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email'
  openGoogleAuthScreen(scope, buildAddAccountState(primaryEmail, 'drive'))
}

/** Open the OAuth flow to add an additional Gmail account. */
export const openAddGoogleGmailScreen = (
  primaryEmail: string,
): void => {
  setPendingAddAccountFlow(primaryEmail, 'gmail')
  const scope = 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email'
  openGoogleAuthScreen(scope, buildAddAccountState(primaryEmail, 'gmail'))
}
