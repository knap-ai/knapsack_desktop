import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type DialogWithTriggerElementProps = {
  /**
   * The element that triggers the dialog. It shouldn't be passed if `isOpen` prop
   * is passed.
   */
  triggerElement: string | React.ReactElement
}

export type DialogWithStateControlProps = {
  /**
   * The prop that controls the dialog. If passed, `triggerElement` prop shouldn't
   * be passed.
   * The prop `onClose` probably should be used together with `isOpen` for helping
   * changing the state of the dialog.
   */
  isOpen: boolean
}

export type DialogControllingProps = DialogWithTriggerElementProps | DialogWithStateControlProps
