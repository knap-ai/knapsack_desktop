import { SourceDocument } from './SourceDocument'

/**
 * Extracts all documentIds from an array of SourceDocuments
 * @param documents Array of SourceDocuments to extract IDs from
 * @returns Array of document IDs
 */
export const extractDocumentIds = (documents: SourceDocument[]): number[] => {
    return documents.map(doc => doc.documentId)
}

