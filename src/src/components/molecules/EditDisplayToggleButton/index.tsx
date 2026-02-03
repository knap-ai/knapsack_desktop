import React from 'react'

import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'

interface EditDisplayToggleButtonProps {
  isEditing: boolean
  onClick: () => void
}

export enum EditDisplayToggleButtonVariant {
  regular = 'regular',
  disabled = 'disabled',
  recordingInProgress = 'recordingInProgress',
  white = 'white',
}

const EditDisplayToggleButton: React.FC<EditDisplayToggleButtonProps> = ({
  isEditing,
  onClick,
}) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <div className="flex flex-row items-center gap-2" onClick={handleClick}>
      <Button
        label={isEditing ? "View Notes" : "Edit"}
        variant={ButtonVariant.regular}
        size={ButtonSize.medium}
        icon={
          isEditing ? (
            <img className="h-5 mr-1.5" src="/assets/images/icons/ViewNotesIcon.svg" />
          ) : (
            <img className="mr-1.5" src="/assets/images/icons/EditIcon.svg" />
          )
        }
        className={`h-fit py-0 px-0 bg-transparent text-xxs uppercase font-semibold hover:underline font-InterTight tracking-[0.08em] transition-all duration-150 rounded-sm text-ks-warm-grey-800`}
        onClick={handleClick}
      />
    </div>
  )
}

export default EditDisplayToggleButton
