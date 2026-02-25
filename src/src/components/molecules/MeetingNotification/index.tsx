import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { getCurrent, LogicalSize } from '@tauri-apps/api/window'

dayjs.extend(relativeTime)

// Strip markdown formatting for plain-text notification display.
// LLMs sometimes include bold/italic/links even when asked for plain text.
function stripMarkdown(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // [text](url) → text
    .replace(/\*\*([^*]+)\*\*/g, '$1')          // **bold** → bold
    .replace(/\*([^*]+)\*/g, '$1')              // *italic* → italic
    .replace(/__([^_]+)__/g, '$1')              // __bold__ → bold
    .replace(/_([^_]+)_/g, '$1')                // _italic_ → italic
    .replace(/^#{1,6}\s+/gm, '')                // # headers → stripped
    .replace(/`([^`]+)`/g, '$1')                // `code` → code
    .replace(/\n+/g, ' ')                       // newlines → spaces
    .trim()
}

const NOTIF_WIDTH = 720 // Must match Rust NOTIF_WIDTH constant
const MIN_HEIGHT = 100
const MAX_HEIGHT = 520
const PADDING = 4

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

  useLayoutEffect(() => {
    const root = document.getElementById('notification-root')
    if (!root) return

    const resizeWindow = () => {
      // Use rAF to let the browser finish layout before measuring
      requestAnimationFrame(async () => {
        const contentHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, root.scrollHeight + PADDING))

        const appWindow = getCurrent()
        await appWindow.setSize(new LogicalSize(NOTIF_WIDTH, contentHeight))
      })
    }

    resizeWindow()
  }, [title, time, buttonConfigs, isDropdownOpen])

  const handleJoinMeeting = async (meetingId: string | null, buttonHandler: string) => {
    if (isProcessing.current) return

    isProcessing.current = true

    try {
      await invoke('activate_main_window')
      await invoke('emit_event', {
        event: 'notification_handler',
        payload: { meetingId: meetingId, buttonHandler: buttonHandler },
      })
      await invoke('close_notification_window')
    } finally {
      isProcessing.current = false
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div className="flex w-full bg-white rounded-xl overflow-visible" style={{ borderBottom: '1px solid #E3E2E2' }}>
      <div className="relative w-full bg-gray-50 bg-opacity-80 backdrop-blur-lg rounded-xl p-4 flex items-start gap-3 group overflow-visible">
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

        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-gray-900 line-clamp-2">
            {stripMarkdown(title)}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-4">{stripMarkdown(time)}</p>
        </div>
        {buttonConfigs.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Dismiss button — always visible */}
            {buttonConfigs.some(c => c.buttonHandler === 'dismiss_notification_handler') && (
              <button
                onClick={() => handleJoinMeeting(currentMeetingId, 'dismiss_notification_handler')}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Dismiss
              </button>
            )}
            {/* Primary action + dropdown for extras */}
            <div
              className="relative flex h-8 rounded-lg"
              ref={dropdownRef}
              style={{ background: '#6474AC' }}
            >
              <button
                onClick={() => handleJoinMeeting(currentMeetingId, buttonConfigs[0].buttonHandler)}
                className="px-4 py-2 text-white rounded-lg text-xs font-medium transition-opacity duration-200 hover:opacity-90 flex items-center gap-2 whitespace-nowrap"
              >
                {buttonConfigs[0].buttonText}
              </button>
              {buttonConfigs.filter(c => c.buttonHandler !== 'dismiss_notification_handler').length > 1 && (
                <>
                  <div className="w-[1px] bg-[#00000022] outline-1 "></div>

                  <button
                    onClick={toggleDropdown}
                    className="px-2 py-2 text-white rounded-r-lg text-xs font-medium transition-opacity duration-200 hover:opacity-90"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                </>
              )}
              {isDropdownOpen && (
                <div className="absolute w-36 mx-2 left-0 top-full mt-1 bg-white rounded-lg z-50 border-black shadow-[0px_1px_3px_0px_rgba(40,33,16,0.10)]">
                  {buttonConfigs.slice(1).filter(c => c.buttonHandler !== 'dismiss_notification_handler').map((config, index) => (
                    <div
                      key={index}
                      onClick={() => handleJoinMeeting(currentMeetingId, config.buttonHandler)}
                      className="px-4 py-2 text-xs text-gray-700 cursor-pointer"
                      style={{ '--hover-color': '#6474AC' } as React.CSSProperties}
                      onMouseEnter={e => (e.currentTarget.style.color = '#6474AC')}
                      onMouseLeave={e => (e.currentTarget.style.color = '')}
                    >
                      {config.buttonText}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationWindow
