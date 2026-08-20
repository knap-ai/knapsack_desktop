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
) => {
  const monitorWidth = monitorWidthPhysical / scaleFactor
  const monitorHeight = monitorHeightPhysical / scaleFactor
  const width = Math.min(720, Math.max(520, monitorWidth * 0.42))
  return {
    width,
    height: Math.max(560, monitorHeight - topInset),
    x: monitorXPhysical / scaleFactor + monitorWidth - width,
    y: monitorYPhysical / scaleFactor + topInset,
  }
}

const applyMeetingLayout = async () => {
  if (appWindow.label !== 'main' || activeMeetingViews === 0 || savedWindowBounds) return
  const monitor = await currentMonitor()
  if (!monitor) return

  savedWindowBounds = {
    position: await appWindow.outerPosition(),
    size: await appWindow.outerSize(),
    maximized: await appWindow.isMaximized(),
  }

  if (savedWindowBounds.maximized) await appWindow.unmaximize()
  const isMac = navigator.userAgent.includes('Mac')
  const bounds = calculateMeetingWindowBounds(
    monitor.size.width,
    monitor.size.height,
    monitor.position.x,
    monitor.position.y,
    monitor.scaleFactor,
    isMac ? 25 : 0,
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
