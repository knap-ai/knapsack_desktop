import { logError } from './errorHandling'
import { getResponseErrorCodeAndMessage } from './exceptions/base'

type RetryOptions = {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  timeout: number
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 100,
  maxDelay: 1000,
  timeout: 2000,
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

function shouldRetryError(error: Error): boolean {
  if (error instanceof HttpError) {
    if (error.status >= 400 && error.status < 500 && error.status !== 429 && error.status !== 408) {
      return false
    }
    return true
  }
  return true
}

export async function retryFetch(
  url: string,
  options: RequestInit,
  retryOptions: Partial<RetryOptions> = {},
): Promise<Response> {
  const { maxRetries, baseDelay, maxDelay, timeout } = { ...defaultOptions, ...retryOptions }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const { error_code, message } = await getResponseErrorCodeAndMessage(response)
        const errorMessage = `HTTP error! status: ${response.status} error_code: ${error_code} url: ${url} message: ${message}`
        throw new HttpError(response.status, errorMessage, error_code)
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (lastError.name === 'AbortError') {
        logError(lastError, { additionalInfo: 'Request timed out', error: lastError.message })
      } else {
        logError(lastError, {
          additionalInfo: '',
          error: lastError.message,
        })
      }

      if (attempt < maxRetries - 1 && shouldRetryError(lastError)) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        break
      }
    }
  }

  throw lastError || new Error('Max retries reached')
}
