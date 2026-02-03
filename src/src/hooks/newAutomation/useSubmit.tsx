import { ReactElement } from 'react'

import { insertAutomationToServer, upsertAutomation } from 'src/api/automations'
import {
  Automation,
  AutomationDataSources,
  CadenceType,
  DaysOfWeek,
} from 'src/automations/automation'
import Prompt from 'src/automations/steps/Prompt'
import SemanticSearch from 'src/automations/steps/SemanticSearch'
import { DISCORD_LINK } from 'src/utils/constants'
import KNAnalytics from 'src/utils/KNAnalytics'

import { ToastrState } from 'src/components/templates/Home/Home'

import { IFeed } from '../feed/useFeed'
import { SelectedSources } from './useNewAutomation'

const useSubmit = (
  saveLocally: boolean,
  user_email: string,
  handleBackButton: () => void,
  handleOpenToastr: (
    message: ReactElement,
    alertType: ToastrState['alertType'],
    autoHideDuration?: number,
  ) => void,
  feed?: IFeed,
) => {
  const handleSubmitClick = async (
    llmPromptRef: React.RefObject<HTMLTextAreaElement>,
    selectedSources: SelectedSources[],
    automationCadence: CadenceType,
    time: string | undefined,
    dayOfWeek: DaysOfWeek | undefined,
    descriptionCadence: string | undefined,
    flagLocal: boolean,
  ) => {
    KNAnalytics.trackEvent('NewAutomationSubmitClick', {})
    const llmPrompt = llmPromptRef.current?.value
    const timestamp = Date.now()
    const automationName = `${timestamp} - ${user_email}`
    const description = ''
    const selectedDataSourceIds = selectedSources
      .filter(source => source.sourceId !== undefined)
      .map(source => source.sourceId) as AutomationDataSources[]

    if (!llmPrompt) {
      handleOpenToastr(<span>Please tell what knapsack should do</span>, 'error', 3000)
      return
    }

    if (selectedDataSourceIds.length <= 0) {
      handleOpenToastr(
        <span>Please select at least one data source to create an automation</span>,
        'error',
        3000,
      )
      return
    }

    if (
      (automationCadence === CadenceType.DAILY || automationCadence === CadenceType.WEEKLY) &&
      !time
    ) {
      handleOpenToastr(
        <span>Please verify the time for daily or weekly automations</span>,
        'error',
        3000,
      )
      return
    }

    if (automationCadence === CadenceType.WEEKLY && !dayOfWeek) {
      handleOpenToastr(
        <span>Please select the day of the week for weekly automations</span>,
        'error',
        3000,
      )
      return
    }

    if (llmPrompt && selectedDataSourceIds.length > 0) {
      const automation = new Automation({
        name: automationName,
        description: description,
        steps: [
          new SemanticSearch({
            sources: selectedDataSourceIds,
            userPrompt: llmPrompt,
            useLocal: flagLocal,
            descriptionOtherCadence: descriptionCadence,
          }),
          new Prompt({ userPrompt: llmPrompt }),
        ],
        runs: [],
        cadences:
          automationCadence !== CadenceType.NEVER
            ? [
                {
                  type: automationCadence,
                  time: time,
                  dayOfWeek,
                },
              ]
            : [],
      })
      try {
        await insertAutomationToServer(automation, user_email)
        if (saveLocally) {
          await upsertAutomation(automation)
        } else {
          let cadenceDescription = ''
          if (automationCadence === CadenceType.NEVER) {
            cadenceDescription = 'On Request'
          } else if (automationCadence === CadenceType.OTHER && descriptionCadence !== undefined) {
            cadenceDescription = descriptionCadence
          } else if (automationCadence === CadenceType.DAILY) {
            cadenceDescription = 'Daily ' + ' at ' + time
          } else if (automationCadence === CadenceType.WEEKLY) {
            cadenceDescription = 'Weekly ' + ' at ' + time + ' on ' + dayOfWeek
          } else if (automationCadence === CadenceType.HOURLY) {
            cadenceDescription = 'Hourly'
          }

          const runLocally = flagLocal ? 'Yes' : 'No'

          if (feed) {
            const { feedItem, threadId } = await feed.insertFeedItem(
              new Date().getTime(),
              true,
              'Submit New Automation',
            )
            await feed.insertMessageToFeedItem(
              feedItem,
              'Congratulations, you’ve requested an automation! If you’d like to request another one you can always click the button in the lower left hand corner of the screen. Join us on [Discord](' +
                DISCORD_LINK +
                ') if you have additional feedback or ideas. \n' +
                'Your requested automation: \n' +
                '**Selected Sources**: ' +
                selectedSources.map(source => source.label).join(', ') +
                '\n **What Knapsack should do**: ' +
                llmPrompt +
                '\n **When should this automation run**: ' +
                cadenceDescription +
                '\n **Run Locally**: ' +
                runLocally,
              new Date(),
              undefined,
              undefined,
              threadId,
            )
          }
        }
      } catch {
        handleOpenToastr(<span>Error requesting automation, please try later</span>, 'error', 3000)
      }
      handleBackButton()
    }
  }
  return { handleSubmitClick }
}
export default useSubmit
