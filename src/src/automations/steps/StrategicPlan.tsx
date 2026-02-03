import { AutomationDataSources } from '../automation'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class StrategicPlan extends BaseStep {
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
    const { userEmail } = context as { userEmail?: string }

    if (!userEmail) {
      throw new Error('You need to login with your Google account to access this functionality')
    }

    const userPromptFacade = `Strategic Plan.`
    const userPrompt = `Establish my top 3 goals based on my recent emails and docs.
    Design an agenda for a strategic planning meeting focused on achieving these goals.
    Include a SWOT analysis session, brainstorming activities with structured frameworks like SCAMPER, and a decision matrix for prioritizing initiatives.
    Be specific about what our potential strengths, weaknesses, opportunities, and strengths may be for the SWOT session, and put them in a table.
    Allocate specific roles and responsibilities to maximize efficiency. Use markdown.`

    const semanticSearchResults = await Promise.all(
      this.sources.map(async source => {
        return helpers.dataFetcher.semanticSearch(
          'Documents like: Product Roadmap, Objectives, and Company OKRs, and top priorities.',
          [],
          [source],
          10,
        )
      }),
    )

    const allDocuments = semanticSearchResults.flat().map(result => result.documentId)

    await helpers.handleChatbotAutomationRun({
      documents: allDocuments,
      additionalDocuments: [],
      semanticSearchQuery: 'Product Roadmap, Objectives, and Company OKRs, and top priorities.',
      userPrompt,
      userPromptFacade,
    })
    return super.execute({ ...context }, helpers)
  }

  static getName(): string {
    return 'strategic-plan'
  }

  static create() {
    return new StrategicPlan()
  }
}
