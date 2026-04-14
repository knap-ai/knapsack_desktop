import React from 'react'

import { IFeed } from 'src/hooks/feed/useFeed'
import { IThread } from 'src/api/threads'
import EditDisplayToggleButton from 'src/components/molecules/EditDisplayToggleButton'
import CopyButton from 'src/components/molecules/CopyButton'
import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'

interface MeetingNotesTabBarProps {
  thread: IThread
  feedItemId?: number,
  feed: IFeed,
  templateLabel: string
  hasActionItems: boolean
  onOpenTemplatesClick: (thread: IThread) => Promise<void>
  canChangeTemplate: boolean
  onViewTranscriptClick: (threadId: number) => void
  onTasksButtonClick: () => void
  onInsightsClick?: () => void
  onCopyClick: () => void
  isEditing: boolean
  onEditClick: () => void
}

const MeetingNotesTabBar: React.FC<MeetingNotesTabBarProps> = ({
  thread,
  templateLabel,
  hasActionItems,
  onOpenTemplatesClick,
  onViewTranscriptClick,
  onTasksButtonClick,
  onInsightsClick,
  onCopyClick,
  canChangeTemplate,
  onEditClick,
  isEditing,
}) => {

  return (
    <div className="flex flex-row gap-x-6 items-center">
      <Button
        label={templateLabel}
        variant={ButtonVariant.regular}
        size={ButtonSize.medium}
        icon={<img className="mr-1.5" src="/assets/images/icons/MeetingTemplates.svg" />}
        className="h-fit py-0 px-0 bg-transparent text-xxs uppercase font-semibold hover:underline font-InterTight tracking-[0.08em] text-ks-warm-grey-800 transition-all duration-150 rounded-sm"
        onClick={() => {
          if (canChangeTemplate) {
            onOpenTemplatesClick(thread)
          }
        }}
      />
      {thread.savedTranscript && (
        <Button
          label="Transcript"
          variant={ButtonVariant.regular}
          size={ButtonSize.medium}
          icon={<img className="mr-1.5" src="/assets/images/icons/TranscriptIcon.svg" />}
          className="h-fit py-0 px-0 bg-transparent text-xxs uppercase font-semibold hover:underline font-InterTight tracking-[0.08em] text-ks-warm-grey-800 transition-all duration-150 rounded-sm"
          onClick={() => onViewTranscriptClick(thread.id)}
        />
      )}
      {hasActionItems && (
        <Button
          label="Tasks"
          variant={ButtonVariant.regular}
          size={ButtonSize.medium}
          icon={<img className="mr-1.5" src="/assets/images/icons/TasksIcon.svg" />}
          className="h-fit py-0 px-0 bg-transparent text-xxs uppercase font-semibold hover:underline font-InterTight tracking-[0.08em] text-ks-warm-grey-800 transition-all duration-150 rounded-sm"
          onClick={onTasksButtonClick}
        />
      )}
      {thread.recorded && onInsightsClick && (
        <Button
          label="Insights"
          variant={ButtonVariant.regular}
          size={ButtonSize.medium}
          icon={
            <svg className="mr-1.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          className="h-fit py-0 px-0 bg-transparent text-xxs uppercase font-semibold hover:underline font-InterTight tracking-[0.08em] text-ks-warm-grey-800 transition-all duration-150 rounded-sm"
          onClick={onInsightsClick}
        />
      )}
      <CopyButton onClick={onCopyClick} />
      <EditDisplayToggleButton isEditing={isEditing} onClick={onEditClick} />
    </div>
  )
}

export default MeetingNotesTabBar
