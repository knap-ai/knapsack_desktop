use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Write;
use std::path::{Component, Path, PathBuf};

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
enum PrivilegedOperation {
  #[serde(rename = "write_text_file")]
  WriteTextFile {
    relative_path: String,
    content: String,
    content_sha256: String,
  },
  #[serde(rename = "run_command_template")]
  RunCommandTemplate {
    template_id: String,
    arguments: std::collections::BTreeMap<String, String>,
  },
}

#[derive(Debug, Deserialize)]
struct AuthorizationResponse {
  job_id: String,
  operation: PrivilegedOperation,
  operation_hash: String,
}

#[derive(Debug, Serialize)]
struct AuthorizationRequest<'a> {
  device_id: &'a str,
  capability_token: &'a str,
}

#[derive(Debug, Serialize)]
struct CompletionRequest<'a> {
  device_id: &'a str,
  capability_token: &'a str,
  outcome: &'a str,
  result_sha256: &'a str,
  summary: &'a str,
}

#[derive(Debug, Serialize)]
pub struct PrivilegedExecutionResult {
  pub job_id: String,
  pub outcome: String,
  pub output_path: Option<String>,
  pub result_sha256: String,
  pub summary: String,
}

fn sha256_hex(value: &[u8]) -> String {
  let digest = Sha256::digest(value);
  digest.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn trusted_server_url() -> Result<&'static str, String> {
  let server_url = option_env!("VITE_KN_API_SERVER").unwrap_or("https://api.knapsack.ai");
  let parsed = reqwest::Url::parse(server_url)
    .map_err(|error| format!("Configured Studio URL is invalid: {error}"))?;
  let allowed_scheme = parsed.scheme() == "https"
    || (cfg!(debug_assertions)
      && parsed.scheme() == "http"
      && matches!(parsed.host_str(), Some("localhost" | "127.0.0.1" | "::1")));
  if !allowed_scheme
    || !parsed.username().is_empty()
    || parsed.password().is_some()
    || parsed.path() != "/"
    || parsed.query().is_some()
    || parsed.fragment().is_some()
  {
    return Err("Configured Studio URL is not an allowed trusted origin".to_string());
  }
  Ok(server_url.trim_end_matches('/'))
}

fn canonicalize_json(value: &Value) -> Value {
  match value {
    Value::Object(map) => {
      let sorted = map
        .iter()
        .map(|(key, value)| (key.clone(), canonicalize_json(value)))
        .collect();
      Value::Object(sorted)
    }
    Value::Array(items) => Value::Array(items.iter().map(canonicalize_json).collect()),
    _ => value.clone(),
  }
}

fn operation_hash(operation: &PrivilegedOperation) -> Result<String, String> {
  let value = serde_json::to_value(operation)
    .map_err(|error| format!("Unable to serialize authorized operation: {error}"))?;
  let canonical = serde_json::to_vec(&canonicalize_json(&value))
    .map_err(|error| format!("Unable to canonicalize authorized operation: {error}"))?;
  Ok(sha256_hex(&canonical))
}

impl Serialize for PrivilegedOperation {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::Serializer,
  {
    match self {
      Self::WriteTextFile {
        relative_path,
        content,
        content_sha256,
      } => {
        #[derive(Serialize)]
        struct Operation<'a> {
          #[serde(rename = "type")]
          operation_type: &'static str,
          relative_path: &'a str,
          content: &'a str,
          content_sha256: &'a str,
        }
        Operation {
          operation_type: "write_text_file",
          relative_path,
          content,
          content_sha256,
        }
        .serialize(serializer)
      }
      Self::RunCommandTemplate {
        template_id,
        arguments,
      } => {
        #[derive(Serialize)]
        struct Operation<'a> {
          #[serde(rename = "type")]
          operation_type: &'static str,
          template_id: &'a str,
          arguments: &'a std::collections::BTreeMap<String, String>,
        }
        Operation {
          operation_type: "run_command_template",
          template_id,
          arguments,
        }
        .serialize(serializer)
      }
    }
  }
}

