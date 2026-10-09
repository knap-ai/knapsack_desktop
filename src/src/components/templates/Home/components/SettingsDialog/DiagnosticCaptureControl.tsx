import { useState } from 'react'
import { save } from '@tauri-apps/api/dialog'
import { writeTextFile } from '@tauri-apps/api/fs'
import { exportDiagnosticCapture } from 'src/utils/diagnosticExport'
import { invoke } from '@tauri-apps/api/tauri'
import { diagnosticCaptureEnabled, setDiagnosticCapture } from 'src/utils/diagnostics'

export default function DiagnosticCaptureControl() {
  const [enabled, setEnabled] = useState(diagnosticCaptureEnabled)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const toggle = async () => {
    setBusy(true)
    try {
      await invoke('set_diagnostic_capture', { enabled: !enabled })
      setDiagnosticCapture(!enabled)
      setEnabled(!enabled)
      setMessage(!enabled ? 'Capture started for this app session.' : 'Capture stopped and cleared.')
    } catch { setMessage('Could not change local capture.') }
    finally { setBusy(false) }
  }
  const exportCapture = async () => {
    setBusy(true)
    try {
      const outcome = await exportDiagnosticCapture({
        snapshot: () => invoke<unknown[]>('diagnostic_capture_snapshot'),
        save: () => save({ defaultPath: 'knapsack-local-diagnostics.json', filters: [{ name: 'JSON', extensions: ['json'] }] }),
        write: (path, content) => writeTextFile(path, content),
      })
      setMessage(outcome === 'saved' ? 'Saved locally. Stop capture to clear memory; delete the file when finished.' : 'Export cancelled.')
    } catch { setMessage('Could not export local capture.') }
    finally { setBusy(false) }
  }

  return <section aria-label="Local diagnostic capture">
    <h3>Local diagnostic capture</h3>
    <p>Off by default. Records random task IDs, phase durations and status only. Keeps the latest 256 frontend and 1024 native events in memory for this app session. No automatic upload. Stopping clears captured events.</p>
    <button disabled={busy} onClick={toggle}>{enabled ? 'Stop and clear capture' : 'Start local capture'}</button>
    <button disabled={busy || !enabled} onClick={exportCapture}>Export local capture</button>
    <p role="status">{message}</p>
  </section>
}
