import { useEffect, useRef, useState } from 'react'

import cn from 'classnames'

import {
  configureTelegram,
  getTelegramStatus,
  requestTelegramUserCode,
  verifyTelegramUserCode,
  signUpTelegramUser,
  provisionChiefOfStaffBot,
  TelegramUserCodeResponse,
} from 'src/api/channels'

import styles from './styles.module.scss'

// ── Types ────────────────────────────────────────────────────

// Chief of Staff is a bot — only needs a token.
type BotPhase = 'idle' | 'entering_token' | 'provisioning' | 'connecting' | 'done' | 'error'

interface BotState {
  phase: BotPhase
  token: string
  username: string
  errorMessage: string
}

// Digital employees are MTProto user accounts.
type AccountPhase =
  | 'idle'
  | 'entering_phone'
  | 'requesting_code'
  | 'entering_code'
  | 'verifying'
  | 'signing_up'
  | 'done'
  | 'skipped'

interface AccountState {
  phase: AccountPhase
  phone: string
  code: string
  phoneCodeHash: string
  isRegistered: boolean
  firstName: string
  lastName: string
  displayName: string
  errorMessage: string
}

function defaultBotState(): BotState {
  return { phase: 'idle', token: '', username: '', errorMessage: '' }
}

function defaultAccountState(): AccountState {
  return {
    phase: 'idle',
    phone: '',
    code: '',
    phoneCodeHash: '',
    isRegistered: true,
    firstName: '',
    lastName: '',
    displayName: '',
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

// ── Sub-components ───────────────────────────────────────────

function PhoneInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex gap-2 mt-3">
      <input
        type="tel"
        placeholder="+1 555 000 0000"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !disabled && onSubmit()}
        disabled={disabled}
        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#913631] disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="px-4 py-2 rounded-lg bg-[#913631] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#7a2d29] transition-colors"
      >
        Send code
      </button>
    </div>
  )
}

function CodeInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex gap-2 mt-3">
      <input
        type="text"
        inputMode="numeric"
        placeholder="12345"
        maxLength={6}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
        onKeyDown={e => e.key === 'Enter' && !disabled && onSubmit()}
        disabled={disabled}
        className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm text-center tracking-widest focus:outline-none focus:border-[#913631] disabled:bg-gray-50"
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="px-4 py-2 rounded-lg bg-[#913631] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#7a2d29] transition-colors"
      >
        Verify
      </button>
    </div>
  )
}

