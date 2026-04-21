-- Reverse: drop calendar_account_email from both tables and restore original constraints.

CREATE TABLE user_connections_old (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  connection_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  last_synced INTEGER,
  refresh_token TEXT,
  UNIQUE(user_id, connection_id)
);

INSERT INTO user_connections_old
  SELECT id, user_id, connection_id, token, last_synced, refresh_token
  FROM user_connections
  WHERE calendar_account_email = '' OR connection_id != (
    SELECT id FROM connections WHERE scope = 'google_calendar_read'
  );

DROP TABLE user_connections;
ALTER TABLE user_connections_old RENAME TO user_connections;

CREATE TABLE calendar_events_old (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id VARCHAR(30) NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  creator_email TEXT,
  attendees_json TEXT,
  location TEXT,
  start INT,
  end INT,
  google_meet_url TEXT,
  recurrence_json TEXT,
  recurrence_id VARCHAR(100)
);

INSERT OR IGNORE INTO calendar_events_old
  SELECT id, event_id, title, description, creator_email, attendees_json,
         location, start, end, google_meet_url, recurrence_json, recurrence_id
  FROM calendar_events;

DROP TABLE calendar_events;
ALTER TABLE calendar_events_old RENAME TO calendar_events;
