use crate::db::models::document::Document;

#[derive(Debug, Clone)]
pub struct CompletionArgs {
  pub user_email: String,
  pub user_name: String,
  pub prompt: String,
  pub documents: Vec<Document>,
  pub is_local: bool,
  pub one_shot: bool,
  pub seed: Option<u32>,
  pub frequency_penalty: f32,
  pub context_hint: Option<u32>,
}

impl Default for CompletionArgs {
  fn default() -> Self {
    Self {
      user_email: "".to_string(),
      user_name: "".to_string(),
      prompt: "".to_string(),
      documents: Vec::new(),
      is_local: true,
      one_shot: false,
      seed: None,
      frequency_penalty: 0.0,
      context_hint: None,
    }
  }
}
