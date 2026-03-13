#!/usr/bin/env bash
#
# prune-clawdbot.sh — Removes unused extensions, heavy packages, and build-only
# dependencies from the bundled clawdbot to reduce the Tauri app bundle size.
#
# Runs automatically via the npm `prebuild` hook before `tauri build`.
#
# Knapsack Desktop only uses these channels:
#   discord, slack, telegram, signal, whatsapp, imessage, irc, googlechat
# and these utility extensions:
#   memory-core, memory-lancedb, llm-task, device-pair, diagnostics-otel,
#   thread-ownership, phone-control, voice-call, talk-voice
#
# Everything else is removed to save ~500+ MB.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAWDBOT_DIR="$SCRIPT_DIR/../src-tauri/resources/clawdbot"

if [ ! -d "$CLAWDBOT_DIR/node_modules" ]; then
  echo "[prune-clawdbot] No node_modules found — skipping."
  exit 0
fi

NM="$CLAWDBOT_DIR/node_modules"

BEFORE=$(du -sm "$NM" | cut -f1)
BEFORE_EXT=$(du -sm "$CLAWDBOT_DIR/extensions" 2>/dev/null | cut -f1 || echo 0)
echo "[prune-clawdbot] Pruning clawdbot bundle (node_modules: ${BEFORE} MB, extensions: ${BEFORE_EXT} MB)…"

SAVED=0

# ── Step 1: Remove unused extensions ────────────────────────────────────
# Extensions not used by the desktop app.  The gateway discovers extensions
# at runtime from the extensions/ directory — missing dirs simply means
# those channels aren't available.

UNUSED_EXTENSIONS=(
  bluebubbles
  copilot-proxy
  feishu
  google-antigravity-auth
  google-gemini-cli-auth
  line
  lobster
  matrix
  mattermost
  minimax-portal-auth
  msteams
  nextcloud-talk
  nostr
  open-prose
  qwen-portal-auth
  tlon
  twitch
  zalo
  zalouser
)

echo "[prune-clawdbot] 1/4 Removing ${#UNUSED_EXTENSIONS[@]} unused extensions…"
for ext in "${UNUSED_EXTENSIONS[@]}"; do
  if [ -d "$CLAWDBOT_DIR/extensions/$ext" ]; then
    rm -rf "$CLAWDBOT_DIR/extensions/$ext"
  fi
done

# ── Step 2: Remove unused heavy packages ────────────────────────────────
# Production dependencies that Knapsack Desktop never imports at runtime.
# Sorted roughly by size (largest first).

UNUSED_PACKAGES=(
  # ── Local LLM / model inference (not used — desktop uses API providers) ──
  "@node-llama-cpp"           # ~677 MB (native LLM binaries)
  "node-llama-cpp"            # ~27 MB

  # ── PDF / canvas / image processing (not imported at runtime) ──
  "@napi-rs"                  # ~62 MB (@napi-rs/canvas + native binaries)
  "pdfjs-dist"                # ~38 MB
  "@img"                      # ~17 MB (sharp native binaries)
  "sharp"                     # ~1 MB
  "@silvia-odwyer"            # ~3 MB  (photon image processing)

  # ── Channel SDKs for removed extensions ──
  "@larksuiteoapi"            # ~25 MB (Feishu/Lark)
  "@line"                     # ~15 MB (LINE)
  "@buape"                    # ~3 MB  (Carbon framework)

  # ── Build tools (not needed at runtime) ──
  "typescript"                # ~23 MB
  "cmake-js"                  # ~2 MB  (native module build tool)
  "rimraf"                    # ~4 MB  (file deletion utility)
  "@babel"                    # ~2 MB  (JS compiler)
  "@vitest"                   # ~1 MB  (test framework)
  "@esbuild"                  # ~1 MB  (bundler)

  # ── AI provider SDKs not used by desktop ──
  "@mistralai"                # ~17 MB (desktop uses Knapsack API, not direct SDKs)
  "@mariozechner"             # ~22 MB (pi-tui, pi-agent-core — TUI mode only)

  # ── Cloud / infra SDKs (not used in desktop) ──
  "@aws-sdk"                  # ~12 MB
  "@aws-crypto"               # ~2 MB
  "@smithy"                   # ~9 MB  (AWS SDK internals)
  "@cloudflare"               # ~10 MB (Workers runtime)
  "@octokit"                  # ~12 MB (GitHub API)
  "octokit"                   # ~1 MB

  # ── Browser automation (not needed) ──
  "playwright-core"           # ~10 MB

  # ── Runtime polyfills / unused utilities ──
  "web-streams-polyfill"      # ~9 MB  (not needed on Node 22+)
  "bun-types"                 # ~4 MB  (Bun type defs)
  "@types"                    # ~4 MB  (TypeScript type definitions)
  "highlight.js"              # ~3 MB  (syntax highlighting — not used at runtime)
  "undici"                    # ~3 MB  (HTTP client — Node 22 has built-in fetch)
  "ipull"                     # ~2 MB  (download utility for models)
  "simple-git"                # ~2 MB  (git operations — not needed at runtime)
  "@tootallnate"              # ~2 MB  (proxy utilities)
  "@huggingface"              # ~1 MB  (model hub — not used in desktop)
  "@homebridge/ciao"          # ~1 MB  (mDNS — not used)
  "@lydell/node-pty"          # ~1 MB  (PTY — Knapsack uses Tauri terminal)
  "@mozilla/readability"      # ~1 MB  (not imported at runtime)
  "linkedom"                  # ~1 MB  (HTML DOM emulation)
  "long"                      # ~1 MB
  "proper-lockfile"           # ~1 MB
  "signal-utils"              # ~1 MB
  "sqlite-vec"                # ~1 MB
  "sqlite-vec-linux-x64"      # ~1 MB  (wrong platform for macOS)
  "@typescript"               # ~1 MB
  "@clack"                    # ~1 MB  (CLI prompts — not used in desktop)
  "@oxlint"                   # ~1 MB  (linter — build tool)
  "@oxlint-tsgolint"          # ~1 MB
  "@oxfmt"                    # ~1 MB  (formatter — build tool)
  "@oxc-project"              # ~1 MB  (JS toolchain — build tool)
  "@rollup"                   # ~1 MB  (bundler)
  "@rolldown"                 # ~1 MB  (bundler)
)

