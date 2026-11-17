import { useEffect, useRef, useState } from 'react'

import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { meetingBriefAuthority } from 'src/utils/meetingBriefCache'
import {
  publicPrepQueries,
  publicPrepUrl,
  type PublicPrepSource,
} from 'src/utils/meetingPublicResearch'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'

import { open } from '@tauri-apps/api/shell'

const cache = new Map<string, { sources: PublicPrepSource[]; fetchedAt: number }>()
export default function MeetingPublicResearch({
  account,
  people,
  companies,
  onApply,
  briefBusy,
}: {
  account?: string
  people: string[]
  companies: string[]
  onApply: (sources: PublicPrepSource[]) => void
  briefBusy: boolean
}) {
  const [queries, setQueries] = useState(() =>
    [
      ...people.filter(name => name.trim() && !name.includes('@')).slice(0, 2),
      ...companies.filter(domain => !/(gmail|yahoo|outlook|hotmail)\./i.test(domain)).slice(0, 1),
    ].join('\n'),
  )
  const [sources, setSources] = useState<PublicPrepSource[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [searched, setSearched] = useState(false)
  const lock = useRef(false),
    controller = useRef<AbortController | null>(null),
    alive = useRef(true)
  useEffect(() => {
    alive.current = true
    const changed = () => {
      controller.current?.abort()
      setSources([])
      setSelected([])
      setQueries('')
      setError('')
    }
    window.addEventListener(PROFILE_CHANGED_EVENT, changed)
    return () => {
      alive.current = false
      controller.current?.abort()
      window.removeEventListener(PROFILE_CHANGED_EVENT, changed)
    }
  }, [])
  const search = async (force = false) => {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    setSelected([])
    const epoch = meetingBriefAuthority(),
      abort = new AbortController()
    controller.current = abort
    const timeout = setTimeout(() => abort.abort(), 60000)
    const current = () =>
      alive.current && !abort.signal.aborted && meetingBriefAuthority() === epoch
    try {
      const owner = await KNLocalStorage.getItem('KN_PROFILE')
      if (!current()) return
      if (!owner?.uuid || !account || owner.email?.toLowerCase() !== account.toLowerCase())
        throw new Error('The meeting account needs attention.')
      const parsed = publicPrepQueries(queries),
        key = JSON.stringify([owner.uuid, parsed])
      const saved = cache.get(key)
      if (!force && saved && Date.now() - saved.fetchedAt < 24 * 60 * 60 * 1000) {
        setSources(saved.sources)
        setSearched(true)
        return
      }
      const results: PublicPrepSource[] = []
      for (const query of parsed) {
        if (!current()) return
        const response = await fetch(
          `http://127.0.0.1:8897/api/clawd/browser/search?q=${encodeURIComponent(query)}&count=3`,
          { signal: abort.signal },
        )
        const data = await response.json()
        if (!response.ok || data.success !== true)
          throw new Error('Public research is unavailable. No sign-in or permissions were changed.')
        if (!current()) return
        for (const value of (Array.isArray(data.results) ? data.results : []).slice(0, 3)) {
          const url = typeof value.url === 'string' ? publicPrepUrl(value.url) : null
          if (url && !results.some(item => item.url === url))
            results.push({
              url,
              title: String(value.title || 'Public source').slice(0, 200),
              snippet: String(value.snippet || '').slice(0, 2000),
              retrievedAt: Date.now(),
            })
        }
      }
      if (!current()) return
      if (cache.size >= 24) cache.delete(cache.keys().next().value as string)
      cache.set(key, { sources: results, fetchedAt: Date.now() })
      setSources(results)
      setSearched(true)
    } catch {
      if (alive.current && meetingBriefAuthority() === epoch)
        setError(
          'Public research did not finish. Check the public queries and try again; saved notes are unchanged.',
        )
    } finally {
      clearTimeout(timeout)
      lock.current = false
      if (alive.current) setBusy(false)
    }
  }
  return (
    <details className="border rounded-lg p-3 text-sm">
      <summary className="cursor-pointer font-medium">Public research</summary>
      <p className="text-xs text-zinc-600 my-2">
        Search public web and indexed LinkedIn pages. Review names and companies first; search sends
        the reviewed queries, not email bodies or the agenda, and no LinkedIn sign-in is used.
      </p>
      <label>
        Public names or companies
        <textarea
          aria-label="Public names or companies"
          className="border rounded w-full p-2"
          rows={3}
          value={queries}
          onChange={event => {
            setQueries(event.target.value)
            setSources([])
            setSelected([])
            setSearched(false)
          }}
          disabled={busy}
        />
      </label>
      <button type="button" disabled={busy} onClick={() => void search()}>
        {busy ? 'Researching…' : 'Search public sources'}
      </button>
      {searched && (
        <button type="button" disabled={busy} onClick={() => void search(true)}>
          Refresh public research
        </button>
      )}
      {searched && !sources.length && !busy && (
        <p role="status">
          No public results found. Refine the names or company; no identity was assumed.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <ul className="space-y-3 my-2">
        {sources.map(source => (
          <li key={source.url}>
            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={selected.includes(source.url)}
                onChange={event =>
                  setSelected(items =>
                    event.target.checked
                      ? [...items, source.url]
                      : items.filter(url => url !== source.url),
                  )
                }
              />
              <span>Use this source for the intended person/company</span>
            </label>
            <button
              type="button"
              className="underline"
              onClick={() =>
                void open(source.url).catch(() => setError('Could not open this public source.'))
              }
            >
              {source.title}
            </button>
            <p>{source.snippet}</p>
            <small>
              Retrieved {new Date(source.retrievedAt).toLocaleString()} · verify identity and claims
            </small>
          </li>
        ))}
      </ul>
      {sources.length > 0 && (
        <button
          type="button"
          disabled={briefBusy || !selected.length}
          onClick={() => onApply(sources.filter(source => selected.includes(source.url)))}
        >
          Add selected sources to brief
        </button>
      )}
      {briefBusy && selected.length > 0 && (
        <p role="status">Wait for the current brief before adding research.</p>
      )}
    </details>
  )
}
