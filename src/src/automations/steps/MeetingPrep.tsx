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

Speak to me in the second person (e.g., Your last interaction with this person was…”).  Do not use any information about people who are not participants in this meeting unless they work at the same company as people in this meeting.

Output the meeting preparation in this format (without printing the <format> and </format> tags:

<format>

## Location/Video Call link
${meeting.location === undefined ? meeting.google_meet_url : ''}

<If the meeting has additional data about location, arrival, or video / audio call information beyond anything listed above, you can tell me more here. Never list more than two phone numbers.>

## Background
<Use bullets separated by line breaks and be concise.>
<In this section, comment on my relationship and previous interactions with each of the participants, and any recent previous meetings. Do not include information on colleagues who share my email domain.  If it is a recurring meeting, mention that, and look for details on what was discussed in previous instances of the meeting.  If the context includes any insight on the purpose of the meeting, include it here. If not, make your best guess on what may be discussed in the meeting based on any information provided about the companies involved. Include in markdown link format any relevant links to documents or web pages - i.e. [Product Spreadsheet](https://sheets.google.com/id/sheet) or [Presentation video](https://youtube.com/our_video) - that were shared in the context that may be relevant to the meeting.  The max length of this should be 100 words, with a few punchy bullets.>

## Summary
<Use bullets and be concise.>
<If there are people with emails domains different than mine (${userEmail}), include relevant insights about them from the web pages above, including recent news or social media posts.>
<In this section, write out important details or context for how each of the participants is coming into the meeting and what they are likely to want to discuss, including any ongoing issues or challenges that have been discussed previously.>
<Include information from the web pages, if it's relevant to where the invitees work, their roles, or our agenda.  The max length of this should be 100 words, with a few punchy bullets.>

## Action items & proposed questions
<Use bullets and be concise.>
<If any action items or next steps were discussed in the context, please list them out here, including the current status.  Include proposed questions that you recommend I should ask of the participants based on the context provided. The max length of this should be 100 words, with a few punchy bullets.>

## Icebreaker
<Include one interesting fact, insight, or joke that you think the participants in the meeting who are not on your domain would not already know and find funny or interesting.>

</format>

For all of the above meeting preparation, keep in mind that my email is ${userEmail}. Pay particular attention to emails from people who have a different domain than me. Try not to include names if they're not in the meeting invite, but you can mention other names if the information is relevant to our agenda for the upcoming meeting.

Be informative, and keep responses for each section short. Provide as much info as the user needs. Give your response in Markdown, so that it can be rendered nicely. Talk to me warmly and encouragingly as if you're my assistant.`

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
