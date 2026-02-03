import { ReactElement, useCallback, useState } from 'react'

import { Automation, AutomationDataSources } from 'src/automations/automation'
import Prompt from 'src/automations/steps/Prompt'
import SemanticSearch from 'src/automations/steps/SemanticSearch'
import KNAnalytics from 'src/utils/KNAnalytics'

import { ToastrState } from 'src/components/templates/Home/Home'

import { SelectedSources } from './useNewAutomation'

const usePreview = (
  handleAutomation: (
    automation: Automation,
    onAutomationFinishCallback: (message: string) => void,
  ) => Promise<void>,
  flagUseLocalLLM: boolean,
  setUseLocalLLM: (useLocalLLM: boolean) => void,
  handleOpenToastr: (
    message: ReactElement,
    alertType: ToastrState['alertType'],
    autoHideDuration?: number,
  ) => void,
) => {
  const [preview, setPreview] = useState('Preview only includes connected data sources')
  const handlePreviewClick = useCallback(
    async (
      userPromptRef: React.RefObject<HTMLTextAreaElement>,
      selectedSources: SelectedSources[],
      flagLocal: boolean,
    ) => {
      const userPrompt = userPromptRef.current?.value
      const automationName = ''
      const selectedDataSourceIds = selectedSources
        .filter(source => source.sourceId !== undefined)
        .map(source => source.sourceId) as AutomationDataSources[]

      KNAnalytics.trackEvent('NewAutomationPreviewClick', {
        userPrompt: userPrompt,
        selectedSources: selectedSources.map(source => source.label),
        flagLocal: flagLocal.toString(),
      })

      if (userPrompt && selectedDataSourceIds.length > 0) {
        const newAutomation = new Automation({
          name: automationName,
          description: '',
          steps: [
            new SemanticSearch({
              sources: selectedDataSourceIds,
              userPrompt: userPrompt
            }),
            new Prompt({ userPrompt: userPrompt }),
          ],
          runs: [],
          cadences: [],
        })
        setPreview('Loading Preview ...')
        setUseLocalLLM(flagLocal)
        try {
          await handleAutomation(newAutomation, message =>
            setPreview(message ?? 'No output received'),
          )
        } catch {
          handleOpenToastr(<span>Error generating preview, please try later</span>, 'error', 3000)
          setPreview('Error generating preview')
        }
        setUseLocalLLM(flagUseLocalLLM)
      }
    },
    [],
  )

  return { preview, handlePreviewClick }
}
export default usePreview
