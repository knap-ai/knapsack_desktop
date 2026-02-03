#[derive(Debug, Clone, Copy, PartialEq)]
pub enum OS {
  MACOS,
  WINDOWS,
}

pub fn get_os() -> OS {
  if cfg!(target_os = "macos") {
    OS::MACOS
  } else if cfg!(target_os = "windows") {
    OS::WINDOWS
  } else {
    OS::MACOS
  }
}
