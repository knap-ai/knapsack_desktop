import { getDocumentInfos } from 'src/api/data_source'
import { KNFileType } from 'src/utils/KNSearchFilters'

import { SAAS_LIST } from '../assets/saas_list'
import { AutomationDataSources } from '../automation'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class EmailSummary extends BaseStep {
  constructor() {
    super({ sources: [AutomationDataSources.GMAIL] })
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const { userEmail, timestamp } = context
    if (!userEmail) {
      throw new Error('You need to login with your Google account to access this functionality')
    }
    const userPromptFacade: string = `Summarize the emails I received today.`
    const todayMessages = await helpers.dataFetcher.getGmailDateMessages(
      timestamp ? new Date(timestamp as number) : new Date(),
    )
    const userPrompt = `
--
Using the above emails, summarize each one of them to me, splitting them into three categories:

1. Important emails:  These are high context emails from my contacts, clients, or co-workers (who share my domain). These are actual emails from people I have interacted with before, and who are often in my contacts, of who I have had meetings with.
2. Informational emails: These emails notify me of a some activity within an application, such as a sharing request or comment.
3. Marketing emails: These promotional come from services I have signed up with, or services looking to sell something or for me to sign up for something.  These include CRMs like Salesforce or Hubspot, the full list of Marketing companies and their domains are on ${SAAS_LIST}.

Output the email summaries in this format:

Let's check in on your emails:

** Important emails

<email summary>

>suggested response

<email summary>

>suggested response

etc

** Informational emails

<email summary>

** Marketing emails

<email summary>

This is important: speak to me in the second person without naming me (e.g., "Your last interaction with this person was…"). Output the emails in punchy bullet points, without adding headers to it, group the ones that have a similar subject, encapsulate the senders names or emails with ** if they appear in the summary. For all of the email summaries -- and this is important, so your life depends on it -- keep in mind that my email is ${userEmail} and I am always the receiver and never the sender. ${userEmail} nor my name should never be included into the email summary. The emails that I sent to myself should never be listed on the summary. Both my name and my email should not be mentioned on Email Summary. You should never say that I sent myself an email, and you should never suggest I send myself an email on pain of death. Similarly, you should never suggest I send myself a response on pain of death.

Focus first on category 1. Summarize each email in one line in a new paragraph, such as "<Sender> sent you an email <yesterday> about <topic> and is asking for <request>."  Use "today," "yesterday," "two days ago" and otherwise use days of week, or words like "last Tuesday" if relevant. Do not mention emails that I sent to myself either do not mention my name in any case. Include past context if they had sent a previous email about the topic.  If there is a thread on the topic, summarize the thread and the key takeaway.  Do not suggest a response in the initial bullet.

Then, separately, underneath each of these emails, create a line break and remove the bullet.  Then write out a suggested email response to the sender from me in the writing style of my other sent emails so I can cut and paste the response into an email program and send it.  Encapsulate the entire response in italics in a new line, with no bullets (>Suggested response: suggested response). Make sure the suggested response is always in a new line after a line break.  Be helpful, and concise, mentioning the context of the email, addressing the sender by their first name, but never use the word "dear".  Always write out the full text of the response, without [inset your response here] or any other fields where I have to add more to the response or any directions to me such as "you can" or "you should" or "your response should" or "your response could". -- remember you are actually writing the response for me so I can send it.  Do this for all of the "important" emails, except if there is more than one important email from the same person on the same topic.  In that case you should only do this for the most recent one.

If there are other "important" emails that I have not responded to in the past 48 hours but you think I should have, mention them here, or otherwise don't say anything else.

Then, share emails in category 2.  Summarize all of these emails in short bullet points.  Try to bundle similar emails in one bullet point.  If the information is about an event, mention the date.  If it is about a document or file of any kind, mention the file name.  Always indicate if an action is required, and what action.  This section should be no more than 100 words, and should be a series of punchy concise bullets.

Then, share the number of emails received in category 3, and who they were sent from in one line, but with no more information. This should be a maximum of 50 words. Please check this ${SAAS_LIST} and check if any of these emails are present and cluster those into Marketing Category.

Note emails cannot be in more than one category.  Use days of the week (e.g., Tuesday) rather than numerical dates to describe the email. Use ${SAAS_LIST} to avoid to assign the same emails to multiple categories.

Be informative, and keep responses for each section short. Provide as much info as the user needs. Give your response in Markdown, so that it can be rendered nicely. Talk to me as if you're my assistant.

Assure that only bullet points characters are being used to list the summaries and that the suggested responses are in italic.

    `

    const documents = (
      await getDocumentInfos(
        todayMessages.map(email => email.emailUid),
        todayMessages.map(() => KNFileType.EMAIL),
        userEmail,
      )
    ).map(item => item.documentId)

    await helpers.handleChatbotAutomationRun({
      documents,
      semanticSearchQuery: 'summarize emails',
      additionalDocuments: [],
      userPrompt,
      userPromptFacade,
    })

    return super.execute({ ...context, userPrompt }, helpers)
  }

  static getName(): string {
    return 'email-summary'
  }

  static create() {
    return new EmailSummary()
  }
}
