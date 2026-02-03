import { open } from '@tauri-apps/api/shell'
import { ConnectionKeys } from 'src/api/connections'

export const mailTo = async (provider?: string) => {
  const recipient = 'hello@knap.ai'
  const subject = 'Help with Knapsack'
  const body = ''


  if (provider == ConnectionKeys.MICROSOFT_PROFILE) {
      // Construct the Outlook compose URL
    const outlookURL =
    'https://outlook.live.com/owa/?path=/mail/action/compose' +
    `&to=${encodeURIComponent(recipient)}` +
    `&subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`

    // Open the URL in the user’s default browser
    await open(outlookURL)
  } else {
  // Construct the Gmail compose URL
    const url =
      'https://mail.google.com/mail/?view=cm&fs=1&tf=1' +
      `&to=${encodeURIComponent(recipient)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`

    // Open the URL in the user’s default browser
    await open(url)
  }
}
