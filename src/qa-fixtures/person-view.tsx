import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import WorkspaceView from 'src/components/organisms/WorkspaceView'
import type { Workspace } from 'src/api/workspaces'
import { personChatContext } from 'src/utils/personChatContext'
import 'src/main.css'
const workspace = {uuid:'synthetic-person',name:'Alex Example',entityType:'person',entityKey:'alex@example.test',documents:[
 {id:1,documentName:'Planning meeting',summary:'Review roadmap',autoTags:'["planning"]',tags:null},
 {id:2,documentName:'Follow-up email',summary:'Budget agreement',autoTags:'[]',tags:null},
]} as Workspace
// Fail closed: this fixture cannot reach the local app or a provider.
window.fetch = async () => new Response(JSON.stringify({success:true,data:workspace}),{headers:{'Content-Type':'application/json'}})
function Fixture(){const [width,setWidth]=useState(900),[chat,setChat]=useState(false)
 return <main style={{padding:16}}><h1>Synthetic person view QA</h1>{[900,560,320].map(w=><button key={w} onClick={()=>setWidth(w)}>{w}px</button>)}
 <div aria-label="Person fixture" style={{width,maxWidth:'100%'}}>{chat?<section><h2>{personChatContext(workspace,'owner@example.test')!.title}</h2><p>No prompt submitted.</p><button onClick={()=>setChat(false)}>Back to person</button></section>:<WorkspaceView workspace={workspace} onBack={()=>{}} onOpenPersonChat={()=>setChat(true)}/>}</div></main>
}
createRoot(document.getElementById('root')!).render(<Fixture/> )
