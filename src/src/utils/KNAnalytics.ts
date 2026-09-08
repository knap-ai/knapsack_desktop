import * as amplitude from '@amplitude/analytics-browser'

import { getAppVersion, getOSInfoString } from '../utils/app'

import { ampli, ApiKey, DefaultConfiguration } from '../ampli'
import { extractDomain } from '../utils/emails'

export default class KNAnalytics {
  static TRACK_EVENT_SEARCH_EVERY_X_SECONDS = 20

  static HAS_LOADED = false
  static OS_VERSION_STRING: string | undefined = undefined
  static APP_VERSION: string | undefined = undefined
  static PENDING_EVENT_TIMEOUT_MS = 5000
  static PENDING_EVENTS: Array<{
    event: string
    properties: any
    resolveDelivery?: (delivered: boolean) => void
    cancelWaitTimeout?: () => void
  }> = []

  private static eventProperties(properties: any) {
    return {
      platform: 'desktop',
      app: 'knapsack_desktop',
      app_version: this.APP_VERSION,
      ...properties,
    }
  }

  private static wasDelivered(result: unknown): boolean {
    const code = (result as { code?: unknown } | null)?.code
    return typeof code === 'number' && code >= 200 && code < 300
  }

  private static async sendAndFlush(event: string, properties: any): Promise<boolean> {
    if (!this.HAS_LOADED || !ampli?.amplitude) return false

    try {
      const trackPromise = ampli.amplitude.logEvent(event, this.eventProperties(properties)).promise
      const flushPromise = ampli.flush().promise
      const [trackResult] = await Promise.all([trackPromise, flushPromise])
      if (!this.wasDelivered(trackResult)) return false
      return true
    } catch (error) {
      console.error(`Failed to deliver analytics event ${event}`, error)
      return false
    }
  }

  static async initAnalytics(email: string, uuid: string, userUuid: string) {
    const version = await getAppVersion()
    // TODO: disable for dev instances
    if (!this.HAS_LOADED) {
      await ampli.load({
        disabled: false,
        client: {
          apiKey: ApiKey.default,
          configuration: { ...DefaultConfiguration, logLevel: 3, appVersion: version },
        },
      }).promise
      this.HAS_LOADED = true
    }

    if (this.OS_VERSION_STRING === undefined) {
      this.OS_VERSION_STRING = await getOSInfoString()
    }
    if (this.APP_VERSION === undefined) {
      this.APP_VERSION = await getAppVersion()
    }

    if (uuid !== '') {
      console.log("this.APP_VERSION: ", this.APP_VERSION)
      const options = {
        device_id: uuid,
        version: this.APP_VERSION,
        app_version: this.APP_VERSION,
        os_version: this.OS_VERSION_STRING,
        user_id: userUuid,
      }

      const amplitudeIdentify = new amplitude.Identify()
      amplitudeIdentify.set('platform', 'desktop')
      amplitudeIdentify.set('app', 'knapsack_desktop')
      if (email !== '') {
        const domain = extractDomain(email)
        amplitudeIdentify.set('email', email)
        amplitudeIdentify.set('version', this.APP_VERSION)
        amplitudeIdentify.set('Version', this.APP_VERSION)
        ampli.client.setGroup('org', [domain])
      }
      await ampli.amplitude!.identify(amplitudeIdentify, { ...options }).promise
    }

    const pendingEvents = this.PENDING_EVENTS.splice(0)
    await Promise.all(
      pendingEvents.map(async pending => {
        if (!pending.resolveDelivery) {
          ampli.amplitude!.logEvent(pending.event, this.eventProperties(pending.properties))
          return
        }

        pending.cancelWaitTimeout?.()
        const delivered = await this.sendAndFlush(pending.event, pending.properties)
        pending.resolveDelivery(delivered)
      }),
    )
  }

  static trackEvent(event: string, properties: any): boolean {
    // TODO: currently, we need to manually set this property to
    // private in order to access the amplitude var for
    // generic logEvent like this.
    //
    // IMO this is a weakness of the ampli lib,
    // but the way Amplitude wants us to handle this is
    // by creating event types in their platform first,
    // and then we can generate code in src/ampli to
    // allow typing that corresponds to all of these event types.
    //
    // This feels rather brittle to me, so I'm opting for this solution
    // instead.
    if (!this.HAS_LOADED) {
      this.PENDING_EVENTS.push({ event, properties })
      return true
    }
    if (ampli !== undefined && ampli.amplitude! !== undefined) {
      ampli.amplitude!.logEvent(event, {
        platform: 'desktop',
        app: 'knapsack_desktop',
        app_version: this.APP_VERSION,
        ...properties,
      })
      return true
    }
    return false
  }

  /**
   * Tracks an event and resolves only after Amplitude confirms both the event
   * upload and a flush. Callers may safely persist deduplication state only
   * when this returns true.
   */
  static trackEventAndFlush(event: string, properties: any): Promise<boolean> {
    if (!this.HAS_LOADED) {
      return new Promise(resolveDelivery => {
        let settled = false
        let pending: (typeof this.PENDING_EVENTS)[number]
        const timeout = setTimeout(() => {
          if (settled) return
          settled = true
          const index = this.PENDING_EVENTS.indexOf(pending)
          if (index >= 0) this.PENDING_EVENTS.splice(index, 1)
          resolveDelivery(false)
        }, this.PENDING_EVENT_TIMEOUT_MS)

        pending = {
          event,
          properties,
          resolveDelivery: delivered => {
            if (settled) return
            settled = true
            resolveDelivery(delivered)
          },
          cancelWaitTimeout: () => clearTimeout(timeout),
        }
        this.PENDING_EVENTS.push(pending)
      })
    }

    return this.sendAndFlush(event, properties)
  }
}
