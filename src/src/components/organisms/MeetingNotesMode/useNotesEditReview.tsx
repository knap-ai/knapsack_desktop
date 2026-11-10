import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { NameCorrection, SpellingBatch, spellingProposal } from 'src/utils/nameCorrections'
import { useEffect, useRef, useState } from 'react'
import type { LLMParams } from 'src/App'
import { KN_API_NOTES } from 'src/utils/constants'
import { serializeNotesWrite } from 'src/utils/notesGeneration'
import { normalizeMeetingNotesMarkdown } from 'src/utils/meetingNotesMarkdown'
import { isNotesEditRequest, notesEditPrompt, validateNotesProposal, NotesProposal } from 'src/utils/meetingNotesEdits'

type Receipt = { thread_id:number; revision_id:string; revision:string; notes:string }
type UndoReceipt = Pick<Receipt,'thread_id'|'revision_id'|'revision'>
type BatchReview = Pick<SpellingBatch,'candidates'|'selected'|'total'|'remaining'|'offset'>
const batchReview = ({candidates,selected,total,remaining,offset}:SpellingBatch):BatchReview => ({candidates,selected,total,remaining,offset})
type Draft = { accountScope:string; threadId:number; request:string; base:string; revision:string; editor:string; context:string; proposal?:NotesProposal; receipt?:UndoReceipt; spellings?:string; spellingBatch?:BatchReview; undoStack?:UndoReceipt[]; remaining?:number }
type Options = { accountScope:string; threadId:number; completed:boolean; notes:string; context:string; queue:(p:LLMParams)=>void; flush:()=>Promise<void>; saved:(notes:string)=>void; spellings?:()=>string }
const key = (id:number,scope:string) => `meeting-notes-edit:${encodeURIComponent(scope)}:${id}`
function load(id:number,scope:string):Draft|undefined {
  try {
    const d=JSON.parse(localStorage.getItem(key(id,scope)) || 'null') as Draft | null
    if(d?.threadId!==id || d.accountScope!==scope)return undefined
    if(d.spellings!==undefined && d.proposal){
      // Older previews used unparsed Markdown and must never survive this upgrade.
      if(!d.spellingBatch || !Array.isArray(d.spellingBatch.selected) || !Number.isInteger(d.spellingBatch.offset))return undefined
      const mappings=JSON.parse(d.spellings)
      if(!Array.isArray(mappings) || mappings.length>100)return undefined
      const fresh=spellingProposal(d.base,mappings,d.spellingBatch.selected,d.spellingBatch.offset)
      return {...d,proposal:{edits:fresh.edits,ambiguities:fresh.ambiguities,notes:fresh.notes},spellingBatch:batchReview(fresh)}
    }
    if(d.spellings!==undefined){
      const mappings=JSON.parse(d.spellings)
      if(!Array.isArray(mappings) || mappings.length>100)return undefined
      return {...d,remaining:spellingProposal(d.base,mappings).total}
    }
    return d
  }catch{return undefined}
}

