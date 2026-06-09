//! Crash reporting: in-memory log ring buffer + enriched panic hook.
//!
//! How it works:
//!  1. A custom log4rs appender (`CrashLogAppender`) pushes every log record into
//!     a fixed-size ring buffer *and* adds it as a Sentry breadcrumb.  This gives
//!     Sentry a live trail of recent log activity for every event it captures.
//!  2. `install_panic_hook()` wraps whatever hook is already set (after
//!     `sentry::init()` that is sentry's own panic hook).  The wrapper runs first,
//!     attaching the ring-buffer contents and a live memory snapshot to the Sentry
//!     scope, then calls through to sentry's hook which captures the event, flushes
//!     the transport, and finally calls the default Rust panic hook.

use std::collections::VecDeque;
use std::sync::{Mutex, OnceLock};

use chrono::Local;
use sysinfo::{ProcessRefreshKind, ProcessesToUpdate, RefreshKind, System};

/// Number of log lines retained in the ring buffer.
const RING_CAPACITY: usize = 200;

static LOG_RING: OnceLock<Mutex<VecDeque<String>>> = OnceLock::new();

fn ring() -> &'static Mutex<VecDeque<String>> {
  LOG_RING.get_or_init(|| Mutex::new(VecDeque::with_capacity(RING_CAPACITY + 1)))
}

/// Push a formatted log line into the ring buffer.
/// Called by `CrashLogAppender` for every log record.
pub fn push_log_line(line: String) {
  if let Ok(mut buf) = ring().lock() {
    if buf.len() >= RING_CAPACITY {
      buf.pop_front();
    }
    buf.push_back(line);
  }
}

fn drain_ring() -> String {
  ring()
    .lock()
    .map(|buf| buf.iter().cloned().collect::<Vec<_>>().join("\n"))
    .unwrap_or_default()
}

fn collect_system_state() -> String {
  let mut sys = System::new_with_specifics(
    RefreshKind::new().with_processes(ProcessRefreshKind::new().with_memory()),
  );
  sys.refresh_processes(ProcessesToUpdate::All);
  sys.refresh_memory();

  let main_rss_mb = sysinfo::get_current_pid()
    .ok()
    .and_then(|pid| sys.process(pid))
    .map(|p| p.memory() / 1_048_576)
    .unwrap_or(0);

  format!(
    "rss_mb={} | system_total_mb={} | system_avail_mb={} | num_cpus={}",
    main_rss_mb,
    sys.total_memory() / 1_048_576,
    sys.available_memory() / 1_048_576,
    sys.cpus().len(),
  )
}

/// Install the enriched panic hook.
///
/// Must be called **after** `sentry::init()` so that the hook we wrap is
/// already sentry's (which captures the event and flushes the transport before
/// calling the default Rust panic hook).
pub fn install_panic_hook() {
  let prev_hook = std::panic::take_hook();
  std::panic::set_hook(Box::new(move |panic_info| {
    let logs = drain_ring();
    let sys_state = collect_system_state();

    let location = panic_info
      .location()
      .map(|l| format!("{}:{}:{}", l.file(), l.line(), l.column()))
      .unwrap_or_else(|| "unknown".into());

    // Attach context to the current scope so sentry's event picks it up.
    sentry::configure_scope(|scope| {
      scope.set_extra(
        "system_state_at_crash",
        sentry::protocol::Value::String(sys_state.clone()),
      );
      scope.set_extra("recent_logs", sentry::protocol::Value::String(logs.clone()));
    });

    sentry::add_breadcrumb(sentry::Breadcrumb {
      ty: "debug".to_string(),
      level: sentry::Level::Fatal,
      message: Some(format!(
        "CRASH at {} — {} | log_lines={}",
        location,
        sys_state,
        logs.lines().count(),
      )),
      ..Default::default()
    });

    // prev_hook is sentry's hook: it captures the panic event (with our
    // enriched scope), flushes the transport, then calls the Rust default
    // hook which prints the message and terminates the process.
    prev_hook(panic_info);
  }));
}

// ── log4rs appender ──────────────────────────────────────────────────────────

/// A log4rs appender that feeds every record into both the crash ring buffer
/// and Sentry breadcrumbs.  Add it to the log4rs config via `setup_logger`.
#[derive(Debug)]
pub struct CrashLogAppender;

impl log4rs::append::Append for CrashLogAppender {
  fn append(&self, record: &log::Record) -> anyhow::Result<()> {
    let line = format!(
      "{} [{:<5}] {} - {}",
      Local::now().format("%Y-%m-%d %H:%M:%S"),
      record.level(),
      record.target(),
      record.args(),
    );
    push_log_line(line.clone());

    let sentry_level = match record.level() {
      log::Level::Error => sentry::Level::Error,
      log::Level::Warn => sentry::Level::Warning,
      log::Level::Info => sentry::Level::Info,
      log::Level::Debug | log::Level::Trace => sentry::Level::Debug,
    };
    sentry::add_breadcrumb(sentry::Breadcrumb {
      ty: "log".to_string(),
      message: Some(record.args().to_string()),
      level: sentry_level,
      category: Some(record.target().to_string()),
      ..Default::default()
    });

    Ok(())
  }

  fn flush(&self) {}
}
