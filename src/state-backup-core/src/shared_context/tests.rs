use super::*;
use std::{cell::RefCell, rc::Rc};
fn id(n: u32) -> String {
  format!("{n:08x}-1111-4111-8111-{n:012x}")
}
fn key() -> RecoveryKey {
  RecoveryKey::from_hex(&"ab".repeat(32)).unwrap()
}
fn binding(device: u32) -> Binding {
  Binding {
    account_id: "account-one".into(),
    device_id: id(device),
    key_version: id(99),
    enrollment_epoch: 1,
  }
}
fn record(n: u32, title: &str) -> SelectedRecord {
  SelectedRecord {
    record_id: id(n),
    source_record_id: id(100 + n),
    title: title.into(),
    content: Content::CuratedContext {
      text: "Reviewed planning context; historical data only.".into(),
    },
  }
}
#[derive(Clone, Default)]
struct Store(Rc<RefCell<(u64, Vec<u8>, bool)>>);
impl DurableStore for Store {
  fn load(&mut self) -> Result<Option<(u64, Vec<u8>)>> {
    let s = self.0.borrow();
    Ok(if s.0 == 0 {
      None
    } else {
      Some((s.0, s.1.clone()))
    })
  }
  fn compare_and_save(&mut self, generation: u64, bytes: &[u8]) -> Result<u64> {
    let mut s = self.0.borrow_mut();
    if s.2 {
      return Err(Error::Io("Synthetic journal failure"));
    }
    if generation != s.0 {
      return Err(Error::UnstableSnapshot);
    }
    s.0 += 1;
    s.1 = bytes.to_vec();
    Ok(s.0)
  }
}
fn coordinator(store: Store, device: u32) -> Coordinator<Store> {
  Coordinator::load(store, &key(), binding(device), id(1000 + device)).unwrap()
}
fn enroll(c: &mut Coordinator<Store>, device: u32, ids: &[u32]) {
  c.enroll(
    &key(),
    &binding(device),
    ids.iter().map(|n| id(*n)).collect(),
    true,
  )
  .unwrap();
}
fn receipt(m: &Mutation, sequence: u64) -> Receipt {
  Receipt {
    schema_version: 1,
    account_id: m.binding.account_id.clone(),
    record_id: m.record_id.clone(),
    kind: m.kind.clone(),
    revision: m.expected_revision + 1,
    deleted: m.deleted,
    source_device_id: m.binding.device_id.clone(),
    key_version: m.binding.key_version.clone(),
    sequence,
    mutation_id: m.mutation_id.clone(),
    sha256: if m.deleted {
      None
    } else {
      Some(super::super::digest(&m.ciphertext))
    },
  }
}
fn remote(m: &Mutation, sequence: u64) -> RemoteRecord {
  RemoteRecord {
    receipt: receipt(m, sequence),
    ciphertext: if m.deleted {
      None
    } else {
      Some(m.ciphertext.clone())
    },
  }
}
fn queued(c: &mut Coordinator<Store>, n: u32, title: &str, mutation: u32) -> Lease {
  c.queue(&key(), record(n, title), id(mutation)).unwrap();
  c.prepare(&id(n)).unwrap()
}
#[test]
fn default_restart_and_wrong_scope_do_not_restore_consent() {
  let store = Store::default();
  let mut c = coordinator(store.clone(), 1);
  assert!(c.queue(&key(), record(10, "Review"), id(50)).is_err());
  assert!(c
    .enroll(&key(), &binding(2), [id(10)].into(), true)
    .is_err());
  enroll(&mut c, 1, &[10]);
  let lease = queued(&mut c, 10, "Review", 50);
  let mut restarted = coordinator(store.clone(), 1);
  assert!(restarted.prepare(&id(10)).is_err());
  enroll(&mut restarted, 1, &[10]);
  assert_eq!(restarted.prepare(&id(10)).unwrap().mutation, lease.mutation);
  assert!(restarted
    .complete(
      &key(),
      &lease,
      Completion::Confirmed(receipt(&lease.mutation, 1))
    )
    .is_err());
  let mut other = binding(1);
  other.account_id = "other-owner".into();
  assert!(Coordinator::load(store, &key(), other, id(1001)).is_err());
}
#[test]
fn journal_failure_never_exposes_unsaved_mutation_or_grants_consent() {
  let store = Store::default();
  let mut c = coordinator(store.clone(), 1);
  store.0.borrow_mut().2 = true;
  assert!(c
    .enroll(&key(), &binding(1), [id(10)].into(), true)
    .is_err());
  assert!(c.prepare(&id(10)).is_err());
  store.0.borrow_mut().2 = false;
  enroll(&mut c, 1, &[10]);
  store.0.borrow_mut().2 = true;
  assert!(c
    .queue(&key(), record(10, "Unpersisted title"), id(50))
    .is_err());
  assert!(c.prepare(&id(10)).is_err());
}
#[test]
fn durable_retry_is_encrypted_and_byte_identical() {
  let store = Store::default();
  let mut c = coordinator(store.clone(), 1);
  enroll(&mut c, 1, &[10]);
  let lease = queued(&mut c, 10, "Private reviewed title", 50);
  c.complete(&key(), &lease, Completion::Uncertain).unwrap();
  assert!(!String::from_utf8_lossy(&store.0.borrow().1).contains("Private reviewed title"));
  let mut restored = coordinator(store, 1);
  enroll(&mut restored, 1, &[10]);
  assert_eq!(restored.prepare(&id(10)).unwrap().mutation, lease.mutation);
  assert!(restored
    .queue(&key(), record(10, "Replacement"), id(51))
    .is_err());
}
#[test]
fn stale_journal_writer_cannot_overwrite_newer_state() {
  let store = Store::default();
  let mut first = coordinator(store.clone(), 1);
  let mut second = coordinator(store, 1);
  enroll(&mut first, 1, &[10]);
  assert!(second
    .enroll(&key(), &binding(1), [id(11)].into(), true)
    .is_err());
  assert!(second.prepare(&id(11)).is_err());
}
#[test]
fn pause_and_revocation_fence_late_results_and_historical_receipts() {
  let mut c = coordinator(Store::default(), 1);
  enroll(&mut c, 1, &[10]);
  let lease = queued(&mut c, 10, "Review", 50);
  c.pause();
  assert!(c
    .complete(
      &key(),
      &lease,
      Completion::Confirmed(receipt(&lease.mutation, 1))
    )
    .is_err());
  enroll(&mut c, 1, &[10]);
  let current = c.prepare(&id(10)).unwrap();
  c.complete(&key(), &current, Completion::Revoked).unwrap();
  assert!(c.prepare(&id(10)).is_err());
  assert!(c
    .enroll(&key(), &binding(1), [id(10)].into(), true)
    .is_err());
}
#[test]
fn aad_binds_kind_account_record_revision_and_key_version() {
  let mut c = coordinator(Store::default(), 1);
  enroll(&mut c, 1, &[10]);
  let lease = queued(&mut c, 10, "Review", 50);
  let original = remote(&lease.mutation, 1);
  assert!(original.open(&key()).is_ok());
  for field in 0..5 {
    let mut changed = original.clone();
    match field {
      0 => changed.receipt.kind = RecordKind::Conversation,
      1 => changed.receipt.account_id = "other".into(),
      2 => changed.receipt.record_id = id(11),
      3 => changed.receipt.revision = 2,
      _ => changed.receipt.key_version = id(98),
    }
    assert!(changed.open(&key()).is_err());
  }
}
#[test]
fn conflict_preserves_both_titles_and_full_curated_text() {
  let mut a = coordinator(Store::default(), 1);
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut a, 1, &[10]);
  enroll(&mut b, 2, &[10]);
  let local = queued(&mut a, 10, "Local title", 50);
  let competing = queued(&mut b, 10, "Remote title", 51);
  a.complete(
    &key(),
    &local,
    Completion::Conflict(remote(&competing.mutation, 1)),
  )
  .unwrap();
  let conflict = a.conflict(&id(10)).unwrap().unwrap();
  assert_eq!(conflict.local, local.mutation);
  assert_eq!(
    conflict.remote.open(&key()).unwrap().unwrap().title,
    "Remote title"
  );
  assert!(a.prepare(&id(10)).is_err());
  assert!(a
    .discard_conflict(&key(), &id(10), 2, &id(50), true)
    .is_err());
  assert!(a
    .discard_conflict(&key(), &id(10), 1, &id(50), false)
    .is_err());
}
#[test]
fn historical_put_receipt_after_delete_cannot_resurrect_or_clear_draft() {
  let store = Store::default();
  let mut a = coordinator(store.clone(), 1);
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut a, 1, &[10]);
  enroll(&mut b, 2, &[10]);
  let original = queued(&mut a, 10, "Original", 50);
  let committed = remote(&original.mutation, 1);
  // Server committed A, but response was lost. B observes and deletes it.
  b.observe(&key(), committed.clone()).unwrap();
  b.delete(&key(), &id(10), id(51), true).unwrap();
  let deletion = b.prepare(&id(10)).unwrap();
  let tombstone = remote(&deletion.mutation, 2);
  let mut restored = coordinator(store, 1);
  enroll(&mut restored, 1, &[10]);
  restored.observe(&key(), tombstone.clone()).unwrap();
  let retry = restored.reconcile(&id(10), true).unwrap();
  assert_eq!(retry.mutation, original.mutation);
  restored
    .complete(&key(), &retry, Completion::Confirmed(committed.receipt))
    .unwrap();
  assert!(restored.imported(&key(), &id(10)).unwrap().record.is_none());
  assert!(restored.conflict(&id(10)).unwrap().is_some());
  assert!(restored
    .queue(&key(), record(10, "Resurrect"), id(52))
    .is_err());
}
#[test]
fn page_is_atomic_and_latest_get_never_skips_other_record_events() {
  let store = Store::default();
  let mut a = coordinator(store.clone(), 1);
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut a, 1, &[10, 11]);
  enroll(&mut b, 2, &[10, 11]);
  let one = queued(&mut b, 10, "First", 50);
  let first = remote(&one.mutation, 1);
  b.complete(&key(), &one, Completion::Confirmed(first.receipt.clone()))
    .unwrap();
  let second = queued(&mut b, 11, "Other record", 51);
  let other = remote(&second.mutation, 2);
  let newer = queued(&mut b, 10, "Newer title", 52);
  let latest = remote(&newer.mutation, 3);
  a.apply_page(
    &key(),
    "account-one:0",
    "account-one:1",
    vec![Change {
      event: first.receipt.clone(),
      latest: Some(latest.clone()),
    }],
  )
  .unwrap();
  assert_eq!(a.cursor(), "account-one:1");
  assert_eq!(a.imported(&key(), &id(10)).unwrap().revision, 2);
  a.apply_page(
    &key(),
    "account-one:1",
    "account-one:3",
    vec![
      Change {
        event: other.receipt.clone(),
        latest: Some(other.clone()),
      },
      Change {
        event: latest.receipt.clone(),
        latest: Some(latest.clone()),
      },
    ],
  )
  .unwrap();
  assert_eq!(
    a.imported(&key(), &id(11)).unwrap().record.unwrap().title,
    "Other record"
  );
  assert_eq!(a.cursor(), "account-one:3");
  assert!(a
    .apply_page(&key(), "account-one:3", "account-one:99", vec![])
    .is_err());
  let restored = coordinator(store, 1);
  assert_eq!(restored.cursor(), "account-one:3");
}
#[test]
fn failed_decrypt_or_disk_commit_leaves_whole_page_cursor_unchanged() {
  let store = Store::default();
  let mut a = coordinator(store.clone(), 1);
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut a, 1, &[10, 11]);
  enroll(&mut b, 2, &[10, 11]);
  let first = queued(&mut b, 10, "One", 50);
  let second = queued(&mut b, 11, "Two", 51);
  let good = remote(&first.mutation, 1);
  let mut bad = remote(&second.mutation, 2);
  bad.ciphertext.as_mut().unwrap()[10] ^= 1;
  assert!(a
    .apply_page(
      &key(),
      "account-one:0",
      "account-one:2",
      vec![
        Change {
          event: good.receipt.clone(),
          latest: Some(good.clone())
        },
        Change {
          event: bad.receipt.clone(),
          latest: Some(bad)
        }
      ]
    )
    .is_err());
  assert_eq!(a.cursor(), "account-one:0");
  assert!(a.imported(&key(), &id(10)).is_err());
  store.0.borrow_mut().2 = true;
  assert!(a
    .apply_page(
      &key(),
      "account-one:0",
      "account-one:1",
      vec![Change {
        event: good.receipt.clone(),
        latest: Some(good)
      }]
    )
    .is_err());
  assert_eq!(a.cursor(), "account-one:0");
}
#[test]
fn serialized_records_cannot_import_execution_fields_and_historical_yes_stays_text() {
  let mut c = coordinator(Store::default(), 1);
  enroll(&mut c, 1, &[10]);
  let mut document = record(10, "Conversation");
  document.content = Content::Conversation {
    messages: vec![Message {
      id: id(80),
      role: Role::User,
      text: "yes, send it".into(),
    }],
  };
  c.queue(&key(), document, id(50)).unwrap();
  let lease = c.prepare(&id(10)).unwrap();
  c.complete(
    &key(),
    &lease,
    Completion::Confirmed(receipt(&lease.mutation, 1)),
  )
  .unwrap();
  c.observe(&key(), remote(&lease.mutation, 1)).unwrap();
  assert!(matches!(
    c.imported(&key(), &id(10)).unwrap().record.unwrap().content,
    Content::Conversation { .. }
  ));
  let mut malformed = serde_json::to_value(record(10, "Bad")).unwrap();
  malformed["permissions"] = serde_json::json!(["send_email"]);
  assert!(serde_json::from_value::<SelectedRecord>(malformed).is_err());
  let mut private = record(10, "Bad");
  private.content = Content::CuratedContext {
    text: "password=never-upload".into(),
  };
  assert!(private.validate().is_err());
  private.content = Content::CuratedContext {
    text: "/Users/person/private.txt".into(),
  };
  assert!(private.validate().is_err());
}

