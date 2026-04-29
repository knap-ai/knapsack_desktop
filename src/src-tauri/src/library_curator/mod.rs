//! Background "Library curator" — periodically scans synced data sources
//! (email, calendar, meetings, drive, optional local files) and auto-populates
//! the user's Library with collections organized around the people they work
//! with most and the projects they're most active on.
//!
//! Triggered on app startup and then every CURATOR_INTERVAL_SECS thereafter.
//! Pure side-effect free w.r.t. user data — only writes into the `workspaces`
//! and `workspace_documents` tables, scoped via `auto_curated = 1`.

pub mod chat_autosave;
pub mod people;
pub mod projects;
pub mod retag;
pub mod settings;

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use crate::error::Error;

/// How often the curator wakes up to look for new data to ingest.
const CURATOR_INTERVAL_SECS: u64 = 30 * 60; // 30 minutes

/// How long to wait after app startup before the first run. 120s gives email
/// sync time to settle before the curator's LLM calls begin, avoiding overlap
/// that would cause rate-limit errors on first launch.
const CURATOR_STARTUP_DELAY_SECS: u64 = 120;

/// Drive the curator forever from a dedicated tokio runtime. Call this from
/// inside `Runtime::block_on(...)` on a worker thread spawned at startup.
pub async fn run_curator_forever() {
    static STARTED: AtomicBool = AtomicBool::new(false);
    if STARTED.swap(true, Ordering::SeqCst) {
        log::warn!("[library_curator] already started; skipping");
        return;
    }

    log::info!("[library_curator] startup delay {}s", CURATOR_STARTUP_DELAY_SECS);
    tokio::time::sleep(Duration::from_secs(CURATOR_STARTUP_DELAY_SECS)).await;

    loop {
        if let Err(e) = run_curation_pass().await {
            log::error!("[library_curator] pass failed: {:?}", e);
        }
        tokio::time::sleep(Duration::from_secs(CURATOR_INTERVAL_SECS)).await;
    }
}

/// Run a single end-to-end curation pass. Exposed so the API endpoint
/// `POST /api/knapsack/library/curate-now` can trigger it on demand.
pub async fn run_curation_pass() -> Result<(), Error> {
    let mut cfg = settings::CuratorSettings::load();
    if !cfg.enabled {
        log::info!("[library_curator] disabled by user; skipping pass");
        return Ok(());
    }

    log::info!("[library_curator] starting pass with {:?}", cfg);

    if cfg.sources_email || cfg.sources_calendar {
        if let Err(e) = people::detect_and_upsert(&cfg) {
            log::error!("[library_curator] people detector failed: {:?}", e);
        }
    }

    if cfg.sources_email || cfg.sources_calendar {
        if let Err(e) = projects::detect_and_upsert(&cfg).await {
            log::error!("[library_curator] projects detector failed: {:?}", e);
        }
    }

    // Auto-save significant chat threads after Projects have been detected,
    // so the routing layer has fresh project keywords to match against.
    if let Err(e) = chat_autosave::autosave_significant_chats(&cfg) {
        log::error!("[library_curator] chat autosave failed: {:?}", e);
    }

    // Backfill auto_tags / summary for any document that doesn't have them yet.
    if let Err(e) = retag::retag_stale().await {
        log::error!("[library_curator] retag stale failed: {:?}", e);
    }

    cfg.mark_run_now();
    log::info!("[library_curator] pass complete");
    Ok(())
}
