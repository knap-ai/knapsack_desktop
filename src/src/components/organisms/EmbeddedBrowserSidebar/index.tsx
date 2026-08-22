import './style.scss'

import {
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEvent,
} from 'react'

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

import { open } from '@tauri-apps/api/shell'

const BACKEND = 'http://127.0.0.1:8897'
const DEFAULT_BROWSER_URL = 'https://www.google.com'
const SCREENSHOT_INTERVAL_MS = 1200
const TABS_INTERVAL_MS = 1800
const MIN_DESKTOP_VIEWPORT_WIDTH = 1100
const MAX_DESKTOP_VIEWPORT_HEIGHT = 1600

function desktopBrowserViewport(width: number, height: number) {
  const roundedWidth = Math.round(width)
  const roundedHeight = Math.round(height)
  if (roundedWidth >= MIN_DESKTOP_VIEWPORT_WIDTH) return { width: roundedWidth, height: roundedHeight }

  const scale = MIN_DESKTOP_VIEWPORT_WIDTH / Math.max(roundedWidth, 1)
  return {
    width: MIN_DESKTOP_VIEWPORT_WIDTH,
    height: Math.min(MAX_DESKTOP_VIEWPORT_HEIGHT, Math.max(roundedHeight, Math.round(roundedHeight * scale))),
  }
}

interface BrowserTab {
  targetId: string
  title?: string
  url?: string
  type?: string
}

interface TabsEnvelope {
  success?: boolean
  data?: BrowserTab[] | { tabs?: BrowserTab[] }
}

interface OpenBrowserResponse {
  success?: boolean
  target_id?: string
  message?: string
}

function normalizeBrowserUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_BROWSER_URL
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z0-9][-a-z0-9.]*\.[a-z]{2,}(?:[/:?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`
}

function tabsFromEnvelope(envelope: TabsEnvelope): BrowserTab[] {
  if (Array.isArray(envelope.data)) return envelope.data
  return Array.isArray(envelope.data?.tabs) ? envelope.data.tabs : []
}

function tabLabel(tab: BrowserTab) {
  if (tab.title?.trim()) return tab.title.trim()
  try {
    return new URL(tab.url || '').hostname || 'New tab'
  } catch {
    return 'New tab'
  }
}

async function postBrowserAction(body: Record<string, unknown>, profile: string) {
  const response = await fetch(`${BACKEND}/api/clawd/browser/act`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, profile }),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Browser action failed (${response.status})`)
  }
}

interface EmbeddedBrowserSidebarProps {
  requestedUrl?: string
  browserProfile?: string
  onClose: () => void
}

