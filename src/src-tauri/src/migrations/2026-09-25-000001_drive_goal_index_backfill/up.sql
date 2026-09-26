-- Track the single full Drive pass that seeds content summaries for Goal
-- discovery.  It is account-scoped so one connected mailbox cannot suppress
-- another account's historical backfill.
CREATE TABLE IF NOT EXISTS drive_goal_index_backfills (
  account_email TEXT PRIMARY KEY NOT NULL,
  completed_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS drive_goal_index_backfill_attempts (
  account_email TEXT PRIMARY KEY NOT NULL,
  attempted_at INTEGER NOT NULL
);
