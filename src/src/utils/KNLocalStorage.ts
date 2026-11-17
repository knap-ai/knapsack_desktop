import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path'

import { getProfileRevision, PROFILE_CHANGED_EVENT } from './profileScope'

export const CONNECTIONS = 'KN_CONNECTIONS'
export const HAS_SHOWN_EA_INFO_MODAL = 'EA_INFO_MODAL'
export const EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS = 'EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS'
export const EMAIL_AUTOPILOT_SCHEDULING_LINKS = 'EMAIL_AUTOPILOT_SCHEDULING_LINKS'
export const RECONNECT_DISMISSED_AT = 'KN_RECONNECT_DISMISSED_AT'
export const EMAIL_NOTIFICATION_DRAWER_DISMISSED = 'EMAIL_NOTIFICATION_DRAWER_DISMISSED'

export class KNLocalStorage {
  private static data: Record<string, any> = {}
  private static initialized = false
  private static defaultsReadable = false
  private static initialization: Promise<void> | null = null
  private static persistenceQueue: Promise<void> = Promise.resolve()
  private static readonly APP_DIR = '.knapsack'
  private static readonly PROFILE_FILE = 'profile.dat'

  private static async initialize() {
    if (this.initialized) return
    if (!this.initialization) {
      this.initialization = this.loadFromFile().finally(() => { this.initialization = null })
    }
    await this.initialization
  }

  private static async loadFromFile() {
    if (this.initialized) return

    if (import.meta.env.VITE_KNAPSACK_LOCAL_QA_SAFE === '1') {
      this.data = {}
      this.defaultsReadable = true
      this.initialized = true
      return
    }

    try {
      const filePath = await join(this.APP_DIR, this.PROFILE_FILE)

      try {
        const contents = await readTextFile(filePath, { dir: BaseDirectory.Home })
        const parsed = JSON.parse(contents)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid local settings')
        this.data = parsed
        this.defaultsReadable = true
      } catch (error) {
        this.data = {}
        // Only a verified OS "not found" is a fresh install. Read/parse failures
        // must not turn a previously saved automatic-recording opt-out into ON.
        this.defaultsReadable = !(error instanceof SyntaxError) && /(?:No such file or directory|cannot find the (?:file|path)).*\(os error [23]\)/i.test(String(error))
      }

      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize storage:', error)
      throw error
    }
  }

  private static async saveToFile() {
    if (import.meta.env.VITE_KNAPSACK_LOCAL_QA_SAFE === '1') return
    const snapshot = JSON.stringify(this.data, null, 2)
    const pending = this.persistenceQueue.catch(() => {}).then(async () => {
      const filePath = await join(this.APP_DIR, this.PROFILE_FILE)
      await writeTextFile(filePath, snapshot, { dir: BaseDirectory.Home })
    })
    this.persistenceQueue = pending
    await pending
  }

  static async setItem(key: string, value: unknown): Promise<void> {
    await this.setItemIfCurrent(key, value)
  }

  static async setItemIfCurrent(key: string, value: unknown, expectedProfileRevision?: number): Promise<number | null> {
    await this.initialize()

    if (!this.defaultsReadable) throw new Error('Local settings could not be read. Existing settings were not overwritten.')
    // Compare after initialization, immediately before changing shared state.
    if (expectedProfileRevision !== undefined && getProfileRevision() !== expectedProfileRevision) return null

    const previousProfile =
      key === 'KN_PROFILE'
        ? JSON.stringify([this.data[key]?.uuid, this.data[key]?.email, this.data[key]?.name])
        : ''
    if (value === undefined) {
      delete this.data[key]
    } else {
      this.data[key] = value
    }

    if (
      key === 'KN_PROFILE' &&
      typeof window !== 'undefined' &&
      previousProfile !==
        JSON.stringify([this.data[key]?.uuid, this.data[key]?.email, this.data[key]?.name])
    ) {
      window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    }
    const committedRevision = getProfileRevision()
    await this.saveToFile()
    return committedRevision
  }

  static async defaultsAreReadable(): Promise<boolean> {
    await this.initialize()
    return this.defaultsReadable
  }

  static async getItem(key: string): Promise<any> {
    await this.initialize()
    return this.data[key] ?? null
  }
}
