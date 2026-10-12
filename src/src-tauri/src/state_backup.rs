//! Account continuity is dormant in released builds. No runtime flag can enable it.
#[cfg(feature = "experimental-account-continuity")]
#[path = "state_backup_experimental.rs"]
mod implementation;
#[cfg(feature = "experimental-account-continuity")]
pub(crate) use implementation::*;
#[cfg(not(feature = "experimental-account-continuity"))]
#[path = "state_backup_disabled.rs"]
mod disabled;
#[cfg(not(feature = "experimental-account-continuity"))]
pub(crate) use disabled::*;
