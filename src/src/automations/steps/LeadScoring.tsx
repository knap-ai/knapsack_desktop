import { getDocumentInfos } from 'src/api/data_source'
import { KNFileType } from 'src/utils/KNSearchFilters'

import { SAAS_LIST } from '../assets/saas_list'
import { AutomationDataSources } from '../automation'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class LeadScoring extends BaseStep {
  constructor() {
    super({ sources: [AutomationDataSources.GMAIL] })
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const { userEmail } = context as { userEmail?: string }

    if (!userEmail) {
      throw new Error('You need to login with your Google account to access this functionality')
    }

    const userPromptFacade = `Lead Scoring.`
    let userPrompt = `“You are an AI assistant designed to provide advanced lead scoring for financial advisors, helping them prioritize outreach to potential clients. Use data from CRM records, email interactions, demographic information, and behavioral insights to score leads based on their likelihood to convert and their potential lifetime value. Generate a lead scoring report that categorizes prospects, highlights key attributes, and provides actionable recommendations for follow-up.”

Important Context:
- Please check this ${SAAS_LIST} and don't consider any leads from that email list.
- My email is ${userEmail} and don't consider any leads from that email.

Output Template for Lead Scoring

# Lead Scoring Report

## 1. Summary Overview
- **Total Leads Assessed:** [Number, e.g., "50"]  
- **High-Priority Leads:** [Number, e.g., "15"]  
- **Average Lead Score:** [Score, e.g., "70/100"]  

---

## 2. Lead Scoring Criteria
| **Criteria**              | **Weight (%)**  | **Description**                          |
|---------------------------|-----------------|------------------------------------------|
| Income Level              | 20%             | Higher income indicates higher potential value. |
| Net Worth                 | 25%             | Greater net worth correlates with greater advisory needs. |
| Engagement Level          | 15%             | Frequency of interaction (emails, calls, meetings). |
| Retirement Readiness      | 20%             | Proximity to retirement increases urgency for financial planning. |
| Geographic Proximity      | 10%             | Local leads are easier to convert into clients. |
| Referrals or Connections  | 10%             | Leads referred by existing clients or contacts have higher trust. |

---

## 3. Top Leads
### Lead 1: [Lead Name]
- **Score:** 95/100  
- **Key Attributes:**  
   - **Income Level:** $300,000/year  
   - **Net Worth:** $2,000,000  
   - **Engagement Level:** High (3 emails, 2 meetings in the last 30 days)  
   - **Retirement Readiness:** Planning to retire in 5 years.  
   - **Geographic Proximity:** Local (within 10 miles).  
   - **Referral Source:** Existing client.  
- **Recommended Action:** Schedule a follow-up meeting to discuss comprehensive retirement planning.  

### Lead 2: [Lead Name]
- **Score:** 88/100  
- **Key Attributes:**  
   - **Income Level:** $150,000/year  
   - **Net Worth:** $800,000  
   - **Engagement Level:** Medium (2 emails, 1 call).  
   - **Retirement Readiness:** 10 years from retirement, seeking investment advice.  
   - **Geographic Proximity:** Local (within 25 miles).  
   - **Referral Source:** None.  
- **Recommended Action:** Share a personalized email outlining investment strategies tailored to mid-career professionals.  

### Lead 3: [Lead Name]
- **Score:** 85/100  
- **Key Attributes:**  
   - **Income Level:** $250,000/year  
   - **Net Worth:** $1,500,000  
   - **Engagement Level:** Low (1 email inquiry, no meetings yet).  
   - **Retirement Readiness:** Recently inherited wealth; seeking estate planning advice.  
   - **Geographic Proximity:** Remote (different state).  
   - **Referral Source:** Family member.  
- **Recommended Action:** Schedule a virtual consultation to discuss estate planning options.  

---

## 4. Full Lead Scoring Table
| **Lead Name**    | **Score** | **Income** | **Net Worth** | **Engagement Level** | **Retirement Readiness** | **Proximity** | **Referral Source** | **Action**                           |
|------------------|-----------|------------|---------------|-----------------------|--------------------------|---------------|---------------------|--------------------------------------|
| [Lead 1]         | 95/100    | $300,000   | $2,000,000    | High                 | 5 years                 | Local         | Existing Client     | Schedule meeting                    |
| [Lead 2]         | 88/100    | $150,000   | $800,000      | Medium               | 10 years                | Local         | None                | Send tailored email                 |
| [Lead 3]         | 85/100    | $250,000   | $1,500,000    | Low                  | Recently inherited       | Remote        | Family Member        | Schedule virtual consultation        |
| [Lead 4]         | 80/100    | $120,000   | $600,000      | Low                  | 15 years                | Local         | None                | Add to nurture campaign             |

---

## 5. Recommendations
1. **Focus on High-Scoring Leads:** Target top 10 leads with personalized outreach within the next 7 days.  
2. **Leverage Referrals:** Use existing client referrals as a bridge to build trust and connection with referred leads.  
3. **Segment Campaigns:**  
   - **High Net Worth Leads:** Focus on estate and wealth transfer planning.  
   - **Mid-Career Professionals:** Emphasize retirement planning and tax strategies.  
   - **Remote Leads:** Utilize virtual meetings to increase engagement and convenience.  

4. **Monitor Engagement:** Use automated tools to track email opens, replies, and meeting requests for continuous lead re-scoring.  

---

## 6. Insights and Metrics
- **Conversion Potential:** High-priority leads have a 75% likelihood of converting.  
- **Revenue Forecast:** Potential annual revenue increase of [Projected Revenue, e.g., "$50,000"] if top leads convert.  
- **Engagement Trend:** Leads with higher email and meeting frequency show a [Percentage, e.g., "30%"] higher chance of conversion.  

---`

    let emails = await helpers.dataFetcher.getRecentGmailMessages(30)

    if (!emails?.length || emails === undefined) {
      userPrompt += '\nThere are no documents to analyze'
      emails = []
    }
    const emailDocs = (
      await getDocumentInfos(
        emails.map(email => email.emailUid),
        emails.map(() => KNFileType.EMAIL),
        userEmail,
      )
    ).map(item => item.documentId)

    //TODO: To get the address and Net Worth from the leads we should call the llm to get the leads least and them perform a webSearch

    const documents = [...emailDocs]

    await helpers.handleChatbotAutomationRun({
      documents,
      additionalDocuments: [],
      userPrompt,
      userPromptFacade,
    })
    return super.execute({ ...context }, helpers)
  }

  static getName(): string {
    return 'lead-scoring'
  }

  static create() {
    return new LeadScoring()
  }
}
