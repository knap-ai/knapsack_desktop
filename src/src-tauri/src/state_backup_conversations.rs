//! Encrypted account conversations reuse signed recovery; every request is explicit.
use super::*;
use std::collections::HashMap;
use zeroize::Zeroizing;
use knapsack_state_backup::conversations::{seal_conversation,open_conversation,MAX_CONVERSATION_BYTES};

#[derive(Serialize,Deserialize,Clone)]
#[serde(rename_all="camelCase",deny_unknown_fields)]
pub struct ConversationMessage { pub id:String, pub role:ConversationRole, pub text:String, pub ts:u64 }
#[derive(Serialize,Deserialize,Clone)]
#[serde(rename_all="lowercase")]
pub enum ConversationRole { User, Assistant }
#[derive(Serialize,Deserialize,Clone)]
#[serde(rename_all="camelCase",deny_unknown_fields)]
pub struct ConversationDocument { pub schema_version:u32, pub conversation_id:String, pub title:String, pub messages:Vec<ConversationMessage> }
#[derive(Serialize,Deserialize,Clone)]
pub struct ConversationReceipt {
 pub conversation_id:String,pub revision:u64,pub mutation_id:String,pub source_device_id:String,pub key_version:String,pub sha256:String,pub updated_at:u64,
}
#[derive(Serialize,Deserialize)]
pub struct ConversationDirectory { pub account_id:String,pub conversations:Vec<ConversationReceipt>,pub execution_location:String,pub remote_execution_available:bool,pub automatic_sync_available:bool }
#[derive(Deserialize)]
struct EncryptedRecord { #[serde(flatten)] receipt:ConversationReceipt,account_id:String,ciphertext_b64:String }
#[derive(Deserialize)]
struct WriteReply { #[serde(flatten)] receipt:ConversationReceipt,account_id:String }
#[derive(Serialize)]
pub struct ConversationRead { pub account_id:String,pub receipt:ConversationReceipt,pub document:ConversationDocument }
struct CachedKey { key:RecoveryKey, session:u64 }
static KEYS:once_cell::sync::Lazy<Mutex<HashMap<(String,String),CachedKey>>> =once_cell::sync::Lazy::new(||Mutex::new(HashMap::new()));
struct PendingWrite { expected:u64, version:String, plaintext_digest:String, mutation:String, ciphertext:Vec<u8> }
static WRITES:once_cell::sync::Lazy<Mutex<HashMap<(String,String),PendingWrite>>> =once_cell::sync::Lazy::new(||Mutex::new(HashMap::new()));
pub(super) fn clear_keys(){ if let Ok(mut keys)=KEYS.lock(){keys.clear();} }
fn uuid(value:&str)->Result<(),String>{uuid::Uuid::parse_str(value).map(|_|()).map_err(|_|"Invalid shared conversation identity".into())}
fn validate(document:&ConversationDocument)->Result<(),String>{
 uuid(&document.conversation_id)?;
 if document.schema_version!=1 || document.title.is_empty() || document.title.chars().count()>128 || document.title.chars().any(char::is_control) || document.messages.len()>500 {return Err("Invalid shared conversation schema or bounds".into())}
 let mut ids=std::collections::HashSet::new();
 for message in &document.messages {
  if message.id.is_empty() || message.id.len()>128 || message.id.chars().any(char::is_control) || !ids.insert(&message.id) || message.ts>9_007_199_254_740_991 || message.text.len()>32768 {return Err("Invalid shared message schema or bounds".into())}
 }
 Ok(())
}
fn owned_account(account:&AccountState,expected:&str)->Result<(),String>{
 if account.account_id!=expected || expected=="unbound" {return Err("Account changed. Review sharing again.".into())}
 require_account_recovery(account)?;
 if account.recovery_mode!=ACCOUNT_RECOVERY_MODE || account.key_version.is_none(){return Err("Enroll account-backed protected keys before sharing conversations.".into())}
 Ok(())
}
async fn json<T:serde::de::DeserializeOwned>(response:reqwest::Response,limit:usize)->Result<T,String>{
 let mut response=checked(response).await?;let mut bytes=Zeroizing::new(Vec::new());
 while let Some(chunk)=response.chunk().await.map_err(|_|"Shared state interrupted. Your local draft is preserved.")? {
  if bytes.len()+chunk.len()>limit{return Err("Shared state response is too large".into())}bytes.extend_from_slice(&chunk);
 }
 serde_json::from_slice(&bytes).map_err(|_|"Invalid shared conversation response".into())
}
fn validate_receipt(receipt:&ConversationReceipt,conversation:&str)->Result<(),String>{
 if receipt.conversation_id!=conversation || receipt.revision==0 || receipt.revision>9_007_199_254_740_991 || receipt.sha256.len()!=64 {return Err("Unexpected shared conversation receipt".into())}
 uuid(&receipt.conversation_id)?;uuid(&receipt.mutation_id)?;uuid(&receipt.source_device_id)?;uuid(&receipt.key_version)
}
fn install_key(account:&str,version:&str,key:RecoveryKey,session:u64)->Result<(),String>{
 let mut keys=KEYS.lock().map_err(|_|"Account key is busy")?;
 unchanged(session)?; // Must be checked inside the cache lock: sign-out erases under this lock.
 if keys.len()>=2{keys.clear();}
 keys.insert((account.to_owned(),version.to_owned()),CachedKey{key,session});Ok(())
}
async fn ensure_key(app:&tauri::AppHandle,token:&str,account:&AccountState,local:&LocalState,session:u64)->Result<(),String>{
 let version=account.key_version.as_ref().ok_or("Account key unavailable")?;
 if KEYS.lock().map_err(|_|"Account key is busy")?.get(&(account.account_id.clone(),version.clone())).is_some_and(|key|key.session==session){return Ok(())}
 let provider=identity::provider()?;
 identity::authorize(app,&provider,"backup-key-recover",local,Some(account)).await?;unchanged(session)?;
 let key=managed_key(token,account,local,"recover",Some(version)).await?;unchanged(session)?;
 install_key(&account.account_id,version,key.key,session)
}
#[tauri::command]
pub async fn kn_account_conversations(app_handle:tauri::AppHandle,expected_account_id:String)->Result<ConversationDirectory,String>{
 let session=session_revision();let _op=OPERATION_LOCK.lock().await;unchanged(session)?;
 let token=access_token(&app_handle).await?;let account=account_for(&token).await?;owned_account(&account,&expected_account_id)?;unchanged(session)?;
 let result:ConversationDirectory=json(identity::send(api_client()?.get(api_url("/conversations")?).bearer_auth(&token)).await?,32768).await?;unchanged(session)?;
 if result.account_id!=expected_account_id || result.conversations.len()>100 || result.execution_location!="local" || result.remote_execution_available || result.automatic_sync_available {return Err("Unsupported shared conversation capability".into())}
 for receipt in &result.conversations{validate_receipt(receipt,&receipt.conversation_id)?;}Ok(result)
}
#[tauri::command]
pub async fn kn_account_conversation_read(app_handle:tauri::AppHandle,expected_account_id:String,conversation_id:String)->Result<ConversationRead,String>{
 uuid(&conversation_id)?;let session=session_revision();let _op=OPERATION_LOCK.lock().await;unchanged(session)?;
 let local=initialized()?;let token=access_token(&app_handle).await?;let mut account=account_for(&token).await?;owned_account(&account,&expected_account_id)?;unchanged(session)?;
 let record:EncryptedRecord=json(identity::send(api_client()?.get(api_url(&format!("/conversations/{conversation_id}"))?).bearer_auth(&token)).await?,360000).await?;unchanged(session)?;
 if record.account_id!=expected_account_id{return Err("Shared conversation belongs to another account".into())}validate_receipt(&record.receipt,&conversation_id)?;
 account.key_version=Some(record.receipt.key_version.clone());ensure_key(&app_handle,&token,&account,&local,session).await?;
 let ciphertext=base64::engine::general_purpose::STANDARD.decode(&record.ciphertext_b64).map_err(|_|"Invalid shared ciphertext")?;
 if digest(&ciphertext)!=record.receipt.sha256{return Err("Shared ciphertext digest mismatch".into())}
 let document:ConversationDocument={let keys=KEYS.lock().map_err(|_|"Account key is busy")?;
  let key=keys.get(&(expected_account_id.clone(),record.receipt.key_version.clone())).ok_or("Account key unavailable")?;
  let plaintext=open_conversation(&ciphertext,&key.key,&expected_account_id,&conversation_id,record.receipt.revision,&record.receipt.key_version).map_err(|e|e.to_string())?;
  serde_json::from_slice(&plaintext).map_err(|_|"Invalid shared conversation schema")?};
 validate(&document)?;if document.conversation_id!=conversation_id{return Err("Conversation identity mismatch".into())}unchanged(session)?;
 WRITES.lock().map_err(|_|"Shared writes are busy")?.remove(&(expected_account_id.clone(),conversation_id));
 Ok(ConversationRead{account_id:expected_account_id,receipt:record.receipt,document})
}
#[tauri::command]
pub async fn kn_account_conversation_publish(app_handle:tauri::AppHandle,expected_account_id:String,expected_revision:u64,confirm_share:bool,document:ConversationDocument)->Result<ConversationReceipt,String>{
 if !confirm_share{return Err("Review encrypted conversation sharing first".into())}validate(&document)?;
 if expected_revision>=9_007_199_254_740_991{return Err("Conversation revision exhausted".into())}
 let session=session_revision();let _op=OPERATION_LOCK.lock().await;unchanged(session)?;
 let local=initialized()?;let token=access_token(&app_handle).await?;let account=account_for(&token).await?;owned_account(&account,&expected_account_id)?;
 let version=account.key_version.as_ref().ok_or("Account key unavailable")?.clone();
 let plaintext=Zeroizing::new(serde_json::to_vec(&document).map_err(|_|"Invalid conversation schema")?);
 if plaintext.len()+48>MAX_CONVERSATION_BYTES{return Err("Conversation exceeds sharing limits".into())}let plaintext_digest=digest(&plaintext);
 ensure_key(&app_handle,&token,&account,&local,session).await?;
 let (mutation,ciphertext)={let mut writes=WRITES.lock().map_err(|_|"Shared writes are busy")?;let key=(expected_account_id.clone(),document.conversation_id.clone());
  if let Some(pending)=writes.get(&key){if pending.expected!=expected_revision || pending.version!=version || pending.plaintext_digest!=plaintext_digest{return Err("Publish outcome uncertain. Retry the same draft or refresh and review before changing it.".into())}}
  else {if writes.len()>=10{return Err("Review interrupted shared writes before opening more conversations".into())}
   let keys=KEYS.lock().map_err(|_|"Account key is busy")?;let protected=keys.get(&(expected_account_id.clone(),version.clone())).ok_or("Account key unavailable")?;
   let ciphertext=seal_conversation(&plaintext,&protected.key,&expected_account_id,&document.conversation_id,expected_revision+1,&version).map_err(|e|e.to_string())?;
   writes.insert(key.clone(),PendingWrite{expected:expected_revision,version:version.clone(),plaintext_digest,mutation:uuid::Uuid::new_v4().to_string(),ciphertext});}
  let pending=writes.get(&key).ok_or("Shared write unavailable")?;(pending.mutation.clone(),pending.ciphertext.clone())};
 unchanged(session)?;
 let builder=api_client()?.put(api_url(&format!("/conversations/{}",document.conversation_id))?).bearer_auth(&token).json(&serde_json::json!({"device_id":local.device_id,"mutation_id":mutation,"key_version":version,"expected_revision":expected_revision,"ciphertext_b64":base64::engine::general_purpose::STANDARD.encode(&ciphertext),"confirm_share":true}));
 let result:WriteReply=json(identity::send(builder).await?,4096).await?;unchanged(session)?;
 validate_receipt(&result.receipt,&document.conversation_id)?;
 if result.account_id!=expected_account_id || result.receipt.revision!=expected_revision+1 || result.receipt.mutation_id!=mutation || result.receipt.sha256!=digest(&ciphertext) || result.receipt.key_version!=version || result.receipt.source_device_id!=local.device_id{return Err("Unexpected shared publish receipt. Refresh and review.".into())}
 WRITES.lock().map_err(|_|"Shared writes are busy")?.remove(&(expected_account_id,document.conversation_id));Ok(result.receipt)
}
#[tauri::command]
pub async fn kn_account_device_revoke(app_handle:tauri::AppHandle,expected_account_id:String,device_id:String,expected_epoch:u64,confirm_revoke:bool)->Result<(),String>{
 uuid(&device_id)?;if !confirm_revoke{return Err("Review device revocation first".into())}
 let session=session_revision();let _op=OPERATION_LOCK.lock().await;unchanged(session)?;
 let local=initialized()?;if device_id==local.device_id{return Err("Revoke this computer from another enrolled computer.".into())}
 let token=access_token(&app_handle).await?;let account=account_for(&token).await?;
 if account.account_id!=expected_account_id || account.epoch!=expected_epoch{return Err("Account authority changed. Refresh devices before revocation.".into())}
 let provider=identity::provider()?;identity::authorize_reviewed(&app_handle,&provider,"backup-device-revoke",&local,Some(&account),Some(&device_id)).await?;unchanged(session)?;
 let reply:serde_json::Value=json(identity::send(api_client()?.post(api_url("/devices/revoke")?).bearer_auth(&token).json(&serde_json::json!({"device_id":local.device_id,"revoked_device_id":device_id,"expected_epoch":expected_epoch,"confirm_revoke":true}))).await?,4096).await?;unchanged(session)?;
 if reply["account_id"]!=expected_account_id || reply["revoked_device_id"]!=device_id || reply["revoked"]!=true{return Err("Device revocation outcome uncertain. Refresh devices.".into())}Ok(())
}

#[cfg(test)]mod tests{use super::*;
 #[test]fn cancelled_key_fetch_cannot_repopulate_an_erased_cache(){
  let account=format!("fixture-{}",uuid::Uuid::new_v4());let version=uuid::Uuid::new_v4().to_string();
  let prior=session_revision();cancel_active();clear_keys();
  assert!(install_key(&account,&version,RecoveryKey::generate().unwrap(),prior).is_err());
  assert!(!KEYS.lock().unwrap().contains_key(&(account,version)));
 }

 #[test]fn imported_documents_cannot_contain_runtime_or_approval_fields(){
  let value=serde_json::json!({"schemaVersion":1,"conversationId":uuid::Uuid::new_v4().to_string(),"title":"Reviewed conversation","messages":[{"id":"stable-message","role":"assistant","text":"Do this later","ts":1,"confirmedActionPrompts":["approved"]}]});
  assert!(serde_json::from_value::<ConversationDocument>(value).is_err());
 }
 #[test]fn conversation_schema_rejects_duplicate_ids_system_roles_and_bad_bounds(){
  let message=ConversationMessage{id:"stable".into(),role:ConversationRole::User,text:"fixture".into(),ts:1};
  let mut document=ConversationDocument{schema_version:1,conversation_id:uuid::Uuid::new_v4().to_string(),title:"Fixture".into(),messages:vec![message.clone(),message]};
  assert!(validate(&document).is_err());document.messages.pop();assert!(validate(&document).is_ok());
  document.messages[0].text="x".repeat(32769);assert!(validate(&document).is_err());
  assert!(serde_json::from_value::<ConversationMessage>(serde_json::json!({"id":"one","role":"system","text":"execute","ts":1})).is_err());
 }
}
