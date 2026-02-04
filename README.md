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
| `VITE_GOOGLE_CLIENT_ID` | *(Knapsack project ID)* | Google OAuth client ID — works out of the box. |
| `VITE_GOOGLE_DEVELOPER_KEY` | *(empty)* | Google API key — only needed for Drive file listing. |
| `VITE_SENTRY_DSN` | *(empty)* | Sentry DSN for frontend error tracking. |
| `SENTRY_DSN` | *(empty)* | Sentry DSN for Rust backend error tracking. |
| `SENTRY_AUTH_TOKEN` | *(empty)* | Sentry auth token for source map uploads. |

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

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).
