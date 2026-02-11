import React, { useEffect, useRef, useState } from 'react'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'

dayjs.extend(relativeTime)

export interface ButtonConfig {
  buttonText: string
  buttonHandler: string
}

function NotificationWindow() {
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null)
  const [buttonConfigs, setButtonConfigs] = useState<ButtonConfig[]>([])
  const [title, setTitle] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const isProcessing = React.useRef(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unlistenPromise = listen(
      'notification_event_id',
      (event: {
        payload: {
          event_id: string | undefined
          title: string
          time: string
          button_configs: ButtonConfig[]
        }
      }) => {
        setIsDropdownOpen(false)
        setCurrentMeetingId(event.payload.event_id ? event.payload.event_id : null)
        setButtonConfigs(event.payload.button_configs)
        setTitle(event.payload.title)
        setTime(event.payload.time)

        // Resize the notification window to fit content (within sane bounds)
        // so long messages don't bleed off-screen or get truncated.
        // We do this after React paints.
        requestAnimationFrame(() => {
          const root = document.getElementById('notification-root')
          if (!root) return

          const rect = root.getBoundingClientRect()
          const padding = 24
          const targetWidth = Math.min(720, Math.max(420, Math.ceil(rect.width + padding)))
          const targetHeight = Math.min(520, Math.max(120, Math.ceil(rect.height + padding)))

          invoke('resize_notification_window', {
            width: targetWidth,
            height: targetHeight,
          }).catch(() => {
            // non-fatal; window will just keep default size
          })
        })
      },
    )

    // const timeoutId = setTimeout(() => {
    //   closeNotification()
    // }, 60000)

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      unlistenPromise.then(unlisten => unlisten())
      // clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const closeNotification = async () => {
    await invoke('close_notification_window')
  }

  const handleJoinMeeting = async (meetingId: string | null, buttonHandler: string) => {
    if (isProcessing.current) return

    isProcessing.current = true

    await invoke('activate_main_window')
    await invoke('emit_event', {
      event: 'notification_handler',
      payload: { meetingId: meetingId, buttonHandler: buttonHandler },
    })
    await invoke('close_notification_window')

    isProcessing.current = false
    await closeNotification()
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div className="inline-flex bg-white rounded-lg overflow-visible">
      <div className="relative bg-gray-100 bg-opacity-65 backdrop-blur-lg rounded-lg p-3 flex items-center gap-3 group overflow-visible">
        <button
          onClick={() => invoke('close_notification_window')}
          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 p-1"
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L13 13M1 13L13 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="w-8 h-8 ml-1 flex-shrink-0 flex items-center justify-center">
          <img
            src="/assets/images/icons/notification-logo.png"
            alt="App Icon"
            className="w-auto h-auto object-contain max-w-full max-h-full"
          />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-[14px] font-semibold text-gray-900 whitespace-pre-wrap break-words">
            {title}
          </h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{time}</p>
        </div>
        {buttonConfigs.length > 0 && (
          <div
            className="relative flex h-8 flex-shrink-0 bg-orange-800 hover:bg-red-900 rounded"
            ref={dropdownRef}
          >
            <button
              onClick={() => handleJoinMeeting(currentMeetingId, buttonConfigs[0].buttonHandler)}
              className="px-4 py-2 active:bg-bg-red-400 text-white rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              {buttonConfigs[0].buttonText}
            </button>
            {buttonConfigs.length > 1 && (
              <>
                <div className="w-[1px] bg-[#00000022] outline-1 "></div>

                <button
                  onClick={toggleDropdown}
                  className="px-2 py-2 text-white rounded-r-lg text-xs font-medium transition-colors duration-200 border-l border-bg-red-main"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
              </>
            )}
            {isDropdownOpen && (
              <div className="absolute w-36 mx-2 left-0 top-full mt-1 bg-white rounded-lg  z-50 border-black shadow-[0px_1px_3px_0px_rgba(40,33,16,0.10)]">
                {buttonConfigs.slice(1).map((config, index) => (
                  <div
                    key={index}
                    onClick={() => handleJoinMeeting(currentMeetingId, config.buttonHandler)}
                    className="px-4 py-2 text-xs text-gray-700 hover:text-orange-800 cursor-pointer text-right"
                  >
                    {config.buttonText}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationWindow
