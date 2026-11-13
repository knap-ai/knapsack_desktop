import { useEffect, useState } from 'react'

import { getAppVersion } from 'src/utils/app'

export const Header = ({
  title,
  leftComponent,
  rightComponent,
  middleRightComponent,
  centeredComponent,
}: {
  title?: string
  leftComponent?: React.ReactNode
  rightComponent?: React.ReactNode
  middleRightComponent?: React.ReactNode
  centeredComponent?: React.ReactNode
}) => {
  const [appVersion, setAppVersion] = useState<string>()

  useEffect(() => {
    getAppVersion().then(value => setAppVersion(value))
  }, [])

  return (
    <div
      className={`Header relative ${centeredComponent ? 'grid' : 'flex'} w-full justify-between items-center min-h-[40px] ${centeredComponent ? 'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] px-4' : leftComponent ? 'pl-[80px] pr-4' : 'pr-4'} bg-ks-bg-main border-b-[1px] border-[#e2e2e2] rounded-t-[10px] bg-transparent`}
      data-tauri-drag-region
    >
      {leftComponent ? (
        <div
          className={
            centeredComponent
              ? 'min-w-0 col-span-3 row-start-3 min-[440px]:row-start-2 min-[760px]:col-span-1 min-[760px]:col-start-1 min-[760px]:row-start-1 min-[760px]:pl-16 py-1'
              : 'min-w-0'
          }
        >
          {leftComponent}
        </div>
      ) : (
        <div data-tauri-drag-region> </div>
      )}

      {centeredComponent && (
        <div
          className="col-start-2 row-start-2 min-[440px]:row-start-1 z-10 py-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {centeredComponent}
        </div>
      )}
      <div
        data-tauri-drag-region
        className={`${centeredComponent ? 'hidden' : ''} flex-1 min-w-0 text-center font-InterTight text-[#B8B7B7] font-bold text-xxs leading-2 truncate px-2`}
      >
        {title}
      </div>

      <div
        data-tauri-drag-region
        className={`${centeredComponent ? 'col-start-3 row-start-1' : ''} flex items-center justify-end gap-3 min-w-0`}
      >
        {middleRightComponent && middleRightComponent}
        {appVersion && (
          <span
            data-tauri-drag-region
            className="text-zinc-400 hidden min-[600px]:block whitespace-nowrap text-xxs font-medium font-InterTight"
          >
            v{appVersion}
          </span>
        )}
        {rightComponent}
      </div>
    </div>
  )
}
