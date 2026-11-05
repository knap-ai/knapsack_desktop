//! Capture admission is separate from UI recording state and disk write time.
//! A closed capture never reopens; already-admitted samples may finish encoding.
use std::sync::{atomic::{AtomicBool, Ordering}, Arc, Mutex, MutexGuard};
use std::time::Duration;
use tokio::time::Instant;
use tokio::sync::watch;

pub struct CaptureGate {
  open: Mutex<bool>,
  running: Arc<AtomicBool>,
  stopped: watch::Sender<bool>,
}
pub struct Admission<'a> { _guard: MutexGuard<'a, bool> }
impl CaptureGate {
  pub fn new() -> Self {
    let (stopped, _) = watch::channel(false);
    Self { open: Mutex::new(true), running: Arc::new(AtomicBool::new(true)), stopped }
  }
  pub fn enter(&self) -> Option<Admission<'_>> {
    let guard = self.open.lock().unwrap();
    if !*guard { return None; }
    Some(Admission { _guard: guard })
  }
  pub fn close(&self) {
    let mut open = self.open.lock().unwrap();
    *open = false;
    self.running.store(false, Ordering::Release);
    self.stopped.send_replace(true);
  }
  pub fn running(&self) -> Arc<AtomicBool> { self.running.clone() }
  pub async fn closed(&self) {
    let mut stopped = self.stopped.subscribe();
    loop {
      if *stopped.borrow() { return; }
      if stopped.changed().await.is_err() { return; }
    }
  }
}

// Core Audio receives an opaque, never-reused integer token rather than a
// dereferenceable pointer. A late callback after teardown safely misses lookup.
pub struct CaptureContexts<T> {
  entries: Mutex<(usize, std::collections::HashMap<usize, Arc<T>>)>,
}
impl<T> CaptureContexts<T> {
  pub fn new() -> Self { Self { entries: Mutex::new((0, std::collections::HashMap::new())) } }
  pub fn insert(&self, context: Arc<T>) -> usize {
    let mut entries = self.entries.lock().unwrap();
    entries.0 = entries.0.checked_add(1).expect("capture context token exhausted");
    let token = entries.0;
    entries.1.insert(token, context);
    token
  }
  pub fn get(&self, token: usize) -> Option<Arc<T>> { self.entries.lock().unwrap().1.get(&token).cloned() }
  pub fn remove(&self, token: usize) { self.entries.lock().unwrap().1.remove(&token); }
}

