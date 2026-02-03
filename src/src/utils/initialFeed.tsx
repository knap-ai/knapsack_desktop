import { KNChatMessage } from '../api/threads'

type FeedIntroductionInteractionOption = {
  userMessage?: KNChatMessage
  botMessage: KNChatMessage
  button?: { label: string }
  hideFollowUp?: boolean
}

type FeedIntroductionInteraction = Record<string, FeedIntroductionInteractionOption>

export const feedIntroductionInteractions: FeedIntroductionInteraction[] = [
  {
    '2': {
      userMessage: {
        user_type: 'user',
        content_type: 'text',
        text: 'What are automations?',
        date: new Date(),
        isStreaming: false,
      },
      botMessage: {
        user_type: 'bot',
        content_type: 'text',
        text: 'Automations are automated queries on things you need to do or look up regularly. Once you have them set up, they can save you hours per day.\n\nWith our **Meeting Prep automation**, we automatically check your Gmail, Google Calendar, Google Drive, your local drive and the web one hour before your next meeting for information on who you are meeting with and what you may need to know prior to the meeting. You can arrive at your meeting informed without taking up a lot of time to do research.',
        date: new Date(),
      },
      button: {
        label: 'What are automations?',
      },
      hideFollowUp: true,
    },
  },
  {
    '3': {
      userMessage: {
        user_type: 'user',
        content_type: 'text',
        text: 'How private is this?',
        date: new Date(),
        isStreaming: false,
      },
      botMessage: {
        user_type: 'bot',
        content_type: 'text',
        text: 'Knap (the company behind Knapsack) never sees your calendar events, files or the contents of your emails. You can see more about how we use data in our [privacy policy](https://knapsack.ai/privacy-policy).\n\n**During beta testing**, the application embeds your data and sends relevant snippets directly to a secure and trusted third party cloud LLM (Groq). Groq only computes pieces of data that are relevant to the automation, and then deletes that data from its servers. Our next release will include the option to use local AI.',
        date: new Date(),
      },
      button: {
        label: 'How private is this?',
      },
      hideFollowUp: true,
    },
  },
  {
    '4': {
      userMessage: {
        user_type: 'user',
        content_type: 'text',
        text: 'Great. How do I start?',
        date: new Date(),
        isStreaming: false,
      },
      botMessage: {
        user_type: 'bot',
        content_type: 'text',
        text: 'First we’ll use the Email Summary automation, then you’ll turn on the Meeting Prep automation.',
        date: new Date(),
      },
      button: {
        label: 'Great. How do I start?',
      },
      hideFollowUp: true,
    },
  },
  {
    '5': {
      userMessage: {
        user_type: 'user',
        content_type: 'text',
        text: 'Summarize the emails I received today.',
        date: new Date(),
        isStreaming: false,
      },
      botMessage: {
        user_type: 'bot',
        content_type: 'text',
        text: "Here's your Email Summary:\n\n",
        date: new Date(),
      },
      hideFollowUp: true,
    },
  },
  {
    '6': {
      userMessage: {
        user_type: 'user',
        content_type: 'text',
        text: 'Help me prepare for this meeting',
        date: new Date(),
        isStreaming: false,
      },
      botMessage: {
        user_type: 'bot',
        content_type: 'text',
        text: '',
        date: new Date(),
      },
      button: {
        label: 'Next',
      },
      hideFollowUp: false,
    },
  },
]

export function replaceFirstNamePlaceholder(message: KNChatMessage, name: string): KNChatMessage {
  return {
    user_type: message.user_type,
    content_type: message.content_type,
    text: message.text.replace('<firstname>', name?.split?.(' ')?.[0] ?? 'user'),
    date: message.date,
    isStreaming: message.isStreaming,
  }
}
