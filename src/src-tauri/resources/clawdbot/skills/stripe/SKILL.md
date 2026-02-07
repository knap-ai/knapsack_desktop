---
name: Stripe
description: Manage payments, subscriptions, and invoices with Stripe.
metadata: {"clawdbot":{"emoji":"💳","homepage":"https://stripe.com/docs/cli","requires":{"bins":["stripe"]},"install":[{"id":"brew","kind":"brew","formula":"stripe/stripe-cli/stripe","bins":["stripe"]}]}}
---

# Stripe

Use the Stripe CLI to manage payments, customers, and subscriptions.

## When to activate

- User asks to manage Stripe payments, customers, or subscriptions
- User wants to test webhooks locally
- User needs to inspect charges, invoices, or refunds

## Common operations

| Task | Command |
|------|---------|
| Login | `stripe login` |
| List charges | `stripe charges list --limit 10` |
| Create customer | `stripe customers create --email "user@example.com"` |
| Listen to webhooks | `stripe listen --forward-to localhost:3000/webhook` |
| Trigger event | `stripe trigger payment_intent.succeeded` |
