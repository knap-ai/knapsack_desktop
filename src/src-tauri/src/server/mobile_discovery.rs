#[cfg(target_os = "macos")]
use std::process::{Child, Command, Stdio};

#[cfg(target_os = "macos")]
pub struct MobileDiscoveryGuard {
  child: Child,
}

#[cfg(target_os = "macos")]
impl Drop for MobileDiscoveryGuard {
  fn drop(&mut self) {
    let _ = self.child.kill();
    let _ = self.child.wait();
  }
}

#[cfg(target_os = "macos")]
pub fn start_mobile_discovery_service(port: u16, service_name: &str) -> Option<MobileDiscoveryGuard> {
  let child = Command::new("dns-sd")
    .args([
      "-R",
      service_name,
      "_knapsack-mobile._tcp",
      "local.",
      &port.to_string(),
      "txtvers=1",
      "service=knapsack-mobile",
    ])
    .stdin(Stdio::null())
    .stdout(Stdio::null())
    .stderr(Stdio::null())
    .spawn()
    .map_err(|err| {
      log::warn!("Failed to start Knapsack mobile discovery service: {err}");
      err
    })
    .ok()?;

  log::info!(
    "Started Knapsack mobile discovery service for {service_name} on port {port}"
  );

  Some(MobileDiscoveryGuard { child })
}

#[cfg(not(target_os = "macos"))]
pub struct MobileDiscoveryGuard;

#[cfg(not(target_os = "macos"))]
pub fn start_mobile_discovery_service(
  _port: u16,
  _service_name: &str,
) -> Option<MobileDiscoveryGuard> {
  None
}
