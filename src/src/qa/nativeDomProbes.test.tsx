// @vitest-environment jsdom
import {afterAll,beforeAll,describe,it,expect,vi} from 'vitest'
import {webcrypto} from 'node:crypto'
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
 for(const probe of PROBES)it(probe,async()=>{await harness.run(probe);expect(harness.state.forbidden).toBe(0)})
 it('preserves the immutable native bridge',()=>{expect(Object.getOwnPropertyDescriptor(window,'__TAURI_IPC__')?.writable).toBe(false);expect(()=>((window as unknown as {__TAURI_IPC__:()=>void}).__TAURI_IPC__)()).toThrow('native_bridge_must_remain_untouched')})
 it('never forwards unrecognized fetch, IPC, opener, or microphone calls',async()=>{await expect(fetch('https://example.invalid/not-allowed')).rejects.toThrow('qa_boundary_blocked');expect(()=>window.open('https://example.invalid')).toThrow('qa_boundary_blocked');await expect(navigator.mediaDevices.getUserMedia({audio:true})).rejects.toThrow('qa_boundary_blocked');expect(()=>new WebSocket('ws://127.0.0.1:18789')).toThrow('qa_boundary_blocked');expect(()=>new XMLHttpRequest()).toThrow('qa_boundary_blocked');expect(()=>new EventSource('https://example.invalid')).toThrow('qa_boundary_blocked');expect(navigator.sendBeacon('https://example.invalid')).toBe(false);expect(()=>((window as unknown as {__knapsackQaTransport__:(p:unknown)=>void}).__knapsackQaTransport__)({cmd:'privacy_provider_candidates',callback:0,error:0})).toThrow('qa_boundary_blocked');expect(harness.state.forbidden).toBe(8)})
})
