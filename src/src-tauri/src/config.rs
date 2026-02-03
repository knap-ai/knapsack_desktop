use std::path::PathBuf;
use tokio::sync::RwLock;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref CONFIG: RwLock<KnapsackConfig> = RwLock::new(KnapsackConfig::default());
}

#[derive(Debug, Default)]
pub struct KnapsackConfig {
  pub data_dir: PathBuf,
  pub was_initialized: bool,
}

pub async fn init_knapsack_config(data_dir: PathBuf) {
  let mut config = CONFIG.write().await;
  config.data_dir = data_dir;
}
