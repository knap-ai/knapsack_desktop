import React from 'react'

import * as ReactDialog from '@radix-ui/react-dialog'

import { DialogControllingProps, DistributiveOmit } from './types'

export type DialogProps = {
  dismissable?: boolean
  onClose?: () => void
  children: React.ReactNode
  className?: string
} & DialogControllingProps

export type DialogServiceOptions = DistributiveOmit<DialogProps, 'triggerElement' | 'isOpen'>

export const Dialog: React.FC<DialogProps> = ({
  dismissable = true,
  onClose,
  className,
  children,
  ...rest
}) => {
  return (
    <ReactDialog.Root open={'isOpen' in rest ? rest.isOpen : undefined}>
      {'triggerElement' in rest && (
        <ReactDialog.Trigger asChild={typeof rest.triggerElement !== 'string'}>
          {rest.triggerElement}
        </ReactDialog.Trigger>
      )}
      <ReactDialog.Portal>
        <ReactDialog.Title className="hidden">Dialog</ReactDialog.Title>
        <ReactDialog.Overlay
          className="rounded-[10px] bg-black opacity-25 fixed inset-0 z-[11]"
          data-tauri-drag-region
        />
        <ReactDialog.Content
          aria-description="Content"
          aria-describedby="Content"
          onEscapeKeyDown={event => {
            if (!dismissable) {
              event.preventDefault()
            } else {
              if (onClose) onClose()
            }
          }}
          onInteractOutside={event => {
            if (!dismissable) {
              event.preventDefault()
            } else {
              if (onClose) onClose()
            }
          }}
          className={`flex flex-col justify-between z-[12] rounded-[10px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary transition outline-none ${className}`}
        >
          <ReactDialog.DialogDescription className="hidden">Content</ReactDialog.DialogDescription>
          {dismissable && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Close dialog"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {children}
        </ReactDialog.Content>
      </ReactDialog.Portal>
    </ReactDialog.Root>
  )
}
