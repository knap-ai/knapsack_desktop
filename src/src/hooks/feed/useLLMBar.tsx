import { useCallback, useMemo, useState } from 'react'

import useDrivePicker from 'react-google-drive-picker'
import { ConnectionKeys, getAccessToken, googleConnections } from 'src/api/connections'
import { getDocumentInfos } from 'src/api/data_source'
import { IGoogleDriveData, IGoogleDriveItem, LLMParams } from 'src/App'
import { LOCAL_FILES_SUMMARIZE_PROMPT } from 'src/prompts'
import DataFetcher from 'src/utils/data_fetch'
import { getFilesFromFolderWithoutExtension } from 'src/utils/formatText'
import { openGoogleAuthScreen } from 'src/utils/permissions/google'
import { SourceDocument } from 'src/utils/SourceDocument'

import { open as openDialog } from '@tauri-apps/api/dialog'

import { KNFileType } from '../../utils/KNSearchFilters'
import { IFeed } from './useFeed'

export interface ILLMBar {
  selectedDocuments: SourceDocument[]
  setSelectedDocuments: React.Dispatch<React.SetStateAction<SourceDocument[]>>
  handleSelectGoogleDriveFiles: () => Promise<void>
  handleSelectLocalFiles: (isSelectDir: boolean) => Promise<void>
  runLLMOnDocs: (
    docs?: SourceDocument[],
    shouldPerformDocSummary?: boolean,
    userQuery?: string,
  ) => Promise<void>
  setIsLoadingSources: (isLoading: boolean) => void
  getIsLoadingSources: () => boolean
}
export function useLLMBar(
  addToLLMQueue: (item: LLMParams) => void,
  setChatStream: (messageText: string, isStillStreaming?: boolean) => void,
  feed: IFeed,
  handleError: (error: Error | string) => void,
  userEmail: string,
) {
  const [selectedDocuments, setSelectedDocuments] = useState<SourceDocument[]>([])
  const [openPicker] = useDrivePicker()
  const dataFetcher = useMemo(() => new DataFetcher(), [])
  const googlePermissions: Record<string, boolean> = {
    [ConnectionKeys.GOOGLE_CALENDAR]: true,
    [ConnectionKeys.GOOGLE_DRIVE]: true,
    [ConnectionKeys.GOOGLE_GMAIL]: true,
    [ConnectionKeys.GOOGLE_PROFILE]: true,
  }
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  const handleSelectGoogleDriveFiles = async () => {
    let token = ''
    try {
      token = await getAccessToken(userEmail, ConnectionKeys.GOOGLE_DRIVE)
    } catch {
      let scopes: string[] = []
      for (const [key, googlePermission] of Object.entries(googlePermissions)) {
        if (googlePermission) {
          scopes = [...scopes, ...googleConnections[key].scopes]
        }
      }
      openGoogleAuthScreen(scopes.join(' '))
      return
    }

    async function fetchFilesInFolder(folderId: string, subFolderDepth: number = 0) {
      const filesReturn = await dataFetcher.getGoogleDriveFiles(folderId, token)
      const filesArray = filesReturn
        .filter((file: IGoogleDriveItem) => file.mimeType !== 'application/vnd.google-apps.folder')
        .map((file: IGoogleDriveItem) => ({
          id: file.id,
          name: file.name,
          mime_type: file.mimeType,
        }))

      if (subFolderDepth > 0) {
        const subFoldersIdArray = filesReturn
          .filter(
            (file: IGoogleDriveItem) => file.mimeType === 'application/vnd.google-apps.folder',
          )
          .map((folder: IGoogleDriveItem) => folder.id)

        for (const subFolderId of subFoldersIdArray) {
          const subFiles = await fetchFilesInFolder(subFolderId, subFolderDepth + 1)
          filesArray.push(...subFiles)
        }
      }

      return filesArray
    }

    const mimeTypes = await dataFetcher.getGoogleDriveMimeTypes()
    openPicker({
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      developerKey: import.meta.env.VITE_GOOGLE_DEVELOPER_KEY,
      token: token,
      viewMimeTypes: mimeTypes.join(','),
      viewId: 'DOCS',
      showUploadView: false,
      showUploadFolders: false,
      setIncludeFolders: true,
      setSelectFolderEnabled: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: async (data: IGoogleDriveData) => {
        const elements = Array.from(
          document.getElementsByClassName('picker-dialog') as HTMLCollectionOf<HTMLElement>,
        )
        for (let i = 0; i < elements.length; i++) {
          elements[i].style.zIndex = '2000'
        }
        if (data.action === 'picked') {
          setIsLoadingFiles(true)
          const docs = await Promise.all(
            data.docs.map(async (item: IGoogleDriveItem) => {
              if (item.mimeType === 'application/vnd.google-apps.folder') {
                const filesArray = await fetchFilesInFolder(item.id, 0)
                return filesArray
              } else {
                return {
                  id: item.id,
                  name: item.name,
                  mime_type: item.mimeType,
                }
              }
            }),
          )
          await dataFetcher.fetchGoogleDriveFiles(docs.flat(), userEmail)
          const driveIds: string[] = docs.flat().map(d => d.id)
          const types = docs.flat().map(_ => KNFileType.DRIVE_FILE)
          const docInfos = await getDocumentInfos(driveIds, types, userEmail)

          setIsLoadingFiles(false)
          setSelectedDocuments(prevDocs => [...prevDocs, ...docInfos])
        }
      },
    })
  }

  const handleSelectLocalFiles = async (isSelectDir: boolean) => {
    const selectedFiles = await openDialog({
      directory: isSelectDir,
      multiple: true,
      filters: [
        {
          name: 'Text & Data Files',
          extensions: [
            'txt',
            'md',
            'csv',
            'log',
            'ini',
            'yaml',
            'yml',
            'toml',
            'conf',
            'cfg',
            'docx',
            'doc',
            'pdf',
            'rtf',
          ],
        },
      ],
    })
    setIsLoadingFiles(true)

    let docs: string[]
    if (selectedFiles === null) {
      setIsLoadingFiles(false)
      feed.errorCallback()
      return
    }
    if (typeof selectedFiles === 'string') {
      docs = [selectedFiles]
    } else {
      docs = selectedFiles
    }
    if (isSelectDir) {
      const docsInFolder = await Promise.all(
        docs.map(async (doc: string) => {
          const filenames = await getFilesFromFolderWithoutExtension(doc)
          return filenames
        }),
      )
      docs = docsInFolder.flat()
    }
    const types = docs.map(_ => KNFileType.LOCAL_FILE)
    const docInfos = await getDocumentInfos(docs, types, userEmail)

    setIsLoadingFiles(false)
    setSelectedDocuments(prevDocs => [...prevDocs, ...docInfos])
  }

  const runLLMOnDocs = async (
    docs?: SourceDocument[],
    shouldPerformDocSummary: boolean = true,
    userQuery?: string,
  ) => {
    const { feedItem, threadId } = await feed.insertFeedItem(new Date().getTime(), false, 'LLM Bar')

    const docTitles = docs?.map(doc => doc.title).join(',\n')

    // !
    const docIds = docs?.map(doc => doc.documentId)

    // TODO: add user recovery logic here
    const errorCallback = (error: unknown) => {
      console.log(error)
      handleError('An error occurred, please try again')
    }

    const docSummaryMessageFinishCallback = async (response: string) => {
      if (!response) {
        handleError('Failed to run. Please try again in a minute.')
        return undefined
      }
      const timestamp = new Date().getTime()
      try {
        const regex = /"summary":\s*"(.*?)"\s*,\s*"quickActions"/s
        const match = response.match(regex)
        let message = ''
        if (match && match[1]) {
          message = '## Documents \n' + docTitles + ' \n ' + '\n **Summary** \n' + match[1] + '\n'
        } else {
          throw new Error('Missing summary in response')
        }
        await feed.insertMessageToFeedItem(
          feedItem,
          message,
          new Date(timestamp),
          undefined,
          docIds,
          threadId,
        )
        return response
      } catch (error) {
        console.error(error)
        let message = ''
        message =
          '## Running Summary Automation on \n' +
          docTitles +
          ' \n ' +
          '\n **Summary** \n' +
          JSON.parse(response).choices[0].message.content +
          '\n'
        await feed.insertMessageToFeedItem(
          feedItem,
          message,
          new Date(timestamp),
          undefined,
          docIds,
          threadId,
        )
        handleError('Response parsing failed. Please try again.')
        return undefined
      }
    }

    const userQueryMessageFinishCallback = async (response: string) => {
      if (!response) {
        handleError('Failed to run. Please try again in a minute.')
        return undefined
      }
      const timestamp = new Date().getTime() + 100 // ensure this is after doc summary
      //insert user message to the feed
      if (userQuery) {
        await feed.insertMessageToFeedItem(
          feedItem,
          userQuery,
          new Date(timestamp),
          userEmail,
          docIds,
          threadId,
        )
      }
      await feed.insertMessageToFeedItem(
        feedItem,
        response,
        new Date(timestamp + 100),
        undefined,
        docIds,
        threadId,
      )
      return response
    }

    if (shouldPerformDocSummary && docIds !== undefined) {
      addToLLMQueue({
        documents: docIds !== undefined ? docIds : [],
        prompt: LOCAL_FILES_SUMMARIZE_PROMPT,
        semanticSearchQuery: 'summary, overview, terms, and highlights',
        messageStreamCallback: setChatStream,
        messageFinishCallback: (response: string) => docSummaryMessageFinishCallback(response),
        errorCallback,
      })
    }
    if (userQuery !== undefined) {
      addToLLMQueue({
        documents: docIds !== undefined ? docIds : [],
        prompt: userQuery,
        semanticSearchQuery: userQuery,
        messageStreamCallback: setChatStream,
        messageFinishCallback: (response: string) => userQueryMessageFinishCallback(response),
        errorCallback,
      })
    }
  }

  const setIsLoadingSources = (isLoading: boolean) => {
    setIsLoadingFiles(isLoading)
  }

  const getIsLoadingSources = useCallback(() => {
    return isLoadingFiles
  }, [isLoadingFiles])

  const LLMBar: ILLMBar = {
    selectedDocuments,
    setSelectedDocuments,
    handleSelectGoogleDriveFiles,
    handleSelectLocalFiles,
    runLLMOnDocs,
    setIsLoadingSources,
    getIsLoadingSources,
  }

  return { LLMBar }
}
