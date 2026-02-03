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

const buttonVariants = cva('', {
  variants: {
    variant: {
      [RecordButtonVariant.regular]:
        'w-[6.483rem] text-xs text-white px-3 py-2 bg-ks-red-800 hover:bg-ks-red-700 transition-colors duration-200 rounded-[32px] justify-center items-center gap-2 inline-flex flex cursor-pointer',
      [RecordButtonVariant.disabled]:
        'w-[6.483rem] h-8 px-3 py-2 bg-[#d1d0d0] rounded-[40px] justify-center items-center gap-[3px] inline-flex text-[#6a6969] text-xs leading-normal',
      [RecordButtonVariant.recordingInProgress]:
        'h-8 px-3 py-2 bg-ks-red-800 rounded-[40px] justify-center items-center gap-[3px] inline-flex text-ks-white-text text-xs leading-normal cursor-pointer',
      [RecordButtonVariant.white]:
        'px-3 py-2 rounded-[32px] outline outline-1 outline-offset-[-1px] outline-orange-800 inline-flex justify-center items-center gap-2 flex cursor-pointer text-red-900 text-xs leading-tight',
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
    <div className="flex flex-row items-center gap-2">
      <div className="justify-end items-center inline-flex">
        <div className="justify-end items-center flex">
          <div onClick={onClick} className={buttonVariants({ variant })}>
            <div>
              <button disabled={isDisabled}>{text}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecordButton
