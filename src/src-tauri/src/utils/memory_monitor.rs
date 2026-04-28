//! Process memory sampling + early-warning reporter.
//!
//! Why this exists: Windows testers reported the Knapsack process tree
//! (Tauri host + WebView2 children) climbing into the high hundreds of MB.
//! Without per-user telemetry we cannot tell whether a single report is an
//! outlier or a population-wide regression, so this module:
//!
//!  1. Samples resident memory of our process and all descendants every
//!     `SAMPLE_INTERVAL_SECS`.
//!  2. Logs every sample to `ks.log` so support can pull the trail from a
//!     single user's machine.
//!  3. Attaches each sample as a Sentry breadcrumb. Breadcrumbs are local-only
//!     until something else fires an event, so this is free.
//!  4. Captures a Sentry message the first time the tree's RSS crosses each
//!     of the high-water-mark thresholds in `THRESHOLDS_MB`, tagged with
//!     platform / app version / per-process breakdown so we can slice the
//!     data in Sentry without further plumbing.

use std::collections::{BTreeMap, HashSet};
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::time::{Duration, Instant};

use log::{info, warn};
use sysinfo::{Pid, ProcessRefreshKind, ProcessesToUpdate, RefreshKind, System};

/// How often to sample process RSS.
const SAMPLE_INTERVAL_SECS: u64 = 300;
/// Delay before the first sample so startup churn doesn't pollute the baseline.
const FIRST_SAMPLE_DELAY_SECS: u64 = 60;
/// Ascending high-water marks (MB). One Sentry event per threshold per session.
const THRESHOLDS_MB: &[u64] = &[1024, 1536, 2048, 3072];
/// Also fire once if RSS exceeds this fraction of total system memory.
const SYSTEM_FRACTION_THRESHOLD: f64 = 0.10;
/// Cap how many of the largest descendants we list in the report.
const TOP_N_PROCESSES: usize = 8;

static NEXT_THRESHOLD_IDX: AtomicUsize = AtomicUsize::new(0);
static SYSTEM_FRACTION_REPORTED: std::sync::atomic::AtomicBool =
    std::sync::atomic::AtomicBool::new(false);
static PEAK_RSS_MB: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Clone)]
struct ProcessRow {
    pid: u32,
    name: String,
    rss_mb: u64,
}

#[derive(Debug, Clone)]
struct Snapshot {
    tree_rss_mb: u64,
    main_rss_mb: u64,
    process_count: usize,
    largest: Vec<ProcessRow>,
    system_total_mb: u64,
}

pub async fn start_memory_monitor_loop() {
    info!("[memory_monitor] background loop started");
    let started_at = Instant::now();

    tokio::time::sleep(Duration::from_secs(FIRST_SAMPLE_DELAY_SECS)).await;

    loop {
        match take_snapshot() {
            Some(snap) => handle_snapshot(snap, started_at.elapsed()),
            None => warn!("[memory_monitor] failed to identify current process"),
        }
        tokio::time::sleep(Duration::from_secs(SAMPLE_INTERVAL_SECS)).await;
    }
}

fn handle_snapshot(snap: Snapshot, uptime: Duration) {
    let prev_peak = PEAK_RSS_MB.load(Ordering::Relaxed);
    if snap.tree_rss_mb > prev_peak {
        PEAK_RSS_MB.store(snap.tree_rss_mb, Ordering::Relaxed);
    }

    let largest_summary: Vec<String> = snap
        .largest
        .iter()
        .map(|p| format!("{}({})={}MB", p.name, p.pid, p.rss_mb))
        .collect();

    info!(
        "[memory_monitor] tree_rss_mb={} main_rss_mb={} procs={} sys_total_mb={} top=[{}]",
        snap.tree_rss_mb,
        snap.main_rss_mb,
        snap.process_count,
        snap.system_total_mb,
        largest_summary.join(", "),
    );

    sentry::add_breadcrumb(sentry::Breadcrumb {
        category: Some("memory".into()),
        level: sentry::Level::Info,
        message: Some(format!(
            "tree_rss_mb={} procs={} top={}",
            snap.tree_rss_mb,
            snap.process_count,
            largest_summary.first().cloned().unwrap_or_default(),
        )),
        data: breadcrumb_data(&snap),
        ..Default::default()
    });

    // High-water-mark report: fire once per crossed threshold.
    let mut idx = NEXT_THRESHOLD_IDX.load(Ordering::Relaxed);
    while idx < THRESHOLDS_MB.len() && snap.tree_rss_mb >= THRESHOLDS_MB[idx] {
        let threshold = THRESHOLDS_MB[idx];
        report_breach(&snap, uptime, format!("rss_above_{}mb", threshold));
        idx += 1;
    }
    NEXT_THRESHOLD_IDX.store(idx, Ordering::Relaxed);

    // Fraction-of-system report: at most once per session.
    if snap.system_total_mb > 0 {
        let fraction = (snap.tree_rss_mb as f64) / (snap.system_total_mb as f64);
        if fraction >= SYSTEM_FRACTION_THRESHOLD
            && !SYSTEM_FRACTION_REPORTED.swap(true, Ordering::Relaxed)
        {
            report_breach(
                &snap,
                uptime,
                format!("rss_above_{}pct_of_system", (fraction * 100.0) as u64),
            );
        }
    }
}

fn report_breach(snap: &Snapshot, uptime: Duration, reason: String) {
    let platform = if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else {
        "other"
    };

    let app_version = env!("CARGO_PKG_VERSION");
    let uptime_min = uptime.as_secs() / 60;
    let peak_mb = PEAK_RSS_MB.load(Ordering::Relaxed);

    let top_lines: Vec<String> = snap
        .largest
        .iter()
        .map(|p| format!("  {} (pid {}): {} MB", p.name, p.pid, p.rss_mb))
        .collect();

    let msg = format!(
        "memory_warning: {reason} tree_rss_mb={tree} main_rss_mb={main} \
         peak_rss_mb={peak} procs={procs} sys_total_mb={sys} \
         uptime_min={uptime_min} platform={platform} app_version={ver}\nTop processes:\n{tops}",
        reason = reason,
        tree = snap.tree_rss_mb,
        main = snap.main_rss_mb,
        peak = peak_mb,
        procs = snap.process_count,
        sys = snap.system_total_mb,
        uptime_min = uptime_min,
        platform = platform,
        ver = app_version,
        tops = top_lines.join("\n"),
    );

    warn!("[memory_monitor] {}", msg);

    sentry::with_scope(
        |scope| {
            scope.set_tag("memory_reason", &reason);
            scope.set_tag("memory_platform", platform);
            scope.set_tag(
                "memory_tree_rss_bucket_mb",
                bucket_mb(snap.tree_rss_mb).to_string(),
            );
            scope.set_extra("memory_tree_rss_mb", snap.tree_rss_mb.into());
            scope.set_extra("memory_main_rss_mb", snap.main_rss_mb.into());
            scope.set_extra("memory_peak_rss_mb", peak_mb.into());
            scope.set_extra("memory_process_count", snap.process_count.into());
            scope.set_extra("memory_system_total_mb", snap.system_total_mb.into());
            scope.set_extra("memory_uptime_min", uptime_min.into());
            for (i, row) in snap.largest.iter().enumerate() {
                scope.set_extra(
                    &format!("memory_top_{}", i),
                    serde_json::json!({
                        "name": row.name,
                        "pid": row.pid,
                        "rss_mb": row.rss_mb,
                    }),
                );
            }
        },
        || {
            sentry::capture_message(&msg, sentry::Level::Warning);
        },
    );
}

fn breadcrumb_data(snap: &Snapshot) -> BTreeMap<String, serde_json::Value> {
    let mut data = BTreeMap::new();
    data.insert("tree_rss_mb".into(), snap.tree_rss_mb.into());
    data.insert("main_rss_mb".into(), snap.main_rss_mb.into());
    data.insert("process_count".into(), snap.process_count.into());
    data.insert("system_total_mb".into(), snap.system_total_mb.into());
    data
}

/// Round to nearest 256 MB so Sentry "group by tag" stays tidy.
fn bucket_mb(mb: u64) -> u64 {
    const STEP: u64 = 256;
    (mb / STEP) * STEP
}

fn take_snapshot() -> Option<Snapshot> {
    let mut sys = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::everything()),
    );
    sys.refresh_processes(ProcessesToUpdate::All);
    sys.refresh_memory();

    let my_pid = sysinfo::get_current_pid().ok()?;
    let tree_pids = collect_descendants(&sys, my_pid);

    let mut rows: Vec<ProcessRow> = tree_pids
        .iter()
        .filter_map(|pid| {
            sys.process(*pid).map(|p| ProcessRow {
                pid: pid.as_u32(),
                name: p.name().to_string_lossy().into_owned(),
                rss_mb: bytes_to_mb(p.memory()),
            })
        })
        .collect();
    rows.sort_by(|a, b| b.rss_mb.cmp(&a.rss_mb));

    let tree_rss_mb: u64 = rows.iter().map(|r| r.rss_mb).sum();
    let main_rss_mb = sys.process(my_pid).map(|p| bytes_to_mb(p.memory())).unwrap_or(0);
    let process_count = rows.len();
    let mut largest = rows;
    largest.truncate(TOP_N_PROCESSES);

    Some(Snapshot {
        tree_rss_mb,
        main_rss_mb,
        process_count,
        largest,
        system_total_mb: bytes_to_mb(sys.total_memory()),
    })
}

fn collect_descendants(sys: &System, root: Pid) -> HashSet<Pid> {
    let mut tree: HashSet<Pid> = HashSet::new();
    tree.insert(root);
    // Walk the parent->child relation transitively. Bounded by total process
    // count, which is fine for desktop scale.
    loop {
        let mut grew = false;
        for (pid, process) in sys.processes() {
            if tree.contains(pid) {
                continue;
            }
            if let Some(ppid) = process.parent() {
                if tree.contains(&ppid) {
                    tree.insert(*pid);
                    grew = true;
                }
            }
        }
        if !grew {
            break;
        }
    }
    tree
}

fn bytes_to_mb(bytes: u64) -> u64 {
    bytes / (1024 * 1024)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bucket_rounds_down_to_step() {
        assert_eq!(bucket_mb(0), 0);
        assert_eq!(bucket_mb(255), 0);
        assert_eq!(bucket_mb(256), 256);
        assert_eq!(bucket_mb(1023), 768);
        assert_eq!(bucket_mb(1024), 1024);
        assert_eq!(bucket_mb(2050), 2048);
    }

    #[test]
    fn snapshot_captures_self() {
        let snap = take_snapshot().expect("snapshot for current process");
        assert!(snap.process_count >= 1);
        assert!(snap.system_total_mb > 0);
        // The tree must include this process, and our own RSS must be > 0.
        assert!(snap.main_rss_mb > 0);
        assert!(snap.tree_rss_mb >= snap.main_rss_mb);
    }
}
