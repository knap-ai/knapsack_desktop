import React from 'react'
import { ConnectionKeys } from 'src/api/connections'
import KNAnalytics from 'src/utils/KNAnalytics'

import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'

interface LoginWarningAutopilotProps {
  onConnectAccountClick: (key: ConnectionKeys) => void
  onSkip: () => void
  provider?: string
}

const LoginWarningAutopilot: React.FC<LoginWarningAutopilotProps> = ({ 
  onConnectAccountClick,
  onSkip, 
  provider
}) => {
  const handleConnectClick = (connectionKey: ConnectionKeys) => {
    KNAnalytics.trackEvent('connect_account', {
      provider: connectionKey
    })

    onConnectAccountClick(connectionKey)
  }

  const handleSkipClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    KNAnalytics.trackEvent('skipped_email_autopilot', {
      action: 'skip_for_now'
    })

    onSkip()
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-y-6 m-auto">
      <div className="text-center">
        <div className="justify-between self-stretch text-center text-2xl font-semibold font-['Lora'] leading-10">
          Save hours per day
        </div>
        <div className="justify-between self-stretch text-center text-2xl font-semibold font-['Lora'] leading-10">
          with Email Autopilot (Beta)
        </div>
      </div>

      <div className="w-full max-w-md mx-auto">
        <img 
          src="/assets/images/EAExample.svg.png" 
          alt="Email Autopilot Example" 
          className="w-full h-auto" 
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      <div className="flex flex-col items-center gap-y-2">
        <Button
          label={provider == ConnectionKeys.MICROSOFT_PROFILE ? "Connect with Microsoft": "Connect with Gmail"}
          variant={ButtonVariant.startMeeting}
          size={ButtonSize.medium}
          onClick={() => handleConnectClick(
            provider == ConnectionKeys.MICROSOFT_PROFILE ? 
            ConnectionKeys.MICROSOFT_OUTLOOK : 
            ConnectionKeys.GOOGLE_GMAIL
          )}
        />
        
        <div className="mt-4">
          <a 
            href="#" 
            className="text-ks-red-900 text-sm font-normal hover:underline"
            onClick={handleSkipClick}
          >
            Skip for now
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginWarningAutopilot