// Define the interface for meeting template prompts
export interface MeetingTemplatePrompt {
  key: string
  title: string
  prompt: string;
  user_facing_description: string;
}

export const INTERNAL_MEETING: MeetingTemplatePrompt = {
  key: "INTERNAL_MEETING",
  title: "Internal Meeting",
  user_facing_description: "Focus on what we did yesterday, what we’re doing today, and what is keeping us from doing what we need to do. Create a markup table to keep track of what each meeting participant says they’ll do today, what they did yesterday.",
  prompt: "Focus on what we did yesterday, what we’re doing today, and what is keeping us from doing what we need to do. Create a markup table to keep track of what each meeting participant says they’ll do today, what they did yesterday.",
}

export const CLIENT_DISCOVERY_MEETING: MeetingTemplatePrompt = {
  key: "CLIENT_DISCOVERY_MEETING",
  title: "Client Discovery Meeting",
  user_facing_description: "Comprehensive template for initial client meetings that captures KYC information, meeting timeline, and action items for all parties.",
  prompt: `As a financial advisor, extract and summarize any applicable KYC (know your client), suitability, and beneficiary information from the client's responses in CSV format. Then offer a bullet point outline of the meeting timeline, a narrative of the meeting, and include a summary of the following: key points, action items, where we left it, client's status and next steps, advisor's status and next steps, and any other participants in the meeting.

Do this by imitating and filling in the blanks of the following template:
--- begin template
KYC and Suitability Data Extraction CSV:
Item, Transcript Excerpt
etc, etc

Meeting Timeline:
1. (Summarize meeting topic 1)
2. (Summarize meeting topic 2)
3. etc
Narrative of the Meeting:
(provide a detailed narrative summary of the meeting, capturing its essence with rich details spanning at least four paragraphs. Convey the mood and tone, any significant moments of agreement or disagreement, and insights into the client's aspirations or concerns)
Summary of Key Points:
- Main topics discussed during the meeting
- Client's concerns or priorities
- Recommendations made by the advisor

Action Items:
Responsibilities of the Financial Advisor:
- (list action steps for the advisor)

Responsibilities of the Client:
- (list action steps for the client)

Where We Left It:
- Overall Status: (brief overview of where the meeting was concluded)
- Detailed Progression: (explain how the conversation evolved, important decisions made, and any areas of concern or optimism)

Client's Status & Next Steps:
- Current standpoint of the client
- Immediate actions or deliverables expected from the client

Advisor's Status & Next Steps:
- Current standpoint of the advisor
- Immediate actions or deliverables expected from the advisor

Other Participants:
- Current standpoint of other participants in the meeting
- Immediate actions or deliverables expected from them
--- end template`
};

export const ONBOARDING_DATA_GATHERING: MeetingTemplatePrompt = {
  key: "ONBOARDING_DATA_GATHERING",
  title: "Onboarding / Data Gathering",
  user_facing_description: "Focused template for collecting client financial information with clear action items and next steps.",
  prompt: `Briefly summarize the main topics and decisions made during the meeting. Focus on areas related to financial goals, investment strategies, risk tolerance, and any changes in the client's financial situation.
Then list Action Items and Recommendations: Based on the summarized discussion and the categorized financial data, identify any action items or recommendations for the client. This may include adjustments to investment portfolios, changes in savings strategies, updates to insurance coverage, or any other relevant financial advice.
Then give Next Steps and Follow-Ups: Outline the next steps to be taken by either the financial advisor or the client. Include any follow-up meetings, additional information required, or deadlines for decision-making.

Example:

# Meeting Summary
The meeting covered the client's financial situation, focusing on impending changes due to the expiration of their disability insurance and the need to draw income from investments. The advisor reviewed the client's assets, including annuities and retirement funds with TIAA, and discussed strategies for replacing the income from disability insurance. The advisor emphasized the importance of managing the client's investments correctly, avoiding undue risk, and maximizing the growth potential of equities. Additionally, the advisor analyzed the client's annuities to determine which should be replaced or kept. The goal is to create a sustainable income plan that accounts for inflation and ensures financial stability.

## Action Items and Recommendations:
1. Evaluate which annuities should be replaced based on performance and fees
2. Determine which annuities to keep and scheduled when to trigger income streams from them
3. Develop and income plan that replaces the $53,000 disability income with other guaranteed sources
4. Reallocate TIAA equity portion into more aggressive stock funds for long-term growth
5. Establish a withdrawal order strategy to optimize use of assets over time

## Next Steps and Follow-Ups
- The advisor will complete the analysis of all annuities and report back on which ones to replace
- Create a detailed income plan outlining which assets to draw from first and how to manage long-term growth
- Schedule a follow up meeting to discuss the outcome of the annuities analysis
- The client should provide their availability for follow up discussions`
};

