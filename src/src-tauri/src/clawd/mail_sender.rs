//! Explicit user-reviewed composed mail provider. Never infer a fallback provider.
#[derive(Debug,PartialEq)]
pub(crate) enum Provider { Gmail, Outlook }
impl Provider {
  pub(crate) fn parse(value:Option<&str>)->Result<Self,String>{match value { None|Some("gmail")=>Ok(Self::Gmail),Some("outlook")=>Ok(Self::Outlook),_=>Err("Unsupported mail provider; your draft is preserved.".into()) }}
}
#[cfg(test)] mod tests {use super::*;#[test] fn explicit_outlook_is_never_gmail(){assert_eq!(Provider::parse(Some("outlook")).unwrap(),Provider::Outlook);assert_eq!(Provider::parse(Some("gmail")).unwrap(),Provider::Gmail);assert_eq!(Provider::parse(None).unwrap(),Provider::Gmail);assert!(Provider::parse(Some("unknown")).is_err());}}

pub(crate) fn mailbox_matches(owner:&str,alias:&str,selected:&str)->bool { let actual=if alias.trim().is_empty(){owner}else{alias}; !selected.trim().is_empty() && actual.trim().eq_ignore_ascii_case(selected.trim()) }
#[cfg(test)] mod mailbox_tests {use super::*;#[test] fn mailbox_selection_is_explicit(){assert!(mailbox_matches("owner@example.invalid","","OWNER@example.invalid"));assert!(mailbox_matches("owner@example.invalid","secondary@example.invalid","secondary@example.invalid"));assert!(!mailbox_matches("owner@example.invalid","secondary@example.invalid","owner@example.invalid"));assert!(!mailbox_matches("owner@example.invalid","","foreign@example.invalid"));}}
