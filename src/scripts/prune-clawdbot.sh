#!/usr/bin/env bash
#
# prune-clawdbot.sh — Removes devDependencies from the bundled clawdbot
# node_modules to reduce app bundle size.
#
# Runs automatically via the npm `prebuild` hook.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAWDBOT_DIR="$SCRIPT_DIR/../src-tauri/resources/clawdbot"

if [ ! -d "$CLAWDBOT_DIR/node_modules" ]; then
  echo "[prune-clawdbot] No node_modules found — skipping."
  exit 0
fi

BEFORE=$(du -sm "$CLAWDBOT_DIR/node_modules" | cut -f1)
echo "[prune-clawdbot] Pruning devDependencies from clawdbot/node_modules (${BEFORE} MB)…"

cd "$CLAWDBOT_DIR"
npm prune --production 2>/dev/null || npm prune --omit=dev 2>/dev/null || true

AFTER=$(du -sm "$CLAWDBOT_DIR/node_modules" | cut -f1)
echo "[prune-clawdbot] ✓ Pruned clawdbot/node_modules: ${BEFORE} MB → ${AFTER} MB"
