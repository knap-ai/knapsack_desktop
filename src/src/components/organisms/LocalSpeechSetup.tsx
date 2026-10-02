import { useEffect, useState } from 'react'
import { getLocalSpeechStatus, installLocalSpeech, LocalSpeechStatus } from 'src/utils/localSpeech'

export default function LocalSpeechSetup() {
  const [status, setStatus] = useState<LocalSpeechStatus | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let live = true
    const refresh = () => getLocalSpeechStatus().then(s => { if (live) setStatus(s) }).catch(e => { if (live) setError(String(e)) })
    void refresh()
    const timer = setInterval(refresh, 1000)
    return () => { live = false; clearInterval(timer) }
  }, [])
  const download = async () => {
    setError('')
    setStatus(s => s && ({ ...s, downloading: true, error: null }))
    try { await installLocalSpeech() } catch (e) { setError(String(e)) }
    finally { try { setStatus(await getLocalSpeechStatus()) } catch (e) { setError(String(e)) } }
  }
  return <section className="rounded border p-4 space-y-3" aria-label="On-device speech">
    <h2 className="font-semibold">Voice &amp; meeting transcription</h2>
    <p>Download speech recognition once (148 MB). Then voice input and meeting transcription work on this device, including English and Spanish. No API key needed; audio stays here.</p>
    <p className="text-sm">For voice conversations and meeting summaries, also set up a local chat model below. Spoken replies use an installed device voice.</p>
    <button className="rounded border px-3 py-2 disabled:opacity-50" disabled={!status || status.downloading || status.ready} onClick={() => void download()}>
      {status?.ready ? 'On-device speech is ready' : status?.downloading ? 'Downloading speech model…' : status?.downloaded ? 'Resume speech download' : 'Set up on-device speech · 148 MB'}
    </button>
    {status?.downloading && <div role="status"><progress className="w-full" value={status.downloaded} max={status.total} />{Math.round(status.downloaded / status.total * 100)}% · You can close this window while it downloads.</div>}
    {(error || status?.error) && <p role="alert" className="text-red-700">{error || status?.error}</p>}
  </section>
}
