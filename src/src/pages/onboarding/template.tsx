import { ChangeEvent, ReactNode } from 'react'

import cn from 'classnames'
import { PRIVACY_POLICY_LINK, TERMS_LINK } from 'src/utils/constants'

import { Button, ButtonSize, IButtonProps } from 'src/components/atoms/button'
import LoadingIcon from 'src/components/atoms/loading-icon'
import {
  Typography,
  TypographySize,
  TypographyVariant,
  TypographyWeight,
} from 'src/components/atoms/typography'

import { open } from '@tauri-apps/api/shell'

import styles from './styles.module.scss'
import KnapsackLogoMedium from '/assets/images/knap-logo-medium.png'
// import NotificationDefault from '/assets/images/notification-default.png'
import HipaaLogo from '/assets/images/OnboardingGraphics.svg'
// import Permission from '/assets/images/perms.png'


type OnboardingScreenProps = {
  index: number
  currentSlideInScreen?: number
  currentSlideOutScreen?: number
}

type OnboardingScreenContainerProps = {
  index: number
  children: ReactNode
  currentSlideInScreen?: number
  currentSlideOutScreen?: number
  className?: string
}

const OnboardingScreenContainer = ({
  index,
  children,
  currentSlideInScreen,
  currentSlideOutScreen,
  className,
}: OnboardingScreenContainerProps) => {
  return (
    <div
      className={cn(
        'w-full max-w-6xl mx-auto flex flex-col justify-center items-center h-full',
        className,
        {
          hidden: currentSlideInScreen !== index && currentSlideOutScreen !== index,
          [styles.entranceTransition]: currentSlideInScreen === index,
          [styles.exitTransition]: currentSlideOutScreen === index,
        }
      )}
    >
      {children}
    </div>
  )
}

export const OnboardingPrimaryButton = ({ disabled, label, size, className, ...props }: IButtonProps) => (
  <Button
    disabled={disabled}
    label={label ?? "Let's go"}
    size={size ?? ButtonSize.large}
    className={cn(
      'w-80 h-16 px-6 py-3 bg-[#913631] rounded-[40px] shadow-[inset_0px_0px_1px_0px_rgba(0,0,0,0.25)] justify-center items-center gap-6 inline-flex text-white text-xl font-semibold font-InterTight leading-[30px]',
      className,
    )}
    {...props}
  />
)

const OnboardingError = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <Typography
    variant={TypographyVariant.h5}
    weight={TypographyWeight.semibold}
    size={TypographySize.md}
    className={cn('mt-2', styles.error, className)}
  >
    {children}
  </Typography>
)

type WelcomeScreenProps = {
  onContinueClick: (index: number) => void
  acceptedTerms: boolean
  setAcceptedTerms: (value: boolean) => void
} & OnboardingScreenProps

const WelcomeScreen = ({
  onContinueClick,
  currentSlideInScreen,
  currentSlideOutScreen,
  index,
}: WelcomeScreenProps) => {
  return (
    <OnboardingScreenContainer
      currentSlideInScreen={currentSlideInScreen}
      currentSlideOutScreen={currentSlideOutScreen}
      index={index}
      className="max-w-[1124px] flex flex-1 flex-col justify-center items-center "
    >
      <div className="flex flex-row gap-2 items-center  justify-center">
        <div className="text-center text-black text-4xl font-semibold font-Lora leading-10">
          Welcome to Knapsack
        </div>
        <img src={KnapsackLogoMedium} alt="Knapsack" className="w-[42px]" />
      </div>

      <OnboardingPrimaryButton
        className="mt-14 flex  items-center justify-center"
        label="Next"
        onClick={() => onContinueClick(index)}
      />

      <Typography className=" mt-6 text-black text-sm font-normal font-InterTight leading-tight">
        By proceeding you are agreeing to our{' '}
        <a
          className="text-black text-sm font-bold font-InterTight underline leading-tight cursor-pointer"
          onClick={() => open(PRIVACY_POLICY_LINK)}
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>{' '}
        and our{' '}
        <a
          className="text-black text-sm font-bold font-InterTight underline leading-tight cursor-pointer"
          onClick={() => open(TERMS_LINK)}
          rel="noopener noreferrer"
        >
          Terms of Use
        </a>
      </Typography>
      <img className="mt-6" src={HipaaLogo} alt="HIPAA Compliant" />
    </OnboardingScreenContainer>
  )
}

type DataSourcePermissionsScreenProps = {
  onGrantClick: (index: number) => void
  googlePermissions: Record<string, boolean>
  onChangeGooglePermissions: (key: string) => (e: ChangeEvent<HTMLInputElement>) => void
  onMicrosoftGrantClick: (index: number) => void
  onSkipClick?: () => void
  isLoading: boolean
  error: string
} & OnboardingScreenProps

