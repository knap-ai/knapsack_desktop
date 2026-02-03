import { useCallback, useEffect, useState } from 'react'

import { ConnectionKeys } from 'src/api/connections'
import { Profile } from 'src/hooks/auth/useAuth'
import { OnboardingPrimaryButton } from 'src/pages/onboarding/template'

import { ButtonSize } from 'src/components/atoms/button'
import LoadingIcon from 'src/components/atoms/loading-icon'
import { Dialog } from 'src/components/molecules/Dialog'

type SignInDialogProps = {
  isOpen: boolean
  handleClose: () => void
  profile: Profile | undefined
  onConnectAccountClick: (keys: ConnectionKeys[]) => void
  reconnectKeys: ConnectionKeys[]
}

export const SignInDialog = ({
  isOpen,
  handleClose,
  profile,
  onConnectAccountClick,
  reconnectKeys,
}: SignInDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false)
    }
  }, [isOpen])

  const handleConnect = useCallback(() => {
    setIsLoading(true)
    onConnectAccountClick(reconnectKeys)
  }, [reconnectKeys])

  return (
    <Dialog
      onClose={handleClose}
      isOpen={isOpen}
      dismissable
      className="flex items-center justify-center my-[88px] h-[100vh]"
    >
      <div className="relative flex flex-col items-center w-[420px] rounded-lg border border-zinc-200 bg-white p-6 shadow-lg">
        <p className="mt-6 text-center text-lg text-gray-900 font-Lora">
          Your session has expired <br /> Reconnect with Google to continue
        </p>

        <OnboardingPrimaryButton
          size={ButtonSize.small}
          disabled={false}
          className="mt-14 flex  items-center justify-center"
          label={
            profile?.provider == ConnectionKeys.MICROSOFT_PROFILE
              ? 'Connect with Microsoft'
              : 'Connect with Google'
          }
          onClick={() => handleConnect()}
        />
        {isLoading && <LoadingIcon className="w-6 h-6 mt-4 ml-6" />}
      </div>
    </Dialog>
  )
}
