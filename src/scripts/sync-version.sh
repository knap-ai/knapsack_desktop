#!/usr/bin/env bash
#
# sync-version.sh — Syncs package-lock.json version with package.json
#
# Runs automatically via the npm `prebuild` hook so the lockfile
# version never drifts from the source of truth in package.json.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PKG_VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")
LOCK_FILE="$PROJECT_DIR/package-lock.json"

if [ ! -f "$LOCK_FILE" ]; then
  echo "[sync-version] No package-lock.json found — skipping."
  exit 0
fi

LOCK_VERSION=$(node -p "require('$LOCK_FILE').version")

if [ "$LOCK_VERSION" = "$PKG_VERSION" ]; then
  echo "[sync-version] package-lock.json already at v$PKG_VERSION — skipping."
  exit 0
fi

echo "[sync-version] Updating package-lock.json from v$LOCK_VERSION to v$PKG_VERSION…"

# Update both top-level "version" and packages[""].version
node -e "
const fs = require('fs');
const lock = JSON.parse(fs.readFileSync('$LOCK_FILE', 'utf8'));
lock.version = '$PKG_VERSION';
if (lock.packages && lock.packages['']) {
  lock.packages[''].version = '$PKG_VERSION';
}
fs.writeFileSync('$LOCK_FILE', JSON.stringify(lock, null, 2) + '\n');
"

echo "[sync-version] ✓ package-lock.json synced to v$PKG_VERSION"
