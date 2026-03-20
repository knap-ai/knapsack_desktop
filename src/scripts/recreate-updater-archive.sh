#!/usr/bin/env bash
#
# recreate-updater-archive.sh — Recreates the .app.tar.gz updater archive
# and re-signs it after macOS code signing and notarization.
#
# After sign-and-notarize.sh modifies the .app bundle (codesigning,
# notarization, stapling), the original .app.tar.gz created by `tauri build`
# is stale — it contains the unsigned app. This script recreates the archive
# with the signed app and generates a new minisign signature.
#
# Requires:
#   TAURI_PRIVATE_KEY — minisign private key (same as used by tauri build)
#   TAURI_KEY_PASSWORD — private key password (optional)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Locate the bundle directory (universal or standard)
UNIVERSAL_BUNDLE="$PROJECT_DIR/src-tauri/target/universal-apple-darwin/release/bundle"
STANDARD_BUNDLE="$PROJECT_DIR/src-tauri/target/release/bundle"

if [ -d "$UNIVERSAL_BUNDLE/macos" ]; then
  BUNDLE_DIR="$UNIVERSAL_BUNDLE"
else
  BUNDLE_DIR="$STANDARD_BUNDLE"
fi

MACOS_DIR="$BUNDLE_DIR/macos"

# Find the .app bundle
APP_PATH=""
for app in "$MACOS_DIR"/*.app; do
  if [ -d "$app" ]; then
    APP_PATH="$app"
    break
  fi
done

if [ -z "$APP_PATH" ]; then
  echo "ERROR: No .app bundle found in $MACOS_DIR" >&2
  exit 1
fi

APP_NAME="$(basename "$APP_PATH")"
TAR_GZ_PATH="$MACOS_DIR/${APP_NAME}.tar.gz"

echo "[updater-archive] Recreating $TAR_GZ_PATH with signed .app..."

# Remove old archive and signature
rm -f "$TAR_GZ_PATH" "$TAR_GZ_PATH.sig"

# Create new gzipped tar archive
# Use -C to cd into the parent dir so the archive contains just the .app
tar -czf "$TAR_GZ_PATH" -C "$MACOS_DIR" "$APP_NAME"

echo "[updater-archive] Archive created: $(ls -lh "$TAR_GZ_PATH" | awk '{print $5}')"

# Re-sign with TAURI_PRIVATE_KEY using the tauri CLI signer
if [ -z "${TAURI_PRIVATE_KEY:-}" ]; then
  echo "ERROR: TAURI_PRIVATE_KEY is not set. Cannot sign the updater archive." >&2
  exit 1
fi

# Use tauri CLI to sign (it uses minisign under the hood)
echo "[updater-archive] Signing archive with TAURI_PRIVATE_KEY..."
npx tauri signer sign \
  --private-key "$TAURI_PRIVATE_KEY" \
  ${TAURI_KEY_PASSWORD:+--password "$TAURI_KEY_PASSWORD"} \
  "$TAR_GZ_PATH" 2>&1 || {
  # Fallback: try cargo-tauri if npx tauri is not available
  cargo tauri signer sign \
    --private-key "$TAURI_PRIVATE_KEY" \
    ${TAURI_KEY_PASSWORD:+--password "$TAURI_KEY_PASSWORD"} \
    "$TAR_GZ_PATH"
}

if [ ! -f "$TAR_GZ_PATH.sig" ]; then
  echo "ERROR: Signature file was not created at $TAR_GZ_PATH.sig" >&2
  exit 1
fi

echo "[updater-archive] Signature created: $TAR_GZ_PATH.sig"
echo "[updater-archive] Done — updater archive is ready with signed .app"
