CREATE TABLE IF NOT EXISTS db_version (
  version INT PRIMARY KEY NOT NULL,
  qdrant_version INT NOT NULL
);

CREATE TABLE IF NOT EXISTS emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_uid TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  date INT NOT NULL,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  cc TEXT NULL,
  body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_events (
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

CREATE TABLE IF NOT EXISTS drive_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drive_id VARCHAR(100) NOT NULL,
  filename TEXT NOT NULL,
  file_size INT NOT NULL,
  date_modified INT NOT NULL,
  date_created INT NOT NULL,
  summary TEXT,
  checksum TEXT,
  url TEXT NOT NULL,
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS automations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 0,
  is_beta BOOLEAN DEFAULT 0,
  description TEXT,
  show_library BOOLEAN DEFAULT 1,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS automation_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  automation_uuid TEXT NOT NULL,
  name TEXT NOT NULL,
  ordering INTEGER,
  args_json TEXT
);

CREATE TABLE IF NOT EXISTS cadence_triggers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  automation_uuid TEXT NOT NULL,
  cadence_type TEXT NOT NULL,
  day_of_week TEXT,
  time TEXT,
  created_timestamp INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS data_source_trigger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  automation_uuid TEXT NOT NULL,
  data_source TEXT NOT NULL,
  offset_minutes INT DEFAULT 0,
  created_timestamp INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  automation_uuid TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  schedule_timestamp DATETIME,
  execution_timestamp DATETIME,
  thread_id INTEGER,
  run_params TEXT,
  feed_item_id INTEGER,
  created_timestamp INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  foreign_table TEXT NOT NULL,
  foreign_table_id INTEGER NOT NULL,
  timestamp INTEGER DEFAULT (strftime('%s','now')),
  hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER DEFAULT (strftime('%s','now')),
  hideFollowUp BOOLEAN,
  feed_item_id INTEGER,
  title TEXT,
  subtitle TEXT,
  thread_type TEXT DEFAULT 'CHAT'
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER DEFAULT (strftime('%s','now')),
  user_id INTEGER,
  thread_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_facade TEXT,
  document_ids TEXT
);

CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  connection_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  last_synced INTEGER,
  UNIQUE(user_id, connection_id)
);

CREATE TABLE IF NOT EXISTS local_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  file_size INT NOT NULL,
  date_modified INT NOT NULL,
  date_created INT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  checksum TEXT,
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS message_feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  feedback INTEGER NOT NULL,
  timestamp INTEGER DEFAULT (strftime('%s','now')),
  UNIQUE(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS feed_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS transcripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  start_time INTEGER,
  end_time INTEGER,
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);
