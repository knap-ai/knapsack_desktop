// @vitest-environment jsdom
import {cleanup,act,render,screen,fireEvent,renderHook,waitFor} from '@testing-library/react'
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest'
import {useNotesEditReview} from './useNotesEditReview'
import type {LLMParams} from 'src/App'
const before='You represent Visa.\nMark owns pricing.\n> Frida: I represent Visa.'
const after='Frida represents Visa.\nMark owns pricing.\n> Frida: I represent Visa.'
const output=JSON.stringify({edits:[{before:'You represent Visa.',after:'Frida represents Visa.',reason:'Transcript identifies Frida.'}],ambiguities:[]})
function fixture(){let callback:LLMParams|undefined;const saved=vi.fn();const queue=(p:LLMParams)=>{callback=p};const opts={accountScope:'synthetic',threadId:42,completed:true,notes:before,context:'Authenticated user: Mark. Frida: Visa.',queue,flush:async()=>{},saved};return{opts,saved,finish:()=>callback?.messageFinishCallback?.(output)}}
afterEach(()=>cleanup())
beforeEach(()=>{localStorage.clear();vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({success:true,data:{thread_id:42,exists:true,notes:before,revision:'base'}})})))})
describe('meeting notes edit lifecycle',()=>{
 it('persists proposal drafts without saving or changing editor',async()=>{const f=fixture();const h=renderHook(()=>useNotesEditReview(f.opts));let work:Promise<boolean>;act(()=>{work=h.result.current.request('You swapped me and Frida')});await waitFor(()=>expect(localStorage.getItem('meeting-notes-edit:synthetic:42')).toContain('base'));await act(async()=>{f.finish();await work!});expect(f.saved).not.toHaveBeenCalled();expect(fetch).toHaveBeenCalledTimes(1);h.unmount();const restored=renderHook(()=>useNotesEditReview(f.opts));expect(restored.result.current.review.props.children).toBeTruthy();expect(JSON.parse(localStorage.getItem('meeting-notes-edit:synthetic:42')!).proposal.notes).toBe(after)})
 it('drops out-of-order proposal callbacks after switching meetings',async()=>{const f=fixture();const h=renderHook(p=>useNotesEditReview(p),{initialProps:f.opts});let work:Promise<boolean>;act(()=>{work=h.result.current.request('You swapped me and Frida')});await waitFor(()=>expect(localStorage.getItem('meeting-notes-edit:synthetic:42')).toContain('base'));h.rerender({...f.opts,threadId:43,notes:'other'});await act(async()=>{f.finish();await work!});expect(localStorage.getItem('meeting-notes-edit:synthetic:43')).toBeNull();expect(f.saved).not.toHaveBeenCalled()})
 it('leaves Q&A on the existing chat path and blocks unfinished meetings',async()=>{const f=fixture();const h=renderHook(()=>useNotesEditReview({...f.opts,completed:false}));expect(await h.result.current.request('Who owns pricing?')).toBe(false);await act(async()=>{expect(await h.result.current.request('You swapped me and Frida')).toBe(true)});expect(fetch).not.toHaveBeenCalled()})
})

describe('review apply and undo',()=>{
 async function setup(){
  const f=fixture();let api:ReturnType<typeof useNotesEditReview>
  function Harness(p:typeof f.opts){api=useNotesEditReview(p);return api.review}
  const ui=render(<Harness {...f.opts}/>);let work:Promise<boolean>
  act(()=>{work=api.request('You swapped me and Frida')})
  await waitFor(()=>expect(localStorage.getItem('meeting-notes-edit:synthetic:42')).toContain('base'))
  await act(async()=>{f.finish();await work!})
  return{...f,ui,Harness}
 }
 it('applies only after preview and restores the prior revision through explicit Undo',async()=>{
  const f=await setup();expect(f.saved).not.toHaveBeenCalled()
  vi.mocked(fetch).mockImplementation(async(_url,init)=>{
   const body=JSON.parse(String(init?.body));expect(body.thread_id).toBe(42)
   return {ok:true,json:async()=>({success:true,data:{thread_id:42,revision_id:'receipt',revision:body.restore_revision?'restored':'applied',notes:body.restore_revision?before:after}})} as Response
  })
  fireEvent.click(screen.getByText('Apply to saved notes'));await waitFor(()=>expect(f.saved).toHaveBeenCalledWith(after))
  f.ui.rerender(<f.Harness {...f.opts} notes={after}/>);
  fireEvent.click(screen.getByText('Undo notes edit'));await waitFor(()=>expect(f.saved).toHaveBeenCalledWith(before))
 })
 it('preserves user edits and refuses a stale proposal before posting',async()=>{
  const f=await setup();f.ui.rerender(<f.Harness {...f.opts} notes="User typed a new fact"/>);
  fireEvent.click(screen.getByText('Apply to saved notes'));await screen.findByRole('alert')
  expect(fetch).toHaveBeenCalledTimes(1);expect(f.saved).not.toHaveBeenCalled();expect(screen.getByText('Apply to saved notes')).toBeTruthy()
 })
 it('retains proposal on save failure and supports explicit retry',async()=>{
  const f=await setup();vi.mocked(fetch).mockResolvedValueOnce({ok:false,json:async()=>({success:false,error:'Disk full'})} as Response)
  fireEvent.click(screen.getByText('Apply to saved notes'));await screen.findByText('Disk full');expect(f.saved).not.toHaveBeenCalled()
  expect(JSON.parse(localStorage.getItem('meeting-notes-edit:synthetic:42')!).proposal.notes).toBe(after)
 })
 it('does not paint a completed in-flight save into a different meeting',async()=>{
  const f=await setup();let finish:(value:Response)=>void=()=>{}
  vi.mocked(fetch).mockImplementation(()=>new Promise<Response>(r=>{finish=r}))
  fireEvent.click(screen.getByText('Apply to saved notes'));await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(2))
  f.ui.rerender(<f.Harness {...f.opts} threadId={43} notes="other meeting"/>);
  await act(async()=>{finish({ok:true,json:async()=>({success:true,data:{thread_id:42,revision_id:'receipt',revision:'applied',notes:after}})} as Response)})
  expect(f.saved).not.toHaveBeenCalled();expect(localStorage.getItem('meeting-notes-edit:synthetic:43')).toBeNull();expect(JSON.parse(localStorage.getItem('meeting-notes-edit:synthetic:42')!).receipt.revision).toBe('applied')
 })
})

