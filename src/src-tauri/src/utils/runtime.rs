//! Bound desktop infrastructure independently of host CPU count.
/// Multiple CPU-sized pools exhausted the macOS GUI process's 256-descriptor
/// limit, preventing permission checks, sockets and recording startup.
pub fn background_runtime() -> std::io::Result<tokio::runtime::Runtime> {
  tokio::runtime::Builder::new_multi_thread()
    .worker_threads(2)
    .enable_all()
    .build()
}

#[cfg(unix)]
pub fn prepare_file_limit() {
  unsafe {
    let mut limits = libc::rlimit { rlim_cur: 0, rlim_max: 0 };
    if libc::getrlimit(libc::RLIMIT_NOFILE, &mut limits) != 0 { return; }
    let desired = limits.rlim_max.min(4096);
    if limits.rlim_cur < desired {
      limits.rlim_cur = desired;
      if libc::setrlimit(libc::RLIMIT_NOFILE, &limits) != 0 {
        eprintln!("Could not increase Knapsack's file limit: {}", std::io::Error::last_os_error());
      }
    }
  }
}
#[cfg(not(unix))]
pub fn prepare_file_limit() {}

#[cfg(test)]
mod tests {
  #[test]
  fn background_pool_is_bounded() {
    let rt = super::background_runtime().unwrap();
    let threads = rt.block_on(async {
      let barrier = std::sync::Arc::new(std::sync::Barrier::new(2));
      let jobs: Vec<_> = (0..2).map(|_| {
        let barrier = barrier.clone();
        tokio::spawn(async move { barrier.wait(); std::thread::current().id() })
      }).collect();
      let mut ids = std::collections::HashSet::new();
      for job in jobs { ids.insert(job.await.unwrap()); }
      ids
    });
    assert_eq!(threads.len(), 2);
    assert_eq!(rt.block_on(async { 42 }), 42);
  }
}
