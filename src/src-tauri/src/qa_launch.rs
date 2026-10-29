//! A synthetic QA binary is safe only with the exact isolation contract that
//! was embedded when it was compiled. The executable name is not an identity:
//! retained, Finder-opened, or renamed app bundles must fail before any data or
//! service initialization when their launcher environment is absent or altered.
use std::path::Path;

#[derive(Clone, Copy, Debug)]
struct QaBuildIdentity<'a> {
  run_id: &'a str,
  bundle_id: &'a str,
  home: &'a str,
  state_dir: &'a str,
  config_path: &'a str,
  database_path: &'a str,
}

#[derive(Clone, Copy, Debug, Default)]
struct QaRuntime<'a> {
  synthetic: Option<&'a str>,
  skip_gateway: Option<&'a str>,
  run_id: Option<&'a str>,
  bundle_id: Option<&'a str>,
  home: Option<&'a str>,
  state_dir: Option<&'a str>,
  config_path: Option<&'a str>,
  database_path: Option<&'a str>,
}

fn compiled_identity() -> Option<QaBuildIdentity<'static>> {
  let bundle_id = option_env!("KNAPSACK_QA_BUILD_BUNDLE_ID")?;
  Some(QaBuildIdentity {
    run_id: option_env!("KNAPSACK_QA_BUILD_RUN_ID").expect("QA build run ID is required"),
    bundle_id,
    home: option_env!("KNAPSACK_QA_BUILD_HOME").expect("QA build home is required"),
    state_dir: option_env!("KNAPSACK_QA_BUILD_STATE_DIR").expect("QA build state is required"),
    config_path: option_env!("KNAPSACK_QA_BUILD_CONFIG_PATH").expect("QA build config is required"),
    database_path: option_env!("KNAPSACK_QA_BUILD_DATABASE_PATH")
      .expect("QA build database is required"),
  })
}

pub(crate) fn is_synthetic_build() -> bool {
  compiled_identity().is_some()
}

/// Production background work must not even be scheduled in synthetic QA.
/// The decision comes from compiled identity, never a mutable runtime flag.
pub(crate) fn start_background_work(start: impl FnOnce()) -> bool {
  start_background_work_for_build(is_synthetic_build(), start)
}

fn start_background_work_for_build(synthetic: bool, start: impl FnOnce()) -> bool {
  if synthetic { return false; }
  start();
  true
}

fn runtime_matches(identity: QaBuildIdentity<'_>, runtime: QaRuntime<'_>) -> bool {
  runtime.synthetic == Some("1")
    && runtime.skip_gateway == Some("1")
    && runtime.run_id == Some(identity.run_id)
    && runtime.bundle_id == Some(identity.bundle_id)
    && runtime.home.map(Path::new) == Some(Path::new(identity.home))
    && runtime.state_dir.map(Path::new) == Some(Path::new(identity.state_dir))
    && runtime.config_path.map(Path::new) == Some(Path::new(identity.config_path))
    && runtime.database_path.map(Path::new) == Some(Path::new(identity.database_path))
}

fn legacy_dev_needs_launcher(executable: &Path, runtime: QaRuntime<'_>) -> bool {
  executable.file_name().and_then(|name| name.to_str()) == Some("Knapsack Dev")
    && !(runtime.database_path.is_some() && runtime.state_dir.is_some())
}

fn needs_launcher(
  executable: &Path,
  identity: Option<QaBuildIdentity<'_>>,
  runtime: QaRuntime<'_>,
) -> bool {
  match identity {
    Some(identity) => !runtime_matches(identity, runtime),
    None => legacy_dev_needs_launcher(executable, runtime),
  }
}

