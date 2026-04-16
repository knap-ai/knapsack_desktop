import { useEffect, useRef, useState } from 'react'

import cn from 'classnames'

import {
  requestTelegramUserCode,
  setupTelegramChiefOfStaff,
  verifyTelegramUserCode,
  signUpTelegramUser,
  TelegramUserCodeResponse,
} from 'src/api/channels'

import styles from './styles.module.scss'

// ── Types ────────────────────────────────────────────────────

type AccountPhase =
  | 'idle'
  | 'entering_phone'
  | 'requesting_code'
  | 'entering_code'
  | 'verifying'
  | 'signing_up'
  | 'done'
  | 'error'
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
      <p className="text-xs text-gray-500">This number isn't on Telegram yet — let's create a new account.</p>
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

// ── Account Card ─────────────────────────────────────────────

function AccountCard({
  emoji,
  name,
  subtitle,
  agentId,
  isChiefOfStaff,
  state,
  onChange,
}: {
  emoji: string
  name: string
  subtitle: string
  agentId?: string
  isChiefOfStaff?: boolean
  state: AccountState
  onChange: (next: Partial<AccountState>) => void
}) {
  const handleRequestCode = async () => {
    if (!state.phone.trim()) return
    onChange({ phase: 'requesting_code', errorMessage: '' })
    try {
      let resp: TelegramUserCodeResponse
      if (isChiefOfStaff) {
        resp = await setupTelegramChiefOfStaff(state.phone.trim())
      } else {
        resp = await requestTelegramUserCode(state.phone.trim(), agentId)
      }
      if (resp.success && resp.phone_code_hash) {
        onChange({
          phase: 'entering_code',
          phoneCodeHash: resp.phone_code_hash,
          isRegistered: resp.is_registered !== false,
        })
      } else {
        onChange({ phase: 'entering_phone', errorMessage: resp.message ?? 'Failed to send code. Check the number and try again.' })
      }
    } catch (e: any) {
      onChange({ phase: 'entering_phone', errorMessage: e.message ?? 'Network error.' })
    }
  }

  const handleVerifyCode = async () => {
    if (!state.code.trim()) return
    onChange({ phase: 'verifying', errorMessage: '' })
    try {
      const resp = await verifyTelegramUserCode(
        state.phone,
        state.code,
        state.phoneCodeHash,
        isChiefOfStaff ? 'chief-of-staff' : agentId,
      )
      if (resp.success) {
        if (resp.is_new && !state.isRegistered) {
          onChange({ phase: 'signing_up', errorMessage: '' })
        } else {
          onChange({ phase: 'done', displayName: resp.display_name ?? name })
        }
      } else {
        onChange({ phase: 'entering_code', errorMessage: resp.message ?? 'Invalid code. Please try again.' })
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
        isChiefOfStaff ? 'chief-of-staff' : agentId,
      )
      if (resp.success) {
        onChange({ phase: 'done', displayName: resp.display_name ?? state.firstName })
      } else {
        onChange({ phase: 'signing_up', errorMessage: resp.message ?? 'Sign-up failed. Please try again.' })
      }
    } catch (e: any) {
      onChange({ phase: 'signing_up', errorMessage: e.message ?? 'Network error.' })
    }
  }

  const isSpinning = state.phase === 'requesting_code' || state.phase === 'verifying'
  const isDone = state.phase === 'done'
  const isSkipped = state.phase === 'skipped'

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        isChiefOfStaff ? 'border-[#913631]/40 bg-[#913631]/5' : 'border-gray-200 bg-white',
        isDone && 'border-green-400 bg-green-50',
        isSkipped && 'opacity-50',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 font-InterTight">{name}</p>
            <p className="text-xs text-gray-500 font-InterTight">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDone && (
            <span className="text-green-600 text-xs font-medium font-InterTight flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Connected as {state.displayName}
            </span>
          )}
          {!isDone && !isSkipped && state.phase !== 'idle' && (
            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline font-InterTight"
              onClick={() => onChange({ phase: 'skipped', errorMessage: '' })}
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

      {/* Body */}
      {(state.phase === 'entering_phone' || state.phase === 'requesting_code') && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 font-InterTight">
            Enter the phone number for this Telegram account.
          </p>
          <PhoneInput
            value={state.phone}
            onChange={v => onChange({ phone: v })}
            onSubmit={handleRequestCode}
            disabled={isSpinning}
          />
          {isSpinning && (
            <p className="text-xs text-gray-400 mt-2 font-InterTight">Sending code…</p>
          )}
          {state.errorMessage && (
            <p className="text-xs text-red-500 mt-2 font-InterTight">{state.errorMessage}</p>
          )}
        </div>
      )}

      {(state.phase === 'entering_code' || state.phase === 'verifying') && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 font-InterTight">
            A code was sent to <strong>{state.phone}</strong> via Telegram or SMS.
          </p>
          <CodeInput
            value={state.code}
            onChange={v => onChange({ code: v })}
            onSubmit={handleVerifyCode}
            disabled={state.phase === 'verifying'}
          />
          {state.phase === 'verifying' && (
            <p className="text-xs text-gray-400 mt-2 font-InterTight">Verifying…</p>
          )}
          {state.errorMessage && (
            <p className="text-xs text-red-500 mt-2 font-InterTight">{state.errorMessage}</p>
          )}
          <button
            className="text-xs text-gray-400 mt-2 hover:text-gray-600 underline font-InterTight"
            onClick={() => onChange({ phase: 'entering_phone', code: '' })}
          >
            Use a different number
          </button>
        </div>
      )}

      {(state.phase === 'signing_up') && (
        <div className="mt-3">
          <SignUpFields
            firstName={state.firstName}
            lastName={state.lastName}
            onFirstNameChange={v => onChange({ firstName: v })}
            onLastNameChange={v => onChange({ lastName: v })}
            onSubmit={handleSignUp}
            disabled={false}
          />
          {state.errorMessage && (
            <p className="text-xs text-red-500 mt-2 font-InterTight">{state.errorMessage}</p>
          )}
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
  const [chiefState, setChiefState] = useState<AccountState>(() => ({
    ...defaultAccountState(),
    phase: 'entering_phone',
  }))
  const [agentStates, setAgentStates] = useState<AccountState[]>(() =>
    agents.map(() => defaultAccountState()),
  )

  const agentsRef = useRef(agents)
  agentsRef.current = agents

  // Re-initialise agent states when the agents list grows (screen mounted after activation)
  useEffect(() => {
    setAgentStates(prev => {
      if (prev.length === agents.length) return prev
      const next = [...prev]
      while (next.length < agents.length) next.push(defaultAccountState())
      return next
    })
  }, [agents.length])

  const updateAgentState = (i: number, patch: Partial<AccountState>) => {
    setAgentStates(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }

  const doneCount =
    (chiefState.phase === 'done' ? 1 : 0) +
    agentStates.filter(s => s.phase === 'done').length

  const isVisible =
    currentSlideInScreen === index || currentSlideOutScreen === index

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
      {/* Heading */}
      <div className="w-full mb-6 text-center">
        <h2 className="text-black text-4xl font-semibold font-Lora leading-10">
          Give your team a voice
        </h2>
        <p className="mt-3 text-gray-500 text-base font-InterTight leading-relaxed">
          Connect each digital employee to Telegram so they can send and receive messages directly — no bots required.
        </p>
      </div>

      {/* Cards */}
      <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {/* Chief of Staff */}
        <AccountCard
          emoji="🎩"
          name="Knapsack Chief of Staff"
          subtitle="Your team's shared Telegram identity — routes messages to the right agent"
          isChiefOfStaff
          state={chiefState}
          onChange={patch => setChiefState(prev => ({ ...prev, ...patch }))}
        />

        {/* Per-agent accounts */}
        {agents.map((agent, i) => (
          <AccountCard
            key={agent.agentId}
            emoji={agent.emoji}
            name={agent.name}
            subtitle="Personal Telegram account for proactive outreach"
            agentId={agent.agentId}
            state={agentStates[i] ?? defaultAccountState()}
            onChange={patch => updateAgentState(i, patch)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => onComplete(index)}
          className={cn(
            'w-80 h-14 px-6 py-3 rounded-[40px] shadow-sm justify-center items-center inline-flex text-white text-lg font-semibold font-InterTight leading-[28px] transition-colors',
            doneCount > 0
              ? 'bg-[#913631] hover:bg-[#7a2d29]'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-600',
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
