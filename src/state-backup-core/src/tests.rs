use super::*;
use serde_json::{json, Value};
use std::{fs, path::PathBuf};
use tempfile::{tempdir, TempDir};

fn key() -> RecoveryKey {
  RecoveryKey::from_hex(&"ab".repeat(32)).unwrap()
}
pub(super) fn entry(path: &str, content: &str) -> Entry {
  Entry {
    path: path.into(),
    bytes: content.len(),
    sha256: digest(content.as_bytes()),
    content: content.into(),
  }
}
fn memory_snapshot() -> Snapshot {
  Snapshot {
    warnings: vec![],
    files: vec![entry(
      "memory.md",
      "# Memory\nA private project description.\n",
    )],
  }
}
fn fixture() -> (TempDir, PathBuf) {
  let dir = tempdir().unwrap();
  // /tmp and /var can themselves be symlinks on macOS; use physical path.
  let root = dir.path().canonicalize().unwrap().join("brain");
  fs::create_dir(&root).unwrap();
  fs::create_dir(root.join(".knapsack")).unwrap();
  fs::create_dir(root.join("projects")).unwrap();
  fs::write(
    root.join("memory.md"),
    "# Private work\nPreserve the original note.\n",
  )
  .unwrap();
  fs::write(
    root.join("projects/plan.md"),
    "# Plan\nBuild the approved project.\n",
  )
  .unwrap();
  let definition = json!({"schemaVersion":1,"id":"l1","name":"Review work","description":"Test definition","category":"work","maturity":"supervised","status":"active","trigger":{"kind":"manual","source":null,"description":"On request"},"desiredOutcome":"Reviewed","approvalPolicy":{"requiredBeforeExecution":true,"description":null},"verificationRules":[],"createdAt":1,"updatedAt":2});
  let evidence = json!({"id":"e1","verificationId":"v1","label":"Observed","source":"record","details":"Historical evidence","verified":true,"observedAt":1});
  let run = |id: &str, status: &str, approval: Option<&str>| json!({"id":id,"loopId":"l1","status":status,"approval":approval,"candidateId":null,"subject":"Review","context":"Meeting source","accountIdentity":null,"targetIdentity":null,"preparedArtifact":{"title":"Draft","body":"Historical prepared artifact","format":"text","createdAt":2},"evidence":[evidence.clone()],"events":[{"from":null,"to":"queued","at":1,"note":"Created"}],"startedAt":1,"updatedAt":2});
  let loops = json!({"schemaVersion":1,"definitions":[definition],"runs":[run("r1","waiting_for_approval",Some("approved")),run("r2","completed",Some("approved")),run("r3","blocked",None)],"candidates":[{"id":"c1","loopId":"l1","signalId":"s1","signalType":"meeting","title":"Candidate","reason":"Supported","confidence":0.9,"context":null,"accountIdentity":null,"targetIdentity":null,"status":"dismissed","observedAt":1,"updatedAt":2}]});
  let item = |id: &str, status: &str| json!({"id":id,"runId":"r1","proposal":{"action":"Review","owner":"Owner","quote":"Review the project tomorrow.","draft":"Historical draft."},"status":status,"dueAt":123,"account":"owner@example.com","recipient":"colleague@example.com","sentId":"s1","threadId":"t1","replyId":null,"lastCheckedAt":3,"nextCheckAt":44,"checkError":null,"revision":1,"history":[{"at":1,"status":"tracking"}]});
  let follow = json!({"schema_version":1,"items":[item("f1","tracking"),item("f2","attention"),item("f3","dismissed")]});
  let goal = |id: &str, status: &str| json!({"schemaVersion":1,"id":id,"name":"Project","objective":"Complete the work","owner":"Owner","collaborators":[],"status":status,"keyResults":[{"id":"k1","title":"Deliver","unit":null,"baseline":0.0,"target":1.0,"deadline":null,"authoritativeSource":null,"direction":"increase"}],"loopLinks":[],"constraints":[],"nonGoals":[],"createdAt":1,"updatedAt":2});
  let goals = json!({"schemaVersion":1,"goals":[goal("g1","active"),goal("g2","at_risk"),goal("g3","achieved")],"observations":[{"id":"o1","goalId":"g1","keyResultId":"k1","value":1,"source":"record","sourceRecord":"observed","observedAt":1,"verified":true}]});
  for (path, value) in [
    (STRUCTURED_FILES[0], loops),
    (STRUCTURED_FILES[1], follow),
    (STRUCTURED_FILES[2], goals),
  ] {
    fs::write(root.join(path), serde_json::to_vec_pretty(&value).unwrap()).unwrap();
  }
  (dir, root)
}
fn assert_error<T>(result: Result<T>, expected: Error) {
  match result {
    Err(actual) => assert_eq!(actual, expected),
    Ok(_) => panic!("Expected {expected:?}, got success"),
  }
}
fn encoded_manifest(value: &Value, account: &str) -> Vec<u8> {
  let plaintext = serde_json::to_vec(value).unwrap();
  let nonce = [13u8; 24];
  let cipher = XChaCha20Poly1305::new_from_slice(key().0.as_ref()).unwrap();
  let ciphertext = cipher
    .encrypt(
      XNonce::from_slice(&nonce),
      Payload {
        msg: &plaintext,
        aad: &aad(account),
      },
    )
    .unwrap();
  let mut bytes = Vec::from(*MAGIC);
  bytes.extend(VERSION.to_be_bytes());
  bytes.extend(nonce);
  bytes.extend(ciphertext);
  bytes
}
fn manifest_value(files: Vec<Entry>) -> Value {
  serde_json::to_value(Manifest {
    schema_version: VERSION,
    account_id: "user-123".into(),
    manifest_sha256: manifest_digest(&files),
    files,
  })
  .unwrap()
}
fn read_json(path: impl AsRef<Path>) -> Value {
  serde_json::from_slice(&fs::read(path).unwrap()).unwrap()
}

