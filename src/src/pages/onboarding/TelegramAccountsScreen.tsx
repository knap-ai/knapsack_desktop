import { useCallback, useEffect, useRef, useState } from 'react'

import { open as openUrl } from '@tauri-apps/api/shell'
import cn from 'classnames'

import {
  getAgentBotDeepLink,
  getAgentBotStatuses,
  provisionAgentBot,
} from 'src/api/channels'

import styles from './styles.module.scss'

// ── Types ────────────────────────────────────────────────────

/** idle → awaiting_telegram (deeplink opened, polling) → done | error */
type BotPhase = 'idle' | 'awaiting_telegram' | 'done' | 'skipped' | 'error'

interface BotState {
  phase: BotPhase
  username: string   // filled on success
  errorMessage: string
}

function defaultBotState(): BotState {
  return { phase: 'idle', username: '', errorMessage: '' }
}

export interface AgentTelegramEntry {
  agentId: string
  name: string
  emoji: string
}

export type TelegramAccountsScreenProps = {
  index: number
  currentSlideInScreen?: number
  currentSlideOutScreen?: number
  /** Dynamic list of agents chosen in the prior screen — no hardcoded names. */
  agents: AgentTelegramEntry[]
  /** Derived from the user's email/profile to generate unique bot usernames. */
  userSlug?: string
  onComplete: (index: number) => void
  onSkip: (index: number) => void
}

// ── Username helpers ─────────────────────────────────────────

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

/** Chief of Staff bot: knapsack_{userSlug}_bot */
function chiefUsername(userSlug: string) {
  return `knapsack_${toSlug(userSlug)}_bot`.slice(0, 32)
}

/** Per-agent bot: knapsack_{userSlug}_{agentSlug}_bot */
function agentUsername(userSlug: string, agentId: string) {
  return `knapsack_${toSlug(userSlug)}_${toSlug(agentId)}_bot`.slice(0, 32)
}

// ── Single card component ─────────────────────────────────────

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 120_000

function AgentBotCard({
  emoji,
  name,
  agentId,
  suggestedUsername,
  state,
  onChange,
}: {
  emoji: string
  name: string
  agentId: string
  suggestedUsername: string
  state: BotState
  onChange: (patch: Partial<BotState>) => void
}) {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollStartRef = useRef<number>(0)

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // Clean up on unmount
  useEffect(() => () => stopPolling(), [stopPolling])

  const startPolling = useCallback(() => {
    stopPolling()
    pollStartRef.current = Date.now()
    pollRef.current = setInterval(async () => {
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
        stopPolling()
        onChange({
          phase: 'error',
          errorMessage: 'Timed out waiting — make sure you completed bot creation in Telegram.',
        })
        return
      }
      try {
        const resp = await provisionAgentBot(agentId, name, suggestedUsername)
        if (resp.success && resp.username) {
          stopPolling()
          onChange({ phase: 'done', username: resp.username })
        }
        // Not ready yet — keep polling silently
      } catch {
        // Network hiccup — keep polling
      }
    }, POLL_INTERVAL_MS)
  }, [agentId, name, suggestedUsername, onChange, stopPolling])

  const handleSetUp = async () => {
    onChange({ phase: 'awaiting_telegram', errorMessage: '' })
    try {
      const resp = await getAgentBotDeepLink(suggestedUsername, `${name} (Knapsack)`)
      // Use the https://t.me/newbot/{manager}/{suggested} URL — this opens the browser which
      // shows an "Open in Telegram" button that correctly triggers the managed bot creation flow.
      // tg://newbot is not a registered Telegram URL scheme and only opens BotFather without context.
      const url = resp.web_deeplink ?? `https://t.me/BotFather`
      await openUrl(url)
    } catch {
      // If the API call fails, keep polling — user may open Telegram manually
    }
    startPolling()
  }

  const isDone = state.phase === 'done'
  const isWaiting = state.phase === 'awaiting_telegram'
  const isSkipped = state.phase === 'skipped'

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        isDone && 'border-green-400 bg-green-50',
        isSkipped && 'opacity-50 border-gray-200 bg-white',
        !isDone && !isSkipped && 'border-gray-200 bg-white',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-InterTight">{name}</p>
            <p className="text-xs text-gray-400 font-InterTight font-mono">@{suggestedUsername}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDone && (
            <span className="text-green-600 text-xs font-medium font-InterTight flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              @{state.username}
            </span>
          )}

          {state.phase === 'idle' && (
            <button
              onClick={handleSetUp}
              className="text-sm text-[#913631] font-medium hover:underline font-InterTight whitespace-nowrap"
            >
              Set up →
            </button>
          )}

          {isWaiting && (
            <span className="text-xs text-gray-400 font-InterTight animate-pulse">
              Waiting for Telegram…
            </span>
          )}

          {(isWaiting || state.phase === 'error') && !isSkipped && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight ml-2"
              onClick={() => { stopPolling(); onChange({ phase: 'skipped' }) }}
            >
              Skip
            </button>
          )}

          {isSkipped && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight"
              onClick={() => onChange({ phase: 'idle', errorMessage: '' })}
            >
              Undo
            </button>
          )}
        </div>
      </div>

      {state.phase === 'error' && (
        <div className="mt-2 flex items-center gap-3">
          <p className="text-xs text-red-500 font-InterTight flex-1">{state.errorMessage}</p>
          <button
            className="text-xs text-[#913631] underline font-InterTight whitespace-nowrap"
            onClick={handleSetUp}
          >
            Retry →
          </button>
        </div>
      )}

      {isWaiting && (
        <p className="mt-2 text-xs text-gray-400 font-InterTight">
          Complete bot creation in Telegram — this will update automatically.
        </p>
      )}
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────

