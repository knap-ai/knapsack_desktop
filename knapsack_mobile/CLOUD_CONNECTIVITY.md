# Mobile cloud connectivity

## Decision

Knapsack Mobile should be cloud-first after account sign-in. Studio owns the
durable mobile record for chats, managed-agent conversations, calendar events,
meeting notes, recordings, and generated prep. Desktop is an optional execution
extension for local files, local applications, and other device-bound tools.

The local-network API remains a development and low-latency optimization. It
must not determine whether the mobile app is usable.

## Root cause

The current production path is phone -> Bonjour discovery -> desktop `.local`
HTTP address -> local pairing token. It requires both devices to share a LAN,
the Mac to remain awake, local-network permission to remain valid, mDNS to pass
through the access point, and the desktop HTTP listener to remain reachable.
Cached session data can also make the UI say "linked" after that path has gone
away.

Remote-control products avoid those conditions by having the desktop establish
an outbound authenticated TLS connection to a cloud relay. Their mobile clients
connect to the same cloud service, not directly to a laptop address.

## Target data model

Every mobile-visible object uses a stable cloud ID and an account ID:

- `mobile_device`: device ID, account ID, push token, last seen, app version.
- `conversation`: account ID, optional managed-agent ID, title, timestamps.
- `message`: conversation ID, role, content blocks, delivery state, timestamps.
- `calendar_event`: provider event ID, account ID, normalized start/end data.
- `meeting`: calendar event ID, title, recording state, transcript, notes.
- `meeting_prep`: calendar event ID, state, generated content, source revision.
- `desktop_presence`: account ID, desktop ID, capabilities, last heartbeat.

Desktop thread IDs remain optional aliases. They are not primary keys for
mobile data.

## Routing contract

The app asks Studio for a capability document and routes each action explicitly:

```json
{
  "mode": "cloud",
  "capabilities": {
    "read_saved_content": true,
    "record_meeting": true,
    "chat": true,
    "meeting_prep": true,
    "desktop_tools": false
  },
  "desktop": {
    "state": "offline",
    "last_seen_at": "2026-09-11T18:00:00Z"
  }
}
```

Cloud-supported actions never fall back to a laptop address. A request that
requires a local capability is queued for the desktop relay and clearly shown
as waiting for that desktop.

## Authentication

Reuse Studio's one-shot account connection flow, with a dedicated mobile
callback and token audience. The iOS app exchanges the one-shot code, stores
refresh credentials in Keychain, and sends a bearer token to Studio. Do not
copy desktop bearer or refresh tokens through the LAN pairing endpoint.

## Async meeting prep

Studio schedules prep when calendar events are ingested or changed. The job is
idempotent on `(account_id, provider_event_id, source_revision)` and writes a
`meeting_prep` record. The mobile home screen reads the latest completed prep
immediately and subscribes to an update through push or foreground polling.
Opening a future event may enqueue a missing/stale prep, but does not hold the
screen open on model inference.

## Delivery order

1. Ship truthful capability status and automatic reachability checks. Preserve
   cached content instead of clearing it when Bonjour is unavailable.
2. Add mobile Studio sign-in and `GET /api/mobile/v1/capabilities`.
3. Move calendar events, meeting notes, and recordings to Studio-backed IDs.
4. Move ordinary and managed-agent conversations to Studio persistence and
   cloud inference.
5. Add async prep jobs and push invalidation.
6. Add an outbound desktop relay for actions that require local capabilities.
7. Remove the manual LAN URL from the normal user flow.

## Acceptance criteria

- Moving the phone from Wi-Fi to cellular does not disable chat, notes, prep,
  or recording.
- The status shown in every primary screen matches the capability response.
- A sleeping or offline Mac only disables actions explicitly marked as local.
- Chats and notes created on any client appear on the other clients after sync.
- Prep for the next meeting is already available when the app opens.
- No cached account state is presented as a live desktop connection.
