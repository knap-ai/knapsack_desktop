import { LLMParams } from 'src/App'
import { EMAIL_CLASSIFICATION_PROMPT, EMAIL_DRAFTER_PROMPT } from 'src/prompts'
import { logError } from 'src/utils/errorHandling'
import { EmailDocument } from 'src/utils/SourceDocument'
import { KNLocalStorage, EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS, EMAIL_AUTOPILOT_SCHEDULING_LINKS } from 'src/utils/KNLocalStorage'

export enum AutopilotActions {
  MARK_AS_READ = 'MARK_AS_READ',
  ARCHIVE = 'ARCHIVE',
  DELETE = 'DELETE',

  SEND_REPLY = 'SEND_REPLY',
  REPLY_ARCHIVE = 'REPLY_ARCHIVE',
  REPLY_DELETE = 'REPLY_DELETE',

  GENERATE_DRAFT_REPLY = 'GENERATE_DRAFT_REPLY',
}

export enum EmailImportance {
  IMPORTANT = 'IMPORTANT_NEEDS_RESPONSE',
  IMPORTANT_NO_RESPONSE = 'IMPORTANT_NO_RESPONSE',
  INFORMATIONAL = 'INFORMATIONAL',
  MARKETING = 'MARKETING',
  UNIMPORTANT = 'UNIMPORTANT',
  UNCLASSIFIED = 'UNCLASSIFIED',
}

export interface EmailClassification {
  documentId: number
  classification: EmailImportance
  summary: string[]
  justification: string
  responseDeadline: string | null
  confidenceScore: number
  keywords: string[]
  actionRequired: string | null
}

export interface IEmailAutopilot {
  classifyEmails: (
    emails: EmailDocument[],
    handleSuccessMessagesClassified: (
      emails: EmailDocument[],
      emailClassification: EmailClassification[],
    ) => void,
    handleFailMessagesClassified: (emails: EmailDocument[]) => void,
  ) => void
  draftEmailReply: (email: EmailDocument, userEmail: string, userName?: string) => Promise<string> // TODO: this function signature is obviously wrong/will need to be changed after implementing
}

