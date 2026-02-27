import { useCallback, useEffect, useRef, useState } from 'react'

import { getVersion } from '@tauri-apps/api/app'
import { fetch as tauriFetch, ResponseType } from '@tauri-apps/api/http'

const GITHUB_OWNER = 'knap-ai'
const GITHUB_REPO = 'knapsack_desktop'
const CHECK_INTERVAL_MS = 60 * 60 * 1000 // 1 hour
const DISMISSED_KEY = 'auto_updater_dismissed_version'

interface GitHubRelease {
  tag_name: string
  name: string
  html_url: string
  body: string
  prerelease: boolean
  draft: boolean
  published_at: string
  assets: Array<{
    name: string
    browser_download_url: string
  }>
}

export interface UpdateInfo {
  version: string
  releaseUrl: string
  releaseName: string
  releaseNotes: string
  publishedAt: string
  assets: Array<{
    name: string
    downloadUrl: string
  }>
}

/**
 * Compare two semver strings. Returns:
 *  1 if a > b, -1 if a < b, 0 if equal.
 */
function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(Number)
  const pb = b.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

export function useAutoUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null)
  const [checking, setChecking] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkForUpdate = useCallback(async () => {
    try {
      setChecking(true)
      const currentVersion = await getVersion()

      const response = await tauriFetch<GitHubRelease[]>(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
          responseType: ResponseType.JSON,
        },
      )

      if (!response.ok || !Array.isArray(response.data)) {
        console.warn('Auto-updater: failed to fetch releases', response.status)
        return
      }

      // Find the latest non-draft, non-prerelease release
      const latest = response.data.find(r => !r.draft && !r.prerelease)
      if (!latest) return

      const latestVersion = latest.tag_name.replace(/^v/, '')

      if (compareSemver(latestVersion, currentVersion) <= 0) {
        // Already up to date
        return
      }

      // Check if user has dismissed this specific version
      const dismissed = localStorage.getItem(DISMISSED_KEY)
      if (dismissed === latestVersion) {
        return
      }

      setUpdateAvailable({
        version: latestVersion,
        releaseUrl: latest.html_url,
        releaseName: latest.name || `v${latestVersion}`,
        releaseNotes: latest.body || '',
        publishedAt: latest.published_at,
        assets: latest.assets.map(a => ({
          name: a.name,
          downloadUrl: a.browser_download_url,
        })),
      })
    } catch (err) {
      console.warn('Auto-updater: error checking for updates', err)
    } finally {
      setChecking(false)
    }
  }, [])

  const dismissUpdate = useCallback(() => {
    if (updateAvailable) {
      localStorage.setItem(DISMISSED_KEY, updateAvailable.version)
    }
    setUpdateAvailable(null)
  }, [updateAvailable])

  useEffect(() => {
    // Check shortly after app start (5 second delay to avoid blocking startup)
    const timeout = setTimeout(() => {
      checkForUpdate()
    }, 5000)

    // Then check periodically
    intervalRef.current = setInterval(checkForUpdate, CHECK_INTERVAL_MS)

    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkForUpdate])

  return {
    updateAvailable,
    checking,
    checkForUpdate,
    dismissUpdate,
  }
}
