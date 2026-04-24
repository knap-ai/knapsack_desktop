import { invoke } from '@tauri-apps/api/tauri'

/**
 * Waits for the Tauri IPC bridge to be ready before attempting to invoke commands.
 * This prevents 'command not found' errors during app initialization race conditions.
 *
 * @param maxRetries Maximum number of retry attempts (default: 20)
 * @param retryDelay Delay between retries in milliseconds (default: 150ms)
 * @returns Promise that resolves when bridge is ready, rejects if max retries exceeded
 */
export async function waitForTauriIpcBridge(
  maxRetries: number = 20,
  retryDelay: number = 150
): Promise<void> {
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      // Try to invoke a lightweight command to check if the bridge is ready
      // kn_get_or_generate_uuid is a simple command that should always be available
      await invoke('kn_get_or_generate_uuid')
      return // Bridge is ready
    } catch (error) {
      attempts++
      if (attempts >= maxRetries) {
        throw new Error(
          `Tauri IPC bridge not ready after ${maxRetries} attempts. Last error: ${error}`
        )
      }
      // Wait before retrying with exponential backoff
      const delay = retryDelay * Math.min(attempts, 3)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Safely invokes a Tauri command with automatic retry if the bridge is not ready.
 * This is a wrapper around invoke() that handles initialization race conditions.
 *
 * @param command The Tauri command to invoke
 * @param args Arguments to pass to the command
 * @param maxRetries Maximum number of retry attempts for bridge readiness
 * @returns Promise resolving to the command result
 */
export async function safeInvoke<T>(
  command: string,
  args?: Record<string, unknown>,
  maxRetries: number = 20
): Promise<T> {
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      return await invoke<T>(command, args)
    } catch (error: any) {
      const errorStr = error?.toString() || ''
      const isNotFoundError = errorStr.includes('not found') || errorStr.includes('command')

      if (isNotFoundError && attempts < maxRetries - 1) {
        attempts++
        // Exponential backoff: 150ms, 300ms, 450ms, then 450ms for remaining attempts
        const delay = 150 * Math.min(attempts, 3)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      // If not a 'not found' error, or we've exhausted retries, throw
      throw error
    }
  }

  throw new Error(`Failed to invoke command '${command}' after ${maxRetries} attempts`)
}
