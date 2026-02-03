import { Profile } from 'src/hooks/auth/useAuth'
import { serializeCalendarEventToMeeting } from 'src/hooks/dataSources/useCalendar'
import {
  API_SERVER_USERS,
  KN_API_COMPLETE_GOOGLE_SIGN_IN,
  KN_API_CONNECTIONS,
  KN_API_CONNECTIONS_GET_STATUS,
  KN_API_CONNECTIONS_SIGNOUT,
  KN_API_GET_API_TOKEN,
  KN_API_GET_GOOGLE_EVENTS,
  KN_API_GOOGLE_ACCESS_TOKEN,
  KN_API_GOOGLE_CALENDAR,
  KN_API_GOOGLE_DRIVE,
  KN_API_GOOGLE_GMAIL,
  KN_API_GOOGLE_PROFILE,
  KN_API_LOCAL_FILES,
  KN_API_MICROSOFT_CALENDAR,
  KN_API_MICROSOFT_ONE_DRIVE,
  KN_API_MICROSOFT_OUTLOOK,
  KN_API_MICROSOFT_PROFILE,
} from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import { BaseException } from 'src/utils/exceptions/base'

export enum ConnectionStates {
  IDLE = 'idle',
  UP_TO_DATE = 'up to date',
  SYNCING = 'syncing',
  FAILED = 'failed',
}

export type Connection = {
  id?: number
  key: string
  state: ConnectionStates
  lastSynced?: Date | string
  syncedSince?: Date | string
}

export const isConnectionReadyToSync = (connection?: Connection) => {
  return connection?.state && connection.state !== ConnectionStates.SYNCING
}

export enum ConnectionKeys {
  GOOGLE_PROFILE = 'google_profile_read',
  GOOGLE_DRIVE = 'google_drive_read',
  GOOGLE_CALENDAR = 'google_calendar_read',
  GOOGLE_GMAIL = 'google_gmail_modify',
  MICROSOFT_PROFILE = 'microsoft_profile_read',
  MICROSOFT_ONEDRIVE = 'microsoft_onedrive_read',
  MICROSOFT_OUTLOOK = 'microsoft_outlook_read',
  MICROSOFT_CALENDAR = 'microsoft_calendar_read',
  LOCAL_FILES = 'local_files_read',
}

export const syncedMessage: Record<ConnectionKeys, string> = {
  [ConnectionKeys.GOOGLE_PROFILE]: 'Synced as of today',
  [ConnectionKeys.GOOGLE_DRIVE]: 'Synced changes since ',
  [ConnectionKeys.GOOGLE_CALENDAR]: 'Synced back to ',
  [ConnectionKeys.GOOGLE_GMAIL]: 'Synced back to ',
  [ConnectionKeys.LOCAL_FILES]: 'Synced',
  [ConnectionKeys.MICROSOFT_PROFILE]: '',
  [ConnectionKeys.MICROSOFT_ONEDRIVE]: 'Synced changes since ',
  [ConnectionKeys.MICROSOFT_OUTLOOK]: 'Synced back to ',
  [ConnectionKeys.MICROSOFT_CALENDAR]: 'Synced back to ',
}

export const dateFormat = {
  [ConnectionKeys.GOOGLE_PROFILE]: undefined,
  [ConnectionKeys.GOOGLE_DRIVE]: 'MMM DD YYYY',
  [ConnectionKeys.GOOGLE_CALENDAR]: 'MMM DD YYYY',
  [ConnectionKeys.GOOGLE_GMAIL]: 'MMM DD YYYY',
  [ConnectionKeys.LOCAL_FILES]: undefined,
  [ConnectionKeys.MICROSOFT_PROFILE]: 'MM/DD/YY',
  [ConnectionKeys.MICROSOFT_ONEDRIVE]: 'MM/DD/YY',
  [ConnectionKeys.MICROSOFT_OUTLOOK]: 'MM/DD/YY',
  [ConnectionKeys.MICROSOFT_CALENDAR]: 'MM/DD/YY',
}

export type ConnectionObject = {
  label: string
  scopes: string[]
}

export const ONBOARDING_GOOGLE_PERMISSIONS: Record<string, ConnectionObject> = {
  [ConnectionKeys.GOOGLE_PROFILE]: {
    label: 'Profile',
    scopes: [
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    ],
  },
  [ConnectionKeys.GOOGLE_CALENDAR]: {
    label: 'Calendar',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  },
  [ConnectionKeys.GOOGLE_GMAIL]: {
    label: 'Gmail',
    scopes: ['https://www.googleapis.com/auth/gmail.modify'],
  },
}

export const googleConnections: Record<string, ConnectionObject> = {
  [ConnectionKeys.GOOGLE_PROFILE]: {
    label: 'Profile',
    scopes: [
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    ],
  },
  [ConnectionKeys.GOOGLE_DRIVE]: {
    label: 'Drive',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  },
  [ConnectionKeys.GOOGLE_GMAIL]: {
    label: 'Gmail',
    scopes: ['https://www.googleapis.com/auth/gmail.modify'],
  },
  [ConnectionKeys.GOOGLE_CALENDAR]: {
    label: 'Calendar',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  },
}

