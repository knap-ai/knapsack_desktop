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
    <div className="flex w-full bg-white rounded-lg overflow-visible">
      <div className="relative w-full bg-gray-100 bg-opacity-65 backdrop-blur-lg rounded-lg p-3 flex items-start gap-3 group overflow-visible">
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
          <h3 className="text-[14px] font-semibold text-gray-900 line-clamp-2">
            {stripMarkdown(title)}
          </h3>
          {time && (
            <p className="text-sm text-gray-600 line-clamp-4">{stripMarkdown(time)}</p>
          )}
        </div>

        {buttonConfigs.length > 0 && (
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={() => handleJoinMeeting(currentMeetingId, buttonConfigs[0].buttonHandler)}
              className="h-8 px-4 py-2 bg-orange-800 hover:bg-red-900 active:bg-red-400 text-white rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap"
            >
              {buttonConfigs[0].buttonText}
            </button>
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
    </div>
  )
}

export default NotificationWindow
