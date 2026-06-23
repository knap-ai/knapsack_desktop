import { useCallback, useEffect, useRef, useState } from 'react'

import { open as openUrl } from '@tauri-apps/api/shell'
import cn from 'classnames'

import {
  configureAgentBot,
  createHostedSlackInstallSession,
  disconnectHostedSlackLink,
  getAgentBotStatuses,
  getHostedSlackLinkStatus,
  redeemHostedSlackInstallSession,
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

type SlackPhase = 'idle' | 'starting' | 'waiting' | 'done' | 'skipped' | 'error'

interface SlackState {
  phase: SlackPhase
  workspaceLabel: string
  errorMessage: string
  sessionId?: string
  botLabel?: string
}

function defaultSlackState(): SlackState {
  return {
    phase: 'idle',
    workspaceLabel: '',
    errorMessage: '',
    sessionId: undefined,
    botLabel: '',
  }
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
  /** Signed-in account email used for hosted Slack OAuth. */
  accountEmail?: string | null
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

function SlackWorkspaceCard({
  state,
  onChange,
  accountEmail,
}: {
  state: SlackState
  onChange: (patch: Partial<SlackState>) => void
  accountEmail?: string
}) {
  const handleSetUp = async () => {
    if (!accountEmail) {
      onChange({
        phase: 'error',
        errorMessage: 'Connect Google or Microsoft first so Knapsack can link Slack to your account.',
      })
      return
    }

    onChange({ phase: 'starting', errorMessage: '', sessionId: undefined })
    try {
      const session = await createHostedSlackInstallSession(accountEmail)
      onChange({
        phase: 'waiting',
        errorMessage: '',
        sessionId: session.session_id,
      })
      await openUrl(session.authorize_url)
    } catch {
      onChange({
        phase: 'error',
        errorMessage: 'Could not start Slack setup right now. Please try again.',
        sessionId: undefined,
      })
    }
  }

  const handleDisconnect = async () => {
    if (!accountEmail) return
    onChange({ errorMessage: '' })
    try {
      await disconnectHostedSlackLink(accountEmail)
      onChange({
        phase: 'idle',
        workspaceLabel: '',
        errorMessage: '',
        sessionId: undefined,
        botLabel: '',
      })
    } catch {
      onChange({ errorMessage: 'Could not disconnect Slack right now.' })
    }
  }

  const isDone = state.phase === 'done'
  const isStarting = state.phase === 'starting'
  const isWaiting = state.phase === 'waiting'
  const isSkipped = state.phase === 'skipped'

  useEffect(() => {
    if (!accountEmail || state.phase !== 'waiting' || !state.sessionId) return

    let cancelled = false
    const poll = async () => {
      try {
        const status = await redeemHostedSlackInstallSession(accountEmail, state.sessionId!)
        if (cancelled) return

        if (status.linked || status.status === 'complete') {
          onChange({
            phase: 'done',
            workspaceLabel: status.slack_team_name ?? 'Slack workspace connected',
            botLabel: status.slack_bot_name ?? 'Slack bot ready',
            errorMessage: '',
            sessionId: undefined,
          })
          return
        }

        if (status.status === 'error') {
          onChange({
            phase: 'error',
            errorMessage: status.error || 'Slack setup did not complete. Please try again.',
            sessionId: undefined,
          })
        }
      } catch (error: any) {
        if (cancelled) return
        const message = String(error?.message || '')
        if (message.includes('404')) {
          onChange({
            phase: 'error',
            errorMessage: 'This Slack setup link expired. Start again from Knapsack.',
            sessionId: undefined,
          })
        }
      }
    }

    poll()
    const id = setInterval(poll, 2000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [accountEmail, onChange, state.phase, state.sessionId])

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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4f4f5] text-[#611f69]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-InterTight">Slack workspace</p>
            <p className="text-xs text-gray-400 font-InterTight">
              Most teams start here instead of creating individual Telegram bots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDone && (
            <span className="text-green-600 text-xs font-medium font-InterTight flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {state.workspaceLabel || 'Connected'}
            </span>
          )}

          {state.phase === 'idle' && (
            <button
              onClick={handleSetUp}
              className="text-sm text-[#913631] font-medium hover:underline font-InterTight whitespace-nowrap"
            >
              Connect in Slack -&gt;
            </button>
          )}

          {isDone && (
            <button
              className="text-xs text-gray-500 hover:text-gray-700 underline font-InterTight"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          )}

          {(isStarting || isWaiting) && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight"
              onClick={() => onChange({ phase: 'skipped', errorMessage: '', sessionId: undefined })}
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

      {(isStarting || isWaiting) && (
        <div className="mt-3 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
            <p className="text-xs font-medium text-gray-600 font-InterTight">
              We&apos;ll open Slack in your browser so you can install the workspace app and come
              right back here when you&apos;re done.
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-500 font-InterTight space-y-1">
              <li>Approve the Slack install in your browser</li>
              <li>Return to Knapsack Desktop after Slack says the connection is complete</li>
            </ul>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
            <p className="text-xs text-gray-500 font-InterTight">
              {isStarting ? 'Opening Slack install...' : 'Waiting for Slack approval...'}
            </p>
            <button
              onClick={handleSetUp}
              disabled={isStarting}
              className="text-xs font-medium font-InterTight px-3 py-1.5 rounded-lg bg-[#913631] text-white hover:bg-[#7a2d29] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Open Slack
            </button>
          </div>
        </div>
      )}

      {isDone && state.botLabel && (
        <p className="mt-3 text-xs text-green-700 font-InterTight">{state.botLabel}</p>
      )}

      {state.phase === 'error' && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs text-red-600 font-InterTight">{state.errorMessage}</p>
          <button
            onClick={handleSetUp}
            className="text-xs font-medium font-InterTight text-[#913631] hover:underline whitespace-nowrap"
          >
            Try again
          </button>
        </div>
      )}
    </div>
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
      await openUrl('https://t.me/BotFather')
    } catch { /* ignore */ }
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
  accountEmail,
  onComplete,
  onSkip,
}: TelegramAccountsScreenProps) {
  // Chief of Staff is always the first row, not part of the agents array
  const [chiefState, setChiefState] = useState<BotState>(defaultBotState)
  const [agentStates, setAgentStates] = useState<BotState[]>(() => agents.map(() => defaultBotState()))
  const [slackState, setSlackState] = useState<SlackState>(defaultSlackState)

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
      if (accountEmail) {
        getHostedSlackLinkStatus(accountEmail)
          .then(status => {
            if (status?.linked) {
              setSlackState({
                phase: 'done',
                workspaceLabel: status.display_label ?? 'Slack workspace connected',
                errorMessage: '',
                botLabel: '',
              })
            }
          })
          .catch(() => {}) // non-fatal
      }

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
    (slackState.phase === 'done' ? 1 : 0) +
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
          Most teams choose one place to start. Connect Slack for your workspace,
          or set up Telegram bots for individual agents. Click{' '}
          <span className="font-medium text-gray-700">Set up -&gt;</span> and
          we&apos;ll walk you through whichever path you pick.
        </p>
      </div>

      <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        <SlackWorkspaceCard
          state={slackState}
          accountEmail={accountEmail ?? undefined}
          onChange={patch => setSlackState(prev => ({ ...prev, ...patch }))}
        />

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
