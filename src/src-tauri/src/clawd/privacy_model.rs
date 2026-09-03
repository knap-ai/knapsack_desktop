use actix_web::{delete, get, post, web, HttpResponse, Responder};
use futures_util::StreamExt;
use once_cell::sync::Lazy;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Mutex;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

const MODEL_ID: &str = "perplexity-ai/pplx-pii-masking";
const MODEL_REVISION: &str = "f1f90a53823f5df0a1344c1e137d9fffdaab54d6";
const VERIFIED_MARKER: &str = ".verified-revision";

struct ModelFile {
  name: &'static str,
  size: u64,
  sha256: &'static str,
}

const MODEL_FILES: &[ModelFile] = &[
  ModelFile {
    name: "config.json",
    size: 2_498,
    sha256: "c57c3d8114ef302c51a35d5eb72a35e02c3e10bd17b8401bc660be593fc46dfc",
  },
  ModelFile {
    name: "tokenizer.json",
    size: 11_422_936,
    sha256: "cae14d1c8dda080f23792355b0692b826bf1f1da3c86ebc1b37548a391cf6526",
  },
  ModelFile {
    name: "tokenizer_config.json",
    size: 398,
    sha256: "aa9c1b0a1c9b48c2f70bacdf64f7dab25194be4ffea0c6a6e4da262360a91d0a",
  },
  ModelFile {
    name: "model.safetensors",
    size: 1_192_293_777,
    sha256: "f6204155ec540c9323f706e284110ee848b462f0325dc1ece5c7263fc517bbd0",
  },
  ModelFile {
    name: "LICENSE",
    size: 1_076,
    sha256: "7fbf88e9c951fe53eb614a46772d0b48ada6d50b351e5e11dcb64b4dc3fb8eb2",
  },
];

static DOWNLOADING: AtomicBool = AtomicBool::new(false);
static DOWNLOADED_BYTES: AtomicU64 = AtomicU64::new(0);
static DOWNLOAD_ERROR: Lazy<Mutex<Option<String>>> = Lazy::new(|| Mutex::new(None));

fn total_bytes() -> u64 {
  MODEL_FILES.iter().map(|file| file.size).sum()
}

fn model_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
  app_handle
    .path_resolver()
    .app_data_dir()
    .map(|root| root.join("privacy-models").join("pplx-pii-masking"))
    .ok_or_else(|| "Could not resolve the Knapsack app-data directory".to_string())
}

fn model_is_installed(directory: &Path) -> bool {
  let marker_matches = std::fs::read_to_string(directory.join(VERIFIED_MARKER))
    .map(|revision| revision.trim() == MODEL_REVISION)
    .unwrap_or(false);
  marker_matches
    && MODEL_FILES.iter().all(|file| {
      directory
        .join(file.name)
        .metadata()
        .map(|metadata| metadata.is_file() && metadata.len() == file.size)
        .unwrap_or(false)
    })
}

#[derive(Debug, Serialize)]
pub struct PiiModelStatus {
  pub installed: bool,
  pub downloading: bool,
  pub downloaded_bytes: u64,
  pub total_bytes: u64,
  pub model_id: &'static str,
  pub revision: &'static str,
  pub error: Option<String>,
}

fn current_status(app_handle: &tauri::AppHandle) -> PiiModelStatus {
  let installed = model_dir(app_handle)
    .map(|directory| model_is_installed(&directory))
    .unwrap_or(false);
  let error = DOWNLOAD_ERROR.lock().ok().and_then(|value| value.clone());

  PiiModelStatus {
    installed,
    downloading: DOWNLOADING.load(Ordering::SeqCst),
    downloaded_bytes: if installed {
      total_bytes()
    } else {
      DOWNLOADED_BYTES.load(Ordering::SeqCst)
    },
    total_bytes: total_bytes(),
    model_id: MODEL_ID,
    revision: MODEL_REVISION,
    error,
  }
}

#[get("/api/knapsack/privacy/pii/status")]
pub async fn pii_model_status(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  HttpResponse::Ok().json(current_status(app_handle.get_ref()))
}

