//! Explicit, workspace-scoped Slack delegation. Nomination is a desktop-only
//! setting; the chat tool can only add a member, never nominate another admin.
use actix_web::{get, post, web, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use super::{gateway_client, service::clawdbot_home_headless, session_watcher, studio_mcp};

#[derive(Clone, Serialize, Deserialize)]
pub(crate) struct Nomination {
  owner: String,
  account_id: String,
  workspace_id: String,
  user_id: String,
  email: String,
}

#[derive(Deserialize)]
pub struct NominateRequest {
  account_id: String,
  workspace_id: String,
  user_id: Option<String>,
}

fn valid_id(value: &str, prefixes: &[char]) -> bool {
  value.len() >= 2 && prefixes.contains(&value.chars().next().unwrap_or(' '))
    && value.chars().all(|c| c.is_ascii_uppercase() || c.is_ascii_digit())
}

// Shared across the desktop and MCP subprocess. Fail closed on concurrent
// changes so revocation cannot race a chat addition or another nomination.
struct AdminLock(std::path::PathBuf);
impl AdminLock {
  fn acquire() -> Result<Self, String> {
    let path = clawdbot_home_headless()?.join(".slack-admin-write.lock");
    std::fs::OpenOptions::new().write(true).create_new(true).open(&path)
      .map_err(|_| "Another admin change is in progress. If a previous process crashed, remove the stale .slack-admin-write.lock in the Knapsack state folder.".to_string())?;
    Ok(Self(path))
  }
}
impl Drop for AdminLock {
  fn drop(&mut self) { let _ = std::fs::remove_file(&self.0); }
}

fn read_nominations() -> Result<Vec<Nomination>, String> {
  let path = clawdbot_home_headless()?.join("slack-admins.json");
  match std::fs::read_to_string(path) {
    Ok(raw) => serde_json::from_str(&raw).map_err(|e| format!("Invalid admin settings: {e}")),
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(vec![]),
    Err(e) => Err(e.to_string()),
  }
}

fn write_nominations(rows: &[Nomination]) -> Result<(), String> {
  use std::io::Write;
  let home = clawdbot_home_headless()?;
  let temp = home.join(format!(".slack-admins-{}.tmp", uuid::Uuid::new_v4()));
  let mut options = std::fs::OpenOptions::new();
  options.write(true).create_new(true);
  #[cfg(unix)] {
    use std::os::unix::fs::OpenOptionsExt;
    options.mode(0o600);
  }
  let mut file = options.open(&temp).map_err(|e| e.to_string())?;
  file.write_all(serde_json::to_string_pretty(rows).map_err(|e| e.to_string())?.as_bytes()).map_err(|e| e.to_string())?;
  file.sync_all().map_err(|e| e.to_string())?;
  std::fs::rename(temp, home.join("slack-admins.json")).map_err(|e| e.to_string())
}

// The desktop API bearer-token middleware protects these Settings endpoints.
// Neither endpoint is exposed as an agent tool.
#[get("/api/clawd/slack/admins")]
pub async fn get_admins() -> HttpResponse {
  let result = studio_mcp::signed_in_owner().and_then(|owner| {
    Ok(read_nominations()?.into_iter().filter(|n| n.owner.eq_ignore_ascii_case(&owner)).collect::<Vec<_>>())
  });
  match result {
    Ok(admins) => HttpResponse::Ok().json(json!({"success":true,"admins":admins})),
    Err(error) => HttpResponse::BadRequest().json(json!({"success":false,"message":error})),
  }
}

#[post("/api/clawd/slack/admins")]
pub async fn nominate(body: web::Json<NominateRequest>) -> HttpResponse {
  match nominate_inner(&body).await {
    Ok(()) => HttpResponse::Ok().json(json!({"success":true})),
    Err(error) => HttpResponse::BadRequest().json(json!({"success":false,"message":error})),
  }
}

async fn nominate_inner(body: &NominateRequest) -> Result<(), String> {
  let _lock = AdminLock::acquire()?;
  let owner = studio_mcp::signed_in_owner()?;
  if body.account_id.trim().is_empty() || !valid_id(&body.workspace_id, &['T']) {
    return Err("Choose a Slack account and valid workspace ID".into());
  }
  let new_admin = if let Some(user) = &body.user_id {
    if !valid_id(user, &['U','W']) { return Err("Enter an exact Slack member ID".into()); }
    let email = session_watcher::resolve_slack_email_for_workspace(
      &clawdbot_home_headless()?, &body.account_id, user, Some(&body.workspace_id),
    ).await?;
    Some(Nomination { owner:owner.clone(), account_id:body.account_id.clone(), workspace_id:body.workspace_id.clone(), user_id:user.clone(), email })
  } else { None };
  let mut rows = read_nominations()?;
  rows.retain(|n| !(n.owner.eq_ignore_ascii_case(&owner) && n.account_id == body.account_id && n.workspace_id == body.workspace_id));
  if let Some(admin) = new_admin { rows.push(admin); }
  write_nominations(&rows)
}