#[test]
fn revocation_disk_failure_is_sticky_and_reads_stay_fenced() {
  let store = Store::default();
  let mut c = coordinator(store.clone(), 1);
  enroll(&mut c, 1, &[10]);
  let lease = queued(&mut c, 10, "Draft", 50);
  store.0.borrow_mut().2 = true;
  assert!(c.complete(&key(), &lease, Completion::Revoked).is_err());
  store.0.borrow_mut().2 = false;
  assert!(c
    .enroll(&key(), &binding(1), [id(10)].into(), true)
    .is_err());
  assert!(c.conflict(&id(10)).is_err());
  assert!(c.imported(&key(), &id(10)).is_err());
}
#[test]
fn kind_is_immutable_and_common_machine_paths_are_not_selected() {
  let mut c = coordinator(Store::default(), 1);
  enroll(&mut c, 1, &[10]);
  let lease = queued(&mut c, 10, "Note", 50);
  c.complete(
    &key(),
    &lease,
    Completion::Confirmed(receipt(&lease.mutation, 1)),
  )
  .unwrap();
  let mut changed = record(10, "Changed");
  changed.content = Content::Conversation {
    messages: vec![Message {
      id: id(80),
      role: Role::Assistant,
      text: "Context".into(),
    }],
  };
  assert!(c.queue(&key(), changed, id(51)).is_err());
  for path in [
    r"D:\private\file",
    r"c:\private\file",
    r"\\server\share",
    "/etc/private",
    "/unusual-root/file",
  ] {
    let mut r = record(11, "Path");
    r.content = Content::CuratedContext { text: path.into() };
    assert!(r.validate().is_err(), "path was accepted: {path}");
  }
}
#[test]
fn maximum_curated_conflict_survives_encrypted_restart_without_duplication() {
  let store = Store::default();
  let mut a = coordinator(store.clone(), 1);
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut a, 1, &[10]);
  enroll(&mut b, 2, &[10]);
  let mut local = record(10, "Local title");
  local.content = Content::CuratedContext {
    text: "a".repeat(14000),
  };
  let mut remote_document = record(10, "Remote title");
  remote_document.content = Content::CuratedContext {
    text: "b".repeat(14000),
  };
  a.queue(&key(), local, id(50)).unwrap();
  b.queue(&key(), remote_document, id(51)).unwrap();
  let other = b.prepare(&id(10)).unwrap();
  a.observe(&key(), remote(&other.mutation, 1)).unwrap();
  let mut restored = coordinator(store, 1);
  enroll(&mut restored, 1, &[10]);
  let conflict = restored.conflict(&id(10)).unwrap().unwrap();
  assert_eq!(
    conflict.local.preview(&key()).unwrap().unwrap().title,
    "Local title"
  );
  assert_eq!(
    conflict.remote.open(&key()).unwrap().unwrap().title,
    "Remote title"
  );
}
#[test]
fn deletion_reserve_covers_every_selected_id_and_reenrollment_preserves_reserved_state() {
  // Complete-document bounds + nonduplicated conflict blobs bound the worst
  // admitted local/remote pair, not merely the happy-path tiny-text fixtures.
  assert!(MAX_RECORDS * 2 * (MAX_RECORD_BYTES + 2048) * 4 + MAX_RECORDS * 2048 < NORMAL_BUDGET);
  assert!(NORMAL_BUDGET + MAX_RECORDS * 2048 < MAX_JOURNAL);
  let mut c = coordinator(Store::default(), 1);
  enroll(&mut c, 1, &[10]);
  let original = queued(&mut c, 10, "Selected", 50);
  c.complete(
    &key(),
    &original,
    Completion::Confirmed(receipt(&original.mutation, 1)),
  )
  .unwrap();
  c.delete(&key(), &id(10), id(51), true).unwrap();
  let deletion = c.prepare(&id(10)).unwrap();
  assert!(serde_json::to_vec(&deletion.mutation).unwrap().len() < 2048);
  c.pause();
  enroll(&mut c, 1, &[10]);
  assert_eq!(c.prepare(&id(10)).unwrap().mutation, deletion.mutation);
}

