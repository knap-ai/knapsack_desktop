# Knapsack Mobile

Initial iPhone + Apple Watch companion app for Knapsack meeting capture.

What is included in this first cut:

- iPhone app to create/list mobile meetings from a local Knapsack desktop server
- iPhone microphone recording and upload to the new mobile meeting API
- Note editing and meeting status updates
- Apple Watch recording flow with file transfer to the paired iPhone
- iPhone-side WatchConnectivity receiver that creates a meeting and uploads the transferred recording

What is not included yet:

- Production auth
- Server-side transcription kick-off
- Push notifications
- Complications
- App Store/TestFlight setup

## Generate the Xcode project

```bash
cd /Users/markheynen/knapsack_desktop/knapsack_mobile
xcodegen generate
open KnapsackMobile.xcodeproj
```

## Local dev server

Run the Knapsack desktop backend locally so the iPhone simulator can reach `http://127.0.0.1:8897`:

```bash
cd /Users/markheynen/knapsack_desktop/src
npm run tauri -- dev
```

## Device notes

For a real iPhone, change the server URL in the app to a reachable host. The desktop backend currently defaults to localhost-only, so simulator testing is the easiest first path.
