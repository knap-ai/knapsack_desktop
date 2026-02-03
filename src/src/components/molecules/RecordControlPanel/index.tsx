import React from 'react'

import { Tooltip, TooltipVariant } from 'src/components/atoms/tooltip'

import RecordButton, { RecordButtonVariant } from '../RecordButton'

interface RecordPanelProps {
  isRecording: boolean
  onClickJoin: () => void
  onClickPause: () => void
  onClickResume: () => void
  onClickEnd: () => void
  isDisabled: boolean
  isPaused: boolean
  isSynthesizing: boolean
}

const RecordControlPanel: React.FC<RecordPanelProps> = ({
  isRecording,
  onClickJoin,
  onClickPause,
  onClickResume,
  onClickEnd,
  isDisabled,
  isPaused,
  isSynthesizing,
}) => {
  return (
    <div className="ml-auto rounded-md">
      {isDisabled ? (
        <Tooltip
          label="Meeting recording in progress"
          component={
            <RecordButton
              text="Join & record"
              onClick={onClickJoin}
              isDisabled={isDisabled}
              variant={RecordButtonVariant.disabled}
            />
          }
          variant={TooltipVariant.inProgressMeeting}
        />
      ) : isRecording ? (
        !isPaused ? (
          <Tooltip
            label="Meeting recording in progress"
            component={
              <RecordButton
                text="Pause"
                //onClick={() => handleStopRecording('Manually')}
                onClick={onClickPause}
                isDisabled={false}
                variant={RecordButtonVariant.recordingInProgress}
              />
            }
            variant={TooltipVariant.inProgressMeeting}
          />
        ) : (
          <div className="inline-flex justify-start items-center gap-2">
            <RecordButton
              text="End"
              onClick={onClickEnd}
              isDisabled={false}
              variant={RecordButtonVariant.white}
            />
            <RecordButton
              text="Resume"
              onClick={onClickResume}
              isDisabled={false}
              variant={RecordButtonVariant.recordingInProgress}
            />
          </div>
        )
      ) : (
        !isSynthesizing && (
          <RecordButton
            text="Join & record"
            onClick={onClickJoin}
            isDisabled={isDisabled}
            variant={RecordButtonVariant.regular}
          />
        )
      )}
    </div>
  )
}

export default RecordControlPanel
