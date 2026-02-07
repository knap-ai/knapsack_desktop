---
name: Supabase
description: Manage Supabase projects — database, auth, storage, and edge functions.
metadata: {"clawdbot":{"emoji":"⚙️","homepage":"https://supabase.com","requires":{"bins":["supabase"]},"install":[{"id":"brew","kind":"brew","formula":"supabase/tap/supabase","bins":["supabase"]}]}}
---

# Supabase

Use the Supabase CLI to manage your backend-as-a-service platform.

## When to activate

- User asks to manage Supabase database, auth, or storage
- User wants to create or run database migrations
- User needs to deploy edge functions
- User asks to start a local Supabase development environment

## Common operations

| Task | Command |
|------|---------|
| Login | `supabase login` |
| Init project | `supabase init` |
| Start local | `supabase start` |
| Run migration | `supabase db push` |
| Generate types | `supabase gen types typescript` |
| Deploy function | `supabase functions deploy fn-name` |
