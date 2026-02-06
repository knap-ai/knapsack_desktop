# Knapsack 🎒

Knapsack is the safe, simple way to run [OpenClaw](https://github.com/moltbot/moltbot) (née Moltbot née Clawdbot) on your Mac.

OpenClaw is a powerful AI agent platform with browser automation, multi-channel messaging, file access, and code execution -- but running it raw means configuring tokens, locking down network bindings, managing process lifecycles, and getting file permissions right. Miss any of those and you have an agent with broad system access listening on all interfaces.

Knapsack wraps OpenClaw in a Tauri desktop app that handles all of that for you:

- **Localhost-only by default** -- The OpenClaw gateway and browser control server bind to `127.0.0.1`. Nothing is exposed to your network.
- **Hardened secret storage** -- API keys and auth tokens are stored in a single `tokens.json` file with `0600` permissions, managed by the Rust backend. No secrets in config files you have to chmod yourself.
- **Managed process lifecycle** -- OpenClaw runs as a system service (LaunchAgent on macOS) with automatic health checks, restart-on-failure, and cleanup of orphaned browser processes.
- **Sensible defaults** -- Knapsack auto-generates secure configuration on first launch so there is no manual `clawdbot.json` setup.
- **Centralized API key management** -- Add your OpenAI, Anthropic, Gemini, or Groq keys in one place. They are propagated via environment variables, never through URLs.

On top of that safe OpenClaw foundation, Knapsack adds a productivity layer:

## Features

- **Meeting Recording & Transcription** -- Record meetings and get AI-generated notes and summaries
- **Email Management** -- View, search, summarize, and draft emails with AI assistance (Gmail, Outlook)
- **Calendar Integration** -- Sync and manage events from Google Calendar and Microsoft Outlook
- **Document Search** -- Index and semantically search across Google Drive, OneDrive, and local files
- **AI Chat** -- Ask questions across all your connected data sources with semantic search
- **Automations** -- Build workflows with triggers, data sources, and AI prompts (email summaries, meeting prep, lead scoring, and more)
- **Browser Automation** -- Control a browser through OpenClaw's agent with token-authenticated access
- **Local-First** -- Data is stored in a local SQLite database with Qdrant for vector search

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Tauri 1.8 |
| Frontend | React 18, TypeScript 5, Vite 6 |
| Styling | Tailwind CSS 3, MUI 5, Emotion |
| Rich Text | TipTap 2 |
| Backend | Rust (Actix-web, Diesel ORM, Tokio) |
| Database | SQLite (Diesel), Qdrant (vector search) |
| AI/LLM | OpenAI, Anthropic, Gemini, Groq, llama.cpp |
| Agent Runtime | OpenClaw (bundled) |
| Auth | Google OAuth2, Microsoft OAuth2 |

## Getting Started

**1. Install prerequisites (macOS):**

```bash
xcode-select --install
curl https://sh.rustup.rs -sSf | sh
source "$HOME/.cargo/env"                    # add cargo to your PATH
brew install node                            # Node.js >= 16
npm install --global @tauri-apps/cli@^1      # Tauri CLI
```

<details>
<summary>Linux prerequisites</summary>

```bash
sudo apt install build-essential libssl-dev libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev
curl https://sh.rustup.rs -sSf | sh && source "$HOME/.cargo/env"
```
</details>

> **Note:** If you see a `MaxListenersExceededWarning` during `npm install`, it's harmless — just npm opening many download connections at once.

**2. Clone, install, and run:**

```bash
git clone https://github.com/knap-ai/knapsack_desktop.git
cd knapsack_desktop/src
npm install
cp .env.example .env
npm run tauri -- dev
```

> **Important:** All commands after `cd` must run from the **`src/`** directory. If you see `Missing script: "tauri"`, you're in the wrong directory.

This builds the Rust backend and opens the Knapsack desktop window. The first build takes a few minutes while Cargo downloads and compiles dependencies.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run build` | Compile TypeScript and build Vite assets |
| `npm run preview` | Preview the production build |
| `npm run tauri -- dev` | Run the full Tauri app in dev mode |
| `npm run tauri -- build` | Build the production desktop app |

All commands should be run from the `src/` directory.

## Environment Variables

See `.env.example` for details and links to where you create each credential. The defaults work for local development — you only need to add keys for the specific integrations you want to work on.

> **What's `VITE_`?** Vite (the frontend bundler) exposes any env var starting with `VITE_` to the React frontend. Variables without the prefix are only available to the Rust backend at compile time.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_KN_API_SERVER` | `http://localhost:8897` | Backend API URL. The default just works. |
| `MICROSOFT_CLIENT_ID` | `unused` | Azure AD app ID — only needed for Outlook/OneDrive. |
| `VITE_GOOGLE_CLIENT_ID` | *(empty)* | Google OAuth client ID — only needed for Drive/Calendar. |
| `VITE_GOOGLE_DEVELOPER_KEY` | *(empty)* | Google API key — only needed for Drive file listing. |
| `VITE_SENTRY_DSN` | *(empty)* | Sentry DSN for frontend error tracking. |
| `SENTRY_DSN` | *(empty)* | Sentry DSN for Rust backend error tracking. |
| `SENTRY_AUTH_TOKEN` | *(empty)* | Sentry auth token for source map uploads. |

## Authentication Modes

Knapsack supports two authentication modes:

### Default Mode (knap.ai)

By default, Knapsack uses knap.ai to handle OAuth token exchange. This is the simplest setup and is used by the official DMG releases. No additional configuration is required beyond setting `VITE_KN_API_SERVER=https://knap.ai`.

### Self-Hosted Mode

For fully self-hosted deployments that don't depend on knap.ai, you can configure Knapsack to exchange OAuth tokens directly with Google:

1. Create a Google Cloud project at https://console.cloud.google.com
2. Enable the Gmail, Google Drive, and Google Calendar APIs
3. Configure the OAuth consent screen
4. Create OAuth 2.0 credentials (Desktop application type)
5. Add `http://localhost:8897/api/knapsack/google/signin` as an authorized redirect URI
6. Set the following environment variables:
   ```bash
   export VITE_GOOGLE_CLIENT_ID=your-client-id
   export GOOGLE_CLIENT_SECRET=your-client-secret
   ```

When `GOOGLE_CLIENT_SECRET` is set at runtime, Knapsack will exchange OAuth codes directly with Google's token endpoint instead of routing through knap.ai.

## Project Structure

```
knapsack_desktop/
├── src/                          # Frontend + Tauri project
│   ├── src/                      # React application
│   │   ├── api/                  # API client functions
│   │   ├── automations/          # Automation definitions & steps
│   │   ├── components/
│   │   │   ├── atoms/            # Base UI elements
│   │   │   ├── molecules/        # Composite components
│   │   │   ├── organisms/        # Feature-level components
│   │   │   └── templates/        # Page layouts
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Route pages
│   │   └── utils/                # Shared utilities
│   │
│   ├── src-tauri/                # Rust backend
│   │   ├── src/
│   │   │   ├── api/              # Tauri command handlers
│   │   │   ├── audio/            # Microphone capture
│   │   │   ├── automations/      # Automation execution engine
│   │   │   ├── connections/      # Google & Microsoft OAuth + sync
│   │   │   ├── db/               # Database models & migrations
│   │   │   ├── llm/              # LLM orchestration
│   │   │   ├── memory/           # Semantic search (Qdrant)
│   │   │   ├── search/           # Search implementations
│   │   │   ├── server/           # Actix-web HTTP server
│   │   │   └── transcribe/       # Audio transcription
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.cjs
│
└── LICENSE                       # AGPL-3.0
```

## Building for Production

```bash
cd src
npm run tauri -- build
```

Bundled application output is written to `src/src-tauri/target/release/bundle/`.

## macOS Code Signing & Notarization

To distribute a macOS DMG that passes Gatekeeper, you must code sign and notarize the app. This process is required for users to run the app without security warnings.

### Prerequisites

1. **Apple Developer Account** -- Enroll at https://developer.apple.com ($99/year)
2. **Developer ID Application Certificate** -- Create in Apple Developer portal under Certificates, Identifiers & Profiles
3. **App-Specific Password** -- Generate at https://appleid.apple.com for notarization

### Import Your Certificate

```bash
# Import .p12 certificate to keychain (use single quotes if password has special characters)
security import /path/to/certificate.p12 -k ~/Library/Keychains/login.keychain-db -P 'your-password' -T /usr/bin/codesign

# Verify the certificate is installed
security find-identity -v -p codesigning
```

If the certificate shows as "not trusted", download the Apple Developer ID intermediate certificate:
1. Go to https://www.apple.com/certificateauthority/
2. Download "Developer ID - G2" certificate
3. Double-click to install in Keychain

### Create Node.js Entitlements File

The bundled Node.js binary requires JIT entitlements to run JavaScript with hardened runtime. Without these, Node will crash with SIGTRAP when executing any JavaScript.

Create `build/entitlements/node.entitlements.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

Entitlement explanations:
- `allow-jit` -- Required for V8's just-in-time compilation
- `allow-unsigned-executable-memory` -- Required for V8's memory management
- `disable-library-validation` -- Required to load native addons (.node files)

### Code Signing (Order Matters!)

Sign binaries from innermost to outermost. Replace `YOUR_TEAM_ID` with your Apple Team ID.

```bash
APP_PATH="src/src-tauri/target/release/bundle/macos/Knapsack.app"
IDENTITY="Developer ID Application: Your Name (YOUR_TEAM_ID)"
ENTITLEMENTS="build/entitlements/node.entitlements.plist"

# 1. Sign all native addon .node files
find "$APP_PATH" -name "*.node" -exec codesign --force --options runtime --timestamp --sign "$IDENTITY" {} \;

# 2. Sign all .dylib files
find "$APP_PATH" -name "*.dylib" -exec codesign --force --options runtime --timestamp --sign "$IDENTITY" {} \;

# 3. Sign standalone executables in node_modules
find "$APP_PATH" -type f \( -name "esbuild" -o -name "spawn-helper" -o -name "tsgolint" -o -name "ggml-metal" -o -name "llama-*" \) -exec codesign --force --options runtime --timestamp --sign "$IDENTITY" {} \;

# 4. Sign the Node.js binary WITH JIT entitlements
codesign --force --options runtime --timestamp \
  --entitlements "$ENTITLEMENTS" \
  --sign "$IDENTITY" \
  "$APP_PATH/Contents/Resources/resources/node/node"

# 5. Sign the main app bundle
codesign --force --options runtime --timestamp --sign "$IDENTITY" "$APP_PATH"

# 6. Verify the signature
codesign --verify --deep --strict --verbose=2 "$APP_PATH"
```

### Notarization

```bash
# Create a zip for notarization
cd src/src-tauri/target/release/bundle/macos
ditto -c -k --keepParent Knapsack.app Knapsack.zip

# Submit for notarization (--wait blocks until complete)
xcrun notarytool submit Knapsack.zip \
  --apple-id "your@email.com" \
  --team-id YOUR_TEAM_ID \
  --password "your-app-specific-password" \
  --wait

# If notarization fails, check the log
xcrun notarytool log <submission-id> \
  --apple-id "your@email.com" \
  --team-id YOUR_TEAM_ID \
  --password "your-app-specific-password"
```

### Staple the Notarization Ticket

After successful notarization, staple the ticket to the app so it works offline:

```bash
xcrun stapler staple src/src-tauri/target/release/bundle/macos/Knapsack.app
xcrun stapler staple src/src-tauri/target/release/bundle/dmg/Knapsack_0.9.47_x64.dmg
```

### Verify Everything Works

```bash
# Check entitlements on Node binary
codesign -d --entitlements - "$APP_PATH/Contents/Resources/resources/node/node"

# Test Node.js can execute JavaScript
"$APP_PATH/Contents/Resources/resources/node/node" -e "console.log('JIT works')"

# Verify Gatekeeper approval
spctl --assess --verbose=4 "$APP_PATH"
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `errSecInternalComponent` when signing | Unlock keychain: `security unlock-keychain ~/Library/Keychains/login.keychain-db` |
| Certificate "not trusted" | Install Apple Developer ID intermediate certificate |
| Notarization fails with unsigned binaries | Sign all .node, .dylib, and executable files before the main app |
| Node crashes with SIGTRAP | Missing JIT entitlements on node binary |
| "Developer cannot be verified" | App not notarized, or ticket not stapled |

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).
