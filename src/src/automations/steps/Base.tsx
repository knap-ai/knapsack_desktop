import { HandleAutomationCallArgs } from 'src/hooks/automation/useAutomations'
import DataFetcher from 'src/utils/data_fetch'

import { WebSearchResponse } from 'src/App'

import { AutomationDataSources, AutomationTrigger } from '../automation'

export type StepExecuteContext = {
  userEmail?: string
  response?: string // The automation final output
  userPrompt?: string
  userPromptFacade?: string
  documents?: number[]
  trigger?: AutomationTrigger
  [key: string]: unknown
}

export type StepExecuteHelpers = {
  getIsAutomationReadyPolling: () => Promise<void>
  dataFetcher: DataFetcher
  submitWebSearch: (content: string) => Promise<WebSearchResponse | undefined>
  handleChatbotAutomationRun: ({
    documents,
    additionalDocuments,
    userPrompt,
    userPromptFacade,
    semanticSearchQuery,
  }: Omit<HandleAutomationCallArgs, 'args'>) => Promise<void>
}

export default abstract class BaseStep {
  protected sources: AutomationDataSources[]
  protected argsJSON?: string

  constructor({
    sources,
    argsJSON,
  }: {
    sources: AutomationDataSources[]
    argsJSON?: string | null
  }) {
    this.sources = sources
    this.argsJSON = argsJSON ?? undefined
  }

  async execute(context: StepExecuteContext, _helpers: StepExecuteHelpers) {
    return { ...context }
  }

  getSources() {
    return this.sources
  }

  serialize() {
    return {
      name: (this.constructor as typeof BaseStep).getName(),
      args_json: this.argsJSON,
    }
  }

  static getName(): string {
    throw Error('Missing getName implementation')
  }

  static create(_argsJSON: string | null) {
    throw Error('Missing create implementation')
  }
}
