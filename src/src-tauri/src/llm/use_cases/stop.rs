use crate::server::actix::InferenceThreads;
use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc,
};
use tokio::sync::Mutex;

pub async fn handle_stop_llm_execution(
  data: &InferenceThreads,
  is_chatting: &Arc<Mutex<AtomicBool>>,
) {
  let mut threads = data.lock().await;
  while let Some(thread) = threads.pop() {
    thread
      .abort_flag
      .write()
      .unwrap()
      .store(true, Ordering::Relaxed);
  }
  is_chatting.lock().await.store(false, Ordering::Relaxed);
}
