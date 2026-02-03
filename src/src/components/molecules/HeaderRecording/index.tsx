import React from 'react'

import { Button, ButtonVariant } from 'src/components/atoms/button'

interface HeaderRecordingPropd {
  label: string
  buttonLabel: string
  hasSelectedRecordingFeedItem: boolean
  buttonOnClick: () => void
  buttonVariant: ButtonVariant
}

const HeaderRecording: React.FC<HeaderRecordingPropd> = ({
  label,
  buttonLabel,
  hasSelectedRecordingFeedItem,
  buttonOnClick,
  buttonVariant,
}) => {
  return (
    <div className="flex items-center gap-5">
      <div className="text-right text-[#c14841] text-[10px] font-bold font-mono uppercase leading-[10px] tracking-wide">
        {label}
      </div>
      {hasSelectedRecordingFeedItem && (
        <Button label={buttonLabel} variant={buttonVariant} onClick={buttonOnClick} />
      )}
    </div>
  )
}

export default HeaderRecording
