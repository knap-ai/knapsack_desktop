import { invoke } from '@tauri-apps/api/tauri'

/**
 * Waits for the Tauri IPC bridge to be ready before attempting to invoke commands.
 * This prevents 'command not found' errors during app initialization race conditions.
 *
 * @param maxRetries Maximum number of retry attempts (default: 10)
 * @param retryDelay Delay between retries in milliseconds (default: 100ms)
 * @returns Promise that resolves when bridge is ready, rejects if max retries exceeded
 */
export async function waitForTauriIpcBridge(
  maxRetries: number = 10,
  retryDelay: number = 100
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
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay))
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
  maxRetries: number = 10
): Promise<T> {
  try {
    return await invoke<T>(command, args)
  } catch (error: any) {
    // If the error is 'command not found', wait for bridge and retry
    if (error?.toString().includes('not found')) {
      await waitForTauriIpcBridge(maxRetries)
      return await invoke<T>(command, args)
    }
    throw error
  }
}