#[test]
fn key_generation_export_import_and_rejection() {
  let first = RecoveryKey::generate().unwrap();
  let second = RecoveryKey::generate().unwrap();
  assert_ne!(&*first.to_hex(), &*second.to_hex());
  assert_eq!(first.to_hex().len(), 64);
  assert_eq!(
    RecoveryKey::from_hex(&first.to_hex()).unwrap().0.as_ref(),
    first.0.as_ref()
  );
  for bad in [
    "",
    "short",
    &"gg".repeat(32),
    &"00".repeat(31),
    &format!(" {}", "00".repeat(32)),
  ] {
    assert_error(RecoveryKey::from_hex(bad), Error::InvalidKey);
  }
}
#[test]
fn roundtrip_is_opaque_randomized_and_bound_to_expected_account() {
  let source = memory_snapshot();
  let a = seal(&source, &key(), "user-123").unwrap();
  let b = seal(&source, &key(), "user-123").unwrap();
  assert_ne!(a, b);
  let visible = String::from_utf8_lossy(&a);
  for forbidden in ["memory.md", "Private", "user-123", "schemaVersion"] {
    assert!(!visible.contains(forbidden));
  }
  let loaded = open(&a, &key(), "user-123", Limits::default()).unwrap();
  assert_eq!(loaded.content_sha256(), source.content_sha256());
  assert_error(
    open(&a, &key(), "different-user", Limits::default()),
    Error::Authentication,
  );
  assert_error(
    open(
      &a,
      &RecoveryKey::generate().unwrap(),
      "user-123",
      Limits::default(),
    ),
    Error::Authentication,
  );
  assert_error(
    seal(&source, &key(), "person@example.com"),
    Error::InvalidAccount,
  );
}
#[test]
fn tampering_truncation_and_unknown_envelope_version_are_rejected() {
  let source = memory_snapshot();
  let bytes = seal(&source, &key(), "user-123").unwrap();
  for index in [12, 35, HEADER_LEN, bytes.len() - 1] {
    let mut bad = bytes.clone();
    bad[index] ^= 1;
    assert_error(
      open(&bad, &key(), "user-123", Limits::default()),
      Error::Authentication,
    );
  }
  for len in [0, 7, 11, 35, 51] {
    assert!(open(&bytes[..len], &key(), "user-123", Limits::default()).is_err());
  }
  let mut version = bytes.clone();
  version[11] = 2;
  assert_error(
    open(&version, &key(), "user-123", Limits::default()),
    Error::UnsupportedVersion,
  );
}
#[test]
fn source_allowlist_excludes_runtime_config_and_hidden_content() {
  let (_dir, root) = fixture();
  for dir in [".aws", ".openclaw", "config", "node_modules", "runtime"] {
    fs::create_dir(root.join(dir)).unwrap();
    fs::write(root.join(dir).join("hidden.md"), "password=never-upload").unwrap();
  }
  for file in [
    "image.png",
    "state.db",
    "script.sh",
    ".hidden.md",
    ".knapsack/auth.json",
  ] {
    fs::write(root.join(file), "password=never-upload").unwrap();
  }
  let snapshot = snapshot(&root, Limits::default()).unwrap();
  assert_eq!(snapshot.file_count(), 5);
  assert!(snapshot
    .paths()
    .all(|p| p.ends_with(".md") || STRUCTURED_FILES.contains(&p)));
}
#[test]
fn portable_path_attacks_and_credential_paths_are_rejected() {
  for path in [
    "../escape.md",
    "/absolute.md",
    "notes/../escape.md",
    "C:/drive.md",
    "notes\\escape.md",
    "a//b.md",
    "a/./b.md",
    ".ssh/key.md",
    "notes.md/../escape.md",
    "nul.md",
    "CON.md",
    "a./b.md",
    "notes/ trailing.md ",
    "notes/é.md",
    "credentials.md",
    "api-key.md",
    "config/a.md",
    ".knapsack/custom.json",
  ] {
    let files = vec![entry(path, "safe")];
    let encoded = encoded_manifest(&manifest_value(files), "user-123");
    assert!(
      open(&encoded, &key(), "user-123", Limits::default()).is_err(),
      "accepted {path}"
    );
  }
}
#[test]
fn duplicate_and_case_colliding_paths_or_directories_are_rejected() {
  for names in [
    ["a.md", "a.md"],
    ["A.md", "a.md"],
    ["Notes/a.md", "notes/b.md"],
    ["a.md", "a.md/b.md"],
  ] {
    let mut files = names.iter().map(|p| entry(p, "safe")).collect::<Vec<_>>();
    files.sort_by(|a, b| a.path.cmp(&b.path));
    assert_error(
      open(
        &encoded_manifest(&manifest_value(files), "user-123"),
        &key(),
        "user-123",
        Limits::default(),
      ),
      Error::PathCollision,
    );
  }
}
#[test]
fn hashes_lengths_and_manifest_binding_are_checked_after_authentication() {
  for field in ["sha256", "bytes", "content"] {
    let mut value = manifest_value(vec![entry("a.md", "original")]);
    value["files"][0][field] = if field == "bytes" {
      json!(900)
    } else {
      json!("modified")
    };
    assert_error(
      open(
        &encoded_manifest(&value, "user-123"),
        &key(),
        "user-123",
        Limits::default(),
      ),
      Error::InvalidArchive,
    );
  }
  let mut value = manifest_value(vec![entry("a.md", "original")]);
  value["manifestSha256"] = json!("bad");
  assert_error(
    open(
      &encoded_manifest(&value, "user-123"),
      &key(),
      "user-123",
      Limits::default(),
    ),
    Error::InvalidArchive,
  );
  value["accountId"] = json!("another-user");
  assert_error(
    open(
      &encoded_manifest(&value, "user-123"),
      &key(),
      "user-123",
      Limits::default(),
    ),
    Error::Authentication,
  );
}
#[test]
fn snapshot_and_open_enforce_count_file_total_archive_and_depth_limits() {
  let (_dir, root) = fixture();
  let base = Limits::default();
  for limits in [
    Limits {
      max_files: 1,
      ..base
    },
    Limits {
      max_file_bytes: 3,
      ..base
    },
    Limits {
      max_total_bytes: 3,
      ..base
    },
  ] {
    assert_error(snapshot(&root, limits), Error::Bounds);
  }
  let bytes = seal(&memory_snapshot(), &key(), "user-123").unwrap();
  assert_error(
    open(
      &bytes,
      &key(),
      "user-123",
      Limits {
        max_archive_bytes: 52,
        ..base
      },
    ),
    Error::Bounds,
  );
  assert_error(
    open(
      &bytes,
      &key(),
      "user-123",
      Limits {
        max_file_bytes: 1,
        ..base
      },
    ),
    Error::Bounds,
  );
  assert_error(
    open(
      &bytes,
      &key(),
      "user-123",
      Limits {
        max_total_bytes: 1,
        ..base
      },
    ),
    Error::Bounds,
  );
  assert_error(
    snapshot(
      &root,
      Limits {
        max_depth: 1,
        ..base
      },
    ),
    Error::InvalidPath,
  );
}
#[test]
fn secrets_in_markdown_or_structured_state_block_entire_backup() {
  let (_dir, root) = fixture();
  for secret in [
    "-----BEGIN RSA PRIVATE KEY-----",
    "sk-proj-1234567890123456789012345",
    "api_key: invented-test-secret",
    "password=example",
    "Bearer notarealtoken123456789",
    "https://owner:secret@example.com",
    "AKIA1234567890ABCDEF",
  ] {
    fs::write(root.join("memory.md"), secret).unwrap();
    assert_error(snapshot(&root, Limits::default()), Error::SecretDetected);
  }
  fs::write(root.join("memory.md"), "safe").unwrap();
  let path = root.join(STRUCTURED_FILES[0]);
  let mut value = read_json(&path);
  value["runs"][0]["context"] = json!("refresh_token=do-not-back-up");
  fs::write(path, serde_json::to_vec(&value).unwrap()).unwrap();
  assert_error(snapshot(&root, Limits::default()), Error::SecretDetected);
}
#[test]
fn malformed_json_duplicate_keys_unknown_fields_and_versions_are_rejected() {
  let (_dir, root) = fixture();
  let path = root.join(STRUCTURED_FILES[0]);
  let good = fs::read(&path).unwrap();
  for bad in [
    "{",
    "{\"schemaVersion\":1,\"schemaVersion\":1,\"definitions\":[],\"runs\":[]}",
    "{\"schemaVersion\":2,\"definitions\":[],\"runs\":[]}",
    "{\"schemaVersion\":1,\"definitions\":[],\"runs\":[],\"liveGrant\":true}",
  ] {
    fs::write(&path, bad).unwrap();
    assert!(snapshot(&root, Limits::default()).is_err());
  }
  fs::write(&path, &good).unwrap();
  let mut value = read_json(&path);
  value["definitions"][0]["schemaVersion"] = json!(2);
  fs::write(&path, serde_json::to_vec(&value).unwrap()).unwrap();
  assert_error(
    snapshot(&root, Limits::default()),
    Error::UnsupportedVersion,
  );
  fs::write(&path, &good).unwrap();
  fs::write(root.join(".knapsack/loops-v2.json"), "{}").unwrap();
  assert_error(
    snapshot(&root, Limits::default()),
    Error::UnsupportedVersion,
  );
}
#[test]
fn nested_duplicate_json_keys_cannot_hide_grants_or_changes() {
  assert_error(
    schema::reject_duplicate_keys(br#"{"x":{"approval":"approved","approval":null}}"#),
    Error::InvalidSchema,
  );
  assert_error(
    schema::reject_duplicate_keys(br#"[{"a":1,"a":2}]"#),
    Error::InvalidSchema,
  );
  schema::reject_duplicate_keys(br#"{"x":[1,null,true,{"a":2}],"y":false}"#).unwrap();
}
#[test]
fn restore_pauses_work_clears_all_live_grants_preserves_history_and_original_archive() {
  let (dir, root) = fixture();
  let snapshot = snapshot(&root, Limits::default()).unwrap();
  let original = snapshot.content_sha256();
  let ciphertext = seal(&snapshot, &key(), "user-123").unwrap();
  let restored = dir.path().canonicalize().unwrap().join("replacement");
  let report = restore_new(&snapshot, &restored, 999, Limits::default()).unwrap();
  assert!(report.durable);
  assert_eq!(report.paused_definitions, 1);
  assert_eq!(report.expired_runs, 2);
  assert_eq!(report.cleared_approvals, 2);
  assert_eq!(report.paused_follow_through, 2);
  assert_eq!(report.paused_goals, 2);
  let loops = read_json(restored.join(STRUCTURED_FILES[0]));
  assert_eq!(loops["definitions"][0]["status"], "paused");
  for run in loops["runs"].as_array().unwrap() {
    assert!(run["approval"].is_null());
    assert_eq!(run["events"].as_array().unwrap().len(), 2);
    assert_eq!(run["evidence"][0]["details"], "Historical evidence");
    assert_eq!(
      run["preparedArtifact"]["body"],
      "Historical prepared artifact"
    );
  }
  assert_eq!(loops["runs"][0]["status"], "expired");
  assert_eq!(loops["runs"][1]["status"], "completed");
  assert_eq!(loops["runs"][2]["status"], "expired");
  assert_eq!(loops["candidates"][0]["status"], "dismissed");
  assert!(loops["runs"][0]["events"][1]["note"]
    .as_str()
    .unwrap()
    .contains("historical decision: approved"));
  let follow = read_json(restored.join(STRUCTURED_FILES[1]));
  assert_eq!(follow["items"][0]["status"], "paused");
  assert_eq!(follow["items"][2]["status"], "dismissed");
  for item in follow["items"].as_array().unwrap() {
    assert!(item["nextCheckAt"].is_null());
    assert_eq!(item["revision"], 2);
    assert_eq!(item["history"][1]["status"], "restored_requires_review");
    assert_eq!(item["sentId"], "s1");
  }
  let goals = read_json(restored.join(STRUCTURED_FILES[2]));
  assert_eq!(goals["goals"][0]["status"], "paused");
  assert_eq!(goals["goals"][1]["status"], "paused");
  assert_eq!(goals["goals"][2]["status"], "achieved");
  assert_eq!(goals["observations"][0]["sourceRecord"], "observed");
  assert_eq!(
    fs::read(restored.join("memory.md")).unwrap(),
    fs::read(root.join("memory.md")).unwrap()
  );
  assert_eq!(snapshot.content_sha256(), original);
  assert_eq!(
    open(&ciphertext, &key(), "user-123", Limits::default())
      .unwrap()
      .content_sha256(),
    original
  );
  assert_eq!(
    read_json(root.join(STRUCTURED_FILES[0]))["runs"][0]["approval"],
    "approved"
  );
  // Restored stores remain valid for the next backup without replaying approvals.
  super::snapshot(&restored, Limits::default()).unwrap();
}
#[test]
fn restore_never_overwrites_existing_directory_file_or_active_state() {
  let (dir, root) = fixture();
  let source = snapshot(&root, Limits::default()).unwrap();
  let original = fs::read(root.join("memory.md")).unwrap();
  assert_error(
    restore_new(&source, &root, 999, Limits::default()),
    Error::DestinationExists,
  );
  assert_eq!(original, fs::read(root.join("memory.md")).unwrap());
  let empty = dir.path().canonicalize().unwrap().join("empty");
  fs::create_dir(&empty).unwrap();
  assert_error(
    restore_new(&source, &empty, 999, Limits::default()),
    Error::DestinationExists,
  );
  let file = dir.path().canonicalize().unwrap().join("file");
  fs::write(&file, "existing").unwrap();
  assert_error(
    restore_new(&source, &file, 999, Limits::default()),
    Error::DestinationExists,
  );
  assert_eq!(fs::read_to_string(file).unwrap(), "existing");
}
#[test]
fn restore_preflight_failure_writes_nothing_and_leaves_no_staging() {
  let dir = tempdir().unwrap();
  let path = dir.path().canonicalize().unwrap().join("new");
  let source = Snapshot {
    warnings: vec![],
    files: vec![entry("../bad.md", "outside")],
  };
  assert_error(
    restore_new(&source, &path, 9, Limits::default()),
    Error::InvalidPath,
  );
  assert!(!path.exists());
  assert_eq!(fs::read_dir(dir.path()).unwrap().count(), 0);
  let source = Snapshot {
    warnings: vec![],
    files: vec![entry("note.md", "password=do-not-write")],
  };
  assert_error(
    restore_new(&source, &path, 9, Limits::default()),
    Error::SecretDetected,
  );
  assert_eq!(fs::read_dir(dir.path()).unwrap().count(), 0);
}
#[test]
fn restore_overflow_transform_is_rejected_before_filesystem_writes() {
  let (dir, root) = fixture();
  let path = root.join(STRUCTURED_FILES[1]);
  let mut value = read_json(&path);
  value["items"][0]["revision"] = json!(u64::MAX);
  fs::write(path, serde_json::to_vec(&value).unwrap()).unwrap();
  let source = snapshot(&root, Limits::default()).unwrap();
  let destination = dir.path().canonicalize().unwrap().join("new");
  assert_error(
    restore_new(&source, &destination, 999, Limits::default()),
    Error::Bounds,
  );
  assert!(!destination.exists());
  assert_eq!(fs::read_dir(dir.path()).unwrap().count(), 1);
}
#[cfg(unix)]
#[test]
fn symlinks_source_root_ancestors_files_and_destination_are_rejected() {
  use std::os::unix::fs::symlink;
  let (dir, root) = fixture();
  let base = dir.path().canonicalize().unwrap();
  symlink(&root, base.join("alias")).unwrap();
  assert_error(
    snapshot(&base.join("alias"), Limits::default()),
    Error::UnsupportedEntry,
  );
  assert_error(
    snapshot(&base.join("alias/projects"), Limits::default()),
    Error::UnsupportedEntry,
  );
  symlink("memory.md", root.join("link.md")).unwrap();
  assert_error(snapshot(&root, Limits::default()), Error::UnsupportedEntry);
  fs::remove_file(root.join("link.md")).unwrap();
  symlink("absent", root.join("broken.md")).unwrap();
  assert_error(snapshot(&root, Limits::default()), Error::UnsupportedEntry);
  fs::remove_file(root.join("broken.md")).unwrap();
  let source = snapshot(&root, Limits::default()).unwrap();
  symlink("absent", base.join("destination")).unwrap();
  assert_error(
    restore_new(&source, &base.join("destination"), 9, Limits::default()),
    Error::DestinationExists,
  );
  assert_error(
    restore_new(
      &source,
      &base.join("alias/replacement"),
      9,
      Limits::default(),
    ),
    Error::UnsupportedEntry,
  );
}
#[cfg(unix)]
#[test]
fn hardlinks_executables_special_files_and_private_restore_modes() {
  use std::os::unix::fs::PermissionsExt;
  let (dir, root) = fixture();
  fs::hard_link(root.join("memory.md"), root.join("hard.md")).unwrap();
  assert_error(snapshot(&root, Limits::default()), Error::UnsupportedEntry);
  fs::remove_file(root.join("hard.md")).unwrap();
  fs::set_permissions(root.join("memory.md"), fs::Permissions::from_mode(0o700)).unwrap();
  assert_error(snapshot(&root, Limits::default()), Error::UnsupportedEntry);
  fs::set_permissions(root.join("memory.md"), fs::Permissions::from_mode(0o600)).unwrap();
  let fifo = std::ffi::CString::new(root.join("pipe.md").as_os_str().as_encoded_bytes()).unwrap();
  assert_eq!(unsafe { libc::mkfifo(fifo.as_ptr(), 0o600) }, 0);
  assert_error(snapshot(&root, Limits::default()), Error::UnsupportedEntry);
  fs::remove_file(root.join("pipe.md")).unwrap();
  let source = snapshot(&root, Limits::default()).unwrap();
  let restored = dir.path().canonicalize().unwrap().join("new");
  restore_new(&source, &restored, 9, Limits::default()).unwrap();
  assert_eq!(
    fs::metadata(&restored).unwrap().permissions().mode() & 0o777,
    0o700
  );
  assert_eq!(
    fs::metadata(restored.join(".knapsack"))
      .unwrap()
      .permissions()
      .mode()
      & 0o777,
    0o700
  );
  assert_eq!(
    fs::metadata(restored.join("memory.md"))
      .unwrap()
      .permissions()
      .mode()
      & 0o777,
    0o600
  );
}
#[test]
fn fingerprint_is_stable_but_changes_with_contents_or_filename() {
  let (dir, root) = fixture();
  let first = snapshot(&root, Limits::default()).unwrap().content_sha256();
  let again = snapshot(&root, Limits::default()).unwrap().content_sha256();
  assert_eq!(first, again);
  fs::write(root.join("memory.md"), "Changed note").unwrap();
  assert_ne!(
    first,
    snapshot(&root, Limits::default()).unwrap().content_sha256()
  );
  let other = dir.path().canonicalize().unwrap().join("other");
  fs::create_dir(&other).unwrap();
  fs::write(other.join("a.md"), "same").unwrap();
  let a = snapshot(&other, Limits::default())
    .unwrap()
    .content_sha256();
  fs::rename(other.join("a.md"), other.join("b.md")).unwrap();
  assert_ne!(
    a,
    snapshot(&other, Limits::default())
      .unwrap()
      .content_sha256()
  );
}
#[test]
fn two_pass_snapshot_rejects_changes_additions_and_deletions() {
  for second in [
    vec![entry("a.md", "changed")],
    vec![entry("a.md", "first"), entry("b.md", "new")],
    vec![],
  ] {
    let mut reads = vec![vec![entry("a.md", "first")], second].into_iter();
    assert_error(
      snapshot_reads(|| Ok(reads.next().unwrap()), Limits::default()),
      Error::UnstableSnapshot,
    );
  }
}
#[test]
fn structured_escaped_credentials_are_detected_after_decoding() {
  let (_dir, root) = fixture();
  let path = root.join(STRUCTURED_FILES[0]);
  let source = fs::read_to_string(&path).unwrap();
  fs::write(
    path,
    source.replace("Meeting source", r"pass\u0077ord=hidden-secret"),
  )
  .unwrap();
  assert_error(snapshot(&root, Limits::default()), Error::SecretDetected);
}
#[test]
fn limits_reject_invalid_configuration_and_empty_backup_restores_safely() {
  let dir = tempdir().unwrap();
  let root = dir.path().canonicalize().unwrap();
  assert_error(
    snapshot(
      &root,
      Limits {
        max_files: 0,
        ..Limits::default()
      },
    ),
    Error::Bounds,
  );
  assert_error(
    snapshot(
      &root,
      Limits {
        max_depth: 65,
        ..Limits::default()
      },
    ),
    Error::Bounds,
  );
  let empty = snapshot(&root, Limits::default()).unwrap();
  assert_eq!(empty.file_count(), 0);
  let encrypted = seal(&empty, &key(), "user-123").unwrap();
  let loaded = open(&encrypted, &key(), "user-123", Limits::default()).unwrap();
  let report = restore_new(&loaded, &root.join("new"), 9, Limits::default()).unwrap();
  assert_eq!(report.file_count, 0);
  assert!(report.durable);
}
#[test]
fn cross_file_and_nested_references_must_resolve() {
  for (file, pointer) in [
    (STRUCTURED_FILES[0], "/runs/0/loopId"),
    (STRUCTURED_FILES[1], "/items/0/runId"),
    (STRUCTURED_FILES[2], "/observations/0/goalId"),
  ] {
    let (_dir, root) = fixture();
    let path = root.join(file);
    let mut value = read_json(&path);
    *value.pointer_mut(pointer).unwrap() = json!("missing");
    fs::write(path, serde_json::to_vec(&value).unwrap()).unwrap();
    assert_error(snapshot(&root, Limits::default()), Error::InvalidSchema);
  }
  let (_dir, root) = fixture();
  fs::remove_file(root.join(STRUCTURED_FILES[0])).unwrap();
  assert_error(snapshot(&root, Limits::default()), Error::InvalidSchema);
}
#[test]
fn runtime_instruction_files_are_not_backed_up_as_ordinary_notes() {
  let (_dir, root) = fixture();
  for name in ["AGENTS.md", "CLAUDE.md", "SKILL.md", "GEMINI.md"] {
    fs::write(root.join(name), "execute on start").unwrap();
    assert_error(snapshot(&root, Limits::default()), Error::InvalidPath);
    fs::remove_file(root.join(name)).unwrap();
  }
}
#[test]
fn dormant_discovery_candidates_can_reference_uninstalled_templates() {
  let (_dir, root) = fixture();
  let path = root.join(STRUCTURED_FILES[0]);
  let mut value = read_json(&path);
  value["candidates"][0]["loopId"] = json!("starter-not-yet-installed");
  for status in ["proposed", "dismissed"] {
    value["candidates"][0]["status"] = json!(status);
    fs::write(&path, serde_json::to_vec(&value).unwrap()).unwrap();
    snapshot(&root, Limits::default()).unwrap();
  }
  value["candidates"][0]["status"] = json!("accepted");
  fs::write(&path, serde_json::to_vec(&value).unwrap()).unwrap();
  assert_eq!(
    snapshot(&root, Limits::default()).unwrap().warnings().len(),
    1
  );
}
#[test]
fn native_valid_advisory_orphan_history_roundtrips_with_warnings_and_no_live_grants() {
  let (dir, root) = fixture();
  let loop_path = root.join(STRUCTURED_FILES[0]);
  let mut loops = read_json(&loop_path);
  loops["runs"][0]["candidateId"] = json!("private-historical-candidate-id");
  loops["runs"][1]["candidateId"] = json!("another-removed-candidate");
  loops["candidates"][0]["loopId"] = json!("uninstalled-accepted-template");
  loops["candidates"][0]["status"] = json!("accepted");
  fs::write(&loop_path, serde_json::to_vec(&loops).unwrap()).unwrap();
  let goal_path = root.join(STRUCTURED_FILES[2]);
  let mut goals = read_json(&goal_path);
  goals["goals"][0]["loopLinks"] = json!([{"loopId":"uninstalled-advisory-loop","keyResultId":"k1","driver":"Historical driver","expectedContribution":"Contribute","leadingIndicator":true,"reviewCadence":"weekly","falsification":"Review actual outcome"}]);
  goals["observations"][0]["keyResultId"] = json!("removed-historical-result");
  fs::write(&goal_path, serde_json::to_vec(&goals).unwrap()).unwrap();

  let source = snapshot(&root, Limits::default()).unwrap();
  assert_eq!(source.warnings().len(), 4); // Two run gaps produce one generic warning.
  for warning in source.warnings() {
    for private in [
      "private-historical",
      "removed-historical",
      "uninstalled-advisory",
      "Historical driver",
      "example.com",
    ] {
      assert!(!warning.contains(private));
    }
  }
  let encrypted = seal(&source, &key(), "user-123").unwrap();
  let loaded = open(&encrypted, &key(), "user-123", Limits::default()).unwrap();
  assert_eq!(source.warnings(), loaded.warnings());
  assert_eq!(source.content_sha256(), loaded.content_sha256());
  let destination = dir.path().canonicalize().unwrap().join("replacement");
  let report = restore_new(&loaded, &destination, 999, Limits::default()).unwrap();
  assert_eq!(report.warnings.as_slice(), source.warnings());
  let restored_loops = read_json(destination.join(STRUCTURED_FILES[0]));
  assert_eq!(
    restored_loops["runs"][0]["candidateId"],
    loops["runs"][0]["candidateId"]
  );
  assert_eq!(
    restored_loops["runs"][1]["candidateId"],
    loops["runs"][1]["candidateId"]
  );
  assert_eq!(restored_loops["candidates"], loops["candidates"]);
  assert_eq!(restored_loops["definitions"][0]["status"], "paused");
  assert_eq!(restored_loops["runs"][0]["status"], "expired");
  for run in restored_loops["runs"].as_array().unwrap() {
    assert!(run["approval"].is_null());
  }
  let restored_goals = read_json(destination.join(STRUCTURED_FILES[2]));
  assert_eq!(
    restored_goals["goals"][0]["loopLinks"],
    goals["goals"][0]["loopLinks"]
  );
  assert_eq!(restored_goals["observations"], goals["observations"]);
  assert_eq!(restored_goals["goals"][0]["status"], "paused");
  let restored_follow = read_json(destination.join(STRUCTURED_FILES[1]));
  assert_eq!(restored_follow["items"][0]["status"], "paused");
  assert!(restored_follow["items"][0]["nextCheckAt"].is_null());
  assert_eq!(
    snapshot(&destination, Limits::default())
      .unwrap()
      .warnings(),
    source.warnings()
  );
}
#[test]
fn goal_links_still_require_own_key_result_and_run_candidate_mismatch_is_advisory() {
  let (_dir, root) = fixture();
  let goal_path = root.join(STRUCTURED_FILES[2]);
  let mut goals = read_json(&goal_path);
  goals["goals"][0]["loopLinks"] = json!([{"loopId":"l1","keyResultId":"missing-own-result","driver":"Driver","expectedContribution":"Contribute","leadingIndicator":true,"reviewCadence":"weekly","falsification":"Review"}]);
  fs::write(&goal_path, serde_json::to_vec(&goals).unwrap()).unwrap();
  assert_error(snapshot(&root, Limits::default()), Error::InvalidSchema);
  goals["goals"][0]["loopLinks"] = json!([]);
  fs::write(&goal_path, serde_json::to_vec(&goals).unwrap()).unwrap();
  let loop_path = root.join(STRUCTURED_FILES[0]);
  let mut loops = read_json(&loop_path);
  loops["runs"][0]["candidateId"] = json!("c1");
  loops["candidates"][0]["loopId"] = json!("different-uninstalled-template");
  fs::write(loop_path, serde_json::to_vec(&loops).unwrap()).unwrap();
  let source = snapshot(&root, Limits::default()).unwrap();
  assert_eq!(source.warnings().len(), 1);
  assert!(source.warnings()[0].contains("different-loop"));
}
