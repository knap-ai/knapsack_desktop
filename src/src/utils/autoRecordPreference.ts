import { KNLocalStorage } from './KNLocalStorage'

export const AUTO_RECORD_MEETINGS = 'KN_AUTO_RECORD_MEETINGS'
let saving = 0
let failedSave = false
let mutation = 0
let preferenceWrites: Promise<void> = Promise.resolve()
/** Device-local preference; absent means product default, malformed/read failure means no capture. */
export async function canAutomaticallyRecord(): Promise<boolean> {
  const originMutation = mutation
  try {
    if (saving || failedSave) return false
    if (!(await KNLocalStorage.defaultsAreReadable())) return false
    const value = await KNLocalStorage.getItem(AUTO_RECORD_MEETINGS)
    return (
      !saving && !failedSave && originMutation === mutation && (value === null || value === true)
    )
  } catch {
    return false
  }
}
export function setAutoRecordPreference(enabled: boolean): Promise<void> {
  saving += 1
  const pending = preferenceWrites.catch(() => {}).then(() => persistPreference(enabled))
  preferenceWrites = pending
  return pending
}
async function persistPreference(enabled: boolean): Promise<void> {
  const operation = ++mutation
  let previous: unknown
  let loaded = false
  try {
    previous = await KNLocalStorage.getItem(AUTO_RECORD_MEETINGS)
    loaded = true
    await KNLocalStorage.setItem(AUTO_RECORD_MEETINGS, enabled)
    if (operation === mutation) failedSave = false
    window.dispatchEvent(new Event('auto-record-preference-changed'))
  } catch (error) {
    if (operation === mutation) {
      failedSave = true
      // Restore the previous admission value in memory and queue its durable
      // snapshot. Keep capture blocked even if that rollback also cannot save.
      if (loaded)
        await KNLocalStorage.setItem(AUTO_RECORD_MEETINGS, previous ?? undefined).catch(() => {})
    }
    throw error
  } finally {
    saving -= 1
  }
}
