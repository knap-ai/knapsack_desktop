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
const ACTIVE_SCREENSHOT_INTERVAL_MS = 120
const ACTIVE_SCREENSHOT_WINDOW_MS = 2200
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

interface ChromeImportProfile {
  id: string
  name: string
  accountEmail?: string
}

interface ChromeImportStatus {
  available: boolean
  supported: boolean
  profiles: ChromeImportProfile[]
  importedAt?: string
  message?: string
}

interface ChromeImportResponse {
  success: boolean
  passwordsImported: number
  cookiesImported: number
  importedAt?: string
  message: string
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
  const tabsRef = useRef<BrowserTab[]>([])
  const screenshotPendingRef = useRef(false)
  const screenshotQueuedRef = useRef(false)
  const refreshScreenshotRef = useRef<(priority?: boolean) => Promise<void>>(async () => undefined)
  const screenshotBurstTimersRef = useRef(new Set<number>())
  const tabsPendingRef = useRef(false)
  const navigationPendingRef = useRef(false)
  const addressEditingRef = useRef(false)
  const resizeTimerRef = useRef<number>()
  const wheelPendingRef = useRef(false)
  const wheelDeltaRef = useRef({ x: 0, y: 0 })
  const chromeImportBusyRef = useRef(false)
  const lastChatInputAtRef = useRef(0)
  const lastBrowserInteractionAtRef = useRef(0)
  const [address, setAddress] = useState(requestedUrl || DEFAULT_BROWSER_URL)
  const [currentUrl, setCurrentUrl] = useState(requestedUrl || DEFAULT_BROWSER_URL)
  const [currentTitle, setCurrentTitle] = useState('')
  const [tabs, setTabs] = useState<BrowserTab[]>([])
  const [activeTargetId, setActiveTargetId] = useState('')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [chromeImport, setChromeImport] = useState<ChromeImportStatus | null>(null)
  const [chromeProfileId, setChromeProfileId] = useState('')
  const [chromeImportBusy, setChromeImportBusy] = useState(false)
  const [chromeImportMessage, setChromeImportMessage] = useState('')
  const [chromeImportDismissed, setChromeImportDismissed] = useState(
    () => localStorage.getItem('knapsack.browser.chrome-import-dismissed') === 'true',
  )

  const activeTabStorageKey = `knapsack.browser.active-tab.${browserProfile}`

  useEffect(() => {
    const noteChatInputActivity = () => {
      lastChatInputAtRef.current = performance.now()
    }
    window.addEventListener('knapsack:chat-input-activity', noteChatInputActivity)
    return () => window.removeEventListener('knapsack:chat-input-activity', noteChatInputActivity)
  }, [])

  useEffect(() => {
    if (browserProfile !== 'openclaw' || chromeImportDismissed) return
    fetch(`${BACKEND}/api/clawd/browser/import/chrome`, { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error(await response.text())
        return response.json() as Promise<ChromeImportStatus>
      })
      .then(status => {
        setChromeImport(status)
        setChromeProfileId(current => current || status.profiles[0]?.id || '')
      })
      .catch(() => {
        // Import availability is an enhancement and must never block browsing.
      })
  }, [browserProfile, chromeImportDismissed])

  const dismissChromeImport = () => {
    localStorage.setItem('knapsack.browser.chrome-import-dismissed', 'true')
    setChromeImportDismissed(true)
  }

