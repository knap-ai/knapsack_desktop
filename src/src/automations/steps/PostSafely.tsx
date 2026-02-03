import { POST_SAFELY } from "src/prompts";
import { AutomationDataSources } from "../automation";
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from "./Base";
import { KNFileType } from 'src/utils/KNSearchFilters'
import { getDocumentInfos } from "src/api/data_source";
import { serializeWebSearchToLLMAdditionalDocuments } from 'src/App'

export default class PostSafely extends BaseStep {
    constructor() {
        super({ sources: [AutomationDataSources.GMAIL, AutomationDataSources.WEB] })
    }

    async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
        const { userEmail } = context as { userEmail?: string; timestamp: number }
        if (!userEmail) {
          throw new Error('You need to login with your Google account to access this functionality')
        }

        const lastSevenDaysEmails = await helpers.dataFetcher.getRecentGmailMessages(7)
        let userPrompt = POST_SAFELY
        const userPromptFacade = ``

        const documents = (
            await getDocumentInfos(
            lastSevenDaysEmails.map(email => email.emailUid),
            lastSevenDaysEmails.map(() => KNFileType.EMAIL),
            userEmail,
            )
          ).map(item => item.documentId)
 
        const backgroundResearchWebSearch = `LindeIn ${userEmail}`
        let webResponse = await helpers.submitWebSearch(backgroundResearchWebSearch)

        const additionalDocuments = serializeWebSearchToLLMAdditionalDocuments(webResponse ?? undefined)
        await helpers.handleChatbotAutomationRun({
            documents,
            additionalDocuments,
            userPrompt,
            userPromptFacade,
        })
        return super.execute({ ...context }, helpers)
    }

    static getName(): string {
        return 'post-safely'
    }
    
    static create() {
        return new PostSafely()
    }
}
