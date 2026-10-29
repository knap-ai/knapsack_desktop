// Loaded instead of the SDK core only by the opt-in QA dev server.
// The immutable native bridge remains untouched; only fixed mock/result calls
// can reach the separately installed synthetic transport.
type Payload = {cmd:string;callback:number;error:number;[key:string]:unknown}
type QaWindow = Window & {__knapsackQaTransport__?:(payload:Payload)=>void}
export function transformCallback<T>(callback?:(result:T)=>void,once=false):number {
 const id=window.crypto.getRandomValues(new Uint32Array(1))[0]
 Object.defineProperty(window,`_${id}`,{configurable:true,value:(result:T)=>{if(once)Reflect.deleteProperty(window,`_${id}`);callback?.(result)}})
 return id
}
export function invoke<T>(cmd:string,args:Record<string,unknown>={}):Promise<T>{
 return new Promise((resolve,reject)=>{
  let callback=0,error=0
  const clear=()=>{Reflect.deleteProperty(window,`_${callback}`);Reflect.deleteProperty(window,`_${error}`)}
  callback=transformCallback<T>(value=>{clear();resolve(value)},true)
  error=transformCallback<unknown>(value=>{clear();reject(value)},true)
  try{const transport=(window as QaWindow).__knapsackQaTransport__;if(!transport)throw new Error('qa_transport_unavailable');transport({...args,cmd,callback,error})}catch(reason){clear();reject(reason)}
 })
}
export function convertFileSrc():never {throw new Error('qa_file_conversion_blocked')}
