import { useMemo, useState } from 'react'

import { ConnectionKeys } from 'src/api/connections'
import { EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'
import { IFeed } from 'src/hooks/feed/useFeed'

import { EmailAutopilot } from 'src/components/molecules/EmailAutopilot'
import LoginWarningAutopilot from 'src/components/molecules/LoginWarningAutopilot'
import EmailCategoryTabs from 'src/components/organisms/EmailCategoryTabs'
import SettingsButton from 'src/components/atoms/settings-button'

import './style.scss'

interface EmailTabViewProps {
  feed: IFeed
  userEmail: string
  userName: string
  profileProvider?: string
  onConnectAccountClick: (keys: ConnectionKeys[]) => void
}

const EmailTabView = ({
  feed,
  userEmail,
  userName,
  profileProvider,
  onConnectAccountClick,
}: EmailTabViewProps) => {
  const [showEmailSettings, setShowEmailSettings] = useState(false)

  const emailCategories = useMemo(() => {
    const categories: Record<EmailImportance, { total: number; active: number }> = {
      [EmailImportance.IMPORTANT]: { total: 0, active: 0 },
      [EmailImportance.IMPORTANT_NO_RESPONSE]: { total: 0, active: 0 },
      [EmailImportance.INFORMATIONAL]: { total: 0, active: 0 },
      [EmailImportance.MARKETING]: { total: 0, active: 0 },
      [EmailImportance.UNIMPORTANT]: { total: 0, active: 0 },
      [EmailImportance.UNCLASSIFIED]: { total: 0, active: 0 },
    }

    if (feed?.classifiedEmails) {
      Object.entries(feed.classifiedEmails).forEach(([category, emails]) => {
        const importanceValue = Object.values(EmailImportance).find(value => value === category)
        if (importanceValue) {
          const activeEmails =
            emails?.filter(email => !email.wasIgnored && !email.wasReplySent) || []
          categories[category as EmailImportance] = {
            total: emails?.length || 0,
            active: activeEmails.length,
          }
        }
      })
    }

    return categories
  }, [feed?.classifiedEmails])

  // If not logged in to email, show login prompt
  if (!feed.loggedEmailAutopilot) {
    return (
      <div className="EmailTabView w-full h-full">
        <LoginWarningAutopilot
          onConnectAccountClick={(key: ConnectionKeys) => {
            feed.setEmailAutopilotStatus({ status: 'sync-email' })
            onConnectAccountClick([key])
          }}
          onSkip={() => {}}
          provider={profileProvider}
        />
      </div>
    )
  }

  return (
    <div className="EmailTabView w-full h-full overflow-hidden">
      <div className="EmailTabView__header">
        <h1 className="EmailTabView__title">Email Autopilot</h1>
        <p className="EmailTabView__subtitle">
          Use arrow keys to quickly send or dismiss emails
        </p>
      </div>

      <div className="EmailTabView__content">
        <div className="relative w-full">
          <div className="flex justify-center items-center">
            <EmailCategoryTabs
              selectedCategory={feed.selectedEmailCategory}
              onSelectCategory={(category) => {
                if (feed.setSelectedEmailCategory) {
                  feed.setSelectedEmailCategory(category)
                }
              }}
              emailCounts={emailCategories}
            />
          </div>
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
            <SettingsButton
              onClick={() => setShowEmailSettings(true)}
              title="Email Autopilot Settings"
            />
          </div>
        </div>
        <div className="EmailTabView__emails">
          <EmailAutopilot
            feed={feed}
            profileProvider={profileProvider}
            userEmail={userEmail}
            userName={userName}
            showSettings={showEmailSettings}
            setShowSettings={setShowEmailSettings}
          />
        </div>
      </div>
    </div>
  )
}

export default EmailTabView
