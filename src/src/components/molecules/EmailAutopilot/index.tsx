import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import CircularProgress from '@mui/material/CircularProgress'
import { ConnectionKeys } from 'src/api/connections'
import { AutopilotActions, EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'
import { DisplayEmail, IFeed } from 'src/hooks/feed/useFeed'
import { HAS_SHOWN_EA_INFO_MODAL, KNLocalStorage } from 'src/utils/KNLocalStorage'

import { Typography } from 'src/components/atoms/typography'
import { Dialog } from 'src/components/molecules/Dialog'

import EmailAutopilotSettings from '../EmailAutopilotSettings'
import EmailDraftCard from '../EmailDraftCard'

interface EmailAutopilotProps {
  feed: IFeed
  profileProvider?: string
  userEmail: string
  userName: string
  showSettings: boolean
  setShowSettings: (show: boolean) => void
}

type VisibleEmails = {
  emailUuid: string
  accountEmail: string
  emailKey: string
  index: number
}

const emailActionKey = (emailUid: string, accountEmail: string) =>
  `${accountEmail.trim().toLowerCase()}::${emailUid}`
export const EmailAutopilot = ({
  feed,
  profileProvider,
  userEmail,
  userName,
  showSettings,
  setShowSettings,
}: EmailAutopilotProps) => {
  const [visibleEmailIds, setVisibleEmailIds] = useState<VisibleEmails[]>([])
  const [selectedEmail, setSelectedEmail] = useState<VisibleEmails>({
    emailUuid: '',
    accountEmail: '',
    emailKey: '',
    index: 0,
  })
  const [generatingDraftKey, setGeneratingDraftKey] = useState<string>('')
  const [sendingReplyKey, setSendingReplyKey] = useState<string>('')
  const [removingEmailKey, setRemovingEmailKey] = useState<string>('')
  const [isEditorActive, setIsEditorActive] = useState(false)
  const [showEAInfoModal, setShowEAInfoModal] = useState(false)

  const emailRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const observer = useRef<IntersectionObserver | null>(null)

  const selectedCategory = useMemo(
    () => feed.selectedEmailCategory || EmailImportance.IMPORTANT,
    [feed.selectedEmailCategory],
  ) as EmailImportance

  useEffect(() => {
    const checkModalStatus = async () => {
      const hasShownEAInfoModal = await KNLocalStorage.getItem(HAS_SHOWN_EA_INFO_MODAL)

      if (hasShownEAInfoModal !== true) {
        setShowEAInfoModal(true)
      }
    }

    checkModalStatus()
  }, [])

  const emailsCategory = useMemo(() => {
    const uniqueEmailIds = new Set()

    const filterUniqueEmails = (emails: DisplayEmail[] | undefined) => {
      if (!emails) return []
      return emails.filter(email => {
        const key = emailActionKey(email.message.emailUid, email.message.accountEmail || userEmail)
        if (uniqueEmailIds.has(key)) {
          return false
        }
        if (!email.wasIgnored && !email.wasReplySent && email.message.body) {
          uniqueEmailIds.add(key)
        }
        return !email.wasIgnored && !email.wasReplySent && email.message.body
      })
    }

    const primaryEmails = filterUniqueEmails(feed?.classifiedEmails?.[selectedCategory])

    if (selectedCategory === EmailImportance.IMPORTANT_NO_RESPONSE) {
      const informationalEmails = filterUniqueEmails(
        feed?.classifiedEmails?.[EmailImportance.INFORMATIONAL],
      )
      return [...primaryEmails, ...informationalEmails]
    }

    if (selectedCategory === EmailImportance.MARKETING) {
      const unimportantEmails = filterUniqueEmails(
        feed?.classifiedEmails?.[EmailImportance.UNIMPORTANT],
      )
      return [...primaryEmails, ...unimportantEmails]
    }
    return primaryEmails
  }, [feed.feedContent, feed.classifiedEmails, selectedCategory])

  const actions = useMemo(() => {
    const actions = feed.classificationActions[selectedCategory]
    return (
      actions || {
        leftAction: AutopilotActions.MARK_AS_READ,
        rightAction: AutopilotActions.SEND_REPLY,
      }
    )
  }, [feed.classificationActions, selectedCategory])

  const updateAction = useCallback(
    (actionSide: 'LEFT' | 'RIGHT', action: AutopilotActions) => {
      feed.updateClassificationActions(selectedCategory, actionSide, action)
    },
    [feed.updateClassificationActions, selectedCategory],
  )

  useEffect(() => {
    if (emailsCategory && emailsCategory.length > 0) {
      const first = emailsCategory[0].message
      const accountEmail = first.accountEmail || userEmail
      const emailKey = emailActionKey(first.emailUid, accountEmail)
      setSelectedEmail({ emailUuid: first.emailUid, accountEmail, emailKey, index: 0 })
      scrollToSelectedEmail(emailKey)
    }
  }, [selectedCategory, userEmail])

  const scrollToSelectedEmail = useCallback((emailKey?: string) => {
    let timeoutScroll = undefined
    if (emailKey && emailRefs.current[emailKey]) {
      timeoutScroll = setTimeout(() => {
        emailRefs.current[emailKey]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 200)
    }

    return () => {
      if (timeoutScroll) clearTimeout(timeoutScroll)
    }
  }, [])

  const arrowRightHandler = useCallback(async () => {
    if (emailsCategory && emailsCategory.length > 0 && selectedEmail) {
      const currentEmailIndex = selectedEmail.index
      const email = emailsCategory[currentEmailIndex]
      const accountEmail = email.message.accountEmail || userEmail
      const emailKey = emailActionKey(email.message.emailUid, accountEmail)
      if (sendingReplyKey != emailKey) {
        if (!email.draftedReply) {
          setGeneratingDraftKey(emailKey)
          return
        }
        setSendingReplyKey(emailKey)
      }
    }
  }, [emailsCategory, selectedEmail, sendingReplyKey, userEmail])

  const navigateEmails = useCallback(
    (direction: 'next' | 'previous') => {
      const accumulatorValue = direction == 'next' ? 1 : -1
      const nextItemIndex = selectedEmail.index + accumulatorValue
      if (emailsCategory && nextItemIndex >= 0 && nextItemIndex < emailsCategory.length) {
        const next = emailsCategory[nextItemIndex].message
        const accountEmail = next.accountEmail || userEmail
        const emailKey = emailActionKey(next.emailUid, accountEmail)
        scrollToSelectedEmail(emailKey)
        setSelectedEmail({
          emailUuid: next.emailUid,
          accountEmail,
          emailKey,
          index: nextItemIndex,
        })
      }
    },
    [emailsCategory, selectedEmail, userEmail],
  )

  const handleEmailActionTaken = useCallback(
    (
      actionTaken: AutopilotActions,
      emailUid: string,
      draftReply?: string,
      accountEmail?: string,
    ) => {
      if (
        actionTaken === AutopilotActions.MARK_AS_READ ||
        actionTaken === AutopilotActions.DELETE ||
        actionTaken === AutopilotActions.ARCHIVE
      ) {
        const actionKey = emailActionKey(emailUid, accountEmail || userEmail)
        setRemovingEmailKey(actionKey)
        setTimeout(() => {
          feed.takeEmailAction(
            emailUid,
            actionTaken,
            profileProvider as ConnectionKeys.GOOGLE_PROFILE | ConnectionKeys.MICROSOFT_PROFILE,
            undefined,
            accountEmail,
          )
          setRemovingEmailKey('')
        }, 300)
      } else if (
        actionTaken === AutopilotActions.SEND_REPLY ||
        actionTaken === AutopilotActions.REPLY_ARCHIVE ||
        actionTaken === AutopilotActions.REPLY_DELETE ||
        actionTaken === AutopilotActions.GENERATE_DRAFT_REPLY
      ) {
        feed.takeEmailAction(
          emailUid,
          actionTaken,
          profileProvider as ConnectionKeys.GOOGLE_PROFILE | ConnectionKeys.MICROSOFT_PROFILE,
          draftReply,
          accountEmail,
        )
      }
    },
    [feed.takeEmailAction, profileProvider, userEmail],
  )

  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      const currentItem = feed.currentFeedItem()
      if (currentItem && currentItem.title === 'Email Autopilot' && feed.loggedEmailAutopilot) {
        if (!isEditorActive) {
          if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault()

            if (event.key === 'ArrowDown') {
              navigateEmails('next')
            } else if (event.key === 'ArrowUp') {
              navigateEmails('previous')
            }
          }

          if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault()

            if (event.key === 'ArrowLeft') {
              handleEmailActionTaken(
                actions.leftAction,
                selectedEmail.emailUuid,
                undefined,
                selectedEmail.accountEmail,
              )
            } else if (event.key === 'ArrowRight') {
              arrowRightHandler()
            }
          }
        }
      }
    },
    [
      feed.currentFeedItem,
      feed.loggedEmailAutopilot,
      selectedEmail,
      emailsCategory,
      isEditorActive,
      actions,
      arrowRightHandler,
      navigateEmails,
      handleEmailActionTaken,
    ],
  )

  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler)
    return () => window.removeEventListener('keydown', keyDownHandler)
  }, [keyDownHandler])

  useEffect(() => {
    // handle the change of the selected email when scrolling
    const updateTimeout = setTimeout(() => {
      if (visibleEmailIds.length > 0 && selectedEmail.emailUuid === '') {
        setSelectedEmail(visibleEmailIds[0])
        return
      }

      if (
        selectedEmail.emailUuid &&
        !visibleEmailIds?.map(email => email.emailKey).includes(selectedEmail.emailKey) &&
        visibleEmailIds.length > 0
      ) {
        setSelectedEmail(visibleEmailIds[0])
      } else {
        if (emailsCategory) {
          const index = emailsCategory.findIndex(
            email =>
              emailActionKey(email.message.emailUid, email.message.accountEmail || userEmail) ===
              selectedEmail.emailKey,
          )
          if (index >= 0) {
            const match = emailsCategory[index].message
            const accountEmail = match.accountEmail || userEmail
            setSelectedEmail({
              emailUuid: match.emailUid,
              accountEmail,
              emailKey: emailActionKey(match.emailUid, accountEmail),
              index,
            })
          }
        }
      }
    }, 200)

    return () => clearTimeout(updateTimeout)
  }, [visibleEmailIds])

  const updateVisibleEmails = useCallback((entries: IntersectionObserverEntry[]) => {
    setVisibleEmailIds(prevVisible => {
      const newVisible = [...prevVisible]
      entries.forEach(entry => {
        const emailId = entry.target.getAttribute('data-email-id')
        const accountEmail = entry.target.getAttribute('data-account-email')
        const emailKey = entry.target.getAttribute('data-email-key')
        const index = entry.target.getAttribute('index-id')
        if (emailId && accountEmail && emailKey && index) {
          const existingIndex = newVisible.findIndex(item => item.emailKey === emailKey)
          if (entry.isIntersecting) {
            if (existingIndex === -1) {
              newVisible.push({
                emailUuid: emailId,
                accountEmail,
                emailKey,
                index: parseInt(index),
              })
            }
          } else {
            if (existingIndex !== -1) {
              newVisible.splice(existingIndex, 1)
            }
          }
        }
      })
      return newVisible
    })
  }, [])

  useEffect(() => {
    observer.current = new IntersectionObserver(updateVisibleEmails, {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    })

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [updateVisibleEmails])

  const getLoadingText = (status: string) => {
    if (status === 'fetching-emails') {
      return 'Engaging autopilot...'
    } else if (status === 'classifying-emails') {
      return 'Analyzing emails...'
    } else if (status === 'sync-email') {
      return 'Syncing emails...'
    }
  }

  const isSelected = useCallback(
    (emailKey: string) => {
      if (selectedEmail && selectedEmail.emailKey) return emailKey == selectedEmail.emailKey

      return false
    },
    [selectedEmail],
  )

  const handleEAInfoModalClose = () => {
    KNLocalStorage.setItem(HAS_SHOWN_EA_INFO_MODAL, true)
    setShowEAInfoModal(false)
  }

  return (
    <div className="flex EmailAutopilot">
      {showEAInfoModal && (
        <Dialog
          onClose={handleEAInfoModalClose}
          isOpen={showEAInfoModal}
          dismissable={true}
          className="flex items-center justify-center"
        >
          <div className="bg-white py-6 rounded-lg font-Lora font-normal text-black text-2xl text-center content-center">
            <img className="mx-auto" src="assets/images/EAInfoModalImage.png" />
            <div className="mx-auto mt-6 w-[20em]">
              Use the left and right arrow keys to quickly Send or Dismiss emails
            </div>
          </div>
        </Dialog>
      )}
      <div className="flex-1 p-4 h-full overflow-y-auto relative">
        {/* Settings Sidebar */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="bg-ks-warm-grey-200 bg-opacity-80 absolute inset-0"
              onClick={() => setShowSettings(false)}
            ></div>
            <div className="relative z-10 w-full max-w-sm h-full overflow-auto">
              <EmailAutopilotSettings onClose={() => setShowSettings(false)} />
            </div>
          </div>
        )}
        {(feed.emailAutopilotStatus.status === 'fetching-emails' ||
          feed.emailAutopilotStatus.status === 'classifying-emails' ||
          feed.emailAutopilotStatus.status === 'sync-email') &&
        (!emailsCategory || emailsCategory.length === 0) ? (
          <div className="flex flex-col items-center justify-center mb-8">
            <CircularProgress size="3rem" sx={{ color: '#C14841' }} />
            <Typography className="mt-4 text-gray-500">
              {getLoadingText(feed.emailAutopilotStatus.status)}
            </Typography>
          </div>
        ) : (
          selectedCategory &&
          (!emailsCategory || emailsCategory.length === 0) && (
            <div className="text-center text-gray-500 mt-4">You're all caught up!</div>
          )
        )}
        <div className="space-y-4 pb-28">
          {emailsCategory &&
            emailsCategory.map((email, index) => {
              const accountEmail = email.message.accountEmail || userEmail
              const emailKey = emailActionKey(email.message.emailUid, accountEmail)
              return (
                <div
                  key={`${emailKey}-${email.message.documentId}-${index}`}
                  className={`transition-opacity duration-1000 ease-out ${
                    removingEmailKey === emailKey ? 'opacity-0' : 'opacity-100'
                  }`}
                  index-id={index}
                  data-email-id={email.message.emailUid}
                  data-account-email={accountEmail}
                  data-email-key={emailKey}
                  ref={el => {
                    if (el && observer.current) {
                      observer.current.observe(el)
                    }
                    emailRefs.current[emailKey] = el
                  }}
                >
                  <EmailDraftCard
                    emailAutopilot={feed.emailAutopilot}
                    email={email}
                    onActionCallback={handleEmailActionTaken}
                    userEmail={userEmail}
                    userName={userName}
                    profileProvider={profileProvider ? profileProvider : ''}
                    selected={isSelected(emailKey)}
                    isGeneratingDraft={generatingDraftKey === emailKey}
                    shouldSendReply={sendingReplyKey === emailKey}
                    actions={actions}
                    updateAction={updateAction}
                    setIsEditorActive={setIsEditorActive}
                  />
                </div>
              )
            })}
        </div>
        {!selectedCategory && (
          <div className="text-center text-gray-500 mt-4">Select a category to view emails</div>
        )}
      </div>
    </div>
  )
}
