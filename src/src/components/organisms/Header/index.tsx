import { useEffect, useState } from 'react'

import { Typography, TypographySize, TypographyWeight } from 'src/components/atoms/typography'

import { getAppVersion } from 'src/utils/app'

export const Header = ({
  title,
  leftComponent,
  rightComponent,
  middleRightComponent,
}: {
  title?: string
  leftComponent?: React.ReactNode
  rightComponent?: React.ReactNode
  middleRightComponent?: React.ReactNode
}) => {
  const [appVersion, setAppVersion] = useState<string>()

  useEffect(() => {
    getAppVersion().then(value => setAppVersion(value))
  }, [])

  return (
    <div
      className={`Header flex w-full justify-between items-center min-h-[40px] ${leftComponent ? 'pl-[80px]' : ''} pr-[16px] bg-ks-bg-main border-b-[1px] border-[#e2e2e2] rounded-t-[10px] bg-transparent`}
      data-tauri-drag-region
    >
      {leftComponent ? leftComponent : <div> </div>}

      <div
        className="absolute left-1/2 transform -translate-x-1/2 font-InterTight text-[#B8B7B7] font-bold text-xxs leading-2"
      >
        { title ? title : "KNAPSACK IS PRIVATE"}
      </div>

      <div className="flex items-center gap-8">
        {middleRightComponent && middleRightComponent}
        <Typography
            size={TypographySize.xxs}
            weight={TypographyWeight.medium}
            className="text-zinc-400"
          >
            v{appVersion}
        </Typography>
        {rightComponent}
      </div>
    </div>
  )
}
