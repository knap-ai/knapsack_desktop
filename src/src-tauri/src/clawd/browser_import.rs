use actix_web::{get, post, web, HttpResponse, Responder};
use rusqlite::{Connection, OpenFlags};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use crate::clawd::{browser, gateway_client, service};

const IMPORT_MARKER: &str = "chrome-import.json";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChromeProfile {
  pub id: String,
  pub name: String,
  pub account_email: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChromeImportStatus {
  pub available: bool,
  pub supported: bool,
  pub profiles: Vec<ChromeProfile>,
  pub imported_at: Option<String>,
  pub message: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChromeImportRequest {
  pub profile_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChromeImportResponse {
  pub success: bool,
  pub passwords_imported: usize,
  pub cookies_imported: usize,
  pub imported_at: Option<String>,
  pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ImportMarker {
  profile_id: String,
  imported_at: String,
  passwords_imported: usize,
  cookies_imported: usize,
}

#[derive(Debug)]
struct ImportFailure {
  message: String,
  passwords_imported: usize,
  cookies_imported: usize,
}

impl ImportFailure {
  fn before_changes(message: String) -> Self {
    Self {
      message,
      passwords_imported: 0,
      cookies_imported: 0,
    }
  }
}

fn chrome_user_data_dir() -> Option<PathBuf> {
  #[cfg(target_os = "macos")]
  {
    return dirs::home_dir().map(|home| {
      home
        .join("Library")
        .join("Application Support")
        .join("Google")
        .join("Chrome")
    });
  }
  // Chrome secrets on Windows are encrypted against the source user-data
  // directory's Local State key. Copying those rows into Knapsack's isolated
  // profile would report success while leaving unusable credentials. Keep the
  // importer macOS-only until the Windows path can decrypt and re-encrypt each
  // secret for the target profile.
  #[allow(unreachable_code)]
  None
}

fn google_chrome_executable() -> Option<PathBuf> {
  #[cfg(target_os = "macos")]
  {
    let mut candidates = vec![PathBuf::from(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    )];
    if let Some(home) = dirs::home_dir() {
      candidates.push(
        home
          .join("Applications")
          .join("Google Chrome.app")
          .join("Contents")
          .join("MacOS")
          .join("Google Chrome"),
      );
    }
    return candidates.into_iter().find(|candidate| candidate.is_file());
  }
  #[allow(unreachable_code)]
  None
}

fn pin_managed_browser_to_google_chrome(
  config_path: &Path,
  executable: &Path,
) -> Result<(), String> {
  let mut config = if config_path.exists() {
    let raw = fs::read_to_string(config_path)
      .map_err(|error| format!("Could not read browser configuration: {error}"))?;
    serde_json::from_str::<JsonValue>(&raw)
      .map_err(|error| format!("Could not parse browser configuration: {error}"))?
  } else {
    serde_json::json!({})
  };
  let root = config
    .as_object_mut()
    .ok_or_else(|| "Browser configuration must contain a JSON object".to_string())?;
  let browser = root
    .entry("browser".to_string())
    .or_insert_with(|| serde_json::json!({}))
    .as_object_mut()
    .ok_or_else(|| "Browser configuration must contain a browser object".to_string())?;
  browser.insert(
    "executablePath".to_string(),
    JsonValue::String(executable.to_string_lossy().to_string()),
  );
  let profiles = browser
    .entry("profiles".to_string())
    .or_insert_with(|| serde_json::json!({}))
    .as_object_mut()
    .ok_or_else(|| "Browser configuration profiles must contain a JSON object".to_string())?;
  let openclaw = profiles
    .entry("openclaw".to_string())
    .or_insert_with(|| serde_json::json!({}))
    .as_object_mut()
    .ok_or_else(|| "The openclaw browser profile must contain a JSON object".to_string())?;
  openclaw.insert(
    "executablePath".to_string(),
    JsonValue::String(executable.to_string_lossy().to_string()),
  );
  if let Some(parent) = config_path.parent() {
    fs::create_dir_all(parent)
      .map_err(|error| format!("Could not prepare browser configuration: {error}"))?;
  }
  fs::write(
    config_path,
    serde_json::to_vec_pretty(&config)
      .map_err(|error| format!("Could not encode browser configuration: {error}"))?,
  )
  .map_err(|error| format!("Could not select Google Chrome for the built-in browser: {error}"))
}

fn is_safe_profile_id(value: &str) -> bool {
  value == "Default"
    || value
      .strip_prefix("Profile ")
      .map(|suffix| !suffix.is_empty() && suffix.bytes().all(|byte| byte.is_ascii_digit()))
      .unwrap_or(false)
}

fn profile_has_importable_data(root: &Path, id: &str) -> bool {
  let profile = root.join(id);
  profile.join("Login Data").is_file()
    || profile.join("Cookies").is_file()
    || profile.join("Network").join("Cookies").is_file()
}

fn cookie_database(profile: &Path) -> PathBuf {
  let network_cookie_database = profile.join("Network").join("Cookies");
  if network_cookie_database.is_file() {
    network_cookie_database
  } else {
    profile.join("Cookies")
  }
}

fn import_cookie_database_paths(
  source_profile: &Path,
  target_profile: &Path,
) -> (PathBuf, PathBuf) {
  let source = cookie_database(source_profile);
  let target_network = target_profile.join("Network").join("Cookies");
  let target_legacy = target_profile.join("Cookies");
  let target = if target_network.is_file() {
    target_network
  } else if target_legacy.is_file() {
    target_legacy
  } else if source == source_profile.join("Network").join("Cookies") {
    // Modern Chromium reads cookies from Network/Cookies. A fresh Knapsack
    // profile has neither target database yet, so preserve the source layout
    // instead of silently creating the legacy path that Chrome will ignore.
    target_network
  } else {
    target_legacy
  };
  (source, target)
}

fn chrome_profiles(root: &Path) -> Vec<ChromeProfile> {
  let local_state = fs::read_to_string(root.join("Local State"))
    .ok()
    .and_then(|raw| serde_json::from_str::<JsonValue>(&raw).ok());
  let info_cache = local_state
    .as_ref()
    .and_then(|state| state.pointer("/profile/info_cache"))
    .and_then(JsonValue::as_object);
  let last_used = local_state
    .as_ref()
    .and_then(|state| state.pointer("/profile/last_used"))
    .and_then(JsonValue::as_str);

  let mut profiles: Vec<ChromeProfile> = info_cache
    .into_iter()
    .flat_map(|cache| cache.iter())
    .filter(|(id, _)| is_safe_profile_id(id) && profile_has_importable_data(root, id))
    .map(|(id, value)| ChromeProfile {
      id: id.clone(),
      name: value
        .get("name")
        .and_then(JsonValue::as_str)
        .filter(|name| !name.trim().is_empty())
        .unwrap_or(id)
        .to_string(),
      account_email: value
        .get("user_name")
        .and_then(JsonValue::as_str)
        .filter(|email| !email.trim().is_empty())
        .map(ToString::to_string),
    })
    .collect();

  if profiles.is_empty() && profile_has_importable_data(root, "Default") {
    profiles.push(ChromeProfile {
      id: "Default".to_string(),
      name: "Default".to_string(),
      account_email: None,
    });
  }
  profiles.sort_by_key(|profile| {
    if Some(profile.id.as_str()) == last_used {
      0
    } else {
      1
    }
  });
  profiles
}

fn marker_path(target_root: &Path) -> PathBuf {
  target_root.join(IMPORT_MARKER)
}

fn read_marker(target_root: &Path) -> Option<ImportMarker> {
  fs::read_to_string(marker_path(target_root))
    .ok()
    .and_then(|raw| serde_json::from_str(&raw).ok())
}

fn quote_identifier(value: &str) -> String {
  format!("\"{}\"", value.replace('"', "\"\""))
}

fn table_columns(
  connection: &Connection,
  schema: &str,
  table: &str,
) -> Result<Vec<String>, String> {
  let sql = format!(
    "PRAGMA {}.table_info({})",
    quote_identifier(schema),
    quote_identifier(table)
  );
  let mut statement = connection
    .prepare(&sql)
    .map_err(|error| error.to_string())?;
  let rows = statement
    .query_map([], |row| row.get::<_, String>(1))
    .map_err(|error| error.to_string())?;
  rows
    .collect::<Result<Vec<_>, _>>()
    .map_err(|error| error.to_string())
}

fn sqlite_sidecar(path: &Path, suffix: &str) -> PathBuf {
  let mut value = path.as_os_str().to_os_string();
  value.push(suffix);
  PathBuf::from(value)
}

fn copy_validated_database_snapshot(source: &Path, snapshot: &Path) -> Result<(), String> {
  for attempt in 0..3 {
    let candidate = snapshot.with_extension(format!("hot-copy-{attempt}.sqlite"));
    fs::copy(source, &candidate).map_err(|error| format!("Could not copy Chrome data: {error}"))?;
    for suffix in ["-wal", "-shm"] {
      let source_sidecar = sqlite_sidecar(source, suffix);
      if source_sidecar.is_file() {
        fs::copy(&source_sidecar, sqlite_sidecar(&candidate, suffix))
          .map_err(|error| format!("Could not copy Chrome data state: {error}"))?;
      }
    }

    let validation = Connection::open(&candidate).and_then(|connection| {
      connection.busy_timeout(Duration::from_secs(2))?;
      let result: String = connection.query_row("PRAGMA quick_check", [], |row| row.get(0))?;
      if result == "ok" {
        Ok(())
      } else {
        Err(rusqlite::Error::InvalidQuery)
      }
    });
    if validation.is_ok() {
      fs::rename(&candidate, snapshot)
        .map_err(|error| format!("Could not finalize Chrome data snapshot: {error}"))?;
      for suffix in ["-wal", "-shm"] {
        let candidate_sidecar = sqlite_sidecar(&candidate, suffix);
        if candidate_sidecar.is_file() {
          fs::rename(candidate_sidecar, sqlite_sidecar(snapshot, suffix))
            .map_err(|error| format!("Could not finalize Chrome data snapshot state: {error}"))?;
        }
      }
      return Ok(());
    }
    std::thread::sleep(Duration::from_millis(100));
  }
  Err("Chrome data changed while it was being copied. Try the import again.".to_string())
}

fn snapshot_database(source: &Path, snapshot: &Path) -> Result<(), String> {
  let source_connection = Connection::open_with_flags(source, OpenFlags::SQLITE_OPEN_READ_ONLY)
    .map_err(|error| format!("Could not read Chrome data: {error}"))?;
  source_connection
    .busy_timeout(Duration::from_secs(5))
    .map_err(|error| format!("Could not wait for Chrome data: {error}"))?;
  let mut snapshot_connection = Connection::open(snapshot)
    .map_err(|error| format!("Could not prepare Chrome data snapshot: {error}"))?;
  let backup = rusqlite::backup::Backup::new(&source_connection, &mut snapshot_connection)
    .map_err(|error| format!("Could not start a consistent Chrome data snapshot: {error}"))?;
  let deadline = Instant::now() + Duration::from_secs(2);
  let backed_up = loop {
    match backup.step(64) {
      Ok(rusqlite::backup::StepResult::Done) => break true,
      Ok(rusqlite::backup::StepResult::More) => {}
      Ok(rusqlite::backup::StepResult::Busy | rusqlite::backup::StepResult::Locked) => {
        if Instant::now() >= deadline {
          break false;
        }
        std::thread::sleep(Duration::from_millis(50));
      }
      Ok(_) => {}
      Err(error) => {
        return Err(format!(
          "Could not make a consistent Chrome data snapshot: {error}"
        ));
      }
    }
  };
  drop(backup);
  drop(snapshot_connection);
  drop(source_connection);
  if backed_up {
    Ok(())
  } else {
    copy_validated_database_snapshot(source, snapshot)
  }
}

fn merge_table(
  source: &Path,
  target: &Path,
  table: &str,
  backup_dir: &Path,
) -> Result<usize, String> {
  if !source.is_file() {
    return Ok(0);
  }
  if let Some(parent) = target.parent() {
    fs::create_dir_all(parent)
      .map_err(|error| format!("Could not prepare browser profile: {error}"))?;
  }
  fs::create_dir_all(backup_dir)
    .map_err(|error| format!("Could not prepare browser backup: {error}"))?;
  let snapshot = backup_dir.join(format!("{}-source.sqlite", table));
  snapshot_database(source, &snapshot)?;

  if !target.exists() {
    fs::copy(&snapshot, target)
      .map_err(|error| format!("Could not import Chrome {table}: {error}"))?;
    let connection = Connection::open(target).map_err(|error| error.to_string())?;
    connection
      .busy_timeout(Duration::from_secs(5))
      .map_err(|error| error.to_string())?;
    return connection
      .query_row(
        &format!("SELECT COUNT(*) FROM {}", quote_identifier(table)),
        [],
        |row| row.get::<_, usize>(0),
      )
      .map_err(|error| error.to_string());
  }

  fs::copy(
    target,
    backup_dir.join(format!("{}-knapsack.sqlite", table)),
  )
  .map_err(|error| format!("Could not back up existing browser {table}: {error}"))?;
  let mut connection = Connection::open(target).map_err(|error| error.to_string())?;
  connection
    .busy_timeout(Duration::from_secs(5))
    .map_err(|error| error.to_string())?;
  connection
    .execute(
      "ATTACH DATABASE ?1 AS imported",
      [snapshot.to_string_lossy().as_ref()],
    )
    .map_err(|error| error.to_string())?;
  let target_columns = table_columns(&connection, "main", table)?;
  let imported_columns = table_columns(&connection, "imported", table)?;
  let columns: Vec<String> = target_columns
    .into_iter()
    // Chromium allocates these row ids independently in every profile. Let the
    // target database allocate fresh ids so an imported row can never replace
    // an unrelated password already saved in Knapsack's browser.
    .filter(|column| column != "id" && imported_columns.contains(column))
    .collect();
  if columns.is_empty() {
    return Err(format!(
      "Chrome {table} data is not compatible with this browser version"
    ));
  }
  let quoted = columns
    .iter()
    .map(|column| quote_identifier(column))
    .collect::<Vec<_>>()
    .join(", ");
  let sql = if table == "cookies" {
    // A Chrome import is an explicit request to bring the selected profile's
    // current sessions into Knapsack. When a cookie's natural Chromium key
    // already exists, refresh it from Chrome instead of retaining a stale
    // target value. The surrogate `id` remains excluded above, so unrelated
    // rows can never be replaced merely because their ids collide.
    let assignments = columns
      .iter()
      .map(|column| {
        let quoted_column = quote_identifier(column);
        format!("{quoted_column} = excluded.{quoted_column}")
      })
      .collect::<Vec<_>>()
      .join(", ");
    format!(
      "INSERT INTO main.{table} ({quoted}) SELECT {quoted} FROM imported.{table} WHERE 1 \
       ON CONFLICT DO UPDATE SET {assignments}",
      table = quote_identifier(table),
      quoted = quoted,
      assignments = assignments,
    )
  } else {
    format!(
      "INSERT OR IGNORE INTO main.{table} ({quoted}) SELECT {quoted} FROM imported.{table}",
      table = quote_identifier(table),
      quoted = quoted,
    )
  };
  let transaction = connection
    .transaction()
    .map_err(|error| error.to_string())?;
  let imported = transaction
    .execute(&sql, [])
    .map_err(|error| error.to_string())?;
  transaction.commit().map_err(|error| error.to_string())?;
  Ok(imported)
}

fn perform_import(
  source_root: &Path,
  target_root: &Path,
  profile_id: &str,
) -> Result<ImportMarker, ImportFailure> {
  if !is_safe_profile_id(profile_id) {
    return Err(ImportFailure::before_changes(
      "Choose a valid Chrome profile".to_string(),
    ));
  }
  let source_profile = source_root.join(profile_id);
  if !source_profile.is_dir() {
    return Err(ImportFailure::before_changes(
      "The selected Chrome profile is no longer available".to_string(),
    ));
  }
  let target_profile = target_root.join("Default");
  let now = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map_err(|error| ImportFailure::before_changes(error.to_string()))?;
  let imported_at = chrono::Utc::now().to_rfc3339();
  let backup_dir = target_root
    .join("import-backups")
    .join(format!("{}", now.as_millis()));
  let passwords_imported = merge_table(
    &source_profile.join("Login Data"),
    &target_profile.join("Login Data"),
    "logins",
    &backup_dir,
  )
  .map_err(ImportFailure::before_changes)?;
  let (source_cookies, target_cookies) =
    import_cookie_database_paths(&source_profile, &target_profile);
  let cookies_imported = merge_table(
    &source_cookies,
    &target_cookies,
    "cookies",
    &backup_dir,
  )
  .map_err(|message| ImportFailure {
    message: if passwords_imported > 0 {
      format!(
        "Imported {passwords_imported} saved passwords, but cookies could not be imported: {message}"
      )
    } else {
      message
    },
    passwords_imported,
    cookies_imported: 0,
  })?;
  if passwords_imported == 0 && cookies_imported == 0 {
    return Err(ImportFailure::before_changes(
      "No saved passwords or cookies were found in that Chrome profile".to_string(),
    ));
  }
  let marker = ImportMarker {
    profile_id: profile_id.to_string(),
    imported_at,
    passwords_imported,
    cookies_imported,
  };
  fs::write(
    marker_path(target_root),
    serde_json::to_vec_pretty(&marker).map_err(|error| ImportFailure {
      message: error.to_string(),
      passwords_imported,
      cookies_imported,
    })?,
  )
  .map_err(|error| ImportFailure {
    message: format!("Chrome data imported, but completion could not be saved: {error}"),
    passwords_imported,
    cookies_imported,
  })?;
  Ok(marker)
}

#[get("/api/clawd/browser/import/chrome")]
pub async fn chrome_import_status(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  let target_root = browser::openclaw_user_data_dir(&app_handle);
  let imported_at = read_marker(&target_root).map(|marker| marker.imported_at);
  let Some(root) = chrome_user_data_dir() else {
    return HttpResponse::Ok().json(ChromeImportStatus {
      available: false,
      supported: false,
      profiles: Vec::new(),
      imported_at,
      message: Some("Chrome import is not supported on this platform yet".to_string()),
    });
  };
  if google_chrome_executable().is_none() {
    return HttpResponse::Ok().json(ChromeImportStatus {
      available: false,
      supported: false,
      profiles: Vec::new(),
      imported_at,
      message: Some("Google Chrome is not installed".to_string()),
    });
  }
  let profiles = chrome_profiles(&root);
  HttpResponse::Ok().json(ChromeImportStatus {
    available: !profiles.is_empty(),
    supported: true,
    profiles,
    imported_at,
    message: if root.is_dir() {
      None
    } else {
      Some("Google Chrome is not installed".to_string())
    },
  })
}

#[post("/api/clawd/browser/import/chrome")]
pub async fn import_chrome_data(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<ChromeImportRequest>,
) -> impl Responder {
  let Some(source_root) = chrome_user_data_dir() else {
    return HttpResponse::NotImplemented().json(ChromeImportResponse {
      success: false,
      passwords_imported: 0,
      cookies_imported: 0,
      imported_at: None,
      message: "Chrome import is not supported on this platform yet".to_string(),
    });
  };
  let Some(chrome_executable) = google_chrome_executable() else {
    return HttpResponse::NotImplemented().json(ChromeImportResponse {
      success: false,
      passwords_imported: 0,
      cookies_imported: 0,
      imported_at: None,
      message: "Google Chrome is not installed".to_string(),
    });
  };
  if let Err(message) = pin_managed_browser_to_google_chrome(
    &browser::browser_config_path(&app_handle),
    &chrome_executable,
  ) {
    return HttpResponse::BadRequest().json(ChromeImportResponse {
      success: false,
      passwords_imported: 0,
      cookies_imported: 0,
      imported_at: None,
      message,
    });
  }
  let target_root = browser::openclaw_user_data_dir(&app_handle);
  let managed_user_data_dir = target_root.clone();
  let embedded = browser::read_embedded_browser_preference(&app_handle);
  let profile_id = payload.profile_id.clone();
  let profile_query = serde_json::json!({"profile": "openclaw"});
  let _ =
    gateway_client::browser_request("POST", "/stop", Some(profile_query.clone()), None, None).await;
  let _ = web::block(move || service::force_stop_managed_browser(&managed_user_data_dir)).await;
  tokio::time::sleep(Duration::from_millis(150)).await;

  let import_result =
    web::block(move || perform_import(&source_root, &target_root, &profile_id)).await;
  let start_query = serde_json::json!({"profile": "openclaw", "headless": embedded});
  let restart_result =
    gateway_client::browser_request("POST", "/start", Some(start_query), None, None).await;

  match import_result {
    Ok(Ok(marker)) => {
      let restart_note = if restart_result.is_err() {
        " The shared browser is still restarting; reopen the panel in a moment."
      } else {
        ""
      };
      HttpResponse::Ok().json(ChromeImportResponse {
        success: true,
        passwords_imported: marker.passwords_imported,
        cookies_imported: marker.cookies_imported,
        imported_at: Some(marker.imported_at),
        message: format!(
          "Imported {} saved passwords and {} cookies from Chrome.{}",
          marker.passwords_imported, marker.cookies_imported, restart_note
        ),
      })
    }
    Ok(Err(failure)) => HttpResponse::BadRequest().json(ChromeImportResponse {
      success: false,
      passwords_imported: failure.passwords_imported,
      cookies_imported: failure.cookies_imported,
      imported_at: None,
      message: if failure
        .message
        .to_ascii_lowercase()
        .contains("database is locked")
      {
        if failure.passwords_imported > 0 {
          format!(
            "Imported {} saved passwords, but the cookie database is still locked. Wait a moment, then import again to finish.",
            failure.passwords_imported
          )
        } else {
          "The built-in browser is still saving data. Wait a moment, then try the import again."
            .to_string()
        }
      } else {
        failure.message
      },
    }),
    Err(error) => HttpResponse::InternalServerError().json(ChromeImportResponse {
      success: false,
      passwords_imported: 0,
      cookies_imported: 0,
      imported_at: None,
      message: format!("Chrome import failed: {error}"),
    }),
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn accepts_only_real_chrome_profile_directory_names() {
    assert!(is_safe_profile_id("Default"));
    assert!(is_safe_profile_id("Profile 12"));
    assert!(!is_safe_profile_id("../Default"));
    assert!(!is_safe_profile_id("Guest Profile"));
  }

  #[test]
  fn supports_both_chrome_cookie_database_layouts() {
    let temp = tempfile::tempdir().unwrap();
    let legacy = temp.path().join("Cookies");
    fs::write(&legacy, []).unwrap();
    assert_eq!(cookie_database(temp.path()), legacy);

    let network = temp.path().join("Network").join("Cookies");
    fs::create_dir_all(network.parent().unwrap()).unwrap();
    fs::write(&network, []).unwrap();
    assert_eq!(cookie_database(temp.path()), network);
  }

  #[test]
  fn pins_the_managed_browser_to_google_chrome_without_losing_browser_settings() {
    let temp = tempfile::tempdir().unwrap();
    let config_path = temp.path().join("openclaw.json");
    fs::write(
      &config_path,
      serde_json::to_vec_pretty(&serde_json::json!({
        "browser": {
          "headless": true,
          "executablePath": "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
          "profiles": {
            "openclaw": {
              "executablePath": "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
              "color": "#CC4B4B"
            }
          }
        },
        "agents": {"defaults": {"model": "google/gemini-2.5-flash"}}
      }))
      .unwrap(),
    )
    .unwrap();
    let chrome = Path::new("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");

    pin_managed_browser_to_google_chrome(&config_path, chrome).unwrap();

    let config: JsonValue =
      serde_json::from_slice(&fs::read(&config_path).unwrap()).unwrap();
    assert_eq!(
      config.pointer("/browser/executablePath").and_then(JsonValue::as_str),
      chrome.to_str()
    );
    assert_eq!(
      config.pointer("/browser/headless").and_then(JsonValue::as_bool),
      Some(true)
    );
    assert_eq!(
      config
        .pointer("/browser/profiles/openclaw/executablePath")
        .and_then(JsonValue::as_str),
      chrome.to_str()
    );
    assert_eq!(
      config
        .pointer("/browser/profiles/openclaw/color")
        .and_then(JsonValue::as_str),
      Some("#CC4B4B")
    );
    assert_eq!(
      config.pointer("/agents/defaults/model").and_then(JsonValue::as_str),
      Some("google/gemini-2.5-flash")
    );
  }

  #[test]
  fn preserves_modern_cookie_layout_for_a_fresh_target_profile() {
    let temp = tempfile::tempdir().unwrap();
    let source_profile = temp.path().join("chrome/Default");
    let target_profile = temp.path().join("knapsack/Default");
    let source_network = source_profile.join("Network/Cookies");
    fs::create_dir_all(source_network.parent().unwrap()).unwrap();
    fs::write(&source_network, []).unwrap();

    let (source, target) = import_cookie_database_paths(&source_profile, &target_profile);
    assert_eq!(source, source_network);
    assert_eq!(target, target_profile.join("Network/Cookies"));
  }

  #[test]
  fn remaps_source_ids_without_discarding_existing_rows() {
    let temp = tempfile::tempdir().unwrap();
    let source = temp.path().join("source.sqlite");
    let target = temp.path().join("target.sqlite");
    let source_db = Connection::open(&source).unwrap();
    source_db
      .execute(
        "CREATE TABLE logins (id INTEGER PRIMARY KEY, username TEXT, extra TEXT)",
        [],
      )
      .unwrap();
    source_db
      .execute(
        "INSERT INTO logins VALUES (1, 'chrome', 'ignored by old target')",
        [],
      )
      .unwrap();
    drop(source_db);
    let target_db = Connection::open(&target).unwrap();
    target_db
      .execute(
        "CREATE TABLE logins (id INTEGER PRIMARY KEY, username TEXT)",
        [],
      )
      .unwrap();
    target_db
      .execute("INSERT INTO logins VALUES (1, 'knapsack')", [])
      .unwrap();
    drop(target_db);

    let imported = merge_table(&source, &target, "logins", &temp.path().join("backup")).unwrap();
    assert_eq!(imported, 1);
    let merged = Connection::open(&target).unwrap();
    let count: usize = merged
      .query_row("SELECT COUNT(*) FROM logins", [], |row| row.get(0))
      .unwrap();
    assert_eq!(count, 2);
    let original: String = merged
      .query_row("SELECT username FROM logins WHERE id = 1", [], |row| {
        row.get(0)
      })
      .unwrap();
    assert_eq!(original, "knapsack");
    let imported_id: usize = merged
      .query_row(
        "SELECT id FROM logins WHERE username = 'chrome'",
        [],
        |row| row.get(0),
      )
      .unwrap();
    assert_ne!(imported_id, 1);
  }

  #[test]
  fn refreshes_existing_cookies_without_reusing_source_ids() {
    let temp = tempfile::tempdir().unwrap();
    let source = temp.path().join("source.sqlite");
    let target = temp.path().join("target.sqlite");
    let schema = "CREATE TABLE cookies (\
      id INTEGER PRIMARY KEY, \
      host_key TEXT, \
      name TEXT, \
      path TEXT, \
      value TEXT, \
      expires_utc INTEGER, \
      UNIQUE(host_key, name, path)\
    )";
    let source_db = Connection::open(&source).unwrap();
    source_db.execute(schema, []).unwrap();
    source_db
      .execute(
        "INSERT INTO cookies VALUES (1, '.example.com', 'session', '/', 'fresh', 200)",
        [],
      )
      .unwrap();
    source_db
      .execute(
        "INSERT INTO cookies VALUES (2, '.example.com', 'new', '/', 'added', 300)",
        [],
      )
      .unwrap();
    drop(source_db);

    let target_db = Connection::open(&target).unwrap();
    target_db.execute(schema, []).unwrap();
    target_db
      .execute(
        "INSERT INTO cookies VALUES (7, '.example.com', 'session', '/', 'stale', 100)",
        [],
      )
      .unwrap();
    drop(target_db);

    let imported = merge_table(&source, &target, "cookies", &temp.path().join("backup")).unwrap();
    assert_eq!(imported, 2);
    let merged = Connection::open(&target).unwrap();
    let refreshed: (usize, String, usize) = merged
      .query_row(
        "SELECT id, value, expires_utc FROM cookies WHERE name = 'session'",
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
      )
      .unwrap();
    assert_eq!(refreshed, (7, "fresh".to_string(), 200));
    let added_id: usize = merged
      .query_row("SELECT id FROM cookies WHERE name = 'new'", [], |row| {
        row.get(0)
      })
      .unwrap();
    assert_ne!(added_id, 2);
  }

  #[test]
  fn creates_a_valid_snapshot_while_a_wal_database_is_open() {
    let temp = tempfile::tempdir().unwrap();
    let source = temp.path().join("live.sqlite");
    let snapshot = temp.path().join("snapshot.sqlite");
    let source_db = Connection::open(&source).unwrap();
    source_db
      .pragma_update(None, "journal_mode", "WAL")
      .unwrap();
    source_db
      .execute(
        "CREATE TABLE cookies (id INTEGER PRIMARY KEY, value TEXT)",
        [],
      )
      .unwrap();
    source_db
      .execute("INSERT INTO cookies VALUES (1, 'available')", [])
      .unwrap();

    copy_validated_database_snapshot(&source, &snapshot).unwrap();
    let copied = Connection::open(&snapshot).unwrap();
    let count: usize = copied
      .query_row("SELECT COUNT(*) FROM cookies", [], |row| row.get(0))
      .unwrap();
    assert_eq!(count, 1);
  }

  #[test]
  fn reports_passwords_imported_before_a_cookie_failure() {
    let temp = tempfile::tempdir().unwrap();
    let source_root = temp.path().join("chrome");
    let source_profile = source_root.join("Default");
    let target_root = temp.path().join("knapsack");
    fs::create_dir_all(source_profile.join("Network")).unwrap();

    let login_db = Connection::open(source_profile.join("Login Data")).unwrap();
    login_db
      .execute(
        "CREATE TABLE logins (id INTEGER PRIMARY KEY, username TEXT UNIQUE)",
        [],
      )
      .unwrap();
    login_db
      .execute("INSERT INTO logins VALUES (1, 'imported')", [])
      .unwrap();
    drop(login_db);

    let cookie_db = Connection::open(source_profile.join("Network/Cookies")).unwrap();
    cookie_db
      .execute("CREATE TABLE not_cookies (value TEXT)", [])
      .unwrap();
    drop(cookie_db);

    let failure = perform_import(&source_root, &target_root, "Default").unwrap_err();
    assert_eq!(failure.passwords_imported, 1);
    assert_eq!(failure.cookies_imported, 0);
    assert!(failure.message.contains("Imported 1 saved passwords"));
    assert!(target_root.join("Default/Login Data").is_file());
  }
}