async fn download_file(
  client: &reqwest::Client,
  directory: &Path,
  file: &ModelFile,
) -> Result<(), String> {
  let destination = directory.join(file.name);
  if destination
    .metadata()
    .map(|metadata| metadata.is_file() && metadata.len() == file.size)
    .unwrap_or(false)
  {
    let mut existing = tokio::fs::File::open(&destination)
      .await
      .map_err(|error| format!("Could not verify {}: {}", file.name, error))?;
    let mut existing_hasher = Sha256::new();
    let mut buffer = vec![0u8; 64 * 1024];
    loop {
      let read = existing
        .read(&mut buffer)
        .await
        .map_err(|error| format!("Could not verify {}: {}", file.name, error))?;
      if read == 0 {
        break;
      }
      existing_hasher.update(&buffer[..read]);
    }
    if format!("{:x}", existing_hasher.finalize()) == file.sha256 {
      DOWNLOADED_BYTES.fetch_add(file.size, Ordering::SeqCst);
      return Ok(());
    }
    tokio::fs::remove_file(&destination)
      .await
      .map_err(|error| format!("Could not replace {}: {}", file.name, error))?;
  }

  let partial = directory.join(format!("{}.part", file.name));
  let _ = tokio::fs::remove_file(&partial).await;
  let url = format!(
    "https://huggingface.co/{}/resolve/{}/{}?download=true",
    MODEL_ID, MODEL_REVISION, file.name
  );
  let response = client
    .get(url)
    .send()
    .await
    .map_err(|error| format!("Could not download {}: {}", file.name, error))?;
  if !response.status().is_success() {
    return Err(format!(
      "Could not download {}: server returned {}",
      file.name,
      response.status()
    ));
  }

  let mut output = tokio::fs::File::create(&partial)
    .await
    .map_err(|error| format!("Could not create {}: {}", file.name, error))?;
  let mut hasher = Sha256::new();
  let mut downloaded = 0u64;
  let mut stream = response.bytes_stream();
  while let Some(chunk) = stream.next().await {
    let chunk = chunk.map_err(|error| format!("Download interrupted: {}", error))?;
    output
      .write_all(&chunk)
      .await
      .map_err(|error| format!("Could not save {}: {}", file.name, error))?;
    hasher.update(&chunk);
    downloaded += chunk.len() as u64;
    DOWNLOADED_BYTES.fetch_add(chunk.len() as u64, Ordering::SeqCst);
  }
  output
    .sync_all()
    .await
    .map_err(|error| format!("Could not finish saving {}: {}", file.name, error))?;

  if downloaded != file.size {
    let _ = tokio::fs::remove_file(&partial).await;
    return Err(format!(
      "{} was incomplete (received {} of {} bytes)",
      file.name, downloaded, file.size
    ));
  }
  let actual_hash = format!("{:x}", hasher.finalize());
  if actual_hash != file.sha256 {
    let _ = tokio::fs::remove_file(&partial).await;
    return Err(format!("{} failed its integrity check", file.name));
  }

  tokio::fs::rename(&partial, &destination)
    .await
    .map_err(|error| format!("Could not install {}: {}", file.name, error))?;
  Ok(())
}

async fn download_model(app_handle: tauri::AppHandle) -> Result<(), String> {
  let directory = model_dir(&app_handle)?;
  tokio::fs::create_dir_all(&directory)
    .await
    .map_err(|error| format!("Could not create the privacy model folder: {}", error))?;
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(60 * 30))
    .build()
    .map_err(|error| format!("Could not start the download: {}", error))?;

  DOWNLOADED_BYTES.store(0, Ordering::SeqCst);
  let _ = tokio::fs::remove_file(directory.join(VERIFIED_MARKER)).await;
  for file in MODEL_FILES {
    download_file(&client, &directory, file).await?;
  }
  tokio::fs::write(directory.join(VERIFIED_MARKER), MODEL_REVISION)
    .await
    .map_err(|error| format!("Could not finalize the privacy model install: {}", error))?;
  Ok(())
}

#[post("/api/knapsack/privacy/pii/download")]
pub async fn pii_model_download(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  if current_status(app_handle.get_ref()).installed {
    return HttpResponse::Ok().json(current_status(app_handle.get_ref()));
  }
  if DOWNLOADING
    .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
    .is_err()
  {
    return HttpResponse::Accepted().json(current_status(app_handle.get_ref()));
  }
  if let Ok(mut error) = DOWNLOAD_ERROR.lock() {
    *error = None;
  }

  let handle = app_handle.get_ref().clone();
  tauri::async_runtime::spawn(async move {
    if let Err(message) = download_model(handle).await {
      if let Ok(mut error) = DOWNLOAD_ERROR.lock() {
        *error = Some(message);
      }
    }
    DOWNLOADING.store(false, Ordering::SeqCst);
  });

  HttpResponse::Accepted().json(current_status(app_handle.get_ref()))
}

#[delete("/api/knapsack/privacy/pii/model")]
pub async fn pii_model_delete(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  if DOWNLOADING.load(Ordering::SeqCst) {
    return HttpResponse::Conflict().json(serde_json::json!({
      "success": false,
      "message": "Wait for the model download to finish before removing it."
    }));
  }

  match model_dir(app_handle.get_ref()) {
    Ok(directory) => {
      if directory.exists() {
        if let Err(error) = tokio::fs::remove_dir_all(&directory).await {
          return HttpResponse::InternalServerError().json(serde_json::json!({
            "success": false,
            "message": format!("Could not remove the privacy model: {}", error)
          }));
        }
      }
      DOWNLOADED_BYTES.store(0, Ordering::SeqCst);
      if let Ok(mut error) = DOWNLOAD_ERROR.lock() {
        *error = None;
      }
      HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "On-device PII model removed."
      }))
    }
    Err(message) => HttpResponse::InternalServerError().json(serde_json::json!({
      "success": false,
      "message": message
    })),
  }
}

#[cfg(test)]
mod tests {
  use super::{model_is_installed, total_bytes, MODEL_FILES, MODEL_REVISION, VERIFIED_MARKER};

  #[test]
  fn expected_download_size_matches_pinned_files() {
    assert_eq!(total_bytes(), 1_203_720_685);
    assert_eq!(MODEL_FILES.len(), 5);
  }

  #[test]
  fn incomplete_model_directory_is_not_installed() {
    let directory = tempfile::tempdir().unwrap();
    assert!(!model_is_installed(directory.path()));
  }

  #[test]
  fn verified_complete_model_directory_is_installed() {
    let directory = tempfile::tempdir().unwrap();
    for model_file in MODEL_FILES {
      std::fs::File::create(directory.path().join(model_file.name))
        .unwrap()
        .set_len(model_file.size)
        .unwrap();
    }
    std::fs::write(directory.path().join(VERIFIED_MARKER), MODEL_REVISION).unwrap();
    assert!(model_is_installed(directory.path()));
  }
}