#[test]
fn historical_receipt_before_latest_read_never_exposes_stale_live_context() {
  let store = Store::default();
  let mut a = coordinator(store.clone(), 1);
  enroll(&mut a, 1, &[10]);
  let original = queued(&mut a, 10, "Old record", 50);
  drop(a);
  let mut a = coordinator(store.clone(), 1);
  enroll(&mut a, 1, &[10]);
  let retry = a.reconcile(&id(10), true).unwrap();
  a.complete(
    &key(),
    &retry,
    Completion::Confirmed(receipt(&original.mutation, 1)),
  )
  .unwrap();
  assert!(a.imported(&key(), &id(10)).is_err());
  assert!(a.reconcile(&id(10), true).is_err());
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut b, 2, &[10]);
  b.observe(&key(), remote(&original.mutation, 1)).unwrap();
  b.delete(&key(), &id(10), id(51), true).unwrap();
  let deletion = b.prepare(&id(10)).unwrap();
  a.observe(&key(), remote(&deletion.mutation, 2)).unwrap();
  assert!(a.imported(&key(), &id(10)).unwrap().record.is_none());
}
#[test]
fn historical_conflict_ack_is_remembered_and_cannot_replay_forever() {
  let store = Store::default();
  let mut a = coordinator(store.clone(), 1);
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut a, 1, &[10]);
  enroll(&mut b, 2, &[10]);
  let original = queued(&mut a, 10, "Old", 50);
  b.observe(&key(), remote(&original.mutation, 1)).unwrap();
  b.delete(&key(), &id(10), id(51), true).unwrap();
  let deletion = b.prepare(&id(10)).unwrap();
  a.observe(&key(), remote(&deletion.mutation, 2)).unwrap();
  let retry = a.reconcile(&id(10), true).unwrap();
  a.complete(
    &key(),
    &retry,
    Completion::Confirmed(receipt(&original.mutation, 1)),
  )
  .unwrap();
  drop(a);
  let mut restored = coordinator(store, 1);
  enroll(&mut restored, 1, &[10]);
  assert!(restored
    .conflict(&id(10))
    .unwrap()
    .unwrap()
    .acknowledged
    .is_some());
  assert!(restored.reconcile(&id(10), true).is_err());
}
#[test]
fn conflict_response_cannot_apply_another_selected_record() {
  let mut a = coordinator(Store::default(), 1);
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut a, 1, &[10, 11]);
  enroll(&mut b, 2, &[11]);
  let request = queued(&mut a, 10, "A", 50);
  let other = queued(&mut b, 11, "B", 51);
  assert!(a
    .complete(
      &key(),
      &request,
      Completion::Conflict(remote(&other.mutation, 1))
    )
    .is_err());
  assert!(a.imported(&key(), &id(11)).is_err());
  assert_eq!(a.prepare(&id(10)).unwrap().mutation, request.mutation);
}

