import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import cn from 'classnames'

import { AgentIdentity, Cadence, CadenceType, DaysOfWeek } from 'src/automations/automation'
import { AGENT_TEMPLATES, AGENTMAKER_PROMPT } from 'src/automations/agentTemplates'
import LoadingIcon from 'src/components/atoms/loading-icon'
import {
  clearOnboardingIntent,
  getOnboardingIntent,
  ONBOARDING_INTENT_EVENT,
  OnboardingIntent,
} from 'src/utils/onboardingIntent'

import styles from './styles.module.scss'

// ── Types ───────────────────────────────────────────────────

export type AgentSelection = {
  templateId: string
  enabled: boolean
  identity: AgentIdentity
  isCustom?: boolean
  customPrompt?: string
  customSources?: string[]
  customCadence?: string
  cadenceOverride?: Cadence
  descriptionOverride?: string
}

type AgentPickerScreenProps = {
  index: number
  currentSlideInScreen?: number
  currentSlideOutScreen?: number
  connectedProvider: 'google' | 'microsoft' | null
  onActivate: (selections: AgentSelection[]) => void
  onSkip: (index: number) => void
}

function selectionsForTemplate(templateId?: string): AgentSelection[] {
  const matchesRequest = templateId
    ? AGENT_TEMPLATES.some(template => template.id === templateId)
    : false

  return AGENT_TEMPLATES.map(template => ({
    templateId: template.id,
    enabled: matchesRequest ? template.id === templateId : true,
    identity: { ...template.defaultIdentity },
  }))
}

// ── Emoji Picker (lightweight) ──────────────────────────────

const EMOJI_OPTIONS = [
  '📬', '📋', '🤝', '🎯', '🧠', '📊', '🔍', '💡',
  '📈', '🛡️', '⚡', '🎨', '📝', '🌐', '🤖', '💼',
]

