import * as Sentry from '@sentry/react'
import { PROFILE_KEY } from 'src/hooks/auth/useAuth'

import { KNLocalStorage } from './KNLocalStorage'
import { pushFrontendLog } from './frontendLog'

export type ErrorInfo = {
  errorPath?: string
  additionalInfo?: string
  error?: string
}

function getErrorInfo(error: Error) {
  const stack = error.stack || ''
  const lines = stack.split('\n')
  const lastLine = lines[lines.length - 1] || ''

  const srcIndex = lastLine.lastIndexOf('/src')
  const srcPath = srcIndex !== -1 ? lastLine.slice(srcIndex) : 'unknown'

  return srcPath
}

export const logError = async (error: Error, context?: ErrorInfo, slackFlag?: boolean) => {
  if (context) {
    const errorPath = getErrorInfo(error)
    context.errorPath = errorPath
  }

  // Push to local in-memory buffer so the Activity Panel "App Errors" tab
  // can display it without requiring Sentry access.
  const detail = context ? JSON.stringify(context) : undefined
  pushFrontendLog('error', error.message, detail)

  const userUuid = await KNLocalStorage.getItem(PROFILE_KEY)

  if (typeof Sentry !== 'undefined') {
    Sentry.withScope(scope => {
      if (context?.errorPath) {
        scope.setTag('errorPath', context.errorPath)
      }
      if (slackFlag) {
        scope.setTag('slackNotification', 'true')
      } else {
        scope.setTag('slackNotification', 'false')
      }
      if (userUuid) {
        scope.setUser({ id: userUuid.uuid, email: userUuid.email })
      }
      Sentry.captureException(error, {
        extra: context,
      })
    })
  }
}
