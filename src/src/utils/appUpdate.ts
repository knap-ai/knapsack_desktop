export type AppUpdateInstallStep = () => Promise<void>

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
