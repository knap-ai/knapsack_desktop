//! Business Context Aggregator
//!
//! Aggregates relevant context from multiple sources (meetings, emails,
//! workspace documents, browser pages) to help developers plan implementations.

use actix_web::{post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

use crate::clawd::gateway_client;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct AggregateRequest {
    /// What the developer is building (free-form description)
    pub project_description: String,
    /// Which sources to pull context from
    #[serde(default)]
    pub sources: ContextSources,
    /// How far back to look (in hours)
    #[serde(default = "default_time_range")]
    pub time_range_hours: u32,
    /// Optional keywords to filter context
    #[serde(default)]
    pub keywords: Vec<String>,
}

fn default_time_range() -> u32 {
    168 // 7 days
}

#[derive(Debug, Deserialize)]
pub struct ContextSources {
    #[serde(default = "default_true")]
    pub meetings: bool,
    #[serde(default = "default_true")]
    pub emails: bool,
    #[serde(default = "default_true")]
    pub workspace_docs: bool,
    #[serde(default)]
    pub browser_urls: Vec<String>,
}

fn default_true() -> bool {
    true
}

impl Default for ContextSources {
    fn default() -> Self {
        Self {
            meetings: true,
            emails: true,
            workspace_docs: true,
            browser_urls: Vec::new(),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct AggregatedContext {
    pub project_description: String,
    pub meetings: Vec<MeetingContext>,
    pub emails: Vec<EmailContext>,
    pub workspace_documents: Vec<WorkspaceDocContext>,
    pub browser_pages: Vec<BrowserPageContext>,
    /// Pre-built mega-prompt combining all context for the AI
    pub combined_prompt: String,
}

#[derive(Debug, Serialize)]
pub struct MeetingContext {
    pub title: String,
    pub date: String,
    pub participants: Vec<String>,
    pub summary: String,
}

#[derive(Debug, Serialize)]
pub struct EmailContext {
    pub subject: String,
    pub from: String,
    pub date: String,
    pub snippet: String,
}

#[derive(Debug, Serialize)]
pub struct WorkspaceDocContext {
    pub title: String,
    pub source: String,
    pub snippet: String,
    pub relevance_score: f32,
}

#[derive(Debug, Serialize)]
pub struct BrowserPageContext {
    pub url: String,
    pub title: String,
    pub content_snippet: String,
}

// ---------------------------------------------------------------------------
// Endpoint
// ---------------------------------------------------------------------------

#[post("/api/knapsack/context/aggregate")]
pub async fn aggregate_context(
    body: web::Json<AggregateRequest>,
) -> impl Responder {
    let request = body.into_inner();
    let description = request.project_description.clone();
    let keywords = if request.keywords.is_empty() {
        extract_keywords(&description)
    } else {
        request.keywords.clone()
    };

    eprintln!(
        "[context_aggregator] Aggregating context for: '{}' (keywords: {:?})",
        truncate(&description, 80),
        keywords
    );

    // Fetch from all sources in parallel
    let (meetings, emails, workspace_docs, browser_pages) = tokio::join!(
        fetch_meeting_context(&keywords, request.time_range_hours),
        fetch_email_context(&keywords, request.time_range_hours),
        fetch_workspace_docs(&description),
        fetch_browser_pages(&request.sources.browser_urls),
    );

    // Build the combined prompt
    let combined_prompt = build_combined_prompt(
        &description,
        &meetings,
        &emails,
        &workspace_docs,
        &browser_pages,
    );

    let result = AggregatedContext {
        project_description: description,
        meetings,
        emails,
        workspace_documents: workspace_docs,
        browser_pages,
        combined_prompt,
    };

    HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "context": result,
    }))
}

// ---------------------------------------------------------------------------
// Source fetchers
// ---------------------------------------------------------------------------

async fn fetch_meeting_context(keywords: &[String], time_range_hours: u32) -> Vec<MeetingContext> {
    let mut meetings = Vec::new();

    let days = (time_range_hours / 24).max(1);
    let search_term = keywords.first().map(|s| s.as_str());

    let meeting_list = crate::clawd::meeting_context::list_meetings(days, search_term).await;
    if let Some(arr) = meeting_list.as_array() {
        for meeting in arr.iter().take(20) {
            let title = meeting
                .get("summary")
                .or_else(|| meeting.get("title"))
                .and_then(|v| v.as_str())
                .unwrap_or("Untitled")
                .to_string();
            let date = meeting
                .get("start")
                .or_else(|| meeting.get("date"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let participants = meeting
                .get("attendees")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|a| {
                            a.get("email")
                                .or_else(|| a.get("displayName"))
                                .and_then(|v| v.as_str())
                                .map(|s| s.to_string())
                        })
                        .collect()
                })
                .unwrap_or_default();
            let summary = meeting
                .get("description")
                .or_else(|| meeting.get("notes"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();

            meetings.push(MeetingContext {
                title,
                date,
                participants,
                summary,
            });
        }
    }

    meetings
}

async fn fetch_email_context(keywords: &[String], _time_range_hours: u32) -> Vec<EmailContext> {
    let mut emails = Vec::new();

    if keywords.is_empty() {
        return emails;
    }

    let query = keywords.join(" OR ");

    // Use the Gmail search endpoint
    let url = format!(
        "http://127.0.0.1:8897/api/knapsack/gmail_search?q={}&max_results=10",
        urlencoding::encode(&query)
    );

    match reqwest::get(&url).await {
        Ok(resp) => {
            if let Ok(data) = resp.json::<JsonValue>().await {
                if let Some(results) = data.get("results").and_then(|v| v.as_array()) {
                    for email in results.iter().take(10) {
                        emails.push(EmailContext {
                            subject: email
                                .get("subject")
                                .and_then(|v| v.as_str())
                                .unwrap_or("")
                                .to_string(),
                            from: email
                                .get("from")
                                .and_then(|v| v.as_str())
                                .unwrap_or("")
                                .to_string(),
                            date: email
                                .get("date")
                                .and_then(|v| v.as_str())
                                .unwrap_or("")
                                .to_string(),
                            snippet: email
                                .get("snippet")
                                .or_else(|| email.get("body"))
                                .and_then(|v| v.as_str())
                                .unwrap_or("")
                                .chars()
                                .take(500)
                                .collect(),
                        });
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("[context_aggregator] Gmail search failed: {}", e);
        }
    }

    emails
}

async fn fetch_workspace_docs(description: &str) -> Vec<WorkspaceDocContext> {
    let mut docs = Vec::new();

    // Use the semantic search HTTP endpoint (same server, localhost)
    let search_body = serde_json::json!({
        "query": description,
        "top": 10,
    });

    match reqwest::Client::new()
        .post("http://127.0.0.1:8897/api/knapsack/semantic_search")
        .json(&search_body)
        .send()
        .await
    {
        Ok(resp) => {
            if let Ok(data) = resp.json::<JsonValue>().await {
                if let Some(results) = data.get("results").and_then(|v| v.as_array()) {
                    for result in results.iter().take(10) {
                        docs.push(WorkspaceDocContext {
                            title: result
                                .get("title")
                                .or_else(|| result.get("name"))
                                .and_then(|v| v.as_str())
                                .unwrap_or("Untitled")
                                .to_string(),
                            source: result
                                .get("source")
                                .and_then(|v| v.as_str())
                                .unwrap_or("unknown")
                                .to_string(),
                            snippet: result
                                .get("content")
                                .or_else(|| result.get("text"))
                                .and_then(|v| v.as_str())
                                .unwrap_or("")
                                .chars()
                                .take(500)
                                .collect(),
                            relevance_score: result
                                .get("score")
                                .and_then(|v| v.as_f64())
                                .unwrap_or(0.0) as f32,
                        });
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("[context_aggregator] Semantic search failed: {}", e);
        }
    }

    docs
}

async fn fetch_browser_pages(urls: &[String]) -> Vec<BrowserPageContext> {
    let mut pages = Vec::new();

    for url in urls.iter().take(5) {
        let profile = "openclaw";
        let query = serde_json::json!({"profile": profile});

        // Navigate to the URL
        let _ = gateway_client::browser_request(
            "POST",
            "/navigate",
            Some(query.clone()),
            Some(serde_json::json!({"url": url})),
            None,
        )
        .await;

        // Wait for page to load
        tokio::time::sleep(std::time::Duration::from_secs(3)).await;

        // Get page snapshot
        match gateway_client::browser_request(
            "GET",
            "/snapshot",
            Some(serde_json::json!({"profile": profile, "format": "ai"})),
            None,
            None,
        )
        .await
        {
            Ok(val) => {
                let content = if val.is_string() {
                    val.as_str().unwrap().to_string()
                } else {
                    val.get("snapshot")
                        .or_else(|| val.get("text"))
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string()
                };

                pages.push(BrowserPageContext {
                    url: url.clone(),
                    title: extract_title_from_snapshot(&content),
                    content_snippet: content.chars().take(2000).collect(),
                });
            }
            Err(e) => {
                eprintln!(
                    "[context_aggregator] Failed to fetch browser page {}: {}",
                    url, e
                );
            }
        }
    }

    pages
}

// ---------------------------------------------------------------------------
// Prompt building
// ---------------------------------------------------------------------------

fn build_combined_prompt(
    description: &str,
    meetings: &[MeetingContext],
    emails: &[EmailContext],
    docs: &[WorkspaceDocContext],
    pages: &[BrowserPageContext],
) -> String {
    let mut sections: Vec<String> = Vec::new();

    sections.push(format!("PROJECT: {}\n", description));

    if !meetings.is_empty() {
        let mut s = String::from("RELEVANT MEETINGS:\n");
        for (i, m) in meetings.iter().enumerate().take(10) {
            s.push_str(&format!(
                "{}. [{}] {} — Participants: {}\n   {}\n",
                i + 1,
                m.date,
                m.title,
                m.participants.join(", "),
                truncate(&m.summary, 300)
            ));
        }
        sections.push(s);
    }

    if !emails.is_empty() {
        let mut s = String::from("RELEVANT EMAILS:\n");
        for (i, e) in emails.iter().enumerate().take(10) {
            s.push_str(&format!(
                "{}. [{}] From: {} — Subject: {}\n   {}\n",
                i + 1,
                e.date,
                e.from,
                e.subject,
                truncate(&e.snippet, 200)
            ));
        }
        sections.push(s);
    }

    if !docs.is_empty() {
        let mut s = String::from("RELEVANT DOCUMENTS:\n");
        for (i, d) in docs.iter().enumerate().take(10) {
            s.push_str(&format!(
                "{}. [{}] {} (relevance: {:.2})\n   {}\n",
                i + 1,
                d.source,
                d.title,
                d.relevance_score,
                truncate(&d.snippet, 300)
            ));
        }
        sections.push(s);
    }

    if !pages.is_empty() {
        let mut s = String::from("BROWSER PAGES:\n");
        for (i, p) in pages.iter().enumerate() {
            s.push_str(&format!(
                "{}. {} ({})\n   {}\n",
                i + 1,
                p.title,
                p.url,
                truncate(&p.content_snippet, 500)
            ));
        }
        sections.push(s);
    }

    let context = sections.join("\n---\n\n");

    format!(
        "You are a senior technical architect. Based on the following business context, create a detailed implementation plan.\n\n{}\n\nPlease provide:\n1. A clear problem statement based on the context\n2. Proposed architecture and component breakdown\n3. Step-by-step implementation plan with specific files and code changes\n4. For each step, include a clickable action in this format: [Step Name](knapsack://prompt/detailed-instruction-for-this-step)\n5. Acceptance criteria derived from the business context\n6. Risks and open questions",
        context
    )
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

fn extract_keywords(text: &str) -> Vec<String> {
    // Simple keyword extraction: take words > 4 chars, exclude common words
    let stop_words: std::collections::HashSet<&str> = [
        "about", "after", "again", "being", "could", "every", "first", "from",
        "going", "have", "into", "just", "like", "make", "more", "need", "only",
        "over", "some", "than", "that", "their", "them", "then", "there",
        "these", "they", "this", "very", "want", "were", "what", "when",
        "where", "which", "while", "will", "with", "would", "your", "should",
        "could", "build", "create", "implement", "using", "feature",
    ]
    .iter()
    .copied()
    .collect();

    text.split_whitespace()
        .map(|w| w.trim_matches(|c: char| !c.is_alphanumeric()).to_lowercase())
        .filter(|w| w.len() > 3 && !stop_words.contains(w.as_str()))
        .take(10)
        .collect()
}

fn extract_title_from_snapshot(snapshot: &str) -> String {
    snapshot
        .lines()
        .find(|line| {
            let lower = line.to_lowercase();
            lower.contains("title:") || lower.contains("<title>")
        })
        .map(|line| line.trim().to_string())
        .unwrap_or_else(|| "Untitled Page".to_string())
}

fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}…", &s[..max_len])
    }
}
