import React from 'react'

import { cva, VariantProps } from 'class-variance-authority'

interface RecordButtonProps extends VariantProps<typeof buttonVariants> {
  text: string
  onClick: () => void
  isDisabled: boolean
}

export enum RecordButtonVariant {
  regular = 'regular',
  disabled = 'disabled',
  recordingInProgress = 'recordingInProgress',
  white = 'white',
}

const buttonVariants = cva('meeting-record-button h-9 px-3 inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-medium leading-none whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ks-red-700 disabled:cursor-not-allowed', {
  variants: {
    variant: {
      [RecordButtonVariant.regular]:
        'text-white border-transparent bg-ks-red-800 hover:bg-ks-red-700 cursor-pointer',
      [RecordButtonVariant.disabled]:
        'bg-zinc-100 border-zinc-200 text-zinc-500',
      [RecordButtonVariant.recordingInProgress]:
        'text-white border-transparent bg-ks-red-800 hover:bg-ks-red-700 cursor-pointer',
      [RecordButtonVariant.white]:
        'bg-white border-zinc-300 text-zinc-800 hover:bg-zinc-100 cursor-pointer',
    },
  },
  defaultVariants: {
    variant: RecordButtonVariant.regular,
  },
})

const RecordButton: React.FC<RecordButtonProps> = ({
  text,
  onClick,
  isDisabled,
  variant = RecordButtonVariant.regular,
}) => {
  return (
    <button type="button" onClick={onClick} disabled={isDisabled}
      className={buttonVariants({ variant })}>
      {text}
    </button>
  )
}

export default RecordButton
