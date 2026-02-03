import cn from 'classnames'
import { useState } from "react"
import { MeetingTemplatePrompt, INTERNAL_MEETING, CLIENT_DISCOVERY_MEETING, ONBOARDING_DATA_GATHERING, FINANCIAL_PLAN_PRESENTATION, FINANCIAL_PLAN_IMPLEMENTATION } from 'src/utils/template_prompts'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { IThread } from 'src/api/threads'

import styles from './styles.module.scss'

interface TemplatesViewProps {
  onClose: () => void;
  thread: IThread,
  setMeetingTemplatePrompt: (meetingTemplate: MeetingTemplatePrompt) => void;
}

const TemplatesView: React.FC<TemplatesViewProps> = ({
  onClose,
  thread,
  setMeetingTemplatePrompt,
}) => {
  const meetingTemplates: MeetingTemplatePrompt[] = [
    INTERNAL_MEETING, CLIENT_DISCOVERY_MEETING, ONBOARDING_DATA_GATHERING, FINANCIAL_PLAN_PRESENTATION, FINANCIAL_PLAN_IMPLEMENTATION
  ]
  const initialSelectedIndex = thread?.promptTemplate
    ? meetingTemplates.findIndex(template => template.key === thread.promptTemplate)
    : null

  const [selectedMeetingTemplate, setSelectedMeetingTemplate] = useState<number | null>(initialSelectedIndex)
  const [additionalInstructionsMap, setAdditionalInstructionsMap] = useState<Record<string, string>>({})

  useState(() => {
    const loadAllInstructions = async () => {
      const instructionsMap: Record<string, string> = {}
      for (const template of meetingTemplates) {
        instructionsMap[template.key] = await KNLocalStorage.getItem(template.key) || ""
      }
      setAdditionalInstructionsMap(instructionsMap)
    }

    loadAllInstructions()
  })

  const getAdditionalInstructions = (key: string): string => {
    return additionalInstructionsMap[key] || "";
  }

  const setAdditionalInstructions = (key: string, instructions: string) => {
    KNLocalStorage.setItem(key, instructions);
    setAdditionalInstructionsMap(prev => ({
      ...prev,
      [key]: instructions
    }));
  }

  return (
    <div className="text-ks-warm-grey-900 w-[18em] mt-3 mr-0 ml-1 ">
      <div className="flex flex-row w-full mt-6 justify-between pl-1 pr-3">
        <div className="uppercase text-ks-warm-grey-800 font-Lora font-bold text-xs leading-4 tracking-[1.44px] ml-1">
          Templates
        </div>
        <img className="h-2.5 my-auto cursor-pointer" src="assets/images/icons/x_close.svg" onClick={() => onClose()} />
      </div>
      <>
        <div className="flex-1 flex flex-col overflow-hidden mt-6 mb-24">
          <div className={
              cn("space-y-4 flex-1 overflow-auto pl-1 pr-3",
                 styles.scrollbarHide)}>
            {meetingTemplates.map((template, index) => (
              <div
                key={index}
                className={`p-3 rounded-md cursor-pointer border-[1px] border-ks-warm-grey-200 hover:bg-ks-warm-grey-100 transition-colors ${selectedMeetingTemplate === index ? "bg-ks-warm-grey-100" : "bg-white "}`
                }
                onClick={() => {
                  setSelectedMeetingTemplate(index)
                  setMeetingTemplatePrompt(meetingTemplates[index])
                }}
              >
                <p className="text-start text-ks-warm-grey-950 font-semibold text-xs leading-[18px] mb-2">
                  {template.title}
                </p>
                <p className="text-start text-ks-warm-grey-950 leading-[18px] text-xs mb-2">
                  {template.user_facing_description}
                </p>
                {selectedMeetingTemplate === index && (
                  <div className="mt-6">
                    <div className="text-start text-ks-warm-grey-800 font-semibold text-xxs leading-2 mb-2 uppercase">
                      Additional Instructions
                    </div>
                    <textarea
                      className="w-full min-h-36 p-2 text-xs border-[1px] border-[#E5E7EB] border-ks-warm-grey-200 rounded-md focus:outline-none focus:ring-1 focus:ring-ks-warm-grey-400"
                      rows={3}
                      placeholder="Add any specific instructions here..."
                      value={getAdditionalInstructions(template.key)}
                      onChange={(e) => setAdditionalInstructions(template.key, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </>
    </div>
  );
}

export default TemplatesView;