export const FINANCIAL_PLAN_PRESENTATION: MeetingTemplatePrompt = {
  key: "FINANCIAL_PLAN_PRESENTATION",
  title: "Financial Plan Presentation",
  user_facing_description: "Detailed template for presenting financial plans with data extraction tables and actionable recommendations.",
  prompt: `Generate a detailed summary and data extraction table based on the following criteria for a financial planning meeting:

# Meeting Summary:
Provide a brief summary of the main topics and decisions made during the meeting.
Focus on areas related to financial goals, investment strategies, risk tolerance, and any changes in the client's financial situation.

# Data Extraction:
Identify and list all the financial data discussed during the meeting.
Organize the data in a Markdown table with three columns:
  1. Financial Data: Type of financial data extracted (e.g., income, expenses, investments). Include any new financial data mentioned during the meeting.
  2. Category: Corresponding area of financial planning it pertains to (Income Analysis, Expense Tracking, Investment Strategy, Debt Management, Savings Goals, Insurance Planning, Retirement Planning, Tax Planning, Estate Planning, Other).
  3. Data From Meeting: Specific data provided by the client during the meeting, including figures related to income, expenses, investments, debts, savings, insurance policies, and any other financial assets or liabilities. If no amount is mentioned, enter '0'.

Example table:
| Financial Data | Category | Data From Meeting |
| --- | --- | --- |
| Annual salary | Income Analysis | $85,000 |
| Monthly expenses | Expense Tracking | $3,200 |
| Total investment portfolio value | Investment Strategy | $250,000 |
| Retirement savings (401k, IRA) | Retirement Planning | $120,000 |
| Education savings (529 Plan) | Savings Goals | $20,000 |
| Home mortgage | Debt Management | $180,000 (remaining balance) |
| Car loan | Debt Management | $12,000 |
| Credit card debt | Debt Management | $4,000 |
| Risk tolerance | Investment Strategy | Conservative |
| Life insurance coverage | Insurance Planning | $300,000 |
| Disability insurance | Insurance Planning | $2,000/month |
| Additional savings needed for education | Savings Goals | $40,000 |
| Planned home purchase | Estate Planning | $400,000 (target purchase price) |

# Action Items and Recommendations:
Based on the summarized discussion and the categorized financial data, identify any action items or recommendations for the client.
This may include adjustments to investment portfolios, changes in savings strategies, updates to insurance coverage, or any other relevant financial advice.
Include any follow-up meetings, additional information required, or deadlines for decision-making.
Format with Markdown checkboxes.

Example Action Items and Recommendations section:
# Action Items
Investment Strategy Adjustments:
- [ ] Shift 10% of equity holdings to fixed income to align with the client's new risk tolerance.
- [ ] Rebalance the portfolio to improve diversification and reduce volatility.
- [ ] Explore additional tax-efficient investment opportunities.
Retirement Planning Enhancements:
- [ ] Increase 401(k) contributions by 2% to accelerate retirement savings.
- [ ] Consider opening a Roth IRA to diversify tax exposure in retirement.
Debt Management Strategy:
- [ ] Prioritize paying off the remaining credit card debt within 12 months.
- [ ] Explore refinancing options for the car loan if interest rates decrease.
Insurance Coverage Review:
- [ ] Assess additional disability insurance needs to ensure adequate income protection.
- [ ] Confirm that life insurance beneficiaries are up to date.
Tax Optimization Strategies:
- [ ] Adjust tax withholdings to maximize available deductions.
- [ ] Consider pre-tax contributions to a Health Savings Account (HSA).
Education Savings Plan Update:
- [ ] Increase monthly contributions to the 529 Plan to meet the $50,000 target by the child's enrollment date.`
};

