import React, { ReactNode } from 'react'

import cn from 'classnames'

import CheckboxImage from './checkbox-image'

export interface IInputCheckboxProps {
  checked: boolean
  className?: string
  isNewCheckboxUI?: boolean
  children?: ReactNode
  onClick?: () => void
}

const InputCheckbox = React.forwardRef<HTMLInputElement, IInputCheckboxProps>(
  (
    {
      className,
      checked,
      isNewCheckboxUI,
      children,
      onClick,
    },
  ): JSX.Element => {
    return (
      <div
        className={cn('flex flex-no-wrap gap-2 text-white items-center w-full cursor-pointer', className)}
        onClick={onClick}
      >
        <CheckboxImage
          initialChecked={checked}
          isNewCheckboxUI={isNewCheckboxUI}
        />
        <label className="cursor-pointer">
          <span className="text-sm leading-6 text-nowrap text-black">{children}</span>
        </label>
      </div>
    )
  },
)

export { InputCheckbox }
