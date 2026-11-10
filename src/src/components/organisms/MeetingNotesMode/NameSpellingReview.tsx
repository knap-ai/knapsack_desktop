import { useEffect, useRef, useState } from 'react'

import { Editor } from '@tiptap/react'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import {
  CORRECTIONS_CHANGED,
  NameCorrection,
  readCorrections,
  suggestedNames,
  validateCorrection,
  writeCorrections,
} from 'src/utils/nameCorrections'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'

export function NameSpellingReview({
  editor,
  text,
  onPreview,
  accountEmail,
}: {
  editor: Editor | null
  text: string
  onPreview: () => void
  accountEmail?: string
}) {
  const [user, setUser] = useState('')
  const [saved, setSaved] = useState<NameCorrection[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const lifecycle = useRef({ active: false, epoch: 0 })
  useEffect(() => {
    const state = lifecycle.current
    state.active = true
    const refreshIdentity = () => {
      const epoch = ++state.epoch
      setUser('')
      setSaved([])
      setFrom('')
      setTo('')
      setStatus('')
      void KNLocalStorage.getItem('KN_PROFILE')
        .then(async profile => {
          const current = await KNLocalStorage.getItem('KN_PROFILE')
          if (profile?.uuid !== current?.uuid || profile?.email !== current?.email) return
          if (!state.active || epoch !== state.epoch) return
          if (
            accountEmail !== undefined &&
            (!accountEmail || profile?.email?.toLowerCase() !== accountEmail.toLowerCase())
          )
            return
          if (profile?.uuid) {
            setUser(profile.uuid)
            setSaved(readCorrections(profile.uuid))
          }
        })
        .catch(() => {
          if (state.active && epoch === state.epoch)
            setStatus('Local spelling memory is unavailable.')
        })
    }
    refreshIdentity()
    window.addEventListener(PROFILE_CHANGED_EVENT, refreshIdentity)
    return () => {
      state.active = false
      state.epoch++
      window.removeEventListener(PROFILE_CHANGED_EVENT, refreshIdentity)
    }
  }, [accountEmail])
  useEffect(() => {
    const refresh = () => setSaved(readCorrections(user))
    window.addEventListener(CORRECTIONS_CHANGED, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CORRECTIONS_CHANGED, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [user])
  const persist = async (update: (current: NameCorrection[]) => NameCorrection[]) => {
    const epoch = lifecycle.current.epoch
    try {
      const profile = await KNLocalStorage.getItem('KN_PROFILE')
      if (!lifecycle.current.active || epoch !== lifecycle.current.epoch) return
      if (
        !user ||
        profile?.uuid !== user ||
        (accountEmail !== undefined &&
          (!accountEmail || profile?.email?.toLowerCase() !== accountEmail.toLowerCase()))
      ) {
        setStatus('Account changed. Reopen this meeting.')
        return
      }
      const next = update(readCorrections(user))
      writeCorrections(user, next)
      setSaved(next)
      setStatus('Saved on this device. Existing notes are unchanged.')
    } catch (error) {
      if (!lifecycle.current.active || epoch !== lifecycle.current.epoch) return
      setStatus(error instanceof Error ? error.message : 'Could not save spellings on this device.')
    }
  }
  return (
    <details className="text-sm text-gray-600 my-2 border-b border-gray-200 pb-2">
      <summary className="cursor-pointer">
        Review name spellings · {saved.filter(v => v.enabled).length} remembered
      </summary>
      <p className="my-2">
        Check names when useful. Suggestions may include ordinary words; they are not marked as
        errors. Remembered spellings guide future meeting notes on this device and may be sent to
        your existing notes model when relevant.
      </p>
      <p>
        In edit mode, capture the heard selection before correcting it, then capture the preferred
        selection afterward. Confirm Remember spelling to retain the pair.
      </p>
      <p>Possible names (unconfirmed):</p>
      <div className="flex flex-wrap gap-2 my-2">
        {suggestedNames(editor?.getText() || text).map(name => (
          <button
            type="button"
            className="underline decoration-dotted"
            key={name}
            onClick={() => setFrom(name)}
            aria-label={`Review spelling of ${name}`}
          >
            {name}
          </button>
        ))}
      </div>
      {editor && (
        <button
          type="button"
          className="underline"
          onClick={() => {
            const { from: start, to: end } = editor.state.selection
            setFrom(editor.state.doc.textBetween(start, end, ' '))
          }}
        >
          Use selection as heard spelling
        </button>
      )}
      {editor && (
        <button
          type="button"
          className="underline ml-2"
          onClick={() => {
            const { from: start, to: end } = editor.state.selection
            setTo(editor.state.doc.textBetween(start, end, ' '))
          }}
        >
          Use selection as preferred spelling
        </button>
      )}
      <div className="flex flex-wrap gap-2 my-2">
        <label>
          Heard spelling{' '}
          <input
            className="border p-1"
            maxLength={80}
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
        </label>
        <label>
          Preferred spelling{' '}
          <input
            className="border p-1"
            maxLength={80}
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="border p-1"
          disabled={!user}
          onClick={() => {
            void persist(current => {
              const error = validateCorrection(from, to, current)
              if (error) throw new Error(error)
              return [
                ...current,
                { from, to, enabled: true, source: 'explicit', createdAt: Date.now() },
              ]
            })
          }}
        >
          Remember spelling
        </button>
      </div>
      <p>Confirmed spellings:</p>
      <ul>
        {saved.map(v => (
          <li key={v.from}>
            <label>
              <input
                type="checkbox"
                checked={v.enabled}
                onChange={() =>
                  persist(current =>
                    current.map(item =>
                      item.from === v.from ? { ...item, enabled: !v.enabled } : item,
                    ),
                  )
                }
              />{' '}
              {v.from} → {v.to}
            </label>{' '}
            <button
              type="button"
              className="underline"
              aria-label={`Forget ${v.from} to ${v.to}`}
              onClick={() => persist(current => current.filter(item => item.from !== v.from))}
            >
              Forget
            </button>
            <span className="text-xs">
              {' '}
              · Explicitly confirmed {new Date(v.createdAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="underline"
        disabled={!user || !saved.some(v => v.enabled)}
        onClick={onPreview}
      >
        Preview remembered spellings in this note
      </button>
      <p className="text-xs">
        Preview, apply and undo use the saved-note review below. Remembering never changes this note
        automatically.
      </p>
      <p role="status">{status}</p>
    </details>
  )
}