const DataSourcePermissionsScreen = ({
  onGrantClick,
  currentSlideInScreen,
  currentSlideOutScreen,
  index,
  isLoading,
  error,
  onMicrosoftGrantClick,
  onSkipClick,
}: DataSourcePermissionsScreenProps) => {
  return (
    <OnboardingScreenContainer
      currentSlideInScreen={currentSlideInScreen}
      currentSlideOutScreen={currentSlideOutScreen}
      index={index}
      className="flex flex-col justify-center items-center flex-1"
    >
      <div className=" mt-2 text-center text-black text-4xl font-semibold font-Lora leading-10">
        Let's connect <br /> your work calendar
      </div>
      <OnboardingPrimaryButton
        label="Connect with Google"
        className="mt-14"
        onClick={() => onGrantClick(index)}
      />
      {error && <OnboardingError>{error}</OnboardingError>}
      {isLoading && <LoadingIcon className="w-6 h-6 mt-4 ml-6" />}
      <OnboardingPrimaryButton
        label="Connect with Microsoft"
        className="mt-4"
        onClick={() => onMicrosoftGrantClick(index)}
      />
      {onSkipClick && (
        <Typography
          variant={TypographyVariant.p}
          size={TypographySize.md}
          weight={TypographyWeight.semibold}
          className="mt-6 text-zinc-500 cursor-pointer hover:text-zinc-700"
          onClick={onSkipClick}
        >
          Skip for now
        </Typography>
      )}
    </OnboardingScreenContainer>
  )
}

// type NotificationPermissionScreenProps = {
//   onGrantClick: (index: number) => void
//   // onSkipClick: (index: number) => void
// } & OnboardingScreenProps

// const NotificationPermissionsScreen = ({
//   onGrantClick,
//   // onSkipClick,
//   currentSlideInScreen,
//   currentSlideOutScreen,
//   index,
// }: NotificationPermissionScreenProps) => {
//   return (
//     <OnboardingScreenContainer
//       currentSlideInScreen={currentSlideInScreen}
//       currentSlideOutScreen={currentSlideOutScreen}
//       index={index}
//       className="flex flex-col justify-center flex-1 items-center"
//     >
//       <img src={NotificationDefault} alt="Notification" />
//       <div className=" mt-14 text-center text-zinc-700 text-[10px] font-bold font-InterTight uppercase leading-[10px] tracking-wide">
//         Step 2 of 2
//       </div>
//       <div className="mt-2 text-center text-black text-4xl font-semibold font-Lora leading-10">
//         This app works best <br /> with notifications
//       </div>
//       <OnboardingPrimaryButton
//         label="Turn on notifications"
//         className="mt-14"
//         onClick={() => onGrantClick(index)}
//       />
//     </OnboardingScreenContainer>
//   )
// }

// type AudioPermissionScreenProps = {
//   onGrantClick: (index: number) => void
// } & OnboardingScreenProps
//
// const AudioPermissionsScreen = ({
//   onGrantClick,
//   currentSlideInScreen,
//   currentSlideOutScreen,
//   index,
// }: AudioPermissionScreenProps) => {
//   return (
//     <OnboardingScreenContainer
//       currentSlideInScreen={currentSlideInScreen}
//       currentSlideOutScreen={currentSlideOutScreen}
//       index={index}
//       className="flex flex-col justify-center flex-1 items-center"
//     >
//       <div className="mr-12">
//         <img src={Permission} alt="Permission" />
//       </div>
//       <div className=" mt-14 text-center text-zinc-700 text-[10px] font-bold font-InterTight uppercase leading-[10px] tracking-wide">
//         Step 3 of 3
//       </div>
//       <div className="mt-2 text-center text-black text-4xl font-semibold font-Lora leading-10">
//         Last step
//       </div>
//       <div className="mt-2 text-center">
//         <span className="text-black text-xl font-normal font-font-Inter leading-7">
//           Knapsack will need audio permissions to transcribe <br /> your meetings -{' '}
//         </span>
//
//         <span className="text-black text-xl font-semibold font-font-Inter leading-7">
//           this will restart the app
//         </span>
//         <span className="text-black text-xl font-normal font-Inter leading-7">.</span>
//       </div>
//       <OnboardingPrimaryButton
//         label="Turn on audio permissions"
//         className="mt-14"
//         onClick={() => onGrantClick(index)}
//       />
//     </OnboardingScreenContainer>
//   )
// }

type PrivacyMessageScreenProps = {
  onNextClick: (index: number) => void
  onHowClick: () => void
} & OnboardingScreenProps

