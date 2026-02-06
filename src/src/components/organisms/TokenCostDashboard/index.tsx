import { useCallback, useEffect, useState } from 'react'
import {
  Typography,
  TypographyWeight,
} from 'src/components/atoms/typography'
import {
  KN_API_TOKEN_USAGE_SUMMARY,
  KN_API_TOKEN_USAGE_DAILY,
  KN_API_TOKEN_USAGE_BUDGET,
} from 'src/utils/constants'
import {
  getBudgetSettings,
  setBudgetSettings,
  BudgetSettings,
  getModelRoutingEnabled,
  setModelRoutingEnabled,
} from 'src/utils/settings'

type UsageSummary = {
  provider: string
  model: string
  totalInputTokens: number
  totalOutputTokens: number
  totalCostUsd: number
  requestCount: number
}

type DailyUsage = {
  date: string
  totalInputTokens: number
  totalOutputTokens: number
  totalCostUsd: number
  requestCount: number
}

type SummaryResponse = {
  success: boolean
  days: number
  totalCostUsd: number
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  byModel: UsageSummary[]
}

type DailyResponse = {
  success: boolean
  daily: DailyUsage[]
}

type BudgetStatusResponse = {
  success: boolean
  dailyCostUsd: number
  monthlyCostUsd: number
}

const formatCost = (cost: number): string => {
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  if (cost < 1) return `$${cost.toFixed(3)}`
  return `$${cost.toFixed(2)}`
}

