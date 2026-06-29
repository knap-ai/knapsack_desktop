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
        className={cn('flex gap-2 text-white items-start w-full cursor-pointer', className)}
        onClick={onClick}
      >
        <CheckboxImage
          initialChecked={checked}
          isNewCheckboxUI={isNewCheckboxUI}
        />
        <label className="cursor-pointer min-w-0 flex-1">
          <span className="text-sm leading-6 text-black break-words whitespace-normal">{children}</span>
        </label>
      </div>
    )
  },
)

export { InputCheckbox }
