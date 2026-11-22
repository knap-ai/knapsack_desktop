import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import cn from 'classnames'
import debounce from 'lodash/debounce'
import { IThread } from 'src/api/threads'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { isNotesTemplateBusy } from 'src/utils/notesGenerationAdmission'
import { getProfileRevision } from 'src/utils/profileScope'
import {
  CLIENT_DISCOVERY_MEETING,
  FINANCIAL_PLAN_IMPLEMENTATION,
  FINANCIAL_PLAN_PRESENTATION,
  INTERNAL_MEETING,
  MeetingTemplatePrompt,
  ONBOARDING_DATA_GATHERING,
} from 'src/utils/template_prompts'

import styles from './styles.module.scss'

interface TemplatesViewProps {
  onClose: () => void
  thread: IThread
  setMeetingTemplatePrompt: (meetingTemplate: MeetingTemplatePrompt) => void | Promise<void>
}

const TemplatesView: React.FC<TemplatesViewProps> = ({
  onClose,
  thread,
  setMeetingTemplatePrompt,
}) => {
  const [busy, setBusy] = useState(() => isNotesTemplateBusy(thread.id))
  useEffect(() => {
    const refresh = () => setBusy(isNotesTemplateBusy(thread.id))
    refresh()
    const timer = setInterval(refresh, 200)
    return () => clearInterval(timer)
  }, [thread.id])
  const purposes: Record<string, string> = {
    INTERNAL_MEETING: 'Progress, decisions, and next steps.',
    CLIENT_DISCOVERY_MEETING: 'Client goals and discovery.',
    ONBOARDING_DATA_GATHERING: 'Information needed for onboarding.',
    FINANCIAL_PLAN_PRESENTATION: 'Plan recommendations and questions.',
    FINANCIAL_PLAN_IMPLEMENTATION: 'Implementation and responsibilities.',
  }
  const [selectionError, setSelectionError] = useState('')
  const [selecting, setSelecting] = useState(false)
  const activeSelection = useRef<symbol | null>(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      activeSelection.current = null
    }
  }, [])
  const meetingTemplates: MeetingTemplatePrompt[] = [
    INTERNAL_MEETING,
    CLIENT_DISCOVERY_MEETING,
    ONBOARDING_DATA_GATHERING,
    FINANCIAL_PLAN_PRESENTATION,
    FINANCIAL_PLAN_IMPLEMENTATION,
  ]
  const initialSelectedIndex = thread?.promptTemplate
    ? meetingTemplates.findIndex(template => template.key === thread.promptTemplate)
    : null

  const [selectedMeetingTemplate, setSelectedMeetingTemplate] = useState<number | null>(
    initialSelectedIndex,
  )
  const [additionalInstructionsMap, setAdditionalInstructionsMap] = useState<
    Record<string, string>
  >({})

  useState(() => {
    const loadAllInstructions = async () => {
      const instructionsMap: Record<string, string> = {}
      for (const template of meetingTemplates) {
        instructionsMap[template.key] = (await KNLocalStorage.getItem(template.key)) || ''
      }
      setAdditionalInstructionsMap(instructionsMap)
    }

    loadAllInstructions()
  })

  const getAdditionalInstructions = (key: string): string => {
    return additionalInstructionsMap[key] || ''
  }

  // Debounce the disk write so we don't call writeTextFile on every keystroke
  const debouncedSaveToStorage = useMemo(
    () =>
      debounce((key: string, value: string) => {
        KNLocalStorage.setItem(key, value)
      }, 600),
    [],
  )

  const setAdditionalInstructions = useCallback(
    (key: string, instructions: string) => {
      // Update local state immediately for responsive typing
      setAdditionalInstructionsMap(prev => ({
        ...prev,
        [key]: instructions,
      }))
      // Debounce the expensive disk write
      debouncedSaveToStorage(key, instructions)
    },
    [debouncedSaveToStorage],
  )

  return (
    <div
      className="text-ks-warm-grey-900 w-full max-w-[18em] mt-3 mr-0 ml-1"
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
      }}
    >
      <div className="flex flex-row w-full mt-6 justify-between pl-1 pr-3">
        <div className="uppercase text-ks-warm-grey-800 font-Lora font-bold text-xs leading-4 tracking-[1.44px] ml-1">
          Templates
        </div>
        <button
          type="button"
          aria-label="Close templates"
          className="p-2 rounded focus-visible:outline"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <>
        {selectionError && <p role="alert">{selectionError}</p>}
        {(selecting || busy) && (
          <p role="status" className="text-xs px-2 mt-2">
            Updating notes…{' '}
            <span className="text-ks-warm-grey-600">Choose a template when ready.</span>
          </p>
        )}
        <div className="flex-1 flex flex-col overflow-hidden mt-6 mb-24">
          <div className={cn('space-y-2 flex-1 overflow-auto pl-1 pr-3', styles.scrollbarHide)}>
            {meetingTemplates.map((template, index) => (
              <div
                key={index}
                className={`p-3 rounded-md cursor-pointer border-[1px] border-ks-warm-grey-200 hover:bg-ks-warm-grey-100 transition-colors ${selectedMeetingTemplate === index ? 'bg-ks-warm-grey-100' : 'bg-white '}`}
              >
                <button
                  type="button"
                  className="text-left w-full rounded focus-visible:outline"
                  aria-pressed={selectedMeetingTemplate === index}
                  disabled={selecting || busy}
                  onClick={async () => {
                    if (activeSelection.current) {
                      setSelectionError(
                        'A template change is still being saved. Wait, then choose again.',
                      )
                      return
                    }
                    const token = Symbol()
                    const revision = getProfileRevision()
                    activeSelection.current = token
                    setSelecting(true)
                    try {
                      await setMeetingTemplatePrompt(meetingTemplates[index])
                      if (
                        !mounted.current ||
                        activeSelection.current !== token ||
                        revision !== getProfileRevision()
                      )
                        return
                      setSelectionError('')
                      setSelectedMeetingTemplate(index)
                    } catch (error) {
                      if (
                        mounted.current &&
                        activeSelection.current === token &&
                        revision === getProfileRevision()
                      )
                        setSelectionError(
                          error instanceof Error
                            ? error.message
                            : 'Could not change template. Try again.',
                        )
                    } finally {
                      if (mounted.current && activeSelection.current === token) {
                        activeSelection.current = null
                        setSelecting(false)
                      }
                    }
                  }}
                >
                  <p className="text-start text-ks-warm-grey-950 font-semibold text-xs leading-[18px] mb-2">
                    {template.title}
                  </p>
                  <p className="text-start text-ks-warm-grey-950 leading-[18px] text-xs mb-2">
                    {purposes[template.key] || 'Meeting summary and next steps.'}
                  </p>
                </button>
                <details className="text-xs mt-1">
                  <summary className="cursor-pointer text-ks-warm-grey-600">Instructions</summary>
                  <p className="mt-2 leading-relaxed">{template.user_facing_description}</p>
                </details>
                {selectedMeetingTemplate === index && (
                  <div className="mt-3">
                    <div className="text-start text-ks-warm-grey-800 font-semibold text-xxs leading-2 mb-2 uppercase">
                      Additional Instructions
                    </div>
                    <textarea
                      className="w-full min-h-36 p-2 text-xs border-[1px] border-[#E5E7EB] border-ks-warm-grey-200 rounded-md focus:outline-none focus:ring-1 focus:ring-ks-warm-grey-400"
                      rows={3}
                      placeholder="Add any specific instructions here..."
                      value={getAdditionalInstructions(template.key)}
                      onChange={e => setAdditionalInstructions(template.key, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </>
    </div>
  )
}

export default TemplatesView
