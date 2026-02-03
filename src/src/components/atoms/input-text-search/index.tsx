import { cva, VariantProps } from 'class-variance-authority'
import cn from 'classnames'

import styles from './styles.module.scss'

export enum InputTextSize {
  small = 'small',
}

export enum InputTextIconPosition {
  left = 'left',
}

const inputTextVariants = cva(styles.inputText, {
  variants: {
    size: {
      small: styles.small,
      medium: styles.medium,
    },
    iconPosition: {
      left: styles.left,
      right: styles.right,
    },
  },
  defaultVariants: {
    size: InputTextSize.small,
    iconPosition: InputTextIconPosition.left,
  },
})

export interface IInputTextProps extends VariantProps<typeof inputTextVariants> {
  placeholder?: string
  onClick?: () => void
  label?: string
  handlerPromptText?: (value: string) => void
  icon?: React.ReactElement | React.ReactNode
  className?: string
}

const InputTextSearch = ({
  placeholder,
  onClick,
  label,
  handlerPromptText,
  icon,
  className,
  size = InputTextSize.small,
  iconPosition = InputTextIconPosition.left,
}: IInputTextProps) => {
  return (
    <div className={cn(inputTextVariants({ size, iconPosition }), className)} onClick={onClick}>
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      <input
        type="text"
        placeholder={placeholder}
        value={label}
        onChange={event => handlerPromptText && handlerPromptText(event.target.value)}
        className={styles.input}
      />
    </div>
  )
}
export default InputTextSearch
