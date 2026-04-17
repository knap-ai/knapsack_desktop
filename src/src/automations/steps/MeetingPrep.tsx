import { getDocumentInfos, getDriveDocumentsIds } from 'src/api/data_source'
import DataFetcher from 'src/utils/data_fetch'
import { KNFileType } from 'src/utils/KNSearchFilters'

import { serializeWebSearchToLLMAdditionalDocuments } from 'src/App'

import {
  extractExternalEmails,
  extractInternalEmails,
  extractWorkDomains,
} from '../../utils/emails'
import { AutomationDataSources, AutomationTrigger } from '../automation'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class MeetingPrep extends BaseStep {
  constructor() {
    super({ sources: [AutomationDataSources.GOOGLE_CALENDAR, AutomationDataSources.GMAIL] })
  }

  private async getCalendarEvent(eventId?: number) {
    const dataFetcher = new DataFetcher()
    if (eventId) {
      return dataFetcher.getCalendarEvent(eventId)
    }
    const meetings = await dataFetcher.getRecentCalendarEvents()
    return meetings?.[0]
  }

  private async validate(
    automationRequiredDataCheck: () => Promise<void>,
    trigger?: AutomationTrigger,
  ) {
    if (trigger === AutomationTrigger.CLICK) {
      await automationRequiredDataCheck()
    }
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const { userEmail, event_id: eventId } = context as { userEmail?: string; event_id?: number }
    if (!userEmail) {
      throw new Error('You need to login with your Google account to access this functionality')
    }
    await this.validate(helpers.getIsAutomationReadyPolling, context.trigger)

    const meeting = await this.getCalendarEvent(eventId)

    if (!meeting) {
      return context
    }

    const externalDomains = extractWorkDomains(
      userEmail,
      meeting.participants.map(p => p.email),
    )

    const internalEmails = extractInternalEmails(
      userEmail,
      meeting.participants.map(p => p.email),
    )
    const externalEmails = extractExternalEmails(
      userEmail,
      meeting.participants.map(p => p.email),
    )

    const internalEmailsList =
      await helpers.dataFetcher.getGmailSearchResultsByAddresses(internalEmails)
    const externalEmailsList =
      await helpers.dataFetcher.getGmailSearchResultsByAddresses(externalEmails)

    const isRecurrent = meeting.recurrenceId ? true  : false

    const emails = [...(internalEmailsList ?? []), ...(externalEmailsList ?? [])]
    const participants = [...internalEmails, ...externalEmails]
    const driveDocumentIds = await getDriveDocumentsIds(participants, userEmail)

    let webResponse = null
    if (externalDomains.length > 0) {
      const firstWorkDomain = externalDomains[0]
      const backgroundResearchWebSearch = `${firstWorkDomain} about`
      webResponse = await helpers.submitWebSearch(backgroundResearchWebSearch)
    }
    const userPrompt = `Help me prepare for this meeting: ${meeting.title} with ${meeting.participants.map(p => p.email).join(', ')}

Using any of the above information, help me prepare for this meeting:

    ${meeting.title}
    ${meeting.location}
    ${meeting.google_meet_url}
    Time: ${meeting.start}
    ${meeting.participants.map(p => `${p.email}${p.name ? ` (${p.name})` : ''}`).join(', ')}
    ${meeting.description}
    the meeting is ${isRecurrent ? 'recurring' : 'not recurring'}

You are my chief of staff. Speak to me in the second person and write a thorough briefing that ensures I walk into this meeting completely prepared. Do not use any information about people who are not participants in this meeting unless they work at the same company as people in this meeting. My email is ${userEmail}.

Output the meeting preparation in this format (without printing the <format> and </format> tags):

<format>

## Location/Video Call link
${meeting.location === undefined ? meeting.google_meet_url : ''}
<If the meeting has additional location, arrival, or call info beyond the above, include it here. Never list more than two phone numbers.>

## Briefing

Write two full paragraphs as a seasoned chief of staff briefing an executive:

**Paragraph 1 — Context & Relationships:** Who are these people and what is your history with them? Cover your relationship with each external participant, any recent interactions or meetings, what they care about, and what has been discussed or agreed previously. If it is a recurring meeting, surface what was covered last time. Include any relevant links in markdown format — e.g. [Deck](https://drive.google.com/...) — for documents shared in context. Do not include internal colleagues who share your email domain unless relevant.

**Paragraph 2 — Situation & Stakes:** What is each participant likely to want from this meeting and why does it matter? Draw on web research, recent news, or social media about their company or role if available. Describe the dynamics walking in — any tensions, open items, or opportunities — and your recommended approach or posture for the conversation.

## Your game plan

Provide a short bulleted list (4–6 bullets) of:
- Any open action items or outstanding commitments from previous interactions, with status
- The 2–3 most important things you want to accomplish or get agreement on in this meeting
- Sharp, specific questions you should ask — tailored to what you know about each participant

## Icebreaker
One genuinely interesting or funny observation about one of the external participants or their company that would make for a natural opener.

</format>

Give your response in Markdown so it renders well. Be thorough — this is a full chief-of-staff briefing, not a summary.`

    const identifiers = [...emails.map(email => email.emailUid), ...driveDocumentIds.map(id => id)]
    const types = [
      ...emails.map(() => KNFileType.EMAIL),
      ...driveDocumentIds.map(() => KNFileType.DRIVE_FILE),
    ]
    const documents = (await getDocumentInfos(identifiers, types, userEmail)).map(
      item => item.documentId,
    )
    const additionalDocuments = serializeWebSearchToLLMAdditionalDocuments(webResponse ?? undefined)
    await helpers.handleChatbotAutomationRun({
      documents,
      additionalDocuments,
      semanticSearchQuery: 'Prepare for meeting',
      userPrompt,
      userPromptFacade: undefined,
    })
    return super.execute({ ...context }, helpers)
  }

  static getName(): string {
    return 'meeting-prep'
  }

  static create() {
    return new MeetingPrep()
  }
}
