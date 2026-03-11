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

// Token cost budget settings
export const KN_DAILY_BUDGET = 'kn_daily_budget'
export const KN_MONTHLY_BUDGET = 'kn_monthly_budget'
export const KN_BUDGET_WARNING_PERCENT = 'kn_budget_warning_percent'
export const KN_MODEL_ROUTING_ENABLED = 'kn_model_routing_enabled'

export type BudgetSettings = {
  dailyBudget: number
  monthlyBudget: number
  warningPercent: number
}

export const getBudgetSettings = async (): Promise<BudgetSettings> => {
  const daily = await KNLocalStorage.getItem(KN_DAILY_BUDGET)
  const monthly = await KNLocalStorage.getItem(KN_MONTHLY_BUDGET)
  const warning = await KNLocalStorage.getItem(KN_BUDGET_WARNING_PERCENT)
  return {
    dailyBudget: daily ?? 5,
    monthlyBudget: monthly ?? 200,
    warningPercent: warning ?? 75,
  }
}

export const setBudgetSettings = async (settings: BudgetSettings) => {
  await KNLocalStorage.setItem(KN_DAILY_BUDGET, settings.dailyBudget)
  await KNLocalStorage.setItem(KN_MONTHLY_BUDGET, settings.monthlyBudget)
  await KNLocalStorage.setItem(KN_BUDGET_WARNING_PERCENT, settings.warningPercent)
}

// Background notifications settings
export const KN_BACKGROUND_NOTIFICATIONS_ENABLED = 'kn_background_notifications_enabled'
export const KN_BACKGROUND_NOTIFICATIONS_LAST_RUN = 'kn_background_notifications_last_run'
export const KN_POST_MEETING_FOLLOWUP_ENABLED = 'kn_post_meeting_followup_enabled'
export const KN_BACKGROUND_NOTIFICATION_HOURS = 'kn_background_notification_hours'

export const getBackgroundNotificationsEnabled = async (): Promise<boolean> => {
  const value = await KNLocalStorage.getItem(KN_BACKGROUND_NOTIFICATIONS_ENABLED)
  return value !== false // enabled by default
}

export const setBackgroundNotificationsEnabled = async (enabled: boolean) => {
  await KNLocalStorage.setItem(KN_BACKGROUND_NOTIFICATIONS_ENABLED, enabled)
}

export const getBackgroundNotificationHours = async (): Promise<number[]> => {
  const value = await KNLocalStorage.getItem(KN_BACKGROUND_NOTIFICATION_HOURS)
  return value ?? [9, 14] // default: 9 AM and 2 PM
}

export const setBackgroundNotificationHours = async (hours: number[]) => {
  await KNLocalStorage.setItem(KN_BACKGROUND_NOTIFICATION_HOURS, hours)
}

export const getBackgroundNotificationsLastRun = async (): Promise<string | null> => {
  return await KNLocalStorage.getItem(KN_BACKGROUND_NOTIFICATIONS_LAST_RUN)
}

export const setBackgroundNotificationsLastRun = async (timestamp: string) => {
  await KNLocalStorage.setItem(KN_BACKGROUND_NOTIFICATIONS_LAST_RUN, timestamp)
}

export const getPostMeetingFollowupEnabled = async (): Promise<boolean> => {
  const value = await KNLocalStorage.getItem(KN_POST_MEETING_FOLLOWUP_ENABLED)
  return value !== false // enabled by default
}

export const setPostMeetingFollowupEnabled = async (enabled: boolean) => {
  await KNLocalStorage.setItem(KN_POST_MEETING_FOLLOWUP_ENABLED, enabled)
}

// Developer mode settings
export const KN_DEVELOPER_MODE_ENABLED = 'kn_developer_mode_enabled'
export const KN_DEVELOPER_MODE_AUTOSCAN = 'kn_dev_mode_autoscan'
export const KN_DEVELOPER_MODE_SCAN_INTERVAL = 'kn_dev_mode_scan_interval'

export const getDeveloperModeEnabled = async (): Promise<boolean> => {
  const value = await KNLocalStorage.getItem(KN_DEVELOPER_MODE_ENABLED)
  return value === true
}

export const setDeveloperModeEnabled = async (enabled: boolean) => {
  await KNLocalStorage.setItem(KN_DEVELOPER_MODE_ENABLED, enabled)
}

// Model routing: use cheaper models for simple tasks
export const getModelRoutingEnabled = async (): Promise<boolean> => {
  const value = await KNLocalStorage.getItem(KN_MODEL_ROUTING_ENABLED)
  return value ?? false
}

export const setModelRoutingEnabled = async (enabled: boolean) => {
  await KNLocalStorage.setItem(KN_MODEL_ROUTING_ENABLED, enabled)
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
