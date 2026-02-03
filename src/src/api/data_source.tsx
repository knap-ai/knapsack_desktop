import {
  KN_API_GET_DOC_INFOS,
  KN_API_GET_DRIVE_DOC_IDS,
  KN_API_GET_EMAIL_THREAD,
} from 'src/utils/constants'
import { EmailDocument, SourceDocument } from 'src/utils/SourceDocument'

export enum EmailClassification {
  IMPORTANT = 'IMPORTANT',
  IMPORTANT_NO_RESPONSE = 'IMPORTANT_NO_RESPONSE',
  MARKETING = 'MARKETING',
  OPPORTUNITY = 'OPPORTUNITY',
}

export interface EmailClassificationResponse {
  summary: string
  classification: EmailClassification
}

export async function getDocumentInfos(paths: string[], types: string[], email?: string) {
  const body = {
    document_identifiers: paths,
    document_types: types,
    email,
  }
  console.log('BODY: ', body)
  const response = await fetch(KN_API_GET_DOC_INFOS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  console.log('response statusCode', response.status)
  const data = await response.json()
  console.log('GET DOCUMENT INFOS RESPONSE: ', data)
  if (!data) {
    console.log(`getDocumentInfos data error`)
    return []
  }
  return data as SourceDocument[]
}

export async function getDriveDocumentsIds(emails: string[], userEmail: string) {
  const withoutUserEmail = emails.filter(email => email !== userEmail)

  const link = `${KN_API_GET_DRIVE_DOC_IDS}?email=${[userEmail, ...withoutUserEmail].join(',')}`
  const response = await fetch(link, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  if (!data) {
    console.log(`getDriveDocumentsIds data error`)
    return []
  }
  return data.ids as string[]
}

export async function getEmailThread(documentId: number) {
  try {
    const response = await fetch(`${KN_API_GET_EMAIL_THREAD}/${documentId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data['display_docs'] as EmailDocument[]
  } catch (error) {
    console.error('Failed to fetch email thread:', error)
    return undefined
  }
}
