import { getVersion } from '@tauri-apps/api/app'
import { readTextFile } from '@tauri-apps/api/fs'
import { platform, version } from '@tauri-apps/api/os'
import { resolve } from '@tauri-apps/api/path'

export const getAppVersion = async (): Promise<string> => {
  try {
    return await getVersion()
  } catch (error) {
    try {
      const packageJsonPath = await resolve('package.json')
      const packageJsonContent = await readTextFile(packageJsonPath)
      const { version } = JSON.parse(packageJsonContent)

      console.warn('Fallback: Retrieved version from package.json')
      return version
    } catch (fallbackError) {
      console.error('Failed to retrieve app version', {
        originalError: error,
        fallbackError,
      })
      return 'unknown'
    }
  }
}

export const getOSInfoString = async () => {
  const platformName = await platform() // OS version (e.g., '20.4.0' for macOS, or '10.0.19042' for Windows)
  const versionName = await version() // OS version (e.g., '20.4.0' for macOS, or '10.0.19042' for Windows)
  return platformName + '-' + versionName
}
