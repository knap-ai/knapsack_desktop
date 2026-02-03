import { invoke } from '@tauri-apps/api/tauri'

import { KNLocalStorage } from '../KNLocalStorage'

export const KN_LOCAL_STORAGE_KEY_FILES_ENABLED: string = 'kn_has_files'

export const isFilesEnabled = async () =>
  await KNLocalStorage.getItem(KN_LOCAL_STORAGE_KEY_FILES_ENABLED) !== false

export const setIsFilesEnabled = (value: boolean) =>
  KNLocalStorage.setItem(KN_LOCAL_STORAGE_KEY_FILES_ENABLED, value)

export const getFilesPermissions = () => {
  setIsFilesEnabled(true)

  // TODO: this doesn't seem to work on Windows?
  const result = invoke('kn_trigger_file_read_permissions')
    .then(
      (ret: unknown) => {
        return (ret as { success?: boolean })?.success &&
        (ret as { permissions?: { Documents?: boolean } })?.permissions?.Documents === true &&
        (ret as { permissions?: { Downloads?: boolean } })?.permissions?.Downloads === true &&
        (ret as { permissions?: { Desktop?: boolean } })?.permissions?.Desktop === true
      }
    )
    .catch(() => false)
  return result
}
