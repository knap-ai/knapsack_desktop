import { useEffect, useState } from 'react'
import { KNLocalStorage, EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS, EMAIL_AUTOPILOT_SCHEDULING_LINKS } from 'src/utils/KNLocalStorage'
import { Typography } from 'src/components/atoms/typography'

interface EmailAutopilotSettingsProps {
  onClose: () => void
}

const EmailAutopilotSettings = ({ onClose }: EmailAutopilotSettingsProps) => {
  const [customInstructions, setCustomInstructions] = useState('')
  const [schedulingLinks, setSchedulingLinks] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      const savedInstructions = await KNLocalStorage.getItem(EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS)
      const savedLinks = await KNLocalStorage.getItem(EMAIL_AUTOPILOT_SCHEDULING_LINKS)

      if (savedInstructions) {
        setCustomInstructions(savedInstructions)
      }

      if (savedLinks) {
        setSchedulingLinks(savedLinks)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    await KNLocalStorage.setItem(EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS, customInstructions)
    await KNLocalStorage.setItem(EMAIL_AUTOPILOT_SCHEDULING_LINKS, schedulingLinks)
    onClose()
  }

  return (
    <div className="h-full w-full flex flex-col bg-white p-4 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="uppercase text-ks-warm-grey-800 font-Lora font-bold text-xs leading-4 tracking-[1.44px] ml-1">Email Autopilot Settings</div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col mb-6">
        <Typography className="mb-2 font-medium">Custom Instructions</Typography>
        <textarea
          className="text-sm border border-gray-300 rounded-lg p-3 w-full h-64 resize-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          placeholder="Add specific instructions to customize how your email drafts are generated..."
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
        />
        <Typography className="mt-1 text-xs text-gray-500">
          These instructions will be included when generating email drafts
        </Typography>
      </div>

      <div className="flex flex-col mb-6">
        <Typography className="mb-2 font-medium">Scheduling Links</Typography>
        <textarea
          className="text-sm border border-gray-300 rounded-lg p-3 w-full h-64 resize-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          placeholder="Add your scheduling links (e.g., Calendly, Chili Piper)..."
          value={schedulingLinks}
          onChange={(e) => setSchedulingLinks(e.target.value)}
        />
        <Typography className="mt-1 text-xs text-gray-500">
          These links will be available for the AI to include in your email drafts
        </Typography>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default EmailAutopilotSettings
