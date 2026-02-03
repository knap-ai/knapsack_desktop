import React from 'react'

import CheckboxChecked from '/assets/images/checkbox-checked.svg'
import CheckboxSelected from '/assets/images/checkbox-selected.svg'
import CheckboxUnchecked from '/assets/images/checkbox-unchecked.svg'
import CheckboxUnselected from '/assets/images/checkbox-unselected.svg'

interface CheckboxImageProps {
  initialChecked: boolean
  isNewCheckboxUI?: boolean
  onClick?: (checked: boolean) => void
}

const CheckboxImage: React.FC<CheckboxImageProps> = ({
  isNewCheckboxUI,
  onClick,
  initialChecked = false,
}) => {
  const [checked, setChecked] = React.useState<boolean>(initialChecked)

  const handleClick = () => {
    const newCheckedState = !checked
    setChecked(newCheckedState)
    onClick?.(newCheckedState)
  }

  const getCheckboxImage = (): string => {
    if (isNewCheckboxUI) {
      return initialChecked ? CheckboxSelected : CheckboxUnselected
    }
    return initialChecked ? CheckboxChecked : CheckboxUnchecked
  }

  return (
    <img
      className="w-4"
      src={getCheckboxImage()}
      onClick={handleClick}
      alt={initialChecked ? 'checked' : 'unchecked'}
    />
  )
}

export default CheckboxImage
