//! Generic reviewed-follow-up reminders. No agent channel, source content, or SMS.
use super::*;
use super::imessage::{context,json,list,bridge,quiescent,CONFIG_GATE};
static LOCAL_GATE:Mutex<()>=Mutex::new(());
static SUSPENDED:std::sync::atomic::AtomicBool=std::sync::atomic::AtomicBool::new(true);
static SCAN_CURSOR:std::sync::atomic::AtomicUsize=std::sync::atomic::AtomicUsize::new(0);
#[derive(Clone,Serialize,Deserialize)]
#[serde(deny_unknown_fields)]
struct Consent { owner:String,device:String,intent:String,grant_revision:u64,handle:String,root:PathBuf,enabled:bool,last_error:Option<String>,#[serde(default)] last_report:Option<String> }
fn path()->Result<PathBuf,String>{Ok(state_path()?.with_file_name("imessage-delivery-consent.json"))}
fn read()->Result<Option<Consent>,String>{let p=path()?;if !p.exists(){return Ok(None)}let bytes=fs::read(p).map_err(|_|"Delivery consent unavailable")?;if bytes.len()>4096{return Err("Invalid delivery consent".into())}serde_json::from_slice(&bytes).map(Some).map_err(|_|"Invalid delivery consent".into())}
fn save(value:&Consent)->Result<(),String>{atomic_write(&path()?,&serde_json::to_vec(value).map_err(|_|"Invalid delivery consent")?)}
pub(super) fn suspend(){SUSPENDED.store(true,std::sync::atomic::Ordering::SeqCst);let Ok(_guard)=LOCAL_GATE.lock() else{return};SUSPENDED.store(true,std::sync::atomic::Ordering::SeqCst);if let Ok(Some(mut consent))=read(){consent.enabled=false;consent.last_error=Some("Delivery paused locally. Review it again to enable.".into());let _=save(&consent);}}
fn binding(consent:&Consent,account:&AccountState,local:&LocalState)->Result<(),String>{
 if consent.owner!=account.account_id || consent.device!=local.device_id || consent.root!=local.brain_root || local.owner_account_id.as_deref()!=Some(account.account_id.as_str()){return Err("Delivery requires the same verified account and authoritative work on this Mac.".into())}Ok(())
}
fn eligible(item:&crate::clawd::follow_through::FollowThrough,now:u64)->bool{
 item.status=="attention" && item.check_error.is_none() && item.due_at.is_some_and(|d|d<=now && now-d<=86400) && item.last_checked_at.is_some_and(|t|t<=now && now-t<=900)
}
fn event_key(item:&crate::clawd::follow_through::FollowThrough)->String{digest(format!("generic-reviewed-attention-v1\n{}\n{}",item.id,item.due_at.unwrap_or(0)).as_bytes())}
fn local_allowed(value:&Consent,expected:&Consent,suspended:bool)->bool{!suspended && value.enabled && value.owner==expected.owner && value.device==expected.device && value.root==expected.root && value.intent==expected.intent && value.grant_revision==expected.grant_revision}
fn local_guard(consent:&Consent)->Result<(),String>{let _guard=LOCAL_GATE.lock().map_err(|_|"Delivery consent busy")?;if !read()?.is_some_and(|value|local_allowed(&value,consent,SUSPENDED.load(std::sync::atomic::Ordering::SeqCst))){return Err("Delivery paused locally".into())}Ok(())}
fn final_guard(current:&crate::clawd::follow_through::FollowThrough,expected:u64,parent_active:bool,now:u64)->Result<(),String>{
 if current.revision!=expected || !eligible(current,now) || !parent_active{return Err("Follow-up or parent changed after admission; reservation will not replay.".into())}Ok(())
}
fn bounded_batch(mut items:Vec<crate::clawd::follow_through::FollowThrough>,now:u64,cursor:usize)->Vec<crate::clawd::follow_through::FollowThrough>{
 items.retain(|v|eligible(v,now));items.sort_by(|a,b|a.id.cmp(&b.id));
 if items.is_empty(){return items}
 let start=cursor%items.len();items.rotate_left(start);items.truncate(100);items
}
async fn state(token:&str)->Result<serde_json::Value,String>{json(identity::send(api_client()?.get(api_url("/imessage/delivery/state")?).bearer_auth(token)).await?).await}
async fn change(token:&str,intent:&str,body:serde_json::Value)->Result<serde_json::Value,String>{json(identity::send(api_client()?.post(api_url(&format!("/imessage/{}/delivery",intent))?).bearer_auth(token).json(&body)).await?).await}
fn authorized(state:&serde_json::Value,consent:&Consent)->bool{state["account_id"]==consent.owner && state["grants"].as_array().is_some_and(|rows|rows.iter().any(|g|g["intent_id"]==consent.intent && g["enabled"]==true && g["revision"].as_u64()==Some(consent.grant_revision)))}
fn validate_destination(directory:&serde_json::Value,consent:&Consent)->Result<(),String>{
 let value=directory["intents"].as_array().and_then(|rows|rows.iter().find(|v|v["intent_id"]==consent.intent)).ok_or("Verified destination missing")?;
 if directory["account_id"]!=consent.owner || value["device_id"]!=consent.device || value["status"]!="verified" || value["expires_at"].as_u64().map(|t|t<=timestamp()/1000).unwrap_or(true) || value["handle_hash"]!=digest(consent.handle.as_bytes()){return Err("Destination revoked, paused, expired, or changed; delivery stopped.".into())}Ok(())
}
#[tauri::command]
pub fn kn_imessage_delivery_status()->Result<serde_json::Value,String>{let _guard=LOCAL_GATE.lock().map_err(|_|"Delivery consent busy")?;let suspended=SUSPENDED.load(std::sync::atomic::Ordering::SeqCst);Ok(match read()?{Some(value)=>serde_json::json!({"enabled":value.enabled && !suspended,"intent_id":value.intent,"last_error":if suspended && value.enabled{Some("App restarted or delivery paused. Review consent to resume.".to_string())}else{value.last_error},"scope":"generic_reviewed_attention_v1","message":value.last_report}),None=>serde_json::json!({"enabled":false})})}
#[tauri::command]
pub fn kn_imessage_delivery_pause_local()->Result<(),String>{cancel_active();suspend();Ok(())}
#[tauri::command]
pub async fn kn_imessage_delivery_consent(app_handle:tauri::AppHandle,expected_account_id:String,intent_id:String,handle:String,enable:bool,confirm:bool)->Result<serde_json::Value,String>{
 if !confirm || uuid::Uuid::parse_str(&intent_id).is_err(){return Err("Review the separate generic reminder consent first.".into())}
 if !enable {cancel_active();suspend();}
 let revision=session_revision();let _operation=OPERATION_LOCK.lock().await;unchanged(revision)?;
 let(token,account,local)=context(&app_handle,Some(&expected_account_id)).await?;
 let normalized=handle.to_lowercase();let normalized=normalized.strip_prefix("imessage:").unwrap_or(&normalized).to_string();
 if enable && (normalized.len()>254 || normalized.chars().any(|c|c.is_control()||c.is_whitespace())){return Err("Re-enter the verified iMessage address.".into())}
 let remote=state(&token).await?;
 let expected=remote["grants"].as_array().and_then(|rows|rows.iter().find(|g|g["intent_id"]==intent_id)).and_then(|g|g["revision"].as_u64()).unwrap_or(0);
 let mut consent=Consent{owner:account.account_id.clone(),device:local.device_id.clone(),intent:intent_id.clone(),grant_revision:0,handle:normalized,root:local.brain_root.clone(),enabled:enable,last_error:None,last_report:None};
 if enable{binding(&consent,&account,&local)?;validate_destination(&list(&token).await?,&consent)?;let _config=CONFIG_GATE.lock().await;quiescent().await?;}
 unchanged(revision)?;
 let result=change(&token,&intent_id,serde_json::json!({"action":if enable{"enable"}else{"pause"},"expected_revision":expected,"confirm":true})).await?;
 consent.grant_revision=result["revision"].as_u64().ok_or("Invalid delivery consent response")?;
 unchanged(revision)?;{let _guard=LOCAL_GATE.lock().map_err(|_|"Delivery consent busy")?;unchanged(revision)?;save(&consent)?;unchanged(revision)?;SUSPENDED.store(!enable,std::sync::atomic::Ordering::SeqCst);}
 Ok(serde_json::json!({"enabled":enable,"intent_id":intent_id,"message":if enable{"Generic reminders enabled on this running Mac. No source text, drafts, recipients or briefings will be sent."}else{"Delivery paused on this Mac and in the account."}}))
}
async fn dispatch(app:&tauri::AppHandle,consent:&Consent,revision:u64)->Result<serde_json::Value,String>{
 let(token,account,local)=context(app,Some(&consent.owner)).await?;binding(consent,&account,&local)?;
 validate_destination(&list(&token).await?,consent)?;if !authorized(&state(&token).await?,consent){return Err("Delivery consent changed or paused; review again.".into())}
 let root=consent.root.to_string_lossy().into_owned();
 let items=crate::clawd::follow_through::kn_follow_through_check(root.clone()).await?;
 let mut submitted=0;
 let batch=bounded_batch(items,timestamp()/1000,SCAN_CURSOR.fetch_add(100,std::sync::atomic::Ordering::Relaxed));
 for item in batch{
  if submitted>=5{break}
  unchanged(revision)?;
  local_guard(consent)?;
  let _config=CONFIG_GATE.lock().await;quiescent().await?;unchanged(revision)?;
  let key=event_key(&item);let reservation=change(&token,&consent.intent,serde_json::json!({"action":"reserve","expected_revision":consent.grant_revision,"confirm":true,"event_key":key})).await?;
  if reservation["dispatch"]!=true{continue}
  unchanged(revision)?;if !authorized(&state(&token).await?,consent){return Err("Delivery paused after admission; reservation will not replay.".into())}
  let current=crate::clawd::follow_through::kn_follow_through_list(root.clone())?.into_iter().find(|v|v.id==item.id).ok_or("Follow-up removed")?;
  final_guard(&current,item.revision,crate::clawd::follow_through::active_parent(&root,&current.run_id)?,timestamp()/1000)?;
  local_guard(consent)?;
  unchanged(revision)?;
  let sent=bridge(app,serde_json::json!({"operation":"deliver-reminder","handle":consent.handle,"handle_hash":reservation["handle_hash"],"chat_id":reservation["chat_id"],"event_key":key,"not_after":reservation["not_after"]}),revision).await;
  let outcome=if sent.is_ok(){"submitted_unverified"}else{"uncertain"};
  if unchanged(revision).is_ok(){let _=change(&token,&consent.intent,serde_json::json!({"action":"receipt","expected_revision":consent.grant_revision,"confirm":true,"event_key":key,"outcome":outcome})).await;}
  sent?;submitted+=1;
 }
 Ok(serde_json::json!({"submitted_unverified":submitted,"message":"Checked generic reminders. Submitted messages are not delivery proof; consumed reservations never resend."}))
}
#[tauri::command]
pub async fn kn_imessage_delivery_tick(app_handle:tauri::AppHandle)->Result<serde_json::Value,String>{
 let revision=session_revision();
 if SUSPENDED.load(std::sync::atomic::Ordering::SeqCst){return Ok(serde_json::json!({"enabled":false}))}
 let Ok(_operation)=OPERATION_LOCK.try_lock() else{return Ok(serde_json::json!({"busy":true}))};unchanged(revision)?;
 let consent={let _guard=LOCAL_GATE.lock().map_err(|_|"Delivery consent busy")?;if SUSPENDED.load(std::sync::atomic::Ordering::SeqCst){return Ok(serde_json::json!({"enabled":false}))}read()?};
 let Some(consent)=consent.filter(|c|c.enabled) else{return Ok(serde_json::json!({"enabled":false}))};
 let result=dispatch(&app_handle,&consent,revision).await;
 {let _guard=LOCAL_GATE.lock().map_err(|_|"Delivery consent busy")?;if unchanged(revision).is_ok() && !SUSPENDED.load(std::sync::atomic::Ordering::SeqCst){let mut value=read()?.ok_or("Delivery consent disappeared")?;
  match &result{Err(error)=>value.last_error=Some(error.clone()),Ok(report)=>{value.last_error=None;value.last_report=Some(format!("Last check: {} reminder submissions; delivery unverified. Consumed reservations never resend.",report["submitted_unverified"].as_u64().unwrap_or(0)));}}save(&value)?;}}
 result
}

#[cfg(test)]
mod tests {
 use super::*;
 fn item(id:usize)->crate::clawd::follow_through::FollowThrough{serde_json::from_value(serde_json::json!({"id":format!("{id:04}"),"runId":"r","proposal":{"action":"Secret proposal","owner":"Owner","quote":"Secret source quote","draft":"Secret draft"},"status":"attention","dueAt":900,"lastCheckedAt":990,"revision":1,"history":[]})).unwrap()}
 #[test] fn eligibility_rejects_closed_failed_future_and_stale(){
  let base=item(0);assert!(eligible(&base,1000));
  for status in ["resolved","dismissed","paused","reply_received","proposed"]{let mut v=base.clone();v.status=status.into();assert!(!eligible(&v,1000));}
  let mut v=base.clone();v.check_error=Some("offline".into());assert!(!eligible(&v,1000));v=base.clone();v.last_checked_at=Some(1);assert!(!eligible(&v,1000));v=base;v.due_at=Some(1001);assert!(!eligible(&v,1000));
 }
 #[test] fn stable_event_survives_status_checks_but_new_due_is_distinct(){let a=item(0);let mut b=a.clone();b.revision+=1;assert_eq!(event_key(&a),event_key(&b));b.due_at=Some(901);assert_ne!(event_key(&a),event_key(&b));}
 #[test] fn parent_pause_after_admission_blocks_unchanged_child(){let child=item(0);assert!(final_guard(&child,1,true,1000).is_ok());assert!(final_guard(&child,1,false,1000).is_err());}
 #[test] fn failed_pause_write_cannot_authorize_persisted_enabled_consent(){let old=Consent{owner:"1".into(),device:"d".into(),intent:"i".into(),grant_revision:2,handle:"owner@example.invalid".into(),root:PathBuf::from("/fixture"),enabled:true,last_error:None,last_report:None};assert!(local_allowed(&old,&old,false));assert!(!local_allowed(&old,&old,true));}
 #[test] fn bounded_scan_rotates_past_previously_consumed_work(){
  let items=(0..110).map(item).collect::<Vec<_>>();let a=bounded_batch(items.clone(),1000,0);let b=bounded_batch(items,1000,100);assert_eq!(a.len(),100);assert_eq!(b.len(),100);assert_eq!(b[0].id,"0100");
  let consumed=(0..5).map(|i|event_key(&item(i))).collect::<std::collections::HashSet<_>>();let new=a.into_iter().filter(|v|!consumed.contains(&event_key(v))).take(5).collect::<Vec<_>>();assert_eq!(new[0].id,"0005");assert_eq!(new[4].id,"0009");
 }
 #[test] fn consent_requires_exact_namespace_revision(){let consent=Consent{owner:"1".into(),device:"d".into(),intent:"i".into(),grant_revision:2,handle:"owner@example.invalid".into(),root:PathBuf::from("/fixture"),enabled:true,last_error:None,last_report:None};assert!(authorized(&serde_json::json!({"account_id":"1","grants":[{"intent_id":"i","revision":2,"enabled":true}]}),&consent));for value in [serde_json::json!({"account_id":"2","grants":[{"intent_id":"i","revision":2,"enabled":true}]}),serde_json::json!({"account_id":"1","grants":[{"intent_id":"i","revision":3,"enabled":true}]})]{assert!(!authorized(&value,&consent));}}
 #[test] fn delivery_requires_owned_current_root_and_selected_local_device(){
  let mut local:LocalState=serde_json::from_value(serde_json::json!({"schemaVersion":1,"brainRoot":"/fixture","ownerAccountId":"1","deviceId":"d","enabled":false,"automatic":false,"epoch":1,"revision":1,"lastBackupAt":null,"lastSnapshotId":null,"lastContentSha256":null,"lastError":null})).unwrap();
  let account:AccountState=serde_json::from_value(serde_json::json!({"account_id":"1","enabled":false,"device_id":"d","epoch":1,"revision":1,"latest_snapshot_id":null})).unwrap();
  let consent=Consent{owner:"1".into(),device:"d".into(),intent:"i".into(),grant_revision:2,handle:"owner@example.invalid".into(),root:PathBuf::from("/fixture"),enabled:true,last_error:None,last_report:None};assert!(binding(&consent,&account,&local).is_ok());
  local.device_id="other".into();assert!(binding(&consent,&account,&local).is_err());local.device_id="d".into();local.owner_account_id=None;assert!(binding(&consent,&account,&local).is_err());local.owner_account_id=Some("1".into());local.brain_root=PathBuf::from("/retired");assert!(binding(&consent,&account,&local).is_err());
 }

}