describe('explicit remembered spelling review',()=>{
 const correction={from:'Knapsak',to:'Knapsack',enabled:true,source:'explicit' as const,createdAt:1}
 const notes='Knapsak owns pricing.\n> Original evidence remains unchanged.'
 function setupSpelling(){
  let memory=JSON.stringify([correction]);let api:ReturnType<typeof useNotesEditReview>
  const saved=vi.fn(),queue=vi.fn()
  const opts={accountScope:'synthetic',threadId:42,completed:true,notes,context:'meeting',queue,flush:async()=>{},saved,spellings:()=>memory}
  function Harness(p:typeof opts){api=useNotesEditReview(p);return api.review}
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({success:true,data:{thread_id:42,exists:true,notes,revision:'base'}})})))
  const ui=render(<Harness {...opts}/>);
  return{ui,opts,saved,queue,update:(notes:string)=>ui.rerender(<Harness {...opts} notes={notes}/>),prepare:()=>api.prepareSpellings([correction]),disable:()=>{memory='[]'}}
 }
 it('prepares a deterministic local preview without generating or saving',async()=>{
  const f=setupSpelling();await act(async()=>{await f.prepare()})
  expect(screen.getByText('Knapsak',{selector:'del'})).toBeTruthy()
  expect(screen.getByText('Knapsack',{selector:'ins'})).toBeTruthy()
  expect(f.queue).not.toHaveBeenCalled();expect(f.saved).not.toHaveBeenCalled()
  expect(fetch).toHaveBeenCalledTimes(1)
 })
 it('rejects disabled or deleted memory even without a React rerender',async()=>{
  const f=setupSpelling();await act(async()=>{await f.prepare()});f.disable()
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('changed'))
  expect(fetch).toHaveBeenCalledTimes(1);expect(f.saved).not.toHaveBeenCalled()
 })
 it('rejects a preview when the editor changed',async()=>{
  const f=setupSpelling();await act(async()=>{await f.prepare()})
  f.update('Newer text')
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('changed'))
  expect(fetch).toHaveBeenCalledTimes(1)
 })
 it('uses the existing revision API and retains reliable undo after forgetting a mapping',async()=>{
  const f=setupSpelling();await act(async()=>{await f.prepare()})
  vi.mocked(fetch).mockResolvedValueOnce({ok:true,json:async()=>({success:true,data:{thread_id:42,notes:'Knapsack owns pricing.\n> Original evidence remains unchanged.',revision:'after',revision_id:'restore-base'}})} as Response)
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(()=>expect(f.saved).toHaveBeenCalledOnce())
  const call=vi.mocked(fetch).mock.calls[1]
  expect(String(call[0])).toContain('/revise')
  expect(JSON.parse(String(call[1]?.body)).expected_revision).toBe('base')
  f.disable()
  f.update('Knapsack owns pricing.\n> Original evidence remains unchanged.')
  vi.mocked(fetch).mockResolvedValueOnce({ok:true,json:async()=>({success:true,data:{thread_id:42,notes,revision:'restored',revision_id:'undo'}})} as Response)
  fireEvent.click(screen.getByText('Undo notes edit'))
  await waitFor(()=>expect(f.saved).toHaveBeenCalledTimes(2))
  expect(JSON.parse(String(vi.mocked(fetch).mock.calls[2][1]?.body))).toMatchObject({expected_revision:'after',restore_revision:'restore-base'})
 })
 it('rechecks deleted memory after a pending autosave flush',async()=>{
  const f=setupSpelling();await act(async()=>{await f.prepare()})
  let release:()=>void=()=>{}
  f.opts.flush=()=>new Promise<void>(resolve=>{release=resolve})
  f.update(f.opts.notes)
  fireEvent.click(screen.getByText('Apply to saved notes'))
  f.disable()
  await act(async()=>{release()})
  await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('changed'))
  expect(fetch).toHaveBeenCalledTimes(1)
 })

})
