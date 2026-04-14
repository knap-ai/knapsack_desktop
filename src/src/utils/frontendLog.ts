/** In-memory frontend error/event log buffer.
 *
 *  Errors captured via logError() are pushed here so they can be surfaced
 *  in the Activity Panel "App Errors" tab without needing Sentry access.
 *  The buffer is capped at MAX_ENTRIES to avoid unbounded memory growth.
 */

const MAX_ENTRIES = 300

export type FrontendLogLevel = 'error' | 'warn' | 'info'

export interface FrontendLogEntry {
  id: number
  timestamp: Date
  level: FrontendLogLevel
  message: string
  /** Serialised ErrorInfo context or any additional detail string. */
  detail?: string
}

let _nextId = 0
const _buffer: FrontendLogEntry[] = []

export function pushFrontendLog(
  level: FrontendLogLevel,
  message: string,
  detail?: string,
): void {
  _buffer.push({ id: _nextId++, timestamp: new Date(), level, message, detail })
  if (_buffer.length > MAX_ENTRIES) _buffer.shift()
}

/** Returns a shallow copy of the buffer (newest-last order). */
export function getFrontendLogs(): FrontendLogEntry[] {
  return [..._buffer]
}

export function clearFrontendLogs(): void {
  _buffer.length = 0
}
