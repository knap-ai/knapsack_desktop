// @vitest-environment jsdom
import {afterAll,beforeAll,describe,it,expect,vi} from 'vitest'
import {webcrypto} from 'node:crypto'
vi.mock('@tauri-apps/api/tauri',()=>import('./qaTauriFacade'))
vi.mock('@tauri-apps/api/event',async()=>{
 const {invoke,transformCallback}=await import('./qaTauriFacade')
 const listen=async(event:string,handler:(value:unknown)=>void)=>{const id=await invoke<number>('tauri',{__tauriModule:'Event',message:{cmd:'listen',event,handler:transformCallback(handler)}});return()=>invoke('tauri',{__tauriModule:'Event',message:{cmd:'unlisten',event,eventId:id}})}
 return {listen,once:listen,emit:(event:string,payload:unknown)=>invoke('tauri',{__tauriModule:'Event',message:{cmd:'emit',event,payload}})}
})
vi.mock('@tauri-apps/api/shell',async()=>{const {invoke}=await import('./qaTauriFacade');return {open:(path:string)=>invoke('tauri',{__tauriModule:'Shell',message:{cmd:'open',path}})}})
import {createProbeHarness,PROBES} from './nativeDomProbes'
let harness:Awaited<ReturnType<typeof createProbeHarness>>
const saved={fetch:globalThis.fetch,open:window.open,xhr:window.XMLHttpRequest,websocket:window.WebSocket,eventSource:window.EventSource,clipboard:Object.getOwnPropertyDescriptor(navigator,'clipboard'),media:Object.getOwnPropertyDescriptor(navigator,'mediaDevices'),beacon:Object.getOwnPropertyDescriptor(navigator,'sendBeacon')}
beforeAll(async()=>{
 const readJson=Response.prototype.json
 vi.spyOn(Response.prototype,'json').mockImplementation(async function(this:Response){await new Promise(resolve=>setTimeout(resolve,25));return readJson.call(this)})
 vi.stubEnv('VITE_KNAPSACK_LOCAL_QA_SAFE','1');vi.stubGlobal('crypto',webcrypto)
 vi.stubGlobal('fetch',()=>{throw new Error('test_fetch_must_be_sealed')})
 Object.defineProperty(window,'__TAURI_IPC__',{value:Object.freeze(()=>{throw new Error('native_bridge_must_remain_untouched')}),writable:false,configurable:true})
 Range.prototype.getBoundingClientRect=()=>({left:20,top:120,bottom:145,right:250,width:230,height:25,x:20,y:120,toJSON:()=>({})})
 const container=document.createElement('main');container.id='qa-root';document.body.append(container)
 harness=await createProbeHarness(container,()=>{throw new Error('no_native_ipc_in_unit_tests')})
})
afterAll(()=>{harness?.dispose();globalThis.fetch=window.fetch=saved.fetch;window.open=saved.open;globalThis.XMLHttpRequest=window.XMLHttpRequest=saved.xhr;globalThis.WebSocket=window.WebSocket=saved.websocket;globalThis.EventSource=window.EventSource=saved.eventSource;for(const[key,value]of[['clipboard',saved.clipboard],['mediaDevices',saved.media],['sendBeacon',saved.beacon]] as const){if(value)Object.defineProperty(navigator,key,value);else Reflect.deleteProperty(navigator,key)}vi.restoreAllMocks();vi.unstubAllGlobals();vi.unstubAllEnvs()})
describe('fixed native DOM probe scenarios (JS DOM transport validation only)',()=>{
 for(const probe of PROBES)it(probe,async()=>{await harness.run(probe);expect(harness.state.forbidden,harness.state.forbiddenOperations.join('; ')).toBe(0)})
 it.each([{statusRead:1,running:true},{statusRead:1,running:false},{statusRead:2,running:true}])('does not continue service startup after disposal: %s',async({statusRead,running})=>{
  const {createPersonScoutFixture}=await import('../../qa-fixtures/person-chat-native')
  const host=document.createElement('div');document.body.append(host)
  const fixture=await createPersonScoutFixture(host)
  const fixtureFetch=globalThis.fetch
  let release:(()=>void)|undefined,disposed=false,statusReads=0
  globalThis.fetch=window.fetch=async(input,init)=>{
   const response=await fixtureFetch(input,init)
   if(String(input).endsWith('/api/clawd/service/status')&&++statusReads===statusRead){
    const read=response.json.bind(response)
    response.json=async()=>{await new Promise<void>(resolve=>{release=resolve});return {...await read(),running}}
   }
   return response
  }
  try{
   const deadline=Date.now()+1500
   while(!release&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,5))
   expect(release).toBeTypeOf('function')
   fixture.dispose();disposed=true;release!()
   await new Promise(resolve=>setTimeout(resolve,100))
   expect(harness.state.forbidden,harness.state.forbiddenOperations.join('; ')).toBe(0)
  }finally{release?.();if(!disposed)fixture.dispose();host.remove()}
 })
 it.each([1,2])('does not fetch keys or persist stale provider state after disposal during key setup read %s',async(statusRead)=>{
  const {createPersonScoutFixture}=await import('../../qa-fixtures/person-chat-native')
  const host=document.createElement('div');document.body.append(host)
  const readJson=Response.prototype.json
  let release:(()=>void)|undefined,disposed=false,keyStatusReads=0
  Response.prototype.json=async function(this:Response){
   const data=await readJson.call(this)
   if(data?.has_key===true&&++keyStatusReads===statusRead){
    await new Promise<void>(resolve=>{release=resolve})
    return {...data,active_provider:'anthropic',model:'synthetic-stale-model'}
   }
   return data
  }
  const fixture=await createPersonScoutFixture(host)
  try{
   const deadline=Date.now()+2000
   while(!release&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,5))
   expect(release, JSON.stringify({keyStatusReads,calls:fixture.state.calls})).toBeTypeOf('function')
   const providerBefore=localStorage.getItem('moltbot_active_provider')
   fixture.dispose();disposed=true;release!()
   await new Promise(resolve=>setTimeout(resolve,100))
   expect(harness.state.forbidden,harness.state.forbiddenOperations.join('; ')).toBe(0)
   expect(localStorage.getItem('moltbot_active_provider')).toBe(providerBefore)
  }finally{release?.();if(!disposed)fixture.dispose();Response.prototype.json=readJson;host.remove()}
 })
 it('preserves the immutable native bridge',()=>{expect(Object.getOwnPropertyDescriptor(window,'__TAURI_IPC__')?.writable).toBe(false);expect(()=>((window as unknown as {__TAURI_IPC__:()=>void}).__TAURI_IPC__)()).toThrow('native_bridge_must_remain_untouched')})
 it('never forwards unrecognized fetch, IPC, opener, or microphone calls',async()=>{await expect(fetch('https://example.invalid/not-allowed')).rejects.toThrow('qa_boundary_blocked');expect(()=>window.open('https://example.invalid')).toThrow('qa_boundary_blocked');await expect(navigator.mediaDevices.getUserMedia({audio:true})).rejects.toThrow('qa_boundary_blocked');expect(()=>new WebSocket('ws://127.0.0.1:18789')).toThrow('qa_boundary_blocked');expect(()=>new XMLHttpRequest()).toThrow('qa_boundary_blocked');expect(()=>new EventSource('https://example.invalid')).toThrow('qa_boundary_blocked');expect(navigator.sendBeacon('https://example.invalid')).toBe(false);expect(()=>((window as unknown as {__knapsackQaTransport__:(p:unknown)=>void}).__knapsackQaTransport__)({cmd:'privacy_provider_candidates',callback:0,error:0})).toThrow('qa_boundary_blocked');expect(harness.state.forbidden).toBe(8)})
})
