import { KNFileType } from "src/utils/KNSearchFilters";
import { AutomationDataSources } from "../automation";
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from "./Base";
import { getDocumentInfos, getDriveDocumentsIds } from "src/api/data_source";
import { SOCIAL_MEDIA_PLANNER } from "src/prompts";
import { serializeWebSearchToLLMAdditionalDocuments, WebSearchResponse } from 'src/App'

export default class SocialMediaPlanner extends BaseStep {
  constructor() {
    super({
        sources: [
        AutomationDataSources.GMAIL,
        AutomationDataSources.DRIVE,
        AutomationDataSources.LOCAL_FILES,
        AutomationDataSources.GOOGLE_CALENDAR,
        AutomationDataSources.WEB,
        ],
    })
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const { userEmail, timestamp } = context as { userEmail?: string; timestamp: number }

    if (!userEmail) {
      throw new Error('You need to login with your Google account to access this functionality')
    }

    const todayEmails = await helpers.dataFetcher.getGmailDateMessages(
      timestamp ? new Date(timestamp as number) : new Date(),
    )

    const driveDocumentIds = await getDriveDocumentsIds(
      todayEmails.map(email => email.emailUid), 
      userEmail
    )

    const identifiers = [
      ...todayEmails.map(email => email.emailUid), 
      ...driveDocumentIds.map(id => id)
    ]
    const types = [
      ...todayEmails.map(() => KNFileType.EMAIL), 
      ...driveDocumentIds.map(() => KNFileType.DRIVE_FILE)
    ]
    const documents = (await getDocumentInfos(identifiers, types, userEmail)).map(
      item => item.documentId,
    )
    
    const webResponse = context.webResponse as WebSearchResponse | null | undefined
    const additionalDocuments = serializeWebSearchToLLMAdditionalDocuments(webResponse ?? undefined)

    const userPromptFacade = `Social Media Planner`
    const userPrompt = SOCIAL_MEDIA_PLANNER

    await helpers.handleChatbotAutomationRun({
      documents,
      additionalDocuments,
      semanticSearchQuery: 'Social Media Campaign',
      userPrompt,
      userPromptFacade,
    })

    return { ...context }
  }

  static getName(): string {
    return 'social-media-planner'
  }

  static create() {
    return new SocialMediaPlanner()
  }
}
