import React, { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'

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
  const [isExpanded, setIsExpanded] = useState(false)

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
        setIsExpanded(false)
        setCurrentMeetingId(event.payload.event_id ? event.payload.event_id : null)
        setButtonConfigs(event.payload.button_configs)
        setTitle(event.payload.title)
        setTime(event.payload.time)
      },
    )

    // const timeoutId = setTimeout(() => {
    //   closeNotification()
    // }, 60000)

    return () => {
      unlistenPromise.then(unlisten => unlisten())
    }
  }, [])


  const handleJoinMeeting = async (meetingId: string | null, buttonHandler: string) => {
    if (isProcessing.current) return

    isProcessing.current = true

    try {
      await invoke('activate_main_window_from_notification')
      await invoke('emit_event', {
        event: 'notification_handler',
        payload: { meetingId: meetingId, buttonHandler: buttonHandler },
      })
      await invoke('close_notification_window')
    } finally {
      isProcessing.current = false
    }
  }

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg overflow-visible">
      <div className="relative w-full bg-gray-100 bg-opacity-65 backdrop-blur-lg rounded-lg p-3 group overflow-visible">
        {/* Top row: logo, title, primary button, expand chevron */}
        <div className="flex items-center gap-3">
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

          <h3 className="flex-1 min-w-0 text-[14px] font-semibold text-gray-900 truncate">
            {stripMarkdown(title)}
          </h3>

          {buttonConfigs.length > 0 && (
            <button
              onClick={() => handleJoinMeeting(currentMeetingId, buttonConfigs[0].buttonHandler)}
              className="flex-shrink-0 h-8 px-4 py-2 bg-orange-800 hover:bg-red-900 active:bg-red-400 text-white rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap"
            >
              {buttonConfigs[0].buttonText}
            </button>
          )}

          {(buttonConfigs.length > 1 || time) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-transform duration-200"
            >
              <svg
                className={`w-5 h-5 fill-current transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>
          )}
        </div>

        {/* Expanded section: time and additional buttons */}
        {isExpanded && (
          <div className="mt-3 pl-12 flex flex-col gap-2">
            {time && (
              <p className="text-sm text-gray-600">{stripMarkdown(time)}</p>
            )}
            {buttonConfigs.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {buttonConfigs.slice(1).map((config, index) => (
                  <button
                    key={index}
                    onClick={() => handleJoinMeeting(currentMeetingId, config.buttonHandler)}
                    className="h-8 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap"
                  >
                    {config.buttonText}
                  </button>
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