#[test]
fn equal_head_historical_receipt_still_requires_a_new_current_state_read() {
  let store = Store::default();
  let mut c = coordinator(store.clone(), 1);
  enroll(&mut c, 1, &[10]);
  let original = queued(&mut c, 10, "Old live", 50);
  c.observe(&key(), remote(&original.mutation, 1)).unwrap();
  assert!(c.imported(&key(), &id(10)).is_ok());
  drop(c);
  let mut c = coordinator(store, 1);
  enroll(&mut c, 1, &[10]);
  let retry = c.reconcile(&id(10), true).unwrap();
  c.complete(
    &key(),
    &retry,
    Completion::Confirmed(receipt(&original.mutation, 1)),
  )
  .unwrap();
  assert!(c.imported(&key(), &id(10)).is_err());
}

#[test]
fn lifetime_capacity_is_checked_before_immutable_request_can_be_sent() {
  let mut c = coordinator(Store::default(), 1);
  for n in 10..42 {
    enroll(&mut c, 1, &[n]);
    let lease = queued(&mut c, n, "Small record", n + 100);
    c.complete(
      &key(),
      &lease,
      Completion::Confirmed(receipt(&lease.mutation, (n - 9) as u64)),
    )
    .unwrap();
  }
  enroll(&mut c, 1, &[99]);
  assert_eq!(
    c.queue(&key(), record(99, "New ID"), id(200)).unwrap_err(),
    Error::Bounds
  );
  assert!(c.prepare(&id(99)).is_err());
}

