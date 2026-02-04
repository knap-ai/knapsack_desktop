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

## Prerequisites

- **Node.js** >= 16
- **Rust** >= 1.72
- **Tauri CLI** -- `npm install --global @tauri-apps/cli@^1`
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential`, `libssl-dev`, `libgtk-3-dev`, `libwebkit2gtk-4.0-dev`, `libayatana-appindicator3-dev`
  - **Windows**: Visual Studio Build Tools with C++ workload

## Getting Started

```bash
# Clone the repository
git clone https://github.com/knap-ai/knapsack_desktop.git
cd knapsack_desktop/src

# Install frontend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)

# Run in development mode
npm run tauri -- dev
```

This starts the Vite dev server on `http://localhost:1420` and the Rust backend on port `8897`, then opens the desktop window with hot reload.

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

| Variable | Description |
|----------|-------------|
| `VITE_KN_API_SERVER` | Backend API server URL |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token |

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
