# v0.9.52

## Actionable Notifications & Chat
- Notifications now include a suggested next action (CTA button) so you can act on insights instantly
- CTA buttons render reliably in all notification and chat contexts
- Notification text is cleaned up — no more raw markdown or broken Unicode escapes in titles/body
- "View Briefing" button generates and shows the briefing immediately
- Clicking a notification action button navigates directly to the relevant feed item

## Multi-Channel Messaging
- **New:** Push desktop notifications to WhatsApp and iMessage channels
- WhatsApp and iMessage channels now work end-to-end — QR login, auto-reply, and delivery
- Channel connection status is accurate (no more false "Connected")
- Added usage instructions for channel setup

## Gateway & Browser Control
- Rewrote gateway WebSocket protocol handling (correct frame types, ping/pong, handshake)
- Browser control now routes through the gateway RPC — no more separate server
- Improved gateway reconnect logic with pooled connections
- Compatible with OpenClaw 2026.2+ integrated browser control

## Email Autopilot
- Fixed arrow key navigation (stale closure bug)

## Meeting Transcription
- Meetings now use your configured AI provider instead of hardcoded default
- macOS permissions (microphone/screen recording) are checked upfront before recording starts

## AI Providers & Reliability
- Fixed Groq API key not persisting across navigation/reload
- Added retry with exponential backoff for all AI requests
- Default model updated to `claude-opus-4-6`

## Performance & UX
- Reduced input latency caused by aggressive polling
- Improved AI error display
- Suppressed Chrome automation warning banners

## Code Quality & Stability
- Replaced `lazy_static` with `once_cell` and cleaned up unused imports
- Fixed Rust deprecation warnings; removed unused `imap` dependency
- Resolved database locking and token refresh failures
- Fixed `Send + Sync` bounds on API connection type
