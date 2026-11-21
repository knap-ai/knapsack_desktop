// @vitest-environment jsdom
import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react'
import { afterEach,it,expect,vi } from 'vitest'
import { invoke } from '@tauri-apps/api/tauri'
import HeaderRecording from './index'
vi.mock('@tauri-apps/api/tauri',()=>({invoke:vi.fn()}))
afterEach(()=>{cleanup();vi.resetAllMocks()})
it('mounting and changing pause status never starts or stops capture',()=>{
 const v=render(<HeaderRecording isPaused={false}/>);expect(screen.getByRole('status').textContent).toBe('Recording');expect(screen.queryByRole('timer')).toBeNull()
 v.rerender(<HeaderRecording isPaused/>);expect(screen.getByRole('status').textContent).toBe('Recording paused');expect(invoke).not.toHaveBeenCalled()
})
it('opens only on explicit click and keeps Stop available',()=>{
 const open=vi.fn();render(<HeaderRecording isPaused onOpenMeeting={open}/>);fireEvent.click(screen.getByRole('button',{name:'Open active meeting'}));expect(open).toHaveBeenCalledOnce();expect(screen.getByRole('button',{name:'Stop recording'})).toBeTruthy();expect(invoke).not.toHaveBeenCalled()
})
it('deduplicates pending Stop and permits explicit retry after failure',async()=>{
 let reject!:(e:Error)=>void
 vi.mocked(invoke).mockImplementationOnce(()=>new Promise((_r,j)=>{reject=j})).mockResolvedValueOnce(undefined)
 render(<HeaderRecording isPaused={false}/>);const stop=screen.getByRole('button',{name:'Stop recording'}) as HTMLButtonElement
 fireEvent.click(stop);fireEvent.click(stop);expect(stop.disabled).toBe(true);expect(invoke).toHaveBeenCalledTimes(1)
 reject(Error('synthetic'));await waitFor(()=>expect(screen.getByRole('alert')).toBeTruthy());expect(stop.disabled).toBe(false)
 fireEvent.click(stop);await waitFor(()=>expect(stop.disabled).toBe(false));expect(screen.queryByRole('alert')).toBeNull();expect(invoke).toHaveBeenNthCalledWith(2,'emit_stop_events')
})
