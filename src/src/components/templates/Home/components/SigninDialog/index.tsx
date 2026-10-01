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
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false)
      setError('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isLoading) return
    const timeout = window.setTimeout(() => {
      setIsLoading(false)
      setError('Sign-in has not completed. Finish in your browser, or try again. You can close this window and keep using Knapsack.')
    }, 60_000)
    return () => window.clearTimeout(timeout)
  }, [isLoading])

  const handleConnect = useCallback(() => {
    setError('')
    setIsLoading(true)
    try { onConnectAccountClick(reconnectKeys) }
    catch { setIsLoading(false); setError('Could not open sign-in. Please try again.') }
  }, [reconnectKeys, onConnectAccountClick])

  return (
    <Dialog
      onClose={handleClose}
      isOpen={isOpen}
      dismissable
      className="flex items-center justify-center my-[88px] h-[100vh]"
    >
      <div className="relative flex flex-col items-center w-[420px] rounded-lg border border-zinc-200 bg-white p-6 shadow-lg">
        <p className="mt-6 text-center text-lg text-gray-900 font-Lora">
          Reconnect your account <br /> {profile?.provider === ConnectionKeys.MICROSOFT_PROFILE ? 'Microsoft' : 'Google'} needs you to sign in again to resume syncing.
        </p>

        <OnboardingPrimaryButton
          size={ButtonSize.small}
          disabled={isLoading}
          className="mt-14 flex  items-center justify-center"
          label={
            profile?.provider == ConnectionKeys.MICROSOFT_PROFILE
              ? 'Connect with Microsoft'
              : 'Connect with Google'
          }
          onClick={() => handleConnect()}
        />
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        {isLoading && <LoadingIcon className="w-6 h-6 mt-4 ml-6" />}
      </div>
    </Dialog>
  )
}
