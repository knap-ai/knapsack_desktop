import React from 'react'

import { mailTo } from 'src/utils/mailTo'

import { Button, ButtonVariant } from 'src/components/atoms/button'

export const EmailHelpButton: React.FC<{ provider?: string }> = ({ provider }) => {
  return (
    <Button
      label="Need Help?"
      variant={ButtonVariant.regular}
      onClick={() => mailTo(provider)}
      className="rounded-full"
    />
  )
}
