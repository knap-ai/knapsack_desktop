export const CONNECTIONS = "KN_CONNECTIONS";
export const HAS_SHOWN_EA_INFO_MODAL = "EA_INFO_MODAL";
export const EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS = "EMAIL_AUTOPILOT_CUSTOM_INSTRUCTIONS";
export const EMAIL_AUTOPILOT_SCHEDULING_LINKS = "EMAIL_AUTOPILOT_SCHEDULING_LINKS";

import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path'

export class KNLocalStorage {
  private static data: Record<string, any> = {}
  private static initialized = false
  private static readonly APP_DIR = '.knapsack'
  private static readonly PROFILE_FILE = 'profile.dat'

  private static async initialize() {
    if (this.initialized) return

    try {
      const filePath = await join(this.APP_DIR, this.PROFILE_FILE)

      try {
        const contents = await readTextFile(filePath, { dir: BaseDirectory.Home })
        this.data = JSON.parse(contents)
      } catch {
        this.data = {}
      }

      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize storage:', error)
      throw error
    }
  }

  private static async saveToFile() {
    const filePath = await join(this.APP_DIR, this.PROFILE_FILE)
    await writeTextFile(filePath, JSON.stringify(this.data, null, 2), {
      dir: BaseDirectory.Home,
    })
  }

  static async setItem(key: string, value: unknown) {
    await this.initialize()

    if (value === undefined) {
      delete this.data[key]
    } else {
      this.data[key] = value
    }

    await this.saveToFile()
  }

  static async getItem(key: string): Promise<any> {
    await this.initialize()
    return this.data[key] ?? null
  }
}