export const FINANCIAL_PLAN_IMPLEMENTATION: MeetingTemplatePrompt = {
  key: "FINANCIAL_PLAN_IMPLEMENTATION",
  title: "Financial Plan Implementation",
  user_facing_description: "Structured template for tracking the execution of financial plans with clear responsibilities and timelines.",
  prompt: `As a financial advisor, please analyze the transcript of our Financial Plan Implementation meeting and generate a comprehensive output summary. Your output should include the following sections formatted exactly as specified:

# Implementation Data Extraction CSV:
Extract updated and actionable data related to the implementation of the financial plan. This may include account modifications, asset allocation changes, beneficiary updates, funding transfers, and updates to estate documents. Format this as a Markdown table with two columns: change requested and current status

# Meeting Timeline:
Provide a bullet-point list that outlines the meeting's structure. Include key segments such as:
* Opening and review of the finalized financial plan
* Detailed discussion of each implementation step
* Review of account adjustments, funding actions, and document updates
* Confirmation of timelines and responsibilities
* Recap of next steps and follow-up scheduling

# Narrative Summary:
* Write a detailed narrative summary (minimum four paragraphs) that captures:
* The overall tone and mood of the meeting
* Key moments where implementation steps were clarified or refined
* Any challenges or points of discussion regarding the practical execution of the plan
* Insights into the client's readiness, concerns, or enthusiasm regarding the implementation
* Ensure the narrative is rich in detail and captures the dynamic nature of the discussion.

# Summary of Key Points:
List bullet points summarizing:
* Main implementation steps and decisions made
* Critical account changes or document updates discussed
* Client's concerns or areas requiring additional attention
* Recommendations made by the advisor for efficient plan execution

# Action Items:
* Clearly outline responsibilities and next steps:

# Responsibilities of the Financial Advisor:
* List specific tasks the advisor will complete (e.g., adjusting portfolio allocations, preparing updated documents) along with deadlines.

# Responsibilities of the Client:
* List specific actions required from the client (e.g., providing documents, initiating transfers) with target dates.

# Meeting Conclusion – Where We Left It:
* Provide a brief overview of the meeting's ending:

# Overall Status: A short summary of the current implementation status
* Detailed Progression: Explain how the discussion evolved and highlight key decisions or adjustments made during the meeting

# Client's Status & Next Steps:
Summarize:
* The client's current position regarding the implementation (e.g., readiness to act, pending tasks)
* Immediate deliverables or actions expected from the client

# Advisor's Status & Next Steps:
Summarize:
* The advisor's current responsibilities and any immediate follow-up actions required for plan implementation
* Any adjustments or monitoring required to ensure timely execution

# Other Participants (if applicable):
* Identify any additional meeting participants, summarizing:
* Their contributions or input on the implementation process
* Any specific responsibilities or next steps assigned to them`
}

export const MEETING_TEMPLATES: Record<string, MeetingTemplatePrompt> = {
  "INTERNAL_MEETING": INTERNAL_MEETING,
  "CLIENT_DISCOVERY_MEETING": CLIENT_DISCOVERY_MEETING,
  "ONBOARDING_DATA_GATHERING": ONBOARDING_DATA_GATHERING,
  "FINANCIAL_PLAN_PRESENTATION": FINANCIAL_PLAN_PRESENTATION,
  "FINANCIAL_PLAN_IMPLEMENTATION": FINANCIAL_PLAN_IMPLEMENTATION,
}
