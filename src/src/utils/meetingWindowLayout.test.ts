// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  setSize: vi.fn(async (_size: unknown) => {}),
  setPosition: vi.fn(async (_position: unknown) => {}),
  isMaximized: vi.fn(async () => false),
  isFullscreen: vi.fn(async () => false),
  maximize: vi.fn(async () => {}),
  unmaximize: vi.fn(async () => {}),
  setFullscreen: vi.fn(async (_value: boolean) => {}),
}))
vi.mock('@tauri-apps/api/window', () => ({
  appWindow: {
    label: 'main',
    ...mocks,
    outerPosition: async () => ({ x: 100, y: 80 }),
    outerSize: async () => ({ width: 1024, height: 788 }),
    innerSize: async () => ({ width: 1000, height: 760 }),
  },
  currentMonitor: async () => ({
    size: { width: 1920, height: 1080 },
    position: { x: 0, y: 0 },
    scaleFactor: 1,
  }),
  LogicalSize: class {
    constructor(
      public width: number,
      public height: number,
    ) {}
  },
  PhysicalSize: class {
    constructor(
      public width: number,
      public height: number,
    ) {}
  },
  LogicalPosition: class {
    constructor(
      public x: number,
      public y: number,
    ) {}
  },
  PhysicalPosition: class {
    constructor(
      public x: number,
      public y: number,
    ) {}
  },
}))
it('restores pre-recording client bounds rather than inflating them by the window frame', async () => {
  const { enterMeetingWindowLayout } = await import('./meetingWindowLayout')
  const leave = enterMeetingWindowLayout()
  await vi.waitFor(() => expect(mocks.setPosition).toHaveBeenCalledOnce())
  leave()
  await vi.waitFor(() => expect(mocks.setPosition).toHaveBeenCalledTimes(2))
  expect(mocks.setSize.mock.calls[1][0]).toMatchObject({ width: 1000, height: 760 })
  expect(mocks.setPosition.mock.calls[1][0]).toMatchObject({ x: 100, y: 80 })
  expect(mocks.maximize).not.toHaveBeenCalled()
  expect(mocks.setFullscreen).not.toHaveBeenCalled()
})
it('retains restoration snapshot after failure and retries without forcing fullscreen', async () => {
  const { enterMeetingWindowLayout } = await import('./meetingWindowLayout')
  mocks.setSize.mockClear()
  mocks.setPosition.mockClear()
  const leave = enterMeetingWindowLayout()
  await vi.waitFor(() => expect(mocks.setPosition).toHaveBeenCalledOnce())
  mocks.setSize.mockRejectedValueOnce(new Error('synthetic window service failure'))
  leave()
  await vi.waitFor(() => expect(mocks.setSize).toHaveBeenCalledTimes(2))
  const retry = enterMeetingWindowLayout()
  retry()
  await vi.waitFor(() => expect(mocks.setPosition).toHaveBeenCalledTimes(2))
  expect(mocks.setSize.mock.calls[2][0]).toMatchObject({ width: 1000, height: 760 })
  expect(mocks.setFullscreen).not.toHaveBeenCalled()
})
