import { useCallback, useEffect, useRef, useState } from 'react'

import styles from './styles.module.scss'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { ILLMBar } from 'src/hooks/feed/useLLMBar'

import MenuItem, { MenuItemVariant } from '../../../components/molecules/MenuItem'
import SourceDocumentCard from 'src/components/molecules/SourceDocumentCard'

import { AutomationDataSources } from '../../../automations/automation'
import DataFetcher from '../../../utils/data_fetch'
import gDrive from '/assets/images/icons/google-drive.svg'
import Plus from '/assets/images/icons/Plus.svg'
import StartWithFilesButton from '/assets/images/icons/startWithFilesButton.svg'
import StartWithFolderButton from '/assets/images/icons/startWithFolderButton.svg'
import Arrow from '/assets/images/icons/arrow-up.svg'

interface KnapsackLMBarProps {
  LLMBarUtils: ILLMBar
}

function KnapsackLMBar({ LLMBarUtils }: KnapsackLMBarProps) {
  const [filesMenuOpen, setFilesMenuOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const filesDropdownRef = useRef(null)
  const filesMenuRef = useRef(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const dataFetcher = new DataFetcher()

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '44px';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${Math.max(44, newHeight)}px`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInFilesButton =
        filesDropdownRef.current && (filesDropdownRef.current as any).contains(event.target)
      const isClickInFilesMenu =
        filesMenuRef.current && (filesMenuRef.current as any).contains(event.target)

      if (!isClickInFilesButton && !isClickInFilesMenu) {
        setFilesMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const performSemanticSearch = useCallback(async (query: string) => {
    const dataSources = [
      AutomationDataSources.GMAIL,
      AutomationDataSources.DRIVE,
      AutomationDataSources.LOCAL_FILES,
      AutomationDataSources.WEB,
    ]
    return await dataFetcher.semanticSearch(query, [], dataSources)
  }, [])

  const handleSubmitUserQuery = async (userQuery: string) => {
    try {
      let docsForQuery = LLMBarUtils.selectedDocuments
      if (LLMBarUtils.selectedDocuments.length <= 0) {
        docsForQuery = await performSemanticSearch(userQuery)
      }
      console.log("docsForQuery: ", docsForQuery)
      const shouldPerformDocSummary = LLMBarUtils.selectedDocuments.length > 0
      await LLMBarUtils.runLLMOnDocs(docsForQuery, shouldPerformDocSummary, userQuery)
      LLMBarUtils.setSelectedDocuments([])
    } finally {
      LLMBarUtils.setIsLoadingSources(false)
    }
  }

  const onRemoveSourceDocumentClick = (index: number) => {
    LLMBarUtils.setSelectedDocuments(docs => docs.filter((_, i) => i !== index))
  }

  const onRemoveAllSources = () => {
    LLMBarUtils.setSelectedDocuments([])
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div
      className="w-full h-fit"
    >
      {(LLMBarUtils.getIsLoadingSources() || LLMBarUtils.selectedDocuments.length > 0) && (
        <div
          className={`absolute bottom-8 my-2 mb-0 pb-10 left-0 right-0 bg-[#f5f5f5] p-2 border border-zinc-300 ${styles.SelectedSourcesTab}`}
        >
          {LLMBarUtils.getIsLoadingSources() ? (
            <div className="text-sm text-ks-neutral-500 font-semibold tracking-[0.12em] px-2">
              LOADING FILES...
            </div>
          ) : (
            <div className="w-full">
              <div
                className="flex flex-row items-center"
              >
                <div className="text-sm text-ks-neutral-500 font-semibold tracking-wide pl-3 pb-2 leading-loose">SOURCES</div>
                <div className="flex-grow" />
                <button
                  onClick={() => onRemoveAllSources()}
                  className="hover:bg-gray-300 rounded-full p-1 cursor-pointer mb-1"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-900" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {LLMBarUtils.selectedDocuments.map((doc, index) => (
                    <SourceDocumentCard
                      key={index}
                      index={index}
                      sourceDocument={doc}
                      onXClick={onRemoveSourceDocumentClick}
                    />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <div
        className="TightShadow rounded-[32px] bg-white min-h-14 flex flex-row items-center min-h-14 relative"
      >
        <div
          className="flex items-center justify-center h-10 w-10 aspect-square cursor-pointer rounded-full bg-white border border-gray-200 ml-2 mr-2"
          ref={filesDropdownRef}
          onClick={() => setFilesMenuOpen(!filesMenuOpen)}
        >
          <img className="h-5 w-5" src={Plus} alt="Plus Icon" />
        </div>

        <div className="relative flex items-start w-full">
        <textarea
            ref={textareaRef}
            id="knapsack_lm_textarea"
            className="TightShadow bg-white h-11 px-5 flex-grow mx-1.5 rounded-[32px] cursor-text text-base resize-none border-0 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-normal pt-3 pb-3 text-gray-900"
            placeholder="Start with a question..."
            value={inputValue}
            onPaste={handlePaste}
            onChange={(e) => {
              setInputValue(e.target.value)
              adjustHeight()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                setInputValue('')
                handleSubmitUserQuery(inputValue).finally(() => {
                  if (textareaRef.current) {
                    textareaRef.current.style.height = '44px'
                  }
                });
              }
            }}
          />
          {(inputValue || LLMBarUtils.selectedDocuments.length > 0) && (
            <button
              type="button"
              className="absolute right-3 flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 cursor-pointer hover:bg-blue-600 transition-colors top-1/2 -translate-y-1/2"
              onClick={() => {
                if (inputValue) {
                    setInputValue('')
                  handleSubmitUserQuery(inputValue).finally(() => {
                    if (textareaRef.current) {
                      textareaRef.current.style.height = '44px'
                    }
                  });
                } else if (LLMBarUtils.selectedDocuments.length > 0) {
                  LLMBarUtils.setSelectedDocuments([]);
                }
              }}
            >
              <img src={Arrow} alt="Arrow Icon" className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      {filesMenuOpen && (
        <div
          ref={filesMenuRef}
          className="absolute bottom-full left-0 TightShadow bg-white rounded-lg mb-1"
        >
          <div className="flex flex-col justify-start items-end gap-y-2 text-black font-normal p-2 TightShadow rounded-lg bg-white">
            <MenuItem
              label="Choose from Google Drive"
              icon={<img className="w-6" alt="Choose from Google Drive" src={gDrive} />}
              onClick={async () => {
                setFilesMenuOpen(false)
                await LLMBarUtils.handleSelectGoogleDriveFiles()
              }}
              variant={MenuItemVariant.regular}
            />
            <MenuItem
              label="Choose a file"
              icon={<img className="w-6" alt="Choose a file" src={StartWithFilesButton} />}
              onClick={async () => {
                setFilesMenuOpen(false)
                await LLMBarUtils.handleSelectLocalFiles(false)
              }}
              variant={MenuItemVariant.regular}
            />
            <MenuItem
              label="Choose a folder"
              icon={<img className="w-6" alt="Choose a folder" src={StartWithFolderButton} />}
              onClick={async () => {
                setFilesMenuOpen(false)
                await LLMBarUtils.handleSelectLocalFiles(true)
              }}
              variant={MenuItemVariant.regular}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default KnapsackLMBar
