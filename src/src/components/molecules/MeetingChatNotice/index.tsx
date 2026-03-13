import React, { useCallback, useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { getMeetingChatMessage, getMeetingChatAutoSend, getMeetingChatEnabled } from 'src/utils/settings'

interface MeetingChatNoticeProps {
  meetingPlatform: string | undefined
}

const MeetingChatNotice: React.FC<MeetingChatNoticeProps> = ({ meetingPlatform }) => {
  const [copied, setCopied] = useState(false)
  const [autoSendStatus, setAutoSendStatus] = useState<'pending' | 'sent' | 'failed' | 'idle'>('idle')
  const [message, setMessage] = useState('')
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    getMeetingChatEnabled().then(setEnabled)
    getMeetingChatMessage().then(setMessage)
  }, [])

  // Attempt auto-send on mount if enabled
  useEffect(() => {
    if (!message || !meetingPlatform || !enabled) return

    const tryAutoSend = async () => {
      const autoSendEnabled = await getMeetingChatAutoSend()
      if (!autoSendEnabled) {
        setAutoSendStatus('idle')
        return
      }

      setAutoSendStatus('pending')
      try {
        // Wait for the meeting window to be ready
        await new Promise(resolve => setTimeout(resolve, 2000))
        const success = await invoke<boolean>('send_meeting_chat_message', {
          platform: meetingPlatform,
          message,
        })
        setAutoSendStatus(success ? 'sent' : 'failed')
      } catch {
        setAutoSendStatus('failed')
      }
    }

    tryAutoSend()
  }, [message, meetingPlatform])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: use Tauri clipboard
      try {
        await invoke('send_meeting_chat_message', {
          platform: 'clipboard_only',
          message,
        })
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (e) {
        console.error('Failed to copy to clipboard:', e)
      }
    }
  }, [message])

  const handleSendToChat = useCallback(async () => {
    if (!meetingPlatform) return
    setAutoSendStatus('pending')
    try {
      const success = await invoke<boolean>('send_meeting_chat_message', {
        platform: meetingPlatform,
        message,
      })
      setAutoSendStatus(success ? 'sent' : 'failed')
    } catch {
      setAutoSendStatus('failed')
    }
  }, [meetingPlatform, message])

  if (!message || !enabled) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md py-2.5 px-3 w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-blue-700 text-xxs font-semibold font-InterTight tracking-[0.08em] flex-shrink-0">
            MEETING NOTICE
          </span>
          <span className="text-blue-600 text-xs font-Inter truncate">
            {message}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {autoSendStatus === 'sent' ? (
            <span className="text-green-600 text-xs font-Inter font-medium">
              Sent to chat
            </span>
          ) : autoSendStatus === 'pending' ? (
            <span className="text-blue-500 text-xs font-Inter">
              Sending...
            </span>
          ) : (
            <>
              {meetingPlatform && meetingPlatform !== 'unknown' && (
                <button
                  type="button"
                  onClick={handleSendToChat}
                  className="text-xs font-Inter font-medium text-blue-700 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
                >
                  Send to chat
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-Inter font-medium text-blue-700 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingChatNotice
