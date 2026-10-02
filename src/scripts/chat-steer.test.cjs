const test = require('node:test')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')
const path = require('node:path')
const load = () => import(pathToFileURL(path.join(__dirname, '../src-tauri/resources/clawdbot/dist/knapsack-chat-steer.js')))
const params = {sessionKey:'agent:main:webchat:dm:scout', message:'Prioritize tomorrow', idempotencyKey:'test-one'}
async function call(handler, value=params) { let result; await handler({params:value,respond:(ok,data,error)=>{result={ok,data,error}}});return result }
test('steer updates only an active turn, once even across retries',async()=>{
 const {createDesktopSteerHandler}=await load();let calls=0
 const handler=createDesktopSteerHandler(key=>{assert.equal(key,params.sessionKey);return 'active-run'},async(id,text,options)=>{calls++;assert.equal(id,'active-run');assert.equal(text,params.message);assert.equal(options.steeringMode,'all');return {queued:true}})
 assert.equal((await call(handler)).data.accepted,true)
 assert.equal((await call(handler)).data.accepted,true)
 assert.equal(calls,1)
})
test('no active run and rejected injection never start a new prompt',async()=>{
 const {createDesktopSteerHandler}=await load()
 const inactive=createDesktopSteerHandler(()=>undefined,()=>assert.fail('no new turn allowed'))
 assert.equal((await call(inactive)).data.accepted,false)
 const rejected=createDesktopSteerHandler(()=> 'active',async()=>({queued:false,reason:'finishing'}))
 assert.equal((await call(rejected)).data.accepted,false)
 const failing=createDesktopSteerHandler(()=> 'active',async()=>{throw Error('down')})
 assert.equal((await call(failing)).data.accepted,false)
})
test('steer rejects foreign sessions and malformed requests',async()=>{
 const {createDesktopSteerHandler}=await load()
 const handler=createDesktopSteerHandler(()=>assert.fail(),()=>assert.fail())
 for(const value of [null,{...params,sessionKey:'agent:main:slack:room'},{...params,message:''},{...params,message:'x'.repeat(16001)}]) assert.equal((await call(handler,value)).ok,false)
})

test('a rejected steer can be retried when the active runtime recovers', async () => {
 const {createDesktopSteerHandler}=await load(); let ready=false, calls=0
 const handler=createDesktopSteerHandler(()=>ready?'run':undefined,async()=>{calls++;return {queued:true}})
 assert.equal((await call(handler)).data.accepted,false)
 ready=true
 assert.equal((await call(handler)).data.accepted,true)
 assert.equal((await call(handler)).data.accepted,true)
 assert.equal(calls,1)
})
