// Not imported by the production entrypoint or included in production Rollup inputs.
import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import type { ChatAttachment, ChatQuote } from 'src/utils/selectedChatContext'
import type { Meeting } from 'src/hooks/dataSources/useCalendar'

export const PROBES = ['transcript','meeting_link','chat_selection','notes_edit','slack_share','boundaries'] as const
export type Probe = typeof PROBES[number]
type Ipc = { cmd?:string; callback:number; error:number; __tauriModule?:string; message?:{cmd?:string;event?:string;windowLabel?:string;payload?:unknown;path?:string} }
type NativeWindow = Window & { __TAURI_IPC__?:(payload:Ipc)=>void; __knapsackQaTransport__?:(payload:Ipc)=>void; __knapsackNativeQaProbe?:(probe:Probe,nonce:string)=>Promise<void> }
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})
const BASE='You represent Visa and will send the Visa criteria.\nMark owns Knapsack pricing.\nAlex owns legal review.\n> Frida: I represent Visa.'
const AFTER=BASE.replace('You represent Visa and will send the Visa criteria.','Frida represents Visa and will send the Visa criteria.')
const TABLE='| Owner | Task |\n| --- | --- |\n| Frida | Visa review |'
const tick=()=>new Promise<void>(r=>setTimeout(r,0))
function check(value:unknown):asserts value { if(!value)throw new Error('qa_assertion') }
async function until(test:()=>boolean){const end=Date.now()+700;while(!test()){if(Date.now()>end)throw new Error('qa_assertion_timeout');await tick()}}
function findButton(label:string){return Array.from(document.querySelectorAll('button')).find(b=>(b.getAttribute('aria-label')||b.textContent?.trim())===label)}
function button(label:string){const b=findButton(label);check(b);return b}
const readyButton=(label:string)=>until(()=>!!findButton(label)&&!findButton(label)!.disabled)
function click(label:string){button(label).click()}
function select(label:string,value:string){const el=document.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`);check(el);el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}))}

export async function createProbeHarness(container:HTMLElement,nativeIpc:(p:Ipc)=>void){
 const root=createRoot(container)
 const state={clipboard:'',opens:[] as string[],forbidden:0,posts:[] as {requestId:string;teamId:string;channelId:string}[],notes:BASE,revision:1,revoked:false,sourceJump:'',transcripts:new Map<string,()=>Promise<Response>>()}
 const target=window as NativeWindow
 const fail=()=>{state.forbidden++;throw new Error('qa_boundary_blocked')}
 // Forward only the nonce-bound result event to this owned native window.
 target.__knapsackQaTransport__=payload=>{
  const m=payload.message
  if(payload.cmd==='tauri'&&payload.__tauriModule==='Shell'&&m?.cmd==='open'){
   state.opens.push(String(m.path));(window as unknown as Record<string,(v?:unknown)=>void>)[`_${payload.callback}`]?.();return
  }
  if(payload.cmd==='tauri'&&payload.__tauriModule==='Event'&&m?.cmd==='emit'&&m.event==='knapsack-qa-dom-result'&&m.windowLabel==='main') {nativeIpc(payload);return}
  fail()
 }
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text:string)=>{state.clipboard=text}}})
 Object.defineProperty(navigator,'sendBeacon',{configurable:true,value:()=>{state.forbidden++;return false}})
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>fail()}})
 window.open=()=>{fail();return null}
 globalThis.XMLHttpRequest=window.XMLHttpRequest=class {constructor(){fail()}} as unknown as typeof XMLHttpRequest
 globalThis.WebSocket=window.WebSocket=class {constructor(){fail()}} as unknown as typeof WebSocket
 globalThis.EventSource=window.EventSource=class {constructor(){fail()}} as unknown as typeof EventSource
 globalThis.fetch=window.fetch=async(input,init)=>{
  const u=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,location.href)
  if(u.origin!=='http://127.0.0.1:8897')return fail()
  if(u.pathname==='/api/knapsack/thread/transcript')return state.transcripts.get(u.searchParams.get('id')||'')?.()||json({data:false},404)
  if(u.pathname==='/api/knapsack/notes/900101')return json({success:true,data:{thread_id:900101,exists:true,notes:state.notes,revision:String(state.revision)}})
  if(u.pathname==='/api/knapsack/notes/revise'){
   const body=JSON.parse(String(init?.body));if(body.thread_id!==900101)return fail()
   if(body.expected_revision!==String(state.revision))return json({success:false,error:'Synthetic revision conflict'},409)
   state.notes=body.restore_revision?BASE:body.notes;state.revision++
   return json({success:true,data:{thread_id:900101,revision_id:'qa-receipt',revision:String(state.revision),notes:state.notes}})
  }
  if(u.pathname==='/api/clawd/slack-notes/workspaces')return json({success:true,data:{owner:'qa-user',accounts:[{accountId:'qa-work',teamId:'T-QA1',name:'Fictional workspace'},{accountId:'qa-other',teamId:'T-QA2',name:'Fictional workspace'}]}})
  if(u.pathname==='/api/clawd/slack-notes/channels')return state.revoked?json({success:false,error:'Synthetic revoked connection'},403):json({success:true,data:{channels:[{id:'C-QA1',name:'same-name',private:false},{id:'C-QA2',name:'same-name',private:true}]}})
  if(u.pathname==='/api/clawd/slack-notes/send'){
   const b=JSON.parse(String(init?.body));if(b.owner!=='qa-user'||b.teamId!=='T-QA1'||b.channelId!=='C-QA1')return fail()
   check(b.blocks.some((block:{type:string})=>block.type==='table'));state.posts.push(b)
   return json({success:true,data:{state:'sent',channelId:b.channelId,teamId:b.teamId,ts:'qa-fictional'}})
  }
  return fail() // Never forward an unrecognized request, even to the local API.
 }
 // Imports occur only after sealing all side-effect boundaries.
 const [{default:TranscriptView},{default:CalendarMeetingLink},links,{default:ChatSelectionActions},{default:QuotedChatContext},quotes,{useNotesEditReview},{default:SlackNotesShare},slack,format] = await Promise.all([
  import('src/components/organisms/TranscriptView'),import('src/components/molecules/CalendarMeetingLink'),import('src/utils/calendarMeetingLink'),import('src/components/organisms/ClawdChat/ChatSelectionActions'),import('src/components/organisms/ClawdChat/QuotedChatContext'),import('src/utils/selectedChatContext'),import('src/components/organisms/MeetingNotesMode/useNotesEditReview'),import('src/components/molecules/SlackNotesShare'),import('src/api/slackNotes'),import('src/utils/slackMeetingNotes'),
 ])
 const render=(element:JSX.Element|null)=>flushSync(()=>root.render(element))
 function Chat({scope}:{scope:string}){
  const body=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null)
  const [draft,setDraft]=useState('Preserved fictional draft'),[files,setFiles]=useState<ChatAttachment[]>([{name:'qa.txt',type:'text/plain',content:'fictional attachment'}])
  useEffect(()=>setFiles(previous=>quotes.scopedChatAttachments(previous,scope)),[scope])
  return <><div ref={body} tabIndex={-1} data-qa="chat"><p data-chat-quote-message-id="qa-message"><strong>Fictional excerpt</strong> <a href="https://example.invalid">source link</a><code>code_text</code></p></div>
   <ChatSelectionActions rootRef={body} conversationId={scope} active onAdd={(quote:ChatQuote)=>{setFiles(previous=>quotes.appendChatQuote(previous,quote));input.current?.focus()}}/>
   {files.filter(f=>f.chatQuote).map(f=><QuotedChatContext key={f.chatQuote!.id} quote={f.chatQuote!} onJump={id=>{state.sourceJump=id}} onRemove={()=>setFiles(previous=>previous.filter(item=>item!==f))}/>)}
   <textarea ref={input} aria-label="Fictional draft" value={draft} onChange={e=>setDraft(e.target.value)}/><output data-qa="files">{files.length}</output></>
 }
 function Notes(){
  const [notes,setNotes]=useState(BASE)
  const review=useNotesEditReview({threadId:900101,completed:true,notes,context:'Authenticated user Mark. Frida represents Visa. Mark owns Knapsack pricing. Alex owns legal review.',flush:async()=>{},saved:setNotes,queue:params=>queueMicrotask(()=>params.messageFinishCallback?.(JSON.stringify({edits:[{before:'You represent Visa and will send the Visa criteria.',after:'Frida represents Visa and will send the Visa criteria.',reason:'Fictional transcript identifies Frida.'}],ambiguities:[]})))})
  return <><button onClick={()=>void review.request('You swapped me and Frida')}>Correct attribution</button>{review.review}<output data-qa="notes">{notes}</output></>
 }
 const meeting=(id:string,url:string)=>({id,event_id:id,start:1,calendar_account_email:'qa@example.invalid',google_meet_url:url}) as Meeting
 const share=()=> <SlackNotesShare threadId={900101} userEmail="qa@example.invalid" notes={async()=>({markdown:TABLE,title:'Fictional notes'})} onClose={()=>render(null)}/>
 async function run(probe:Probe){
  check(PROBES.includes(probe));render(null);await tick()
  if(probe==='transcript'){
   state.transcripts.set('900101',async()=>json({data:{content:'FICTIONAL ALPHA transcript body'}}))
   render(<TranscriptView threadId={900101} onClose={()=>{}}/>);await until(()=>container.textContent?.includes('FICTIONAL ALPHA')===true);click('Copy transcript');await until(()=>state.clipboard.includes('FICTIONAL ALPHA'))
   let slow:(r:Response)=>void=()=>{};state.transcripts.set('900102',()=>new Promise(resolve=>{slow=resolve}))
   render(<TranscriptView threadId={900102} onClose={()=>{}}/>);await tick();check(button('Copy transcript').disabled)
   state.transcripts.set('900103',async()=>json({data:{content:'FICTIONAL CURRENT transcript body'}}));render(<TranscriptView threadId={900103} onClose={()=>{}}/>)
   await until(()=>container.textContent?.includes('FICTIONAL CURRENT')===true);slow(json({data:{content:'FICTIONAL STALE'}}));await tick();check(!container.textContent?.includes('FICTIONAL STALE'));click('Copy transcript');await until(()=>state.clipboard.includes('FICTIONAL CURRENT'))
   render(<TranscriptView threadId={900104} onClose={()=>{}}/>);await until(()=>container.textContent?.includes('Failed to fetch transcript')===true||container.textContent?.includes('Transcript not found')===true);check(button('Copy transcript').disabled)
  }
  if(probe==='meeting_link'){
   const cases=[['zoom','https://zoom.us/j/00000000000','Open Zoom link'],['meet','https://meet.google.com/aaa-bbbb-ccc','Open Google Meet link'],['teams','https://teams.microsoft.com/l/meetup-join/fictional','Open Teams link'],['other','https://example.invalid/call','Open meeting link']]
   const before=state.opens.length;render(<>{cases.map(([id,url])=><CalendarMeetingLink key={id} meeting={meeting(id,url)}/>)}</>);await tick();check(state.opens.length===before)
   for(const [,url,label]of cases){const a=container.querySelector<HTMLAnchorElement>(`a[aria-label="${label}"]`);check(a);a.click();a.click();await until(()=>state.opens.includes(url))}
   check(state.opens.length===before+4)
   const unsafe=meeting('unsafe','javascript:alert(1)');check(!await links.openCalendarMeetingLink(unsafe,true));check(state.opens.length===before+4)
  }
  if(probe==='chat_selection'){
   render(<Chat scope="qa-a"/>);await tick();const body=container.querySelector<HTMLElement>('[data-qa="chat"]'),message=container.querySelector('[data-chat-quote-message-id]');check(body&&message);body.focus()
   const range=document.createRange();range.selectNodeContents(message);const selection=window.getSelection();check(selection);selection.removeAllRanges();selection.addRange(range);const exact=selection.toString();document.dispatchEvent(new Event('selectionchange'))
   await until(()=>!!document.querySelector('[aria-label="Selected text actions"]'));click('Add to chat');await until(()=>container.querySelector('blockquote')?.textContent===exact)
   check(container.querySelector<HTMLTextAreaElement>('textarea')?.value==='Preserved fictional draft');check(container.querySelector('[data-qa="files"]')?.textContent==='2');click('Quoted from message');check(state.sourceJump==='qa-message')
   render(<Chat scope="qa-b"/>);await until(()=>!container.querySelector('blockquote'));check(!document.querySelector('[aria-label="Selected text actions"]'));check(container.querySelector('[data-qa="files"]')?.textContent==='1')
  }
  if(probe==='notes_edit'){
   state.notes=BASE;state.revision=1;localStorage.removeItem('meeting-notes-edit:900101');render(<Notes/>);await tick()
   click('Correct attribution');await readyButton('Apply to saved notes');check(!!container.querySelector('ins')&&state.notes===BASE)
   click('Apply to saved notes');await readyButton('Undo notes edit');await until(()=>container.querySelector('[data-qa="notes"]')?.textContent===AFTER)
   check(state.notes===AFTER&&state.notes.includes('Alex owns legal review.')&&state.notes.includes('> Frida: I represent Visa.'))
   click('Undo notes edit');await readyButton('Retry proposal');await until(()=>container.querySelector('[data-qa="notes"]')?.textContent===BASE);check(state.notes===BASE)
   click('Correct attribution');await readyButton('Apply to saved notes');check(!!container.querySelector('ins'))
   state.notes+='\nConcurrent fictional edit';state.revision++;click('Apply to saved notes');await until(()=>container.textContent?.includes('Synthetic revision conflict')===true);await readyButton('Apply to saved notes');check(state.notes.includes('Concurrent fictional edit'))
  }
  if(probe==='slack_share'){
   state.revoked=false;localStorage.removeItem('slack-notes-destination:v1:qa-user');render(share());await until(()=>!!container.querySelector('option[value="qa-work"]'));click('Copy for Slack');await until(()=>state.clipboard.includes('Visa review'));check(!state.posts.length)
   select('Slack workspace','qa-work');await until(()=>!!container.querySelector('option[value="C-QA1"]'));select('Slack channel','C-QA1');click('Preview send to channel');await until(()=>!!container.querySelector('table'));check(!state.posts.length);click('Send these notes to #same-name');await until(()=>container.textContent?.includes('Sent to Fictional workspace')===true);check(state.posts.length===1)
   render(null);render(share());await until(()=>container.querySelector<HTMLSelectElement>('[aria-label="Slack channel"]')?.value==='C-QA1');check(state.posts.length===1)
   const d={owner:'qa-user',accountId:'qa-work',teamId:'T-QA1',channelId:'C-QA1'},m=format.buildSlackNotesMessage(TABLE);check(await slack.slackNotesSendId(d,m)===await slack.slackNotesSendId(d,m))
   render(null);state.revoked=true;render(share());await until(()=>container.textContent?.includes('Synthetic revoked connection')===true);check(container.querySelector<HTMLSelectElement>('[aria-label="Slack channel"]')?.value==='');check(state.posts.length===1)
  }
  if(probe==='boundaries'){check(state.forbidden===0);check(state.posts.length===1);check(state.opens.length===4);check(state.sourceJump==='qa-message')}
  render(null);await tick()
 }
 return {run,state,dispose:()=>{flushSync(()=>root.unmount())}}
}

async function bootstrap(){
 const target=window as NativeWindow
 if(import.meta.env.VITE_KNAPSACK_LOCAL_QA_SAFE!=='1'||window!==window.top||location.origin!=='http://127.0.0.1:1420'||location.pathname!=='/qa-dom.html'||typeof target.__TAURI_IPC__!=='function')return
 const container=document.getElementById('qa-root');if(!container)return
 const native=target.__TAURI_IPC__;const harness=await createProbeHarness(container,native)
 const used=new Set<string>();let busy=false
 target.__knapsackNativeQaProbe=async(probe,nonce)=>{
  if(busy||!PROBES.includes(probe)||!/^[0-9a-f-]{36}$/.test(nonce)||used.has(nonce))return
  used.add(nonce);busy=true;let passed=false
  try{await harness.run(probe);passed=true}catch{container.textContent='Synthetic QA assertion failed.'}
  finally{busy=false;const {appWindow}=await import('@tauri-apps/api/window');await appWindow.emit('knapsack-qa-dom-result',{nonce,probe,passed})}
 }
}
void bootstrap()
