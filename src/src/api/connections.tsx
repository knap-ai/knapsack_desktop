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
  /** Set for google_calendar_read connections — the Google account email whose
   *  calendar this connection syncs.  Empty string for all other types. */
  calendarAccountEmail?: string
  /** The local Knapsack profile email that owns this connection. */
  ownerEmail?: string
}

/** Record key used for a Google Calendar connection given its account email. */
export const calendarConnectionKey = (calendarAccountEmail: string): string =>
  `${ConnectionKeys.GOOGLE_CALENDAR}|${calendarAccountEmail}`

/** Record key used for a Google Drive connection given its account email. */
export const driveConnectionKey = (accountEmail: string): string =>
  `${ConnectionKeys.GOOGLE_DRIVE}|${accountEmail}`

/** Record key used for a Google Gmail connection given its account email. */
export const gmailConnectionKey = (accountEmail: string): string =>
  `${ConnectionKeys.GOOGLE_GMAIL}|${accountEmail}`

/** All Google Calendar connections in the connections map. */
export const getGoogleCalendarConnections = (
  connections: Record<string, Connection>,
): Connection[] => Object.values(connections).filter(c => c.key === ConnectionKeys.GOOGLE_CALENDAR)

/** All Google Drive connections in the connections map. */
export const getGoogleDriveConnections = (connections: Record<string, Connection>): Connection[] =>
  Object.values(connections).filter(c => c.key === ConnectionKeys.GOOGLE_DRIVE)

/** All Google Gmail connections in the connections map. */
export const getGoogleGmailConnections = (connections: Record<string, Connection>): Connection[] =>
  Object.values(connections).filter(c => c.key === ConnectionKeys.GOOGLE_GMAIL)

/** True if at least one Google Calendar account is connected. */
export const hasGoogleCalendar = (connections: Record<string, Connection>): boolean =>
  getGoogleCalendarConnections(connections).length > 0

/** True if at least one Google Gmail account is connected. */
export const hasGoogleGmail = (connections: Record<string, Connection>): boolean =>
  getGoogleGmailConnections(connections).length > 0

/** True if a calendar-backed experience can run. */
export const hasCalendarCapability = (connections: Record<string, Connection>): boolean =>
  hasGoogleCalendar(connections) || !!connections[ConnectionKeys.MICROSOFT_CALENDAR]

/** True if an email-backed experience can run. */
export const hasEmailCapability = (connections: Record<string, Connection>): boolean =>
  hasGoogleGmail(connections) || !!connections[ConnectionKeys.MICROSOFT_OUTLOOK]

/** Every email address Knapsack already knows belongs to the signed-in user. */
export const getConnectedIdentityEmails = (
  connections: Record<string, Connection> | undefined,
  primaryEmail?: string,
): string[] => Array.from(new Set([
  primaryEmail,
  ...Object.values(connections ?? {}).flatMap(connection => [
    connection.calendarAccountEmail,
    connection.ownerEmail,
  ]),
].filter((email): email is string => !!email && email.includes('@'))
  .map(email => email.trim().toLowerCase())))

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
  [ConnectionKeys.GOOGLE_DRIVE]: {
    label: 'Drive',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
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
      'https://graph.microsoft.com/Contacts.ReadWrite',
    ],
  },
  [ConnectionKeys.MICROSOFT_CALENDAR]: {
    label: 'Calendar',
    scopes: [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Contacts.ReadWrite',
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

  Object.entries(googleConnections).forEach(([key, connectionObj]) => {
    const hasMatchingScope = connectionObj.scopes.some(scope =>
      scopes.some(providedScope => scope.includes(providedScope)),
    )

    if (hasMatchingScope && !keys.includes(key as ConnectionKeys)) {
      keys.push(key as ConnectionKeys)
    }
  })

  return keys
}

export async function getConnections(
  email: string,
  options?: { includeAllUsers?: boolean },
): Promise<Record<string, Connection>> {
  const query = new URLSearchParams({ email })
  if (options?.includeAllUsers) {
    query.set('all_users', 'true')
  }

  const response = await fetch(`${KN_API_CONNECTIONS}?${query.toString()}`, {
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
        calendarAccountEmail?: string
        ownerEmail?: string
      },
    ) => {
      const scope = userConnection.connection.scope
      const calendarAccountEmail = userConnection.calendarAccountEmail || ''
      const ownerEmail = userConnection.ownerEmail || email
      // Calendar, Drive, and Gmail connections are keyed as "scope|accountEmail"
      // so that multiple linked accounts can coexist in the same record.
      const multiAccountScopes = new Set([
        ConnectionKeys.GOOGLE_CALENDAR,
        ConnectionKeys.GOOGLE_DRIVE,
        ConnectionKeys.GOOGLE_GMAIL,
      ])
      const recordKey =
        multiAccountScopes.has(scope as ConnectionKeys) && calendarAccountEmail
          ? `${scope}|${calendarAccountEmail}${options?.includeAllUsers ? `|${ownerEmail}` : ''}`
          : scope

      return {
        ...acc,
        [recordKey]: {
          id: userConnection.id,
          key: scope,
          state: ConnectionStates.IDLE,
          lastSynced: userConnection.lastSynced ? new Date(userConnection.lastSynced * 1000) : null,
          syncedSince: userConnection.syncedSince
            ? new Date(userConnection.syncedSince * 1000)
            : null,
          calendarAccountEmail,
          ownerEmail,
        } as Connection,
      }
    },
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

export async function syncGoogleDriveAPI(email: string, accountEmail?: string) {
  const accountParam = accountEmail ? `&account_email=${encodeURIComponent(accountEmail)}` : ''
  const response = await fetch(`${KN_API_GOOGLE_DRIVE}?email=${email}${accountParam}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (response.status === 400) {
    throw new Error('400 - ' + data.message)
  }
  return !!data?.success
}

export async function syncGoogleGmailAPI(email: string, accountEmail?: string) {
  const accountParam = accountEmail ? `&account_email=${encodeURIComponent(accountEmail)}` : ''
  const response = await fetch(`${KN_API_GOOGLE_GMAIL}?email=${email}${accountParam}`, {
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

export async function syncGoogleCalendarAPI(email: string, calendarAccountEmail?: string) {
  const accountParam = calendarAccountEmail
    ? `&calendar_account_email=${encodeURIComponent(calendarAccountEmail)}`
    : ''
  const response = await fetch(`${KN_API_GOOGLE_CALENDAR}?email=${email}${accountParam}`, {
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
    throw new Error('Failed to sync Google Calendar')
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

export async function getAccessToken(userEmail: string, scope: string, accountEmail?: string) {
  const query = new URLSearchParams({ email: userEmail, scope })
  if (accountEmail) query.set('account_email', accountEmail)
  const response = await fetch(`${KN_API_GOOGLE_ACCESS_TOKEN}?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.access_token
}

export async function getCompleteGoogleSignIn(code: string, scope: string, primaryEmail?: string) {
  const query = new URLSearchParams({
    code,
    scope,
  })
  if (primaryEmail) {
    query.set('primary_email', primaryEmail)
  }
  const response = await fetch(`${KN_API_COMPLETE_GOOGLE_SIGN_IN}?${query.toString()}`, {
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
