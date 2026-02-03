import {
  isPermissionGranted,
  Options,
  requestPermission,
  sendNotification as tauriSendNotification,
} from '@tauri-apps/api/notification'

import { KNLocalStorage } from '../KNLocalStorage'

export const KN_LOCAL_STORAGE_KEY_NOTIFICATION_ENABLED: string = 'kn_has_notification'

export const doesUserWantNotifications = async () =>
  await KNLocalStorage.getItem(KN_LOCAL_STORAGE_KEY_NOTIFICATION_ENABLED) !== false

export const setUserWantsNotifications = (value: boolean) =>
  KNLocalStorage.setItem(KN_LOCAL_STORAGE_KEY_NOTIFICATION_ENABLED, value)

export const arePushNotificationsOSEnabled = () => isPermissionGranted()

export const arePushNotificationsOSEnabledAndWantedByUser = async () => {
  return (await arePushNotificationsOSEnabled()) && await doesUserWantNotifications()
}

export const requestNotificationOSPermissions = async () => {
  let osEnabled = await arePushNotificationsOSEnabled()
  if (!osEnabled) {
    const permission = await requestPermission()
    osEnabled = permission === 'granted'
  }
  return osEnabled
}

export const sendNotification = async (options: Options | string) => {
  if (await doesUserWantNotifications()) {
    tauriSendNotification(options)
  }
}
