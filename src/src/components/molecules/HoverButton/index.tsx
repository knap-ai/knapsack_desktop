import React, { useState } from 'react'

import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'

interface HoverButtonProps {
  label: string
  onClick?: () => void
  variant: ButtonVariant
  icon: React.ReactElement | React.ReactNode
  hoverIcon?: React.ReactElement | React.ReactNode
}

const HoverButton: React.FC<HoverButtonProps> = ({ label, onClick, variant, icon, hoverIcon }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Button
      icon={isHovered ? (hoverIcon ?? icon) : icon}
      label={label}
      variant={variant}
      size={ButtonSize.pill}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  )
}

export default HoverButton
