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
it('keeps Edit and Done in the same reserved slot when secondary actions change',()=>{
 const edit=vi.fn()
 const view=render(<MeetingNotesTabBar {...props} transcriptAvailable onEditClick={edit}/>)
 const initial=screen.getByRole('button',{name:'Edit'}),slot=initial.closest('.meeting-notes-actions__edit')
 expect(slot).toBeTruthy()
 expect(slot?.parentElement?.classList.contains('meeting-notes-actions--fixed-edit')).toBe(true)
 fireEvent.click(initial);expect(edit).toHaveBeenCalledTimes(1)
 view.rerender(<MeetingNotesTabBar {...props} thread={{...thread,recorded:true}} hasActionItems onInsightsClick={vi.fn()} onShareClick={vi.fn()} transcriptAvailable isEditing onEditClick={edit}/>)
 const done=screen.getByRole('button',{name:'Done'})
 expect(done.closest('.meeting-notes-actions__edit')).toBe(slot)
 expect(screen.getByRole('button',{name:'Tasks'}).closest('.meeting-notes-actions__secondary')).toBeTruthy()
 fireEvent.click(done);expect(edit).toHaveBeenCalledTimes(2)
})
