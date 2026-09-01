-- Legacy Gmail cache rows predate mailbox identity. They cannot be updated
-- safely once more than one Google account is connected, so discard the local
-- cache and let the next Gmail sync recreate account-scoped rows.
DELETE FROM emails
WHERE TRIM(account_email) = '';
