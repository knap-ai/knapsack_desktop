const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('copy commands are Desktop-native only and never mounted as mobile/shared routes',()=>{
 const main=read('src-tauri/src/main.rs'),server=read('src-tauri/src/server/actix.rs'),commands=read('src-tauri/src/api/recovered_copy_commands.rs');
 for(const cmd of ['prepare','list','save','restore'])assert.match(main,new RegExp('recovered_copy_commands::desktop_recovered_'+cmd));
 assert.doesNotMatch(server,/recovered_copy/);assert.doesNotMatch(read('src-tauri/src/api/mobile.rs'),/recovered_copy/);
 assert.match(commands,/native_read_db/);assert.match(commands,/spawn_blocking/);assert.doesNotMatch(commands,/get_db_conn|log::|println!|Client::/);
});
test('separate append-only store has no canonical writer, provider, cleanup or mirroring path',()=>{
 const s=read('src-tauri/src/api/recovered_copy.rs').split('#[cfg(test)]mod tests')[0].split('#[cfg(test)]\nmod tests')[0];
 assert.match(s,/desktop-recovered-copies/);assert.match(s,/copies-v1.sqlite3/);assert.match(s,/TransactionBehavior::Immediate/);assert.match(s,/SQLITE_OPEN_NOFOLLOW/);
 assert.doesNotMatch(s,/UPDATE copies|DELETE FROM copies|save_notes|delete_transcript|remove_file|remove_dir|reqwest|log::|println!/);
 assert.match(s,/core::snapshot_at/);assert.match(s,/FROM transcripts WHERE thread_id/);assert.match(s,/owner\(home, c/);
});
test('UI queues only explicit recovery with all manual inputs and matched receipt/readback',()=>{
 const s=read('src/components/organisms/MeetingNotesMode/RecoveredCopy.tsx');assert.match(s,/Save recovered copy/);assert.match(s,/Desktop only/);assert.match(s,/Original saved notes \(may include manual notes\)/);assert.match(s,/Current editor manual draft/);assert.match(s,/Agenda questions remain open questions/);
 assert.match(s,/receipt.requestId\s*!==\s*p.request.requestId/);assert.match(s,/receipt.bodyHash\s*!==\s*bodyHash/);assert.match(s,/preview.editorEpoch\s*!==\s*editor.current.epoch/);assert.match(s,/PROFILE_CHANGED_EVENT/);assert.match(s,/desktop_recovered_list/);
 assert.doesNotMatch(s,/fetch\(|saveNotes\(|deleteTranscript|capturePostMeetingSource|sendSlack|onSynthesisFinish|setNotesMarkdown/);
 const parent=read('src/components/organisms/MeetingNotesMode/index.tsx');assert.match(parent,/!isMeetingRecording && \(wasRecorded \|\| transcriptAvailable\) && <RecoveredCopy/);
});

test('both platform CI workflows execute storage regressions with unchanged security policy',()=>{
 for(const file of ['build-macos.yml','build-windows.yml']){const workflow=fs.readFileSync(path.join(root,'../.github/workflows',file),'utf8');assert.match(workflow,/run: npm run test:desktop-recovered-copy/)}
 const script=JSON.parse(read('package.json')).scripts['test:desktop-recovered-copy'];assert.match(script,/recovered-copy-wiring.test.cjs/);assert.match(script,/recovered-copy-core-tests.cjs/);
});
