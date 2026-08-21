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
  type: 'workspace' | 'calendar' | 'drive' | 'gmail'
}

let _pendingAddAccountFlow: PendingAddAccountFlow | null = null
const ADD_ACCOUNT_STATE_PREFIX = 'knapsack_add_account'
const ADD_ACCOUNT_STORAGE_PREFIX = 'KN_GOOGLE_ADD_ACCOUNT_FLOW'

/** Store the primary user email and connection type before triggering an add-account OAuth flow. */
export const setPendingAddAccountFlow = (
  primaryEmail: string,
  type: PendingAddAccountFlow['type'],
): void => {
  _pendingAddAccountFlow = { primaryEmail, type }
}

/** Consume (read + clear) the pending add-account flow state. */
export const consumePendingAddAccountFlow = (): PendingAddAccountFlow | null => {
  const flow = _pendingAddAccountFlow
  _pendingAddAccountFlow = null
  return flow
}

const createAddAccountNonce = (): string => {
  const bytes = new Uint8Array(16)
  window.crypto?.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

const addAccountStorageKey = (nonce: string) => `${ADD_ACCOUNT_STORAGE_PREFIX}:${nonce}`

const buildAddAccountState = (primaryEmail: string, type: PendingAddAccountFlow['type']) => {
  const nonce = createAddAccountNonce()
  window.sessionStorage.setItem(addAccountStorageKey(nonce), JSON.stringify({ primaryEmail, type }))
  return `${ADD_ACCOUNT_STATE_PREFIX}:${type}:${nonce}`
}

export const parsePendingAddAccountState = (
  state?: string | null,
): PendingAddAccountFlow | null => {
  if (!state?.startsWith(`${ADD_ACCOUNT_STATE_PREFIX}:`)) {
    return null
  }

  const [, type, value] = state.split(':')
  if (
    (type !== 'workspace' && type !== 'calendar' && type !== 'drive' && type !== 'gmail') ||
    !value
  ) {
    return null
  }

  const storedFlow = window.sessionStorage.getItem(addAccountStorageKey(value))
  if (storedFlow) {
    window.sessionStorage.removeItem(addAccountStorageKey(value))
    try {
      const parsed = JSON.parse(storedFlow) as PendingAddAccountFlow
      if (parsed.primaryEmail && parsed.type === type) {
        return parsed
      }
    } catch {
      return null
    }
  }

  // Backward-compatible parser for any in-flight links opened by builds that
  // encoded the primary email directly in state.
  try {
    return {
      primaryEmail: decodeURIComponent(value),
      type,
    }
  } catch {
    return null
  }
}

/**
 * Add another Google account with the complete native Desktop integration.
 * Gmail, Calendar, and Drive are granted together so the account appears
 * consistently across all three services and remains active alongside every
 * previously connected account.
 */
export const openAddGoogleWorkspaceScreen = (primaryEmail: string): void => {
  setPendingAddAccountFlow(primaryEmail, 'workspace')
  const scope = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ')
  openGoogleAuthScreen(scope, buildAddAccountState(primaryEmail, 'workspace'))
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
      'Google OAuth client ID is not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file.',
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
    prompt: 'select_account consent',
  })
  if (state) {
    params.set('state', state)
  }

  const fullUrl = `${GOOGLE_OAUTH2_AUTH_URL}?${params.toString()}`
  console.log('[Google OAuth] Opening URL:', fullUrl)
  console.log('[Google OAuth] redirect_uri:', KN_API_GOOGLE_SIGNIN_REDIRECT)

  const openInBrowser = () => {
    const popup = window.open(fullUrl, '_blank', 'noopener,noreferrer')
    if (!popup) {
      throw new GoogleAuthError('Unable to open Google Auth screen.')
    }
  }

  const logOpenError = (error: any, additionalInfo = '') => {
    logError(new Error('Error opening Google Auth screen:'), {
      additionalInfo,
      error: error.message,
    })
    console.error('Error opening Google Auth screen:', error)
  }

  try {
    void open(fullUrl).catch((error: any) => {
      logError(new Error('Error opening Google Auth screen with Tauri shell:'), {
        additionalInfo: 'Falling back to window.open',
        error: error.message,
      })
      try {
        openInBrowser()
      } catch (fallbackError: any) {
        logOpenError(fallbackError, 'Tauri shell open failed; window.open fallback also failed')
      }
    })
  } catch (error: any) {
    try {
      openInBrowser()
    } catch (fallbackError: any) {
      logOpenError(fallbackError, error.message)
      throw fallbackError
    }
  }
}

/** Open the OAuth flow to add an additional Google Calendar account. */
export const openAddGoogleCalendarScreen = (primaryEmail: string, calendarScope: string): void => {
  setPendingAddAccountFlow(primaryEmail, 'calendar')
  // userinfo.email is required so the backend can identify which Google account
  // was just authorized and store it as the calendar_account_email.
  const scopeWithEmail = `${calendarScope} https://www.googleapis.com/auth/userinfo.email`
  openGoogleAuthScreen(scopeWithEmail, buildAddAccountState(primaryEmail, 'calendar'))
}

/** Open the OAuth flow to add an additional Google Drive account. */
export const openAddGoogleDriveScreen = (primaryEmail: string): void => {
  setPendingAddAccountFlow(primaryEmail, 'drive')
  const scope =
    'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email'
  openGoogleAuthScreen(scope, buildAddAccountState(primaryEmail, 'drive'))
}

/** Open the OAuth flow to add an additional Gmail account. */
export const openAddGoogleGmailScreen = (primaryEmail: string): void => {
  setPendingAddAccountFlow(primaryEmail, 'gmail')
  const scope =
    'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email'
  openGoogleAuthScreen(scope, buildAddAccountState(primaryEmail, 'gmail'))
}
