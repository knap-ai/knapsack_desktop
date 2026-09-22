-- Recent inbox views, native agent context, and Email Autopilot all read the
-- newest rows first. Without this index SQLite scans and sorts the full local
-- mailbox before applying LIMIT, which can make a simple inbox summary time
-- out under the agent request budget.
CREATE INDEX IF NOT EXISTS idx_emails_date_desc ON emails(date DESC);
CREATE INDEX IF NOT EXISTS idx_emails_account_date_desc ON emails(account_email, date DESC);
