import { open } from '@tauri-apps/api/shell'

import { GOOGLE_OAUTH2_AUTH_URL, KN_API_GOOGLE_SIGNIN_REDIRECT } from '../constants'
import { logError } from '../errorHandling'

export const openGoogleAuthScreen = (scope: string) => {
  const params = {
    response_type: 'code',
    redirect_uri: KN_API_GOOGLE_SIGNIN_REDIRECT,
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    access_type: 'offline',
    scope,
    prompt: 'consent',
  }
  const queryParams = Object.entries(params).reduce(
    (result, [key, value]) => `${result}&${key}=${value}`,
    '',
  )

  try {
    open(`${GOOGLE_OAUTH2_AUTH_URL}?${queryParams}`)
  } catch (error: any) {
    logError(new Error('Error opening Google Auth screen:'), {
      additionalInfo: '',
      error: error.message,
    })
    console.error('Error opening Google Auth screen:', error)
    throw error
  }

}