pub fn reject_unmanaged_launch() {
  let executable = std::env::current_exe().unwrap_or_default();
  let synthetic = std::env::var("KNAPSACK_QA_SYNTHETIC").ok();
  let skip_gateway = std::env::var("KNAPSACK_QA_SKIP_GATEWAY").ok();
  let run_id = std::env::var("KNAPSACK_QA_RUN_ID").ok();
  let bundle_id = std::env::var("KNAPSACK_QA_BUNDLE_ID").ok();
  let home = std::env::var("HOME")
    .ok()
    .or_else(|| std::env::var("USERPROFILE").ok());
  let state_dir = std::env::var("OPENCLAW_STATE_DIR").ok();
  let config_path = std::env::var("OPENCLAW_CONFIG_PATH").ok();
  let database_path = std::env::var("DATABASE_URL").ok();
  let runtime = QaRuntime {
    synthetic: synthetic.as_deref(),
    skip_gateway: skip_gateway.as_deref(),
    run_id: run_id.as_deref(),
    bundle_id: bundle_id.as_deref(),
    home: home.as_deref(),
    state_dir: state_dir.as_deref(),
    config_path: config_path.as_deref(),
    database_path: database_path.as_deref(),
  };
  if needs_launcher(&executable, compiled_identity(), runtime) {
    tauri::api::dialog::blocking::message(
      None::<&tauri::Window>,
      "Start this QA app with its launcher",
      "This synthetic QA build requires its exact isolated data paths and disabled gateway. Start it with the repository's qa:dev command. Production data and services were not opened.",
    );
    std::process::exit(1);
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  const IDENTITY: QaBuildIdentity<'static> = QaBuildIdentity {
    run_id: "run-123",
    bundle_id: "ai.knap.knapsack.qa.run123",
    home: "/tmp/knapsack-qa-run-123/home",
    state_dir: "/tmp/knapsack-qa-run-123/state",
    config_path: "/tmp/knapsack-qa-run-123/state/openclaw.json",
    database_path: "/tmp/knapsack-qa-run-123/state/knapsack-qa.db",
  };

  fn valid_runtime() -> QaRuntime<'static> {
    QaRuntime {
      synthetic: Some("1"),
      skip_gateway: Some("1"),
      run_id: Some(IDENTITY.run_id),
      bundle_id: Some(IDENTITY.bundle_id),
      home: Some(IDENTITY.home),
      state_dir: Some(IDENTITY.state_dir),
      config_path: Some(IDENTITY.config_path),
      database_path: Some(IDENTITY.database_path),
    }
  }

  #[test]
  fn synthetic_qa_identity_does_not_depend_on_executable_name() {
    for executable in [
      "/tmp/Knapsack QA run-123.app/Contents/MacOS/Knapsack QA run-123",
      "/tmp/Renamed.app/Contents/MacOS/Anything",
      "/tmp/Prepared.app/Contents/MacOS/Knapsack",
    ] {
      assert!(!needs_launcher(
        Path::new(executable),
        Some(IDENTITY),
        valid_runtime()
      ));
      assert!(needs_launcher(
        Path::new(executable),
        Some(IDENTITY),
        QaRuntime::default()
      ));
    }
  }

  #[test]
  fn synthetic_qa_identity_rejects_every_altered_isolation_value() {
    let mutations = [
      QaRuntime {
        synthetic: Some("0"),
        ..valid_runtime()
      },
      QaRuntime {
        skip_gateway: Some("0"),
        ..valid_runtime()
      },
      QaRuntime {
        run_id: Some("other"),
        ..valid_runtime()
      },
      QaRuntime {
        bundle_id: Some("ai.knap.knapsack"),
        ..valid_runtime()
      },
      QaRuntime {
        home: Some("/Users/person"),
        ..valid_runtime()
      },
      QaRuntime {
        state_dir: Some("/Users/person/.openclaw"),
        ..valid_runtime()
      },
      QaRuntime {
        config_path: Some("/Users/person/.openclaw/openclaw.json"),
        ..valid_runtime()
      },
      QaRuntime {
        database_path: Some("/Users/person/.knapsack.db"),
        ..valid_runtime()
      },
    ];
    for runtime in mutations {
      assert!(needs_launcher(
        Path::new("/tmp/Renamed"),
        Some(IDENTITY),
        runtime
      ));
    }
  }

  #[test]
  fn synthetic_qa_guard_preserves_production_and_legacy_development_behavior() {
    assert!(!needs_launcher(
      Path::new("/Applications/Knapsack.app/Contents/MacOS/Knapsack"),
      None,
      QaRuntime::default()
    ));
    assert!(needs_launcher(
      Path::new("/tmp/Knapsack Dev.app/Contents/MacOS/Knapsack Dev"),
      None,
      QaRuntime::default()
    ));
    assert!(!needs_launcher(
      Path::new("/tmp/Knapsack Dev.app/Contents/MacOS/Knapsack Dev"),
      None,
      QaRuntime {
        state_dir: Some("/tmp/state"),
        database_path: Some("/tmp/db"),
        ..QaRuntime::default()
      },
    ));
  }
}

#[cfg(test)]
mod background_work_tests {
  use super::*;
  use std::cell::Cell;
  #[test]
  fn synthetic_qa_background_startup_schedules_nothing() {
    if std::env::var_os("KNAPSACK_QA_EXPECT_GATEWAY_TESTS").is_some() { assert!(is_synthetic_build()); }
    let scheduled=Cell::new(0);
    let started=start_background_work(||scheduled.set(scheduled.get()+1));
    assert_eq!(started,!is_synthetic_build());
    assert_eq!(scheduled.get(),if is_synthetic_build(){0}else{1});
  }
  #[test]
  fn synthetic_qa_background_policy_preserves_production_startup_once() {
    let scheduled=Cell::new(0);
    assert!(!start_background_work_for_build(true,||scheduled.set(scheduled.get()+1)));
    assert_eq!(scheduled.get(),0);
    assert!(start_background_work_for_build(false,||scheduled.set(scheduled.get()+1)));
    assert_eq!(scheduled.get(),1);
  }
}