echo "[prune-clawdbot] 2/4 Removing ${#UNUSED_PACKAGES[@]} unused packages…"
for pkg in "${UNUSED_PACKAGES[@]}"; do
  target="$NM/$pkg"
  if [ -d "$target" ]; then
    size=$(du -sm "$target" | cut -f1)
    SAVED=$((SAVED + size))
    rm -rf "$target"
    echo "[prune-clawdbot]     removed $pkg (${size} MB)"
  fi
done

# ── Step 3: Aggressive file-level cleanup ────────────────────────────────
echo "[prune-clawdbot] 3/4 Cleaning up ancillary files…"

# Remove .cache directories
find "$NM" -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true

# Remove docs/examples/test directories
find "$NM" -type d \( \
  -name "docs" -o -name "doc" -o \
  -name "example" -o -name "examples" -o \
  -name "test" -o -name "tests" -o -name "__tests__" -o \
  -name "benchmark" -o -name "benchmarks" -o \
  -name ".github" -o -name ".vscode" -o \
  -name "fixtures" -o -name "coverage" \
\) -exec rm -rf {} + 2>/dev/null || true

# Remove source maps (*.map) — not needed at runtime
find "$NM" -name "*.map" -type f -delete 2>/dev/null || true

# Remove TypeScript declaration files — not needed at runtime
find "$NM" -name "*.d.ts" -type f -delete 2>/dev/null || true
find "$NM" -name "*.d.mts" -type f -delete 2>/dev/null || true
find "$NM" -name "*.d.cts" -type f -delete 2>/dev/null || true

# Remove documentation and metadata files
find "$NM" \( \
  -name "README.md" -o -name "README" -o -name "readme.md" -o \
  -name "CHANGELOG.md" -o -name "CHANGELOG" -o -name "changelog.md" -o \
  -name "HISTORY.md" -o -name "CHANGES.md" -o \
  -name "LICENSE.md" -o -name "LICENSE.txt" -o -name "LICENSE" -o -name "license" -o \
  -name "NOTICE" -o -name "NOTICE.md" -o \
  -name "AUTHORS" -o -name "AUTHORS.md" -o \
  -name "CONTRIBUTORS.md" -o \
  -name ".npmignore" -o -name ".eslintrc*" -o -name ".prettierrc*" -o \
  -name ".editorconfig" -o -name ".babelrc" -o \
  -name "tsconfig.json" -o -name "tsconfig.*.json" -o \
  -name "tslint.json" -o \
  -name ".travis.yml" -o -name "appveyor.yml" -o \
  -name "Makefile" -o -name "Gruntfile.js" -o -name "Gulpfile.js" -o \
  -name "*.tsbuildinfo" -o \
  -name "*.ts.map" \
\) -type f -delete 2>/dev/null || true

# ── Step 4: Remove clawdbot non-essential top-level dirs ─────────────────
echo "[prune-clawdbot] 4/4 Removing non-essential clawdbot directories…"

# Remove clawdbot docs if present (not needed in bundle)
if [ -d "$CLAWDBOT_DIR/docs" ]; then
  docs_size=$(du -sm "$CLAWDBOT_DIR/docs" | cut -f1)
  SAVED=$((SAVED + docs_size))
  rm -rf "$CLAWDBOT_DIR/docs"
  echo "[prune-clawdbot]     removed clawdbot/docs (${docs_size} MB)"
fi

# Remove clawdbot .git if somehow present
if [ -d "$CLAWDBOT_DIR/.git" ]; then
  git_size=$(du -sm "$CLAWDBOT_DIR/.git" | cut -f1)
  SAVED=$((SAVED + git_size))
  rm -rf "$CLAWDBOT_DIR/.git"
  echo "[prune-clawdbot]     removed clawdbot/.git (${git_size} MB)"
fi

AFTER=$(du -sm "$NM" | cut -f1)
AFTER_EXT=$(du -sm "$CLAWDBOT_DIR/extensions" 2>/dev/null | cut -f1 || echo 0)
TOTAL_SAVED=$(( (BEFORE + BEFORE_EXT) - (AFTER + AFTER_EXT) ))
echo "[prune-clawdbot] ✓ Pruned: node_modules ${BEFORE} MB → ${AFTER} MB, extensions ${BEFORE_EXT} MB → ${AFTER_EXT} MB"
echo "[prune-clawdbot] ✓ Total saved: ~${TOTAL_SAVED} MB"
