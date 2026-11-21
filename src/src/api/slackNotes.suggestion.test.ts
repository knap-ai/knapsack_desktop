// @vitest-environment jsdom
import {createHash,webcrypto} from 'node:crypto'
import {beforeEach,afterEach,it,expect,vi} from 'vitest'
import {confirmedSlackDestination,rememberConfirmedSlackDestination,warmSlackSuggestion,freshSlackSuggestion,slackSuggestionScope} from './slackNotes'
import {PROFILE_CHANGED_EVENT} from 'src/utils/profileScope'
const profile={email:'synthetic@example.test',uuid:'qa-owner'},calendar='calendar@example.test'
vi.mock('src/utils/KNLocalStorage',()=>({KNLocalStorage:{getItem:async()=>profile}}))
const owner=createHash('sha256').update(profile.email).digest('hex')
const destination={owner,accountId:'qa-grant',teamId:'T-QA',channelId:'C-QA'}
const receipt={state:'sent',teamId:'T-QA',channelId:'C-QA',ts:'synthetic-receipt'}
beforeEach(()=>{localStorage.clear();vi.stubGlobal('crypto',webcrypto);vi.stubGlobal('fetch',vi.fn(async()=>{throw Error('No unplanned request permitted')}))})
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks()})
it('selection and malformed or mismatched receipts cannot create a suggestion',async()=>{
 expect(await confirmedSlackDestination(owner,calendar)).toBeUndefined()
 for(const r of [{...receipt,state:'uncertain'},{...receipt,teamId:'other'},{...receipt,ts:''}]) await rememberConfirmedSlackDestination(destination,calendar,r,()=>true)
 await rememberConfirmedSlackDestination(destination,calendar,receipt,()=>false)
 expect(await confirmedSlackDestination(owner,calendar)).toBeUndefined();expect(fetch).not.toHaveBeenCalled()
})
it('confirmed hints stay bound to owner and calendar and no hint performs no discovery',async()=>{
 await rememberConfirmedSlackDestination(destination,calendar,receipt,()=>true)
 expect(await confirmedSlackDestination(owner,calendar)).toEqual(destination)
 expect(await confirmedSlackDestination(owner,'other@example.test')).toBeUndefined()
 expect(await confirmedSlackDestination('other',calendar)).toBeUndefined()
 expect(await warmSlackSuggestion(9001,profile.email,'other@example.test')).toBeUndefined();expect(fetch).not.toHaveBeenCalled()
})
it('warmup revalidates exact grant/team/channel with no send and no calendar query',async()=>{
 await rememberConfirmedSlackDestination(destination,calendar,receipt,()=>true)
 const calls:string[]=[]
 vi.mocked(fetch).mockImplementation(async(input,init)=>{
  const url=String(input);calls.push(url)
  if(url.endsWith('/workspaces'))return new Response(JSON.stringify({success:true,data:{owner,accounts:[{accountId:'qa-grant',teamId:'T-QA',name:'Fictional'}]}}))
  if(url.endsWith('/channels')){expect(JSON.parse(String(init?.body))).toEqual({owner,accountId:'qa-grant',teamId:'T-QA'});return new Response(JSON.stringify({success:true,data:{channels:[{id:'C-QA',name:'synthetic',private:false}]}}))}
  throw Error('Send or unexpected endpoint forbidden')
 })
 const suggestion=await warmSlackSuggestion(9002,profile.email,calendar)
 expect(suggestion?.destination).toEqual(destination);expect(calls).toHaveLength(2)
 expect(calls.join(' ')).not.toContain(calendar)
 const scope=slackSuggestionScope(9002,profile.email,calendar)
 expect(freshSlackSuggestion(suggestion,scope)).toBe(suggestion)
 expect(freshSlackSuggestion(suggestion,'other')).toBeUndefined()
 expect(freshSlackSuggestion({...suggestion!,validatedAt:Date.now()-30000},scope)).toBeUndefined()
})
it('account invalidation while inventory is pending suppresses channel discovery',async()=>{
 await rememberConfirmedSlackDestination(destination,calendar,receipt,()=>true)
 let release!:(r:Response)=>void
 vi.mocked(fetch).mockImplementation(()=>new Promise(r=>{release=r}))
 const pending=warmSlackSuggestion(9003,profile.email,calendar)
 for(let i=0;i<30&&!release;i++)await new Promise(r=>setTimeout(r,0))
 expect(release).toBeTypeOf('function');window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
 release(new Response(JSON.stringify({success:true,data:{owner,accounts:[{accountId:'qa-grant',teamId:'T-QA',name:'Fictional'}]}})))
 expect(await pending).toBeUndefined();expect(fetch).toHaveBeenCalledOnce()
})
