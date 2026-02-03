import { getDocumentInfos, getDriveDocumentsIds } from 'src/api/data_source'
import { KNFileType } from 'src/utils/KNSearchFilters'

import { WebSearchResponse, serializeWebSearchToLLMAdditionalDocuments } from 'src/App'
//import serializeWebSearchToLLMAdditionalDocuments from 'src/App'

import { AutomationDataSources } from '../automation'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class AboutMeAutomation extends BaseStep {
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

    const userPrompt = `
    write a detailed flattering profile of me based on what you know about me in my email, calendar events, files, and online.  use my email address ${userEmail} and  my linkedin profile  to determine my name and my email domain to determine my company.  Speak in the second person in the style of Esther Perel, but imagine she had the analytical brain of a McKinsey consultant.  be detailed, warm, and highly personal, but only mention things where you have high confidence.  avoid generic statement that feel like business school talk.  structure it as follows:
        # About me
        - a warm validating introduction of my name, company and role and background, under the title <“Here is what we know about you.”>  Include three or four specific details on companies I have worked for or things I have accomplished over the last 10 years.
        - my goals and typical frustrations and challenges
        - major milestones over the last year or so, including big new clients, sales wins, products launched, or financial wins
        - an overview of projects i am working on, at least three key people i work with on those projects and the types of things i discuss with them, key docs i am working on, and key regular meetings i have (including what time and day of the week) to support these projects.  Bias towards things that have happened in the last 30 days.
        - big external forces happening in the world that will impact my projects and me being able to achieve my goals.
        - things i should be doing differently, including three practical suggestions of things i should do weekly to do better on my projects and goals.  End with asking what more I want to know about this profile.
`

    const semanticSearchResults = await Promise.all(
      this.sources.map(async source => {
        return helpers.dataFetcher.semanticSearch(
          'Research on the web and provide a short bio about me',
          [],
          [source],
          10,
        )
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
    const additionalDocuments = serializeWebSearchToLLMAdditionalDocuments(webResponse ?? undefined) as { title: string; content: string; }[]
    const semanticDocs = semanticSearchResults.flat().map(result => result.documentId)
    const localDocs = (await getDocumentInfos(identifiers, types)).map(item => item.documentId)
    const documents = [...localDocs, ...semanticDocs]
    await helpers.handleChatbotAutomationRun({
      documents: documents,
      additionalDocuments: additionalDocuments,
      userPrompt,
      userPromptFacade: 'Provide a robust bio about me.',
      semanticSearchQuery: 'Suggest a short biography about me',
    })
    return super.execute({ ...context }, helpers)
  }

  static getName(): string {
    return 'about-me'
  }

  static create() {
    return new AboutMeAutomation()
  }
}
