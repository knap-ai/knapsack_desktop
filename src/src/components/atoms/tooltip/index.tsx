import React, { ReactNode } from 'react'

import { cva, VariantProps } from 'class-variance-authority'

import questionMark from '/assets/images/questionMark.svg'

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  label: string
  component?: ReactNode
}

export enum TooltipVariant {
  regular = 'regular',
  inProgressMeeting = 'inProgressMeeting',
}

const tooltipVariants = cva('', {
  variants: {
    variant: {
      [TooltipVariant.regular]:
        'absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 tooltip text-sm text-gray-700 bg-white border-[1px] border-[#E4E7EC] px-2 py-1 rounded-md TightShadow',
      [TooltipVariant.inProgressMeeting]:
        "absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 z-10 tooltip bg-white rounded shadow-[0px_4px_6px_0px_rgba(0,0,0,0.12)] flex justify-center items-center gap-2 text-black text-xs font-normal font-['Inter'] leading-[18px] px-3 py-2 whitespace-nowrap max-w-[300px]",
    },
  },
  defaultVariants: {
    variant: TooltipVariant.regular,
  },
})

export const Tooltip = ({ label, component, variant = TooltipVariant.regular }: TooltipProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)

  const handleMouseEnter = () => setIsOpen(true)
  const handleMouseLeave = () => setIsOpen(false)

  return (
    <>
      <div
        className="gap-1 relative inline-flex justify-center items-center flex-col hover:cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isOpen && (
          <div className={tooltipVariants({ variant })}>
            <div className="">
              <span>{label}</span>
            </div>
          </div>
        )}
        {component ? (
          component
        ) : (
          <div className="w-5 h-5 shadow-xl  bg-white rounded-[100px] ">
            <img src={questionMark} alt="help" className="w-full h-full" />
          </div>
        )}
      </div>
    </>
  )
}
