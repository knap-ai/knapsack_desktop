# Plan: Audio-Only Permissions + Meeting Heartbeat Notifications

## Part 1: Switch to Audio-Only Permissions

### Problem
The app requires "Screen & System Audio Recording" permission just to capture speaker audio during meetings. This is scary/confusing for users — the app never captures the screen visually.

### Approach
Make screen recording permission **optional**, not required. If we have it, capture both mic + speaker. If not, capture mic only (still useful for meeting notes since the user's mic picks up both sides in most setups).

### Changes

**1. `src/src-tauri/src/audio/permission.rs`**
- Remove `screen_recording` from the `all_granted` check — only require microphone
- Add a new field `system_audio: bool` that reports screen recording status as optional info
- Keep the screen recording check for informational purposes but don't gate recording on it

**2. `src/src/components/molecules/AudioPermissionChecker/index.tsx`**
- Only require microphone permission to dismiss the dialog and allow recording
- Change screen access from required red button to optional/informational
- When mic is granted, call `onBothPermissionsGranted()` (rename makes sense but minimize changes)
- Show "For best quality, also enable system audio" as a soft suggestion, not a blocker

**3. `src/src-tauri/src/audio/audio.rs`**
- In `start_recording`: check screen permission before launching speaker thread
- If screen permission is missing: skip speaker output thread, record mic only
- Log clearly: "Recording mic only — system audio permission not granted"

**4. `src/src/components/organisms/MeetingNotesMode/RecordingContext.tsx`**
- Only check microphone permission before recording (not screen_recording)
- Don't clear `permissionsDismissed` for missing screen recording

## Part 2: 15-Minute Heartbeat Notifications During Recording

### Problem
During long meetings, the user gets no feedback until recording stops. They want periodic insights.

### Approach
Every 15 minutes during a recording, collect the transcript accumulated so far, send it to the LLM, and generate an actionable insight/suggestion shown as a desktop notification.

### Changes

**1. `src/src-tauri/src/audio/audio.rs`** — Add heartbeat timer in recording loop
- Track elapsed time since last heartbeat (15-minute intervals)
- When 15 minutes pass: read accumulated transcript from the transcript file
- Call a new function `generate_meeting_heartbeat()` with the transcript text
- Emit a Tauri event `meeting_heartbeat` with the insight text

**2. `src/src-tauri/src/audio/transcribe.rs`** — Add `generate_meeting_heartbeat()` function
- Takes transcript text + thread context
- Calls the user's configured LLM (via existing provider resolution)
- System prompt: "You are observing a live meeting. Based on the transcript so far, provide ONE brief, actionable insight — something interesting the user should know, a question they should ask, or an action they should take. Be specific and concise (1-2 sentences)."
- Returns the insight string

**3. `src/src-tauri/src/audio/audio.rs`** — Emit notification event
- After getting the heartbeat response, emit `meeting_heartbeat` event with:
  - `threadId`, `feedItemId`, `insight` text, `timestamp`, `elapsedMinutes`

**4. Frontend notification handler** — Listen for `meeting_heartbeat` events
- In `RecordingContext.tsx`: add `listen('meeting_heartbeat', ...)`
- Show as a desktop notification (Tauri notification API) AND in-app toast
- Include the insight text from the LLM