function EmbeddedBrowserSidebar({ requestedUrl, browserProfile = 'openclaw', onClose }: EmbeddedBrowserSidebarProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const screenshotUrlRef = useRef('')
  const currentTargetIdRef = useRef('')
  const knownTargetIdsRef = useRef(new Set<string>())
  const screenshotPendingRef = useRef(false)
  const navigationPendingRef = useRef(false)
  const addressEditingRef = useRef(false)
  const resizeTimerRef = useRef<number>()
  const wheelPendingRef = useRef(false)
  const [address, setAddress] = useState(requestedUrl || DEFAULT_BROWSER_URL)
  const [currentUrl, setCurrentUrl] = useState(requestedUrl || DEFAULT_BROWSER_URL)
  const [currentTitle, setCurrentTitle] = useState('')
  const [tabs, setTabs] = useState<BrowserTab[]>([])
  const [activeTargetId, setActiveTargetId] = useState('')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const activeTabStorageKey = `knapsack.browser.active-tab.${browserProfile}`

  const selectTarget = useCallback((targetId: string, tab?: BrowserTab) => {
    const changed = currentTargetIdRef.current !== targetId
    currentTargetIdRef.current = targetId
    setActiveTargetId(targetId)
    if (tab?.url) {
      setCurrentUrl(tab.url)
      if (!addressEditingRef.current) setAddress(tab.url)
    }
    if (tab) setCurrentTitle(tab.title || '')
    try {
      localStorage.setItem(activeTabStorageKey, JSON.stringify({ targetId, url: tab?.url || '' }))
    } catch {
      // Persistence is best-effort (for example, private-mode storage can fail).
    }
    if (!changed) return
    const viewport = viewportRef.current
    if (viewport) {
      const { width, height } = viewport.getBoundingClientRect()
      if (width >= 320 && height >= 240) {
        const browserViewport = desktopBrowserViewport(width, height)
        postBrowserAction({
          kind: 'resize',
          targetId,
          ...browserViewport,
        }, browserProfile).catch(() => undefined)
      }
    }
  }, [activeTabStorageKey, browserProfile])

  const refreshTabs = useCallback(async () => {
    const query = new URLSearchParams({ profile: browserProfile })
    const response = await fetch(`${BACKEND}/api/clawd/browser/tabs?${query}`, {
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('The shared browser is still starting')
    const envelope = (await response.json()) as TabsEnvelope
    const pageTabs = tabsFromEnvelope(envelope).filter(
      tab => tab.targetId && (!tab.type || tab.type === 'page'),
    )
    setTabs(pageTabs)
    if (!pageTabs.length) {
      knownTargetIdsRef.current = new Set()
      currentTargetIdRef.current = ''
      setActiveTargetId('')
      return []
    }

    const previousIds = knownTargetIdsRef.current
    const newlyOpened = pageTabs.filter(tab => !previousIds.has(tab.targetId))
    knownTargetIdsRef.current = new Set(pageTabs.map(tab => tab.targetId))

    let selected = newlyOpened.length
      ? newlyOpened[newlyOpened.length - 1]
      : pageTabs.find(tab => tab.targetId === currentTargetIdRef.current)
    if (!selected) {
      try {
        const saved = JSON.parse(localStorage.getItem(activeTabStorageKey) || '{}') as {
          targetId?: string
          url?: string
        }
        selected = pageTabs.find(tab => tab.targetId === saved.targetId)
          || pageTabs.find(tab => saved.url && tab.url === saved.url)
      } catch {
        // Ignore malformed legacy storage.
      }
    }
    if (!selected) selected = pageTabs[0]

    selectTarget(selected.targetId, selected)
    return pageTabs
  }, [activeTabStorageKey, browserProfile, selectTarget])

  const refreshScreenshot = useCallback(async () => {
    if (document.hidden || screenshotPendingRef.current || !currentTargetIdRef.current) return
    screenshotPendingRef.current = true
    try {
      const query = new URLSearchParams({
        targetId: currentTargetIdRef.current,
        profile: browserProfile,
        t: String(Date.now()),
      })
      const response = await fetch(`${BACKEND}/api/clawd/browser/view?${query}`, {
        cache: 'no-store',
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Browser image is unavailable')
      }
      const blobUrl = URL.createObjectURL(await response.blob())
      const previous = screenshotUrlRef.current
      screenshotUrlRef.current = blobUrl
      setScreenshotUrl(blobUrl)
      if (previous) URL.revokeObjectURL(previous)
      setError('')
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const targetWasNotAPage =
        message.includes("'Page.enable' wasn't found") ||
        message.includes('Command can only be executed on top-level targets')
      if (targetWasNotAPage) {
        // Dynamic sites can create workers between the tab and screenshot
        // polls. Drop the stale selection and immediately resolve the current
        // top-level page instead of surfacing a low-level CDP error.
        currentTargetIdRef.current = ''
        await refreshTabs().catch(() => undefined)
      } else {
        setError(message)
      }
    } finally {
      screenshotPendingRef.current = false
    }
  }, [browserProfile, refreshTabs])

  const navigate = useCallback(
    async (value: string) => {
      if (navigationPendingRef.current) return
      navigationPendingRef.current = true
      const url = normalizeBrowserUrl(value)
      setAddress(url)
      setCurrentUrl(url)
      setIsLoading(true)
      setError('')
      try {
        if (currentTargetIdRef.current) {
          const response = await fetch(`${BACKEND}/api/clawd/browser/navigate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url,
              targetId: currentTargetIdRef.current,
              profile: browserProfile,
            }),
          })
          if (!response.ok) throw new Error(await response.text())
        } else {
          const query = new URLSearchParams({ url, embedded: 'true', profile: browserProfile })
          const response = await fetch(`${BACKEND}/api/clawd/browser/open?${query}`)
          const result = (await response.json()) as OpenBrowserResponse
          if (!response.ok || !result.success) {
            throw new Error(result.message || 'The shared browser is still starting')
          }
          if (result.target_id) selectTarget(result.target_id)
        }
        window.setTimeout(async () => {
          await refreshTabs().catch(() => undefined)
          await refreshScreenshot()
        }, 350)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        navigationPendingRef.current = false
      }
    },
    [browserProfile, refreshScreenshot, refreshTabs, selectTarget],
  )

  const focusTab = async (tab: BrowserTab) => {
    selectTarget(tab.targetId, tab)
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${BACKEND}/api/clawd/browser/focus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: tab.targetId, profile: browserProfile }),
      })
      if (!response.ok) throw new Error(await response.text())
      await refreshScreenshot()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const openNewTab = async () => {
    setIsLoading(true)
    setError('')
    try {
      // The browser service deliberately reuses an existing tab when the URL
      // matches. Give explicit "New tab" actions a unique start URL so the +
      // button creates a real tab instead of focusing the existing Google tab.
      const newTabUrl = new URL(DEFAULT_BROWSER_URL)
      newTabUrl.searchParams.set('knapsack_new_tab', `${Date.now()}-${Math.random().toString(36).slice(2)}`)
      const query = new URLSearchParams({
        url: newTabUrl.toString(),
        embedded: 'true',
        profile: browserProfile,
      })
      const response = await fetch(`${BACKEND}/api/clawd/browser/open?${query}`)
      const result = (await response.json()) as OpenBrowserResponse
      if (!response.ok || !result.success || !result.target_id) {
        throw new Error(result.message || 'Could not open a new browser tab')
      }
      const tab = { targetId: result.target_id, title: 'New tab', url: newTabUrl.toString() }
      selectTarget(tab.targetId, tab)
      await refreshTabs()
      await refreshScreenshot()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const closeTab = async (tab: BrowserTab) => {
    const closingIndex = tabs.findIndex(candidate => candidate.targetId === tab.targetId)
    const fallback = tabs[closingIndex + 1] || tabs[closingIndex - 1]
    const closingActiveTab = tab.targetId === currentTargetIdRef.current
    try {
      const response = await fetch(`${BACKEND}/api/clawd/browser/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: tab.targetId, profile: browserProfile }),
      })
      if (!response.ok) throw new Error(await response.text())
      if (closingActiveTab) {
        const previousScreenshotUrl = screenshotUrlRef.current
        currentTargetIdRef.current = ''
        screenshotUrlRef.current = ''
        setScreenshotUrl('')
        if (previousScreenshotUrl) URL.revokeObjectURL(previousScreenshotUrl)
        if (fallback) selectTarget(fallback.targetId, fallback)
      }
      const remaining = await refreshTabs()
      if (!remaining.length) await openNewTab()
      else if (closingActiveTab && fallback) await focusTab(fallback)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  useEffect(() => {
    let cancelled = false
    const initializeBrowser = async () => {
      try {
        const tabs = await refreshTabs()
        if (cancelled) return
        if (requestedUrl) {
          await navigate(requestedUrl)
        } else if (!tabs.length) {
          await navigate(DEFAULT_BROWSER_URL)
        } else {
          await refreshScreenshot()
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }
    }
    initializeBrowser()
    return () => {
      cancelled = true
    }
  }, [navigate, refreshScreenshot, refreshTabs, requestedUrl])

  useEffect(() => {
    const retryTimer = window.setInterval(() => {
      if (!currentTargetIdRef.current) {
        refreshTabs()
          .then(tabs => {
            if (!tabs.length) navigate(requestedUrl || DEFAULT_BROWSER_URL)
          })
          .catch(err => setError(err instanceof Error ? err.message : String(err)))
      }
    }, 2000)
    return () => window.clearInterval(retryTimer)
  }, [navigate, refreshTabs, requestedUrl])

  useEffect(() => {
    const tabsTimer = window.setInterval(() => {
      refreshTabs()
        .then(tabs => {
          if (tabs.length) setError('')
        })
        .catch(err => setError(err instanceof Error ? err.message : String(err)))
    }, TABS_INTERVAL_MS)
    const screenshotTimer = window.setInterval(refreshScreenshot, SCREENSHOT_INTERVAL_MS)

    return () => {
      window.clearInterval(tabsTimer)
      window.clearInterval(screenshotTimer)
      if (screenshotUrlRef.current) URL.revokeObjectURL(screenshotUrlRef.current)
    }
  }, [refreshScreenshot, refreshTabs])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      window.clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = window.setTimeout(() => {
        if (!currentTargetIdRef.current || width < 320 || height < 240) return
        const browserViewport = desktopBrowserViewport(width, height)
        postBrowserAction({
          kind: 'resize',
          targetId: currentTargetIdRef.current,
          ...browserViewport,
        }, browserProfile).catch(() => undefined)
      }, 180)
    })
    resizeObserver.observe(viewport)
    return () => {
      resizeObserver.disconnect()
      window.clearTimeout(resizeTimerRef.current)
    }
  }, [browserProfile])

  const submitAddress = (event: FormEvent) => {
    event.preventDefault()
    addressEditingRef.current = false
    navigate(address)
  }

  const runHistoryAction = async (action: 'back' | 'forward' | 'reload') => {
    if (!currentTargetIdRef.current) return
    setIsLoading(true)
    const fn =
      action === 'back'
        ? '() => history.back()'
        : action === 'forward'
          ? '() => history.forward()'
          : '() => location.reload()'
    try {
      await postBrowserAction({
        kind: 'evaluate',
        targetId: currentTargetIdRef.current,
        fn,
      }, browserProfile)
      window.setTimeout(() => {
        refreshTabs().catch(() => undefined)
        refreshScreenshot()
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleViewportClick = async (event: MouseEvent<HTMLImageElement>) => {
    const image = imageRef.current
    if (!image || !currentTargetIdRef.current) return
    const rect = image.getBoundingClientRect()
    const naturalWidth = image.naturalWidth
    const naturalHeight = image.naturalHeight
    if (!naturalWidth || !naturalHeight) return
    const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight)
    const renderedWidth = naturalWidth * scale
    const renderedHeight = naturalHeight * scale
    const x = (event.clientX - rect.left - (rect.width - renderedWidth) / 2) / scale
    const y = (event.clientY - rect.top - (rect.height - renderedHeight) / 2) / scale
    if (x < 0 || y < 0 || x > naturalWidth || y > naturalHeight) return

    viewportRef.current?.focus()
    try {
      await postBrowserAction({
        kind: 'clickCoords',
        targetId: currentTargetIdRef.current,
        x: Math.round(x),
        y: Math.round(y),
      }, browserProfile)
      window.setTimeout(refreshScreenshot, 180)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleViewportKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!currentTargetIdRef.current) return
    const allowedNamedKeys = new Set([
      'Backspace',
      'Delete',
      'Enter',
      'Escape',
      'Tab',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
      'Space',
    ])
    const key = event.key === ' ' ? 'Space' : event.key
    if (key.length !== 1 && !allowedNamedKeys.has(key)) return

    const parts = [
      event.metaKey ? 'Meta' : '',
      event.ctrlKey ? 'Control' : '',
      event.altKey ? 'Alt' : '',
      event.shiftKey && key.length > 1 ? 'Shift' : '',
      key,
    ].filter(Boolean)
    event.preventDefault()
    postBrowserAction({
      kind: 'press',
      targetId: currentTargetIdRef.current,
      key: parts.join('+'),
    }, browserProfile)
      .then(() => window.setTimeout(refreshScreenshot, 120))
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
  }

  const handleViewportWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!currentTargetIdRef.current || wheelPendingRef.current) return
    event.preventDefault()
    wheelPendingRef.current = true
    postBrowserAction({
      kind: 'evaluate',
      targetId: currentTargetIdRef.current,
      fn: `() => window.scrollBy({ top: ${Math.round(event.deltaY)}, left: ${Math.round(
        event.deltaX,
      )}, behavior: "auto" })`,
    }, browserProfile)
      .then(() => window.setTimeout(refreshScreenshot, 100))
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => {
        window.setTimeout(() => {
          wheelPendingRef.current = false
        }, 80)
      })
  }

  return (
    <aside className="EmbeddedBrowserSidebar" aria-label={`Embedded browser (${browserProfile})`}>
      <div className="EmbeddedBrowserToolbar">
        <div className="EmbeddedBrowserNav">
          <button
            type="button"
            aria-label="Back"
            title="Back"
            onClick={() => runHistoryAction('back')}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Forward"
            title="Forward"
            onClick={() => runHistoryAction('forward')}
          >
            <ArrowRightIcon />
          </button>
          <button
            type="button"
            aria-label="Reload"
            title="Reload"
            onClick={() => runHistoryAction('reload')}
          >
            <ArrowPathIcon className={isLoading ? 'is-spinning' : ''} />
          </button>
        </div>

        <form className="EmbeddedBrowserAddress" onSubmit={submitAddress}>
          <GlobeAltIcon />
          <input
            aria-label="Web address or search"
            value={address}
            onChange={event => {
              addressEditingRef.current = true
              setAddress(event.target.value)
            }}
            onFocus={event => {
              addressEditingRef.current = true
              event.currentTarget.select()
            }}
            onBlur={() => {
              addressEditingRef.current = false
              setAddress(currentUrl)
            }}
            spellCheck={false}
          />
        </form>

        <button
          className="EmbeddedBrowserExternal"
          type="button"
          aria-label="Open in system browser"
          title="Open in system browser"
          onClick={() => open(currentUrl)}
        >
          <ArrowTopRightOnSquareIcon />
        </button>
        <button
          className="EmbeddedBrowserClose"
          type="button"
          aria-label="Close browser"
          title="Close browser"
          onClick={onClose}
        >
          <XMarkIcon />
        </button>
      </div>

      <div className="EmbeddedBrowserTabs" role="tablist" aria-label="Browser tabs">
        <div className="EmbeddedBrowserTabsScroller">
          {tabs.map(tab => (
            <div
              className={`EmbeddedBrowserTab${tab.targetId === activeTargetId ? ' is-active' : ''}`}
              key={tab.targetId}
            >
              <button
                className="EmbeddedBrowserTabSelect"
                type="button"
                role="tab"
                aria-selected={tab.targetId === activeTargetId}
                title={tab.title || tab.url || 'New tab'}
                onClick={() => focusTab(tab)}
              >
                <GlobeAltIcon />
                <span>{tabLabel(tab)}</span>
              </button>
              <button
                className="EmbeddedBrowserTabClose"
                type="button"
                aria-label={`Close ${tabLabel(tab)}`}
                title="Close tab"
                onClick={() => closeTab(tab)}
              >
                <XMarkIcon />
              </button>
            </div>
          ))}
        </div>
        <button
          className="EmbeddedBrowserNewTab"
          type="button"
          aria-label="New tab"
          title="New tab"
          onClick={openNewTab}
        >
          +
        </button>
      </div>

      <div className="EmbeddedBrowserSharedState">
        <span className="EmbeddedBrowserSharedDot" />
        Shared with your assistant
        {currentTitle && <span className="EmbeddedBrowserPageTitle">· {currentTitle}</span>}
      </div>

      <div
        className="EmbeddedBrowserViewport"
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={handleViewportKeyDown}
        onWheel={handleViewportWheel}
        aria-label="Browser page. Click to interact and type with the keyboard."
      >
        {screenshotUrl && (
          <img
            ref={imageRef}
            src={screenshotUrl}
            alt={currentTitle || 'Current browser page'}
            draggable={false}
            onClick={handleViewportClick}
          />
        )}
        {!screenshotUrl && !error && (
          <div className="EmbeddedBrowserLoading">
            <ArrowPathIcon className="is-spinning" />
            Starting shared browser…
          </div>
        )}
        {error && (
          <div className="EmbeddedBrowserError">
            <GlobeAltIcon />
            <strong>Shared browser is not ready</strong>
            <span>{error}</span>
            <button type="button" onClick={() => navigate(address)}>
              Try again
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default EmbeddedBrowserSidebar
