---
name: Firebase
description: Manage Firebase projects — hosting, Firestore, auth, and functions.
metadata: {"clawdbot":{"emoji":"🔥","homepage":"https://firebase.google.com","requires":{"bins":["firebase"]},"install":[{"id":"npm","kind":"node","package":"firebase-tools","bins":["firebase"]}]}}
---

# Firebase

Use the Firebase CLI to manage hosting, Firestore, authentication, and Cloud Functions.

## When to activate

- User asks to deploy to Firebase Hosting
- User wants to manage Firestore data or security rules
- User needs to deploy or test Cloud Functions
- User asks about Firebase Authentication setup

## Common operations

| Task | Command |
|------|---------|
| Login | `firebase login` |
| Init project | `firebase init` |
| Deploy all | `firebase deploy` |
| Deploy hosting | `firebase deploy --only hosting` |
| Deploy functions | `firebase deploy --only functions` |
| Start emulators | `firebase emulators:start` |
