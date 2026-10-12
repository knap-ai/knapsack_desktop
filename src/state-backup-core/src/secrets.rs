use crate::{Error, Result};
use regex::Regex;
use std::sync::OnceLock;

/// Deliberately conservative defense in depth, not a promise to identify every
/// possible secret. Eligible notes must still be a user-controlled approved tree.
pub(crate) fn check(content: &str) -> Result<()> {
  static PATTERNS: OnceLock<Vec<Regex>> = OnceLock::new();
  let patterns = PATTERNS.get_or_init(|| [
        r"(?i)-----BEGIN (?:[A-Z0-9 ]* )?PRIVATE KEY-----",
        r"\b(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{12,}|AKIA[A-Z0-9]{16}|ASIA[A-Z0-9]{16}|AIza[A-Za-z0-9_-]{30,})\b",
        r#"(?i)\b(?:api[ _-]?key|access[ _-]?token|refresh[ _-]?token|client[ _-]?secret|private[ _-]?key|password|passwd|authorization|secret[ _-]?key|aws_secret_access_key)\s*[\"']?\s*[:=]\s*[\"']?\S+"#,
        r"(?i)\bbearer\s+[A-Za-z0-9._~+/-]{12,}",
        r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b",
        r"(?i)\b[a-z][a-z0-9+.-]*://[^\s/:@]+:[^\s/@]+@",
    ].iter().map(|pattern| Regex::new(pattern).expect("fixed credential detector regex")).collect());
  if patterns.iter().any(|re| re.is_match(content)) {
    Err(Error::SecretDetected)
  } else {
    Ok(())
  }
}
