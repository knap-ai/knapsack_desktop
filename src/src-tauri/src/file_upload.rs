use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
struct FileConfig {
  file_locations: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct ConnectorConfig {
  name: String,
  source: String,
  input_type: String,
  connector_specific_config: FileConfig,
  refresh_freq: Option<u32>,
  disabled: bool,
}

#[derive(Serialize, Deserialize)]
struct CredentialConfig {
  credential_json: Value,
  admin_public: bool,
}

#[derive(Serialize, Deserialize)]
struct UploadFile {
  filename: String,
  file: String,
}

#[derive(Serialize, Deserialize)]
struct FileUploadPayload {
  files: Vec<UploadFile>,
}