  const importChromeData = async () => {
    if (!chromeProfileId || chromeImportBusy) return
    chromeImportBusyRef.current = true
    setChromeImportBusy(true)
    currentTargetIdRef.current = ''
    setActiveTargetId('')
    setChromeImportMessage('')
    try {
      const response = await fetch(`${BACKEND}/api/clawd/browser/import/chrome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: chromeProfileId }),
      })
      const result = (await response.json()) as ChromeImportResponse
      if (!response.ok || !result.success) throw new Error(result.message || 'Chrome import failed')
      setChromeImportMessage(result.message)
      setChromeImport(current => current ? { ...current, importedAt: result.importedAt } : current)
      window.setTimeout(dismissChromeImport, 2600)
      window.setTimeout(() => {
        refreshTabs().catch(() => undefined)
        refreshScreenshot().catch(() => undefined)
      }, 1200)
    } catch (err) {
      setChromeImportMessage(err instanceof Error ? err.message : String(err))
    } finally {
      chromeImportBusyRef.current = false
      setChromeImportBusy(false)
    }
  }

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
    if (viewport && !chromeImportBusyRef.current) {
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
    if (chromeImportBusyRef.current || tabsPendingRef.current) return tabsRef.current
    tabsPendingRef.current = true
    try {
      const query = new URLSearchParams({ profile: browserProfile })
      const response = await fetch(`${BACKEND}/api/clawd/browser/tabs?${query}`, {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('The shared browser is still starting')
      const envelope = (await response.json()) as TabsEnvelope
      if (chromeImportBusyRef.current) return []
      const pageTabs = tabsFromEnvelope(envelope).filter(
        tab => tab.targetId && (!tab.type || tab.type === 'page'),
      )
      tabsRef.current = pageTabs
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
    } finally {
      tabsPendingRef.current = false
    }
  }, [activeTabStorageKey, browserProfile, selectTarget])

  const refreshScreenshot = useCallback(async (priority = false) => {
    if (
      document.hidden
      || chromeImportBusyRef.current
      || !currentTargetIdRef.current
    ) return
    if (screenshotPendingRef.current) {
      // A user action must always result in a frame captured after that action.
      // Previously an in-flight background capture caused the action refresh to
      // be dropped, leaving the UI stale until the next 1.2s poll.
      if (priority) screenshotQueuedRef.current = true
      return
    }
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
      if (screenshotQueuedRef.current) {
        screenshotQueuedRef.current = false
        window.setTimeout(() => void refreshScreenshotRef.current(false), 0)
      }
    }
  }, [browserProfile, refreshTabs])
  refreshScreenshotRef.current = refreshScreenshot

  const requestInteractiveFrames = useCallback((delays: number[] = [0, 160, 420, 900]) => {
    lastBrowserInteractionAtRef.current = performance.now()
    // Coalesce bursts across rapid clicks/keystrokes instead of accumulating
    // timers that compete with the browser action itself.
    for (const timer of screenshotBurstTimersRef.current) window.clearTimeout(timer)
    screenshotBurstTimersRef.current.clear()
    for (const delay of delays) {
      const timer = window.setTimeout(() => {
        screenshotBurstTimersRef.current.delete(timer)
        void refreshScreenshotRef.current(true)
      }, delay)
      screenshotBurstTimersRef.current.add(timer)
    }
  }, [])

  const navigate = useCallback(
    async (value: string) => {
      if (chromeImportBusyRef.current || navigationPendingRef.current) return
      navigationPendingRef.current = true
      const url = normalizeBrowserUrl(value)
      setAddress(url)
      setCurrentUrl(url)
      setIsLoading(true)
      setError('')
      requestInteractiveFrames([80, 260, 600, 1200])
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
        requestInteractiveFrames([0, 180, 500, 1000])
        window.setTimeout(async () => {
          await refreshTabs().catch(() => undefined)
        }, 200)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        navigationPendingRef.current = false
      }
    },
    [browserProfile, refreshTabs, requestInteractiveFrames, selectTarget],
  )

  const focusTab = async (tab: BrowserTab) => {
    if (chromeImportBusyRef.current) return
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
    if (chromeImportBusyRef.current) return
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
    if (chromeImportBusyRef.current) return
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
    let cancelled = false
    let timer: number | undefined
    const schedule = () => {
      if (!cancelled) timer = window.setTimeout(pollTabs, TABS_INTERVAL_MS)
    }
    const pollTabs = async () => {
      if (cancelled || chromeImportBusyRef.current) return schedule()
      if (tabsPendingRef.current || navigationPendingRef.current) {
        return schedule()
      }
      try {
        const currentTabs = await refreshTabs()
        if (cancelled) return
        if (!currentTabs.length && !currentTargetIdRef.current) {
          await navigate(requestedUrl || DEFAULT_BROWSER_URL)
        } else if (currentTabs.length) setError('')
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      }
      schedule()
    }
    schedule()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [navigate, refreshTabs, requestedUrl])

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined
    const burstTimers = screenshotBurstTimersRef.current
    const schedule = () => {
      const recentlyInteractive =
        performance.now() - lastBrowserInteractionAtRef.current < ACTIVE_SCREENSHOT_WINDOW_MS
      if (!cancelled) {
        timer = window.setTimeout(
          pollScreenshot,
          recentlyInteractive ? ACTIVE_SCREENSHOT_INTERVAL_MS : SCREENSHOT_INTERVAL_MS,
        )
      }
    }
    const pollScreenshot = async () => {
      if (cancelled || chromeImportBusyRef.current) return schedule()
      if (screenshotPendingRef.current) return schedule()
      // Screenshot decoding is one of the heaviest recurring operations in this
      // view. Give active typing a quiet window so browser polling cannot steal
      // frames from the chat composer.
      if (performance.now() - lastChatInputAtRef.current < 500) return schedule()
      try {
        await refreshScreenshot()
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      }
      schedule()
    }
    schedule()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      for (const burstTimer of burstTimers) window.clearTimeout(burstTimer)
      burstTimers.clear()
      if (screenshotUrlRef.current) URL.revokeObjectURL(screenshotUrlRef.current)
    }
  }, [refreshScreenshot])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      window.clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = window.setTimeout(() => {
        if (chromeImportBusyRef.current || !currentTargetIdRef.current || width < 320 || height < 240) return
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
    if (chromeImportBusyRef.current || !currentTargetIdRef.current) return
    setIsLoading(true)
    const fn =
      action === 'back'
        ? '() => history.back()'
        : action === 'forward'
          ? '() => history.forward()'
          : '() => location.reload()'
    try {
      requestInteractiveFrames([80, 260, 600])
      await postBrowserAction({
        kind: 'evaluate',
        targetId: currentTargetIdRef.current,
        fn,
      }, browserProfile)
      requestInteractiveFrames()
      window.setTimeout(() => refreshTabs().catch(() => undefined), 200)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleViewportClick = async (event: MouseEvent<HTMLImageElement>) => {
    const image = imageRef.current
    if (chromeImportBusyRef.current || !image || !currentTargetIdRef.current) return
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
      requestInteractiveFrames([120, 360])
      await postBrowserAction({
        kind: 'clickCoords',
        targetId: currentTargetIdRef.current,
        x: Math.round(x),
        y: Math.round(y),
      }, browserProfile)
      requestInteractiveFrames()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleViewportKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (chromeImportBusyRef.current || !currentTargetIdRef.current) return
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
    requestInteractiveFrames([100, 320])
    postBrowserAction({
      kind: 'press',
      targetId: currentTargetIdRef.current,
      key: parts.join('+'),
    }, browserProfile)
      .then(() => requestInteractiveFrames([0, 180, 420]))
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
  }

  const flushWheel = useCallback(async function flushWheelQueue() {
    if (wheelPendingRef.current || chromeImportBusyRef.current || !currentTargetIdRef.current) return
    const delta = wheelDeltaRef.current
    if (!delta.x && !delta.y) return
    wheelDeltaRef.current = { x: 0, y: 0 }
    wheelPendingRef.current = true
    try {
      await postBrowserAction({
        kind: 'evaluate',
        targetId: currentTargetIdRef.current,
        fn: `() => window.scrollBy({ top: ${Math.round(delta.y)}, left: ${Math.round(
          delta.x,
        )}, behavior: "auto" })`,
      }, browserProfile)
      requestInteractiveFrames([0, 140, 360])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      wheelPendingRef.current = false
      if (wheelDeltaRef.current.x || wheelDeltaRef.current.y) void flushWheelQueue()
    }
  }, [browserProfile, requestInteractiveFrames])

  const handleViewportWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (chromeImportBusyRef.current || !currentTargetIdRef.current) return
    event.preventDefault()
    wheelDeltaRef.current.x += event.deltaX
    wheelDeltaRef.current.y += event.deltaY
    requestInteractiveFrames([100, 280])
    void flushWheel()
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
            disabled={chromeImportBusy}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Forward"
            title="Forward"
            onClick={() => runHistoryAction('forward')}
            disabled={chromeImportBusy}
          >
            <ArrowRightIcon />
          </button>
          <button
            type="button"
            aria-label="Reload"
            title="Reload"
            onClick={() => runHistoryAction('reload')}
            disabled={chromeImportBusy}
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
            disabled={chromeImportBusy}
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
                disabled={chromeImportBusy}
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
                disabled={chromeImportBusy}
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
          disabled={chromeImportBusy}
        >
          +
        </button>
      </div>

      <div className="EmbeddedBrowserSharedState">
        <span className="EmbeddedBrowserSharedDot" />
        Shared with your assistant
        {currentTitle && <span className="EmbeddedBrowserPageTitle">· {currentTitle}</span>}
      </div>

      {browserProfile === 'openclaw' && chromeImport?.available && !chromeImportDismissed && (!chromeImport.importedAt || chromeImportMessage) && (
        <div className="EmbeddedBrowserChromeImport" role="region" aria-label="Import data from Chrome">
          <span className="EmbeddedBrowserChromeLogo" aria-hidden="true" />
          <div className="EmbeddedBrowserChromeImportCopy">
            <strong>Import data from Chrome</strong>
            <span>Bring over your saved passwords and cookies to the built-in browser.</span>
            {chromeImport.profiles.length > 1 && (
              <select
                aria-label="Chrome profile"
                value={chromeProfileId}
                onChange={event => setChromeProfileId(event.target.value)}
                disabled={chromeImportBusy}
              >
                {chromeImport.profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.accountEmail || profile.name}
                  </option>
                ))}
              </select>
            )}
            {chromeImportMessage && <span className="EmbeddedBrowserChromeImportMessage">{chromeImportMessage}</span>}
          </div>
          <button
            className="EmbeddedBrowserChromeImportButton"
            type="button"
            onClick={importChromeData}
            disabled={chromeImportBusy || !chromeProfileId}
          >
            {chromeImportBusy ? 'Importing…' : 'Import'}
          </button>
          <button
            className="EmbeddedBrowserChromeImportDismiss"
            type="button"
            aria-label="Dismiss Chrome import"
            onClick={dismissChromeImport}
            disabled={chromeImportBusy}
          >
            <XMarkIcon />
          </button>
        </div>
      )}

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