export const microsoftConnections: Record<string, ConnectionObject> = {
  [ConnectionKeys.MICROSOFT_PROFILE]: {
    label: 'Profile',
    scopes: ['https://graph.microsoft.com/User.Read'],
  },
  [ConnectionKeys.MICROSOFT_ONEDRIVE]: {
    label: 'OneDrive',
    scopes: ['https://graph.microsoft.com/Files.ReadWrite.All'],
  },
  [ConnectionKeys.MICROSOFT_OUTLOOK]: {
    label: 'Outlook',
    scopes: [
      'https://graph.microsoft.com/Mail.ReadWrite',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/MailboxSettings.Read',
      'https://graph.microsoft.com/Contacts.ReadWrite'
    ],
  },
  [ConnectionKeys.MICROSOFT_CALENDAR]: {
    label: 'Calendar',
    scopes: [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Contacts.ReadWrite'
    ],
  },
}

export const connectionsMap: Record<string, ConnectionObject> = {
  ...googleConnections,
  ...microsoftConnections,
  [ConnectionKeys.LOCAL_FILES]: {
    label: 'Local files',
    scopes: [],
  },
}

export function getGoogleConnectionKeysFromScopes(scopes: string[]): ConnectionKeys[] {
  const keys: ConnectionKeys[] = []

  Object.entries(ONBOARDING_GOOGLE_PERMISSIONS).forEach(([key, connectionObj]) => {
    const hasMatchingScope = connectionObj.scopes.some(scope =>
      scopes.some(providedScope => scope.includes(providedScope)),
    )

    if (hasMatchingScope && !keys.includes(key as ConnectionKeys)) {
      keys.push(key as ConnectionKeys)
    }
  })

  return keys
}

export async function getConnections(email: string): Promise<Record<string, Connection>> {
  const response = await fetch(`${KN_API_CONNECTIONS}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    logError(new Error('Could not retrieve user connections'), {
      additionalInfo: '',
      error: data.message,
    })
    throw new Error('Could not retrieve user connections')
  }
  return data.connections.reduce(
    (
      acc: Record<string, Connection>,
      userConnection: {
        id: number
        connection: { scope: string; id: number }
        lastSynced?: number
        syncedSince?: number
      },
    ) => ({
      ...acc,
      [userConnection.connection.scope]: {
        id: userConnection.id,
        key: userConnection.connection.scope,
        state: ConnectionStates.IDLE,
        lastSynced: userConnection.lastSynced ? new Date(userConnection.lastSynced * 1000) : null,
        syncedSince: userConnection.syncedSince
          ? new Date(userConnection.syncedSince * 1000)
          : null,
      } as Connection,
    }),
    {},
  )
}

export async function deleteConnection(id: number) {
  const response = await fetch(`${KN_API_CONNECTIONS}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    throw new BaseException('Could not delete user connection')
  }
}