function SignUpFields({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  disabled,
}: {
  firstName: string
  lastName: string
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
}) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-gray-500 font-InterTight">
        This number isn't on Telegram yet — create an account for this agent.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={e => onFirstNameChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#913631] disabled:bg-gray-50"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={e => onLastNameChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#913631] disabled:bg-gray-50"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={disabled || !firstName.trim()}
        className="w-full px-4 py-2 rounded-lg bg-[#913631] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#7a2d29] transition-colors"
      >
        Create Telegram account
      </button>
    </div>
  )
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
        // Auto-configure with the provisioned token
        onChange({ phase: 'connecting', token: resp.bot_token })
        const configResp = await configureTelegram(resp.bot_token)
        if (configResp.success) {
          onChange({ phase: 'done', username: resp.bot_username ?? 'KnapsackBot' })
        } else {
          onChange({ phase: 'entering_token', errorMessage: configResp.message ?? 'Failed to connect bot.' })
        }
      } else {
        // Provision not available yet — fall back to manual
        onChange({ phase: 'entering_token', errorMessage: resp.message ?? 'Auto-provision unavailable. Enter a bot token manually.' })
      }
    } catch (e: any) {
      onChange({ phase: 'entering_token', errorMessage: 'Auto-provision failed. Enter a bot token manually.' })
    }
  }

  const handleManualConnect = async () => {
    if (!state.token.trim()) return
    onChange({ phase: 'connecting', errorMessage: '' })
    try {
      const resp = await configureTelegram(state.token.trim())
      if (resp.success) {
        // Fetch the bot username to confirm
        const status = await getTelegramStatus()
        onChange({ phase: 'done', username: status.account ?? 'KnapsackBot' })
      } else {
        onChange({ phase: 'entering_token', errorMessage: resp.message ?? 'Invalid token. Check it and try again.' })
      }
    } catch (e: any) {
      onChange({ phase: 'entering_token', errorMessage: e.message ?? 'Network error.' })
    }
  }

  const isDone = state.phase === 'done'
  const isSpinning = state.phase === 'provisioning' || state.phase === 'connecting'

  return (
    <div className={cn(
      'rounded-2xl border p-4 transition-all',
      isDone ? 'border-green-400 bg-green-50' : 'border-[#913631]/40 bg-[#913631]/5',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎩</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-InterTight">
              Knapsack Chief of Staff
            </p>
            <p className="text-xs text-gray-500 font-InterTight">
              Shared Telegram bot — routes inbound messages to the right agent
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

      {/* Body */}
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

      {(state.phase === 'entering_token') && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-500 font-InterTight">
            Paste a bot token from{' '}
            <span className="font-medium">@BotFather</span>, or{' '}
            <button
              className="text-[#913631] underline"
              onClick={handleProvision}
            >
              auto-create one
            </button>
            .
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

// ── Digital Employee Account Card ────────────────────────────

function AgentAccountCard({
  emoji,
  name,
  agentId,
  state,
  onChange,
}: {
  emoji: string
  name: string
  agentId: string
  state: AccountState
  onChange: (patch: Partial<AccountState>) => void
}) {
  const handleRequestCode = async () => {
    if (!state.phone.trim()) return
    onChange({ phase: 'requesting_code', errorMessage: '' })
    try {
      const resp: TelegramUserCodeResponse = await requestTelegramUserCode(state.phone.trim(), agentId)
      if (resp.success && resp.phone_code_hash) {
        onChange({
          phase: 'entering_code',
          phoneCodeHash: resp.phone_code_hash,
          isRegistered: resp.is_registered !== false,
        })
      } else {
        onChange({ phase: 'entering_phone', errorMessage: resp.message ?? 'Failed to send code.' })
      }
    } catch (e: any) {
      onChange({ phase: 'entering_phone', errorMessage: e.message ?? 'Network error.' })
    }
  }

  const handleVerifyCode = async () => {
    if (!state.code.trim()) return
    onChange({ phase: 'verifying', errorMessage: '' })
    try {
      const resp = await verifyTelegramUserCode(state.phone, state.code, state.phoneCodeHash, agentId)
      if (resp.success) {
        if (resp.is_new && !state.isRegistered) {
          onChange({ phase: 'signing_up' })
        } else {
          onChange({ phase: 'done', displayName: resp.display_name ?? name })
        }
      } else {
        onChange({ phase: 'entering_code', errorMessage: resp.message ?? 'Invalid code.' })
      }
    } catch (e: any) {
      onChange({ phase: 'entering_code', errorMessage: e.message ?? 'Network error.' })
    }
  }

  const handleSignUp = async () => {
    if (!state.firstName.trim()) return
    onChange({ phase: 'signing_up', errorMessage: '' })
    try {
      const resp = await signUpTelegramUser(
        state.phone,
        state.phoneCodeHash,
        state.firstName,
        state.lastName,
        agentId,
      )
      if (resp.success) {
        onChange({ phase: 'done', displayName: resp.display_name ?? state.firstName })
      } else {
        onChange({ phase: 'signing_up', errorMessage: resp.message ?? 'Sign-up failed.' })
      }
    } catch (e: any) {
      onChange({ phase: 'signing_up', errorMessage: e.message ?? 'Network error.' })
    }
  }

  const isSpinning = state.phase === 'requesting_code' || state.phase === 'verifying'
  const isDone = state.phase === 'done'
  const isSkipped = state.phase === 'skipped'

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
            <p className="text-xs text-gray-500 font-InterTight">Personal Telegram user account</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDone && (
            <span className="text-green-600 text-xs font-medium font-InterTight flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {state.displayName}
            </span>
          )}
          {!isDone && !isSkipped && state.phase !== 'idle' && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight"
              onClick={() => onChange({ phase: 'skipped' })}
            >
              Skip
            </button>
          )}
          {state.phase === 'idle' && (
            <button
              className="text-xs text-[#913631] font-medium hover:underline font-InterTight"
              onClick={() => onChange({ phase: 'entering_phone' })}
            >
              Set up →
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

      {(state.phase === 'entering_phone' || state.phase === 'requesting_code') && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 font-InterTight">
            Enter a phone number for this agent's Telegram account.
          </p>
          <PhoneInput
            value={state.phone}
            onChange={v => onChange({ phone: v })}
            onSubmit={handleRequestCode}
            disabled={isSpinning}
          />
          {isSpinning && <p className="text-xs text-gray-400 mt-2 font-InterTight">Sending code…</p>}
          {state.errorMessage && <p className="text-xs text-red-500 mt-2 font-InterTight">{state.errorMessage}</p>}
        </div>
      )}

      {(state.phase === 'entering_code' || state.phase === 'verifying') && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 font-InterTight">
            Enter the code sent to <strong>{state.phone}</strong>.
          </p>
          <CodeInput
            value={state.code}
            onChange={v => onChange({ code: v })}
            onSubmit={handleVerifyCode}
            disabled={state.phase === 'verifying'}
          />
          {state.phase === 'verifying' && <p className="text-xs text-gray-400 mt-2 font-InterTight">Verifying…</p>}
          {state.errorMessage && <p className="text-xs text-red-500 mt-2 font-InterTight">{state.errorMessage}</p>}
          <button
            className="text-xs text-gray-400 mt-2 hover:text-gray-600 underline font-InterTight"
            onClick={() => onChange({ phase: 'entering_phone', code: '' })}
          >
            Use a different number
          </button>
        </div>
      )}

      {state.phase === 'signing_up' && (
        <SignUpFields
          firstName={state.firstName}
          lastName={state.lastName}
          onFirstNameChange={v => onChange({ firstName: v })}
          onLastNameChange={v => onChange({ lastName: v })}
          onSubmit={handleSignUp}
        />
      )}
      {state.phase === 'signing_up' && state.errorMessage && (
        <p className="text-xs text-red-500 mt-2 font-InterTight">{state.errorMessage}</p>
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
  const [agentStates, setAgentStates] = useState<AccountState[]>(() =>
    agents.map(() => defaultAccountState()),
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
                phase: 'entering_token',
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

  // Keep agent state array in sync with the agents list
  useEffect(() => {
    setAgentStates(prev => {
      if (prev.length === agents.length) return prev
      const next = [...prev]
      while (next.length < agents.length) next.push(defaultAccountState())
      return next.slice(0, agents.length)
    })
  }, [agents.length])

  const updateAgent = (i: number, patch: Partial<AccountState>) =>
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
          The Chief of Staff bot handles all inbound messages and routes them to the right agent.
          Optionally give each agent their own Telegram identity for outbound outreach.
        </p>
      </div>

      <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        <ChiefOfStaffCard
          state={chiefState}
          onChange={patch => setChiefState(prev => ({ ...prev, ...patch }))}
        />

        {agents.map((agent, i) => (
          <AgentAccountCard
            key={agent.agentId}
            emoji={agent.emoji}
            name={agent.name}
            agentId={agent.agentId}
            state={agentStates[i] ?? defaultAccountState()}
            onChange={patch => updateAgent(i, patch)}
          />
        ))}
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