fn safe_relative_path(value: &str) -> Result<PathBuf, String> {
  let candidate = Path::new(value);
  if candidate.as_os_str().is_empty() || candidate.is_absolute() {
    return Err("Authorized output path must be relative".to_string());
  }
  let mut safe = PathBuf::new();
  for component in candidate.components() {
    match component {
      Component::Normal(part) => safe.push(part),
      _ => return Err("Authorized output path contains an unsafe component".to_string()),
    }
  }
  Ok(safe)
}

fn ensure_safe_parent(root: &Path, relative_path: &Path) -> Result<PathBuf, String> {
  fs::create_dir_all(root)
    .map_err(|error| format!("Unable to create privileged worker root: {error}"))?;
  let canonical_root = root
    .canonicalize()
    .map_err(|error| format!("Unable to resolve privileged worker root: {error}"))?;
  let parent = relative_path.parent().unwrap_or_else(|| Path::new(""));
  let mut current = canonical_root.clone();
  for component in parent.components() {
    let Component::Normal(part) = component else {
      return Err("Authorized output path contains an unsafe parent".to_string());
    };
    current.push(part);
    if current.exists() {
      let metadata = fs::symlink_metadata(&current)
        .map_err(|error| format!("Unable to inspect output directory: {error}"))?;
      if metadata.file_type().is_symlink() || !metadata.is_dir() {
        return Err("Authorized output parent cannot be a symlink or file".to_string());
      }
    } else {
      fs::create_dir(&current)
        .map_err(|error| format!("Unable to create output directory: {error}"))?;
    }
  }
  let canonical_parent = current
    .canonicalize()
    .map_err(|error| format!("Unable to resolve output directory: {error}"))?;
  if !canonical_parent.starts_with(&canonical_root) {
    return Err("Authorized output escaped the privileged worker root".to_string());
  }
  Ok(
    canonical_parent.join(
      relative_path
        .file_name()
        .ok_or("Output filename is missing")?,
    ),
  )
}

fn execute_operation(
  operation: &PrivilegedOperation,
  worker_root: &Path,
) -> Result<(Option<String>, String, String), String> {
  match operation {
    PrivilegedOperation::WriteTextFile {
      relative_path,
      content,
      content_sha256,
    } => {
      let actual_hash = sha256_hex(content.as_bytes());
      if &actual_hash != content_sha256 {
        return Err("Authorized file content hash does not match the payload".to_string());
      }
      let relative = safe_relative_path(relative_path)?;
      let destination = ensure_safe_parent(worker_root, &relative)?;
      if destination.exists() {
        let metadata = fs::symlink_metadata(&destination)
          .map_err(|error| format!("Unable to inspect output file: {error}"))?;
        if metadata.file_type().is_symlink() {
          return Err("Authorized output cannot replace a symlink".to_string());
        }
      }
      let temporary = destination.with_extension(format!(
        "{}.{}.knapsack-tmp",
        destination
          .extension()
          .and_then(|value| value.to_str())
          .unwrap_or("file"),
        uuid::Uuid::new_v4()
      ));
      let mut output = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&temporary)
        .map_err(|error| format!("Unable to create approved output: {error}"))?;
      output
        .write_all(content.as_bytes())
        .map_err(|error| format!("Unable to write approved output: {error}"))?;
      output
        .sync_all()
        .map_err(|error| format!("Unable to sync approved output: {error}"))?;
      fs::rename(&temporary, &destination)
        .map_err(|error| format!("Unable to finalize approved output: {error}"))?;
      Ok((
        Some(destination.to_string_lossy().into_owned()),
        actual_hash,
        format!("Wrote approved file {}", relative.display()),
      ))
    }
    PrivilegedOperation::RunCommandTemplate { template_id, .. } => Err(format!(
      "Command template '{template_id}' is not registered; arbitrary shell execution is disabled"
    )),
  }
}

