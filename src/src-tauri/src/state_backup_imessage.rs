//! Account-bound optional setup. No cloud scan or automatic send; test requires consent.
use super::*;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

pub(crate) static CONFIG_GATE:tokio::sync::Mutex<()>=tokio::sync::Mutex::const_new(());
pub(crate) fn fenced_patch_allowed(method:&str,params:&Option<serde_json::Value>)->bool{
 let Some(raw)=params.as_ref().and_then(|p|p.get("raw")).and_then(|v|v.as_str()) else{return false};
 let Ok(value)=serde_json::from_str::<serde_json::Value>(raw) else{return false};
 if !value.is_object(){return false}
 let channel=value.pointer("/channels/imessage");
 if method=="config.patch" && channel.is_none(){return true}
 channel.map(|v|v.is_null() || v.get("enabled").and_then(|e|e.as_bool())==Some(false)).unwrap_or(true)
}
async fn configuration_guard<F:FnOnce()->bool>(method:&str,params:&Option<serde_json::Value>,fenced:F)->Result<Option<tokio::sync::MutexGuard<'static,()>>,String>{
 if !["config.patch","config.set","config.apply"].contains(&method){return Ok(None)}
 let guard=CONFIG_GATE.lock().await;
 if fenced() && !fenced_patch_allowed(method,params){return Err("iMessage setup isolation blocks configuration that could enable replies during verification.".into())}
 Ok(Some(guard))
}
pub(crate) async fn config_write_guard(method:&str,params:&Option<serde_json::Value>)->Result<Option<tokio::sync::MutexGuard<'static,()>>,String>{configuration_guard(method,params,setup_fenced).await}
fn fence_path()->Result<PathBuf,String>{Ok(state_path()?.with_file_name("imessage-setup-fence.json"))}
pub(crate) fn setup_fenced()->bool{
 let Ok(path)=fence_path() else{return true};
 if !path.exists(){return false}
 let Ok(raw)=fs::read(&path) else{return true};if raw.len()>1024{return true}
 let Ok(value)=serde_json::from_slice::<serde_json::Value>(&raw) else{return true};
 value["expires_at"].as_u64().map(|time|time>=timestamp()/1000).unwrap_or(true)
}
fn install_fence(account:&str,intent:&str,expires:u64)->Result<(),String>{
 let path=fence_path()?;
 if setup_fenced(){let raw=fs::read(&path).map_err(|_|"Setup fence unavailable")?;let old:serde_json::Value=serde_json::from_slice(&raw).map_err(|_|"Setup fence unavailable")?;if old["account_id"]!=account || old["intent_id"]!=intent{return Err("Another setup test is still isolated on this Mac. Wait for it to expire or finish that request.".into())}}
 atomic_write(&path,&serde_json::to_vec(&serde_json::json!({"account_id":account,"intent_id":intent,"expires_at":expires})).map_err(|_|"Invalid setup fence")?)
}
fn stopped(config:&serde_json::Value,snapshot:&serde_json::Value)->Result<(),String>{
 let configuration=config.get("config").unwrap_or(config);
 let channel=configuration.pointer("/channels/imessage");
 if channel.is_some_and(|value|!value.is_null() && value.get("enabled").and_then(|v|v.as_bool())!=Some(false)){return Err("Disconnect the existing iMessage channel before testing, so its automation cannot reply to the test.".into())}
 let runtime=snapshot.pointer("/channels/imessage").ok_or("Gateway cannot confirm iMessage is stopped; no test or proof is allowed")?;
 if runtime["running"]!=false || runtime["connected"]==true || snapshot.pointer("/channelAccounts/imessage").and_then(|v|v.as_array()).is_some_and(|accounts|accounts.iter().any(|value|value["running"]==true || value["connected"]==true)){return Err("Gateway iMessage automation must be explicitly stopped during verification.".into())}Ok(())
}
pub(super) async fn quiescent()->Result<(),String>{
 let config=crate::clawd::gateway_client::config_get(None).await.map_err(|_|"Gateway configuration cannot be verified; setup is blocked")?;
 let snapshot=crate::clawd::gateway_client::call_channel_method("channels.status",Some(serde_json::json!({"channel":"imessage","probe":false,"timeoutMs":2500})),None).await.map_err(|_|"Gateway cannot confirm stopped iMessage automation; setup is blocked")?;
 stopped(&config,&snapshot)
}
pub(super) async fn context(app:&tauri::AppHandle, expected:Option<&str>)->Result<(String,AccountState,LocalState),String>{
 let local=initialized()?;let token=access_token(app).await?;let account=account_for(&token).await?;
 if account.account_id=="unbound" || expected.is_some_and(|id| id!=account.account_id){return Err("Verify the same Google or Microsoft identity in account Settings before continuing.".into())}
 Ok((token,account,local))
}
pub(super) async fn json(response:reqwest::Response)->Result<serde_json::Value,String>{
 let mut response=checked(response).await?;let mut bytes=Vec::new();
 while let Some(chunk)=response.chunk().await.map_err(|_|"Setup response interrupted")?{if bytes.len()+chunk.len()>65536{return Err("Setup response too large".into())}bytes.extend_from_slice(&chunk)}
 serde_json::from_slice(&bytes).map_err(|_|"Invalid setup response".into())
}
pub(super) async fn list(token:&str)->Result<serde_json::Value,String>{json(identity::send(api_client()?.get(api_url("/imessage")?).bearer_auth(token)).await?).await}
async fn advance(token:&str,intent:&str,body:serde_json::Value)->Result<serde_json::Value,String>{
 json(identity::send(api_client()?.post(api_url(&format!("/imessage/{}",intent))?).bearer_auth(token).json(&body)).await?).await
}
pub(super) async fn bridge(app:&tauri::AppHandle,input:serde_json::Value,revision:u64)->Result<serde_json::Value,String>{
 if std::env::consts::OS!="macos" {return Err("Finish setup on the selected Mac.".into())}
 let root=app.path_resolver().resource_dir().ok_or("Bundled resources unavailable")?;
 let node=root.join("resources/node/node");let script=root.join("resources/clawdbot/imessage-onboarding.mjs");
 if !node.is_file() || !script.is_file(){return Err("The bundled Messages setup bridge is unavailable in this app version.".into())}
 unchanged(revision)?;
 let mut child=tokio::process::Command::new(node).arg(script).stdin(std::process::Stdio::piped()).stdout(std::process::Stdio::piped()).stderr(std::process::Stdio::null()).kill_on_drop(true).spawn().map_err(|_|"Messages bridge could not start")?;
 unchanged(revision)?;
 let mut stdin=child.stdin.take().ok_or("Messages bridge input unavailable")?;
 stdin.write_all(serde_json::to_string(&input).map_err(|_|"Invalid setup input")?.as_bytes()).await.map_err(|_|"Messages bridge interrupted")?;drop(stdin);
 let stdout=child.stdout.take().ok_or("Messages bridge output unavailable")?;
 let mut bytes=Vec::new();let mut cancel=CANCEL.subscribe();let mut limited=stdout.take(16385);
 tokio::select!{
  result=tokio::time::timeout(Duration::from_secs(30),limited.read_to_end(&mut bytes))=>{result.map_err(|_|"Messages setup timed out. A submitted test may have succeeded; never automatically resend.")?.map_err(|_|"Messages setup interrupted")?;},
  _=cancel.changed()=>{return Err("Setup cancelled. A submitted test may have succeeded; check Messages before creating a new request.".into())}
 }
 if bytes.len()>16384 {return Err("Messages setup response too large".into())}
 tokio::time::timeout(Duration::from_secs(5),child.wait()).await.map_err(|_|"Messages bridge did not stop; no action will replay")?.map_err(|_|"Messages bridge interrupted")?;unchanged(revision)?;
 let result:serde_json::Value=serde_json::from_slice(&bytes).map_err(|_|"Invalid Messages setup response")?;
 if result["success"]!=true{return Err(result["message"].as_str().unwrap_or("Messages setup unavailable").into())}Ok(result)
}
#[tauri::command]
pub async fn kn_imessage_setup_list(app_handle:tauri::AppHandle)->Result<serde_json::Value,String>{
 let revision=session_revision();let _lock=OPERATION_LOCK.lock().await;unchanged(revision)?;
 let(token,_,local)=context(&app_handle,None).await?;let mut result=list(&token).await?;result["current_device_id"]=local.device_id.into();unchanged(revision)?;Ok(result)
}
#[tauri::command]
pub async fn kn_imessage_setup_create(app_handle:tauri::AppHandle,expected_account_id:String,intent_id:String,confirm:bool)->Result<serde_json::Value,String>{
 if !confirm || uuid::Uuid::parse_str(&intent_id).is_err(){return Err("Review creating a setup request for this Mac first.".into())}
 let revision=session_revision();let _lock=OPERATION_LOCK.lock().await;unchanged(revision)?;
 let(token,_,local)=context(&app_handle,Some(&expected_account_id)).await?;
 let builder=api_client()?.post(api_url("/imessage")?).bearer_auth(&token).json(&serde_json::json!({"intent_id":intent_id,"device_id":local.device_id,"confirm_setup":true}));
 unchanged(revision)?;let intent=json(identity::send(builder).await?).await?;unchanged(revision)?;Ok(serde_json::json!({"intent":intent}))
}
#[tauri::command]
pub async fn kn_imessage_setup_readiness(app_handle:tauri::AppHandle,confirm_read:bool)->Result<serde_json::Value,String>{
 if !confirm_read{return Err("Review the Messages read-permission check first.".into())}
 let revision=session_revision();let _lock=OPERATION_LOCK.lock().await;unchanged(revision)?;
 let mut result=bridge(&app_handle,serde_json::json!({"operation":"readiness"}),revision).await?;
 // Gateway liveness is a separate observation, never inferred from configured=true.
 let gateway=crate::clawd::gateway_client::call_channel_method("channels.status",Some(serde_json::json!({"channel":"imessage","probe":false,"timeoutMs":2500})),None).await;
 result["gateway_snapshot_available"]=gateway.is_ok().into();unchanged(revision)?;Ok(result)
}
#[tauri::command]
pub async fn kn_imessage_setup_action(app_handle:tauri::AppHandle,expected_account_id:String,intent_id:String,expected_revision:u64,action:String,handle:Option<String>,confirm:bool)->Result<serde_json::Value,String>{
 if !confirm || uuid::Uuid::parse_str(&intent_id).is_err(){return Err("Review this setup step first.".into())}
 if ["pause","disconnect","cancel"].contains(&action.as_str()){cancel_active();super::imessage_delivery::suspend();}
 let revision=session_revision();let _lock=OPERATION_LOCK.lock().await;unchanged(revision)?;
 let(token,account,local)=context(&app_handle,Some(&expected_account_id)).await?;
 let directory=list(&token).await?;
 if directory["account_id"].as_str()!=Some(account.account_id.as_str()){return Err("Setup account changed".into())}
 let selected=directory["intents"].as_array().and_then(|rows|rows.iter().find(|row|row["intent_id"]==intent_id)).ok_or("Setup request not found")?;
 if selected["revision"].as_u64()!=Some(expected_revision){return Err("Setup changed; refresh before continuing.".into())}
 if !["cancel","disconnect","pause","updates"].contains(&action.as_str()) && selected["device_id"].as_str()!=Some(local.device_id.as_str()){return Err("Finish this request on its selected Mac.".into())}
 let mut body=serde_json::json!({"expected_revision":expected_revision,"action":action,"confirm":true});
 if ["test","verify"].contains(&action.as_str()) && selected["expires_at"].as_u64().map(|expiry|expiry<=timestamp()/1000).unwrap_or(true){return Err("Setup expired. Create a new request; this test will not be resent.".into())}
 if action=="test" {
  let _configuration=CONFIG_GATE.lock().await;
  if selected["status"]!="claimed"{return Err("A test was already submitted or this request is not claimed. Check its reply; no resend is available.".into())}
  let handle=handle.ok_or("Enter your own iMessage address")?;
  let expiry=selected["expires_at"].as_u64().ok_or("Invalid setup expiry")?;install_fence(&account.account_id,&intent_id,expiry)?;quiescent().await?;unchanged(revision)?;
  let resolved=bridge(&app_handle,serde_json::json!({"operation":"resolve","handle":handle}),revision).await?;
  body["action"]="testing".into();body["chat_id"]=resolved["chat_id"].clone();body["handle_hash"]=resolved["handle_hash"].clone();
  unchanged(revision)?;let testing=advance(&token,&intent_id,body).await?;unchanged(revision)?;
  quiescent().await?;unchanged(revision)?;
  // Durable transition precedes dispatch. Repeated clicks/restarts cannot resend this intent.
  let result=bridge(&app_handle,serde_json::json!({"operation":"send-test","handle":handle,"chat_id":testing["chat_id"],"challenge":testing["challenge"],"expires_at":testing["expires_at"]}),revision).await?;
  return Ok(serde_json::json!({"intent":testing,"transport":result}))
 }
 if action=="verify" {
  let _configuration=CONFIG_GATE.lock().await;
  if selected["status"]!="testing"{return Err("No test is waiting for verification.".into())}
  let handle=handle.ok_or("Re-enter the tested iMessage address")?;
  install_fence(&account.account_id,&intent_id,selected["expires_at"].as_u64().ok_or("Invalid setup expiry")?)?;quiescent().await?;unchanged(revision)?;
  // Resolve only the selected self-thread; don't broaden to another address after dispatch.
  let lower=handle.to_lowercase();let normalized=lower.strip_prefix("imessage:").unwrap_or(&lower);
  if selected["handle_hash"].as_str()!=Some(digest(normalized.as_bytes()).as_str()){return Err("This address differs from the reviewed destination.".into())}
  let expiry=selected["expires_at"].as_u64().ok_or("Invalid setup expiry")?;
  let proof=bridge(&app_handle,serde_json::json!({"operation":"verify","handle":handle,"chat_id":selected["chat_id"],"challenge":selected["challenge"],"issued_at":expiry.checked_sub(600).ok_or("Invalid setup expiry")?,"expires_at":expiry}),revision).await?;
  quiescent().await?;unchanged(revision)?;
  if proof["verified"]!=true{return Ok(serde_json::json!({"intent":selected,"transport":proof}))}
  body["test_guid"]=proof["test_guid"].clone();body["reply_guid"]=proof["reply_guid"].clone();
 }
 if !["claim","verify","updates","pause","cancel","disconnect"].contains(&action.as_str()){return Err("Unsupported setup action".into())}
 unchanged(revision)?;let result=advance(&token,&intent_id,body).await?;unchanged(revision)?;Ok(serde_json::json!({"intent":result}))
}

