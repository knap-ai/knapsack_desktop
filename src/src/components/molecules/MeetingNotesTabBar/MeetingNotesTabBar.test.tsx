// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { IThread } from 'src/api/threads'
import { ThreadType } from 'src/api/threads'
import type { IFeed } from 'src/hooks/feed/useFeed'
import MeetingNotesTabBar from './index'
const thread:IThread={id:44,date:new Date(),hideFollowUp:false,messages:[],threadType:ThreadType.MEETING_NOTES,recorded:false}
const props={thread,feed:{} as IFeed,templateLabel:'Internal meeting',hasActionItems:false,onOpenTemplatesClick:async()=>{},canChangeTemplate:false,onViewTranscriptClick:vi.fn(),onTasksButtonClick:vi.fn(),onCopyClick:vi.fn(),isEditing:false,onEditClick:vi.fn()}
afterEach(()=>{cleanup();vi.clearAllMocks()})
it('opens the exact transcript when durable metadata is available despite stale thread flags',()=>{
 render(<MeetingNotesTabBar {...props} transcriptAvailable />)
 const button=screen.getByRole('button',{name:'Transcript'}) as HTMLButtonElement
 expect(button.disabled).toBe(false);fireEvent.click(button)
 expect(props.onViewTranscriptClick).toHaveBeenCalledWith(44)
})
it('keeps missing transcript availability visible and never invokes a disabled action',()=>{
 render(<MeetingNotesTabBar {...props} transcriptAvailable={false}/>)
 const button=screen.getByRole('button',{name:'Transcript'}) as HTMLButtonElement
 expect(button.disabled).toBe(true)
 expect(screen.getByTitle('No saved transcript is available for this meeting.')).toBeTruthy()
 fireEvent.click(button);expect(props.onViewTranscriptClick).not.toHaveBeenCalled()
})
