-- Add account_email to drive_documents so files from multiple Google accounts
-- can coexist without collision.
ALTER TABLE drive_documents ADD COLUMN account_email TEXT NOT NULL DEFAULT '';

-- Recreate emails with account_email and a composite unique constraint so that
-- the same email_uid can appear for two different Google accounts.
CREATE TABLE emails_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_uid TEXT NOT NULL,
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
  is_deleted INTEGER,
  account_email TEXT NOT NULL DEFAULT '',
  UNIQUE(email_uid, account_email)
);

INSERT INTO emails_new
  SELECT id, email_uid, subject, date, sender, recipient, cc, body,
         thread_id, is_starred, is_read, is_archived, is_deleted, ''
  FROM emails;

DROP TABLE emails;
ALTER TABLE emails_new RENAME TO emails;

-- Backfill user_connections: Drive and Gmail connections should have
-- calendar_account_email = the linked user's email (same pattern as Calendar).
UPDATE user_connections
SET calendar_account_email = (
  SELECT email FROM users WHERE users.id = user_connections.user_id
)
WHERE connection_id IN (
  SELECT id FROM connections
  WHERE scope IN ('google_drive_read', 'google_gmail_modify')
)
AND calendar_account_email = '';
