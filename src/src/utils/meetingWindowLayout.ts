import {
  appWindow,
  currentMonitor,
  LogicalPosition,
  LogicalSize,
  PhysicalPosition,
  PhysicalSize,
} from '@tauri-apps/api/window'

type SavedWindowBounds = {
  position: PhysicalPosition
  size: PhysicalSize
  maximized: boolean
  fullscreen: boolean
}

let activeMeetingViews = 0
let savedWindowBounds: SavedWindowBounds | null = null
let layoutQueue: Promise<void> = Promise.resolve()

export const calculateMeetingWindowBounds = (
  monitorWidthPhysical: number,
  monitorHeightPhysical: number,
  monitorXPhysical: number,
  monitorYPhysical: number,
  scaleFactor: number,
  topInset = 0,
  bottomInset = 0,
) => {
  const monitorWidth = monitorWidthPhysical / scaleFactor
  const monitorHeight = monitorHeightPhysical / scaleFactor
  const width = Math.min(720, Math.max(520, monitorWidth * 0.42))
  return {
    width,
    height: Math.max(560, monitorHeight - topInset - bottomInset),
    x: monitorXPhysical / scaleFactor + monitorWidth - width,
    y: monitorYPhysical / scaleFactor + topInset,
  }
}

const applyMeetingLayout = async () => {
  if (appWindow.label !== 'main' || activeMeetingViews === 0 || savedWindowBounds) return
  const monitor = await currentMonitor()
  if (!monitor) return

  // Native macOS fullscreen owns an entire Space. Resizing a fullscreen window
  // only shrinks its webview, leaving the rest of that Space black. Exit the
  // Space before reading the underlying normal window frame or applying the
  // Granola-style right-side meeting layout.
  const fullscreen = await appWindow.isFullscreen()
  if (fullscreen) await appWindow.setFullscreen(false)
  savedWindowBounds = {
    position: await appWindow.outerPosition(),
    size: await appWindow.outerSize(),
    maximized: await appWindow.isMaximized(),
    fullscreen,
  }

  if (savedWindowBounds.maximized) await appWindow.unmaximize()
  const isMac = navigator.userAgent.includes('Mac')
  const isWindows = navigator.userAgent.includes('Windows')
  const innerSize = await appWindow.innerSize()
  const frameHeight = Math.max(0, savedWindowBounds.size.height - innerSize.height)
  const screenWithOffsets = window.screen as Screen & {
    availLeft?: number
    availTop?: number
  }
  const useWindowsWorkArea = isWindows
    && window.screen.availWidth > 0
    && window.screen.availHeight > 0
  const workArea = useWindowsWorkArea
    ? {
        width: window.screen.availWidth * monitor.scaleFactor,
        height: window.screen.availHeight * monitor.scaleFactor,
        x: (screenWithOffsets.availLeft ?? monitor.position.x / monitor.scaleFactor)
          * monitor.scaleFactor,
        y: (screenWithOffsets.availTop ?? monitor.position.y / monitor.scaleFactor)
          * monitor.scaleFactor,
      }
    : {
        width: monitor.size.width,
        height: monitor.size.height,
        x: monitor.position.x,
        y: monitor.position.y,
      }
  const bounds = calculateMeetingWindowBounds(
    workArea.width,
    workArea.height,
    workArea.x,
    workArea.y,
    monitor.scaleFactor,
    isMac ? 25 : 0,
    isWindows ? frameHeight / monitor.scaleFactor : 0,
  )
  await appWindow.setSize(new LogicalSize(bounds.width, bounds.height))
  await appWindow.setPosition(new LogicalPosition(bounds.x, bounds.y))
}

const restorePreviousLayout = async () => {
  if (appWindow.label !== 'main' || activeMeetingViews > 0 || !savedWindowBounds) return
  const bounds = savedWindowBounds
  savedWindowBounds = null
  if (await appWindow.isMaximized()) await appWindow.unmaximize()
  await appWindow.setSize(new PhysicalSize(bounds.size.width, bounds.size.height))
  await appWindow.setPosition(new PhysicalPosition(bounds.position.x, bounds.position.y))
  if (bounds.maximized) await appWindow.maximize()
  if (bounds.fullscreen) await appWindow.setFullscreen(true)
}

export const enterMeetingWindowLayout = () => {
  activeMeetingViews += 1
  layoutQueue = layoutQueue
    .then(applyMeetingLayout)
    .catch(error => console.warn('Unable to apply meeting window layout:', error))

  return () => {
    activeMeetingViews = Math.max(0, activeMeetingViews - 1)
    layoutQueue = layoutQueue
      .then(restorePreviousLayout)
      .catch(error => console.warn('Unable to restore the previous window layout:', error))
  }
}
