import { useCallback, useEffect, useRef, useState } from 'react'

import { open as openUrl } from '@tauri-apps/api/shell'
import cn from 'classnames'

import {
  configureAgentBot,
  configureGenericChannel,
  disconnectSlackAccount,
  getAgentBotStatuses,
  getGenericChannelStatus,
  getSlackAccounts,
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

type SlackPhase = 'idle' | 'entering_tokens' | 'connecting' | 'done' | 'skipped' | 'error'

interface SlackState {
  phase: SlackPhase
  workspaceLabel: string
  errorMessage: string
}

function defaultSlackState(): SlackState {
  return { phase: 'idle', workspaceLabel: '', errorMessage: '' }
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
}: {
  state: SlackState
  onChange: (patch: Partial<SlackState>) => void
}) {
  const [botTokenInput, setBotTokenInput] = useState('')
  const [appTokenInput, setAppTokenInput] = useState('')

  const handleSetUp = async () => {
    onChange({ phase: 'entering_tokens', errorMessage: '' })
    try {
      await openUrl('https://api.slack.com/apps')
    } catch {
      /* ignore */
    }
  }

  const handleConnect = async () => {
    const botToken = botTokenInput.trim()
    const appToken = appTokenInput.trim()
    if (!botToken || !appToken) return

    onChange({ phase: 'connecting', errorMessage: '' })
    try {
      const resp = await configureGenericChannel('slack', { botToken, appToken })
      if (!resp.success) {
        onChange({
          phase: 'entering_tokens',
          errorMessage: resp.message ?? 'Slack connection failed — check both tokens and try again.',
        })
        return
      }

      const status = await getGenericChannelStatus('slack').catch(() => null)
      onChange({
        phase: 'done',
        workspaceLabel: status?.account ?? 'Slack workspace connected',
        errorMessage: '',
      })
      setBotTokenInput('')
      setAppTokenInput('')
    } catch {
      onChange({
        phase: 'entering_tokens',
        errorMessage: 'Slack connection failed — check both tokens and try again.',
      })
    }
  }

  const handleDisconnect = async () => {
    onChange({ errorMessage: '' })
    try {
      const inventory = await getSlackAccounts()
      const removableAccounts = inventory.accounts.filter(account => !account.managedByEnvironment)
      const legacyDefault = removableAccounts.find(account => account.id === 'default' && account.legacy)
      const target = legacyDefault ?? (removableAccounts.length === 1 ? removableAccounts[0] : null)
      if (!target) {
        throw new Error('Manage multiple Slack workspaces individually in Channels settings.')
      }
      const response = await disconnectSlackAccount(target.id)
      if (!response.success) throw new Error(response.message || 'Disconnect failed')
      onChange({ phase: 'idle', workspaceLabel: '', errorMessage: '' })
    } catch (error) {
      onChange({ errorMessage: error instanceof Error ? error.message : 'Could not disconnect Slack right now.' })
    }
  }

  const botTrimmed = botTokenInput.trim()
  const appTrimmed = appTokenInput.trim()
  const botValid = !botTrimmed || botTrimmed.startsWith('xoxb-')
  const appValid = !appTrimmed || appTrimmed.startsWith('xapp-')
  const canConnect = !!botTrimmed && !!appTrimmed && botValid && appValid
  const isDone = state.phase === 'done'
  const isEntering = state.phase === 'entering_tokens'
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4f4f5] text-[#611f69]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-InterTight">📋 Scout on Slack</p>
            <p className="text-xs text-gray-400 font-InterTight">
              Best when your team wants one shared Scout in Slack, including web research there.
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
              Set up →
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

          {(isEntering || isConnecting) && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight"
              onClick={() => {
                setBotTokenInput('')
                setAppTokenInput('')
                onChange({ phase: 'skipped', errorMessage: '' })
              }}
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

      {(isEntering || isConnecting) && (
        <div className="mt-3 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
            <p className="text-xs font-medium text-gray-600 font-InterTight">
              Create a shared Slack app at <span className="font-semibold">api.slack.com/apps</span>, then paste:
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-500 font-InterTight space-y-1">
              <li>Bot token from OAuth &amp; Permissions (<span className="font-mono">xoxb-…</span>)</li>
              <li>App-level token with <span className="font-mono">connections:write</span> (<span className="font-mono">xapp-…</span>)</li>
            </ul>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 font-InterTight">
              Recommended: treat Scout like a new employee. Connecting Gmail, Calendar, or Drive for Scout is optional,
              and if you do it later, prefer dedicated accounts such as <span className="font-mono">scout@company.com</span>
              instead of your own personal inbox or calendar whenever possible.
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-InterTight mb-1.5">
              Paste both Slack tokens:
            </p>
            {state.errorMessage && (
              <p className="text-xs text-red-500 font-InterTight mb-1.5">{state.errorMessage}</p>
            )}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Bot token (xoxb-...)"
                value={botTokenInput}
                onChange={e => setBotTokenInput(e.target.value)}
                disabled={isConnecting}
                className={cn(
                  'w-full text-xs border rounded-lg px-3 py-2 font-mono font-InterTight focus:outline-none focus:border-[#913631] disabled:opacity-50',
                  botTrimmed && !botValid ? 'border-red-400' : 'border-gray-200',
                )}
              />
              {botTrimmed && !botValid && (
                <p className="text-xs text-red-500 font-InterTight">Bot token must start with <code>xoxb-</code>.</p>
              )}
              <input
                type="text"
                placeholder="App token (xapp-...)"
                value={appTokenInput}
                onChange={e => setAppTokenInput(e.target.value)}
                disabled={isConnecting}
                className={cn(
                  'w-full text-xs border rounded-lg px-3 py-2 font-mono font-InterTight focus:outline-none focus:border-[#913631] disabled:opacity-50',
                  appTrimmed && !appValid ? 'border-red-400' : 'border-gray-200',
                )}
              />
              {appTrimmed && !appValid && (
                <p className="text-xs text-red-500 font-InterTight">App token must start with <code>xapp-</code>.</p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !canConnect}
                  className="text-xs font-medium font-InterTight px-3 py-2 rounded-lg bg-[#913631] text-white hover:bg-[#7a2d29] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isConnecting ? 'Connecting…' : 'Connect Slack'}
                </button>
              </div>
            </div>
          </div>
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
      getGenericChannelStatus('slack')
        .then(status => {
          if (status?.configured) {
            setSlackState({
              phase: 'done',
              workspaceLabel: status.account ?? 'Slack workspace connected',
              errorMessage: '',
            })
          }
        })
        .catch(() => {}) // non-fatal

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
          Most teams start with one path. Choose Slack for one shared Scout across the company,
          or choose Telegram if you want separate bots for individual agents. Click{' '}
          <span className="font-medium text-gray-700">Set up →</span> and
          we&apos;ll walk you through whichever path you pick.
        </p>
      </div>

      <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        <SlackWorkspaceCard
          state={slackState}
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
