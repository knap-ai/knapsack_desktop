const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const read=p=>fs.readFileSync(path.join(__dirname,'../src/components',p),'utf8')
test('recording identity controls one chrome status, with separate privacy and no invented timer',()=>{
 const h=read('molecules/HeaderRecording/index.tsx'),home=read('templates/Home/Home.tsx'),m=read('organisms/MeetingsTabView/index.tsx')
 assert.match(home,/activeRecordingThreadId !== null && \(/);assert.match(home,/key=\{recordingHandlers.activeRecordingThreadId\}/);assert.match(home,/centeredComponent=\{<PrivacyModeControl \/>\}/)
 assert.match(h,/role="status" className="sr-only"/);assert.doesNotMatch(h,/performance\.now|role="timer"/);assert.match(m,/!isCurrentRecording && <button className="MeetingsTabView__topbar-summary/);assert.doesNotMatch(m,/Recording privately/)
})
