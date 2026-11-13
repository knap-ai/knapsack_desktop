export type AppUpdateInstallStep = () => Promise<void>

export type AppUpdateCheckResponse = {
  shouldUpdate: boolean
  manifest?: { version?: string | null } | null
}

export type AppUpdateCheckResult =
  | { status: 'up-to-date' }
  | { status: 'available'; version: string }

export function normalizeAppVersion(version: string | undefined | null): string {
  return String(version ?? '')
    .trim()
    .replace(/^v/i, '')
    .split('+')[0]
}

/**
 * Check-only updater seam. Tests and QA can inject a synthetic response here;
 * this function has no access to installUpdate or relaunch and therefore
 * cannot mutate the installed application.
 */
export async function checkAppUpdateStatus(
  currentVersion: string,
  check: () => Promise<AppUpdateCheckResponse>,
): Promise<AppUpdateCheckResult> {
  const { shouldUpdate, manifest } = await check()
  const targetVersion = normalizeAppVersion(manifest?.version)
  if (
    shouldUpdate &&
    manifest &&
    targetVersion &&
    targetVersion !== normalizeAppVersion(currentVersion)
  ) {
    return { status: 'available', version: targetVersion }
  }
  return { status: 'up-to-date' }
}

/**
 * Run the native updater to completion.
 *
 * The Tauri updater cannot be cancelled once it starts replacing an app. Keep
 * this sequence deliberately free of app-side timeouts so callers only relaunch
 * after the native install has actually completed.
 */
export async function installAppUpdate(
  prepare: AppUpdateInstallStep,
  install: AppUpdateInstallStep,
): Promise<void> {
  await prepare()
  await install()
}

/** Register before requesting installation, and settle setup failures honestly.
 * Do not time out or retry an installation: native replacement is not cancellable.
 */
export async function installNativeAppUpdate(
  subscribe: (handler: (event: { status: string; error?: string }) => void) => Promise<() => void>,
  request: () => Promise<void>,
): Promise<void> {
  let requested = false
  let complete!: () => void
  let fail!: (error: Error) => void
  const completion = new Promise<void>((resolve, reject) => { complete = resolve; fail = reject })
  // A native error may arrive while request() is still resolving.
  void completion.catch(() => {})
  const stop = await subscribe(event => {
    if (!requested) return
    if (event.error) fail(new Error(event.error))
    else if (event.status === 'DONE') complete()
  })
  try {
    requested = true
    await request()
    await completion
  } finally {
    stop()
  }
}
