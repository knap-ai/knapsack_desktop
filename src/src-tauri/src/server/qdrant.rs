use std::env;
use std::fs::{create_dir_all, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command as StdCommand, Stdio};
use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc, Mutex,
};
use sysinfo::System;
use tauri::api::process::Command;
use tauri::utils::platform;
use crate::utils::platform::{get_os, OS};

pub const QDRANT_PORT: u16 = 8898;
pub const QDRANT_STORAGE: &str = ".knapsack/data";
pub const QDRANT_SNAPSHOT: &str = ".knapsack/snapshot";
pub const QDRANT_LOG: &str = ".knapsack/qdrant.log";
const VECTOR_DB_VERSION: u16 = 1;

#[derive(Default)]
struct QdrantService {
  qdrant_process: Arc<Mutex<Option<Child>>>,
  running: Arc<Mutex<AtomicBool>>,
}

pub fn get_qdrant_logfile() -> File {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let log_pathbuf = home_dir.join(QDRANT_LOG);
  let log_path = log_pathbuf.as_path();

  let log_file = OpenOptions::new()
    .create(true)
    .append(true)
    .open(log_path)
    .expect("Failed to open log file");
  return log_file;
}

pub fn start_qdrant() -> Result<(), String> {
  if get_os() == OS::WINDOWS {
    return Ok(());
  }

  kill_existing_qdrant();
  let qdrant_service: QdrantService = QdrantService::default();

  let is_running = qdrant_service.running.lock().unwrap();
  if is_running.load(Ordering::SeqCst) {
    return Err("Qdrant server is already running.".to_string());
  }
  drop(is_running);
  qdrant_service
    .running
    .lock()
    .unwrap()
    .store(true, Ordering::SeqCst);

  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let qdrant_pathbuf = home_dir.join(QDRANT_STORAGE);
  let qdrant_path = qdrant_pathbuf.as_path();
  let qdrant_path_str = qdrant_path.to_str().unwrap();

  let knapsack_data_root_path = qdrant_pathbuf
    .parent()
    .expect("Could not get .knapsack root dir path");
  create_dir_all(knapsack_data_root_path)
    .expect("Create .knapsack root folder if it does not exist");

  let mut log_file = get_qdrant_logfile();

  let snapshot_pathbuf = home_dir.join(QDRANT_SNAPSHOT);
  let snapshot_path = snapshot_pathbuf.as_path();
  let snapshot_path_str = snapshot_path.to_str().unwrap();

  env::set_var(
    "QDRANT__STORAGE__STORAGE_PATH",
    format!("{}", qdrant_path_str),
  );
  env::set_var(
    "QDRANT__STORAGE__SNAPSHOTS_PATH",
    format!("{}", snapshot_path_str),
  );
  env::set_var("QDRANT__SERVICE__HTTP_PORT", format!("{}", QDRANT_PORT));

  let qdrant_process_arc = qdrant_service.qdrant_process.clone();
  tauri::async_runtime::spawn(async move {
    tracing::info!("qdrant_start");
    let path = match platform::current_exe().unwrap().parent() {
      Some(exe_dir) => Some(format!("{}/qdrant", exe_dir.display())),
      None => None,
    }
    .unwrap();

    let mut child = StdCommand::new("sh")
      .arg("-c")
      .arg(format!("ulimit -n 10000 && {}", path))
      .stdout(Stdio::piped()) // Capture the standard output
      .stderr(Stdio::piped())
      .spawn()
      .expect("failed to execute process");

    if let Some(stdout) = child.stdout.take() {
      let reader = BufReader::new(stdout);
      for line in reader.lines() {
        match line {
          Ok(line) => writeln!(log_file, "{}", line).expect("Failed to write to log file"),
          Err(e) => {
            writeln!(log_file, "Error reading stdout: {}", e).expect("Failed to write to log file")
          }
        }
      }
    }

    if let Some(stderr) = child.stderr.take() {
      let reader = BufReader::new(stderr);
      for line in reader.lines() {
        match line {
          Ok(line) => writeln!(log_file, "stderr: {}", line).expect("Failed to write to log file"),
          Err(e) => {
            writeln!(log_file, "Error reading stderr: {}", e).expect("Failed to write to log file")
          }
        }
      }
    }
    *qdrant_process_arc.lock().unwrap() = Some(child)
  });

  Ok(())
}

pub fn kill_existing_qdrant() {
  let mut sys = System::new_all();
  sys.refresh_all();

  for (pid, process) in sys.processes() {
    if process.name() == "qdrant" {
      Command::new("kill").args([format!("-9"), format!("{pid}")]).spawn();
    }
  }
}

pub async fn stop_qdrant() -> Result<(), String> {
  let qdrant_service: QdrantService = QdrantService::default();

  let is_running = qdrant_service.running.lock().unwrap();
  if !is_running.load(Ordering::SeqCst) {
    return Err("Qdrant server is not running.".to_string());
  }

  if let Some(mut child) = qdrant_service.qdrant_process.lock().unwrap().take() {
    qdrant_service
      .running
      .lock()
      .unwrap()
      .store(false, Ordering::SeqCst);
    if let Err(e) = child.kill() {
      return Err(format!("Failed to stop Qdrant server: {}", e));
    }
    println!("Qdrant server stopped");
  }

  Ok(())
}
