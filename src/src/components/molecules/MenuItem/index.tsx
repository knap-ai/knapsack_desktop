import { cva, VariantProps } from 'class-variance-authority'
import cn from 'classnames'

import { Button, ButtonSize, ButtonVariant } from '../../atoms/button'
import styles from './styles.module.scss'

export enum MenuItemVariant {
  ghost = 'ghost',
  selected = 'selected',
  regular = 'regular',
}

const menuItemVariants = cva(styles.menuItem, {
  variants: {
    variant: {
      regular: styles.regular,
      ghost: styles.ghost,
      selected: styles.selected,
    },
    defaultVariants: {
      variant: MenuItemVariant.ghost,
    },
  },
})

export interface IMenuItemProps extends VariantProps<typeof menuItemVariants> {
  className?: string
  icon?: React.ReactElement | React.ReactNode
  label?: string
  onClick?: () => void
  hasButton?: boolean
  labelButton?: string
  onClickButton?: () => void
  disabledButton?: boolean
  loadingButton?: boolean
  iconButton?: React.ReactElement | React.ReactNode
  variantButton?: ButtonVariant
  sizeButton?: ButtonSize
}

const MenuItem = ({
  variant = MenuItemVariant.selected,
  icon,
  label,
  className,
  onClick,
  hasButton = false,
  labelButton,
  onClickButton,
  disabledButton,
  loadingButton,
  iconButton,
  variantButton = ButtonVariant.ghost,
  sizeButton = ButtonSize.badge,
}: IMenuItemProps) => {
  return (
    <div className={cn(menuItemVariants({ variant }), className) + `  cursor-pointer`}>
      <div className="flex flex-row items-center justify-between w-full text-base" onClick={onClick}>
        {icon && <span className={styles.iconWrapper}>{icon}</span>}
        <span className={styles.title}>{label}</span>
      </div>
      {hasButton && (
        <Button
          label={labelButton}
          onClick={onClickButton}
          disabled={disabledButton}
          loading={loadingButton}
          icon={iconButton}
          variant={variantButton}
          size={sizeButton}
        />
      )}
    </div>
  )
}

export default MenuItem
