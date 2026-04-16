//! Projects auto-collection detector.
//!
//! Builds a corpus from the user's recent email subjects + meeting titles,
//! asks the LLM to identify 3-10 active projects/initiatives, then upserts
//! one auto-curated `Workspace` per project and attaches matching emails
//! and calendar events as documents (matched by simple keyword hits against
//! the LLM-supplied keyword list — cheap, deterministic, no second LLM pass).

use std::collections::HashSet;

use serde::Deserialize;

use crate::db::db::get_db_conn;
use crate::db::models::email::Email;
use crate::db::models::workspace::{Workspace, WorkspaceDocument};
use crate::error::Error;
use crate::library_curator::settings::CuratorSettings;
use crate::llm::types::{Message as LlmMessage, MessageSender};
use crate::llm::use_cases::complete::multi_provider_completion;

const MAX_EMAILS_FOR_CORPUS: usize = 500;
const MAX_TITLES_FOR_CORPUS: usize = 500;
const MAX_PROJECTS: usize = 10;
const MAX_DOCS_PER_PROJECT: usize = 30;
const EMAIL_SCAN_LIMIT: usize = 2_000;
const EVENT_SCAN_LIMIT: i64 = 500;

#[derive(Debug, Deserialize)]
struct DetectedProject {
    #[serde(default)]
    slug: String,
    #[serde(default)]
    name: String,
    #[serde(default)]
    description: String,
    #[serde(default)]
    keywords: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct DetectedProjectsResponse {
    #[serde(default)]
    projects: Vec<DetectedProject>,
}

/// Run the project detector end-to-end. Safe to call repeatedly — upserts
/// are idempotent and document attachments dedupe via the unique source index.
pub async fn detect_and_upsert(_cfg: &CuratorSettings) -> Result<(), Error> {
    let email_subjects = collect_email_subjects();
    let meeting_titles = collect_meeting_titles();

    if email_subjects.is_empty() && meeting_titles.is_empty() {
        log::info!("[library_curator/projects] no signal corpus; skipping");
        return Ok(());
    }

    let projects = match call_llm_detect(&email_subjects, &meeting_titles).await {
        Ok(p) => p,
        Err(e) => {
            log::warn!("[library_curator/projects] LLM detection failed: {}", e);
            return Ok(());
        }
    };

    log::info!(
        "[library_curator/projects] LLM returned {} projects",
        projects.len()
    );

    let mut kept_slugs: HashSet<String> = HashSet::new();
    for proj in projects.into_iter().take(MAX_PROJECTS) {
        if proj.slug.trim().is_empty()
            || proj.name.trim().is_empty()
            || proj.keywords.is_empty()
        {
            continue;
        }
        let slug = proj.slug.trim().to_string();
        if let Err(e) = upsert_project_collection(&proj) {
            log::warn!(
                "[library_curator/projects] upsert failed for {}: {:?}",
                slug,
                e
            );
        } else {
            kept_slugs.insert(slug);
        }
    }

    // Prune stale auto-curated projects — slugs the LLM no longer considers
    // active. Prevents accumulation of near-duplicates across runs (e.g.
    // "sage-financial-partnership" vs "sage-financial-wealthbox"). Only fires
    // when we successfully upserted at least one project, so a bad LLM run
    // never wipes the library.
    if !kept_slugs.is_empty() {
        match Workspace::delete_stale_auto_projects(&kept_slugs) {
            Ok(n) if n > 0 => log::info!(
                "[library_curator/projects] pruned {} stale auto-curated project(s)",
                n
            ),
            Ok(_) => {}
            Err(e) => log::warn!(
                "[library_curator/projects] prune failed: {:?}",
                e
            ),
        }
    }

    Ok(())
}

fn collect_email_subjects() -> Vec<String> {
    let emails = Email::filter_emails(MAX_EMAILS_FOR_CORPUS, None, None, None);
    emails
        .into_iter()
        .filter_map(|e| {
            let s = e.subject.trim().to_string();
            if s.is_empty() {
                None
            } else {
                Some(s)
            }
        })
        .collect()
}

fn collect_meeting_titles() -> Vec<String> {
    let connection = get_db_conn();
    let mut titles = Vec::new();
    let Ok(mut stmt) = connection.prepare(
        "SELECT title FROM calendar_events WHERE title IS NOT NULL ORDER BY start DESC LIMIT ?1",
    ) else {
        return titles;
    };
    let rows = stmt.query_map(rusqlite::params![MAX_TITLES_FOR_CORPUS as i64], |row| {
        row.get::<_, Option<String>>(0)
    });
    if let Ok(rows) = rows {
        for row in rows.flatten().flatten() {
            let t = row.trim().to_string();
            if !t.is_empty() {
                titles.push(t);
            }
        }
    }
    titles
}

async fn call_llm_detect(
    email_subjects: &[String],
    meeting_titles: &[String],
) -> Result<Vec<DetectedProject>, String> {
    let subjects: Vec<&String> = email_subjects.iter().take(200).collect();
    let titles: Vec<&String> = meeting_titles.iter().take(200).collect();

    let user = format!(
        "You are reviewing a user's recent email subjects and meeting titles to identify their active projects and initiatives.\n\n\
EMAIL SUBJECTS (most recent first):\n{}\n\n\
MEETING TITLES (most recent first):\n{}\n\n\
Identify between 3 and {} distinct active projects, initiatives, products, or workstreams. \
Skip newsletters, marketing, calendar holds, generic 1:1s, and personal/admin items. \
Return ONLY a JSON object with this exact shape (no markdown fences, no commentary):\n\
{{\"projects\":[{{\"slug\":\"kebab-case-id\",\"name\":\"Human Readable Name\",\"description\":\"one short sentence\",\"keywords\":[\"5-15 distinctive phrases or names\"]}}]}}",
        subjects
            .iter()
            .map(|s| format!("- {}", s))
            .collect::<Vec<_>>()
            .join("\n"),
        titles
            .iter()
            .map(|s| format!("- {}", s))
            .collect::<Vec<_>>()
            .join("\n"),
        MAX_PROJECTS,
    );

    let messages = vec![
        LlmMessage {
            sender: MessageSender::System,
            content: "You are a careful organizer that identifies projects from work signals. You always reply with valid JSON only.".to_string(),
        },
        LlmMessage {
            sender: MessageSender::User,
            content: user,
        },
    ];

    let raw = multi_provider_completion(messages)
        .await
        .map_err(|e| format!("LLM error: {:?}", e))?;
    let cleaned = strip_json_fence(&raw);
    let parsed: DetectedProjectsResponse = serde_json::from_str(cleaned).map_err(|e| {
        format!(
            "JSON parse error: {} :: raw={}",
            e,
            cleaned.chars().take(400).collect::<String>()
        )
    })?;
    Ok(parsed.projects)
}

fn strip_json_fence(raw: &str) -> &str {
    let trimmed = raw.trim();
    let no_md = trimmed
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();
    if let (Some(start), Some(end)) = (no_md.find('{'), no_md.rfind('}')) {
        if end >= start {
            return &no_md[start..=end];
        }
    }
    no_md
}

fn upsert_project_collection(proj: &DetectedProject) -> Result<(), Error> {
    let workspace = Workspace::upsert_auto_collection(
        "project",
        proj.slug.trim(),
        proj.name.trim(),
        if proj.description.trim().is_empty() {
            None
        } else {
            Some(proj.description.trim())
        },
        Some("📁"),
    )?;

    // If the user promoted this collection to manual, leave it alone.
    if workspace.auto_curated.unwrap_or(0) == 0 {
        return Ok(());
    }

    let normalized_keywords: Vec<String> = proj
        .keywords
        .iter()
        .map(|k| k.trim().to_lowercase())
        .filter(|k| k.len() >= 3)
        .collect();
    if normalized_keywords.is_empty() {
        return Ok(());
    }

    // Attach matching emails by subject/body keyword hit.
    let mut email_attached = 0_usize;
    let emails = Email::filter_emails(EMAIL_SCAN_LIMIT, None, None, None);
    for email in emails {
        if email_attached >= MAX_DOCS_PER_PROJECT {
            break;
        }
        if !matches_keywords(&email.subject, &email.body, &normalized_keywords) {
            continue;
        }
        let Some(id) = email.id else { continue };
        let title = if email.subject.trim().is_empty() {
            "(no subject)".to_string()
        } else {
            email.subject.clone()
        };
        if WorkspaceDocument::create_with_source(
            workspace.uuid.clone(),
            title,
            None,
            Some("email".to_string()),
            Some(email.body.clone()),
            Some("email".to_string()),
            Some(id.to_string()),
        )
        .is_ok()
        {
            email_attached += 1;
        }
    }

    // Attach matching calendar events by title/description keyword hit.
    let mut event_attached = 0_usize;
    let connection = get_db_conn();
    if let Ok(mut stmt) = connection.prepare(
        "SELECT id, title, description FROM calendar_events WHERE title IS NOT NULL ORDER BY start DESC LIMIT ?1",
    ) {
        if let Ok(rows) = stmt.query_map(rusqlite::params![EVENT_SCAN_LIMIT], |row| {
            Ok((
                row.get::<_, u64>(0)?,
                row.get::<_, Option<String>>(1)?,
                row.get::<_, Option<String>>(2)?,
            ))
        }) {
            for r in rows.flatten() {
                if event_attached >= MAX_DOCS_PER_PROJECT {
                    break;
                }
                let (event_id, title_opt, desc_opt) = r;
                let title = title_opt.clone().unwrap_or_default();
                let desc = desc_opt.clone().unwrap_or_default();
                if !matches_keywords(&title, &desc, &normalized_keywords) {
                    continue;
                }
                let display = if title.trim().is_empty() {
                    "(untitled meeting)".to_string()
                } else {
                    title
                };
                if WorkspaceDocument::create_with_source(
                    workspace.uuid.clone(),
                    display,
                    None,
                    Some("calendar".to_string()),
                    desc_opt,
                    Some("calendar".to_string()),
                    Some(event_id.to_string()),
                )
                .is_ok()
                {
                    event_attached += 1;
                }
            }
        }
    }

    log::info!(
        "[library_curator/projects] {} ({}): {} emails, {} events attached",
        proj.name,
        proj.slug,
        email_attached,
        event_attached
    );

    Ok(())
}

fn matches_keywords(a: &str, b: &str, keywords: &[String]) -> bool {
    let haystack = format!("{} {}", a, b).to_lowercase();
    keywords
        .iter()
        .any(|k| !k.is_empty() && haystack.contains(k))
}