const formatTokens = (tokens: number): string => {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`
  return tokens.toString()
}

type TokenCostDashboardProps = {
  onBudgetWarning?: (message: string) => void
}

export const TokenCostDashboard = ({ onBudgetWarning }: TokenCostDashboardProps) => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [daily, setDaily] = useState<DailyUsage[]>([])
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatusResponse | null>(null)
  const [budgetSettings, setBudgetSettingsState] = useState<BudgetSettings>({
    dailyBudget: 5,
    monthlyBudget: 200,
    warningPercent: 75,
  })
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [editDailyBudget, setEditDailyBudget] = useState('5')
  const [editMonthlyBudget, setEditMonthlyBudget] = useState('200')
  const [modelRoutingEnabled, setModelRoutingEnabledState] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, dailyRes, budgetRes] = await Promise.all([
        fetch(`${KN_API_TOKEN_USAGE_SUMMARY}?days=30`),
        fetch(`${KN_API_TOKEN_USAGE_DAILY}?days=30`),
        fetch(KN_API_TOKEN_USAGE_BUDGET),
      ])

      if (summaryRes.ok) {
        const data: SummaryResponse = await summaryRes.json()
        if (data.success) setSummary(data)
      }
      if (dailyRes.ok) {
        const data: DailyResponse = await dailyRes.json()
        if (data.success) setDaily(data.daily)
      }
      if (budgetRes.ok) {
        const data: BudgetStatusResponse = await budgetRes.json()
        if (data.success) setBudgetStatus(data)
      }
    } catch (e) {
      console.error('Failed to fetch token usage data:', e)
    }
  }, [])

  useEffect(() => {
    fetchData()
    getBudgetSettings().then(settings => {
      setBudgetSettingsState(settings)
      setEditDailyBudget(settings.dailyBudget.toString())
      setEditMonthlyBudget(settings.monthlyBudget.toString())
    })
    getModelRoutingEnabled().then(setModelRoutingEnabledState)
  }, [fetchData])

  // Check budget warnings
  useEffect(() => {
    if (!budgetStatus || !onBudgetWarning) return
    const threshold = budgetSettings.warningPercent / 100

    if (budgetStatus.dailyCostUsd >= budgetSettings.dailyBudget * threshold) {
      const pct = Math.round((budgetStatus.dailyCostUsd / budgetSettings.dailyBudget) * 100)
      onBudgetWarning(
        `Daily token spend at ${pct}% of budget (${formatCost(budgetStatus.dailyCostUsd)} / ${formatCost(budgetSettings.dailyBudget)})`
      )
    }
    if (budgetStatus.monthlyCostUsd >= budgetSettings.monthlyBudget * threshold) {
      const pct = Math.round((budgetStatus.monthlyCostUsd / budgetSettings.monthlyBudget) * 100)
      onBudgetWarning(
        `Monthly token spend at ${pct}% of budget (${formatCost(budgetStatus.monthlyCostUsd)} / ${formatCost(budgetSettings.monthlyBudget)})`
      )
    }
  }, [budgetStatus, budgetSettings, onBudgetWarning])

  const handleSaveBudget = async () => {
    const newSettings: BudgetSettings = {
      dailyBudget: parseFloat(editDailyBudget) || 5,
      monthlyBudget: parseFloat(editMonthlyBudget) || 200,
      warningPercent: budgetSettings.warningPercent,
    }
    await setBudgetSettings(newSettings)
    setBudgetSettingsState(newSettings)
    setIsEditingBudget(false)
  }

  const maxDailyCost = daily.length > 0 ? Math.max(...daily.map(d => d.totalCostUsd), 0.01) : 1

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50">
          <Typography className="text-zinc-500 text-xs">Today</Typography>
          <Typography weight={TypographyWeight.medium} className="text-lg">
            {budgetStatus ? formatCost(budgetStatus.dailyCostUsd) : '--'}
          </Typography>
          <Typography className="text-zinc-400 text-xs">
            of {formatCost(budgetSettings.dailyBudget)} budget
          </Typography>
        </div>
        <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50">
          <Typography className="text-zinc-500 text-xs">This Month</Typography>
          <Typography weight={TypographyWeight.medium} className="text-lg">
            {budgetStatus ? formatCost(budgetStatus.monthlyCostUsd) : '--'}
          </Typography>
          <Typography className="text-zinc-400 text-xs">
            of {formatCost(budgetSettings.monthlyBudget)} budget
          </Typography>
        </div>
        <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50">
          <Typography className="text-zinc-500 text-xs">30-Day Requests</Typography>
          <Typography weight={TypographyWeight.medium} className="text-lg">
            {summary ? summary.totalRequests.toLocaleString() : '--'}
          </Typography>
          <Typography className="text-zinc-400 text-xs">
            {summary ? formatTokens(summary.totalInputTokens + summary.totalOutputTokens) : '--'} tokens
          </Typography>
        </div>
      </div>

      {/* Budget Progress Bars */}
      {budgetStatus && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <Typography className="text-zinc-500">Daily Budget</Typography>
              <Typography className="text-zinc-500">
                {formatCost(budgetStatus.dailyCostUsd)} / {formatCost(budgetSettings.dailyBudget)}
              </Typography>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((budgetStatus.dailyCostUsd / budgetSettings.dailyBudget) * 100, 100)}%`,
                  backgroundColor:
                    budgetStatus.dailyCostUsd / budgetSettings.dailyBudget > 0.9
                      ? '#ef4444'
                      : budgetStatus.dailyCostUsd / budgetSettings.dailyBudget > 0.75
                        ? '#f59e0b'
                        : '#22c55e',
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <Typography className="text-zinc-500">Monthly Budget</Typography>
              <Typography className="text-zinc-500">
                {formatCost(budgetStatus.monthlyCostUsd)} / {formatCost(budgetSettings.monthlyBudget)}
              </Typography>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((budgetStatus.monthlyCostUsd / budgetSettings.monthlyBudget) * 100, 100)}%`,
                  backgroundColor:
                    budgetStatus.monthlyCostUsd / budgetSettings.monthlyBudget > 0.9
                      ? '#ef4444'
                      : budgetStatus.monthlyCostUsd / budgetSettings.monthlyBudget > 0.75
                        ? '#f59e0b'
                        : '#22c55e',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Daily Spend Chart (simple bar chart) */}
      {daily.length > 0 && (
        <div className="flex flex-col gap-2">
          <Typography weight={TypographyWeight.medium} className="text-sm">
            Daily Spend (30 days)
          </Typography>
          <div className="flex items-end gap-[2px] h-[60px]">
            {daily.map((d, i) => (
              <div
                key={d.date}
                className="flex-1 bg-blue-400 rounded-t-sm hover:bg-blue-500 transition-colors cursor-default"
                style={{
                  height: `${Math.max((d.totalCostUsd / maxDailyCost) * 100, 2)}%`,
                }}
                title={`${d.date}: ${formatCost(d.totalCostUsd)} (${d.requestCount} requests)`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{daily[0]?.date?.slice(5)}</span>
            <span>{daily[daily.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>
      )}

      {/* Cost by Model */}
      {summary && summary.byModel.length > 0 && (
        <div className="flex flex-col gap-2">
          <Typography weight={TypographyWeight.medium} className="text-sm">
            Cost by Model (30 days)
          </Typography>
          <div className="flex flex-col gap-1">
            {summary.byModel.map(m => (
              <div key={`${m.provider}-${m.model}`} className="flex justify-between text-xs py-1 border-b border-zinc-100">
                <div className="flex gap-2">
                  <span className="text-zinc-500 font-medium">{m.provider}</span>
                  <span className="text-zinc-400">{m.model}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-zinc-400">{m.requestCount} reqs</span>
                  <span className="text-zinc-600 font-medium">{formatCost(m.totalCostUsd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Settings */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Typography weight={TypographyWeight.medium} className="text-sm">
            Budget Limits
          </Typography>
          {!isEditingBudget ? (
            <Typography
              className="cursor-pointer text-blue-500 text-xs"
              onClick={() => setIsEditingBudget(true)}
            >
              Edit
            </Typography>
          ) : (
            <div className="flex gap-2">
              <Typography
                className="cursor-pointer text-zinc-400 text-xs"
                onClick={() => setIsEditingBudget(false)}
              >
                Cancel
              </Typography>
              <Typography
                className="cursor-pointer text-blue-500 text-xs"
                onClick={handleSaveBudget}
              >
                Save
              </Typography>
            </div>
          )}
        </div>
        {isEditingBudget ? (
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-zinc-500">Daily ($)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={editDailyBudget}
                onChange={e => setEditDailyBudget(e.target.value)}
                className="border border-zinc-200 rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-zinc-500">Monthly ($)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={editMonthlyBudget}
                onChange={e => setEditMonthlyBudget(e.target.value)}
                className="border border-zinc-200 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="flex gap-4 text-xs">
            <span className="text-zinc-500">
              Daily: <span className="font-medium text-zinc-700">{formatCost(budgetSettings.dailyBudget)}</span>
            </span>
            <span className="text-zinc-500">
              Monthly: <span className="font-medium text-zinc-700">{formatCost(budgetSettings.monthlyBudget)}</span>
            </span>
            <span className="text-zinc-500">
              Warning at: <span className="font-medium text-zinc-700">{budgetSettings.warningPercent}%</span>
            </span>
          </div>
        )}
      </div>

      {/* Model Routing */}
      <div className="flex flex-col gap-2">
        <Typography weight={TypographyWeight.medium} className="text-sm">
          Smart Model Routing
        </Typography>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Typography className="text-xs text-zinc-600">
              Use cheaper models for simple tasks (Haiku for routine, Sonnet for complex)
            </Typography>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={modelRoutingEnabled}
              onChange={async () => {
                const newValue = !modelRoutingEnabled
                setModelRoutingEnabledState(newValue)
                await setModelRoutingEnabled(newValue)
              }}
            />
            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>

      {/* No data message */}
      {summary && summary.totalRequests === 0 && (
        <div className="text-center py-4">
          <Typography className="text-zinc-400 text-sm">
            No token usage recorded yet. Costs will appear here after your first AI request.
          </Typography>
        </div>
      )}
    </div>
  )
}