export function useNotesEditReview(options:Options) {
  const live=useRef(options); live.current=options
  const generation=useRef(0), controller=useRef<AbortController>()
  const [draft,setDraft]=useState<Draft|undefined>(()=>load(options.threadId,options.accountScope))
  const draftRef=useRef(draft);draftRef.current=draft
  const [busy,setBusy]=useState(false), [error,setError]=useState('')
  const visible=draft?.threadId===options.threadId && draft.accountScope===options.accountScope ? draft : undefined
  const persist=(value:Draft|undefined,id=options.threadId,scope=value?.accountScope ?? options.accountScope) => {
    if(value) localStorage.setItem(key(id,scope),JSON.stringify(value)); else localStorage.removeItem(key(id,scope))
    if(live.current.threadId===id && live.current.accountScope===scope) {draftRef.current=value;setDraft(value)}
  }
  useEffect(()=>{
    generation.current++; controller.current?.abort();setDraft(load(options.threadId,options.accountScope));setBusy(false);setError('')
    const changed=()=>{generation.current++;controller.current?.abort();setDraft(undefined);setBusy(false);setError('Account changed. Reopen this meeting before reviewing notes.')}
    window.addEventListener(PROFILE_CHANGED_EVENT,changed)
    return ()=>{generation.current++;controller.current?.abort();window.removeEventListener(PROFILE_CHANGED_EVENT,changed)}
  },[options.threadId,options.accountScope])
  const request=async(text:string):Promise<boolean>=>{
    if(!isNotesEditRequest(text)) return false
    if(busy) {setError('Finish or discard the current proposal first.');return true}
    if(options.accountScope==='' || !options.completed){setError('Finish the meeting before editing saved notes with chat.');return true}
    const start=live.current, token=++generation.current
    const current=()=>generation.current===token && live.current.threadId===start.threadId && live.current.accountScope===start.accountScope
    controller.current?.abort();const abort=new AbortController();controller.current=abort
    setBusy(true);setError('')
    try {
      await start.flush()
      if(!current())return true
      const snapshot=await serializeNotesWrite(start.threadId,async()=>{
        if(!current())throw new Error('Account or meeting changed.')
        const r=await fetch(`${KN_API_NOTES}/${start.threadId}`,{signal:abort.signal});const body=await r.json()
        if(!r.ok || !body.success || !body.data?.exists || body.data.thread_id!==start.threadId || !body.data.revision) throw new Error('Saved meeting notes are unavailable.')
        return body.data
      })
      if(!current()) return true
      if(normalizeMeetingNotesMarkdown(snapshot.notes)!==normalizeMeetingNotesMarkdown(live.current.notes)) throw new Error('The editor and saved notes differ. Wait for saving, then retry.')
      const next:Draft={accountScope:start.accountScope,threadId:start.threadId,request:text,base:snapshot.notes,revision:snapshot.revision,editor:live.current.notes,context:start.context}
      persist(next,start.threadId)
      const raw=await new Promise<string>((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(new Error('Notes proposal timed out. Retry when ready.')),90000)
        const finish=(fn:()=>void)=>{clearTimeout(timeout);abort.signal.removeEventListener('abort',cancel);fn()}
        const cancel=()=>finish(()=>reject(new Error('Proposal cancelled.')))
        abort.signal.addEventListener('abort',cancel,{once:true})
        start.queue({prompt:notesEditPrompt(text,next.base,next.context),documents:[],threadId:start.threadId,signal:abort.signal,messageFinishCallback:message=>finish(()=>resolve(message)),errorCallback:e=>finish(()=>reject(e))})
      })
      if(!current()) return true
      persist({...next,proposal:validateNotesProposal(raw,next.base)},start.threadId)
    }catch(e){if(current()) setError(e instanceof Error?e.message:'Could not prepare notes edit.')}
    finally{if(current())setBusy(false)}
    return true
  }
  const prepareSpellings=async(corrections:NameCorrection[]):Promise<void>=>{
    if(busy || live.current.accountScope==='' || !live.current.completed) {setError('Finish the meeting and current proposal before reviewing spellings.');return}
    const start=live.current,token=++generation.current
    const current=()=>generation.current===token && live.current.threadId===start.threadId && live.current.accountScope===start.accountScope && live.current.context===start.context
    setBusy(true);setError('')
    try {
      await start.flush()
      if(!current())return
      const snapshot=await serializeNotesWrite(start.threadId,async()=>{
        if(!current())throw new Error('Account or meeting changed.')
        const r=await fetch(`${KN_API_NOTES}/${start.threadId}`);const body=await r.json()
        if(!r.ok || !body.success || !body.data?.exists || body.data.thread_id!==start.threadId || !body.data.revision)throw new Error('Saved meeting notes are unavailable.')
        return body.data
      })
      if(!current())return
      if(normalizeMeetingNotesMarkdown(snapshot.notes)!==normalizeMeetingNotesMarkdown(live.current.notes))throw new Error('The editor and saved notes differ. Wait for saving, then retry.')
      const proposal=spellingProposal(snapshot.notes,corrections)
      if(!proposal.edits.length){setError('No editable exact spelling matches. Names inside protected Markdown require manual review.');return}
      persist({accountScope:start.accountScope,threadId:start.threadId,request:'Review remembered name spellings',base:snapshot.notes,revision:snapshot.revision,editor:live.current.notes,context:start.context,proposal:{edits:proposal.edits,ambiguities:proposal.ambiguities,notes:proposal.notes},spellingBatch:batchReview(proposal),spellings:JSON.stringify(corrections),undoStack:visible?.receipt && visible.receipt.revision===snapshot.revision ? (visible.undoStack || [visible.receipt]) : [] ,receipt:visible?.receipt && visible.receipt.revision===snapshot.revision ? visible.receipt : undefined},start.threadId)
    }catch(e){if(current())setError(e instanceof Error?e.message:'Could not preview spellings.')}
    finally{if(generation.current===token && live.current.threadId===start.threadId && live.current.accountScope===start.accountScope)setBusy(false)}
  }
  const save=async(undo=false)=>{
    if(!visible || busy)return
    const d=visible,id=d.threadId,token=++generation.current
    const current=()=>generation.current===token && live.current.threadId===id && live.current.accountScope===d.accountScope
    setBusy(true);setError('')
    try {
      await live.current.flush()
      const result=await serializeNotesWrite(id,async()=>{
        if(!current() || live.current.notes!==d.editor || live.current.context!==d.context || (!undo && d.spellingBatch && JSON.stringify([d.spellingBatch.offset,d.spellingBatch.selected])!==JSON.stringify([draftRef.current?.spellingBatch?.offset,draftRef.current?.spellingBatch?.selected])) || (!undo && d.spellings!==undefined && d.spellings!==live.current.spellings?.())) throw new Error('Meeting content changed. Your notes were kept; generate a fresh proposal.')
        const r=await fetch(`${KN_API_NOTES}/revise`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({thread_id:id,expected_revision:undo?d.receipt?.revision:d.revision,...(undo?{restore_revision:d.receipt?.revision_id}:{notes:d.spellingBatch && d.spellings ? spellingProposal(d.base,JSON.parse(d.spellings),d.spellingBatch.selected,d.spellingBatch.offset).notes : d.proposal?.notes}),source:{request:d.request,base_revision:d.revision,context:d.context}})})
        const body=await r.json();if(!r.ok || !body.success)throw new Error(body.error||'Notes save failed. The proposal was kept.')
        if(body.data.thread_id!==id)throw new Error('Unexpected meeting revision response.')
        return body.data as Receipt
      })
      const stack = (d.undoStack || (d.receipt ? [d.receipt] : [])).map(({thread_id,revision_id,revision})=>({thread_id,revision_id,revision}))
      if(undo) stack.pop(); else stack.push({thread_id:result.thread_id,revision_id:result.revision_id,revision:result.revision})
      const remaining = d.spellings ? spellingProposal(result.notes,JSON.parse(d.spellings)).total : 0
      const next={...d,receipt:stack[stack.length-1],undoStack:stack,proposal:undefined,spellingBatch:undefined,remaining,base:result.notes,revision:result.revision,editor:normalizeMeetingNotesMarkdown(result.notes)}
      persist(next,id)
      if(current()) {
        if(live.current.notes===d.editor){live.current.saved(result.notes);persist(next,id)}
        else setError('Saved revision retained. Your newer editor text was preserved; reconcile before Undo.')
      }
    }catch(e){if(current())setError(e instanceof Error?e.message:'Notes save failed.')}
    finally{if(current())setBusy(false)}
  }
  const selectSpelling=(index:number,checked:boolean)=>{
    if(!visible?.spellingBatch || !visible.spellings || busy)return
    const selected=visible.spellingBatch.selected.filter(i=>i!==index)
    if(checked)selected.push(index)
    const batch=spellingProposal(visible.base,JSON.parse(visible.spellings),selected,visible.spellingBatch.offset)
    persist({...visible,proposal:{edits:batch.edits,ambiguities:batch.ambiguities,notes:batch.notes},spellingBatch:batchReview(batch)})
  }
  const pageSpellings=(offset:number)=>{
    if(!visible?.spellingBatch || !visible.spellings || busy)return
    const batch=spellingProposal(visible.base,JSON.parse(visible.spellings),undefined,offset)
    persist({...visible,proposal:{edits:batch.edits,ambiguities:batch.ambiguities,notes:batch.notes},spellingBatch:batchReview(batch)})
  }
  const review=<section aria-label="Proposed notes edit" aria-live="polite">
    {busy && <p>Preparing or saving notes revision…</p>}{error && <p role="alert">{error}</p>}
    {visible && <><p>{visible.request}</p>{visible.proposal && <>
      <p>Review changes to this meeting’s saved notes. Transcript stays unchanged.</p>
      {visible.spellingBatch && <>
        <p>Showing occurrences {visible.spellingBatch.offset+1}–{visible.spellingBatch.offset+visible.spellingBatch.candidates.length} of {visible.spellingBatch.total} editable matches. {visible.spellingBatch.selected.length} selected in this batch; {visible.spellingBatch.remaining} remaining after applying this selection.</p>
        {visible.spellingBatch.candidates.map((edit,i)=><label key={edit.from} style={{display:'block',whiteSpace:'pre-wrap'}}>
          <input type="checkbox" checked={visible.spellingBatch?.selected.includes(i) || false} disabled={busy} onChange={event=>selectSpelling(i,event.target.checked)} aria-describedby={`spelling-context-${visible.threadId}-${edit.from}`} aria-label={`Apply spelling occurrence ${(visible.spellingBatch?.offset || 0)+i+1}: ${edit.before} to ${edit.after}`} />
          <span id={`spelling-context-${visible.threadId}-${edit.from}`}><small>Source line {edit.sourceLine}, column {edit.sourceColumn}: </small>{edit.contextBefore}<del>{edit.before}</del> → <ins>{edit.after}</ins>{edit.contextAfter}</span>
        </label>)}
        <button disabled={busy || !visible.spellingBatch.offset} onClick={()=>pageSpellings(Math.max(0,(visible.spellingBatch?.offset || 0)-30))}>Review earlier matches</button>
        <button disabled={busy || visible.spellingBatch.offset+visible.spellingBatch.candidates.length>=visible.spellingBatch.total} onClick={()=>pageSpellings((visible.spellingBatch?.offset || 0)+30)}>Review later matches</button>
      </>}
      {!visible.spellingBatch && visible.proposal.edits.map((edit,i)=><div key={i}><del style={{whiteSpace:'pre-wrap'}}>{edit.before}</del><br/><ins style={{whiteSpace:'pre-wrap'}}>{edit.after}</ins><p>{edit.reason}</p></div>)}
      {visible.proposal.ambiguities.map((a,i)=><p key={i}>Needs clarification: {a}</p>)}
      <small>Source revision: {visible.revision.slice(0,12)}</small><br/>
      <button disabled={busy||!visible.proposal.edits.length||!!visible.proposal.ambiguities.length} onClick={()=>save()}>Apply to saved notes</button>
    </>}
    {!visible.proposal && !visible.receipt && !visible.spellings && <button disabled={busy} onClick={()=>request(visible.request)}>Retry proposal</button>}
    {!visible.proposal && !!visible.remaining && visible.spellings && <>
      <p>{visible.remaining} editable matches remain. Review a fresh batch before applying more.</p>
      <button disabled={busy} onClick={()=>prepareSpellings(JSON.parse(live.current.spellings?.() || '[]'))}>Review next spelling batch</button>
    </>}
    {visible.receipt && <button disabled={busy} onClick={()=>save(true)}>Undo notes edit</button>}
    <button disabled={busy} onClick={()=>{generation.current++;persist(undefined)}}>Dismiss</button></>}
  </section>
  return {request,review,prepareSpellings}
}
