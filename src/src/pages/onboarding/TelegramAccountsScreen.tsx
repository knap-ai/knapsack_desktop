import { useEffect, useRef, useState } from 'react'

import cn from 'classnames'

import {
  configureTelegram,
  getTelegramStatus,
  provisionChiefOfStaffBot,
  getTelegramManagedBotDeeplink,
  fetchTelegramManagedBotToken,
} from 'src/api/channels'

import styles from './styles.module.scss'

// ── Types ────────────────────────────────────────────────────

type BotPhase = 'idle' | 'entering_token' | 'provisioning' | 'connecting' | 'done' | 'error'

interface BotState {
  phase: BotPhase
  token: string
  username: string
  errorMessage: string
}

type AgentBotPhase =
  | 'idle'
  | 'awaiting_creation'
  | 'confirming_username'
  | 'fetching_token'
  | 'done'
  | 'skipped'
  | 'error'

interface AgentBotState {
  phase: AgentBotPhase
  suggestedUsername: string
  confirmedUsername: string
  username: string
  botId: number | null
  errorMessage: string
}

function defaultBotState(): BotState {
  return { phase: 'idle', token: '', username: '', errorMessage: '' }
}

function defaultAgentBotState(agentId: string): AgentBotState {
  const slug = agentId.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const suggested = `knapsack_${slug}_bot`.slice(0, 32)
  return {
    phase: 'idle',
    suggestedUsername: suggested,
    confirmedUsername: suggested,
    username: '',
    botId: null,
    errorMessage: '',
  }
}

export interface AgentTelegramEntry {
  agentId: string
  name: string
  emoji: string
}

type TelegramAccountsScreenProps = {
  index: number
  currentSlideInScreen?: number
  currentSlideOutScreen?: number
  agents: AgentTelegramEntry[]
  onComplete: (index: number) => void
  onSkip: (index: number) => void
}

// ── Chief of Staff Bot Card ──────────────────────────────────

