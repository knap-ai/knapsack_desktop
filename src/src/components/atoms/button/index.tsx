import React from 'react'

import { cva, VariantProps } from 'class-variance-authority'
import cn from 'classnames'

import styles from './styles.module.scss'

export enum ButtonVariant {
  regular = 'regular',
  regularBlue = 'regularBlue',
  ghost = 'ghost',
  border = 'border',
  borderBlue = 'borderBlue',
  lightBlue = 'lightBlue',
  connected = 'connected',
  connect = 'connect',
  pending = 'pending',
  selected = 'selected',
  runNow = 'runNow',
  grayBorder = 'grayBorder',
  inProgressMeeting = 'inProgressMeeting',
  startMeeting = 'startMeeting',
  startMeetingGhost = 'startMeetingGhost',
  startMeetingGrey = 'startMeetingGrey',
  knapStore = 'knapStore',
}

export enum ButtonSize {
  pill = 'pill',
  badge = 'badge',
  small = 'small',
  medium = 'medium',
  mediumLarge = 'mediumLarge',
  large = 'large',
  fullWidth = 'fullWidth',
}

export enum ButtonIconPosition {
  left = 'left',
  right = 'right',
}

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      regular: styles.regular,
      regularBlue: styles.regularBlue,
      ghost: styles.ghost,
      border: styles.border,
      borderBlue: styles.borderBlue,
      lightBlue:
        'text-center text-blue-900 text-sm leading-normal bg-blue-200 rounded-lg px-3 py-3 inline-flex justify-center items-start gap-3',
      connected: styles.connected,
      connect: styles.connect,
      pending: styles.pending,
      selected: styles.selected,
      runNow: styles.runNow,
      grayBorder: styles.grayBorder,
      inProgressMeeting:
        'text-right text-[#302f37] text-[10px] font-bold font-mono underline uppercase leading-[10px] tracking-wide pointer',
      startMeeting:
        "bg-ks-red-800 hover:bg-ks-red-900 bg-ks px-5 py-3 gap-6 rounded-3xl shadow-[inset_0px_0px_1px_0px_rgba(0,0,0,0.25)] justify-center items-center inline-flex text-[#fcf4f4] text-base font-normal font-['Inter'] leading-normal h-12 max-w-[388px]",
      startMeetingGhost:
        "cursor-pointer ml-6 bg-[#f8f8f8] rounded shadow-[inset_0px_0px_1px_0px_rgba(0,0,0,0.25)] justify-center items-center gap-2 inline-flex text-[#333333] text-xs font-medium font-['Inter'] leading-[14px] hover:bg-[#712F2B] hover:text-white",
      startMeetingGrey:
        "cursor-pointer h-9 px-4 py-2 bg-ks-warm-grey-950 hover:bg-ks-warm-grey-900 rounded-[26px] justify-center items-center gap-3 inline-flex text-[#f7f6f6] text-sm font-normal font-['Inter'] leading-tight",
      knapStore: "font-InterTight cursor-pointer px-4 py-2 bg-ks-warm-grey-200 rounded-[32px] justify-center items-center text-zinc-700 text-xxs font-bold leading-normal hover:bg-ks-warm-grey-300"
    },
    size: {
      pill: styles.pill,
      badge: styles.badge,
      small: styles.small,
      medium: styles.medium,
      mediumLarge: styles.mediumLarge,
      large: styles.large,
      fullWidth: styles.fullWidth,
    },
    iconPosition: {
      left: styles.left,
      right: styles.right,
    },
  },
  defaultVariants: {
    variant: ButtonVariant.regular,
    size: ButtonSize.medium,
    iconPosition: ButtonIconPosition.left,
  },
})

export interface IButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  label?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactElement | React.ReactNode
  className?: string
}

const Button = ({
  label,
  onClick,
  size = ButtonSize.medium,
  variant = ButtonVariant.regular,
  iconPosition = ButtonIconPosition.left,
  disabled = false,
  loading = false,
  icon,
  className,
  ...props
}: IButtonProps) => {
  const currentIcon = loading ? (
    <span className={styles.loadingWrapper}></span>
  ) : (
    <span className={styles.iconWrapper}>{icon}</span>
  )

  return (
    <button
      {...props}
      disabled={disabled}
      className={`cursor-pointer ` + cn(buttonVariants({ size, variant, iconPosition }), className)}
      onClick={onClick}
    >
      {icon && currentIcon}
      <div>{label}</div>
    </button>
  )
}

export { Button }
