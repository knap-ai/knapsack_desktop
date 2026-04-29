-- Add calendar_account_email to user_connections so multiple Google Calendar
-- accounts can be linked per user. Existing calendar connections are populated
-- with the user's own email; all other connection types keep the default ''.
--
-- We recreate user_connections directly (no ALTER TABLE ADD COLUMN) so this
-- migration is idempotent for databases where the column already exists.

CREATE TABLE user_connections_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  connection_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  last_synced INTEGER,
  refresh_token TEXT,
  calendar_account_email TEXT NOT NULL DEFAULT '',
  UNIQUE(user_id, connection_id, calendar_account_email)
);

-- Backfill calendar_account_email: calendar connections get the user's email,
-- all other connection types stay ''.
INSERT INTO user_connections_new (id, user_id, connection_id, token, last_synced, refresh_token, calendar_account_email)
  SELECT
    uc.id, uc.user_id, uc.connection_id, uc.token, uc.last_synced, uc.refresh_token,
    CASE
      WHEN c.scope = 'google_calendar_read'
        THEN COALESCE((SELECT u.email FROM users u WHERE u.id = uc.user_id), '')
      ELSE ''
    END
  FROM user_connections uc
  LEFT JOIN connections c ON c.id = uc.connection_id;

DROP TABLE user_connections;
ALTER TABLE user_connections_new RENAME TO user_connections;

-- Recreate calendar_events with a per-account unique constraint so that the
-- same Google event ID can exist for two different calendar accounts (shared
-- events).  Existing rows all get calendar_account_email = ''.
CREATE TABLE calendar_events_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id VARCHAR(30) NOT NULL,
  title TEXT,
  description TEXT,
  creator_email TEXT,
  attendees_json TEXT,
  location TEXT,
  start INT,
  end INT,
  google_meet_url TEXT,
  recurrence_json TEXT,
  recurrence_id VARCHAR(100),
  calendar_account_email TEXT NOT NULL DEFAULT '',
  UNIQUE(event_id, calendar_account_email)
);

INSERT INTO calendar_events_new
  SELECT id, event_id, title, description, creator_email, attendees_json,
         location, start, end, google_meet_url, recurrence_json, recurrence_id, ''
  FROM calendar_events;

DROP TABLE calendar_events;
ALTER TABLE calendar_events_new RENAME TO calendar_events;
