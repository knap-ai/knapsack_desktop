use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserInfo {
  pub email: Option<String>
}

impl Default for UserInfo {
  fn default() -> Self {
    UserInfo {
      email: None,
    }
  }
}
