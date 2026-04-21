-- Reverse account_email backfill on user_connections
UPDATE user_connections
SET calendar_account_email = ''
WHERE connection_id IN (
  SELECT id FROM connections
  WHERE scope IN ('google_drive_read', 'google_gmail_modify')
);

-- Recreate emails without account_email
CREATE TABLE emails_old (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_uid TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL DEFAULT '',
  date INTEGER NOT NULL DEFAULT 0,
  sender TEXT NOT NULL DEFAULT '',
  recipient TEXT NOT NULL DEFAULT '',
  cc TEXT,
  body TEXT NOT NULL DEFAULT '',
  thread_id TEXT,
  is_starred INTEGER,
  is_read INTEGER,
  is_archived INTEGER,
  is_deleted INTEGER
);

INSERT OR IGNORE INTO emails_old
  SELECT id, email_uid, subject, date, sender, recipient, cc, body,
         thread_id, is_starred, is_read, is_archived, is_deleted
  FROM emails;

DROP TABLE emails;
ALTER TABLE emails_old RENAME TO emails;
