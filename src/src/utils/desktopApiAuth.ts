import { invoke } from '@tauri-apps/api/tauri'

const DESKTOP_API_HEADER = 'x-knapsack-api-token'
const DESKTOP_API_HOSTS = new Set(['127.0.0.1:8897', 'localhost:8897'])

let installed = false
let tokenPromise: Promise<string> | null = null

function getToken(): Promise<string> {
  tokenPromise ??= invoke<string>('get_desktop_api_token')
  return tokenPromise
}

function isDesktopApiRequest(input: RequestInfo | URL): boolean {
  const rawUrl = input instanceof Request ? input.url : String(input)
  try {
    return DESKTOP_API_HOSTS.has(new URL(rawUrl, window.location.href).host)
  } catch {
    return false
  }
}

/** Authenticate first-party requests to Knapsack's loopback API. */
export function installDesktopApiAuth(): void {
  if (installed) return
  installed = true

  const nativeFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    if (!isDesktopApiRequest(input)) return nativeFetch(input, init)

    const token = await getToken()
    const headers = new Headers(input instanceof Request ? input.headers : undefined)
    new Headers(init.headers).forEach((value, key) => headers.set(key, value))
    headers.set(DESKTOP_API_HEADER, token)

    if (input instanceof Request) {
      return nativeFetch(new Request(input, { ...init, headers }))
    }
    return nativeFetch(input, { ...init, headers })
  }
}
