import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const dist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../src-tauri/resources/clawdbot/dist')
const source=fs.readFileSync(path.join(dist,'server.impl-BCpatfdp.js'),'utf8')
const start='loadStartupPlugins: runtimePluginsLoaded ? void 0 : async (loadOptions = {}) => {'
const end='\n\t\t\t},\n\t\t\tonStartupPluginsLoading:'
assert.equal(source.split(start).length,2)
const body=source.slice(source.indexOf(start)+start.length,source.indexOf(end,source.indexOf(start))).replace(/import\(("[^"\n]+")\)/g,'loadModule($1)')
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor
const keys=['loadOptions','loadModule','startupPluginIds','defaultWorkspaceDir','loadStartupPluginsModule','gatewayPluginConfigAtStart','startupActivationSourceConfig','log','baseMethods','coreGatewayMethodNames','pluginHostServices','pluginLookUpTable','startupTrace','deferredConfiguredChannelPluginIds']
const callback=new AsyncFunction(...keys,body)
async function invoke({managed='1',fast='1',deferred=true,workspace,planIds=['qa-startup'],initial=['browser'],deferredIds=['slack'],fallback='slack,telegram',config={}}={}){
 const saved={};for(const [key,value]of Object.entries({OPENCLAW_DESKTOP_MANAGED_GATEWAY:managed,OPENCLAW_DESKTOP_FAST_BIND:fast,OPENCLAW_BUNDLED_CHANNEL_FALLBACK_IDS:fallback})){saved[key]=process.env[key];process.env[key]=value}
 const calls=[]
 const loadModule=async name=>{
  calls.push(name)
  if(name==='./server-plugin-bootstrap-Cf8Io8s6.js')return {loadGatewayStartupPlugins:async options=>({kind:'fast',options})}
  if(name==='./channel-plugin-ids-nB-ga3MN.js')return {t:options=>{calls.push({plan:options});return {pluginIds:planIds}}}
  if(name==='./agent-scope-config-CMp71_27.js')return {c:()=> 'main',o:(cfg,id)=>{calls.push({workspace:cfg,id});return '/synthetic/default-workspace'}}
  throw Error('Unexpected import: '+name)
 }
 const values=[{includeDeferred:deferred},loadModule,initial,workspace,async()=>({loadGatewayStartupPluginRuntime:async options=>({kind:'runtime',options})}),config,config,{},[],[],{},undefined,{},deferredIds]
 try{return {result:await callback(...values),calls}}finally{for(const [key,value]of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value}}
}
test('early fast bind remains browser-only and does not discover manifests or workspace',async()=>{
 const {result,calls}=await invoke({deferred:false});assert.equal(result.kind,'fast');assert.deepEqual(result.options.pluginIds,['browser']);assert(!calls.some(c=>typeof c==='object'))
})
test('deferred desktop startup loads policy plan, deduplicates existing channels and passes resolved workspace',async()=>{
 const {result,calls}=await invoke({planIds:['qa-startup','slack','qa-startup']});assert.equal(result.kind,'runtime');assert.deepEqual(result.options.startupPluginIds,['browser','qa-startup','slack','telegram']);assert.equal(result.options.workspaceDir,'/synthetic/default-workspace');assert.equal(calls.find(c=>c.plan).plan.workspaceDir,result.options.workspaceDir)
})
test('existing workspace is preserved and non-fast paths do not expand planning',async()=>{
 const existing=await invoke({workspace:'/configured/workspace'});assert.equal(existing.result.options.workspaceDir,'/configured/workspace');assert(!existing.calls.some(c=>c.workspace))
 for(const flags of [{managed:'0',fast:'1'},{managed:'1',fast:'0'}]){
  const {result,calls}=await invoke({...flags,workspace:'/original/workspace'});assert.deepEqual(result.options.startupPluginIds,['browser','slack','telegram']);assert(!calls.some(c=>typeof c==='object'));assert.equal(result.options.workspaceDir,'/original/workspace')
 }
})
const {t:loadPlan}=await import(pathToFileURL(path.join(dist,'channel-plugin-ids-nB-ga3MN.js')).href)
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'knapsack-startup-plan-'));const state=path.join(root,'state');fs.mkdirSync(state,{mode:0o700})
 const paths=['qa-startup','qa-other'].map(id=>{const dir=path.join(root,id);fs.mkdirSync(dir,{mode:0o700});fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({name:id,version:'1.0.0',type:'module',openclaw:{extensions:['./index.mjs']}}));fs.writeFileSync(path.join(dir,'openclaw.plugin.json'),JSON.stringify({id,activation:{onStartup:true},configSchema:{type:'object',additionalProperties:false,properties:{}}}));fs.writeFileSync(path.join(dir,'index.mjs'),'throw new Error("Planning must not execute plugin entrypoints"); export default {};');return dir})
 const config={agents:{defaults:{workspace:path.join(root,'workspace')}},plugins:{allow:['browser','slack','qa-startup','qa-other'],load:{paths},entries:{'qa-startup':{enabled:true},'qa-other':{enabled:true}}}}
 const env={OPENCLAW_HOME:root,OPENCLAW_STATE_DIR:state,OPENCLAW_CONFIG_PATH:path.join(state,'openclaw.json'),OPENCLAW_PLUGIN_DISCOVERY_ALLOWLIST:'browser,slack,qa-startup,qa-other',OPENCLAW_DESKTOP_MANAGED_GATEWAY:'1',OPENCLAW_DESKTOP_FAST_BIND:'1'}
 const plan=c=>loadPlan({config:c,activationSourceConfig:c,env,workspaceDir:config.agents.defaults.workspace}).pluginIds
 return {root,config,plan,close:()=>fs.rmSync(root,{recursive:true,force:true})}
}
test('actual manifest policy admits each enabled startup plugin without executing its code',()=>{
 const f=fixture();try{const ids=f.plan(f.config);assert(ids.includes('qa-startup'));assert(ids.includes('qa-other'))}finally{f.close()}
})
test('actual manifest policy preserves disabled, denied and global-disable boundaries',()=>{
 const f=fixture();try{
  const disabled=structuredClone(f.config);disabled.plugins.entries['qa-startup'].enabled=false;assert(!f.plan(disabled).includes('qa-startup'))
  const denied=structuredClone(f.config);denied.plugins.allow=['browser','slack'];assert(!f.plan(denied).includes('qa-startup'));assert(!f.plan(denied).includes('qa-other'))
  const global=structuredClone(f.config);global.plugins.enabled=false;assert.equal(f.plan(global).length,0)
 }finally{f.close()}
})
