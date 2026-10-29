const test=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const rust=path.join(__dirname,'../src-tauri/src')
const read=file=>fs.readFileSync(path.join(rust,file),'utf8')
function functionBody(source,name){const start=source.indexOf(`fn ${name}(`);assert.ok(start>=0,name);return source.slice(source.indexOf('{',start)+1)}
test('compiled identity gates optional startup before all five background workers are scheduled',()=>{
 const qa=read('qa_launch.rs');assert.match(functionBody(qa,'start_background_work'),/^\s*start_background_work_for_build\(is_synthetic_build\(\), start\)/)
 const main=read('main.rs');const setup=main.slice(main.indexOf('fn setup_handler('),main.indexOf('"setup_handler: app_local_data_dir'))
 const blocks=[];let cursor=0
 while((cursor=setup.indexOf('qa_launch::start_background_work(|| {',cursor))>=0){const begin=setup.indexOf('{',cursor);let depth=1,end=begin+1;for(;end<setup.length&&depth;end++){if(setup[end]==='{')depth++;if(setup[end]==='}')depth--}blocks.push(setup.slice(begin,end));cursor=end}
 for(const task of ['state_backup::spawn','clawd::service::auto_enable_if_needed','heartbeat::engine::start_heartbeat_loop','library_curator::run_curator_forever','utils::memory_monitor::start_memory_monitor_loop'])assert.equal(blocks.filter(b=>b.includes(task)).length,1,task)
 assert.ok(!blocks.some(b=>b.includes('server::actix::start_server')),'isolated local API still starts')
})
test('heartbeat rejects QA before timers, context, key resolution and provider HTTP',()=>{
 const engine=read('heartbeat/engine.rs')
 for(const name of ['trigger_heartbeat','run_heartbeat_check','run_single_heartbeat','call_llm_for_decision','resolve_heartbeat_provider','send_heartbeat_request'])assert.match(functionBody(engine,name),/^\s*ensure_heartbeat_allowed\(\)\?;/,name)
 assert.match(functionBody(engine,'start_heartbeat_loop'),/^\s*if ensure_heartbeat_allowed\(\)\.is_err\(\) \{ return; \}/)
 const llm=engine.slice(engine.indexOf('async fn call_llm_for_decision('),engine.indexOf('fn parse_llm_decision('))
 assert.equal((llm.match(/send_heartbeat_request\(/g)||[]).length,2)
 assert.doesNotMatch(llm,/\.send\(\)/)
 assert.match(functionBody(engine,'ensure_heartbeat_allowed'),/^\s*if crate::qa_launch::is_synthetic_build\(\)/)
})
test('CI runs background regressions with the existing mandatory compiled QA identity',()=>{
 const pkg=require('../package.json');assert.match(pkg.scripts['test:qa-harness'],/qa-background-isolation\.test\.cjs/)
 assert.equal(pkg.scripts['test:qa-background-rust'],'node scripts/qa-background-rust-tests.cjs')
 const script=fs.readFileSync(path.join(__dirname,'qa-background-rust-tests.cjs'),'utf8');assert.match(script,/testPlan\(\)/);assert.match(script,/plan\.args\[2\] = 'synthetic_qa'/)
 const workflow=fs.readFileSync(path.join(__dirname,'../../.github/workflows/build-macos.yml'),'utf8');assert.match(workflow,/npm run test:qa-background-rust/)
})

test('audited curator and telemetry entry points also reject direct QA calls before work',()=>{
 for(const [file,names] of [['library_curator/mod.rs',['run_curator_forever','run_curation_pass']],['utils/memory_monitor.rs',['start_memory_monitor_loop']]]){
  const source=read(file);for(const name of names)assert.match(functionBody(source,name),/^\s*if crate::qa_launch::is_synthetic_build\(\)/,name)
 }
})