#[test]
fn deletion_event_cannot_be_replaced_by_a_newer_live_get() {
  let mut a = coordinator(Store::default(), 1);
  let mut b = coordinator(Store::default(), 2);
  enroll(&mut a, 1, &[10]);
  enroll(&mut b, 2, &[10]);
  let first = queued(&mut b, 10, "First", 50);
  b.complete(
    &key(),
    &first,
    Completion::Confirmed(receipt(&first.mutation, 1)),
  )
  .unwrap();
  b.delete(&key(), &id(10), id(51), true).unwrap();
  let deletion = b.prepare(&id(10)).unwrap();
  let tombstone = receipt(&deletion.mutation, 2);
  let mut bad = remote(&first.mutation, 3);
  bad.receipt.revision = 3;
  assert!(a
    .apply_page(
      &key(),
      "account-one:0",
      "account-one:2",
      vec![
        Change {
          event: receipt(&first.mutation, 1),
          latest: Some(remote(&first.mutation, 1))
        },
        Change {
          event: tombstone,
          latest: Some(bad)
        }
      ]
    )
    .is_err());
  assert_eq!(a.cursor(), "account-one:0");
}

#[test]
fn protocol_uuids_are_canonical_before_encryption_and_dispatch() {
  let upper = id(0xabcdef).to_ascii_uppercase();
  let mut b = binding(1);
  b.device_id = upper.clone();
  assert!(b.validate().is_err());
  b = binding(1);
  b.key_version = upper.clone();
  assert!(b.validate().is_err());
  let mut r = record(10, "Note");
  r.record_id = upper.clone();
  assert!(r.validate().is_err());
  let mut c = coordinator(Store::default(), 1);
  enroll(&mut c, 1, &[10]);
  assert!(c.queue(&key(), record(10, "Note"), upper).is_err());
  assert!(c.prepare(&id(10)).is_err());
}

