#!/usr/bin/env python3
"""Compile the real native adapter with test-only IPC/auth/secure-store surfaces.
This does NOT validate Tauri macro expansion, real OS keychains, or the full app.
"""
import json
import os
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix="kn-state-adapter-") as temporary:
    test = Path(temporary)
    (test / "src").mkdir()
    manifest = '''[package]
name = "knapsack-backup-adapter-check"
version = "0.1.0"
edition = "2021"
[dependencies]
knapsack-state-backup = { path = CORE_PATH }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sha2 = "0.10"
base64 = "0.21"
uuid = { version = "1", features = ["v4"] }
dirs = "5"
reqwest = { version = "=0.11.26", features = ["json"] }
tokio = { version = "=1.37.0", features = ["full"] }
once_cell = "1"
zeroize = "1.8"
ring = "=0.17.14"
tempfile = "=3.10.1"
walkdir = "=2.5.0"
'''.replace('CORE_PATH', json.dumps(str(root / 'state-backup-core')))
    (test / "Cargo.toml").write_text(manifest)
    source = (root / 'src-tauri/src/state_backup.rs').read_text()
    source = '\n'.join(line for line in source.splitlines() if not line.startswith('//!') and line != '#[tauri::command]')
    # The imessage bridge depends on real Tauri resources/process APIs and is
    # covered by the native suite; this recovery adapter stays network/process-free.
    source = source.replace('#[path = "state_backup_imessage.rs"]\npub(crate) mod imessage;', '')
    source = source.replace('#[path = "state_backup_imessage_delivery.rs"]\npub(crate) mod imessage_delivery;', '')
    source = source.replace('  imessage_delivery::suspend();', '')
    (test / "src/adapter.rs").write_text(source)
    identity = (root / 'src-tauri/src/state_backup_identity.rs').read_text()
    identity = '\n'.join(line for line in identity.splitlines() if not line.startswith('//!'))
    (test / 'src/state_backup_identity.rs').write_text(identity)
    devices = (root / "src-tauri/src/state_backup_devices.rs").read_text()
    devices = "\n".join(line for line in devices.splitlines() if not line.startswith("//!") and line != "#[tauri::command]")
    (test / "src/state_backup_devices.rs").write_text(devices)
    conversations = (root / "src-tauri/src/state_backup_conversations.rs").read_text()
    conversations = "\n".join(line for line in conversations.splitlines() if not line.startswith("//!") and line != "#[tauri::command]")
    (test / "src/state_backup_conversations.rs").write_text(conversations)
    for name in ["loops", "goals", "follow_through", "gbrain"]:
        content = (root / f"src-tauri/src/clawd/{name}.rs").read_text()
        content = '\n'.join(line for line in content.splitlines() if not line.startswith('//!') and line != '#[tauri::command]')
        (test / f"src/{name}.rs").write_text(content)
    service = (root / 'src-tauri/src/clawd/service.rs').read_text()
    begin = service.index('fn apply_knapsack_account_sign_in(')
    end = service.index('async fn exchange_and_store_knapsack_code(', begin)
    helper = service[begin:end]
    (test / 'src/account_sign_in.rs').write_text(helper)
    (test / "src/lib.rs").write_text('''
mod tauri {
  #[derive(Clone)] pub struct AppHandle;
  pub trait Manager { fn shell_scope(&self) {} }
  impl Manager for AppHandle {}
  pub mod api { pub mod shell { pub fn open(_: &(), _: impl AsRef<str>, _: Option<()>) -> Result<(), &'static str> { Err("No browser access in fixtures") } } }
  pub mod async_runtime { pub fn spawn<F>(future: F) where F: std::future::Future<Output=()> + Send + 'static { tokio::spawn(future); } }
}
mod db { pub mod models {
  pub mod email {
    #[derive(Debug, Clone)] pub struct Email {
      pub id: Option<u64>, pub email_uid: String, pub thread_id: Option<String>, pub subject: String,
      pub date: u64, pub sender: String, pub recipient: String, pub cc: String, pub body: String,
      pub is_starred: Option<bool>, pub is_read: Option<bool>, pub is_archived: Option<bool>,
      pub is_deleted: Option<bool>, pub account_email: String,
    }
    impl Email { pub fn get_recent_emails(_:usize)->Vec<Self>{vec![]} pub fn find_goal_evidence(_:usize)->Result<Vec<Self>,String>{Ok(vec![])} }
  }
  pub mod drive_document {
    pub struct DriveDocument { pub filename:String, pub summary:String, pub url:String, pub drive_id:String, pub account_email:String, pub date_modified:u64 }
    impl DriveDocument { pub fn find_goal_evidence(_:usize)->Result<Vec<Self>,String>{Ok(vec![])} }
  }
} }
mod llm {
  pub mod types { pub enum MessageSender { System, User } pub struct Message {pub sender:MessageSender,pub content:String} }
  pub mod use_cases { pub mod complete { pub async fn selected_provider_completion(_:Vec<crate::llm::types::Message>,_:&std::path::PathBuf)->Result<String,String>{Err("No inference in tests".into())} } }
}
mod clawd {
  pub mod service {
    pub async fn studio_access_token(_: &crate::tauri::AppHandle) -> Result<String,String> { Err("No live credentials in adapter tests".into()) }
    pub fn app_clawdbot_home(_: &crate::tauri::AppHandle)->std::path::PathBuf{std::path::PathBuf::new()}
    #[derive(Default)] struct StoredTokens { active_provider:Option<String>, ollama_enabled:Option<bool>, anthropic_api_key:Option<String>, knapsack_access_token:Option<String>, knapsack_refresh_token:Option<String>, knapsack_email:Option<String>, knapsack_model:Option<String> }
    struct DesktopSignInApiResponse { access_token:String, refresh_token:String, email:String }
    fn normalize_provider_model(_: &str, model:&str)->String{model.to_string()}
    include!("account_sign_in.rs");
    #[test] fn real_account_sign_in_helper_preserves_inference_and_byok() {
      for provider in [None,Some("ollama"),Some("anthropic"),Some("openai"),Some("knapsack")] {
        let mut tokens = StoredTokens { active_provider:provider.map(str::to_owned), ollama_enabled:Some(true),anthropic_api_key:Some("test-byok".into()),..Default::default() };
        let sign_in = DesktopSignInApiResponse {access_token:"test-access".into(),refresh_token:"test-refresh".into(),email:"test@example.invalid".into()};
        apply_knapsack_account_sign_in(&mut tokens,&sign_in);
        assert_eq!(tokens.active_provider.as_deref(),provider); assert_eq!(tokens.ollama_enabled,Some(true)); assert_eq!(tokens.anthropic_api_key.as_deref(),Some("test-byok"));
        assert_eq!(tokens.knapsack_email.as_deref(),Some("test@example.invalid"));
      }
    }
  }
  pub mod gmail {
    pub struct NativeGmailRead { pub action:String,pub account_email:Option<String>,pub message_id:Option<String>,pub query:Option<String>,pub max_results:Option<usize>,pub page_token:Option<String> }
    pub async fn native_gmail_read_impl(_: &NativeGmailRead)->Result<serde_json::Value,String>{Err("No email access in tests".into())}
  }
  #[allow(dead_code)] pub mod loops { include!("loops.rs"); }
  #[allow(dead_code)] pub mod goals { include!("goals.rs"); }
  #[allow(dead_code, unused_imports)] pub mod gbrain { use crate::tauri; include!("gbrain.rs"); }
  #[allow(dead_code)] pub mod follow_through { use crate::tauri; include!("follow_through.rs"); }
}
mod keyring {
  pub struct Entry;
  impl Entry {
    pub fn new(_: &str, _: &str) -> Result<Self, &'static str> { Err("Test secure-store unavailable") }
    pub fn get_password(&self) -> Result<String, &'static str> { Err("Locked") }
    pub fn set_password(&self, _: &str) -> Result<(), &'static str> { Err("Locked") }
    pub fn delete_credential(&self) -> Result<(), &'static str> { Err("Locked") }
  }
}
#[allow(dead_code)] mod state_backup { use crate::{keyring, tauri}; include!("adapter.rs");
  #[cfg(test)] mod secure_store_checks {
    #[test] fn unavailable_secure_store_cannot_persist_key() {
      assert!(super::store_key("synthetic-account", "synthetic-device", &"00".repeat(32)).unwrap_err().contains("OS credential store unavailable"));
    }
    #[test] fn unavailable_secure_store_cannot_recover_key() {
      match super::read_key("synthetic-account", "synthetic-device") {
        Err(error) => assert!(error.contains("OS credential store unavailable")),
        Ok(_) => panic!("Unavailable secure store returned a key"),
      }
    }
  }
}
''')
    environment = dict(os.environ)
    environment.setdefault('CARGO_TARGET_DIR', str(root / 'state-backup-core/target/adapter-check'))
    subprocess.run(['cargo', 'test', '--manifest-path', str(test / 'Cargo.toml')], check=True, env=environment)
