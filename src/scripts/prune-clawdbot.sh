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
# Everything else is removed to save ~200 MB.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAWDBOT_DIR="$SCRIPT_DIR/../src-tauri/resources/clawdbot"

if [ ! -d "$CLAWDBOT_DIR/node_modules" ]; then
  echo "[prune-clawdbot] No node_modules found — skipping."
  exit 0
fi

BEFORE=$(du -sm "$CLAWDBOT_DIR/node_modules" | cut -f1)
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

echo "[prune-clawdbot] 1/3 Removing ${#UNUSED_EXTENSIONS[@]} unused extensions…"
for ext in "${UNUSED_EXTENSIONS[@]}"; do
  if [ -d "$CLAWDBOT_DIR/extensions/$ext" ]; then
    rm -rf "$CLAWDBOT_DIR/extensions/$ext"
  fi
done

# ── Step 2: Remove unused heavy packages ────────────────────────────────
# Production dependencies that Knapsack Desktop never imports at runtime.
# Sorted roughly by size (largest first).

UNUSED_PACKAGES=(
  # ── Peer deps / local LLM (not used — desktop uses API providers) ──
  "@node-llama-cpp"           # ~677 MB (gitignored but may exist on disk)
  "node-llama-cpp"            # ~27 MB

  # ── PDF / canvas / image processing (not imported at runtime) ──
  "pdfjs-dist"                # ~36 MB
  "@napi-rs"                  # ~32 MB (@napi-rs/canvas + native binaries)
  "@img"                      # ~17 MB (sharp native binaries, gitignored but may exist)
  "sharp"                     # ~1 MB

  # ── Channel SDKs for removed extensions ──
  "@larksuiteoapi"            # ~24 MB (Feishu/Lark)
  "@line"                     # ~3 MB  (LINE)
  "@buape/carbon"             # ~1 MB

  # ── Build tools that shouldn't be in production bundle ──
  "typescript"                # ~23 MB

  # ── Runtime polyfills / unused utilities ──
  "@cloudflare"               # ~9 MB  (Workers runtime — not used in desktop)
  "web-streams-polyfill"      # ~9 MB  (not needed on Node 22+)
  "bun-types"                 # ~2 MB  (Bun type defs — not needed at runtime)
  "@mariozechner/pi-tui"      # ~1 MB  (TUI mode only — desktop doesn't use)
  "@homebridge/ciao"          # ~1 MB  (mDNS — not used)
  "@lydell/node-pty"          # ~1 MB  (PTY — Knapsack uses Tauri terminal)
  "@mozilla/readability"      # ~1 MB  (not imported at runtime)
  "linkedom"                  # ~1 MB  (not imported at runtime)
  "long"                      # ~1 MB  (not imported at runtime)
  "proper-lockfile"           # ~1 MB  (not imported at runtime)
  "signal-utils"              # ~1 MB  (not imported at runtime)
  "sqlite-vec"                # ~1 MB  (not imported at runtime)
)

echo "[prune-clawdbot] 2/3 Removing ${#UNUSED_PACKAGES[@]} unused packages…"
for pkg in "${UNUSED_PACKAGES[@]}"; do
  target="$CLAWDBOT_DIR/node_modules/$pkg"
  if [ -d "$target" ]; then
    size=$(du -sm "$target" | cut -f1)
    SAVED=$((SAVED + size))
    rm -rf "$target"
    echo "[prune-clawdbot]     removed $pkg (${size} MB)"
  fi
done

# ── Step 3: Clean up .cache, docs, and source maps ─────────────────────
echo "[prune-clawdbot] 3/3 Cleaning up ancillary files…"

# Remove any leftover .cache directories
find "$CLAWDBOT_DIR/node_modules" -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true

# Remove docs/examples directories inside node_modules (saves a few MB)
find "$CLAWDBOT_DIR/node_modules" -type d \( -name "docs" -o -name "example" -o -name "examples" -o -name "test" -o -name "tests" -o -name "__tests__" \) -exec rm -rf {} + 2>/dev/null || true

# Remove source maps (*.map) — not needed at runtime
find "$CLAWDBOT_DIR/node_modules" -name "*.map" -type f -delete 2>/dev/null || true

AFTER=$(du -sm "$CLAWDBOT_DIR/node_modules" | cut -f1)
AFTER_EXT=$(du -sm "$CLAWDBOT_DIR/extensions" 2>/dev/null | cut -f1 || echo 0)
TOTAL_SAVED=$(( (BEFORE + BEFORE_EXT) - (AFTER + AFTER_EXT) ))
echo "[prune-clawdbot] ✓ Pruned: node_modules ${BEFORE} MB → ${AFTER} MB, extensions ${BEFORE_EXT} MB → ${AFTER_EXT} MB"
echo "[prune-clawdbot] ✓ Total saved: ~${TOTAL_SAVED} MB"
