// Synthetic presentation-only fixture: no native, provider, mailbox or send calls.
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MeetingNotificationCard } from 'src/components/molecules/MeetingNotification'
import EmailSyncNotice from 'src/components/molecules/EmailAutopilot/EmailSyncNotice'
import MarkdownDisplay from 'src/components/molecules/MarkdownDisplay'
import RelationshipTimeline from 'src/components/organisms/WorkspaceView/RelationshipTimeline'
import 'src/components/organisms/ClawdChat/style.scss'
import 'src/main.css'
function Fixture() {
  const [width,setWidth]=useState(720),[dark,setDark]=useState(false),[options,setOptions]=useState(false),[action,setAction]=useState('')
  return <main style={{padding:24,background:dark?'#272625':'#faf9f8',color:dark?'#eee9e5':'#36322f',minHeight:'100vh'}}>
    <nav>{[360,560,720,1100].map(w=><button key={w} onClick={()=>setWidth(w)}>{w}px</button>)}<button onClick={()=>setDark(v=>!v)}>Toggle background</button></nav>
    <section style={{width,maxWidth:'100%',margin:'24px auto'}}>
      <h1 style={{fontSize:24}}>Synthetic Desktop QA</h1>
      <div className="email-autopilot-toolbar" style={{marginBlock:20}}><div className="email-autopilot-toolbar__tools"><EmailSyncNotice busy accounts={[{provider:'Gmail',account:'owner@example.test',queryAccount:'owner@example.test',state:'idle' as any}]} onRetry={()=>setAction('Retry')} /><button aria-label="Email settings">⚙</button></div><div className="email-autopilot-toolbar__tabs">Needs response · FYI · Marketing</div></div>
      <div className="meeting-notes-actions"><button>Transcript</button><button>Insights</button><button>Copy for Slack</button><button>Share to Slack…</button><button>Edit</button></div>
      <MarkdownDisplay markdown={'## Discussion\n\n**Alice Rivera** will review the proposal with Alice Rivera.\n\n| Owner | Next step |\n| --- | --- |\n| Alice Rivera | Confirm the launch date |'} spellingNames={['Alice Rivera']} onSpellingClick={()=>setAction('Correction opened')} />
      <MeetingNotificationCard title="North Star partnership — launch decision and next steps" time="1:30 PM" brief={'## Context\nThe pilot needs a launch decision.\n- Confirm the owner and remaining scope.'} buttonConfigs={[{buttonText:'Join and record',buttonHandler:'join'},{buttonText:'Record',buttonHandler:'record'},{buttonText:'Open Knapsack',buttonHandler:'open'}]} onClose={()=>setAction('Dismiss')} onAction={setAction} />
      <div className="ClawdChatRoot" style={{height:120,marginBlock:20}}><div className="ClawdChatHeader"><div className="ClawdChatTitleRow"><strong>Scout</strong><button className="ClawdCompactControlsButton" aria-label="Scout options" aria-expanded={options} onClick={()=>setOptions(v=>!v)}>⋮</button></div><div className={`ClawdChatActions ClawdChatActions--responsive ${options?'ClawdChatActions--open':''}`}><span className="ClawdControlsGroupLabel">Assistant</span><button>Enabled</button><button>Channels</button><span className="ClawdControlsGroupLabel">Conversation</span><button>Clear</button></div></div></div>
      <RelationshipTimeline documents={[]} evidence={{displayName:null,sources:[],truncated:false}} loading={false} error={false} onRetry={()=>undefined} />
      <output>{action}</output>
    </section>
  </main>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
