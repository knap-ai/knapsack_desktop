import { KNLocalStorage } from "./KNLocalStorage"

export const KN_SAVE_TRANSCRIPT = 'kn_save_transcript'
export const KN_NOTIFICATION_LEAD_TIME_MIN = 'kn_notification_lead_time_min'
export const SHARE_NOTES_KNAPSACK = 1 // 0001
export const SHARE_TRANSCRIPTS_KNAPSACK = 2 // 0010

export const shouldSaveTranscript = async () => {
  return (await KNLocalStorage.getItem(KN_SAVE_TRANSCRIPT)) !== false
}

export const setSaveTranscriptStore = (value: boolean) => {
  KNLocalStorage.setItem(KN_SAVE_TRANSCRIPT, value)
}

export const getNotificationLeadTimeMin = async () => {
  const value = await KNLocalStorage.getItem(KN_NOTIFICATION_LEAD_TIME_MIN)
  if (value) {
    return parseInt(await KNLocalStorage.getItem(KN_NOTIFICATION_LEAD_TIME_MIN))
  }

  return 1
}

export const getLocalhostValue = async (key: string) => {
  return await KNLocalStorage.getItem(key) || undefined
}

export const setNotificationLeadTimeMin = (value: number) => {
  KNLocalStorage.setItem(KN_NOTIFICATION_LEAD_TIME_MIN, value)
}

export const isSharingEnabled = (
  type: 'notes' | 'transcripts' = 'notes',
  target: 'knapsack' | 'org' = 'knapsack',
  sharingPermission: number = 0,
): boolean => {
  if (type === 'notes' && target === 'knapsack') {
    return Boolean(sharingPermission & SHARE_NOTES_KNAPSACK);
  }
  if (type === 'transcripts' && target === 'knapsack') {
    return Boolean(sharingPermission & SHARE_TRANSCRIPTS_KNAPSACK);
  }
  return false
}
