import { invoke } from '@tauri-apps/api/tauri'

export type LocalSpeechStatus = { ready: boolean; downloading: boolean; downloaded: number; total: number; error: string | null }
export const getLocalSpeechStatus = () => invoke<LocalSpeechStatus>('local_speech_status')
export const installLocalSpeech = () => invoke<void>('install_local_speech')

export async function transcribeLocalAudio(blob: Blob, signal: AbortSignal): Promise<string> {
  const context = new AudioContext()
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer())
    if (decoded.duration > 180) throw new Error('Please record voice messages under three minutes.')
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')
    // Browser codecs decode locally; OfflineAudioContext mixes and resamples
    // to Whisper's 16 kHz mono PCM without uploading the recording.
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * 16000)), 16000)
    const source = offline.createBufferSource()
    source.buffer = decoded
    source.connect(offline.destination)
    source.start()
    const pcm = await offline.startRendering()
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')
    const result = await invoke<{ text: string }>('transcribe_local_voice', { samples: Array.from(pcm.getChannelData(0)) })
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')
    return result.text
  } finally { await context.close() }
}

export async function localSystemVoice(): Promise<SpeechSynthesisVoice | undefined> {
  const synth = window.speechSynthesis
  if (!synth) return undefined
  if (!synth.getVoices().length) {
    await new Promise<void>(resolve => {
      const finish = () => { clearTimeout(timer); synth.removeEventListener('voiceschanged', finish); resolve() }
      const timer = setTimeout(finish, 1500)
      synth.addEventListener('voiceschanged', finish, { once: true })
      if (synth.getVoices().length) finish()
    })
  }
  const voices = synth.getVoices().filter(voice => voice.localService)
  return voices.find(voice => voice.lang.startsWith(navigator.language.split('-')[0])) || voices[0]
}
