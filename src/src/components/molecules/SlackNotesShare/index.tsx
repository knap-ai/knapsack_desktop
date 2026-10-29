import { useEffect, useRef, useState } from 'react'
import { buildSlackNotesMessage, copyMeetingNotesForSlack } from 'src/utils/slackMeetingNotes'
import { rememberedSlackDestination, rememberSlackDestination, sendSlackNotes, slackNotesChannels, slackNotesSendId, slackNotesWorkspaces, SlackNotesWorkspace, SlackNotesChannel, SlackNotesDestination } from 'src/api/slackNotes'
type Props={threadId:number;userEmail?:string;notes:()=>Promise<{markdown:string;title?:string}>;onClose:()=>void}
type Preview={destination:SlackNotesDestination;workspace:string;channel:string;message:ReturnType<typeof buildSlackNotesMessage>}
export default function SlackNotesShare({threadId,userEmail,notes,onClose}:Props){
 const [owner,setOwner]=useState(''),[workspaces,setWorkspaces]=useState<SlackNotesWorkspace[]>([]),[account,setAccount]=useState(''),[channels,setChannels]=useState<SlackNotesChannel[]>([]),[selected,setSelected]=useState(''),[preview,setPreview]=useState<Preview>(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('')
 const scope=`${threadId}:${userEmail||''}`,live=useRef(scope);live.current=scope
 const epoch=useRef(0),locked=useRef(false),root=useRef<HTMLDivElement>(null)
 const current=(token:number)=>token===epoch.current&&scope===live.current
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const token=++epoch.current;root.current?.focus();slackNotesWorkspaces().then(data=>{
  if(!current(token))return;setOwner(data.owner);setWorkspaces(data.accounts)
  const saved=rememberedSlackDestination(data.owner)
  const match=saved&&data.accounts.find(w=>!w.unavailable&&w.accountId===saved.accountId&&w.teamId===saved.teamId)
  if(match){setAccount(match.accountId);setSelected(saved.channelId)}else if(saved)setError('Saved Slack destination is unavailable. Choose a workspace and channel; no replacement was selected.')
 }).catch(e=>{if(current(token))setError(e.message)});return()=>{epoch.current++;previous?.focus()}},[scope])
 const workspace=workspaces.find(w=>w.accountId===account&&!w.unavailable)
 useEffect(()=>{setChannels([]);setPreview(undefined);if(!owner||!workspace)return
  const token=++epoch.current;setBusy(true);slackNotesChannels({owner,accountId:workspace.accountId,teamId:workspace.teamId}).then(data=>{
   if(!current(token))return;setChannels(data.channels)
   setSelected(id=>{if(id&&!data.channels.some(c=>c.id===id)){setError('Saved channel is unavailable. Choose another channel explicitly.');return ''}return id})
  }).catch(e=>{if(current(token)){setError(e.message);setSelected('')}}).finally(()=>{if(current(token))setBusy(false)})
 },[owner,workspace?.accountId,workspace?.teamId,scope])
 const choose=(id:string)=>{setSelected(id);setPreview(undefined);setError('');setStatus('');if(workspace&&channels.some(c=>c.id===id)){try{rememberSlackDestination({owner,accountId:workspace.accountId,teamId:workspace.teamId,channelId:id})}catch{setError('This destination could not be remembered. Check local storage before reopening sharing.')}}}
 const action=async(kind:'copy'|'preview'|'send')=>{
  if(locked.current)return;locked.current=true;setBusy(true);setError('');setStatus('');const token=epoch.current
  try{
   if(kind==='copy'){const value=await notes();if(!current(token))return;await copyMeetingNotesForSlack(value.markdown,value.title);if(current(token))setStatus('Copied readable Slack text. Native tables require Send.')}
   if(kind==='preview'){
    const channel=channels.find(c=>c.id===selected);if(!workspace||!channel)throw new Error('Choose a connected workspace and available channel.')
    const destination={owner,accountId:workspace.accountId,teamId:workspace.teamId,channelId:channel.id}
    const value=await notes();if(!current(token))return
    setPreview({destination,workspace:workspace.name,channel:channel.name,message:buildSlackNotesMessage(value.markdown,value.title)})
   }
   if(kind==='send'&&preview){
    const id=await slackNotesSendId(preview.destination,preview.message);if(!current(token))return
    const receipt=await sendSlackNotes(preview.destination,preview.message,id)
    if(current(token)){if(receipt.channelId!==preview.destination.channelId||receipt.teamId!==preview.destination.teamId)throw new Error('Unexpected destination receipt. Verify Slack before resending.');setStatus(`Sent to ${preview.workspace} / #${preview.channel}.`);setPreview(undefined)}
   }
  }catch(e){if(current(token))setError(e instanceof Error?e.message:'Slack sharing failed. Verify the channel before retrying a send.')}
  finally{locked.current=false;if(current(token))setBusy(false)}
 }
 return <div ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-busy={busy} aria-label="Copy or send notes to Slack" onKeyDown={e=>{if(e.key==='Escape'&&!busy){e.stopPropagation();onClose()}if(e.key==='Tab'){const controls=Array.from(root.current?.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled), [tabindex="0"]')||[]);const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===root.current)){e.preventDefault();last?.focus()}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===root.current)){e.preventDefault();first?.focus()}}}} style={{position:'fixed',zIndex:10000,inset:'10% 15%',background:'var(--ks-paper, #fff)',color:'#222',padding:24,overflow:'auto',boxShadow:'0 8px 40px #0005',borderRadius:12}}>
  <h2>Share notes to Slack</h2><p>Copy creates readable text. Send posts native tables using an existing connected Slack bot.</p>
  <button disabled={busy} onClick={()=>action('copy')}>Copy for Slack</button>
  <label>Workspace <select aria-label="Slack workspace" disabled={busy} value={account} onChange={e=>{setAccount(e.target.value);setSelected('');setPreview(undefined);setError('');setStatus('')}}><option value="">Choose workspace</option>{workspaces.map(w=><option key={w.accountId} value={w.accountId} disabled={w.unavailable}>{w.name} ({w.teamId||'unavailable'} · {w.accountId})</option>)}</select></label>
  <label>Channel <select aria-label="Slack channel" disabled={busy||!workspace} value={selected} onChange={e=>choose(e.target.value)}><option value="">Choose channel</option>{channels.map(c=><option key={c.id} value={c.id}>#{c.name} ({c.id}){c.private?' · private':''}</option>)}</select></label>
  <p>Your workspace/channel choice is remembered for this signed-in user. Saving notes never posts to Slack.</p>
  <button disabled={busy||!selected} onClick={()=>action('preview')}>Preview send to channel</button>
  {preview&&<section aria-label="Slack send preview"><h3>{preview.workspace} ({preview.destination.teamId}) / #{preview.channel} ({preview.destination.channelId})</h3>
   {preview.message.blocks.map((b,i)=>b.type==='table'?<table key={i}><tbody>{b.rows.map((row,r)=><tr key={r}>{row.map((c,j)=>r===0?<th key={j}>{c.text}</th>:<td key={j}>{c.text}</td>)}</tr>)}</tbody></table>:<p style={{whiteSpace:'pre-wrap'}} key={i}>{b.text.text}</p>)}
   <button disabled={busy} onClick={()=>action('send')}>Send these notes to #{preview.channel}</button><button disabled={busy} onClick={()=>setPreview(undefined)}>Cancel send</button>
  </section>}
  {busy&&<p role="status">Loading or sending…</p>}
  {error&&<p role="alert">{error}</p>}{status&&<p role="status">{status}</p>}
  <button disabled={busy} onClick={onClose}>Close</button>
  {!workspaces.length&&<p>No usable native Slack connection was found. Studio-only connections are not available in this picker.</p>}

 </div>
}
