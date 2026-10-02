const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const { transform } = require('esbuild')
async function run(candidates, inference, request) {
  const source = (await fs.readFile(`${__dirname}/../src/utils/privacyProviderSelection.ts`, 'utf8')).replace(/^import .*\n/gm, '').replace('export async function', 'async function')
  const {code} = await transform(source, {loader:'ts',format:'cjs'})
  const saved=[],events=[]
  const select = new Function('invoke','isLocalModelTag','fetch','localStorage','window',code+'\nreturn selectPrivacyProvider;')(
    async name=>{assert.equal(name,'privacy_provider_candidates');return candidates},
    name=>!name.includes('cloud'),
    async (url, opts={})=>request(new URL(url).pathname,opts.body?JSON.parse(opts.body):null),
    {setItem:(...args)=>saved.push(args)}, {dispatchEvent:event=>events.push(event.type)},
  )
  return { selected:await select(inference),saved,events }
}
const ok = data=>({ok:true,json:async()=>({success:true,...data})})
test('privacy switch selects the first configured eligible route and notifies labels', async()=>{
  const calls=[]
  const result=await run([{provider:'knapsack',model:'auto'}],'zero-retention',async(path,body)=>{calls.push({path,body});return ok({})})
  assert.equal(result.selected,'knapsack')
  assert.deepEqual(calls,[{path:'/api/clawd/service/set-api-key',body:{provider:'knapsack',model:'auto',key:''}}])
  assert.deepEqual(result.events,['provider-settings-changed'])
})
test('an unavailable eligible provider does not hide another configured route',async()=>{
  const result=await run([{provider:'knapsack',model:'auto'},{provider:'trustedrouter',model:'trustedrouter/zdr'}],'zero-retention',async(path,body)=>body.provider==='knapsack'?{ok:false,json:async()=>({message:'expired'})}:ok({}))
  assert.equal(result.selected,'trustedrouter')
  assert.equal(result.saved.length,1)
})
test('on-device mode discovers installed local models and never chooses a cloud tag',async()=>{
  const calls=[]
  const result=await run([],'local-only',async(path,body)=>{
    calls.push({path,body})
    return path.endsWith('/models')?ok({models:[{name:'remote:cloud'},{name:'qwen3:4b'}]}):ok({})
  })
  assert.equal(result.selected,'ollama')
  assert.equal(calls[1].body.model,'qwen3:4b')
  assert.equal(calls[1].body.cloud,false)
  assert.equal(calls[2].body.provider,'ollama')
})
test('no eligible routes leaves the chosen privacy policy intact',async()=>{
  const result=await run([],'zero-retention',()=>assert.fail('No fallback network call'))
  assert.equal(result.selected,null)
  assert.deepEqual(result.saved,[])
})
