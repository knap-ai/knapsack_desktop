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
      <CopyButton onClick={onCopyClick} />
      <EditDisplayToggleButton isEditing={isEditing} onClick={onEditClick} />
    </div>
  )
}

export default MeetingNotesTabBar