#[test]
fn authenticated_malformed_journal_is_rejected_before_any_dispatch() {
  let store = Store::default();
  let mut c = coordinator(store.clone(), 1);
  enroll(&mut c, 1, &[10]);
  queued(&mut c, 10, "Draft", 50);
  let original = c.state.clone();
  for case in 0..4 {
    let mut broken = original.clone();
    match case {
      0 => {
        broken.selected.insert("not-a-uuid".into());
      }
      1 => {
        let value = broken.pending.remove(&id(10)).unwrap();
        broken.pending.insert(id(11), value);
      }
      2 => {
        broken.pending.get_mut(&id(10)).unwrap().binding.account_id = "other-account".into();
      }
      _ => {
        broken.pending.get_mut(&id(10)).unwrap().ciphertext[10] ^= 1;
      }
    }
    let plain = serde_json::to_vec(&broken).unwrap();
    let bytes = seal_with_aad(
      &plain,
      &key(),
      &journal_aad(&binding(1), &id(1001)).unwrap(),
    )
    .unwrap();
    let poisoned = Store::default();
    {
      let mut state = poisoned.0.borrow_mut();
      state.0 = 1;
      state.1 = bytes;
    }
    assert!(Coordinator::load(poisoned, &key(), binding(1), id(1001)).is_err());
  }
}
