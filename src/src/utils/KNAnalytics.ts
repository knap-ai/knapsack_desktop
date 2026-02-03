import * as amplitude from '@amplitude/analytics-browser'

import { getAppVersion, getOSInfoString } from '../utils/app'

import { ampli, ApiKey, DefaultConfiguration } from '../ampli'
import { extractDomain } from '../utils/emails'

export default class KNAnalytics {
  static TRACK_EVENT_SEARCH_EVERY_X_SECONDS = 20

  static HAS_LOADED = false
  static OS_VERSION_STRING: string | undefined = undefined
  static APP_VERSION: string | undefined = undefined

  static async initAnalytics(email: string, uuid: string, userUuid: string) {
    const version = await getAppVersion()
    // TODO: disable for dev instances
    if (!this.HAS_LOADED) {
      ampli.load({
        disabled: false,
        client: {
          apiKey: ApiKey.default,
          configuration: { ...DefaultConfiguration, logLevel: 3, appVersion: version },
        },
      })
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
      if (email !== '') {
        const domain = extractDomain(email)
        amplitudeIdentify.set('email', email)
        amplitudeIdentify.set('version', this.APP_VERSION)
        amplitudeIdentify.set('Version', this.APP_VERSION)
        ampli.client.setGroup('org', [domain])
      }
      await ampli.amplitude!.identify(amplitudeIdentify, { ...options }).promise
    }
  }

  static trackEvent(event: string, properties: any) {
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
    if (ampli !== undefined && ampli.amplitude! !== undefined) {
      ampli.amplitude!.logEvent(event, properties)
    }
  }
}
