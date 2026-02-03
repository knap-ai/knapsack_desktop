export enum DocumentType {
  EMAIL = 'email',
  FILE = 'file',
  DRIVE = 'drive'
}

export interface SourceDocument {
  documentId: number
  title: string
  documentType: DocumentType
  summary: string | undefined
  uri: string | undefined
  data: any
}

export interface EmailDocument extends SourceDocument {
  emailUid: string
  sender: string
  recipients: string[]
  cc: string[]
  subject: string
  body: string | undefined
  threadId: string | undefined
  date: number
  summary: string | undefined
  isStarred?: boolean
  isRead?: boolean
  isArchived?: boolean
  isDeleted?: boolean
}

export interface LocalFileDocument extends SourceDocument {
  filePath: string
  size: number  // in bytes
}

export interface DriveDocument extends SourceDocument {
  filename: string
  driveId: string
  dateModified: number
  size: number  // in bytes
}

export const serializeEmailDocumentsToAdditionalDocuments = (
  emailDocuments: EmailDocument[],
) => {
  return emailDocuments.map(email => ({
    title: email.subject,
    content: JSON.stringify(email),
  }))
}