#[cfg(test)]
mod tests {
 use super::*;
 #[tokio::test] async fn a_write_started_before_fence_checks_after_serialized_install(){
  use std::sync::atomic::{AtomicBool,Ordering};
  let fence=std::sync::Arc::new(AtomicBool::new(false));let observed=fence.clone();
  let install=CONFIG_GATE.lock().await;
  let writer=tokio::spawn(async move{configuration_guard("config.patch",&Some(serde_json::json!({"raw":r#"{"channels":{"imessage":{"allowFrom":["owner@example.invalid"]}}}"#})),||observed.load(Ordering::SeqCst)).await.map(|_|())});
  tokio::task::yield_now().await;fence.store(true,Ordering::SeqCst);drop(install);
  assert!(writer.await.unwrap().is_err());
 }
 #[test] fn fenced_writes_reject_implicit_enable_and_allow_only_safe_changes(){
  for raw in [r#"{"channels":{"imessage":{"dmPolicy":"allowlist"}}}"#,r#"{"channels":{"imessage":{"enabled":true}}}"#,r#"bad-json"#]{assert!(!fenced_patch_allowed("config.patch",&Some(serde_json::json!({"raw":raw}))))}
  for raw in [r#"{"channels":{"imessage":null}}"#,r#"{"channels":{"imessage":{"enabled":false}}}"#,r#"{"browser":{"enabled":true}}"#]{assert!(fenced_patch_allowed("config.patch",&Some(serde_json::json!({"raw":raw}))))}
 }
 #[test] fn setup_requires_explicitly_stopped_configuration_and_runtime(){
  let disabled=serde_json::json!({"config":{"channels":{"imessage":{"enabled":false}}}});
  let stopped_runtime=serde_json::json!({"channels":{"imessage":{"running":false}}});
  assert!(stopped(&disabled,&stopped_runtime).is_ok());
  for status in [serde_json::json!({}),serde_json::json!({"channels":{"imessage":{"configured":true}}}),serde_json::json!({"channels":{"imessage":{"running":true}}}),serde_json::json!({"channels":{"imessage":{"running":false}},"channelAccounts":{"imessage":[{"running":true}]}})]{assert!(stopped(&disabled,&status).is_err())}
  assert!(stopped(&serde_json::json!({"config":{"channels":{"imessage":{"allowFrom":["owner@example.invalid"]}}}}),&stopped_runtime).is_err());
 }
}
