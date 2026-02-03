import { useEffect } from 'react'

import { Typography, TypographySize, TypographyWeight } from 'src/components/atoms/typography'

export const ErrorPage = () => {
  useEffect(() => {
    const timeout = setTimeout(() => window.location.reload(), 10000000)
    return () => clearTimeout(timeout)
  })

  return (
    <div
      className="PageContainer flex flex-col font-sans h-[100vh] w-full overflow-auto bg-ks-neutral-50 rounded-[10px] justify-center items-center"
      data-tauri-drag-region
    >
      <Typography
        size={TypographySize['4xl']}
        className="cursor-pointer"
        weight={TypographyWeight.bold}
      >
        An error ocurred the app will refresh in 10 seconds
      </Typography>
    </div>
  )
}
