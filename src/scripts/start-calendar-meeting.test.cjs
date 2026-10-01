const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const {transformSync} = require('esbuild')
const source = fs.readFileSync(`${__dirname}/../src/hooks/feed/useFeed.tsx`,'utf8')
const start = source.indexOf('  const startCalendarMeetingOnce = async')
const end = source.indexOf("  const startCalendarMeeting: IFeed",start)
function harness(created=true) {
  const state={content:{},selected:null,started:[],created:0,recording:null}
  class FeedItem {constructor(data){Object.assign(this,data)}getTitle(){return this.title}}
  const context={
    shouldSaveTranscript:async()=>true,ThreadType:{MEETING_NOTES:'notes'},FeedItem,
    createThread:async()=>{state.created++;return created?{id:99,threadType:'notes',title:'Notes'}:undefined},
    KNDateUtils:{timelineKeyFromTimestamp:()=> 'today',sortByTimestamp:items=>items},
    setFeedContent:fn=>{state.content=fn(state.content)},
    setSelectedFeedItem:item=>{state.selected=item},setSubTab:()=>{},SubTabChoices:{Workspace:'workspace'},
    startRecord:async(...args)=>state.started.push(args),setIsRecording:(item,value)=>{state.recording={item,value}},
    logError:()=>{},handleErrorContact:()=>{},
  }
  const code=transformSync(source.slice(start,end)+'\nglobalThis.run=startCalendarMeetingOnce',{loader:'ts',format:'cjs'}).code
  vm.runInNewContext(code,context)
  return {state,run:context.run,item:threads=>new FeedItem({id:7,title:'Calendar meeting',timestamp:new Date(),calendarEvent:{id:42},threads})}
}
test('Start now creates and selects notes for an existing threadless calendar entry',async()=>{
 const {state,run,item}=harness();await run(item([]))
 assert.equal(state.created,1);assert.equal(state.selected.threads[0].id,99)
 assert.equal(state.started[0][0],99);assert.equal(state.started[0][2],42)
 assert.equal(state.content.today[0],state.selected);assert.equal(state.recording.item,state.selected)
 assert.equal(state.recording.value,true)
})
test('Start now records the notes thread rather than the first preparation thread',async()=>{
 const {state,run,item}=harness();await run(item([{id:8,threadType:'prep'},{id:9,threadType:'notes'}]))
 assert.equal(state.created,0);assert.equal(state.started[0][0],9)
 assert.ok(state.selected.threads.some(t=>t.id===8));assert.equal(state.recording.value,true)
})
test('prep-only meetings gain notes; failed note creation does not start recording',async()=>{
 const good=harness();await good.run(good.item([{id:8,threadType:'prep'}]))
 assert.equal(good.state.selected.threads.length,2);assert.equal(good.state.started[0][0],99)
 const bad=harness(false);await assert.rejects(bad.run(bad.item([])),/Could not create meeting notes/)
 assert.equal(bad.state.started.length,0)
})
