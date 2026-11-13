use std::collections::BTreeMap;

/// Only advertise Gmail capabilities that the exact native tool can execute.
/// Other service inventories are unchanged; no grants are added or moved.
pub(super) fn scope_gmail_capabilities(
  mut local: BTreeMap<String, Vec<&'static str>>,
  routable: &[String],
) -> BTreeMap<String, Vec<&'static str>> {
  local.retain(|email, services| {
    if !routable.iter().any(|allowed| allowed.eq_ignore_ascii_case(email)) {
      services.retain(|service| *service != "Gmail");
    }
    !services.is_empty()
  });
  local
}

#[derive(Clone)]
pub(super) struct MailboxIdentity { pub email: String, pub id: u64 }

pub(super) fn select_mailbox(accounts: &[MailboxIdentity], email: Option<&str>, id: Option<u64>, require_email: bool) -> Result<usize, String> {
  let email = email.map(str::trim).filter(|s| !s.is_empty());
  if (require_email || id.is_some()) && email.is_none() { return Err("Choose explicit account_email and connection_id from action accounts.".into()); }
  let matches = accounts.iter().enumerate().filter(|(_, account)| {
    email.map(|e| account.email.eq_ignore_ascii_case(e)).unwrap_or(true) && id.map(|id| account.id == id).unwrap_or(true)
  }).map(|(index, _)| index).collect::<Vec<_>>();
  match matches.as_slice() {
    [index] => Ok(*index),
    [] => Err("Requested Gmail account/grant is unavailable in this authorized scope. Refresh action accounts; no other inbox was selected.".into()),
    _ => Err("Multiple Gmail accounts or grants match. Choose exact account_email and connection_id from action accounts.".into()),
  }
}

pub(super) fn verify_mailbox_identity(actual: Option<&str>, requested: &str) -> Result<(), String> {
  if actual.map(str::trim).filter(|email| !email.is_empty()).is_some_and(|email| email.eq_ignore_ascii_case(requested.trim())) {
    Ok(())
  } else { Err("The OAuth credential does not verify the selected Gmail mailbox. No messages were read and no other inbox was selected.".into()) }
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn hides_other_profile_gmail_without_granting_or_removing_other_services() {
    let local = BTreeMap::from([
      ("personal@example.invalid".into(), vec!["Gmail", "Calendar", "Drive"]),
      ("work@example.invalid".into(), vec!["Gmail"]),
    ]);
    let scoped = scope_gmail_capabilities(local, &["WORK@example.invalid".into()]);
    assert_eq!(scoped["personal@example.invalid"], vec!["Calendar", "Drive"]);
    assert_eq!(scoped["work@example.invalid"], vec!["Gmail"]);
  }
  #[test]
  fn missing_or_failed_inventory_never_advertises_gmail() {
    let local = BTreeMap::from([("old@example.invalid".into(), vec!["Gmail"])]);
    assert!(scope_gmail_capabilities(local, &[]).is_empty());
  }
  #[test]
  fn tool_accounts_do_not_implicitly_add_new_capabilities() {
    assert!(scope_gmail_capabilities(BTreeMap::new(), &["other@example.invalid".into()]).is_empty());
  }
  #[test]
  fn preserves_multiple_accounts_routable_within_the_same_owner() {
    let local = BTreeMap::from([
      ("one@example.invalid".into(), vec!["Gmail"]),
      ("two@example.invalid".into(), vec!["Gmail", "Calendar"]),
      ("other-profile@example.invalid".into(), vec!["Gmail"]),
    ]);
    let scoped = scope_gmail_capabilities(local, &["one@example.invalid".into(), "two@example.invalid".into()]);
    assert_eq!(scoped.len(), 2);
    assert_eq!(scoped["one@example.invalid"], vec!["Gmail"]);
    assert_eq!(scoped["two@example.invalid"], vec!["Gmail", "Calendar"]);
  }
  #[test]
  fn fresh_inventory_withdraws_stale_gmail_claims_after_owner_change() {
    let saved = BTreeMap::from([
      ("old@example.invalid".into(), vec!["Gmail", "Calendar"]),
      ("current@example.invalid".into(), vec!["Gmail"]),
    ]);
    let previous = scope_gmail_capabilities(saved.clone(), &["old@example.invalid".into()]);
    assert!(previous["old@example.invalid"].contains(&"Gmail"));
    let current = scope_gmail_capabilities(saved, &["current@example.invalid".into()]);
    assert_eq!(current["old@example.invalid"], vec!["Calendar"]);
    assert_eq!(current["current@example.invalid"], vec!["Gmail"]);
    assert!(!previous.contains_key("current@example.invalid"));
  }

  #[test]
  fn selection_never_crosses_inboxes_or_replaces_stale_grants() {
    let accounts = vec![MailboxIdentity {email:"a@example.invalid".into(),id:1}, MailboxIdentity {email:"b@example.invalid".into(),id:2}];
    assert!(select_mailbox(&accounts, None, None, true).is_err());
    assert!(select_mailbox(&accounts, Some("a@example.invalid"), Some(2), true).is_err());
    assert!(select_mailbox(&accounts, Some("a@example.invalid"), Some(99), true).is_err());
    assert!(select_mailbox(&accounts, Some("absent@example.invalid"), None, true).is_err());
    assert_eq!(select_mailbox(&accounts, Some("B@example.invalid"), Some(2), true).unwrap(), 1);
    assert!(select_mailbox(&accounts[1..], Some("a@example.invalid"), Some(1), true).is_err());
  }
  #[test]
  fn duplicate_grants_require_explicit_identity() {
    let accounts = vec![MailboxIdentity {email:"a@example.invalid".into(),id:1}, MailboxIdentity {email:"a@example.invalid".into(),id:2}];
    assert!(select_mailbox(&accounts, Some("a@example.invalid"), None, true).is_err());
    assert!(select_mailbox(&accounts, None, Some(2), true).is_err());
    assert_eq!(select_mailbox(&accounts, Some("a@example.invalid"), Some(2), true).unwrap(),1);
  }

  #[test]
  fn wrong_or_missing_provider_identity_cannot_read_a_different_inbox() {
    assert!(verify_mailbox_identity(Some("B@example.invalid"), "b@example.invalid").is_ok());
    assert!(verify_mailbox_identity(Some("a@example.invalid"), "b@example.invalid").is_err());
    assert!(verify_mailbox_identity(None, "b@example.invalid").is_err());
    assert!(verify_mailbox_identity(Some(""), "b@example.invalid").is_err());
  }

}
