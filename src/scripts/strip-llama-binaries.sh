#!/usr/bin/env bash
#
# strip-llama-binaries.sh — Post-build script for macOS notarization.
#
# Removes unsigned node-llama-cpp binaries from the .app bundle (the app
# gracefully falls back to remote providers when they're missing) and
# re-signs the main binary + bundle with hardened runtime & secure timestamp
# so that xcrun notarytool accepts the submission.
#
# Usage:
#   cd src/
#   npm run tauri -- build
#   bash scripts/strip-llama-binaries.sh
#
# Environment variables:
#   SIGN_IDENTITY  — Developer ID Application certificate name or SHA-1.
#                    Auto-detected from the keychain when not set.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENTITLEMENTS="$PROJECT_DIR/src-tauri/tauri.entitlements"
BUNDLE_DIR="$PROJECT_DIR/src-tauri/target/release/bundle/macos"

# ---------------------------------------------------------------------------
# Locate the .app bundle
# ---------------------------------------------------------------------------
APP_PATH=""
for app in "$BUNDLE_DIR"/*.app; do
  if [ -d "$app" ]; then
    APP_PATH="$app"
    break
  fi
done

if [ -z "$APP_PATH" ]; then
  echo "ERROR: No .app bundle found in $BUNDLE_DIR" >&2
  exit 1
fi

echo "[strip-llama] Found app bundle: $APP_PATH"

CONTENTS="$APP_PATH/Contents"

# ---------------------------------------------------------------------------
# Verify entitlements file exists
# ---------------------------------------------------------------------------
if [ ! -f "$ENTITLEMENTS" ]; then
  echo "ERROR: Entitlements file not found at $ENTITLEMENTS" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Detect or use provided signing identity
# ---------------------------------------------------------------------------
if [ -z "${SIGN_IDENTITY:-}" ]; then
  SIGN_IDENTITY=$(security find-identity -v -p codesigning | \
    grep "Developer ID Application" | \
    head -1 | \
    sed -E 's/.*"(Developer ID Application[^"]+)".*/\1/')

  if [ -z "$SIGN_IDENTITY" ]; then
    echo "ERROR: No Developer ID Application certificate found in keychain." >&2
    echo "       Set SIGN_IDENTITY env var or install a valid certificate." >&2
    exit 1
  fi
fi

echo "[strip-llama] Signing identity: $SIGN_IDENTITY"

# ---------------------------------------------------------------------------
# 1. Strip node-llama-cpp binaries from the bundle
# ---------------------------------------------------------------------------
RESOURCES="$CONTENTS/Resources"
LLAMA_DIR="$RESOURCES/resources/clawdbot/node_modules/node-llama-cpp"

if [ -d "$LLAMA_DIR" ]; then
  echo "[strip-llama] Removing node-llama-cpp directory..."
  rm -rf "$LLAMA_DIR"
  echo "[strip-llama]   Removed: $LLAMA_DIR"
else
  echo "[strip-llama] node-llama-cpp directory not found (already absent) — skipping."
fi

# Also remove any hoisted node-llama-cpp artifacts (e.g. .node, .dylib, .so)
echo "[strip-llama] Scanning for stray node-llama-cpp binaries..."
STRAY_COUNT=0
while IFS= read -r -d '' f; do
  echo "[strip-llama]   Removing stray: $f"
  rm -f "$f"
  STRAY_COUNT=$((STRAY_COUNT + 1))
done < <(find "$RESOURCES" -path "*/node-llama-cpp*" \( -name "*.node" -o -name "*.dylib" -o -name "*.so" \) -print0 2>/dev/null || true)

echo "[strip-llama] Removed $STRAY_COUNT stray binary file(s)."

# ---------------------------------------------------------------------------
# 2. Clear extended attributes
# ---------------------------------------------------------------------------
echo "[strip-llama] Clearing extended attributes..."
xattr -cr "$APP_PATH"

# ---------------------------------------------------------------------------
# 3. Re-sign the main binary with hardened runtime + secure timestamp
# ---------------------------------------------------------------------------
MAIN_BINARY="$CONTENTS/MacOS/Knapsack"

if [ ! -f "$MAIN_BINARY" ]; then
  echo "ERROR: Main binary not found at $MAIN_BINARY" >&2
  exit 1
fi

echo "[strip-llama] Signing main binary: $MAIN_BINARY"
codesign --force --options runtime --timestamp \
  --entitlements "$ENTITLEMENTS" \
  --sign "$SIGN_IDENTITY" \
  "$MAIN_BINARY"

# ---------------------------------------------------------------------------
# 4. Re-sign the .app bundle (must come last — inside-out signing order)
# ---------------------------------------------------------------------------
echo "[strip-llama] Signing app bundle: $APP_PATH"
codesign --force --options runtime --timestamp \
  --entitlements "$ENTITLEMENTS" \
  --sign "$SIGN_IDENTITY" \
  "$APP_PATH"

# ---------------------------------------------------------------------------
# 5. Verify the signature
# ---------------------------------------------------------------------------
echo "[strip-llama] Verifying signature..."
codesign --verify --deep --strict --verbose=2 "$APP_PATH"
echo "[strip-llama] Signature verification passed."

# ---------------------------------------------------------------------------
# 6. Print notarization instructions
# ---------------------------------------------------------------------------
APP_NAME="$(basename "$APP_PATH" .app)"
ZIP_NAME="${APP_NAME}.zip"

cat <<EOF

================================================================================
  NOTARIZATION INSTRUCTIONS
================================================================================

1. Create a zip for notarization:

   cd "$BUNDLE_DIR"
   ditto -c -k --keepParent "$APP_PATH" "$ZIP_NAME"

2. Submit to Apple notarytool:

   xcrun notarytool submit "$BUNDLE_DIR/$ZIP_NAME" \\
     --apple-id "YOUR_APPLE_ID" \\
     --team-id "YOUR_TEAM_ID" \\
     --password "YOUR_APP_SPECIFIC_PASSWORD" \\
     --wait

3. Once approved, staple the notarization ticket:

   xcrun stapler staple "$APP_PATH"

4. Verify stapling:

   spctl --assess --type execute --verbose=2 "$APP_PATH"

================================================================================
EOF

echo "[strip-llama] Done."
