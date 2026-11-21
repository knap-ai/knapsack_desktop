import { invoke } from '@tauri-apps/api/tauri'
import React, { useRef, useState } from 'react'
interface HeaderRecordingProps { isPaused: boolean; onOpenMeeting?: () => void }
const HeaderRecording: React.FC<HeaderRecordingProps> = ({ isPaused, onOpenMeeting }) => {
  const stopping = useRef(false)
  const [stopPending, setStopPending] = useState(false)
  const [stopFailed, setStopFailed] = useState(false)
  const requestStop = async () => {
    if (stopping.current) return
    stopping.current = true
    setStopPending(true)
    setStopFailed(false)
    try { await invoke('emit_stop_events') }
    catch { setStopFailed(true) }
    finally { stopping.current = false; setStopPending(false) }
  }
  const status = isPaused ? 'Recording paused' : 'Recording'
  const marker = <><span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${isPaused ? 'bg-zinc-500' : 'bg-[#c14841]'}`} /><span aria-hidden="true">{isPaused ? 'Paused' : 'Recording'}</span></>
  return <div className="inline-flex w-fit max-w-full items-center gap-2 whitespace-nowrap rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700">
    <span role="status" className="sr-only">{status}</span>
    {onOpenMeeting ? <button type="button" onClick={onOpenMeeting} className="inline-flex items-center gap-1.5 rounded-full" aria-label="Open active meeting" title="Open active meeting">{marker}</button> : <span className="inline-flex items-center gap-1.5">{marker}</span>}
    <button type="button" aria-label="Stop recording" title={stopFailed ? 'Could not stop. Try again.' : 'Stop recording'} className="rounded-full px-1.5 py-0.5 font-medium text-[#a52d28] hover:bg-red-50" disabled={stopPending} onClick={() => void requestStop()}>{stopPending ? 'Stopping…' : 'Stop'}</button>
    {stopFailed && <span role="alert" className="text-[#a52d28]">Try again</span>}
  </div>
}
export default HeaderRecording
