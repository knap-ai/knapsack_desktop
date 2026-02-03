import React from 'react'

import { cva, VariantProps } from 'class-variance-authority'
import cn from 'classnames'

export enum TypographyVariant {
  caption = 'caption',
  label = 'label',
  link = 'link',
  p = 'p',
  h1 = 'h1',
  h2 = 'h2',
  h3 = 'h3',
  h4 = 'h4',
  h5 = 'h5',
}

export enum TypographyWeight {
  lighter = 'lighter',
  light = 'light',
  regular = 'regular',
  semibold = 'semibold',
  medium = 'medium',
  bold = 'bold',
  extrabold = 'extrabold',
  bolder = 'bolder',
}

export enum TypographySize {
  normal = 'normal',
  xxs = 'xxs',
  xs = 'xs',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
  '2xl' = '2xl',
  '3xl' = '3xl',
  '4xl' = '4xl',
}

export enum TypographyDecoration {
  underline = 'underline',
  none = 'none',
}

const typographyVariants = cva('', {
  variants: {
    variant: {
      [TypographyVariant.caption]: 'uppercase font-medium leading-tight',
      [TypographyVariant.label]:
        'leading-tight hover:text-primary transition-colors duration-300 ease-in-out',
      [TypographyVariant.link]: 'text-md px-1 py-0.5 cursor-pointer',
      [TypographyVariant.p]: 'text-sm',
      [TypographyVariant.h1]: 'text-4xl',
      [TypographyVariant.h2]: 'text-2xl',
      [TypographyVariant.h3]: 'text-xl',
      [TypographyVariant.h4]: 'text-lg',
      [TypographyVariant.h5]: 'text-md decoration-',
    },
    weight: {
      [TypographyWeight.lighter]: 'font-lighter',
      [TypographyWeight.light]: 'font-light',
      [TypographyWeight.regular]: 'font-normal',
      [TypographyWeight.semibold]: 'font-semibold',
      [TypographyWeight.medium]: 'font-medium',
      [TypographyWeight.bold]: 'font-bold',
      [TypographyWeight.extrabold]: 'font-extrabold',
      [TypographyWeight.bolder]: 'font-bolder',
    },
    size: {
      [TypographySize.normal]: 'text-md',
      [TypographySize.xxs]: 'text-xxs',
      [TypographySize.xs]: 'text-xs',
      [TypographySize.sm]: 'text-sm',
      [TypographySize.md]: 'text-md',
      [TypographySize.lg]: 'text-lg',
      [TypographySize.xl]: 'text-xl',
      [TypographySize['2xl']]: 'text-2xl',
      [TypographySize['3xl']]: 'text-3xl',
      [TypographySize['4xl']]: 'text-4xl',
    },
    decoration: {
      [TypographyDecoration.none]: '',
      [TypographyDecoration.underline]: 'underline',
    },
  },
  compoundVariants: [
    {
      variant: TypographyVariant.label,
      class: 'text-danger',
    },
    {
      variant: TypographyVariant.label,
      class: 'text-success',
    },
    {
      variant: TypographyVariant.label,
      class: 'text-primary',
    },
    {
      variant: [
        TypographyVariant.h1,
        TypographyVariant.h2,
        TypographyVariant.h3,
        TypographyVariant.h4,
        TypographyVariant.h5,
      ],
      class: 'm-0 leading-normal',
    },
    {
      variant: TypographyVariant.link,
      decoration: TypographyDecoration.underline,
      class: 'underline',
    },
  ],
  defaultVariants: {
    variant: TypographyVariant.p,
    weight: TypographyWeight.regular,
    size: TypographySize.normal,
    decoration: TypographyDecoration.none,
  },
})

type ILinkProps = React.HTMLProps<'a'> & { variant?: TypographyVariant.link }
type ILabelProps = React.HTMLProps<'label'> & {
  variant?: TypographyVariant.label
}
type ICaptionProps = React.HTMLProps<'span'> & {
  variant?: TypographyVariant.caption
}
type IParagraphProps = React.HTMLProps<'p'> & { variant?: TypographyVariant.p }
type IH1Props = React.HTMLProps<'h1'> & { variant?: TypographyVariant.h1 }
type IH2Props = React.HTMLProps<'h2'> & { variant?: TypographyVariant.h2 }
type IH3Props = React.HTMLProps<'h3'> & { variant?: TypographyVariant.h3 }
type IH4Props = React.HTMLProps<'h4'> & { variant?: TypographyVariant.h4 }
type IH5Props = React.HTMLProps<'h5'> & { variant?: TypographyVariant.h5 }

export type ITypographyProps = VariantProps<typeof typographyVariants> & {
  children: React.ReactNode
  onClick?: () => void
  /**
   * Classname to adds custom css
   * */
  className?: string &
    (
      | ILinkProps
      | ILabelProps
      | ICaptionProps
      | IH1Props
      | IH2Props
      | IH3Props
      | IH4Props
      | IH5Props
      | IParagraphProps
    )
}

const getTypographyVariantComponent = (variant?: TypographyVariant): React.ElementType => {
  switch (variant) {
    case TypographyVariant.h1:
      return 'h1'
    case TypographyVariant.h2:
      return 'h2'
    case TypographyVariant.h3:
      return 'h3'
    case TypographyVariant.h4:
      return 'h4'
    case TypographyVariant.h5:
      return 'h5'
    case TypographyVariant.label:
      return 'label'
    case TypographyVariant.link:
      return 'a'
    case TypographyVariant.p:
      return 'p'
    case TypographyVariant.caption:
    default:
      return 'span'
  }
}

const Typography = ({
  children,
  variant,
  size,
  decoration,
  weight,
  className,
  ...props
}: ITypographyProps): JSX.Element => {
  const TypographyVariantComponent = getTypographyVariantComponent(variant ?? undefined)

  return (
    <TypographyVariantComponent
      className={cn(typographyVariants({ variant, size, decoration, weight }), className)}
      {...props}
    >
      {children}
    </TypographyVariantComponent>
  )
}

export { Typography }
