// Explicit opt-in only: wraps the reviewed launcher, never quits an installed app.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto')
const {spawn,spawnSync}=require('node:child_process')
const {performance}=require('node:perf_hooks')
const PROBES=['transcript','meeting_link','chat_selection','notes_edit','slack_share','boundaries']
function validateReport(value,runId,bundleId){
 if(!value||typeof value!=='object'||Object.keys(value).sort().join(',')!=='bundle_id,coverage,passed,probes,run_id,version,window'||typeof value.passed!=='boolean'||value.version!==1||value.run_id!==runId||value.bundle_id!==bundleId||value.window!=='main'||value.coverage!=='native_webview_real_components_with_synthetic_boundaries'||!Array.isArray(value.probes)||value.probes.length>6)return false
 return value.probes.every((row,i)=>row&&Object.keys(row).sort().join(',')==='probe,status'&&row.probe===PROBES[i]&&['passed','assertion_failed','timeout','evaluation_failed','watchdog'].includes(row.status))&&value.passed===(value.probes.length===6&&value.probes.every(row=>row.status==='passed'))
}
function readReportFile(reportPath){
 const fd=fs.openSync(reportPath,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW)
 try{const stat=fs.fstatSync(fd);if(!stat.isFile()||stat.size>8192)throw Error('Invalid QA report file.');return JSON.parse(fs.readFileSync(fd,'utf8'))}finally{fs.closeSync(fd)}
}
function deadlineExpired(readyAt,now){return readyAt!==null&&now-readyAt>=30000}
class InspectionWatchdog {
 constructor(stop,clock=()=>performance.now()){this.stop=stop;this.clock=clock;this.readyAt=null;this.expired=false}
 ready(){if(this.readyAt===null)this.readyAt=this.clock()}
 tick(){if(!this.expired&&deadlineExpired(this.readyAt,this.clock())){this.expired=true;this.stop();return true}return false}
}
async function main(){
 const cwd=path.join(__dirname,'..'),repo=path.join(cwd,'..')
 const tree=spawnSync('git',['write-tree'],{cwd:repo,encoding:'utf8'})
 if(!process.env.KNAPSACK_QA_EXPECTED_TREE||tree.status!==0||tree.stdout.trim()!==process.env.KNAPSACK_QA_EXPECTED_TREE||spawnSync('git',['diff','--quiet'],{cwd:repo}).status!==0||spawnSync('git',['ls-files','--others','--exclude-standard'],{cwd:repo,encoding:'utf8'}).stdout.trim())throw Error('Exact reviewed source tree required; no native launch attempted.')
 const runId=String(process.env.KNAPSACK_QA_RUN_ID||crypto.randomUUID()).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)
 if(!runId)throw Error('Fresh QA run identity required.')
 const bundleId=`ai.knap.knapsack.qa.${runId.replace(/-/g,'').slice(0,32)}`
 const reportPath=path.join(os.tmpdir(),`knapsack-qa-${runId}`,'state/qa-dom-result.json')
 if(fs.existsSync(path.dirname(reportPath)))throw Error('Fresh QA state required; no native launch attempted.')
 const child=spawn(process.execPath,[path.join(__dirname,'qa-dev-run.cjs')],{cwd,env:{...process.env,KNAPSACK_QA_RUN_ID:runId,KNAPSACK_QA_SYNTHETIC:'1',KNAPSACK_QA_SKIP_GATEWAY:'1',KNAPSACK_QA_DOM_PROBES:'1'},stdio:['ignore','pipe','pipe']})
 let done=false,tail='',interval
 const stop=()=>{if(!done){done=true;clearInterval(interval);child.kill('SIGTERM')}} // reviewed launcher owns cleanup
 const watchdog=new InspectionWatchdog(stop);
 const signal=()=>{stop();process.exitCode=1};process.once('SIGINT',signal);process.once('SIGTERM',signal)
 child.stdout.on('data',bytes=>{process.stdout.write(bytes);tail=(tail+bytes.toString()).slice(-4096);if(tail.includes('[qa-dev-run] isolated synthetic runtime ready'))watchdog.ready()})
 child.stderr.on('data',bytes=>process.stderr.write(bytes))
 await new Promise((resolve,reject)=>{
  interval=setInterval(()=>{
   try{
    if(watchdog.readyAt!==null&&fs.existsSync(reportPath)){
     const report=readReportFile(reportPath);if(!validateReport(report,runId,bundleId))throw Error('Invalid or mismatched native QA report.')
     console.log('[qa-native-dom] '+JSON.stringify(report));process.exitCode=report.passed?0:1;stop();resolve()
    }else if(watchdog.tick()){process.exitCode=1;stop();reject(Error('Native inspection exceeded 30 seconds; owned QA cleanup requested.'))}
   }catch(error){stop();reject(error)}
  },100)
  child.on('error',error=>{stop();reject(error)})
  child.on('exit',code=>{clearInterval(interval);if(!done){done=true;try{const report=readReportFile(reportPath);if(watchdog.readyAt!==null&&validateReport(report,runId,bundleId)){console.log('[qa-native-dom] '+JSON.stringify(report));process.exitCode=report.passed?0:1;resolve();return}}catch{}process.exitCode=code||1;reject(Error('QA launcher exited before a validated report.'))}})
 })
 process.removeListener('SIGINT',signal);process.removeListener('SIGTERM',signal)
 // No forced termination, installed-app startup, service cleanup or permission changes here.
}
if(require.main===module)main().catch(error=>{console.error('[qa-native-dom] '+error.message);process.exitCode=1})
module.exports={validateReport,deadlineExpired,readReportFile,InspectionWatchdog}
