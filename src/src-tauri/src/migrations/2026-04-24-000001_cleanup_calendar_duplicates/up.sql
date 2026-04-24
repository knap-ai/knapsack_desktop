-- Remove legacy empty-account-email calendar events that now have a proper
-- per-account row (inserted by the multi_google_calendar migration sync).
-- Only removes rows where a non-empty-email version of the same event_id
-- already exists, so Microsoft events (which still use '' until the next sync)
-- are left untouched.
DELETE FROM calendar_events
WHERE calendar_account_email = ''
  AND event_id IN (
    SELECT event_id FROM calendar_events WHERE calendar_account_email != ''
  );