fn matching_admin<'a>(rows: &'a [Nomination], owner: &str, account: &str, workspace: &str, user: &str) -> Result<&'a Nomination, String> {
  rows.iter().find(|n| n.owner.eq_ignore_ascii_case(owner) && n.account_id == account && n.workspace_id == workspace && n.user_id == user)
    .ok_or("Only the admin nominated in Settings for this Slack workspace can add people".into())
}

pub(crate) async fn add_from_chat(args: &Value) -> Result<Value, String> {
  let field = |name| args.get(name).and_then(Value::as_str).filter(|s| !s.trim().is_empty()).ok_or_else(|| format!("Missing trusted Slack context: {name}"));
  let session = field("_knapsack_session_id")?;
  let scope = field("_knapsack_scope_key")?;
  let account = field("_knapsack_slack_account_id")?;
  let workspace = field("_knapsack_slack_workspace_id")?;
  let sender = field("_knapsack_slack_user_id")?;
  if !scope.contains(":slack:") { return Err("Admin additions require a Slack chat".into()); }
  let target = args.get("user_id").and_then(Value::as_str).unwrap_or("");
  if !valid_id(target, &['U','W']) { return Err("Use an exact Slack member ID; wildcards and names are not accepted".into()); }
  let _lock = AdminLock::acquire()?;
  let owner = studio_mcp::signed_in_owner()?;
  let rows = read_nominations()?;
  let admin = matching_admin(&rows, &owner, account, workspace, sender)?;
  let (email, _) = session_watcher::resolve_bound_authorized_session_with_slack_context(session, scope, Some(account), Some(sender), Some(workspace)).await?;
  if !email.eq_ignore_ascii_case(&admin.email) { return Err("Admin identity changed; ask the desktop owner to nominate again".into()); }
  session_watcher::resolve_slack_email_for_workspace(&clawdbot_home_headless()?, account, target, Some(workspace)).await?;
  let snapshot = gateway_client::config_get(None).await?;
  let patch = addition_patch(&snapshot["config"], account, target)?;
  let hash = snapshot["hash"].as_str().ok_or("Missing config revision")?;
  // Compare-and-swap: a concurrent edit fails rather than overwriting members.
  gateway_client::config_patch(&patch.to_string(), hash, None).await?;
  log::info!("Slack allowlist addition: workspace={} account={} admin={} member={}", workspace, account, sender, target);
  Ok(json!({"ok":true,"workspace_id":workspace,"user_id":target,"message":"Added member to this workspace's Slack DM allow list"}))
}

fn addition_patch(config: &Value, account: &str, target: &str) -> Result<Value, String> {
  let slack = &config["channels"]["slack"];
  let accounts = slack.get("accounts").and_then(Value::as_object);
  let account_config = accounts.and_then(|a| a.get(account));
  if account_config.is_none() && account != "default" { return Err("Slack account is not configured".into()); }
  let effective = account_config.unwrap_or(slack);
  let policy = effective.get("dmPolicy").or_else(|| slack.get("dmPolicy")).and_then(Value::as_str).unwrap_or("pairing");
  if policy != "allowlist" { return Err("Set this Slack account to allow-list mode in Settings first".into()); }
  let mut allowed = effective.get("allowFrom").or_else(|| slack.get("allowFrom")).and_then(Value::as_array).cloned().unwrap_or_default();
  if allowed.iter().any(|v| v.as_str() == Some("*")) { return Err("Remove wildcard access in Settings first".into()); }
  if !allowed.iter().any(|v| v.as_str() == Some(target)) { allowed.push(json!(target)); }
  // Always scope the override to one account; never broaden other workspaces.
  Ok(json!({"channels":{"slack":{"accounts":{account:{"allowFrom":allowed}}}}}))
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn admin_is_bound_to_owner_workspace_account_and_sender() {
    let rows = vec![Nomination{owner:"owner@example.com".into(),account_id:"work".into(),workspace_id:"T123".into(),user_id:"U123".into(),email:"admin@example.com".into()}];
    assert!(matching_admin(&rows,"owner@example.com","work","T123","U123").is_ok());
    for (o,a,w,u) in [("other@example.com","work","T123","U123"),("owner@example.com","other","T123","U123"),("owner@example.com","work","T999","U123"),("owner@example.com","work","T123","U999")] {
      assert!(matching_admin(&rows,o,a,w,u).is_err());
    }
    assert!(matching_admin(&[],"owner@example.com","work","T123","U123").is_err());
  }
  #[test]
  fn additions_preserve_members_and_isolate_accounts() {
    let config=json!({"channels":{"slack":{"dmPolicy":"allowlist","allowFrom":["U1"],"accounts":{"work":{},"other":{"allowFrom":["U9"]}}}}});
    let patch=addition_patch(&config,"work","U2").unwrap();
    assert_eq!(patch["channels"]["slack"]["accounts"]["work"]["allowFrom"],json!(["U1","U2"]));
    assert!(patch["channels"]["slack"]["accounts"].get("other").is_none());
    assert!(addition_patch(&config,"missing","U2").is_err());
    assert!(addition_patch(&json!({}),"default","U2").is_err());
    assert!(!valid_id("*", &['U','W']));
    assert!(!valid_id("Fran", &['U','W']));
  }
}
