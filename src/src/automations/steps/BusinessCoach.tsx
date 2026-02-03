import { getDocumentInfos, getDriveDocumentsIds } from 'src/api/data_source'
import { BUSINESS_COACH_PROMPT } from 'src/prompts'
import { KNFileType } from 'src/utils/KNSearchFilters'

import {
  serializeWebSearchToLLMAdditionalDocuments,
  WebSearchResponse,
} from 'src/App'

import { AutomationDataSources } from '../automation'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class BusinessCoachAutomation extends BaseStep {
  constructor() {
    super({
      sources: [
        AutomationDataSources.GMAIL,
        AutomationDataSources.DRIVE,
        AutomationDataSources.LOCAL_FILES,
        AutomationDataSources.WEB,
        AutomationDataSources.GOOGLE_CALENDAR,
      ],
    })
  }
  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const { userEmail, timestamp } = context as { userEmail?: string; timestamp?: number }

    if (!userEmail) {
      throw new Error('You need to login with your Google account to access this functionality')
    }

    const userPromptFacade = `Provide some business advices.`
    const userPrompt = BUSINESS_COACH_PROMPT

    const semanticSearchResults = await Promise.all(
      this.sources.map(async source => {
        return helpers.dataFetcher.semanticSearch(userPrompt, [], [source], 10)
      }),
    )
    const todayEmails = await helpers.dataFetcher.getGmailDateMessages(
      timestamp ? new Date(timestamp as number) : new Date(),
    )
    const driveDocumentIds = await getDriveDocumentsIds(
      todayEmails.map(email => email.emailUid),
      userEmail,
    )
    const identifiers = [
      ...todayEmails.map(email => email.emailUid),
      ...driveDocumentIds.map(id => id),
    ]
    const types = [
      ...todayEmails.map(() => KNFileType.EMAIL),
      ...driveDocumentIds.map(() => KNFileType.DRIVE_FILE),
    ]
    const webResponse = context.webResponse as WebSearchResponse | null | undefined
    const additionalDocuments = serializeWebSearchToLLMAdditionalDocuments(webResponse ?? undefined)
    const semanticDocs = semanticSearchResults.flat().map(result => result.documentId)
    const localDocs = (await getDocumentInfos(identifiers, types)).map(item => item.documentId)
    const documents = [...localDocs, ...semanticDocs]
    await helpers.handleChatbotAutomationRun({
      documents: documents,
      additionalDocuments: additionalDocuments,
      userPrompt,
      userPromptFacade,
      semanticSearchQuery: 'Provide business advices for me',
    })
    return super.execute({ ...context }, helpers)
  }

  static getName(): string {
    return 'business-coach'
  }

  static create() {
    return new BusinessCoachAutomation()
  }
}