const PrivacyMessageScreen = ({
  onNextClick,
  onHowClick,
  currentSlideInScreen,
  currentSlideOutScreen,
  index,
}: PrivacyMessageScreenProps) => {
  return (
    <OnboardingScreenContainer
      currentSlideInScreen={currentSlideInScreen}
      currentSlideOutScreen={currentSlideOutScreen}
      index={index}
      className="flex flex-col justify-center items-center flex-1"
    >
      <div className="text-center text-zinc-900 text-4xl font-semibold font-Lora leading-10">
        <span>Knapsack is </span>
        <span className="text-[#b54707] text-4xl font-semibold font-Lora leading-10">private</span>
        <span>.</span>
        <br />
        <span>
          Your files, events, and emails <br /> are{' '}
        </span>
        <span className="text-[#b54707] text-4xl font-semibold font-Lora leading-10">
          never shared with us
        </span>
        <span>.</span>
      </div>
      <OnboardingPrimaryButton label="Next" className="mt-14" onClick={() => onNextClick(index)} />
      <div
        className="text-blue-700 mt-8 cursor-pointer flex flex-row gap-[8px]"
        onClick={() => onHowClick()}
      >
        <Typography
          variant={TypographyVariant.p}
          size={TypographySize.lg}
          weight={TypographyWeight.bold}
          className="text-[#712f2b] text-xl font-semibold font-primary leading-[30px]"
        >
          {'Learn how ->'}
        </Typography>
      </div>
    </OnboardingScreenContainer>
  )
}

type OnboardingTemplateProps = {
  currentSlideInScreen?: number
  currentSlideOutScreen?: number
  onWelcomeScreenContinueClick: (index: number) => void
  onLocalFilesGrantClick: (index: number) => void
  onLocalSkipClick: (index: number) => void
  onGoogleGrantClick: (index: number) => void
  onGoogleSkipClick?: () => void
  // onNotificationSkipClick: (index: number) => void
  onMessageScreenContinueClick: (index: number) => void
  onMessageScreenHowClick: () => void
  googlePermissions: Record<string, boolean>
  onChangeGooglePermissions: (key: string) => (e: ChangeEvent<HTMLInputElement>) => void
  acceptedTerms: boolean
  setAcceptedTerms: (value: boolean) => void
  onMicrosoftGrantClick: (index: number) => void
  isLoading: boolean
  error: string
  // onAudioGrantClick: (index: number) => void
}

export const OnboardingTemplate = ({
  currentSlideInScreen,
  currentSlideOutScreen,
  onWelcomeScreenContinueClick,
  onGoogleGrantClick,
  onGoogleSkipClick,
  googlePermissions,
  onChangeGooglePermissions,
  acceptedTerms,
  setAcceptedTerms,
  onMessageScreenContinueClick,
  onMessageScreenHowClick,
  onMicrosoftGrantClick,
  isLoading,
  error,
  // onAudioGrantClick,
}: OnboardingTemplateProps) => {
  return (
    <div
      className="flex flex-col h-[100vh] w-full overflow-hidden bg-ks-neutral-50 rounded-[10px]"
      data-tauri-drag-region
    >
      <div
        className="flex flex-1 p-[40px] flex-col justify-center w-full overflow-hidden relative"
        data-tauri-drag-region
      >
        <WelcomeScreen
          currentSlideInScreen={currentSlideInScreen}
          currentSlideOutScreen={currentSlideOutScreen}
          index={0}
          onContinueClick={onWelcomeScreenContinueClick}
          setAcceptedTerms={setAcceptedTerms}
          acceptedTerms={acceptedTerms}
        />
        <PrivacyMessageScreen
          currentSlideInScreen={currentSlideInScreen}
          currentSlideOutScreen={currentSlideOutScreen}
          index={1}
          onNextClick={onMessageScreenContinueClick}
          onHowClick={onMessageScreenHowClick}
        />
        <DataSourcePermissionsScreen
          currentSlideInScreen={currentSlideInScreen}
          currentSlideOutScreen={currentSlideOutScreen}
          index={2}
          googlePermissions={googlePermissions}
          onChangeGooglePermissions={onChangeGooglePermissions}
          onGrantClick={onGoogleGrantClick}
          onMicrosoftGrantClick={onMicrosoftGrantClick}
          onSkipClick={onGoogleSkipClick}
          isLoading={isLoading}
          error={error}
        />
        {/*<AudioPermissionsScreen
          currentSlideInScreen={currentSlideInScreen}
          currentSlideOutScreen={currentSlideOutScreen}
          index={4}
          onGrantClick={onAudioGrantClick}
        />*/}
      </div>
    </div>
  )
}
