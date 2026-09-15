# Shared Realtime voice contract

Knapsack uses one voice-session contract on desktop, iPhone, and CarPlay. The
mobile client never receives a long-lived OpenAI or Studio credential.

## Bootstrap

Studio must add an authenticated endpoint such as
`POST /api/mobile/v1/realtime/sessions`. The signed-in client posts
`RealtimeVoiceSessionRequest`; Studio returns
`RealtimeVoiceSessionBootstrap`: a canonical session ID, durable conversation
ID, short-lived WebSocket URL and client secret, and expiry.

The same target types are used on every surface: Scout, a durable conversation,
a meeting-prep conversation, or idea capture. Studio owns transcript history
and Scout tool delegation. Clients render canonical transcript deltas but do
not execute privileged tools locally.

## Session behavior

- Full-duplex audio is interruptible; interruption never deletes transcript.
- Automatic or semantic turn detection runs in the shared session, not in a
  separate platform speech-recognition stack.
- Mute pauses upstream audio without closing the session.
- Text input uses the same conversation and appears in the canonical history.
- Reconnect resumes by session ID and de-duplicates events before playback.
- Passive meeting capture is a separate, non-speaking recording workflow.

OpenAI Live/Realtime events are adapted at the Studio boundary into
`RealtimeVoiceServerEvent`, so desktop, iPhone, and CarPlay share lifecycle,
transcript, tool-progress, and reconnect behavior even if the provider protocol
changes.

## CarPlay prototype

The CarPlay scene uses only system templates. It exposes Talk to Scout,
Continue a chat, Hear next meeting prep, and Capture an idea. Cached prep can be
spoken immediately. Until Studio ships the bootstrap endpoint and authenticated
mobile session, live actions show an explicit unavailable message rather than a
false connected or indefinite connecting state. They then attach to
`RealtimeVoiceSessionController` through a Studio transport.

The prototype entitlement is simulator-only. Do not point normal code signing
at `KnapsackMobileApp.CarPlayPrototype.entitlements` until Apple approves the
CarPlay Communication category for the app.