export function TelegramAccountsScreen({
  index,
  currentSlideInScreen,
  currentSlideOutScreen,
  agents,
  userSlug = 'user',
  onComplete,
  onSkip,
}: TelegramAccountsScreenProps) {
  // Chief of Staff is always the first row, not part of the agents array
  const [chiefState, setChiefState] = useState<BotState>(defaultBotState)
  const [agentStates, setAgentStates] = useState<BotState[]>(() => agents.map(() => defaultBotState()))

  const updateAgent = useCallback(
    (i: number, patch: Partial<BotState>) =>
      setAgentStates(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s))),
    [],
  )

  // Sync array length when agents list changes (e.g. if parent re-renders)
  useEffect(() => {
    setAgentStates(prev => {
      if (prev.length === agents.length) return prev
      return agents.map((_, i) => prev[i] ?? defaultBotState())
    })
  }, [agents])

  // On first mount of the screen, load any already-provisioned bots from openclaw.json
  const loaded = useRef(false)
  useEffect(() => {
    if (currentSlideInScreen === index && !loaded.current) {
      loaded.current = true
      getAgentBotStatuses()
        .then(statuses => {
          const byId = new Map(statuses.map(s => [s.agent_id, s]))

          // Chief of Staff uses agentId "chief"
          const chief = byId.get('chief')
          if (chief?.configured && chief.username) {
            setChiefState({ phase: 'done', username: chief.username, errorMessage: '' })
          }

          setAgentStates(prev =>
            agents.map((a, i) => {
              const s = byId.get(a.agentId)
              if (s?.configured && s.username) {
                return { phase: 'done' as BotPhase, username: s.username, errorMessage: '' }
              }
              return prev[i] ?? defaultBotState()
            }),
          )
        })
        .catch(() => {}) // non-fatal — user can set up manually
    }
  }, [currentSlideInScreen, index, agents])

  const doneCount =
    (chiefState.phase === 'done' ? 1 : 0) +
    agentStates.filter(s => s.phase === 'done').length

  const isVisible = currentSlideInScreen === index || currentSlideOutScreen === index
  if (!isVisible) return null

  const slug = toSlug(userSlug)

  return (
    <div
      className={cn(
        'w-full max-w-2xl mx-auto flex flex-col justify-center items-center h-full',
        {
          [styles.entranceTransition]: currentSlideInScreen === index,
          [styles.exitTransition]: currentSlideOutScreen === index,
        },
      )}
    >
      <div className="w-full mb-6 text-center">
        <h2 className="text-black text-4xl font-semibold font-Lora leading-10">
          Give your team a voice
        </h2>
        <p className="mt-3 text-gray-500 text-base font-InterTight leading-relaxed">
          Each agent gets their own Telegram bot. Click{' '}
          <span className="font-medium text-gray-700">Set up →</span> to open
          Telegram and create it — takes about 10 seconds per bot.
        </p>
      </div>

      <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {/* Chief of Staff — always first */}
        <AgentBotCard
          emoji="🎩"
          name="Knapsack Chief of Staff"
          agentId="chief"
          suggestedUsername={chiefUsername(slug)}
          state={chiefState}
          onChange={patch => setChiefState(prev => ({ ...prev, ...patch }))}
        />

        {/* Dynamic agent list — names come from the prior screen */}
        {agents.map((agent, i) => (
          <AgentBotCard
            key={agent.agentId}
            emoji={agent.emoji}
            name={agent.name}
            agentId={agent.agentId}
            suggestedUsername={agentUsername(slug, agent.agentId)}
            state={agentStates[i] ?? defaultBotState()}
            onChange={patch => updateAgent(i, patch)}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => onComplete(index)}
          className={cn(
            'w-80 h-14 px-6 py-3 rounded-[40px] shadow-sm justify-center items-center inline-flex',
            'text-lg font-semibold font-InterTight leading-[28px] transition-colors',
            doneCount > 0
              ? 'bg-[#913631] text-white hover:bg-[#7a2d29]'
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300',
          )}
        >
          {doneCount > 0 ? `Continue (${doneCount} connected)` : 'Continue'}
        </button>
        <button
          className="text-zinc-500 text-sm font-medium font-InterTight underline leading-tight cursor-pointer hover:text-zinc-700"
          onClick={() => onSkip(index)}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
