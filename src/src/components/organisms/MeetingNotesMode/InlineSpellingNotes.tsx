import { useEffect, useRef, useState, type ComponentProps } from 'react'

import { exactSpellingOccurrences } from 'src/utils/inlineSpelling'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import {
  readCorrections,
  suggestedNames,
  validateCorrection,
  writeCorrections,
} from 'src/utils/nameCorrections'
import { getProfileRevision, PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'

import MarkdownDisplay from 'src/components/molecules/MarkdownDisplay'

import { NameSpellingReview } from './NameSpellingReview'

export default function InlineSpellingNotes({
  accountEmail,
  names = [],
  onApplyCorrection,
  ...props
}: ComponentProps<typeof MarkdownDisplay> & {
  accountEmail: string
  names?: string[]
  onApplyCorrection?: (markdown: string) => Promise<void>
}) {
  const [selection, setSelection] = useState<{
    from: number
    to: number
    text: string
    uuid: string
    revision: number
  } | null>(null)
  const [replacement, setReplacement] = useState('')
  const [all, setAll] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const current = useRef({ markdown: props.markdown, accountEmail, alive: true })
  current.current.markdown = props.markdown
  current.current.accountEmail = accountEmail
  useEffect(() => {
    const lifetime = current.current
    lifetime.alive = true
    const close = () => setSelection(null)
    window.addEventListener(PROFILE_CHANGED_EVENT, close)
    return () => {
      lifetime.alive = false
      window.removeEventListener(PROFILE_CHANGED_EVENT, close)
    }
  }, [])
  useEffect(() => {
    setSelection(null)
  }, [accountEmail, props.markdown])
  const candidates = [
    ...new Set([...names, ...suggestedNames(props.markdown).filter(name => name.includes(' '))]),
  ]
    .filter(Boolean)
    .slice(0, 40)
  const open = async (from: number, to: number) => {
    const text = props.markdown,
      revision = getProfileRevision()
    const profile = await KNLocalStorage.getItem('KN_PROFILE')
    if (
      !current.current.alive ||
      current.current.markdown !== text ||
      current.current.accountEmail !== accountEmail ||
      revision !== getProfileRevision()
    )
      return
    if (
      !accountEmail ||
      profile?.email?.toLowerCase() !== accountEmail.toLowerCase() ||
      !profile.uuid
    )
      return
    setSelection({ from, to, text, uuid: profile.uuid, revision })
    setReplacement(text.slice(from, to))
    setAll(false)
    setRemember(false)
    setError('')
  }
  const apply = async () => {
    if (!selection || busy) return
    setBusy(true)
    try {
      const profile = await KNLocalStorage.getItem('KN_PROFILE')
      if (
        !current.current.alive ||
        current.current.markdown !== selection.text ||
        current.current.accountEmail !== accountEmail ||
        selection.revision !== getProfileRevision() ||
        profile?.uuid !== selection.uuid ||
        profile?.email?.toLowerCase() !== accountEmail.toLowerCase()
      )
        throw new Error('Notes or account changed. Reopen the correction.')
      const from = selection.text.slice(selection.from, selection.to)
      const saved = readCorrections(selection.uuid)
      const invalid = validateCorrection(from, replacement, remember ? saved : [])
      if (invalid) throw new Error(invalid)
      const edits = exactSpellingOccurrences(selection.text, from).filter(
        e => all || (e.from === selection.from && e.to === selection.to),
      )
      if (!edits.length) throw new Error('The selected name changed. Reopen the correction.')
      let next = selection.text
      for (const edit of [...edits].reverse())
        next = next.slice(0, edit.from) + replacement + next.slice(edit.to)
      if (onApplyCorrection) await onApplyCorrection(next)
      else await props.onChange?.(next)
      const after = await KNLocalStorage.getItem('KN_PROFILE')
      if (
        !current.current.alive ||
        selection.revision !== getProfileRevision() ||
        after?.uuid !== selection.uuid ||
        after?.email?.toLowerCase() !== accountEmail.toLowerCase()
      )
        return
      if (remember) {
        const latest = readCorrections(selection.uuid)
        const invalid = validateCorrection(from, replacement, latest)
        if (invalid) throw new Error(invalid)
        writeCorrections(selection.uuid, [
          ...latest,
          { from, to: replacement, enabled: true, source: 'explicit', createdAt: Date.now() },
        ])
      }
      setSelection(null)
    } catch (e) {
      if (current.current.alive)
        setError(e instanceof Error ? e.message : 'Could not apply correction.')
    } finally {
      if (current.current.alive) setBusy(false)
    }
  }
  return (
    <>
      <MarkdownDisplay
        {...props}
        spellingNames={candidates}
        onSpellingClick={(from, to) => void open(from, to)}
      />
      {selection && (
        <div
          role="dialog"
          aria-label="Correct name spelling"
          className="notes-spelling-dialog"
          onKeyDown={e => {
            if (e.key === 'Escape') setSelection(null)
          }}
        >
          <label>
            Correct spelling
            <input autoFocus value={replacement} onChange={e => setReplacement(e.target.value)} />
          </label>
          <label>
            <input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} />
            Apply to all exact occurrences in these notes
          </label>
          {all && <p>Use only when every occurrence refers to the same person or name.</p>}
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            Remember for future notes on this device
          </label>
          {remember && (
            <p>
              Saved for this account. Relevant spellings may be included in prompts to your existing
              notes model.
            </p>
          )}
          <NameSpellingReview
            managementOnly
            editor={null}
            text={props.markdown}
            accountEmail={accountEmail}
            onPreview={() => undefined}
          />
          {error && <p role="alert">{error}</p>}
          <button type="button" onClick={() => setSelection(null)} disabled={busy}>
            Cancel
          </button>
          <button type="button" onClick={() => void apply()} disabled={busy}>
            Apply correction
          </button>
        </div>
      )}
    </>
  )
}