function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void
  onClose: () => void
}) {
  return (
    <div
      className="absolute top-full left-0 mt-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-4 gap-1"
      onMouseLeave={onClose}
    >
      {EMOJI_OPTIONS.map(emoji => (
        <button
          key={emoji}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-lg cursor-pointer"
          onClick={() => {
            onSelect(emoji)
            onClose()
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

// ── Agent Card ──────────────────────────────────────────────

// ── Inline Editable Text ───────────────────────────────────

function EditableText({
  value,
  onChange,
  className,
  editClassName,
  title,
  multiline,
}: {
  value: string
  onChange: (val: string) => void
  className?: string
  editClassName?: string
  title?: string
  multiline?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          className={cn(editClassName ?? className, 'bg-transparent border-b-2 border-[#913631] outline-none w-full resize-none')}
          defaultValue={value}
          autoFocus
          rows={3}
          onClick={e => e.stopPropagation()}
          onBlur={e => {
            const val = e.target.value.trim()
            if (val) onChange(val)
            setIsEditing(false)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              const val = (e.target as HTMLTextAreaElement).value.trim()
              if (val) onChange(val)
              setIsEditing(false)
            }
          }}
        />
      )
    }
    return (
      <input
        className={cn(editClassName ?? className, 'bg-transparent border-b-2 border-[#913631] outline-none w-full')}
        defaultValue={value}
        autoFocus
        onClick={e => e.stopPropagation()}
        onBlur={e => {
          const val = e.target.value.trim()
          if (val) onChange(val)
          setIsEditing(false)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            const val = (e.target as HTMLInputElement).value.trim()
            if (val) onChange(val)
            setIsEditing(false)
          }
        }}
      />
    )
  }

  return (
    <button
      className={cn(className, 'hover:text-[#913631] transition-colors cursor-text')}
      onClick={e => {
        e.stopPropagation()
        setIsEditing(true)
      }}
      title={title ?? 'Click to edit'}
    >
      {value}
    </button>
  )
}

// ── Schedule Picker ────────────────────────────────────────

const SCHEDULE_OPTIONS = [
  { label: 'Daily 07:00', type: CadenceType.DAILY, time: '07:00' },
  { label: 'Daily 07:30', type: CadenceType.DAILY, time: '07:30' },
  { label: 'Daily 08:00', type: CadenceType.DAILY, time: '08:00' },
  { label: 'Daily 09:00', type: CadenceType.DAILY, time: '09:00' },
  { label: 'Hourly', type: CadenceType.HOURLY },
  { label: 'Weekly Monday', type: CadenceType.WEEKLY, day: DaysOfWeek.MONDAY, time: '08:00' },
  { label: 'Weekly Friday', type: CadenceType.WEEKLY, day: DaysOfWeek.FRIDAY, time: '08:00' },
]

function SchedulePicker({
  currentLabel,
  onSelect,
  onClose,
}: {
  currentLabel: string
  onSelect: (option: typeof SCHEDULE_OPTIONS[number]) => void
  onClose: () => void
}) {
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[140px]"
      onMouseLeave={onClose}
    >
      {SCHEDULE_OPTIONS.map(opt => (
        <button
          key={opt.label}
          className={cn(
            'w-full text-left text-[11px] px-3 py-1.5 rounded hover:bg-[#913631]/10 cursor-pointer',
            opt.label === currentLabel ? 'text-[#913631] font-semibold' : 'text-zinc-600',
          )}
          onClick={e => {
            e.stopPropagation()
            onSelect(opt)
            onClose()
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Agent Card ──────────────────────────────────────────────

function AgentCard({
  selection,
  onToggle,
  onUpdate,
  onEmojiChange,
}: {
  selection: AgentSelection
  onToggle: () => void
  onUpdate: (update: Partial<AgentSelection>) => void
  onEmojiChange: (emoji: string) => void
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)

  const template = AGENT_TEMPLATES.find(t => t.id === selection.templateId)
  const cadenceLabel = useMemo(() => {
    if (selection.isCustom) {
      return selection.customCadence ?? 'Daily'
    }
    if (!template) return ''
    const c = selection.cadenceOverride ?? template.defaultCadence
    if (c.type === 'weekly') return `Weekly ${c.dayOfWeek ?? ''}`
    if (c.type === 'daily') return `Daily ${c.time ?? ''}`
    if (c.type === 'hourly') return 'Hourly'
    return c.type
  }, [template, selection])

  const description = selection.descriptionOverride
    ?? (selection.isCustom
      ? (selection.customPrompt?.slice(0, 60) ?? '') + '...'
      : template?.description ?? '')

  return (
    <div
      className={cn(
        'relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none',
        'w-[160px] min-h-[200px]',
        selection.enabled
          ? 'border-[#913631] bg-white shadow-md'
          : 'border-gray-200 bg-gray-50 opacity-60',
      )}
      onClick={onToggle}
    >
      {/* Toggle indicator */}
      <div
        className={cn(
          'absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          selection.enabled
            ? 'border-[#913631] bg-[#913631]'
            : 'border-gray-300 bg-white',
        )}
      >
        {selection.enabled && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Emoji */}
      <div className="relative mt-2">
        <button
          className="text-3xl hover:scale-110 transition-transform cursor-pointer"
          onClick={e => {
            e.stopPropagation()
            setShowEmojiPicker(!showEmojiPicker)
          }}
          title="Click to change emoji"
        >
          {selection.identity.emoji}
        </button>
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={onEmojiChange}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </div>

      {/* Name (editable) */}
      <EditableText
        value={selection.identity.displayName}
        onChange={name => onUpdate({ identity: { ...selection.identity, displayName: name } })}
        className="mt-2 text-sm font-semibold font-InterTight text-zinc-900 text-center"
        title="Click to rename"
      />

      {/* Personality / subtitle (editable) */}
      <EditableText
        value={selection.identity.personality}
        onChange={personality => onUpdate({ identity: { ...selection.identity, personality } })}
        className="mt-1 text-xs text-zinc-500 font-InterTight text-center leading-tight"
        title="Click to edit subtitle"
      />

      {/* Description (editable) */}
      <EditableText
        value={description}
        onChange={desc => onUpdate({ descriptionOverride: desc })}
        className="mt-2 text-[10px] text-zinc-400 font-InterTight text-center leading-tight flex-1"
        title="Click to edit description"
        multiline
      />

      {/* Cadence badge (editable) */}
      <div className="relative mt-2">
        <button
          className="text-[10px] font-medium text-[#913631] bg-[#913631]/10 px-2 py-0.5 rounded-full hover:bg-[#913631]/20 transition-colors cursor-pointer"
          onClick={e => {
            e.stopPropagation()
            setShowSchedulePicker(!showSchedulePicker)
          }}
          title="Click to change schedule"
        >
          {cadenceLabel}
        </button>
        {showSchedulePicker && (
          <SchedulePicker
            currentLabel={cadenceLabel}
            onSelect={opt => {
              onUpdate({
                cadenceOverride: {
                  type: opt.type,
                  time: opt.time,
                  dayOfWeek: opt.day,
                },
              })
            }}
            onClose={() => setShowSchedulePicker(false)}
          />
        )}
      </div>
    </div>
  )
}

// ── Screen Container (reuses onboarding pattern) ────────────

function ScreenContainer({
  index,
  children,
  currentSlideInScreen,
  currentSlideOutScreen,
}: {
  index: number
  children: ReactNode
  currentSlideInScreen?: number
  currentSlideOutScreen?: number
}) {
  return (
    <div
      className={cn(
        'w-full max-w-6xl mx-auto flex flex-col justify-center items-center h-full',
        {
          hidden: currentSlideInScreen !== index && currentSlideOutScreen !== index,
          [styles.entranceTransition]: currentSlideInScreen === index,
          [styles.exitTransition]: currentSlideOutScreen === index,
        },
      )}
    >
      {children}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────

export default function AgentPickerScreen({
  index,
  currentSlideInScreen,
  currentSlideOutScreen,
  // connectedProvider is used by the parent (index.tsx) when creating automations via onActivate
  connectedProvider: _connectedProvider,
  onActivate,
  onSkip,
}: AgentPickerScreenProps) {
  const [selections, setSelections] = useState<AgentSelection[]>(() => {
    // If the app was opened from a role landing page, start with just that
    // worker selected. Otherwise keep the existing all-on default.
    const intent = getOnboardingIntent()
    return selectionsForTemplate(intent?.templateId)
  })
  const [agentmakerResults, setAgentmakerResults] = useState<AgentSelection[]>([])
  const [agentmakerLoading, setAgentmakerLoading] = useState(false)
  const [agentmakerError, setAgentmakerError] = useState<string | null>(null)
  const [agentmakerRan, setAgentmakerRan] = useState(false)

  useEffect(() => {
    const handleIntent = (event: Event) => {
      const intent = (event as CustomEvent<OnboardingIntent>).detail
      if (intent?.templateId) setSelections(selectionsForTemplate(intent.templateId))
    }

    window.addEventListener(ONBOARDING_INTENT_EVENT, handleIntent)
    return () => window.removeEventListener(ONBOARDING_INTENT_EVENT, handleIntent)
  }, [])

  const enabledCount = useMemo(
    () => [...selections, ...agentmakerResults].filter(s => s.enabled).length,
    [selections, agentmakerResults],
  )

  const updateSelection = useCallback((templateId: string, update: Partial<AgentSelection>) => {
    setSelections(prev =>
      prev.map(s => (s.templateId === templateId ? { ...s, ...update } : s)),
    )
  }, [])

  const updateAgentmakerSelection = useCallback(
    (idx: number, update: Partial<AgentSelection>) => {
      setAgentmakerResults(prev => prev.map((s, i) => (i === idx ? { ...s, ...update } : s)))
    },
    [],
  )

  const handleActivate = useCallback(() => {
    const allSelections = [...selections, ...agentmakerResults]
    clearOnboardingIntent()
    onActivate(allSelections)
  }, [selections, agentmakerResults, onActivate])

  const handleAgentmaker = useCallback(async () => {
    setAgentmakerLoading(true)
    setAgentmakerError(null)
    try {
      const res = await fetch('http://127.0.0.1:8897/api/clawd/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: AGENTMAKER_PROMPT,
          context: 'agentmaker',
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const responseText: string = data?.response ?? data?.message ?? JSON.stringify(data)

      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('No JSON array found in response')

      const agents: Array<{
        name: string
        emoji: string
        description: string
        sources: string[]
        cadence: string
        prompt: string
      }> = JSON.parse(jsonMatch[0])

      const customSelections: AgentSelection[] = agents.slice(0, 3).map((agent, i) => ({
        templateId: `agentmaker-${i}`,
        enabled: true,
        isCustom: true,
        customPrompt: agent.prompt,
        customSources: agent.sources,
        customCadence: agent.cadence,
        identity: {
          displayName: agent.name,
          emoji: agent.emoji || '🤖',
          personality: agent.description,
          soul: `You are ${agent.name}. ${agent.description}`,
        },
      }))

      setAgentmakerResults(customSelections)
      setAgentmakerRan(true)
    } catch (err) {
      console.error('Agentmaker failed:', err)
      setAgentmakerError("Couldn't analyze your tools right now. You can try again from Settings.")
      setAgentmakerRan(true)
    } finally {
      setAgentmakerLoading(false)
    }
  }, [])

  return (
    <ScreenContainer
      index={index}
      currentSlideInScreen={currentSlideInScreen}
      currentSlideOutScreen={currentSlideOutScreen}
    >
      <div className="flex flex-col items-center w-full max-w-[700px] overflow-y-auto max-h-full py-6">
        {/* Header */}
        <div className="text-center text-black text-4xl font-semibold font-Lora leading-10">
          Let's assemble your dream team
        </div>
        <div className="mt-4 text-center text-zinc-600 text-base font-normal font-InterTight leading-relaxed max-w-[520px]">
          I've picked four specialists based on your connected tools. Each one runs independently
          — like hiring your dream team.
        </div>

        {/* Agent cards */}
        <div className="mt-8 flex flex-row flex-wrap justify-center gap-4">
          {selections.map(selection => (
            <AgentCard
              key={selection.templateId}
              selection={selection}
              onToggle={() =>
                updateSelection(selection.templateId, { enabled: !selection.enabled })
              }
              onUpdate={update => updateSelection(selection.templateId, update)}
              onEmojiChange={emoji =>
                updateSelection(selection.templateId, {
                  identity: { ...selection.identity, emoji },
                })
              }
            />
          ))}
        </div>

        {/* Agentmaker results */}
        {agentmakerResults.length > 0 && (
          <>
            <div className="mt-6 text-sm text-zinc-500 font-InterTight font-medium">
              Suggested by Agentmaker
            </div>
            <div className="mt-3 flex flex-row flex-wrap justify-center gap-4">
              {agentmakerResults.map((selection, idx) => (
                <AgentCard
                  key={selection.templateId}
                  selection={selection}
                  onToggle={() =>
                    updateAgentmakerSelection(idx, { enabled: !selection.enabled })
                  }
                  onUpdate={update => updateAgentmakerSelection(idx, update)}
                  onEmojiChange={emoji =>
                    updateAgentmakerSelection(idx, {
                      identity: { ...selection.identity, emoji },
                    })
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* Hint text */}
        <div className="mt-4 text-xs text-zinc-400 font-InterTight">
          Click any field to customize · Click emoji to change
        </div>

        {/* Activate button */}
        <button
          className={cn(
            'mt-6 w-80 h-14 px-6 py-3 rounded-[40px] shadow-[inset_0px_0px_1px_0px_rgba(0,0,0,0.25)] justify-center items-center inline-flex text-white text-xl font-semibold font-InterTight leading-[30px] transition-opacity',
            enabledCount > 0
              ? 'bg-[#913631] cursor-pointer hover:opacity-90'
              : 'bg-gray-300 cursor-not-allowed',
          )}
          disabled={enabledCount === 0}
          onClick={handleActivate}
        >
          {enabledCount > 0 ? `Activate My Team (${enabledCount})` : 'Select at least one agent'}
        </button>

        {/* Agentmaker trigger */}
        {!agentmakerRan && (
          <button
            className="mt-4 text-[#913631] text-sm font-medium font-InterTight cursor-pointer hover:opacity-80 flex items-center gap-2"
            onClick={handleAgentmaker}
            disabled={agentmakerLoading}
          >
            {agentmakerLoading ? (
              <>
                <LoadingIcon className="w-4 h-4" />
                Analyzing your connected tools...
              </>
            ) : (
              '✨ Suggest more agents based on my workflow'
            )}
          </button>
        )}
        {agentmakerError && (
          <div className="mt-2 text-xs text-zinc-400 font-InterTight">{agentmakerError}</div>
        )}

        {/* Skip */}
        <button
          className="mt-3 mb-4 text-zinc-500 text-sm font-medium font-InterTight underline leading-tight cursor-pointer hover:text-zinc-700"
          onClick={() => onSkip(index)}
        >
          Skip for now
        </button>
      </div>
    </ScreenContainer>
  )
}
