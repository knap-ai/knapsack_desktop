import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { AutopilotActions, IEmailAutopilot } from 'src/hooks/dataSources/useEmailAutopilot'
import { DisplayEmail, EmailAction } from 'src/hooks/feed/useFeed'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import KNDateUtils from 'src/utils/KNDateUtils'

import GenerateDraftButton from 'src/components/molecules/GenerateDraftButton'
import IgnoreEmailButton from 'src/components/molecules/IgnoreEmailButton'
import SendEmailButton from 'src/components/molecules/SendEmailButton'
import TakeActionButton from 'src/components/molecules/TakeActionButton'
import { decodeEmailSubject } from 'src/utils/emails'

interface EmailDraftCardProps {
  emailAutopilot: IEmailAutopilot
  email: DisplayEmail
  onActionCallback: (
    actionTaken: AutopilotActions,
    emailUid: string,
    draftReply?: string,
    accountEmail?: string,
  ) => void
  userEmail: string
  userName: string
  profileProvider: string
  selected: boolean
  isGeneratingDraft: boolean
  shouldSendReply: boolean
  actions: EmailAction
  updateAction: (actionSide: 'LEFT' | 'RIGHT', action: AutopilotActions) => void
  setIsEditorActive: (isActive: boolean) => void
  onCcChange?: (cc: string[]) => void
}

