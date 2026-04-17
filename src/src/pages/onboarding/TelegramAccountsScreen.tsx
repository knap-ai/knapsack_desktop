import { useCallback, useEffect, useRef, useState } from 'react'

import { open as openUrl } from '@tauri-apps/api/shell'
import cn from 'classnames'

import {
  configureAgentBot,
  getAgentBotStatuses,
} from 'src/api/channels'

import styles from './styles.module.scss'

// ── Types ────────────────────────────────────────────────────

type BotPhase = 'idle' | 'entering_token' | 'connecting' | 'done' | 'skipped' | 'error'

interface BotState {
  phase: BotPhase
  username: string
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

// ── Copy helper ──────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-400 hover:text-[#913631] font-InterTight transition-colors whitespace-nowrap"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

// ── Single card component ─────────────────────────────────────

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
  const [tokenInput, setTokenInput] = useState('')
  const botDisplayName = `${name} (Knapsack)`

  const handleSetUp = async () => {
    onChange({ phase: 'entering_token', errorMessage: '' })
    try {
      await openUrl('https://t.me/BotFather?start=newbot')
    } catch {
      try { await openUrl('https://t.me/BotFather') } catch { /* ignore */ }
    }
  }

  const handleConnect = async () => {
    const token = tokenInput.trim()
    if (!token) return
    onChange({ phase: 'connecting', errorMessage: '' })
    try {
      const resp = await configureAgentBot(agentId, name, token)
      if (resp.success && resp.username) {
        onChange({ phase: 'done', username: resp.username })
        setTokenInput('')
      } else {
        onChange({ phase: 'entering_token', errorMessage: resp.message ?? 'Invalid token — try again.' })
      }
    } catch {
      onChange({ phase: 'entering_token', errorMessage: 'Connection failed — check your token and try again.' })
    }
  }

  const isDone = state.phase === 'done'
  const isEntering = state.phase === 'entering_token'
  const isConnecting = state.phase === 'connecting'
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
      {/* Header row */}
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

          {(isEntering || isConnecting) && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight"
              onClick={() => { setTokenInput(''); onChange({ phase: 'skipped', errorMessage: '' }) }}
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

      {/* BotFather instructions + token entry */}
      {(isEntering || isConnecting) && (
        <div className="mt-3 space-y-3">
          {/* Step-by-step guidance */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
            <p className="text-xs font-medium text-gray-600 font-InterTight">
              In BotFather, send{' '}
              <span className="font-mono bg-gray-200 px-1 rounded">/newbot</span>{' '}
              and use these when prompted:
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs text-gray-400 font-InterTight">Name → </span>
                  <span className="text-xs font-semibold text-gray-800 font-InterTight">{botDisplayName}</span>
                </div>
                <CopyButton text={botDisplayName} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs text-gray-400 font-InterTight">Username → </span>
                  <span className="text-xs font-semibold text-gray-800 font-mono">@{suggestedUsername}</span>
                </div>
                <CopyButton text={suggestedUsername} />
              </div>
            </div>
          </div>

          {/* Token entry */}
          <div>
            <p className="text-xs text-gray-500 font-InterTight mb-1.5">
              Paste the token BotFather gives you:
            </p>
            {state.errorMessage && (
              <p className="text-xs text-red-500 font-InterTight mb-1.5">{state.errorMessage}</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="123456789:ABC-DEFghijk…"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConnect()}
                disabled={isConnecting}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 font-mono font-InterTight focus:outline-none focus:border-[#913631] disabled:opacity-50"
              />
              <button
                onClick={handleConnect}
                disabled={isConnecting || !tokenInput.trim()}
                className="text-xs font-medium font-InterTight px-3 py-2 rounded-lg bg-[#913631] text-white hover:bg-[#7a2d29] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isConnecting ? 'Connecting…' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
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
          Each agent gets its own Telegram bot. Click{' '}
          <span className="font-medium text-gray-700">Set up →</span> — we'll
          open BotFather and show you exactly what to type. Takes about 30 seconds per bot.
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
