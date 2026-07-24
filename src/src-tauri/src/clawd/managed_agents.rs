use actix_web::{get, post, web, HttpResponse, Responder};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ExecutionMode {
  CloudPrimary,
  CloudPrimaryWithOptionalDesktopExtension,
  DesktopPrimaryWithCloudFallback,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ChannelKind {
  Slack,
  StudioChat,
  DesktopChat,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DesktopSessionRequirement {
  None,
  Preferred,
  Required,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum CapabilityKind {
  BrowserAutomation,
  SignedInBrowserSession,
  ComputerUse,
  LocalFiles,
  LocalApps,
  PrivateLocalContext,
  CloudChat,
  SharedTaskContext,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RouteTarget {
  Cloud,
  Desktop,
  HybridFallback,
  Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RuntimeKind {
  Cloud,
  Desktop,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryLayers {
  pub template: String,
  pub role_pack: String,
  pub tenant: String,
  pub instance: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ManagedAgentTemplate {
  pub template_id: String,
  pub display_name: String,
  pub description: String,
  pub default_policy_pack_id: String,
  pub recommended_execution_mode: ExecutionMode,
  pub supported_channels: Vec<ChannelKind>,
  pub reusable_memory_scope: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PolicyPack {
  pub policy_pack_id: String,
  pub description: String,
  pub slack_thread_only: bool,
  pub verbose_reasoning_enabled: bool,
  pub gui_keystroke_simulation_enabled: bool,
  pub require_dom_verification: bool,
  pub show_model_fallbacks: bool,
  pub recurring_task_truthfulness_required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ManagedAgent {
  pub agent_id: String,
  pub display_name: String,
  pub template_id: String,
  pub tenant_id: String,
  pub policy_pack_id: String,
  pub execution_mode: ExecutionMode,
  pub enabled_channels: Vec<ChannelKind>,
  pub memory_layers: MemoryLayers,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopPresenceRecord {
  pub user_id: String,
  pub device_id: String,
  pub available: bool,
  pub desktop_extension_enabled: bool,
  pub browser_automation: bool,
  pub signed_in_browser_session: bool,
  pub computer_use: bool,
  pub local_files: bool,
  pub local_apps: bool,
  pub private_local_context: bool,
  pub last_heartbeat_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SharedContextRecord {
  pub agent_id: String,
  pub context_key: String,
  pub tenant_id: String,
  pub user_id: String,
  pub thread_id: Option<String>,
  pub current_runtime: RuntimeKind,
  pub handoff_summary: String,
  pub last_user_intent: String,
  pub notes: Vec<String>,
  pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ManagedAgentStore {
  pub version: u32,
  pub templates: Vec<ManagedAgentTemplate>,
  pub policy_packs: Vec<PolicyPack>,
  pub agents: Vec<ManagedAgent>,
  pub desktop_presence: Vec<DesktopPresenceRecord>,
  pub shared_context: Vec<SharedContextRecord>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertManagedAgentRequest {
  pub agent: ManagedAgent,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertDesktopPresenceRequest {
  pub presence: DesktopPresenceRecord,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertSharedContextRequest {
  pub context: SharedContextRecord,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RoutePreviewRequest {
  pub agent_id: String,
  pub user_id: String,
  pub channel: ChannelKind,
  pub task_summary: String,
  pub context_key: Option<String>,
  pub required_capabilities: Vec<CapabilityKind>,
  pub desktop_session_requirement: DesktopSessionRequirement,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SharedContextDescriptor {
  pub context_key: String,
  pub continuity_mode: String,
  pub memory_layers: MemoryLayers,
  pub current_runtime: Option<RuntimeKind>,
  pub handoff_summary: Option<String>,
  pub shared_context_available: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopPresenceSummary {
  pub user_id: String,
  pub device_id: String,
  pub available: bool,
  pub desktop_extension_enabled: bool,
  pub browser_automation: bool,
  pub signed_in_browser_session: bool,
  pub computer_use: bool,
  pub local_files: bool,
  pub local_apps: bool,
  pub private_local_context: bool,
  pub last_heartbeat_at: String,
  pub stale: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RoutePreviewResponse {
  pub success: bool,
  pub agent_id: String,
  pub route_target: RouteTarget,
  pub selected_runtime: Option<RuntimeKind>,
  pub fallback_runtime: Option<RuntimeKind>,
  pub reasons: Vec<String>,
  pub policy_pack_id: String,
  pub shared_context: SharedContextDescriptor,
  pub matched_presence: Option<DesktopPresenceSummary>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ManagedAgentsIndexResponse {
  pub success: bool,
  pub version: u32,
  pub templates: Vec<ManagedAgentTemplate>,
  pub policy_packs: Vec<PolicyPack>,
  pub agents: Vec<ManagedAgent>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleSuccessResponse {
  pub success: bool,
  pub message: String,
}

fn now_iso() -> String {
  Utc::now().to_rfc3339()
}

fn default_templates() -> Vec<ManagedAgentTemplate> {
  vec![
    ManagedAgentTemplate {
      template_id: "scout_general".to_string(),
      display_name: "Scout".to_string(),
      description:
        "General-purpose managed Knapsack agent with cloud-first routing and optional desktop execution."
          .to_string(),
      default_policy_pack_id: "shared_slack_safe_v1".to_string(),
      recommended_execution_mode: ExecutionMode::CloudPrimary,
      supported_channels: vec![
        ChannelKind::Slack,
        ChannelKind::StudioChat,
        ChannelKind::DesktopChat,
      ],
      reusable_memory_scope: vec![
        "template".to_string(),
        "tenant".to_string(),
        "instance".to_string(),
      ],
    },
    ManagedAgentTemplate {
      template_id: "compliance_manager".to_string(),
      display_name: "Compliance Manager".to_string(),
      description:
        "Compliance-focused managed agent for mailbox review, filing, checklists, and escalation."
          .to_string(),
      default_policy_pack_id: "compliance_controlled_v1".to_string(),
      recommended_execution_mode: ExecutionMode::CloudPrimaryWithOptionalDesktopExtension,
      supported_channels: vec![ChannelKind::Slack, ChannelKind::StudioChat],
      reusable_memory_scope: vec![
        "template".to_string(),
        "role_pack".to_string(),
        "tenant".to_string(),
        "instance".to_string(),
      ],
    },
    ManagedAgentTemplate {
      template_id: "operations_assistant".to_string(),
      display_name: "Operations Assistant".to_string(),
      description:
        "Operations-focused managed agent for scheduling, recurring work, follow-through, and execution."
          .to_string(),
      default_policy_pack_id: "operations_assistant_v1".to_string(),
      recommended_execution_mode: ExecutionMode::CloudPrimaryWithOptionalDesktopExtension,
      supported_channels: vec![ChannelKind::Slack, ChannelKind::StudioChat],
      reusable_memory_scope: vec![
        "template".to_string(),
        "role_pack".to_string(),
        "tenant".to_string(),
        "instance".to_string(),
      ],
    },
  ]
}

fn default_policy_packs() -> Vec<PolicyPack> {
  vec![
    PolicyPack {
      policy_pack_id: "shared_slack_safe_v1".to_string(),
      description:
        "Shared-agent Slack defaults: threads on, verbose reasoning off, no GUI keystroke simulation."
          .to_string(),
      slack_thread_only: true,
      verbose_reasoning_enabled: false,
      gui_keystroke_simulation_enabled: false,
      require_dom_verification: true,
      show_model_fallbacks: true,
      recurring_task_truthfulness_required: true,
    },
    PolicyPack {
      policy_pack_id: "compliance_controlled_v1".to_string(),
      description:
        "Compliance-safe shared agent policy with stronger guardrails around execution and verification."
          .to_string(),
      slack_thread_only: true,
      verbose_reasoning_enabled: false,
      gui_keystroke_simulation_enabled: false,
      require_dom_verification: true,
      show_model_fallbacks: true,
      recurring_task_truthfulness_required: true,
    },
    PolicyPack {
      policy_pack_id: "operations_assistant_v1".to_string(),
      description:
        "Operations assistant defaults with cloud-first routing and optional desktop execution."
          .to_string(),
      slack_thread_only: true,
      verbose_reasoning_enabled: false,
      gui_keystroke_simulation_enabled: false,
      require_dom_verification: true,
      show_model_fallbacks: true,
      recurring_task_truthfulness_required: true,
    },
  ]
}

fn default_agents() -> Vec<ManagedAgent> {
  vec![
    ManagedAgent {
      agent_id: "scout_general".to_string(),
      display_name: "Scout".to_string(),
      template_id: "scout_general".to_string(),
      tenant_id: "global".to_string(),
      policy_pack_id: "shared_slack_safe_v1".to_string(),
      execution_mode: ExecutionMode::CloudPrimary,
      enabled_channels: vec![
        ChannelKind::Slack,
        ChannelKind::StudioChat,
        ChannelKind::DesktopChat,
      ],
      memory_layers: MemoryLayers {
        template: "scout_general_v1".to_string(),
        role_pack: "scout_general_v1".to_string(),
        tenant: "global_shared_v1".to_string(),
        instance: "scout_general_instance_v1".to_string(),
      },
    },
    ManagedAgent {
      agent_id: "vera_compliance_manager".to_string(),
      display_name: "Vera".to_string(),
      template_id: "compliance_manager".to_string(),
      tenant_id: "rethought".to_string(),
      policy_pack_id: "compliance_controlled_v1".to_string(),
      execution_mode: ExecutionMode::CloudPrimaryWithOptionalDesktopExtension,
      enabled_channels: vec![ChannelKind::Slack, ChannelKind::StudioChat],
      memory_layers: MemoryLayers {
        template: "compliance_manager_v1".to_string(),
        role_pack: "rethought_compliance_ops_v1".to_string(),
        tenant: "tenant_rethought_shared_v1".to_string(),
        instance: "vera_compliance_manager_v1".to_string(),
      },
    },
    ManagedAgent {
      agent_id: "felix_operations_assistant".to_string(),
      display_name: "Felix".to_string(),
      template_id: "operations_assistant".to_string(),
      tenant_id: "rethought".to_string(),
      policy_pack_id: "operations_assistant_v1".to_string(),
      execution_mode: ExecutionMode::CloudPrimaryWithOptionalDesktopExtension,
      enabled_channels: vec![ChannelKind::Slack, ChannelKind::StudioChat],
      memory_layers: MemoryLayers {
        template: "operations_assistant_v1".to_string(),
        role_pack: "rethought_operations_v1".to_string(),
        tenant: "tenant_rethought_shared_v1".to_string(),
        instance: "felix_operations_assistant_v1".to_string(),
      },
    },
  ]
}

fn default_store() -> ManagedAgentStore {
  ManagedAgentStore {
    version: 1,
    templates: default_templates(),
    policy_packs: default_policy_packs(),
    agents: default_agents(),
    desktop_presence: Vec::new(),
    shared_context: Vec::new(),
  }
}

fn managed_agents_home(app_handle: &tauri::AppHandle) -> PathBuf {
  app_handle
    .path_resolver()
    .app_data_dir()
    .unwrap_or_else(|| PathBuf::from("."))
    .join("managed-agents")
}

fn managed_agents_store_path(app_handle: &tauri::AppHandle) -> PathBuf {
  managed_agents_home(app_handle).join("registry.json")
}

fn ensure_dir(path: &Path) -> Result<(), String> {
  fs::create_dir_all(path).map_err(|e| format!("Failed to create dir {}: {}", path.display(), e))
}

fn load_store_from_path(path: &Path) -> Result<ManagedAgentStore, String> {
  if path.exists() {
    let raw = fs::read_to_string(path).map_err(|e| {
      format!(
        "Failed reading managed agent store {}: {}",
        path.display(),
        e
      )
    })?;
    let parsed = serde_json::from_str::<ManagedAgentStore>(&raw).map_err(|e| {
      format!(
        "Failed parsing managed agent store {}: {}",
        path.display(),
        e
      )
    })?;
    return Ok(parsed);
  }

  let store = default_store();
  if let Some(parent) = path.parent() {
    ensure_dir(parent)?;
  }
  fs::write(
    path,
    serde_json::to_string_pretty(&store).unwrap_or_else(|_| "{}".to_string()),
  )
  .map_err(|e| {
    format!(
      "Failed writing managed agent store {}: {}",
      path.display(),
      e
    )
  })?;
  Ok(store)
}

fn save_store_to_path(path: &Path, store: &ManagedAgentStore) -> Result<(), String> {
  if let Some(parent) = path.parent() {
    ensure_dir(parent)?;
  }
  fs::write(
    path,
    serde_json::to_string_pretty(store).unwrap_or_else(|_| "{}".to_string()),
  )
  .map_err(|e| {
    format!(
      "Failed writing managed agent store {}: {}",
      path.display(),
      e
    )
  })
}

fn load_store(app_handle: &tauri::AppHandle) -> Result<ManagedAgentStore, String> {
  let path = managed_agents_store_path(app_handle);
  load_store_from_path(&path)
}

fn save_store(app_handle: &tauri::AppHandle, store: &ManagedAgentStore) -> Result<(), String> {
  let path = managed_agents_store_path(app_handle);
  save_store_to_path(&path, store)
}

fn parse_timestamp(ts: &str) -> Option<DateTime<Utc>> {
  DateTime::parse_from_rfc3339(ts)
    .ok()
    .map(|parsed| parsed.with_timezone(&Utc))
}

fn is_presence_stale(presence: &DesktopPresenceRecord) -> bool {
  parse_timestamp(&presence.last_heartbeat_at)
    .map(|heartbeat| Utc::now() - heartbeat > Duration::minutes(5))
    .unwrap_or(true)
}

fn presence_supports_capabilities(
  presence: &DesktopPresenceRecord,
  required: &[CapabilityKind],
) -> bool {
  if !presence.available || !presence.desktop_extension_enabled || is_presence_stale(presence) {
    return false;
  }

  required.iter().all(|capability| match capability {
    CapabilityKind::BrowserAutomation => presence.browser_automation,
    CapabilityKind::SignedInBrowserSession => {
      presence.browser_automation && presence.signed_in_browser_session
    }
    CapabilityKind::ComputerUse => presence.computer_use,
    CapabilityKind::LocalFiles => presence.local_files,
    CapabilityKind::LocalApps => presence.local_apps,
    CapabilityKind::PrivateLocalContext => presence.private_local_context,
    CapabilityKind::CloudChat => true,
    CapabilityKind::SharedTaskContext => true,
  })
}

fn requires_desktop(required: &[CapabilityKind]) -> bool {
  required.iter().any(|capability| {
    matches!(
      capability,
      CapabilityKind::ComputerUse
        | CapabilityKind::LocalFiles
        | CapabilityKind::LocalApps
        | CapabilityKind::PrivateLocalContext
    )
  })
}

fn prefers_desktop(required: &[CapabilityKind]) -> bool {
  required.iter().any(|capability| {
    matches!(
      capability,
      CapabilityKind::BrowserAutomation | CapabilityKind::SignedInBrowserSession
    )
  })
}

fn route_request(
  request: &RoutePreviewRequest,
  agent: &ManagedAgent,
  presence: Option<&DesktopPresenceRecord>,
  context: Option<&SharedContextRecord>,
) -> RoutePreviewResponse {
  let has_live_desktop = presence
    .map(|entry| presence_supports_capabilities(entry, &request.required_capabilities))
    .unwrap_or(false);
  let matched_presence = presence.map(|entry| DesktopPresenceSummary {
    user_id: entry.user_id.clone(),
    device_id: entry.device_id.clone(),
    available: entry.available,
    desktop_extension_enabled: entry.desktop_extension_enabled,
    browser_automation: entry.browser_automation,
    signed_in_browser_session: entry.signed_in_browser_session,
    computer_use: entry.computer_use,
    local_files: entry.local_files,
    local_apps: entry.local_apps,
    private_local_context: entry.private_local_context,
    last_heartbeat_at: entry.last_heartbeat_at.clone(),
    stale: is_presence_stale(entry),
  });

  let mut reasons = Vec::new();
  let needs_desktop = requires_desktop(&request.required_capabilities);
  let desktop_benefit = prefers_desktop(&request.required_capabilities);
  let requirement = request.desktop_session_requirement.clone();

  let shared_context = SharedContextDescriptor {
    context_key: request
      .context_key
      .clone()
      .unwrap_or_else(|| format!("{}:{}", agent.agent_id, request.user_id)),
    continuity_mode: "shared_context".to_string(),
    memory_layers: agent.memory_layers.clone(),
    current_runtime: context.map(|value| value.current_runtime.clone()),
    handoff_summary: context.map(|value| value.handoff_summary.clone()),
    shared_context_available: true,
  };

  let (route_target, selected_runtime, fallback_runtime) = match agent.execution_mode {
    ExecutionMode::CloudPrimary => {
      if needs_desktop || requirement == DesktopSessionRequirement::Required {
        reasons.push(
          "Agent is cloud-primary and this task requires a desktop-only capability.".to_string(),
        );
        (RouteTarget::Blocked, None, None)
      } else {
        reasons.push("Cloud-primary execution selected.".to_string());
        (RouteTarget::Cloud, Some(RuntimeKind::Cloud), None)
      }
    }
    ExecutionMode::CloudPrimaryWithOptionalDesktopExtension => {
      if needs_desktop || requirement == DesktopSessionRequirement::Required {
        if has_live_desktop {
          reasons.push("Desktop-only capability available on paired desktop.".to_string());
          (
            RouteTarget::Desktop,
            Some(RuntimeKind::Desktop),
            Some(RuntimeKind::Cloud),
          )
        } else {
          reasons.push(
            "Desktop-only capability requested, but no live desktop extension is available."
              .to_string(),
          );
          (RouteTarget::Blocked, None, None)
        }
      } else if desktop_benefit || requirement == DesktopSessionRequirement::Preferred {
        if has_live_desktop {
          reasons
            .push("Desktop available, so preferred desktop path will be used first.".to_string());
          (
            RouteTarget::HybridFallback,
            Some(RuntimeKind::Desktop),
            Some(RuntimeKind::Cloud),
          )
        } else {
          reasons.push(
            "No live desktop matched the request, so shared-context cloud fallback will handle it."
              .to_string(),
          );
          (RouteTarget::Cloud, Some(RuntimeKind::Cloud), None)
        }
      } else {
        reasons.push("Cloud can satisfy this task without desktop help.".to_string());
        (RouteTarget::Cloud, Some(RuntimeKind::Cloud), None)
      }
    }
    ExecutionMode::DesktopPrimaryWithCloudFallback => {
      if has_live_desktop {
        reasons.push("Desktop-primary execution selected.".to_string());
        (
          RouteTarget::HybridFallback,
          Some(RuntimeKind::Desktop),
          Some(RuntimeKind::Cloud),
        )
      } else if needs_desktop || requirement == DesktopSessionRequirement::Required {
        reasons.push(
          "Desktop-primary agent is offline and this task cannot be fulfilled in cloud."
            .to_string(),
        );
        (RouteTarget::Blocked, None, None)
      } else {
        reasons.push(
          "Desktop-primary agent is offline, so cloud fallback will continue with shared context."
            .to_string(),
        );
        (RouteTarget::Cloud, Some(RuntimeKind::Cloud), None)
      }
    }
  };

  RoutePreviewResponse {
    success: route_target != RouteTarget::Blocked,
    agent_id: agent.agent_id.clone(),
    route_target,
    selected_runtime,
    fallback_runtime,
    reasons,
    policy_pack_id: agent.policy_pack_id.clone(),
    shared_context,
    matched_presence,
  }
}

#[get("/api/clawd/managed-agents")]
pub async fn managed_agents_index(app: web::Data<tauri::AppHandle>) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(store) => HttpResponse::Ok().json(ManagedAgentsIndexResponse {
      success: true,
      version: store.version,
      templates: store.templates,
      policy_packs: store.policy_packs,
      agents: store.agents,
    }),
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[get("/api/clawd/managed-agents/templates")]
pub async fn managed_agent_templates(app: web::Data<tauri::AppHandle>) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(store) => HttpResponse::Ok().json(store.templates),
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[get("/api/clawd/managed-agents/policies")]
pub async fn managed_agent_policies(app: web::Data<tauri::AppHandle>) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(store) => HttpResponse::Ok().json(store.policy_packs),
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[get("/api/clawd/managed-agents/agents")]
pub async fn managed_agent_list(app: web::Data<tauri::AppHandle>) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(store) => HttpResponse::Ok().json(store.agents),
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[post("/api/clawd/managed-agents/agents/upsert")]
pub async fn managed_agent_upsert(
  app: web::Data<tauri::AppHandle>,
  body: web::Json<UpsertManagedAgentRequest>,
) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(mut store) => {
      let next = body.agent.clone();
      if let Some(existing) = store
        .agents
        .iter_mut()
        .find(|candidate| candidate.agent_id == next.agent_id)
      {
        *existing = next.clone();
      } else {
        store.agents.push(next.clone());
      }

      match save_store(app.get_ref(), &store) {
        Ok(()) => HttpResponse::Ok().json(next),
        Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
          success: false,
          message: error,
        }),
      }
    }
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[post("/api/clawd/managed-agents/desktop-presence")]
pub async fn managed_agent_upsert_presence(
  app: web::Data<tauri::AppHandle>,
  body: web::Json<UpsertDesktopPresenceRequest>,
) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(mut store) => {
      let next = body.presence.clone();
      if let Some(existing) = store.desktop_presence.iter_mut().find(|candidate| {
        candidate.user_id == next.user_id && candidate.device_id == next.device_id
      }) {
        *existing = next.clone();
      } else {
        store.desktop_presence.push(next.clone());
      }

      match save_store(app.get_ref(), &store) {
        Ok(()) => HttpResponse::Ok().json(next),
        Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
          success: false,
          message: error,
        }),
      }
    }
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[get("/api/clawd/managed-agents/desktop-presence/{user_id}")]
pub async fn managed_agent_presence_for_user(
  app: web::Data<tauri::AppHandle>,
  path: web::Path<String>,
) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(store) => {
      let user_id = path.into_inner();
      let entries = store
        .desktop_presence
        .into_iter()
        .filter(|entry| entry.user_id == user_id)
        .collect::<Vec<_>>();
      HttpResponse::Ok().json(entries)
    }
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[post("/api/clawd/managed-agents/context/upsert")]
pub async fn managed_agent_upsert_context(
  app: web::Data<tauri::AppHandle>,
  body: web::Json<UpsertSharedContextRequest>,
) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(mut store) => {
      let mut next = body.context.clone();
      next.updated_at = now_iso();
      if let Some(existing) = store.shared_context.iter_mut().find(|candidate| {
        candidate.agent_id == next.agent_id && candidate.context_key == next.context_key
      }) {
        *existing = next.clone();
      } else {
        store.shared_context.push(next.clone());
      }

      match save_store(app.get_ref(), &store) {
        Ok(()) => HttpResponse::Ok().json(next),
        Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
          success: false,
          message: error,
        }),
      }
    }
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[get("/api/clawd/managed-agents/context/{agent_id}/{context_key}")]
pub async fn managed_agent_context_get(
  app: web::Data<tauri::AppHandle>,
  path: web::Path<(String, String)>,
) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(store) => {
      let (agent_id, context_key) = path.into_inner();
      match store
        .shared_context
        .into_iter()
        .find(|context| context.agent_id == agent_id && context.context_key == context_key)
      {
        Some(context) => HttpResponse::Ok().json(context),
        None => HttpResponse::NotFound().json(SimpleSuccessResponse {
          success: false,
          message: "Shared context not found".to_string(),
        }),
      }
    }
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[post("/api/clawd/managed-agents/route-preview")]
pub async fn managed_agent_route_preview(
  app: web::Data<tauri::AppHandle>,
  body: web::Json<RoutePreviewRequest>,
) -> impl Responder {
  match load_store(app.get_ref()) {
    Ok(store) => {
      let request = body.into_inner();
      let Some(agent) = store
        .agents
        .iter()
        .find(|candidate| candidate.agent_id == request.agent_id)
      else {
        return HttpResponse::NotFound().json(SimpleSuccessResponse {
          success: false,
          message: format!("Managed agent '{}' was not found", request.agent_id),
        });
      };

      let presence = store
        .desktop_presence
        .iter()
        .filter(|entry| entry.user_id == request.user_id)
        .max_by_key(|entry| parse_timestamp(&entry.last_heartbeat_at))
        .cloned();
      let context = request.context_key.as_ref().and_then(|context_key| {
        store
          .shared_context
          .iter()
          .find(|entry| entry.agent_id == agent.agent_id && entry.context_key == *context_key)
          .cloned()
      });

      let response = route_request(&request, agent, presence.as_ref(), context.as_ref());
      HttpResponse::Ok().json(response)
    }
    Err(error) => HttpResponse::InternalServerError().json(SimpleSuccessResponse {
      success: false,
      message: error,
    }),
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  fn desktop_presence(user_id: &str) -> DesktopPresenceRecord {
    DesktopPresenceRecord {
      user_id: user_id.to_string(),
      device_id: "desktop-1".to_string(),
      available: true,
      desktop_extension_enabled: true,
      browser_automation: true,
      signed_in_browser_session: true,
      computer_use: true,
      local_files: true,
      local_apps: true,
      private_local_context: true,
      last_heartbeat_at: now_iso(),
    }
  }

  fn route_request_for(
    capabilities: Vec<CapabilityKind>,
    requirement: DesktopSessionRequirement,
  ) -> RoutePreviewRequest {
    RoutePreviewRequest {
      agent_id: "vera_compliance_manager".to_string(),
      user_id: "mark".to_string(),
      channel: ChannelKind::Slack,
      task_summary: "Triage compliance inbox".to_string(),
      context_key: Some("ctx-1".to_string()),
      required_capabilities: capabilities,
      desktop_session_requirement: requirement,
    }
  }

  #[test]
  fn default_store_seeds_scout_vera_and_felix() {
    let store = default_store();
    let ids = store
      .agents
      .iter()
      .map(|agent| agent.agent_id.as_str())
      .collect::<Vec<_>>();
    assert!(ids.contains(&"scout_general"));
    assert!(ids.contains(&"vera_compliance_manager"));
    assert!(ids.contains(&"felix_operations_assistant"));
  }

  #[test]
  fn cloud_fallback_is_used_when_desktop_is_preferred_but_offline() {
    let store = default_store();
    let agent = store
      .agents
      .iter()
      .find(|candidate| candidate.agent_id == "vera_compliance_manager")
      .unwrap();
    let response = route_request(
      &route_request_for(
        vec![CapabilityKind::BrowserAutomation],
        DesktopSessionRequirement::Preferred,
      ),
      agent,
      None,
      None,
    );

    assert_eq!(response.route_target, RouteTarget::Cloud);
    assert_eq!(response.selected_runtime, Some(RuntimeKind::Cloud));
    assert!(response
      .reasons
      .iter()
      .any(|reason| reason.contains("cloud fallback")));
  }

  #[test]
  fn desktop_is_selected_when_local_files_are_required_and_presence_matches() {
    let store = default_store();
    let agent = store
      .agents
      .iter()
      .find(|candidate| candidate.agent_id == "vera_compliance_manager")
      .unwrap();
    let presence = desktop_presence("mark");
    let response = route_request(
      &route_request_for(
        vec![CapabilityKind::LocalFiles],
        DesktopSessionRequirement::Required,
      ),
      agent,
      Some(&presence),
      None,
    );

    assert_eq!(response.route_target, RouteTarget::Desktop);
    assert_eq!(response.selected_runtime, Some(RuntimeKind::Desktop));
    assert_eq!(response.fallback_runtime, Some(RuntimeKind::Cloud));
  }

  #[test]
  fn desktop_required_without_presence_blocks_execution() {
    let store = default_store();
    let agent = store
      .agents
      .iter()
      .find(|candidate| candidate.agent_id == "vera_compliance_manager")
      .unwrap();
    let response = route_request(
      &route_request_for(
        vec![CapabilityKind::LocalApps],
        DesktopSessionRequirement::Required,
      ),
      agent,
      None,
      None,
    );

    assert_eq!(response.route_target, RouteTarget::Blocked);
    assert!(!response.success);
  }

  #[test]
  fn store_round_trip_preserves_shared_context() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("registry.json");
    let mut store = default_store();
    store.shared_context.push(SharedContextRecord {
      agent_id: "scout_general".to_string(),
      context_key: "ctx-123".to_string(),
      tenant_id: "rethought".to_string(),
      user_id: "mark".to_string(),
      thread_id: Some("thread-1".to_string()),
      current_runtime: RuntimeKind::Cloud,
      handoff_summary: "Cloud picked up after desktop went offline.".to_string(),
      last_user_intent: "Continue the task".to_string(),
      notes: vec!["Need calendar context".to_string()],
      updated_at: now_iso(),
    });

    save_store_to_path(&path, &store).unwrap();
    let loaded = load_store_from_path(&path).unwrap();
    assert_eq!(loaded.shared_context.len(), 1);
    assert_eq!(loaded.shared_context[0].context_key, "ctx-123");
  }

  #[test]
  fn stale_presence_does_not_count_as_live_desktop() {
    let store = default_store();
    let agent = store
      .agents
      .iter()
      .find(|candidate| candidate.agent_id == "felix_operations_assistant")
      .unwrap();
    let mut presence = desktop_presence("mark");
    presence.last_heartbeat_at = (Utc::now() - Duration::minutes(10)).to_rfc3339();

    let response = route_request(
      &route_request_for(
        vec![CapabilityKind::BrowserAutomation],
        DesktopSessionRequirement::Preferred,
      ),
      agent,
      Some(&presence),
      None,
    );

    assert_eq!(response.route_target, RouteTarget::Cloud);
  }

  #[test]
  fn policy_pack_lookup_can_be_indexed_by_id() {
    let store = default_store();
    let policy_map = store
      .policy_packs
      .iter()
      .map(|policy| (policy.policy_pack_id.as_str(), policy))
      .collect::<BTreeMap<_, _>>();
    assert!(policy_map.contains_key("shared_slack_safe_v1"));
    assert!(policy_map.contains_key("compliance_controlled_v1"));
  }
}
