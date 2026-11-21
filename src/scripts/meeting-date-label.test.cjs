const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../src/components/organisms/MeetingNotesMode')
const { meetingDateLabel } = require(path.join(root, 'meetingDateLabel.ts'))
test('no date for unlinked, invalid, or millisecond values', () => {
 for(const value of [undefined,null,0,-1,NaN,Infinity,Date.now(),'1761984000']) assert.equal(meetingDateLabel(value),null)
})
test('old dates stay dated and Today only means the same local day',()=>{
 const now=new Date(2026,10,21,0,1),prior=new Date(2026,10,20,23,59),earlier=new Date(2025,0,6,13)
 assert.equal(meetingDateLabel(prior.getTime()/1000,now),'Nov 20');assert.equal(meetingDateLabel(earlier.getTime()/1000,now),'Jan 6');assert.equal(meetingDateLabel(now.getTime()/1000,now),'Today')
})
test('both headers omit the entire date for absent calendar occurrence',()=>{
 const source=fs.readFileSync(path.join(root,'index.tsx'),'utf8')
 assert.match(source,/const meetingDisplayDate = meetingDateLabel\(meeting\?\.start\)/)
 assert.equal((source.match(/\{meetingDisplayDate && <span/g)||[]).length,2)
 assert.equal((source.match(/\{meetingDisplayDate\}/g)||[]).length,2)
})
