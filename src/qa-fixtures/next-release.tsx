// Synthetic production-component checks. No native recording, provider, or send calls.
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import RecordControlPanel from 'src/components/molecules/RecordControlPanel'
import { buildSlackClipboardPayload, copyMeetingNotesForSlack } from 'src/utils/slackMeetingNotes'
import 'src/components/organisms/ClawdChat/style.scss'
import 'src/main.css'
const notes = '# Decisions\n\n- **Owner:** Ship fix\n\n| Participant | Task |\n| --- | --- |\n| Alex | Review |\n| Jo | Ship |'
function Fixture() {
  const [width,setWidth] = useState(560), [open,setOpen] = useState(false), [actions,setActions] = useState<string[]>([])
  const action = (name:string) => () => setActions(v=>[...v,name])
  return <main style={{padding:20}}>
    <h1>Synthetic next-release QA</h1>
    {[900,560,320].map(w=><button key={w} onClick={()=>setWidth(w)}>{w}px</button>)}
    <section aria-label="Meeting controls" style={{width,maxWidth:'100%',display:'flex',gap:8,flexWrap:'wrap',margin:'20px 0'}}>
      <button onClick={action('join')}>Join Meet</button>
      <RecordControlPanel isRecording={false} isDisabled={false} isPaused={false} isSynthesizing={false}
        onClickJoin={action('combined')} onClickRecord={action('record')} onClickEnd={()=>{}} onClickPause={()=>{}} onClickResume={()=>{}} />
    </section>
    <output>{actions.join(', ')}</output>
    <h2>Scout pane CSS fixture</h2>
    <div className="ClawdChatRoot" aria-label="Scout pane" style={{width,maxWidth:'100%',height:300}}>
      <div className="ClawdChatHeader"><div className="ClawdChatTitleRow"><strong>Scout</strong>
        <button className="ClawdCompactControlsButton" aria-expanded={open} aria-label="Scout options" onClick={()=>setOpen(v=>!v)}>⋯</button></div>
        <div className={`ClawdChatActions ClawdChatActions--responsive ${open?'ClawdChatActions--open':''}`}>
          {['Model','Conversation','Privacy','Scheduled work','New chat'].map(label=><button key={label}>{label}</button>)}
        </div>
      </div><p>Synthetic conversation</p>
    </div>
    <h2>Rich clipboard preview</h2>
    <button onClick={()=>void copyMeetingNotesForSlack(notes)}>Copy synthetic notes</button>
    <div aria-label="Clipboard preview" dangerouslySetInnerHTML={{__html:buildSlackClipboardPayload(notes).html}} />
    <div contentEditable suppressContentEditableWarning role="textbox" aria-label="Synthetic paste target" style={{border:'1px solid gray',minHeight:80,marginTop:20}} />
  </main>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
