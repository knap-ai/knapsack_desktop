import { LLMParams } from 'src/App'
import { EMAIL_CLASSIFICATION_PROMPT, EMAIL_DRAFTER_PROMPT } from 'src/prompts'
import DataFetcher from 'src/utils/data_fetch'
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

const EMAIL_IMPORTANCE_VALUES = new Set<string>(Object.values(EmailImportance))

export function parseEmailClassificationResponse(message: string): EmailClassification[] {
  const fencedMatch = message.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const trimmed = message.trim()
  const objectStart = trimmed.indexOf('{')
  const objectEnd = trimmed.lastIndexOf('}')
  const candidates = [
    fencedMatch?.[1]?.trim(),
    trimmed,
    objectStart >= 0 && objectEnd > objectStart ? trimmed.slice(objectStart, objectEnd + 1) : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate))

  for (const candidate of candidates) {
    try {
      let parsed: any = JSON.parse(candidate)
      if (typeof parsed === 'string') parsed = JSON.parse(parsed)
      if (!Array.isArray(parsed?.classifiedEmails)) continue

      const classifications = parsed.classifiedEmails
        .filter(
          (item: any) =>
            Number.isFinite(Number(item?.documentId)) &&
            EMAIL_IMPORTANCE_VALUES.has(item?.classification),
        )
        .map((item: any): EmailClassification => ({
          documentId: Number(item.documentId),
          classification: item.classification as EmailImportance,
          summary: Array.isArray(item.summary)
            ? item.summary.map(String)
            : item.summary
              ? [String(item.summary)]
              : [],
          justification: String(item.justification || ''),
          responseDeadline: item.responseDeadline ?? item.response_deadline ?? null,
          confidenceScore: Number(item.confidenceScore ?? item.confidence_score ?? 0),
          keywords: Array.isArray(item.keywords) ? item.keywords.map(String) : [],
          actionRequired: item.actionRequired ?? item.action_required ?? null,
        }))

      if (classifications.length > 0 || parsed.classifiedEmails.length === 0) {
        return classifications
      }
    } catch {
      // Try the next supported response shape.
    }
  }

  throw new Error('Could not parse email classification response')
}

export type DraftTone = 'default' | 'yes' | 'no'

export interface IEmailAutopilot {
  classifyEmails: (
    emails: EmailDocument[],
    handleSuccessMessagesClassified: (
      emails: EmailDocument[],
      emailClassification: EmailClassification[],
    ) => void,
    handleFailMessagesClassified: (emails: EmailDocument[]) => void,
  ) => void
  draftEmailReply: (email: EmailDocument, userEmail: string, userName?: string, tone?: DraftTone, toneLevel?: number) => Promise<string>
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
        const classifications = parseEmailClassificationResponse(message)
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

        handleSuccessMessagesClassified(emails, [
          ...starredClassifications,
          ...classifications,
        ])
      } catch (error) {
        console.error('ERROR CLASSIFYING.')
        logError(error instanceof Error ? error : new Error('Could not classify'), {
          additionalInfo: 'Email Autopilot accepts raw JSON and fenced JSON responses',
          error: error instanceof Error ? error.message : 'Could not classify',
        })
        handleFailMessagesClassified(emails)
      }
    }

    const errorCallbackFollowUp = (error: Error) => {
      console.error(error)
      logError(error, {
        additionalInfo: 'Email classification request failed',
        error: error.message,
      })
      handleFailMessagesClassified(emails)
    }

    const nonStarredEmails = emails.filter(email => !email.isStarred)

    const additionalDocuments = nonStarredEmails.map(email => ({
      title: email.subject,
      content: `Subject: ${email.subject}
Mailbox: ${email.accountEmail || 'unknown'}
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

  // Shared DataFetcher instance — email drafts call the LLM directly
  // instead of going through the global serial LLM queue, so multiple
  // drafts can run in parallel and don't block / get blocked by chat.
  const draftFetcher = new DataFetcher()

  const draftEmailReply = async (
    email: EmailDocument,
    userEmail: string,
    userName?: string,
    tone?: DraftTone,
    toneLevel?: number,
  ): Promise<string> => {
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

    let toneInstruction = ''
    const level = toneLevel ?? 0
    if (level > 0) {
      const intensityDescriptors = [
        '',
        'Write a warm, positive, affirmative response. Say yes and express willingness.',
        'Write an enthusiastic, eager response. Say yes wholeheartedly, express excitement and strong willingness to help.',
        'Write an extremely enthusiastic, effusive response. Express maximum excitement, eagerness, and wholehearted commitment. Be very warm and energetic.',
      ]
      const desc = intensityDescriptors[Math.min(level, intensityDescriptors.length - 1)]
      toneInstruction = `\n\nIMPORTANT TONE OVERRIDE: ${desc} Keep it short.`
    } else if (level < 0) {
      const absLevel = Math.abs(level)
      const intensityDescriptors = [
        '',
        'Write a polite, gracious decline. Say no kindly, express appreciation, and leave the door open for the future.',
        'Write a firm but respectful decline. Be clear that you cannot commit, while remaining courteous and appreciative.',
        'Write a very clear and definitive decline. Be direct that this is not possible, while still being professional and respectful.',
      ]
      const desc = intensityDescriptors[Math.min(absLevel, intensityDescriptors.length - 1)]
      toneInstruction = `\n\nIMPORTANT TONE OVERRIDE: ${desc} Keep it short.`
    } else if (tone === 'yes') {
      toneInstruction = `\n\nIMPORTANT TONE OVERRIDE: Write an enthusiastic, affirmative response. Say yes, express excitement and willingness. Be warm, positive, and eager. Accept the request/invitation/proposal wholeheartedly. Keep it short and energetic.`
    } else if (tone === 'no') {
      toneInstruction = `\n\nIMPORTANT TONE OVERRIDE: Write a polite, gracious decline. Say no in a kind and respectful way. Express appreciation for the offer/request, briefly explain you can't commit, and leave the door open for the future if appropriate. Keep it short and warm.`
    }

    const fullPrompt = EMAIL_DRAFTER_PROMPT.replace('{email}', emailContexts)
      .replace('{userEmail}', userEmail || '')
      .replace('{userName}', userName || '')
      .replace('{customInstructions}', customInstructions ? `Custom Instructions:\n${customInstructions}` : '')
      .replace('{schedulingLinks}', schedulingLinks || '')
      + toneInstruction

    try {
      const message = await draftFetcher.getChatCompletion(
        userEmail,
        userName || '',
        fullPrompt,
        undefined,
        [],
        [],
        undefined,
      )

      let jsonString
      const regex = /```json\s*([\s\S]*?)\s*```/
      const match = message.match(regex)

      if (match && match[1]) {
        jsonString = match[1].trim()
          .replace(/\\"/g, '"')
          .replace(/^"|"$/g, '')
      } else {
        jsonString = message
      }

      const draftEmail = JSON.parse(jsonString)
      return draftEmail['response_body']
    } catch (error) {
      console.error('ERROR DRAFTING A RESPONSE: ', error)
      logError(error instanceof Error ? error : new Error(String(error)), {
        additionalInfo: 'Email draft generation failed',
        error: String(error),
      })
      throw error
    }
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