export function useEmailAutopilot(
  addToLLMQueue: (item: LLMParams) => void,
  userEmail?: string,
  userName?: string,
) {
  const classifyEmails = async (
    emails: EmailDocument[],
    handleSuccessMessagesClassified: (
      emails: EmailDocument[],
      emailClassification: EmailClassification[],
    ) => void,
    handleFailMessagesClassified: (emails: EmailDocument[]) => void,
  ) => {
    const messageStreamCallback = () => null
    const messageFinishCallback = async (message: string) => {
      try {
        // Extract anything between ```json and ``` regardless of other content
        const regex = /```json\s*([\s\S]*?)\s*```/
        const match = message.match(regex)

        if (match && match[1]) {
          // Remove any escaped quotes and parse the JSON
          const jsonString = match[1]
            .trim()
            .replace(/\\"/g, '"') // Handle escaped quotes
            .replace(/^"|"$/g, '') // Remove wrapping quotes if they exist
          const classifications = JSON.parse(jsonString)

          const starredEmails = emails.filter(email => email.isStarred)
          const starredClassifications = starredEmails.map(email => ({
            documentId: email.documentId,
            classification: EmailImportance.IMPORTANT,
            summary: email.summary ? [email.summary] : [''],
            justification: 'Email was starred by the user',
            responseDeadline: null,
            confidenceScore: 1.0,
            keywords: ['starred'],
            actionRequired: 'Review starred email',
          }))

          const allClassifications = {
            classifiedEmails: [...starredClassifications, ...classifications['classifiedEmails']],
          }

          handleSuccessMessagesClassified(emails, allClassifications['classifiedEmails'])
        } else {
          console.error('ERROR CLASSIFYING.')

          logError(new Error('Could not classify'), {
            additionalInfo: '',
            error: 'Could not parse the generated object',
          })
          handleFailMessagesClassified(emails)
        }
      } catch {
        console.error('ERROR CLASSIFYING.')
        logError(new Error('Could not classify'), {
          additionalInfo: '',
          error: 'Could not classify',
        })
        handleFailMessagesClassified(emails)
      }
    }

    const errorCallbackFollowUp = (error: Error) => {
      console.error(error)
    }

    const nonStarredEmails = emails.filter(email => !email.isStarred)

    const additionalDocuments = nonStarredEmails.map(email => ({
      title: email.subject,
      content: `Subject: ${email.subject}
From: ${email.sender}
To: ${email.recipients.join(', ')}
${email.cc.length > 0 ? `CC: ${email.cc.join(', ')}\n` : ''}Subject: ${email.subject}
Time: ${new Date(email.date).toISOString()}
Body: ${email.body}
documentId: ${email.documentId}
isStarred: ${email.isStarred}`,
    }))

    if (nonStarredEmails.length === 0) {
      const starredClassifications = emails.map(email => ({
        documentId: email.documentId,
        classification: EmailImportance.IMPORTANT,
        summary: email.summary ? [email.summary] : [''],
        justification: 'Email was starred by the user',
        responseDeadline: null,
        confidenceScore: 1.0,
        keywords: ['starred'],
        actionRequired: 'Review starred email',
      }))
      handleSuccessMessagesClassified(emails, starredClassifications)
      return
    }

    const emailClassificationPrompt = EMAIL_CLASSIFICATION_PROMPT.replace(
      /\{userEmail\}/g,
      userEmail || '',
    ).replace(/\{userName\}/g, userName || '')

    addToLLMQueue({
      documents: nonStarredEmails.map(email => email.documentId),
      additionalDocuments: additionalDocuments,
      semanticSearchQuery: undefined,
      prompt: emailClassificationPrompt,
      threadId: undefined,
      messageStreamCallback,
      messageFinishCallback,
      errorCallback: errorCallbackFollowUp,
    })
  }

  const draftEmailReply = async (
    email: EmailDocument,
    userEmail: string,
    userName?: string,
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const formattedDate = new Date(email.date).toISOString()
      const emailContexts = `<EMAIL>
document_id: ${email.documentId}
From: ${email.sender}
To: ${email.recipients.join(', ')}
${email.cc.length > 0 ? `CC: ${email.cc.join(', ')}\n` : ''}Subject: ${email.subject}
Time: ${formattedDate}
Body:
${email.body || 'No body content'}
</EMAIL>`

      // Get custom instructions and scheduling links from local storage
      const customInstructions = await KNLocalStorage.getItem(EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS) || '';
      const schedulingLinks = await KNLocalStorage.getItem(EMAIL_AUTOPILOT_SCHEDULING_LINKS) || '';
      
      let fullPrompt = EMAIL_DRAFTER_PROMPT.replace('{email}', emailContexts)
        .replace('{userEmail}', userEmail || '')
        .replace('{userName}', userName || '')
        .replace('{customInstructions}', customInstructions ? `Custom Instructions:\n${customInstructions}` : '')
        .replace('{schedulingLinks}', schedulingLinks || '')

      const messageStreamCallback = () => null
      const messageFinishCallback = async (message: string) => {
        try {
          let jsonString
          const regex = /```json\s*([\s\S]*?)\s*```/
          const match = message.match(regex)

          if (match && match[1]) {
            jsonString = match[1].trim()
              .replace(/\\"/g, '"')  // Handle escaped quotes
              .replace(/^"|"$/g, '') // Remove wrapping quotes if they exist
          } else {
            jsonString = message;
          }

          jsonString = jsonString
          const draftEmail = JSON.parse(jsonString)
          resolve(draftEmail['response_body'])
        } catch (error) {
          console.error('ERROR DRAFTING A RESPONSE: ', error)
          reject('ERROR DRAFTING A RESPONSE.')
        }
      }

      // TODO: add user recovery logic here
      const errorCallbackFollowUp = (error: Error) => {
        console.error(error)
        reject(error)
      }

      addToLLMQueue({
        documents: [],
        additionalDocuments: [],
        semanticSearchQuery: undefined,
        prompt: fullPrompt,
        threadId: undefined,
        messageStreamCallback,
        messageFinishCallback,
        errorCallback: errorCallbackFollowUp,
      })
    })
  }

  const emailAutopilot: IEmailAutopilot = {
    classifyEmails,
    draftEmailReply,
  }

  return {
    emailAutopilot,
  }
}

export default useEmailAutopilot
