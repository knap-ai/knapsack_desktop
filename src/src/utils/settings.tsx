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
