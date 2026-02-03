import { FINRA_COMPLIANCE_PROMPT } from 'src/prompts'

import { AutomationDataSources } from '../automation'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'
import { getDocumentInfos } from 'src/api/data_source'
import { KNFileType } from 'src/utils/KNSearchFilters'

export default class FinraCompliance extends BaseStep {
  constructor() {
    super({ sources: [AutomationDataSources.GMAIL] })
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const { userEmail, timestamp } = context as { userEmail?: string; timestamp: number }
    let finraEmailTimestamp = timestamp
    if (timestamp === undefined || timestamp === 0) {
      finraEmailTimestamp = Date.now()
    }
    if (!userEmail) {
      throw new Error('You need to login with your Google account to access this functionality')
    }

    const userPromptFacade = `Check today's emails FINRA compliance.`
    let userPrompt = FINRA_COMPLIANCE_PROMPT
    let emails = await helpers.dataFetcher.listDaySentEmails(finraEmailTimestamp, userEmail)
    if (!emails?.length || emails === undefined) {
      userPrompt += '\nThere are no documents to analyze'
      emails = []
    }
    const documents = (
      await getDocumentInfos(
        emails.map(email => email.emailUid),
        emails.map(() => KNFileType.EMAIL),
        userEmail,
      )
    ).map(item => item.documentId)

    await helpers.handleChatbotAutomationRun({
      documents,
      additionalDocuments: [],
      userPrompt,
      userPromptFacade,
    })
    return super.execute({ ...context }, helpers)
  }

  static getName(): string {
    return 'finra-compliance'
  }

  static create() {
    return new FinraCompliance()
  }
}
