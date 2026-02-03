import { useRef } from 'react'

import { css } from '@emotion/react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import dayjs from 'dayjs'
import LoadingIcon from 'src/components/atoms/loading-icon'
import { IThread } from 'src/api/threads'

import TextRenderer from 'src/components/TextRenderer'

import Thumbs from '../Thumbs/indext'

interface ThreadCardProps {
  thread: IThread
  user_img?: string
  handleVote?: (messageId: number, vote: 1 | -1) => void
  copyToClipboard?: (text: string) => void
  votes?: Record<number, number>
}

const ThreadCard = ({
  thread,
  user_img,
  handleVote,
  copyToClipboard,
  votes,
}: ThreadCardProps) => {
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
  const formattedTime =
    'Ran at ' +
    dayjs(thread.date).format('h:mm A').toString() +
    ' on ' +
    dayjs(thread.date).format('MMM DD').toString()
  return (
    <div className="TightShadow w-full max-w-[45rem] mx-auto rounded-[10px] bg-white flex flex-col justify-start items-start gap-6 p-4 mt-6 mb-4">
      <div className="w-full ml-auto mr-auto flex-col justify-start items-start gap-4 inline-flex">
        <div className="self-stretch justify-between items-center inline-flex">
          <div className="flex-col mb-auto items-start inline-flex">
            <div className="text-ks-neutral-700 text-xxs font-semibold uppercase text-xs leading-[10px] tracking-thread-title mb-1 [font-family:var(--font-tight)]">
              {thread.title}
            </div>
            <div className="text-zinc-800 text-xl font-Lora font-bold leading-[18px]">
              {thread.subtitle}
            </div>
          </div>
          <div className="my-auto">
            <div className="text-right text-zinc-400 text-xs leading-4">{formattedTime}</div>
          </div>
        </div>
      </div>
      <div className="min-w-20 w-full flex " css={cssChatMessageContainer}>
        <div className="w-full ml-auto mr-auto">
          <div className="KNChatMessageList flex flex-col gap-y-6">
            {thread.messages.map((message, index) => (
              <div key={index} className="items-end">
                {message.user_type == 'bot' && (
                  <div
                    key={index}
                    ref={el => (botMessageRefs.current[index] = el)}
                    className={`KNChatMessage flex text-left`}
                  >
                    <div className="KNChatMessageRight">
                      <div className="flex gap-4">
                        <div className="KNChatMessageContent text-body-text text-kn-font-regular">
                          <TextRenderer text={message.text}></TextRenderer>
                          <div className="flex flex-row items-center justify-start mt-2.5">
                            {!!copyToClipboard && (
                              <ContentCopyOutlinedIcon
                                className="cursor-pointer mr-2"
                                onClick={() => copyToClipboard(message.text)}
                                sx={{ fontSize: 16 }}
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
                        <div className="KNChatMessageContent rounded-[10px] p-[14px] flex items-center justify-center mx-auto my-auto text-body-text text-kn-font-regular max-w-xl bg-[#fffffff0] border border-[#efefef]">
                          <TextRenderer text={message.text}></TextRenderer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {thread.isLoading && (
              <div className="animate-pulse mx-auto mt-8">
                <LoadingIcon className="w-8 h-8 mt-4 ml-6" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default ThreadCard
