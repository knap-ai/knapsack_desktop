//! Role-Based Agent Team Orchestration
//!
//! Coordinates a team of AI agents (PM, Frontend Dev, Backend Dev, QA) that
//! collaborate on a single branch. Engineering agents run inside feedback loops
//! for continuous self-correction.

use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::Mutex;

use crate::clawd::dev_feedback_loop::{self, FeedbackLoopResult, SharedLoopState};
use crate::clawd::gateway_client;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamConfig {
  /// Project description / what to build
  pub project_description: String,
  /// Dev server URL for feedback loops (e.g., "http://localhost:3000")
  pub dev_url: Option<String>,
  /// GitHub repo (e.g., "knap-ai/knapsack_desktop")
  pub repo: Option<String>,
  /// Max feedback loop iterations per engineering agent
  #[serde(default = "default_max_iterations")]
  pub max_iterations: u32,
  /// Which roles to include
  #[serde(default)]
  pub roles: Vec<TeamRole>,
  /// Pre-gathered business context (from context aggregator)
  #[serde(default)]
  pub business_context: String,
}

fn default_max_iterations() -> u32 {
  5
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamRole {
  pub role_type: RoleType,
  /// Optional custom system prompt override
  pub custom_prompt: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RoleType {
  PM,
  Critic,
  FrontendDev,
  BackendDev,
  QA,
}

impl RoleType {
  fn agent_id(&self) -> &'static str {
    match self {
      RoleType::PM => "team-pm",
      RoleType::Critic => "team-critic",
      RoleType::FrontendDev => "team-frontend",
      RoleType::BackendDev => "team-backend",
      RoleType::QA => "team-qa",
    }
  }

  fn display_name(&self) -> &'static str {
    match self {
      RoleType::PM => "PM Agent",
      RoleType::Critic => "Critic",
      RoleType::FrontendDev => "Frontend Dev",
      RoleType::BackendDev => "Backend Dev",
      RoleType::QA => "QA Agent",
    }
  }

  fn default_prompt(&self) -> &'static str {
    match self {
      RoleType::PM => PM_SYSTEM_PROMPT,
      RoleType::Critic => CRITIC_SYSTEM_PROMPT,
      RoleType::FrontendDev => FRONTEND_DEV_PROMPT,
      RoleType::BackendDev => BACKEND_DEV_PROMPT,
      RoleType::QA => QA_AGENT_PROMPT,
    }
  }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamRunState {
  pub run_id: String,
  pub status: TeamStatus,
  pub agents: Vec<AgentStatus>,
  pub started_at: u64,
  pub completed_at: Option<u64>,
  pub spec: Option<String>,
  pub final_report: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TeamStatus {
  Planning,
  Reviewing,
  Building,
  Testing,
  Complete,
  Failed,
  Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentStatus {
  pub role: RoleType,
  pub display_name: String,
  pub status: AgentRunStatus,
  pub iteration: u32,
  pub max_iterations: u32,
  pub last_feedback: Option<String>,
  pub output_summary: Option<String>,
  pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AgentRunStatus {
  Pending,
  Running,
  Success,
  Failed,
  Skipped,
}

/// Shared state for all team runs
pub type SharedTeamState = Arc<Mutex<HashMap<String, TeamRunState>>>;

pub fn new_shared_team_state() -> SharedTeamState {
  Arc::new(Mutex::new(HashMap::new()))
}

// ---------------------------------------------------------------------------
// System Prompts
// ---------------------------------------------------------------------------

const PM_SYSTEM_PROMPT: &str = r#"You are a senior Technical PM. Your job is to take the business context and project description, then produce a structured implementation plan as a DAG (Directed Acyclic Graph) of tasks.

## Output Format

Structure your plan as numbered nodes with explicit dependencies:

### 1. Problem Statement
What are we solving and why?

### 2. Task DAG

For each task node, specify:
- **[Node N] Task Name** (deps: list of node numbers this depends on)
  - Description: what this task produces
  - Owner: Frontend / Backend / Both
  - Files: specific files to create or modify
  - Acceptance criteria: how we know it's done

Example structure:
```
[1] Define data models & API contracts (deps: none)
[2] Create database migrations (deps: 1)
[3] Implement API endpoints (deps: 1, 2)
[4] Build UI component shell (deps: 1)        ← parallel with 2,3
[5] Wire UI to API (deps: 3, 4)               ← synthesis point
[6] Add error handling & edge cases (deps: 5)
[7] Integration testing (deps: 5, 6)
```

Mark which nodes can run in **parallel** (independent branches) vs which are **sequential** (have dependencies).

### 3. Parallel Branches
Identify tasks that can run simultaneously. Group them:
- Branch A (Frontend): [4] → ...
- Branch B (Backend): [2] → [3] → ...
- Convergence point: [5] merges Branch A + B

### 4. Risk & Assumptions
- What assumptions is this plan making?
- What could go wrong at each dependency boundary?
- Where might branches produce contradictory outputs?

Be specific — include file names, function signatures, data structures. The engineers will implement directly from this plan.
Write the plan to a file called PLAN.md in the project root using the shell."#;

const CRITIC_SYSTEM_PROMPT: &str = r#"You are an adversarial plan reviewer. Your job is to stress-test a technical implementation plan and find weaknesses BEFORE engineering begins.

You receive a DAG-structured implementation plan. Your review MUST cover:

## 1. Dependency Analysis
- Are all dependencies correctly identified? Find any MISSING dependencies (task X actually needs task Y to complete first, but Y isn't listed as a dep).
- Are there circular dependencies?
- Are there tasks that claim to be parallel but actually have implicit ordering requirements?

## 2. Gap Analysis
- What tasks are MISSING from the DAG entirely? (e.g., auth setup, environment config, data seeding)
- Are there acceptance criteria that no task actually delivers?
- Are there API contracts referenced by frontend tasks that no backend task produces?

## 3. Contradiction Detection
- Do parallel branches make conflicting assumptions? (e.g., Branch A assumes REST API, Branch B assumes GraphQL)
- Do different tasks specify incompatible data structures for the same entity?
- Are there naming inconsistencies across the plan?

## 4. Feasibility Challenges
- Which tasks are underspecified and likely to cause engineer confusion?
- Where are the highest-risk integration points?
- What's the most likely failure mode for this plan?

## 5. Revised Recommendations
For each issue found, provide:
- **Issue**: What's wrong
- **Impact**: What breaks if this isn't fixed (Blocker / High / Medium)
- **Fix**: Specific change to the plan

Be ruthless but constructive. The goal is to catch problems now, not after hours of engineering work.
Do NOT rewrite the full plan — only output your critique and specific fixes."#;

const FRONTEND_DEV_PROMPT: &str = r#"You are a senior Frontend Engineer. You receive a technical spec and implement the UI components, pages, and frontend logic.

Your workflow:
1. Read the spec carefully
2. Create/modify files as specified
3. Ensure the dev server compiles without errors
4. Test that the UI renders correctly by checking the browser

Focus on:
- Clean, type-safe TypeScript/React code
- Proper component structure and state management
- Responsive design and accessibility
- Error handling and loading states

After making changes, the system will capture your dev server's state (console errors, screenshots). Fix any issues it finds."#;

const BACKEND_DEV_PROMPT: &str = r#"You are a senior Backend Engineer. You receive a technical spec and implement the API endpoints, database models, and business logic.

Your workflow:
1. Read the spec carefully
2. Create/modify files as specified
3. Ensure the code compiles without errors
4. Test endpoints work correctly

Focus on:
- Clean, well-structured code following existing patterns
- Proper error handling and validation
- Database migrations if needed
- Security best practices

After making changes, the system will capture terminal output and error logs. Fix any compilation errors or runtime issues it finds."#;

const QA_AGENT_PROMPT: &str = r#"You are a senior QA Engineer. You review the work done by the Frontend and Backend engineers and run comprehensive validation.

Your workflow:
1. Review all code changes made by the engineers
2. Open the dev server in the browser and test all user flows
3. Check for:
   - Console errors
   - Broken UI elements
   - Missing error handling
   - Accessibility issues (ARIA labels, keyboard navigation)
   - Edge cases (empty states, long text, error states)
4. Report any issues found with specific reproduction steps
5. Verify acceptance criteria from the spec are met

Provide a final report with:
- PASS/FAIL status for each acceptance criterion
- List of bugs found (with severity)
- Screenshots of any issues
- Recommendations for improvements"#;

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

#[post("/api/knapsack/dev/team/launch")]
pub async fn launch_team(
  body: web::Json<TeamConfig>,
  team_state: web::Data<SharedTeamState>,
  loop_state: web::Data<SharedLoopState>,
) -> impl Responder {
  let config = body.into_inner();
  let run_id = format!("team-{}", now_secs());

  // Default roles if none specified
  let roles = if config.roles.is_empty() {
    vec![
      TeamRole {
        role_type: RoleType::PM,
        custom_prompt: None,
      },
      TeamRole {
        role_type: RoleType::Critic,
        custom_prompt: None,
      },
      TeamRole {
        role_type: RoleType::FrontendDev,
        custom_prompt: None,
      },
      TeamRole {
        role_type: RoleType::BackendDev,
        custom_prompt: None,
      },
      TeamRole {
        role_type: RoleType::QA,
        custom_prompt: None,
      },
    ]
  } else {
    config.roles.clone()
  };

  // Initialize team state
  let initial_agents: Vec<AgentStatus> = roles
    .iter()
    .map(|r| AgentStatus {
      role: r.role_type.clone(),
      display_name: r.role_type.display_name().to_string(),
      status: AgentRunStatus::Pending,
      iteration: 0,
      max_iterations: config.max_iterations,
      last_feedback: None,
      output_summary: None,
      error: None,
    })
    .collect();

  let team_run = TeamRunState {
    run_id: run_id.clone(),
    status: TeamStatus::Planning,
    agents: initial_agents,
    started_at: now_secs(),
    completed_at: None,
    spec: None,
    final_report: None,
  };

  // Store initial state
  {
    let mut guard = team_state.lock().await;
    guard.insert(run_id.clone(), team_run);
  }

  // Spawn the orchestration task
  let team_state_clone = team_state.get_ref().clone();
  let loop_state_clone = loop_state.get_ref().clone();
  let run_id_clone = run_id.clone();

  tokio::spawn(async move {
    orchestrate_team(
      config,
      roles,
      &run_id_clone,
      team_state_clone,
      loop_state_clone,
    )
    .await;
  });

  HttpResponse::Ok().json(serde_json::json!({
      "ok": true,
      "run_id": run_id,
      "message": "Team launched successfully",
  }))
}

#[get("/api/knapsack/dev/team/status/{run_id}")]
pub async fn team_status(
  path: web::Path<String>,
  team_state: web::Data<SharedTeamState>,
) -> impl Responder {
  let run_id = path.into_inner();
  let guard = team_state.lock().await;

  match guard.get(&run_id) {
    Some(state) => HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "state": state,
    })),
    None => HttpResponse::NotFound().json(serde_json::json!({
        "ok": false,
        "message": "Team run not found",
    })),
  }
}

#[post("/api/knapsack/dev/team/cancel/{run_id}")]
pub async fn cancel_team(
  path: web::Path<String>,
  team_state: web::Data<SharedTeamState>,
) -> impl Responder {
  let run_id = path.into_inner();
  let mut guard = team_state.lock().await;

  match guard.get_mut(&run_id) {
    Some(state) => {
      state.status = TeamStatus::Cancelled;
      state.completed_at = Some(now_secs());
      HttpResponse::Ok().json(serde_json::json!({
          "ok": true,
          "message": "Team run cancelled",
      }))
    }
    None => HttpResponse::NotFound().json(serde_json::json!({
        "ok": false,
        "message": "Team run not found",
    })),
  }
}

#[get("/api/knapsack/dev/team/output/{run_id}/{agent_id}")]
pub async fn agent_output(
  path: web::Path<(String, String)>,
  team_state: web::Data<SharedTeamState>,
) -> impl Responder {
  let (run_id, agent_id) = path.into_inner();
  let guard = team_state.lock().await;

  match guard.get(&run_id) {
    Some(state) => {
      let agent = state.agents.iter().find(|a| a.role.agent_id() == agent_id);
      match agent {
        Some(a) => HttpResponse::Ok().json(serde_json::json!({
            "ok": true,
            "agent": a,
            "spec": state.spec,
        })),
        None => HttpResponse::NotFound().json(serde_json::json!({
            "ok": false,
            "message": "Agent not found in this team run",
        })),
      }
    }
    None => HttpResponse::NotFound().json(serde_json::json!({
        "ok": false,
        "message": "Team run not found",
    })),
  }
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

async fn orchestrate_team(
  config: TeamConfig,
  roles: Vec<TeamRole>,
  run_id: &str,
  team_state: SharedTeamState,
  loop_state: SharedLoopState,
) {
  let channel = format!("team-{}", run_id);
  let has_pm = roles.iter().any(|r| r.role_type == RoleType::PM);
  let has_critic = roles.iter().any(|r| r.role_type == RoleType::Critic);
  let has_frontend = roles.iter().any(|r| r.role_type == RoleType::FrontendDev);
  let has_backend = roles.iter().any(|r| r.role_type == RoleType::BackendDev);
  let has_qa = roles.iter().any(|r| r.role_type == RoleType::QA);

  // Check for cancellation — helper is defined as a standalone async fn
  // to avoid lifetime issues with async closures borrowing references.

  // -----------------------------------------------------------------------
  // Phase 1: PM writes the spec
  // -----------------------------------------------------------------------
  let spec = if has_pm {
    let pm_role = roles.iter().find(|r| r.role_type == RoleType::PM).unwrap();
    let pm_prompt = pm_role
      .custom_prompt
      .as_deref()
      .unwrap_or(pm_role.role_type.default_prompt());

    let full_prompt = format!(
      "{}\n\n--- PROJECT ---\n{}\n\n--- BUSINESS CONTEXT ---\n{}",
      pm_prompt, config.project_description, config.business_context
    );

    update_agent_status(&team_state, run_id, RoleType::PM, |a| {
      a.status = AgentRunStatus::Running;
    })
    .await;

    eprintln!("[agent_team] PM agent starting for run: {}", run_id);

    match gateway_client::agent_run(
      &full_prompt,
      Some(RoleType::PM.agent_id()),
      Some(&channel),
      None,
    )
    .await
    {
      Ok(result) => {
        let reply = extract_reply(&result);
        let summary = truncate(&reply, 500);

        update_agent_status(&team_state, run_id, RoleType::PM, |a| {
          a.status = AgentRunStatus::Success;
          a.output_summary = Some(summary);
        })
        .await;

        // Store initial plan (will be revised after critic review)
        {
          let mut guard = team_state.lock().await;
          if let Some(state) = guard.get_mut(run_id) {
            state.spec = Some(reply.clone());
            state.status = if has_critic {
              TeamStatus::Reviewing
            } else {
              TeamStatus::Building
            };
          }
        }

        reply
      }
      Err(e) => {
        eprintln!("[agent_team] PM agent failed: {}", e);
        update_agent_status(&team_state, run_id, RoleType::PM, |a| {
          a.status = AgentRunStatus::Failed;
          a.error = Some(e.clone());
        })
        .await;

        // Fail the whole team run
        {
          let mut guard = team_state.lock().await;
          if let Some(state) = guard.get_mut(run_id) {
            state.status = TeamStatus::Failed;
            state.completed_at = Some(now_secs());
          }
        }
        return;
      }
    }
  } else {
    // No PM — use project description as the spec
    config.project_description.clone()
  };

  if is_cancelled(&team_state, run_id).await {
    return;
  }

  // -----------------------------------------------------------------------
  // Phase 1b: Adversarial review of the plan (Critic → PM revision)
  // -----------------------------------------------------------------------
  let spec = if has_critic && has_pm {
    let critic_role = roles.iter().find(|r| r.role_type == RoleType::Critic);
    let critic_prompt = critic_role
      .and_then(|r| r.custom_prompt.as_deref())
      .unwrap_or(RoleType::Critic.default_prompt());

    let critic_full_prompt = format!("{}\n\n--- PLAN TO REVIEW ---\n{}", critic_prompt, spec);

    update_agent_status(&team_state, run_id, RoleType::Critic, |a| {
      a.status = AgentRunStatus::Running;
    })
    .await;

    eprintln!("[agent_team] Critic agent starting for run: {}", run_id);

    match gateway_client::agent_run(
      &critic_full_prompt,
      Some(RoleType::Critic.agent_id()),
      Some(&channel),
      None,
    )
    .await
    {
      Ok(result) => {
        let critique = extract_reply(&result);
        let critique_summary = truncate(&critique, 500);

        update_agent_status(&team_state, run_id, RoleType::Critic, |a| {
          a.status = AgentRunStatus::Success;
          a.output_summary = Some(critique_summary);
        })
        .await;

        eprintln!(
          "[agent_team] Critic done, PM revising plan for run: {}",
          run_id
        );

        // PM revises the plan based on the critique
        update_agent_status(&team_state, run_id, RoleType::PM, |a| {
          a.status = AgentRunStatus::Running;
          a.iteration = 1;
          a.last_feedback = Some(truncate(&critique, 300));
        })
        .await;

        let revision_prompt = format!(
          "You previously produced this implementation plan:\n\n{}\n\n\
                     An adversarial reviewer found these issues:\n\n{}\n\n\
                     Revise your plan to address every Blocker and High-impact issue. \
                     Keep the DAG node format. Update dependencies, add missing tasks, \
                     and resolve any contradictions identified. \
                     Write the revised plan to PLAN.md.",
          spec, critique
        );

        match gateway_client::agent_run(
          &revision_prompt,
          Some(RoleType::PM.agent_id()),
          Some(&channel),
          None,
        )
        .await
        {
          Ok(revised_result) => {
            let revised_spec = extract_reply(&revised_result);
            let revised_summary = truncate(&revised_spec, 500);

            update_agent_status(&team_state, run_id, RoleType::PM, |a| {
              a.status = AgentRunStatus::Success;
              a.output_summary = Some(revised_summary);
            })
            .await;

            // Store revised spec
            {
              let mut guard = team_state.lock().await;
              if let Some(state) = guard.get_mut(run_id) {
                state.spec = Some(revised_spec.clone());
                state.status = TeamStatus::Building;
              }
            }

            revised_spec
          }
          Err(e) => {
            eprintln!(
              "[agent_team] PM revision failed: {}, using original plan",
              e
            );
            update_agent_status(&team_state, run_id, RoleType::PM, |a| {
              a.status = AgentRunStatus::Success;
              a.last_feedback = Some(format!("Revision failed ({}), using original plan", e));
            })
            .await;

            // Fall back to original spec
            {
              let mut guard = team_state.lock().await;
              if let Some(state) = guard.get_mut(run_id) {
                state.status = TeamStatus::Building;
              }
            }
            spec
          }
        }
      }
      Err(e) => {
        eprintln!("[agent_team] Critic agent failed: {}, skipping review", e);
        update_agent_status(&team_state, run_id, RoleType::Critic, |a| {
          a.status = AgentRunStatus::Failed;
          a.error = Some(e);
        })
        .await;

        // Skip review, proceed with original plan
        {
          let mut guard = team_state.lock().await;
          if let Some(state) = guard.get_mut(run_id) {
            state.status = TeamStatus::Building;
          }
        }
        spec
      }
    }
  } else {
    // No critic — skip review, mark as Building
    if has_critic {
      // Critic role exists but no PM to revise — skip critic
      update_agent_status(&team_state, run_id, RoleType::Critic, |a| {
        a.status = AgentRunStatus::Skipped;
      })
      .await;
    }
    {
      let mut guard = team_state.lock().await;
      if let Some(state) = guard.get_mut(run_id) {
        state.status = TeamStatus::Building;
      }
    }
    spec
  };

  if is_cancelled(&team_state, run_id).await {
    return;
  }

  // -----------------------------------------------------------------------
  // Phase 2: Frontend + Backend engineers work in parallel with feedback loops
  // -----------------------------------------------------------------------
  let dev_url = config
    .dev_url
    .clone()
    .unwrap_or_else(|| "http://localhost:3000".to_string());

  let frontend_handle = if has_frontend {
    let frontend_role = roles
      .iter()
      .find(|r| r.role_type == RoleType::FrontendDev)
      .unwrap();
    let frontend_prompt = frontend_role
      .custom_prompt
      .as_deref()
      .unwrap_or(frontend_role.role_type.default_prompt());

    let full_prompt = format!("{}\n\n--- TECHNICAL SPEC ---\n{}", frontend_prompt, spec);

    let team_state_c = team_state.clone();
    let loop_state_c = loop_state.clone();
    let dev_url_c = dev_url.clone();
    let channel_c = channel.clone();
    let run_id_c = run_id.to_string();
    let max_iter = config.max_iterations;

    update_agent_status(&team_state, run_id, RoleType::FrontendDev, |a| {
      a.status = AgentRunStatus::Running;
    })
    .await;

    Some(tokio::spawn(async move {
      let loop_run_id = format!("{}-frontend", run_id_c);

      let result = dev_feedback_loop::run_with_feedback(
        &full_prompt,
        &dev_url_c,
        RoleType::FrontendDev.agent_id(),
        &channel_c,
        max_iter,
        Some(loop_state_c),
        &loop_run_id,
      )
      .await;

      // Update status
      let status = if result.success {
        AgentRunStatus::Success
      } else {
        AgentRunStatus::Failed
      };
      let summary = truncate(&result.final_agent_reply, 500);

      update_agent_status(&team_state_c, &run_id_c, RoleType::FrontendDev, |a| {
        a.status = status;
        a.iteration = result.iterations_used;
        a.output_summary = Some(summary);
        if !result.remaining_errors.is_empty() {
          a.last_feedback = Some(
            result
              .remaining_errors
              .iter()
              .take(3)
              .cloned()
              .collect::<Vec<_>>()
              .join("; "),
          );
        }
      })
      .await;

      result
    }))
  } else {
    None
  };

  let backend_handle = if has_backend {
    let backend_role = roles
      .iter()
      .find(|r| r.role_type == RoleType::BackendDev)
      .unwrap();
    let backend_prompt = backend_role
      .custom_prompt
      .as_deref()
      .unwrap_or(backend_role.role_type.default_prompt());

    let full_prompt = format!("{}\n\n--- TECHNICAL SPEC ---\n{}", backend_prompt, spec);

    let team_state_c = team_state.clone();
    let loop_state_c = loop_state.clone();
    let dev_url_c = dev_url.clone();
    let channel_c = channel.clone();
    let run_id_c = run_id.to_string();
    let max_iter = config.max_iterations;

    update_agent_status(&team_state, run_id, RoleType::BackendDev, |a| {
      a.status = AgentRunStatus::Running;
    })
    .await;

    Some(tokio::spawn(async move {
      let loop_run_id = format!("{}-backend", run_id_c);

      let result = dev_feedback_loop::run_with_feedback(
        &full_prompt,
        &dev_url_c,
        RoleType::BackendDev.agent_id(),
        &channel_c,
        max_iter,
        Some(loop_state_c),
        &loop_run_id,
      )
      .await;

      let status = if result.success {
        AgentRunStatus::Success
      } else {
        AgentRunStatus::Failed
      };
      let summary = truncate(&result.final_agent_reply, 500);

      update_agent_status(&team_state_c, &run_id_c, RoleType::BackendDev, |a| {
        a.status = status;
        a.iteration = result.iterations_used;
        a.output_summary = Some(summary);
        if !result.remaining_errors.is_empty() {
          a.last_feedback = Some(
            result
              .remaining_errors
              .iter()
              .take(3)
              .cloned()
              .collect::<Vec<_>>()
              .join("; "),
          );
        }
      })
      .await;

      result
    }))
  } else {
    None
  };

  // Wait for both engineers to finish
  let frontend_result = match frontend_handle {
    Some(handle) => handle.await.ok(),
    None => None,
  };

  let backend_result = match backend_handle {
    Some(handle) => handle.await.ok(),
    None => None,
  };

  if is_cancelled(&team_state, run_id).await {
    return;
  }

  // -----------------------------------------------------------------------
  // Phase 3: QA validates
  // -----------------------------------------------------------------------
  if has_qa {
    let qa_role = roles.iter().find(|r| r.role_type == RoleType::QA).unwrap();
    let qa_prompt = qa_role
      .custom_prompt
      .as_deref()
      .unwrap_or(qa_role.role_type.default_prompt());

    // Build QA context from all previous results
    let mut qa_context = format!(
      "{}\n\n--- SPEC ---\n{}\n\n--- ENGINEER RESULTS ---\n",
      qa_prompt, spec
    );

    if let Some(ref fr) = frontend_result {
      qa_context.push_str(&format!(
        "FRONTEND: {} iterations, success={}, remaining_errors={}\nReply: {}\n\n",
        fr.iterations_used,
        fr.success,
        fr.remaining_errors.len(),
        truncate(&fr.final_agent_reply, 1000)
      ));
    }

    if let Some(ref br) = backend_result {
      qa_context.push_str(&format!(
        "BACKEND: {} iterations, success={}, remaining_errors={}\nReply: {}\n\n",
        br.iterations_used,
        br.success,
        br.remaining_errors.len(),
        truncate(&br.final_agent_reply, 1000)
      ));
    }

    qa_context.push_str(&format!(
      "\nDev server URL: {}\nPlease open it and run your QA checks now.",
      dev_url
    ));

    {
      let mut guard = team_state.lock().await;
      if let Some(state) = guard.get_mut(run_id) {
        state.status = TeamStatus::Testing;
      }
    }

    update_agent_status(&team_state, run_id, RoleType::QA, |a| {
      a.status = AgentRunStatus::Running;
    })
    .await;

    eprintln!("[agent_team] QA agent starting for run: {}", run_id);

    match gateway_client::agent_run(
      &qa_context,
      Some(RoleType::QA.agent_id()),
      Some(&channel),
      None,
    )
    .await
    {
      Ok(result) => {
        let reply = extract_reply(&result);
        let summary = truncate(&reply, 500);

        update_agent_status(&team_state, run_id, RoleType::QA, |a| {
          a.status = AgentRunStatus::Success;
          a.output_summary = Some(summary);
        })
        .await;

        // Store final report
        {
          let mut guard = team_state.lock().await;
          if let Some(state) = guard.get_mut(run_id) {
            state.final_report = Some(reply);
          }
        }
      }
      Err(e) => {
        eprintln!("[agent_team] QA agent failed: {}", e);
        update_agent_status(&team_state, run_id, RoleType::QA, |a| {
          a.status = AgentRunStatus::Failed;
          a.error = Some(e);
        })
        .await;
      }
    }
  }

  // Mark team as complete
  {
    let mut guard = team_state.lock().await;
    if let Some(state) = guard.get_mut(run_id) {
      if state.status != TeamStatus::Cancelled {
        state.status = TeamStatus::Complete;
      }
      state.completed_at = Some(now_secs());
    }
  }

  eprintln!("[agent_team] Team run {} completed", run_id);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async fn is_cancelled(state: &SharedTeamState, run_id: &str) -> bool {
  let guard = state.lock().await;
  guard
    .get(run_id)
    .map(|s| s.status == TeamStatus::Cancelled)
    .unwrap_or(false)
}

async fn update_agent_status<F>(state: &SharedTeamState, run_id: &str, role: RoleType, f: F)
where
  F: FnOnce(&mut AgentStatus),
{
  let mut guard = state.lock().await;
  if let Some(team) = guard.get_mut(run_id) {
    if let Some(agent) = team.agents.iter_mut().find(|a| a.role == role) {
      f(agent);
    }
  }
}

fn extract_reply(result: &JsonValue) -> String {
  result
    .pointer("/result/payloads")
    .and_then(|p| p.as_array())
    .map(|payloads| {
      payloads
        .iter()
        .filter_map(|p| p.get("text").and_then(|t| t.as_str()))
        .collect::<Vec<_>>()
        .join("\n\n")
    })
    .unwrap_or_else(|| {
      result
        .get("summary")
        .and_then(|s| s.as_str())
        .unwrap_or("(empty reply)")
        .to_string()
    })
}

fn now_secs() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap_or_default()
    .as_secs()
}

fn truncate(s: &str, max_len: usize) -> String {
  if s.len() <= max_len {
    s.to_string()
  } else {
    format!("{}…", &s[..max_len])
  }
}