pub struct CapturedChunk<T> {
  pub samples: Vec<T>,
  pub filename: String,
  pub transcript_filename: String,
}
pub struct CaptureBuffer<T> {
  base: String,
  samples: Vec<T>,
  next: u32,
  last_save: Instant,
  finished: bool,
  #[cfg(knapsack_synthetic_qa)]
  in_memory_only: bool,
}
impl<T> CaptureBuffer<T> {
  pub fn new(base: String) -> Self {
    Self { base, samples: Vec::new(), next: 0, last_save: Instant::now(), finished: false,
      #[cfg(knapsack_synthetic_qa)] in_memory_only: false }
  }
  #[cfg(knapsack_synthetic_qa)]
  pub fn synthetic_in_memory(base: String) -> Self { Self { in_memory_only: true, ..Self::new(base) } }
  pub fn pause_tick(&mut self, now: Instant) { self.last_save = now; }
  pub fn append(&mut self, _admission: &Admission<'_>, samples: Vec<T>, now: Instant, interval: Duration) -> Option<CapturedChunk<T>> {
    if self.finished { return None; }
    self.samples.extend(samples);
    // Native QA must remain in-memory even if the process is suspended longer
    // than a chunk interval. This switch does not exist in production builds.
    #[cfg(knapsack_synthetic_qa)]
    if self.in_memory_only { return None; }
    if now.duration_since(self.last_save) < interval { return None; }
    self.last_save = now;
    self.take_chunk()
  }
  fn take_chunk(&mut self) -> Option<CapturedChunk<T>> {
    if self.samples.is_empty() { return None; }
    let filename = format!("{}_{}.flac", self.base, self.next);
    self.next = self.next.checked_add(1).expect("capture chunk counter exhausted");
    Some(CapturedChunk { samples: std::mem::take(&mut self.samples), filename, transcript_filename: format!("{}.txt", self.base) })
  }
  pub fn finish(&mut self) -> Option<CapturedChunk<T>> {
    if self.finished { return None; }
    self.finished = true;
    self.take_chunk()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  #[cfg(knapsack_synthetic_qa)]
  #[test]
  fn synthetic_capture_never_emits_periodic_work_even_after_process_suspension() {
    let gate = CaptureGate::new(); let admission = gate.enter().unwrap();
    let mut buffer = CaptureBuffer::synthetic_in_memory("fictional".into());
    assert!(buffer.append(&admission, vec![1,2], Instant::now()+Duration::from_secs(3600), Duration::from_secs(30)).is_none());
    assert_eq!(buffer.finish().unwrap().samples, vec![1,2]);
    assert!(buffer.finish().is_none());
  }
  #[test]
  fn capture_stop_rejects_callbacks_and_another_start_cannot_reopen_old_capture() {
    let old = CaptureGate::new(); old.close();
    let new = CaptureGate::new();
    assert!(old.enter().is_none()); assert!(new.enter().is_some());
    assert!(!old.running().load(Ordering::Acquire));
  }
  #[test]
  fn capture_stop_waits_for_admitted_callback_and_job_registration() {
    let gate = Arc::new(CaptureGate::new());
    let admission = gate.enter().unwrap();
    let (closing, receive) = std::sync::mpsc::channel();
    let registered_jobs = Arc::new(std::sync::atomic::AtomicUsize::new(0));
    let observed_jobs = registered_jobs.clone();
    let other = gate.clone();
    let join = std::thread::spawn(move || { other.close(); closing.send(observed_jobs.load(Ordering::Acquire)).unwrap(); });
    assert!(receive.try_recv().is_err());
    // Detached encoder jobs are registered while this admission is held.
    registered_jobs.fetch_add(1, Ordering::Release);
    drop(admission);
    assert_eq!(receive.recv_timeout(Duration::from_secs(1)).unwrap(), 1); join.join().unwrap();
    assert!(gate.enter().is_none());
  }
  #[test]
  fn capture_tail_has_unique_index_and_cannot_take_another_capture_samples() {
    let gate = CaptureGate::new(); let admission = gate.enter().unwrap();
    let mut old = CaptureBuffer::new("10_input_capture-a".into());
    let first = old.append(&admission, vec![1], Instant::now(), Duration::ZERO).unwrap();
    old.append(&admission, vec![2,3], Instant::now(), Duration::from_secs(60));
    drop(admission); gate.close();
    let mut new: CaptureBuffer<i32> = CaptureBuffer::new("10_input_capture-b".into());
    let tail = old.finish().unwrap();
    assert_eq!(first.filename, "10_input_capture-a_0.flac");
    assert_eq!(tail.filename, "10_input_capture-a_1.flac"); assert_eq!(tail.samples, vec![2,3]);
    assert!(old.finish().is_none()); assert!(new.finish().is_none());
    // Encoding after close keeps the immutable capture identity and admitted data.
    assert_eq!(first.transcript_filename, "10_input_capture-a.txt"); assert_eq!(first.samples, vec![1]);
  }
  #[tokio::test]
  async fn capture_close_before_subscription_is_not_lost() {
    let gate = CaptureGate::new(); gate.close();
    tokio::time::timeout(Duration::from_millis(100), gate.closed()).await.unwrap();
  }
  #[tokio::test]
  async fn capture_close_cancels_stalled_heartbeat_instead_of_waiting_for_model() {
    let gate = Arc::new(CaptureGate::new());
    let (started, ready) = tokio::sync::oneshot::channel();
    let worker_gate = gate.clone();
    let worker = tokio::spawn(async move {
      let heartbeat = async move { started.send(()).unwrap(); std::future::pending::<()>().await };
      tokio::select! { biased; _ = worker_gate.closed() => {}, _ = heartbeat => panic!("stalled heartbeat completed") }
    });
    ready.await.unwrap();
    gate.close();
    tokio::time::timeout(Duration::from_millis(100), worker).await.unwrap().unwrap();
  }
  #[test]
  fn capture_callback_context_retirement_is_safe_for_late_and_inflight_callbacks() {
    let contexts = CaptureContexts::new();
    let old = contexts.insert(Arc::new(Mutex::new("old capture")));
    let in_flight = contexts.get(old).unwrap();
    contexts.remove(old);
    let new = contexts.insert(Arc::new(Mutex::new("new capture")));
    assert_ne!(old, new);
    assert!(contexts.get(old).is_none());
    assert_eq!(*in_flight.lock().unwrap(), "old capture");
    assert_eq!(*contexts.get(new).unwrap().lock().unwrap(), "new capture");
  }
}