const EmailDraftCard = ({
  emailAutopilot,
  email,
  onActionCallback,
  userEmail,
  userName,
  profileProvider,
  selected,
  isGeneratingDraft,
  shouldSendReply,
  actions,
  updateAction,
  setIsEditorActive,
  onCcChange,
}: EmailDraftCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDraftEdited, setIsDraftEdited] = useState(false)
  const [ccList, setCcList] = useState<string[]>([])
  const [ccInput, setCcInput] = useState('')
  const [showCcInput, setShowCcInput] = useState(false)
  const ccInputRef = useRef<HTMLInputElement>(null)
  const subtitle = decodeEmailSubject(email.message.subject)
  const emailUid = email.message.emailUid
  const senderAccountEmail = email.message.accountEmail || userEmail
  const emailBody = email.message.body
  const emailSummary: string[] | undefined = email.classification?.summary
  const emailDraftReply = email.draftedReply ? email.draftedReply : ''

  // Initialize ccList from email data
  useEffect(() => {
    const cc = email.message.cc?.filter(c => c.trim() !== '') || []
    setCcList(cc)
    setShowCcInput(cc.length > 0)
    setCcInput('')
  }, [email.message.emailUid])

  const handleRemoveCc = useCallback((index: number) => {
    setCcList(prev => {
      const updated = prev.filter((_, i) => i !== index)
      onCcChange?.(updated)
      return updated
    })
  }, [onCcChange])

  const handleAddCc = useCallback((value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return
    if (ccList.includes(trimmed)) return
    setCcList(prev => {
      const updated = [...prev, trimmed]
      onCcChange?.(updated)
      return updated
    })
    setCcInput('')
  }, [ccList, onCcChange])

  const handleCcKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      handleAddCc(ccInput)
    } else if (e.key === 'Backspace' && ccInput === '' && ccList.length > 0) {
      handleRemoveCc(ccList.length - 1)
    }
  }, [ccInput, ccList, handleAddCc, handleRemoveCc])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder: '',
      }),
    ],
    content: emailDraftReply?.replace(/\n/g, '<br>'),
    editable: true,
    onUpdate: ({ editor }) => {
      if (!isDraftEdited && editor.getText() !== emailDraftReply) {
        setIsDraftEdited(true)

        KNAnalytics.trackEvent('Email Edited', {
          edited_by_user: true,
        })
      }
    },
    onFocus: () => {
      setIsEditorActive(true)
    },
    onBlur: () => {
      setIsEditorActive(false)
    },
  })

  useEffect(() => {
    if (editor && emailDraftReply && !isDraftEdited) {
      const newContent = emailDraftReply.replace(/\n/g, '<br>')
      if (editor.getText() !== emailDraftReply) {
        editor.commands.setContent(newContent)
      }
    }
  }, [emailDraftReply])

  const recipientList = Array.isArray(email.message.recipients)
    ? email.message.recipients.flatMap(recipient =>
        typeof recipient === 'string' && recipient.includes(',')
          ? recipient.split(',').map(r => r.trim())
          : recipient,
      )
    : typeof email.message.recipients === 'string'
      ? (email.message.recipients as string).split(',').map(r => r.trim())
      : Array.isArray(email.message.recipients)
        ? email.message.recipients
        : []

  const recipients = [email.message.sender, ...recipientList]
    .filter(recipient => !recipient.includes(userEmail))
    .join(', ')

  return (
    <div
      className={`TightShadow text-left w-full max-w-[45rem] mx-auto flex flex-col rounded-[10px] bg-white p-4 gap-y-4 mb-4 ${selected ? 'border-2 border-ks-red-300' : ''}`}
    >
      <div className="flex flex-col items-start justify-between">
        <div className="flex flex-row w-full justify-between">
          <div className="flex-1 text-zinc-900 font-Lora text-xl font-semibold leading-6">{subtitle}</div>
          <div className="min-w-fit font-InterTight text-black font-normal text-sm pl-2">
            {KNDateUtils.formatFriendlyDate(email.message.date)}
          </div>
        </div>
      </div>

      <div
        id="email-summary-content"
        className="overflow-hidden transition-[max-height,opacity] duration-300 max-h-[1000px]"
      >
        <div className="whitespace-pre-wrap">
          <div className="text-ks-neutral-700 text-xs leading-relaxed my-0">
            {emailSummary && (
              <>
                <div className="text-sm leading-5 text-black font-Inter">
                  {emailSummary.join(' ')}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-left">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-ks-neutral-500 hover:text-ks-neutral-700 transition-colors"
          aria-expanded={isExpanded}
          aria-controls="email-summary-content"
        >
          <svg
            className={`w-2.5 color-ks-warm-grey-800 transform mr-1 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <div className="text-sm font-Inter font-medium leading-5 text-black">
            {isExpanded ? 'Hide' : 'See'} email details
          </div>
        </button>

        <div
          id="email-body"
          className={`border-[1px] rounded-lg overflow-y-auto transition-all duration-300 ${
            isExpanded && emailBody ? 'max-h-[40em] my-4 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mb-4 whitespace-pre-wrap">
            <div className="mb-4 py-1 px-2 border-b-[1px]">
              <div className="font-InterTight font-medium text-xs text-ks-warm-grey-800">
                {'From: ' + email.message.sender}
              </div>
              <div className="font-InterTight font-medium text-xs text-ks-warm-grey-800 my-0">
                {'To: ' + email.message.recipients.join(', ')}
              </div>
              {email.message.cc &&
                email.message.cc.length > 0 &&
                !(email.message.cc.length === 1 && email.message.cc[0] === '') && (
                  <div className="font-InterTight font-medium text-xs text-ks-warm-grey-800 my-0 ml-0">
                    {'CC: ' + email.message.cc.join(', ')}
                  </div>
                )}
            </div>
            {emailBody?.includes('<') && emailBody?.includes('>') ? (
              <div
                className="text-ks-neutral-700 px-2 text-sm leading-relaxed my-0"
                dangerouslySetInnerHTML={{ __html: emailBody }}
              />
            ) : (
              <div className="text-ks-neutral-700 px-2 text-sm leading-relaxed my-0">
                {emailBody?.split('\r\n').map((line, index) => (
                  <Fragment key={index}>
                    {line}
                    <br />
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-ks-neutral-700 tracking-widest font-semibold font-Lora text-xs -mb-2.5">
        SUGGESTED RESPONSE:
      </div>

      <div className="border-[1px] mb-4 rounded-lg relative">
        <div className="border-0 mx-3">
          <div className="flex flex-wrap gap-1 rounded-md">
            <div className="gap-1 py-2 w-full">
              <div className="gap-x-4 text-ks-warm-grey-800 text-xs mt-1">
                <div>To:&nbsp;&nbsp; {recipients}</div>
                {showCcInput && (
                  <div className="flex items-start gap-1 mt-2">
                    <span className="text-ks-warm-grey-800 text-xs pt-0.5 shrink-0">CC:</span>
                    <div
                      className="flex flex-wrap items-center gap-1 flex-1 min-h-[24px] cursor-text"
                      onClick={() => ccInputRef.current?.focus()}
                    >
                      {ccList.map((cc, index) => (
                        <span
                          key={`${cc}-${index}`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-ks-warm-grey-100 text-ks-warm-grey-800 text-xs"
                        >
                          {cc}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveCc(index)
                            }}
                            className="ml-0.5 text-ks-warm-grey-400 hover:text-ks-red-500 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                      <input
                        ref={ccInputRef}
                        type="text"
                        value={ccInput}
                        onChange={(e) => setCcInput(e.target.value)}
                        onKeyDown={handleCcKeyDown}
                        onBlur={() => handleAddCc(ccInput)}
                        placeholder={ccList.length === 0 ? 'Add CC...' : ''}
                        className="outline-none border-none bg-transparent text-xs text-ks-warm-grey-800 min-w-[60px] flex-1 py-0.5"
                      />
                    </div>
                  </div>
                )}
                {!showCcInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCcInput(true)
                      setTimeout(() => ccInputRef.current?.focus(), 0)
                    }}
                    className="text-ks-warm-grey-400 hover:text-ks-warm-grey-600 text-xs mt-1.5 transition-colors"
                  >
                    + Add CC
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-left text-black text-sm text-wrap px-3 pt-2 pb-2 min-h-[25px] max-h-[300px] overflow-y-auto">
          <EditorContent
            editor={editor}
            className="max-w-none [&_*]:focus:outline-none focus:ring-0 [&_.ProseMirror]:text-black"
          />
        </div>

        <div className="ml-3 py-2">
          <GenerateDraftButton
            emailAutopilot={emailAutopilot}
            email={email.message}
            isRegenerate={editor?.getText() !== ''}
            userEmail={senderAccountEmail}
            userName={userName}
            onSuccess={(draft: string) => {
              const newContent = draft.replace(/\n/g, '<br>')
              editor?.commands.setContent(newContent)
              setIsDraftEdited(false)
              onActionCallback(
                AutopilotActions.GENERATE_DRAFT_REPLY,
                emailUid,
                newContent,
                senderAccountEmail,
              )
            }}
            onError={error => {
              console.error('Failed to generate draft:', error)
            }}
            isGeneratingDraft={isGeneratingDraft}
          />
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <IgnoreEmailButton
          onSuccess={() => {
            KNAnalytics.trackEvent('email_ignored', {
              email_ignored: true,
            })
            onActionCallback(actions.leftAction, emailUid, undefined, senderAccountEmail)
          }}
          onError={error => {
            console.error('Failed to ignore:', error)
          }}
          action={actions.leftAction}
          updateAction={updateAction}
        />
        {email.classification?.classification === 'IMPORTANT_NEEDS_RESPONSE' && (
          <TakeActionButton
            email={email}
            label={email.classification?.actionRequired || undefined}
          />
        )}
        <SendEmailButton
          previousEmail={email}
          userEmail={userEmail}
          accountEmail={senderAccountEmail}
          userName={userName}
          body={editor?.getText() || ''}
          threadId={email.message.threadId}
          emailUid={emailUid}
          onSuccess={() => {
            KNAnalytics.trackEvent('email_reply_sent', {
              email_sent: true,
              draft_was_edited: isDraftEdited,
            })
            onActionCallback(actions.rightAction, emailUid, undefined, senderAccountEmail)
          }}
          onError={error => {
            logError(new Error('Failed to send email'), {
              additionalInfo: '',
              error: error.message,
            })
          }}
          profileProvider={profileProvider}
          shouldSend={shouldSendReply}
          action={actions.rightAction}
          updateAction={updateAction}
        />
      </div>
    </div>
  )
}

export default React.memo(EmailDraftCard)
