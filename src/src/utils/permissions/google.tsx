import { open } from '@tauri-apps/api/shell'

import { GOOGLE_OAUTH2_AUTH_URL, KN_API_GOOGLE_SIGNIN_REDIRECT } from '../constants'
import { logError } from '../errorHandling'

export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GoogleAuthError'
  }
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

  // window.open with _blank causes Tauri/WebView2 to route to the system browser,
  // which avoids Google blocking OAuth inside embedded webviews.
  const popup = window.open(fullUrl, '_blank', 'noopener,noreferrer')
  if (!popup) {
    // Fallback for environments where window.open is blocked
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
