import { useEffect, useRef, useState } from 'react'
import type { LLMParams } from 'src/App'
import { KN_API_NOTES } from 'src/utils/constants'
import { serializeNotesWrite } from 'src/utils/notesGeneration'
import { normalizeMeetingNotesMarkdown } from 'src/utils/meetingNotesMarkdown'
import { isNotesEditRequest, notesEditPrompt, validateNotesProposal, NotesProposal } from 'src/utils/meetingNotesEdits'

type Receipt = { thread_id:number; revision_id:string; revision:string; notes:string }
type Draft = { threadId:number; request:string; base:string; revision:string; editor:string; context:string; proposal?:NotesProposal; receipt?:Receipt }
type Options = { threadId:number; completed:boolean; notes:string; context:string; queue:(p:LLMParams)=>void; flush:()=>Promise<void>; saved:(notes:string)=>void }
const key = (id:number) => `meeting-notes-edit:${id}`
function load(id:number):Draft|undefined { try { const d=JSON.parse(localStorage.getItem(key(id)) || 'null'); return d?.threadId===id ? d : undefined } catch { return undefined } }
export function useNotesEditReview(options:Options) {
  const live=useRef(options); live.current=options
  const generation=useRef(0), controller=useRef<AbortController>()
  const [draft,setDraft]=useState<Draft|undefined>(()=>load(options.threadId))
  const [busy,setBusy]=useState(false), [error,setError]=useState('')
  const visible=draft?.threadId===options.threadId ? draft : undefined
  const persist=(value:Draft|undefined,id=options.threadId) => {
    if(value) localStorage.setItem(key(id),JSON.stringify(value)); else localStorage.removeItem(key(id))
    if(live.current.threadId===id) setDraft(value)
  }
  useEffect(()=>{ generation.current++; controller.current?.abort(); setDraft(load(options.threadId));setBusy(false);setError(''); return ()=>{generation.current++;controller.current?.abort()} },[options.threadId])
  const request=async(text:string):Promise<boolean>=>{
    if(!isNotesEditRequest(text)) return false
    if(busy) {setError('Finish or discard the current proposal first.');return true}
    if(!options.completed){setError('Finish the meeting before editing saved notes with chat.');return true}
    const start=live.current, token=++generation.current
    const current=()=>generation.current===token && live.current.threadId===start.threadId
    controller.current?.abort();const abort=new AbortController();controller.current=abort
    setBusy(true);setError('')
    try {
      await start.flush()
      const snapshot=await serializeNotesWrite(start.threadId,async()=>{
        const r=await fetch(`${KN_API_NOTES}/${start.threadId}`,{signal:abort.signal});const body=await r.json()
        if(!r.ok || !body.success || !body.data?.exists || body.data.thread_id!==start.threadId || !body.data.revision) throw new Error('Saved meeting notes are unavailable.')
        return body.data
      })
      if(!current()) return true
      if(normalizeMeetingNotesMarkdown(snapshot.notes)!==normalizeMeetingNotesMarkdown(live.current.notes)) throw new Error('The editor and saved notes differ. Wait for saving, then retry.')
      const next:Draft={threadId:start.threadId,request:text,base:snapshot.notes,revision:snapshot.revision,editor:live.current.notes,context:start.context}
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
  const save=async(undo=false)=>{
    if(!visible || busy)return
    const d=visible,id=d.threadId,token=++generation.current
    const current=()=>generation.current===token && live.current.threadId===id
    setBusy(true);setError('')
    try {
      await live.current.flush()
      const result=await serializeNotesWrite(id,async()=>{
        if(!current() || live.current.notes!==d.editor || live.current.context!==d.context) throw new Error('Meeting content changed. Your notes were kept; generate a fresh proposal.')
        const r=await fetch(`${KN_API_NOTES}/revise`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({thread_id:id,expected_revision:undo?d.receipt?.revision:d.revision,...(undo?{restore_revision:d.receipt?.revision_id}:{notes:d.proposal?.notes}),source:{request:d.request,base_revision:d.revision,context:d.context}})})
        const body=await r.json();if(!r.ok || !body.success)throw new Error(body.error||'Notes save failed. The proposal was kept.')
        if(body.data.thread_id!==id)throw new Error('Unexpected meeting revision response.')
        return body.data as Receipt
      })
      const next={...d,receipt:undo?undefined:result,proposal:undefined,base:result.notes,revision:result.revision,editor:normalizeMeetingNotesMarkdown(result.notes)}
      persist(next,id)
      if(current()) {
        if(live.current.notes===d.editor){live.current.saved(result.notes);persist(next,id)}
        else setError('Saved revision retained. Your newer editor text was preserved; reconcile before Undo.')
      }
    }catch(e){if(current())setError(e instanceof Error?e.message:'Notes save failed.')}
    finally{if(current())setBusy(false)}
  }
  const review=<section aria-label="Proposed notes edit" aria-live="polite">
    <small>Notes edit proposals use your configured model. Changes are saved only when you apply them.</small>
    {busy && <p>Preparing or saving notes revision…</p>}{error && <p role="alert">{error}</p>}
    {visible && <><p>{visible.request}</p>{visible.proposal && <>
      <p>Review changes to this meeting’s saved notes. Transcript stays unchanged.</p>
      {visible.proposal.edits.map((edit,i)=><div key={i}><del style={{whiteSpace:'pre-wrap'}}>{edit.before}</del><br/><ins style={{whiteSpace:'pre-wrap'}}>{edit.after}</ins><p>{edit.reason}</p></div>)}
      {visible.proposal.ambiguities.map((a,i)=><p key={i}>Needs clarification: {a}</p>)}
      <small>Source revision: {visible.revision.slice(0,12)}</small><br/>
      <button disabled={busy||!visible.proposal.edits.length||!!visible.proposal.ambiguities.length} onClick={()=>save()}>Apply to saved notes</button>
    </>}
    {!visible.proposal && !visible.receipt && <button disabled={busy} onClick={()=>request(visible.request)}>Retry proposal</button>}
    {visible.receipt && <button disabled={busy} onClick={()=>save(true)}>Undo notes edit</button>}
    <button disabled={busy} onClick={()=>{generation.current++;persist(undefined)}}>Dismiss</button></>}
  </section>
  return {request,review}
}
