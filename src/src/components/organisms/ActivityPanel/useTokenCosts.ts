import { useCallback, useEffect, useRef, useState } from 'react'

import {
  KN_API_TOKEN_USAGE_BUDGET,
  KN_API_TOKEN_USAGE_RECENT,
  KN_API_TOKEN_USAGE_SUMMARY,
} from 'src/utils/constants'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'

export interface UsageSummary {
  totalCostUsd: number
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  byModel: {
    provider: string
    model: string
    requestCount: number
    totalInputTokens: number
    totalOutputTokens: number
    totalCostUsd: number
  }[]
}
export interface BudgetStatus {
  dailyCostUsd: number
  monthlyCostUsd: number
}
export const USAGE_TIMEOUT_MS = 8000

// Bound both headers and JSON parsing, even if a transport ignores cancellation.
async function usageRequest(url: string, signal: AbortSignal) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const abort = () => reject(new Error('Usage unavailable'))
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
    void (async () => {
      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error('Usage unavailable')
      const data = await response.json()
      if (data?.success !== true) throw new Error('Usage unavailable')
      return data
    })()
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', abort))
  })
}
const number = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
const row = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
const modelRow = (value: unknown) => {
  const v = row(value)
  return (
    !!v &&
    typeof v.provider === 'string' &&
    typeof v.model === 'string' &&
    [v.requestCount, v.totalInputTokens, v.totalOutputTokens, v.totalCostUsd].every(number)
  )
}
const usageRow = (value: unknown) => {
  const v = row(value)
  return (
    !!v &&
    typeof v.provider === 'string' &&
    typeof v.model === 'string' &&
    (v.requestType === undefined || typeof v.requestType === 'string') &&
    [v.id, v.inputTokens, v.outputTokens, v.costUsd, v.timestamp].every(number)
  )
}
export function useTokenCosts<T>() {
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [records, setRecords] = useState<T[] | null>(null)
  const [budget, setBudget] = useState<BudgetStatus | null>(null)
  const [days, setDays] = useState(30)
  const [revision, setRevision] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const scope = useRef(0)
  const refresh = useRef<() => void>(() => undefined)
  const fetchData = useCallback(() => refresh.current(), [])
  useEffect(() => {
    const invalidate = () => {
      ++scope.current
      setSummary(null)
      setRecords(null)
      setBudget(null)
      setRevision(value => value + 1)
    }
    window.addEventListener(PROFILE_CHANGED_EVENT, invalidate)
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, invalidate)
  }, [])
  useEffect(() => {
    let active = true
    const epoch = scope.current
    const current = () => active && scope.current === epoch
    let pending = false
    let controller: AbortController | undefined
    setSummary(null)
    setRecords(null)
    setBudget(null)
    const load = async () => {
      if (!current() || pending) return
      pending = true
      setIsLoading(true)
      setError('')
      controller = new AbortController()
      const signal = controller.signal
      const timer = setTimeout(() => controller?.abort(), USAGE_TIMEOUT_MS)
      const tasks = [
        usageRequest(`${KN_API_TOKEN_USAGE_SUMMARY}?days=${days}`, signal).then(data => {
          if (
            ![
              data.totalCostUsd,
              data.totalRequests,
              data.totalInputTokens,
              data.totalOutputTokens,
            ].every(number) ||
            !Array.isArray(data.byModel) ||
            !data.byModel.every(modelRow)
          )
            throw new Error('Invalid usage')
          if (current()) setSummary(data as unknown as UsageSummary)
        }),
        usageRequest(`${KN_API_TOKEN_USAGE_RECENT}?limit=100`, signal).then(data => {
          if (!Array.isArray(data.records) || !data.records.every(usageRow))
            throw new Error('Invalid usage')
          if (current()) setRecords(data.records as T[])
        }),
        usageRequest(KN_API_TOKEN_USAGE_BUDGET, signal).then(data => {
          if (!number(data.dailyCostUsd) || !number(data.monthlyCostUsd))
            throw new Error('Invalid usage')
          if (current()) setBudget(data as unknown as BudgetStatus)
        }),
      ]
      const results = await Promise.allSettled(tasks)
      clearTimeout(timer)
      pending = false
      if (!current()) return
      setIsLoading(false)
      if (results.some(result => result.status === 'rejected'))
        setError(
          'Some token usage could not be loaded. Refresh to try again. Previously loaded values may be out of date.',
        )
    }
    refresh.current = () => {
      void load()
    }
    void load()
    const interval = setInterval(() => {
      void load()
    }, 10000)
    return () => {
      active = false
      controller?.abort()
      clearInterval(interval)
      refresh.current = () => undefined
    }
  }, [days, revision])
  return { summary, records, budget, days, setDays, isLoading, error, fetchData }
}
