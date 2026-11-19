//! Conservative local evidence extraction, never an instruction or permission.
use crate::db::models::email::Email;
#[derive(Clone, Copy, Default)]
pub struct Signals {
  pub junk: bool,
  pub promotions: bool,
  pub bulk: bool,
  pub direct_history: bool,
}
#[derive(Debug, PartialEq)]
pub enum Action {
  Reply,
  Review,
  Waiting,
}
pub struct Finding {
  pub action: Action,
  pub title: String,
  pub reason: String,
  pub confidence: f32,
  pub current: String,
}
fn current_text(body: &str) -> String {
  // Preserve plain-text boundaries: html2text collapses bare newlines.
  let html = regex::Regex::new(r"(?i)<(?:html|body|div|p|br|blockquote|table|span)(?:\s|>|/)")
    .unwrap()
    .is_match(body);
  let quoted =
    regex::Regex::new(r#"(?i)<blockquote\b|<[^>]+class=["'][^"']*(?:gmail_quote|yahoo_quoted)"#)
      .unwrap()
      .find(body)
      .map(|m| m.start())
      .unwrap_or(body.len());
  let unquoted = &body[..quoted];
  let text = if html {
    html2text::from_read(unquoted.as_bytes(), 120)
  } else {
    unquoted.to_string()
  };
  let mut lines = text.lines().collect::<Vec<_>>();
  if let Some(i) = lines.iter().enumerate().find_map(|(i, line)| {
    let tail = lines[i..]
      .iter()
      .take(8)
      .map(|s| s.trim().to_lowercase())
      .collect::<Vec<_>>();
    (line.trim().to_lowercase().starts_with("from:")
      && tail
        .iter()
        .any(|s| s.starts_with("sent:") || s.starts_with("date:"))
      && tail.iter().any(|s| s.starts_with("to:"))
      && tail.iter().any(|s| s.starts_with("subject:")))
    .then_some(i)
  }) {
    lines.truncate(i);
  }
  let text = lines.join("\n");
  text
    .lines()
    .take_while(|line| {
      let l = line.trim().to_lowercase();
      !(l.starts_with('>')
        || l == "-----original message-----"
        || l == "---------- forwarded message ---------"
        || (l.starts_with("on ") && l.ends_with("wrote:")))
    })
    .take(160)
    .collect::<Vec<_>>()
    .join("\n")
}
pub fn classify(email: &Email, signals: Signals) -> Option<Finding> {
  if email.account_email.trim().is_empty()
    || signals.junk
    || email.is_deleted == Some(true)
    || email.is_archived == Some(true)
  {
    return None;
  }
  let sender = mailparse::addrparse(&email.sender).ok()?;
  if sender.extract_single_info()?.addr.eq_ignore_ascii_case(
    email
      .account_email
      .trim()
      .strip_prefix("microsoft:")
      .unwrap_or(email.account_email.trim()),
  ) {
    return None;
  }
  let current = current_text(&email.body);
  let lower = current.to_lowercase();
  let subject = email.subject.to_lowercase();
  let promotional = [
    "sale",
    "discount",
    "bonus",
    "rewards",
    "special offer",
    "limited time",
    "shop now",
    "save up to",
  ]
  .iter()
  .filter(|s| subject.contains(**s) || lower.contains(**s))
  .count();
  let bulk =
    signals.bulk || lower.contains("unsubscribe") || lower.contains("manage your preferences");
  let marketing = (signals.promotions && (bulk || promotional > 0)) || (bulk && promotional > 0);
  if marketing
    && (!signals.direct_history
      || promotional >= 2
      || lower.contains("claim ")
      || lower.contains("shop now"))
  {
    return None;
  }
  // An offer to help or a courtesy footer is not a request to the recipient.
  let sentences = current
    .split(|c| c == '.' || c == '!' || c == '?' || c == '\n')
    .map(str::trim)
    .filter(|s| s.len() >= 12 && s.len() <= 300);
  let mut review = None;
  let mut waiting = None;
  for sentence in sentences {
    let s = sentence.to_lowercase();
    if [
      "if you need",
      "if you have any",
      "if interested",
      "if you are interested",
      "let me know if",
      "please do not reply",
      "do not reply",
      "no action required",
      "for your records",
    ]
    .iter()
    .any(|v| s.contains(v))
    {
      continue;
    }
    let request = [
      "could you",
      "can you",
      "would you",
      "please",
      "action required",
    ]
    .iter()
    .any(|v| s.contains(v));
    let concrete = [
      "confirm",
      "approve",
      "review",
      "send ",
      "provide",
      "reply",
      "respond",
      "sign ",
      "choose",
      "pay ",
      "availability",
      "schedule",
    ]
    .iter()
    .any(|v| s.contains(v));
    let response = [
      "reply",
      "respond",
      "let me know",
      "send me",
      "send us",
      "provide",
      "confirm",
      "availability",
    ]
    .iter()
    .any(|v| s.contains(v));
    if request
      && concrete
      && ["portal", "log in", "sign in", "click"]
        .iter()
        .any(|v| s.contains(v))
      && ["review", "approve", "sign ", "confirm"]
        .iter()
        .any(|v| s.contains(v))
    {
      review = Some(sentence);
      continue;
    }
    if request && concrete && response {
      return Some(finding(
        email,
        Action::Reply,
        "Reply about",
        sentence,
        &current,
      ));
    }
    if request
      && concrete
      && ["review", "approve", "sign ", "pay "]
        .iter()
        .any(|v| s.contains(v))
    {
      review = Some(sentence);
    }
    if [
      "i will send",
      "we will send",
      "i'll send",
      "we'll send",
      "will get back to you",
    ]
    .iter()
    .any(|v| s.contains(v))
    {
      waiting = Some(sentence);
    }
  }
  if let Some(s) = review {
    return Some(finding(email, Action::Review, "Review", s, &current));
  }
  if let Some(s) = waiting {
    return Some(finding(email, Action::Waiting, "Waiting on", s, &current));
  }
  None
}
fn finding(email: &Email, action: Action, verb: &str, sentence: &str, current: &str) -> Finding {
  let title = format!("{} {}", verb, email.subject.trim());
  Finding {
    action,
    title,
    reason: format!("{}: “{}”.", email.sender, sentence),
    confidence: 0.84,
    current: current.to_string(),
  }
}
#[cfg(test)]
mod tests {
  use super::*;
  fn email(body: &str) -> Email {
    Email {
      id: Some(1),
      email_uid: "synthetic".into(),
      thread_id: Some("thread".into()),
      subject: "Project documents".into(),
      date: 1,
      sender: "Sender <sender@example.test>".into(),
      recipient: "owner@example.test".into(),
      cc: String::new(),
      body: body.into(),
      is_starred: Some(false),
      is_read: Some(false),
      is_archived: Some(false),
      is_deleted: Some(false),
      account_email: "owner@example.test".into(),
    }
  }
  #[test]
  fn promotions_and_authoritative_junk_are_not_obligations() {
    let mut e = email("Please review our sale. Bonus rewards await. Unsubscribe");
    e.subject = "Bonus rewards sale".into();
    assert!(classify(&e, Signals::default()).is_none());
    assert!(classify(
      &email("Please confirm the project scope by Friday"),
      Signals {
        junk: true,
        ..Default::default()
      }
    )
    .is_none());
    assert!(classify(
      &email("Please reply to claim this discount"),
      Signals {
        promotions: true,
        bulk: true,
        ..Default::default()
      }
    )
    .is_none());
  }
  #[test]
  fn receipt_conditional_help_and_quoted_asks_are_not_new_reply_loops() {
    for body in ["Your deposit was received. For your records. Let me know if you need help.","If you have any questions please reply.","Thanks for the update.\nOn Monday Sender wrote:\nCould you please confirm the scope?", "No action required. Your payment receipt is attached.","Thanks, received.\nFrom: Sender <sender@example.test>\nSent: Monday\nTo: Owner\nSubject: Old project\nPlease confirm the scope by Friday", "<p>Thanks, received.</p><blockquote><p>Please confirm the scope by Friday.</p></blockquote>"] {assert!(classify(&email(body),Signals::default()).is_none(),"{body}");}
  }
  #[test]
  fn direct_requests_preserve_current_evidence_without_inventing_deadlines() {
    let f = classify(
      &email("Could you please confirm the revised scope by Friday?"),
      Signals::default(),
    )
    .unwrap();
    assert_eq!(f.action, Action::Reply);
    assert!(f.reason.contains("by Friday"));
    assert!(f.title.starts_with("Reply about"));
  }
  #[test]
  fn noreply_alone_does_not_hide_review_or_transactional_actions() {
    let mut e = email("Please review the uploaded documents in the secure portal by Friday");
    e.sender = "Portal <noreply@example.test>".into();
    assert_eq!(
      classify(&e, Signals::default()).unwrap().action,
      Action::Review
    );
    e.body = "Please review and confirm the documents in the portal by Friday".into();
    assert_eq!(
      classify(&e, Signals::default()).unwrap().action,
      Action::Review
    );
    e.body = "Please reply to confirm your appointment by Friday".into();
    assert_eq!(
      classify(&e, Signals::default()).unwrap().action,
      Action::Reply
    );
  }
  #[test]
  fn real_conversation_and_transactional_deadline_survive() {
    let mut e = email("Please review our sales proposal and let me know. Unsubscribe");
    e.subject = "Sales proposal".into();
    assert_eq!(
      classify(
        &e,
        Signals {
          bulk: true,
          direct_history: true,
          ..Default::default()
        }
      )
      .unwrap()
      .action,
      Action::Reply
    );
    e.sender = "Billing <noreply@example.test>".into();
    e.body = "Please pay your invoice by Friday".into();
    assert_eq!(
      classify(&e, Signals::default()).unwrap().action,
      Action::Review
    );
  }
  #[test]
  fn promises_are_waiting_not_requests_to_send() {
    assert_eq!(
      classify(
        &email("I will send the revised documents tomorrow"),
        Signals::default()
      )
      .unwrap()
      .action,
      Action::Waiting
    );
  }
}
