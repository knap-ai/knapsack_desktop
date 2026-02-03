import React, { InputHTMLAttributes } from 'react'

import cn from 'classnames'

import styles from './styles.module.scss'

export interface IInputTextProps extends InputHTMLAttributes<HTMLInputElement> {
  ref: React.Ref<HTMLInputElement>
}

const InputText = React.forwardRef<HTMLInputElement, IInputTextProps>(
  ({ className, ...restProps }, ref): JSX.Element => {
    return <input className={cn(styles.input, className)} {...restProps} ref={ref} />
  },
)

export { InputText }
