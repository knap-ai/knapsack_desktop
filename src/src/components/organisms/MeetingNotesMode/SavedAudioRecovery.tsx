import { useRef, useState } from 'react'

import { invoke } from '@tauri-apps/api/tauri'

export default function SavedAudioRecovery({
  pendingAudio,
  transcriptionError,
  setTranscriptionError,
  reconnecting,
  reconnectTranscription,
}: {
  pendingAudio: number
  transcriptionError: string | null
  setTranscriptionError: (error: string) => void
  reconnecting: boolean
  reconnectTranscription: () => Promise<void>
}) {
  const [recoveryBusy, setRecoveryBusy] = useState(false)
  const recoveryLock = useRef(false)
  return transcriptionError || pendingAudio > 0 ? (
    <div
      role={transcriptionError ? 'alert' : 'status'}
      className={
        transcriptionError
          ? 'rounded-lg border border-amber-300 bg-amber-50 p-4 my-3'
          : 'text-xs text-zinc-500 my-2'
      }
    >
      <strong>
        {transcriptionError
          ? 'Transcription needs attention'
          : 'Saved audio is waiting to be transcribed'}
      </strong>
      {transcriptionError && <p>{transcriptionError}</p>}
      {/sign.?in|auth failed|session expired|unauthorized/i.test(transcriptionError || '') && (
        <button
          type="button"
          className="transcription-reconnect"
          disabled={reconnecting}
          onClick={() => void reconnectTranscription()}
        >
          {reconnecting ? 'Waiting for sign-in…' : 'Sign in to Knapsack'}
        </button>
      )}
      <p>Your audio is saved on this device. Your notes stay as you edited them.</p>
      {pendingAudio > 0 && (
        <button
          type="button"
          className="transcription-reconnect"
          disabled={recoveryBusy}
          onClick={async () => {
            if (recoveryLock.current) return
            recoveryLock.current = true
            setRecoveryBusy(true)
            try {
              await invoke('resume_saved_transcription')
            } catch (error) {
              setTranscriptionError(`${String(error)} Your audio is preserved.`)
            } finally {
              recoveryLock.current = false
              setRecoveryBusy(false)
            }
          }}
        >
          {recoveryBusy ? 'Resuming transcription…' : 'Retry saved audio'}
        </button>
      )}
    </div>
  ) : null
}