function ChiefOfStaffCard({
  state,
  onChange,
}: {
  state: BotState
  onChange: (patch: Partial<BotState>) => void
}) {
  const handleProvision = async () => {
    onChange({ phase: 'provisioning', errorMessage: '' })
    try {
      const resp = await provisionChiefOfStaffBot()
      if (resp.success && resp.bot_token) {
        onChange({ phase: 'connecting', token: resp.bot_token })
        const configResp = await configureTelegram(resp.bot_token)
        if (configResp.success) {
          onChange({ phase: 'done', username: resp.bot_username ?? 'KnapsackBot' })
        } else {
          onChange({ phase: 'entering_token', errorMessage: configResp.message ?? 'Failed to connect bot.' })
        }
      } else {
        onChange({ phase: 'entering_token', errorMessage: resp.message ?? 'Auto-provision unavailable. Enter a bot token manually.' })
      }
    } catch {
      onChange({ phase: 'entering_token', errorMessage: 'Auto-provision failed. Enter a bot token manually.' })
    }
  }

  const handleManualConnect = async () => {
    if (!state.token.trim()) return
    onChange({ phase: 'connecting', errorMessage: '' })
    try {
      const resp = await configureTelegram(state.token.trim())
      if (resp.success) {
        const status = await getTelegramStatus()
        onChange({ phase: 'done', username: status.account ?? 'KnapsackBot' })
      } else {
        onChange({ phase: 'entering_token', errorMessage: resp.message ?? 'Invalid token. Check it and try again.' })
      }
    } catch (e: unknown) {
      onChange({ phase: 'entering_token', errorMessage: e instanceof Error ? e.message : 'Network error.' })
    }
  }

  const isDone = state.phase === 'done'
  const isSpinning = state.phase === 'provisioning' || state.phase === 'connecting'

  return (
    <div className={cn(
      'rounded-2xl border p-4 transition-all',
      isDone ? 'border-green-400 bg-green-50' : 'border-[#913631]/40 bg-[#913631]/5',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎩</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-InterTight">
              Knapsack Chief of Staff
            </p>
            <p className="text-xs text-gray-500 font-InterTight">
              Manager bot — provisions and routes inbound messages to the right agent
            </p>
          </div>
        </div>
        {isDone && (
          <span className="text-green-600 text-xs font-medium font-InterTight flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            @{state.username}
          </span>
        )}
      </div>

      {state.phase === 'idle' && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleProvision}
            className="flex-1 px-4 py-2 rounded-lg bg-[#913631] text-white text-sm font-medium hover:bg-[#7a2d29] transition-colors font-InterTight"
          >
            Auto-create bot
          </button>
          <button
            onClick={() => onChange({ phase: 'entering_token' })}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors font-InterTight"
          >
            Use existing bot
          </button>
        </div>
      )}

      {state.phase === 'entering_token' && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-500 font-InterTight">
            Paste a bot token from{' '}
            <span className="font-medium">@BotFather</span>. This bot needs{' '}
            <span className="font-medium">can_manage_bots</span> enabled so it can
            auto-provision per-agent bots.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="123456:ABC-..."
              value={state.token}
              onChange={e => onChange({ token: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleManualConnect()}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#913631] font-mono"
            />
            <button
              onClick={handleManualConnect}
              disabled={!state.token.trim()}
              className="px-4 py-2 rounded-lg bg-[#913631] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#7a2d29] transition-colors"
            >
              Connect
            </button>
          </div>
          {state.errorMessage && (
            <p className="text-xs text-red-500 font-InterTight">{state.errorMessage}</p>
          )}
        </div>
      )}

      {isSpinning && (
        <p className="text-xs text-gray-400 mt-3 font-InterTight">
          {state.phase === 'provisioning' ? 'Creating bot…' : 'Connecting…'}
        </p>
      )}
    </div>
  )
}

// ── Agent Managed Bot Card ────────────────────────────────────

function AgentBotCard({
  emoji,
  name,
  agentId,
  chiefBotUsername,
  chiefBotToken,
  state,
  onChange,
}: {
  emoji: string
  name: string
  agentId: string
  chiefBotUsername: string
  chiefBotToken: string
  state: AgentBotState
  onChange: (patch: Partial<AgentBotState>) => void
}) {
  const handleOpenDeeplink = async () => {
    onChange({ phase: 'awaiting_creation', errorMessage: '' })
    try {
      const resp = await getTelegramManagedBotDeeplink(
        chiefBotUsername,
        state.suggestedUsername,
        `${name} (Knapsack)`,
      )
      if (resp.success && resp.deeplink) {
        // Open in the user's default browser / Telegram app
        window.open(resp.deeplink, '_blank', 'noopener,noreferrer')
      } else {
        // Fall back to building the URL client-side
        const url = `https://t.me/newbot/${chiefBotUsername}/${state.suggestedUsername}`
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      const url = `https://t.me/newbot/${chiefBotUsername}/${state.suggestedUsername}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleFetchToken = async () => {
    const username = state.confirmedUsername.trim().replace(/^@/, '')
    if (!username) return
    if (!chiefBotToken) {
      onChange({ phase: 'error', errorMessage: 'Connect the Chief of Staff bot first — its token is needed to retrieve managed bot tokens.' })
      return
    }
    onChange({ phase: 'fetching_token', errorMessage: '' })
    try {
      const resp = await fetchTelegramManagedBotToken(agentId, chiefBotToken, username)
      if (resp.success && resp.username) {
        onChange({ phase: 'done', username: resp.username, botId: resp.bot_id ?? null })
      } else {
        onChange({
          phase: 'confirming_username',
          errorMessage: resp.message ?? 'Could not retrieve token. Make sure you completed bot creation in Telegram.',
        })
      }
    } catch (e: unknown) {
      onChange({
        phase: 'confirming_username',
        errorMessage: e instanceof Error ? e.message : 'Network error.',
      })
    }
  }

  const isDone = state.phase === 'done'
  const isSkipped = state.phase === 'skipped'
  const isSpinning = state.phase === 'fetching_token'

  return (
    <div className={cn(
      'rounded-2xl border p-4 transition-all',
      isDone && 'border-green-400 bg-green-50',
      !isDone && !isSkipped && 'border-gray-200 bg-white',
      isSkipped && 'opacity-50 border-gray-200 bg-white',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-InterTight">{name}</p>
            <p className="text-xs text-gray-500 font-InterTight">Dedicated Telegram bot</p>
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
          {!isDone && !isSkipped && state.phase === 'idle' && (
            <button
              className="text-xs text-[#913631] font-medium hover:underline font-InterTight"
              onClick={() => onChange({ phase: 'confirming_username' })}
            >
              Set up →
            </button>
          )}
          {!isDone && !isSkipped && state.phase !== 'idle' && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight"
              onClick={() => onChange({ phase: 'skipped' })}
            >
              Skip
            </button>
          )}
          {isSkipped && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight"
              onClick={() => onChange({ phase: 'idle' })}
            >
              Undo
            </button>
          )}
        </div>
      </div>

      {(state.phase === 'confirming_username' || state.phase === 'awaiting_creation') && !isSpinning && (
        <div className="mt-3 space-y-3">
          {state.phase === 'confirming_username' && (
            <>
              <p className="text-xs text-gray-500 font-InterTight">
                Click below to open Telegram and create a managed bot for{' '}
                <strong>{name}</strong>. Once created, confirm the bot's username.
              </p>
              <button
                onClick={handleOpenDeeplink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2AABEE] text-white text-sm font-medium hover:bg-[#1a98db] transition-colors font-InterTight"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.4l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.835.94z" />
                </svg>
                Create {name}'s bot in Telegram
              </button>
            </>
          )}

          {state.phase === 'awaiting_creation' && (
            <p className="text-xs text-gray-500 font-InterTight">
              Complete bot creation in Telegram, then confirm the username below.
            </p>
          )}

          <div>
            <label className="text-xs text-gray-500 font-InterTight mb-1 block">
              Bot username (confirm after creating in Telegram)
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-[#913631]">
                <span className="text-gray-400 text-sm mr-1">@</span>
                <input
                  type="text"
                  value={state.confirmedUsername}
                  onChange={e => onChange({ confirmedUsername: e.target.value.replace(/^@/, '') })}
                  onKeyDown={e => e.key === 'Enter' && handleFetchToken()}
                  placeholder={state.suggestedUsername}
                  className="flex-1 py-2 text-sm focus:outline-none bg-transparent font-mono"
                />
              </div>
              <button
                onClick={handleFetchToken}
                disabled={!state.confirmedUsername.trim()}
                className="px-4 py-2 rounded-lg bg-[#913631] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#7a2d29] transition-colors"
              >
                Get token
              </button>
            </div>
          </div>

          {state.errorMessage && (
            <p className="text-xs text-red-500 font-InterTight">{state.errorMessage}</p>
          )}
        </div>
      )}

      {isSpinning && (
        <p className="text-xs text-gray-400 mt-3 font-InterTight">Retrieving bot token…</p>
      )}

      {state.phase === 'error' && (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-red-500 font-InterTight">{state.errorMessage}</p>
          <button
            className="text-xs text-[#913631] underline font-InterTight"
            onClick={() => onChange({ phase: 'confirming_username', errorMessage: '' })}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Screen ──────────────────────────────────────────────

export function TelegramAccountsScreen({
  index,
  currentSlideInScreen,
  currentSlideOutScreen,
  agents,
  onComplete,
  onSkip,
}: TelegramAccountsScreenProps) {
  const [chiefState, setChiefState] = useState<BotState>(defaultBotState)
  const [agentStates, setAgentStates] = useState<AgentBotState[]>(() =>
    agents.map(a => defaultAgentBotState(a.agentId)),
  )

  // Kick off auto-provisioning when the screen becomes visible
  const provisioned = useRef(false)
  useEffect(() => {
    if (currentSlideInScreen === index && !provisioned.current) {
      provisioned.current = true
      setChiefState(prev => ({ ...prev, phase: 'provisioning' }))
      provisionChiefOfStaffBot()
        .then(async resp => {
          if (resp.success && resp.bot_token) {
            setChiefState(prev => ({ ...prev, phase: 'connecting', token: resp.bot_token! }))
            const configResp = await configureTelegram(resp.bot_token)
            if (configResp.success) {
              const status = await getTelegramStatus()
              setChiefState(prev => ({
                ...prev,
                phase: 'done',
                username: status.account ?? 'KnapsackBot',
              }))
            } else {
              setChiefState(prev => ({
                ...prev,
                phase: 'idle',
                errorMessage: 'Auto-connect failed — enter a bot token manually.',
              }))
            }
          } else {
            setChiefState(prev => ({
              ...prev,
              phase: 'idle',
              errorMessage: resp.message ?? '',
            }))
          }
        })
        .catch(() => {
          setChiefState(prev => ({ ...prev, phase: 'idle' }))
        })
    }
  }, [currentSlideInScreen, index])

  // Sync agent state array length when the agents list changes
  useEffect(() => {
    setAgentStates(prev => {
      if (prev.length === agents.length) return prev
      const next = agents.map((a, i) => prev[i] ?? defaultAgentBotState(a.agentId))
      return next
    })
  }, [agents])

  const updateAgent = (i: number, patch: Partial<AgentBotState>) =>
    setAgentStates(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const doneCount =
    (chiefState.phase === 'done' ? 1 : 0) +
    agentStates.filter(s => s.phase === 'done').length

  const isVisible = currentSlideInScreen === index || currentSlideOutScreen === index
  if (!isVisible) return null

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
          The Chief of Staff bot manages your team on Telegram. Each agent gets their
          own dedicated bot — no phone numbers, no OTPs.
        </p>
      </div>

      <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        <ChiefOfStaffCard
          state={chiefState}
          onChange={patch => setChiefState(prev => ({ ...prev, ...patch }))}
        />

        {chiefState.phase === 'done' && agents.map((agent, i) => (
          <AgentBotCard
            key={agent.agentId}
            emoji={agent.emoji}
            name={agent.name}
            agentId={agent.agentId}
            chiefBotUsername={chiefState.username}
            chiefBotToken={chiefState.token}
            state={agentStates[i] ?? defaultAgentBotState(agent.agentId)}
            onChange={patch => updateAgent(i, patch)}
          />
        ))}

        {chiefState.phase !== 'done' && agents.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs text-gray-400 text-center font-InterTight">
              Connect the Chief of Staff bot above to unlock per-agent bot creation.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => onComplete(index)}
          className={cn(
            'w-80 h-14 px-6 py-3 rounded-[40px] shadow-sm justify-center items-center inline-flex text-lg font-semibold font-InterTight leading-[28px] transition-colors',
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
