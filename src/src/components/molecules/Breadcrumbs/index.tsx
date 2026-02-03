import { Fragment, useCallback, useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'
import { getHasOnboarded } from 'src/pages/onboarding'
import { BaseException } from 'src/utils/exceptions/base'

import { Typography } from 'src/components/atoms/typography'

import NavigationArrow from '/assets/images/navigation_arrow_vector.svg'

export type BreadcrumbItem = {
  name: string
  onClick?: () => void
}

export enum BreadcrumbPages {
  INITIAL = 'initial',
  HOME = 'home',
  ONBOARDING = 'onboarding',
}

export const Breadcrumbs = ({ items }: { items: (BreadcrumbItem | BreadcrumbPages)[] }) => {
  const navigate = useNavigate()
  const [parsedItems, setParsedItems] = useState<BreadcrumbItem[]>([])

  const parsePageToBreadcrumbItem = useCallback(
    async (breadcrumbPage: BreadcrumbPages): Promise<BreadcrumbItem> => {
      if (breadcrumbPage === BreadcrumbPages.HOME) {
        return { name: 'Home', onClick: () => navigate('/home') }
      }
      if (breadcrumbPage === BreadcrumbPages.ONBOARDING) {
        return { name: 'Onboarding', onClick: () => navigate('/onboard') }
      }
      if (breadcrumbPage === BreadcrumbPages.INITIAL) {
        return await getHasOnboarded()
          ? parsePageToBreadcrumbItem(BreadcrumbPages.HOME)
          : parsePageToBreadcrumbItem(BreadcrumbPages.ONBOARDING)
      }

      throw new BaseException('Undefined page')
    },
    [navigate],
  )

  useEffect(() => {
    const parseItems = async () => {
      const parsed = await Promise.all(
        items.map(async (item) => {
          if (typeof item === 'string') {
            return await parsePageToBreadcrumbItem(item)
          }
          return item
        })
      )
      setParsedItems(parsed)
    }

    parseItems()
  }, [items, parsePageToBreadcrumbItem])

  return (
    <div className="Breadcrumps flex items-center gap-[12px] justify-center">
      {parsedItems.map((item, index) => (
        <Fragment key={item.name}>
          <Typography className="leading-5 cursor-pointer" onClick={item.onClick}>
            {item.name}
          </Typography>
          {index !== parsedItems.length - 1 ? (
            <img src={NavigationArrow} alt="Navigation arrow" />
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}