async fn post_completion(
  client: &reqwest::Client,
  server_url: &str,
  access_token: &str,
  job_id: &str,
  request: &CompletionRequest<'_>,
) -> Result<(), String> {
  let response = client
    .post(format!(
      "{}/api/scout/privileged-jobs/{}/complete",
      server_url.trim_end_matches('/'),
      job_id
    ))
    .bearer_auth(access_token)
    .json(request)
    .send()
    .await
    .map_err(|error| format!("Unable to report privileged job result: {error}"))?;
  if !response.status().is_success() {
    return Err(format!(
      "Studio rejected privileged job completion with status {}",
      response.status()
    ));
  }
  Ok(())
}

#[tauri::command]
pub async fn kn_execute_privileged_job(
  app: tauri::AppHandle,
  access_token: String,
  job_id: String,
  device_id: String,
  capability_token: String,
) -> Result<PrivilegedExecutionResult, String> {
  uuid::Uuid::parse_str(&job_id).map_err(|_| "Privileged job ID must be a UUID".to_string())?;
  let server_url = trusted_server_url()?;
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(30))
    .build()
    .map_err(|error| format!("Unable to create privileged worker client: {error}"))?;
  let authorization = client
    .post(format!(
      "{}/api/scout/privileged-jobs/{}/authorize",
      server_url.trim_end_matches('/'),
      job_id
    ))
    .bearer_auth(&access_token)
    .json(&AuthorizationRequest {
      device_id: &device_id,
      capability_token: &capability_token,
    })
    .send()
    .await
    .map_err(|error| format!("Unable to authorize privileged job: {error}"))?;
  if !authorization.status().is_success() {
    return Err(format!(
      "Studio denied privileged job authorization with status {}",
      authorization.status()
    ));
  }
  let authorization: AuthorizationResponse = authorization
    .json()
    .await
    .map_err(|error| format!("Studio returned an invalid privileged job: {error}"))?;
  if authorization.job_id != job_id
    || operation_hash(&authorization.operation)? != authorization.operation_hash
  {
    return Err("Studio authorization operation hash mismatch".to_string());
  }

  let worker_root = app
    .path_resolver()
    .app_data_dir()
    .ok_or("Unable to locate the Knapsack application data directory")?
    .join("privileged-worker")
    .join(&job_id);
  let execution = execute_operation(&authorization.operation, &worker_root);
  let (outcome, output_path, result_sha256, summary) = match execution {
    Ok((path, hash, summary)) => ("succeeded", path, hash, summary),
    Err(error) => ("failed", None, sha256_hex(error.as_bytes()), error),
  };
  post_completion(
    &client,
    server_url,
    &access_token,
    &job_id,
    &CompletionRequest {
      device_id: &device_id,
      capability_token: &capability_token,
      outcome,
      result_sha256: &result_sha256,
      summary: &summary,
    },
  )
  .await?;

  Ok(PrivilegedExecutionResult {
    job_id,
    outcome: outcome.to_string(),
    output_path,
    result_sha256,
    summary,
  })
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn rejects_path_traversal_and_absolute_paths() {
    assert!(safe_relative_path("../MEMORY.md").is_err());
    assert!(safe_relative_path("/etc/hosts").is_err());
    assert!(safe_relative_path("reports/summary.md").is_ok());
  }

  #[test]
  fn writes_only_inside_dedicated_worker_root() {
    let root = tempfile::tempdir().unwrap();
    let content = "approved report";
    let operation = PrivilegedOperation::WriteTextFile {
      relative_path: "reports/summary.txt".to_string(),
      content: content.to_string(),
      content_sha256: sha256_hex(content.as_bytes()),
    };
    let (path, hash, _) = execute_operation(&operation, root.path()).unwrap();
    let path = PathBuf::from(path.unwrap());
    assert!(path.starts_with(root.path().canonicalize().unwrap()));
    assert_eq!(fs::read_to_string(path).unwrap(), content);
    assert_eq!(hash, sha256_hex(content.as_bytes()));
  }

  #[test]
  fn arbitrary_shell_templates_fail_closed() {
    let operation = PrivilegedOperation::RunCommandTemplate {
      template_id: "anything".to_string(),
      arguments: std::collections::BTreeMap::new(),
    };
    let root = tempfile::tempdir().unwrap();
    assert!(execute_operation(&operation, root.path())
      .unwrap_err()
      .contains("arbitrary shell execution is disabled"));
  }
}
