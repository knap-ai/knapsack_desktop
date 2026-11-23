// Real copy storage and owner/transcript snapshot source, disposable files only.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),scratch=fs.mkdtempSync(path.join(os.tmpdir(),'knap-copy-core-'));
try{
 fs.mkdirSync(path.join(scratch,'src'));
 const file=n=>JSON.stringify(path.join(root,'src-tauri/src/api',n));
 fs.writeFileSync(path.join(scratch,'src/lib.rs'),'pub mod api{#[path='+file('recovered_source.rs')+']pub mod recovered_source;#[path='+file('recovered_copy.rs')+']pub mod recovered_copy;}');
 fs.writeFileSync(path.join(scratch,'Cargo.toml'),`[package]
name="knap-desktop-recovered-copy-check"
version="0.0.0"
edition="2021"
[dependencies]
rusqlite={version="0.32",features=["bundled"]}
serde={version="1",features=["derive"]}
serde_json="1"
sha2="0.10"
uuid={version="1.8",features=["v4"]}
tempfile="=3.10.1"
`);
 const env={...process.env};delete env.KNAP_COPY_FIXTURE_RESTART;delete env.KNAP_COPY_FIXTURE_SAVE;
 const run=spawnSync(process.env.CARGO||'cargo',['test','--offline','--manifest-path',path.join(scratch,'Cargo.toml'),'--','--test-threads=1'],{env,encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024});process.stdout.write(run.stdout||'');if(run.error||run.status!==0){process.stderr.write(run.stderr||'');throw Error('Recovered copy core failed: '+(run.error?.code||run.status))}
 const summary=/test result: ok\. (\d+) passed; 0 failed; 0 ignored; 0 measured; 0 filtered out/.exec(run.stdout);if(!summary||Number(summary[1])!==(process.platform==='win32'?12:13))throw Error('Incomplete copy coverage');
}finally{fs.rmSync(scratch,{recursive:true,force:true})}
