use std::path::PathBuf;
use tokio::sync::RwLock;
use once_cell::sync::Lazy;

pub static CONFIG: Lazy<RwLock<KnapsackConfig>> = Lazy::new(|| RwLock::new(KnapsackConfig::default()));

#[derive(Debug, Default)]
pub struct KnapsackConfig {
  pub data_dir: PathBuf,
  pub was_initialized: bool,
}

pub async fn init_knapsack_config(data_dir: PathBuf) {
  let mut config = CONFIG.write().await;
  config.data_dir = data_dir;
}
