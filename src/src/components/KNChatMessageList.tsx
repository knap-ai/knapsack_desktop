import React, { useEffect, useMemo, useRef } from 'react'

import { css } from '@emotion/react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import { Facebook } from 'react-content-loader'
import ReactMarkdown from 'react-markdown'
import KNUtils from 'src/utils/KNStringUtils'

import TextRenderer from './TextRenderer'

import './KNChatMessageList.scss'

import { KNChatMessage } from 'src/api/threads'

import Thumbs from './molecules/Thumbs/indext'

interface KNChatMessageListProps {
  dataSource: KNChatMessage[]
  isChatLoading: boolean
  searchItems: Record<number, any>
  // onSearchItemClick: (searchItem: KNSearchItem) => void;
  semanticSearchResponse: any[]
  webSearchResponse: any
  onRemoveSource: (index: number, type: string) => void
  currentTab: string | undefined
  user_img?: string
  handleVote?: (messageId: number, vote: 1 | -1) => void
  copyToClipboard?: (text: string) => void
  votes?: Record<number, number>
}

export const KNChatMessageList: React.FC<KNChatMessageListProps> = ({
  dataSource,
  isChatLoading,
  searchItems,
  semanticSearchResponse,
  webSearchResponse,
  onRemoveSource,
  currentTab,
  user_img,
  handleVote,
  copyToClipboard,
  votes,
}) => {
  useEffect(() => {
    // console.log(animationData);
    fetch('/assets/lottie/chat-loader.json')
      .then(response => response.json())
      // .then(_ => {
      //   //setAnimationData(jsonData);
      // })
      .catch(error => console.error('Error loading animationData: ', error))

    // console.log('KNChatMessageList: Component has mounted or updated');
    return () => {
      // console.log('KNChatMessageList: Component will unmount');
    }
  }, [dataSource, isChatLoading])

  const botMessageRefs = useRef<(HTMLDivElement | null)[]>([])
  const userMessageRefs = useRef<(HTMLDivElement | null)[]>([])

  const cssChatMessageContainer = css({
    '.KNChatMessageList': {
      color: '#EFEBE5',
    },
    '.KNChatMessageUserTypeAvatar': {
      display: 'flex',
      height: '40px',
      width: '40px',
    },
    '.KNChatMessageRight': {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '80px',
    },
    '.KNChatMessageLoader': {
      height: '25px',
      width: '133px',
    },
    '.KNChatMessageInput': {
      backgroundColor: 'rgba(5,5,5,0.0)',
      borderRadius: '7px',
      color: '#EFEBE5',
      fontSize: '18px',
      fontWeight: 400,
      height: '26px',
      width: '280px',
    },
    '.KNChatMessageInput:focus': {
      outline: 'none',
    },
    '.KNChatMessageSendButton': {
      height: '20px',
      margin: '0px 15px 0px 0px',
    },
  })

  const sources = useMemo(() => {
    return [
      ...Object.values(searchItems),
      ...(webSearchResponse?.websearch_docs ?? []),
      ...semanticSearchResponse,
    ]
  }, [searchItems, webSearchResponse, semanticSearchResponse])

  return (
    <div className="KNChatMessageContainer flex px-6 py-6" css={cssChatMessageContainer}>
      <div className="w-full ml-auto mr-auto">
        {currentTab !== 'feed' && (
          <div className="KNChatMessageFilePathsContainer flex flex-col items-center">
            {sources.length > 0 && (
              <div className="w-full">
                <div className="KNChatMessageFilePathsTitle text-left text-kn-font-large text-body-text">
                  Sources
                </div>
              </div>
            )}

            <div className="KNChatMessageFilePaths m-4 flex flex-wrap w-full">
              {webSearchResponse && !webSearchResponse.success && (
                <div className="error font-light font-fkgr mt-4 text-xl text-red-500">
                  {webSearchResponse.error_message
                    ? webSearchResponse.error_message
                    : 'Error processing search, please try again.'}
                </div>
              )}
              <div className="sources">
                <div className="sources-results flex flex-row flex-wrap">
                  {webSearchResponse &&
                    webSearchResponse.success &&
                    webSearchResponse.websearch_docs &&
                    webSearchResponse.websearch_docs.length > 0 &&
                    webSearchResponse.websearch_docs.map((doc: any, i: any) => (
                      <div
                        key={i}
                        className="SourceCard source-result flex flex-col m-1 px-2 py-3 rounded-md w-width-percent-45"
                      >
                        <div className="flex-1 flex flex-row source-result gap-2 max-w-64">
                          <a
                            className="source-link flex-grow max-h-12 pl-1 text-left text-ellipsis overflow-hidden text-sm text-body-text"
                            href={doc.url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {KNUtils.shortenText(doc.title, 53)}
                          </a>
                          <img
                            className="favicon flex cursor-pointer h-5"
                            src="/assets/images/close.svg"
                            onClick={() => onRemoveSource(i, 'web')}
                          />
                        </div>
                        <div className="source-result-bottom text-[#afafaf] flex flex-row font-fkgr items-center mt-2 pl-1 text-xs">
                          <img
                            className="favicon flex h-4"
                            src={KNUtils.getFaviconUrl(doc.url)}
                            onError={e => {
                              ;(e.target as HTMLImageElement).src = '/assets/images/earth-blue.svg'
                            }}
                          />
                          <div className="website flex ml-2 text-soft-gray">
                            {KNUtils.getDomainAsWord(doc.url)}
                          </div>
                          <div className="number flex ml-1">{'• ' + (i + 1)}</div>
                        </div>
                      </div>
                    ))}
                  {searchItems &&
                    Object.entries(searchItems).map(([hash, searchItem], i: any) => (
                      <div
                        key={i}
                        className="SourceCard flex flex-col m-1 px-2 py-3 rounded-md w-width-percent-45"
                      >
                        <div key={hash} className="flex-1 flex flex-row source-result max-w-64 ">
                          <a
                            className="flex-1 source-link flex max-h-12 pl-1 text-left text-ellipsis overflow-hidden text-sm text-body-text"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {searchItem.title && KNUtils.shortenText(searchItem.title, 44)}
                          </a>
                          <img
                            className="favicon flex h-5 cursor-pointer"
                            src="/assets/images/close.svg"
                            onClick={() => onRemoveSource(parseInt(hash), 'search')}
                          />
                        </div>
                        <div className="source-result-bottom text-[#afafaf] flex flex-row font-fkgr items-center mt-2 pl-1 text-xs">
                          <img className="favicon flex h-4" src={'/assets/images/doc-icon.svg'} />
                          <div className="website flex ml-1 text-soft-gray">
                            {searchItem.subtitle && KNUtils.shortenText(searchItem.subtitle, 48)}
                          </div>
                          <div className="number flex ml-1">{'• ' + (i + 1)}</div>
                        </div>
                      </div>
                    ))}

                  {semanticSearchResponse.map((searchItem, i: number) => (
                    <div
                      key={i}
                      className="SourceCard flex flex-col m-1 px-2 py-3 rounded-md w-width-percent-45"
                    >
                      <div className="flex-1 flex flex-row source-result max-w-64 ">
                        <a
                          className="flex-1 source-link flex max-h-12 pl-1 text-left text-ellipsis overflow-hidden text-sm"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {searchItem.title && KNUtils.shortenText(searchItem.title, 44)}
                        </a>
                        <img
                          className="favicon flex h-5 cursor-pointer"
                          src="/assets/images/close.svg"
                          onClick={() => onRemoveSource(i, 'semantic')}
                        />
                      </div>
                      <div className="source-result-bottom text-[#afafaf] flex flex-row font-fkgr items-center mt-2 pl-1 text-xs">
                        <img className="favicon flex h-4" src={'/assets/images/doc-icon.svg'} />
                        <div className="website flex ml-1 text-soft-gray">
                          {searchItem.subtitle && KNUtils.shortenText(searchItem.subtitle, 48)}
                        </div>
                        <div className="number flex ml-1">{'• ' + (i + 1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {webSearchResponse &&
                webSearchResponse.success &&
                webSearchResponse.answer &&
                webSearchResponse.answer.length > 1 && (
                  <div className="answer mt-5">
                    <div className="answer-text break-words font-extralight font-fkgrneue pb-20 text-md text-pp-text-body-text">
                      {<ReactMarkdown>{webSearchResponse.answer}</ReactMarkdown>}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
        <div className="KNChatMessageList flex flex-col gap-y-6">
          {dataSource.map((message, index) => (
            <div key={index} className="items-end">
              {message.user_type == 'bot' && (
                <div
                  key={index}
                  ref={el => (botMessageRefs.current[index] = el)}
                  className={`KNChatMessage flex text-left`}
                >
                  <div className="KNChatMessageRight">
                    <div className="flex gap-4">
                      <div className="KNChatMessageContent rounded-[10px] p-[14px] text-body-text text-kn-font-regular">
                        <TextRenderer text={message.text}></TextRenderer>
                        <div className="flex flex-row items-center justify-start mt-2.5">
                          {!!copyToClipboard && (
                            <ContentCopyOutlinedIcon
                              className="cursor-pointer mr-2"
                              onClick={() => copyToClipboard(message.text)}
                            />
                          )}
                          {!!message.id && !!handleVote && (
                            <Thumbs
                              className="cursor-pointer mr-2"
                              selected={votes?.[message.id] ?? 0}
                              handleVote={(vote: 1 | -1) => handleVote(message.id ?? -1, vote)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {message.user_type == 'user' && message.text && message.text.length > 0 && (
                <div
                  key={index}
                  ref={el => (userMessageRefs.current[index] = el)}
                  className={`content-right KNChatMessage ml-24 flex flex-row-reverse text-left`}
                >
                  <div className="KNChatMessageRight">
                    <div className="flex flex-row-reverse gap-4 items-center">
                      <img
                        className="KNChatMessageUserTypeAvatar rounded-full"
                        src={
                          user_img ? user_img : '/assets/images/chat/no-pic-user-avatar-icon.png'
                        }
                      />
                      <div className="KNChatMessageContent rounded-[10px] p-[14px] text-body-text content-center text-kn-font-regular max-w-xl bg-[#fffffff0] border border-[#efefef]">
                        <TextRenderer text={message.text}></TextRenderer>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isChatLoading && (
            <div className="results-loader animate-pulse ml-1 mt-8 w-3/4">
              <Facebook backgroundColor={'#808080'} animate={true} speed={2} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
