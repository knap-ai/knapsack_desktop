import { SourceDocument } from 'src/utils/SourceDocument'
import { serializeWebSearchToLLMAdditionalDocuments, WebSearchResponse } from 'src/App'

import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class Prompt extends BaseStep {
  private userPrompt: string

  constructor({ userPrompt }: { userPrompt: string }) {
    super({ sources: [], argsJSON: JSON.stringify({ userPrompt }) })
    this.userPrompt = userPrompt
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const semanticSearchResults = context.semanticSearchResults as SourceDocument[]
    const docIds = semanticSearchResults.map(res => res.documentId)
    const webResponse = context.webResponse as WebSearchResponse | null | undefined
    let additionalDocuments: {title: string, content: string}[] = []
    if (webResponse !== null) {
      additionalDocuments = serializeWebSearchToLLMAdditionalDocuments(
        webResponse
      )
    }

    await helpers.handleChatbotAutomationRun({
      documents: docIds,
      additionalDocuments: additionalDocuments,
      userPrompt: this.userPrompt,
      userPromptFacade: this.userPrompt,
    })

    return super.execute({ ...context, userPrompt: this.userPrompt }, helpers)
  }

  static getName(): string {
    return 'prompt'
  }

  static create(args_json: string | null) {
    const args = JSON.parse(args_json ?? '{}') as ConstructorParameters<typeof Prompt>[0]
    return new Prompt(args)
  }
}