export async function getGoogleProfile(email: string) {
  const response = await fetch(`${KN_API_GOOGLE_PROFILE}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    logError(new Error(data.message), {
      additionalInfo: '',
      error: data.message,
    })
  }
  return {
    email: data.email,
    profile_image: data.profile_image,
    name: data.name,
    uuid: data.uuid,
    provider: ConnectionKeys.GOOGLE_PROFILE,
    sharing_permission: data.sharing_permission,
  } as Profile
}

export async function syncGoogleDriveAPI(email: string) {
  const response = await fetch(`${KN_API_GOOGLE_DRIVE}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return !!data?.success
}

export async function syncGoogleGmailAPI(email: string) {
  const response = await fetch(`${KN_API_GOOGLE_GMAIL}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (response.status === 400) {
    throw new Error('400 - ' + data.message)
  }
  if (response.status != 200) {
    throw new Error('Failed to sync local files')
  }
  return !!data?.success
}

export async function syncGoogleCalendarAPI(email: string) {
  const response = await fetch(`${KN_API_GOOGLE_CALENDAR}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (response.status === 400) {
    throw new Error('400 - ' + data.message)
  }
  if (response.status != 200) {
    throw new Error('Failed to sync local files')
  }
  return !!data?.success
}

export async function syncLocalFilesAPI() {
  const response = await fetch(`${KN_API_LOCAL_FILES}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (response.status === 400) {
    throw new Error('400 - ' + data.message)
  }
  if (response.status != 200) {
    throw new Error('Failed to sync local files')
  }
  return !!data?.success
}

export async function getGoogleCalendarEvents(startTimestamp: number, endTimestamp: number) {
  const response = await fetch(
    `${KN_API_GET_GOOGLE_EVENTS}?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  const data = await response.json()

  if (Array.isArray(data)) {
    return data.map(event => {
      const serializedMeeting = serializeCalendarEventToMeeting(event)

      return {
        ...event,
        teams_url: serializedMeeting.teams_url || '',
        zoom_url: serializedMeeting.zoom_url || '',
        meeting_platform: serializedMeeting.meeting_platform || 'unknown',
      }
    })
  }

  return data
}

export async function getMicrosoftProfile(email: string) {
  const response = await fetch(`${KN_API_MICROSOFT_PROFILE}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    throw new Error('Could not retrieve google profile')
  }
  return {
    email: data.email,
    profile_image: data.profile_image,
    name: data.name,
    provider: ConnectionKeys.MICROSOFT_PROFILE,
  } as Profile
}

export async function syncMicrosoftOneDriveAPI(email: string) {
  const response = await fetch(`${KN_API_MICROSOFT_ONE_DRIVE}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (response.status === 400) {
    throw new Error('400 - ' + data.message)
  }
  if (response.status != 200) {
    throw new Error('Failed to sync local files')
  }
  return !!data?.success
}

export async function syncMicrosoftOutlookAPI(email: string) {
  const response = await fetch(`${KN_API_MICROSOFT_OUTLOOK}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (response.status === 400) {
    throw new Error('400 - ' + data.message)
  }
  if (response.status != 200) {
    throw new Error('Failed to sync local files')
  }
  return !!data?.success
}

export async function syncMicrosoftCalendarAPI(email: string) {
  const response = await fetch(`${KN_API_MICROSOFT_CALENDAR}?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (response.status === 400) {
    throw new Error('400 - ' + data.message)
  }
  if (response.status != 200) {
    throw new Error('Failed to sync local files')
  }
  return !!data?.success
}

// export async function getMicrosoftCalendarEvents(startTimestamp: number, endTimestamp: number) {
//   const response = await fetch(
//     `${KN_API_GET_MICROSOFT_EVENTS}?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`,
//     {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     },
//   )
//   const data = await response.json()
//   return data
// }

const serializeConnectionStatusResponse = ({
  is_syncing,
}: {
  is_syncing: Record<string, boolean>
}) => {
  const mapping: Record<string, string> = {
    GoogleDrive: 'google_drive_read',
    GoogleCalendar: 'google_calendar_read',
    GoogleGmail: 'google_gmail_modify',
    LocalFiles: 'local_files_read',
    MicrosoftOneDrive: 'microsoft_onedrive_read',
    MicrosoftOutlook: 'microsoft_outlook_read',
    MicrosoftCalendar: 'microsoft_calendar_read',
  }
  const serializedData: Record<string, boolean> = {}
  for (const [key, value] of Object.entries(is_syncing)) {
    serializedData[mapping[key]] = value
  }
  return serializedData
}

export async function getConnectionsStatus() {
  const response = await fetch(KN_API_CONNECTIONS_GET_STATUS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = (await response.json()).data
  return serializeConnectionStatusResponse(data)
}

export async function signout() {
  const response = await fetch(KN_API_CONNECTIONS_SIGNOUT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    logError(new Error('Failed to sign out'), {
      additionalInfo: 'Failed to sign out',
      error: 'Failed to sign out',
    })
    throw new Error('Failed to sign out')
  }
  return await response.json()
}

export async function getAccessToken(userEmail: string, scope: string) {
  const response = await fetch(`${KN_API_GOOGLE_ACCESS_TOKEN}?email=${userEmail}&scope=${scope}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.access_token
}

export async function getCompleteGoogleSignIn(code: string, scope: string) {
  const response = await fetch(`${KN_API_COMPLETE_GOOGLE_SIGN_IN}?code=${code}&scope=${scope}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()
  if (!response.ok) {
    const err = data.error
    logError(new Error('Failed to google auth'), {
      additionalInfo: 'Failed to google auth',
      error: err,
    })

    throw new Error('Failed to google auth')
  }

  return data
}

export async function updateLastSeen(email: string) {
  if (!email) {
    throw new Error('Missing email')
  }
  const token = await getApiToken(email)
  const response = await fetch(`${API_SERVER_USERS}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    logError(new Error('Failed to update last seen'), {
      additionalInfo: 'Failed to update last seen',
      error: 'Failed to update last seen',
    })
    return { success: false }
  }

  const data = await response.json()
  if (data.success) {
    return {
      success: true,
      sharing_permission: data.sharing_permission,
    }
  }

  logError(new Error('Failed to update last seen'), {
    additionalInfo: data.message,
    error: data.error_code,
  })
  return { success: false }
}

export async function getApiToken(email: string): Promise<string> {
  try {
    const response = await fetch(`${KN_API_GET_API_TOKEN}/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to get API token')
    }

    return data.token
  } catch (error) {
    logError(error as Error, {
      additionalInfo: 'Failed to get API token',
      error: (error as Error).message,
    })
    throw new Error('Failed to get API token')
  }
}
