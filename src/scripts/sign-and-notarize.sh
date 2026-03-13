#!/usr/bin/env bash
#
# sign-and-notarize.sh — Complete macOS code-signing & notarization script.
#
# 1. Strips unsigned node-llama-cpp binaries (app falls back to remote providers)
# 2. Signs ALL embedded binaries inside-out (.node → .dylib → executables → Node.js → main → bundle)
# 3. Optionally notarizes + staples the app
#
# Usage:
#   cd src/
#   npm run tauri -- build
#   bash scripts/sign-and-notarize.sh           # sign only
#   bash scripts/sign-and-notarize.sh --notarize # sign + notarize + staple
#
# Environment variables (set in .env.signing or export before running):
#
#   SIGN_IDENTITY       — Developer ID Application certificate name or SHA-1.
#                         Auto-detected from keychain when not set.
#   APPLE_ID            — Your Apple ID email (required for --notarize)
#   APPLE_TEAM_ID       — Your Apple Developer Team ID (required for --notarize)
#   APPLE_APP_PASSWORD  — App-specific password from https://appleid.apple.com
#                         (required for --notarize)
#
# You can store these in src/.env.signing (git-ignored) to avoid re-entering:
#
#   export SIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)"
#   export APPLE_ID="your@email.com"
#   export APPLE_TEAM_ID="TEAMID"
#   export APPLE_APP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
DO_NOTARIZE=false
for arg in "$@"; do
  case "$arg" in
    --notarize) DO_NOTARIZE=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------------------------------------------------------------------------
# Source .env.signing if it exists
# ---------------------------------------------------------------------------
if [ -f "$PROJECT_DIR/.env.signing" ]; then
  echo "[sign] Loading credentials from .env.signing"
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.env.signing"
fi

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
APP_ENTITLEMENTS="$PROJECT_DIR/src-tauri/tauri.entitlements"
NODE_ENTITLEMENTS="$PROJECT_DIR/../build/entitlements/node.entitlements.plist"
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

echo "[sign] Found app bundle: $APP_PATH"
CONTENTS="$APP_PATH/Contents"

# ---------------------------------------------------------------------------
# Verify the .app version matches package.json (catch stale builds)
# ---------------------------------------------------------------------------
EXPECTED_VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")
APP_VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$CONTENTS/Info.plist" 2>/dev/null || echo "unknown")

if [ "$APP_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "ERROR: App version mismatch — signing a stale build!" >&2
  echo "       package.json version: $EXPECTED_VERSION" >&2
  echo "       .app bundle version:  $APP_VERSION" >&2
  echo "       Run 'npm run tauri build' to rebuild with the current version." >&2
  exit 1
fi
echo "[sign] Version verified: $APP_VERSION"

# ---------------------------------------------------------------------------
# Verify entitlements files exist
# ---------------------------------------------------------------------------
for f in "$APP_ENTITLEMENTS" "$NODE_ENTITLEMENTS"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Entitlements file not found: $f" >&2
    exit 1
  fi
done

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

echo "[sign] Signing identity: $SIGN_IDENTITY"

# ---------------------------------------------------------------------------
# 1. Strip node-llama-cpp binaries (unsigned, not needed — remote fallback)
# ---------------------------------------------------------------------------
RESOURCES="$CONTENTS/Resources"
# Remove both node-llama-cpp and @node-llama-cpp (scoped package)
for LLAMA_DIR in \
  "$RESOURCES/resources/clawdbot/node_modules/node-llama-cpp" \
  "$RESOURCES/resources/clawdbot/node_modules/@node-llama-cpp"; do
  if [ -d "$LLAMA_DIR" ]; then
    echo "[sign] Removing $(basename "$LLAMA_DIR") directory..."
    rm -rf "$LLAMA_DIR"
  fi
done

# Remove hoisted node-llama-cpp artifacts (matches both scoped and unscoped)
while IFS= read -r -d '' f; do
  echo "[sign]   Removing stray llama binary: $f"
  rm -f "$f"
done < <(find "$RESOURCES" \( -path "*/node-llama-cpp*" -o -path "*/@node-llama-cpp*" \) \( -name "*.node" -o -name "*.dylib" -o -name "*.so" \) -print0 2>/dev/null || true)

# ---------------------------------------------------------------------------
# 2. Clear extended attributes
# ---------------------------------------------------------------------------
echo "[sign] Clearing extended attributes..."
xattr -cr "$APP_PATH"

# ---------------------------------------------------------------------------
# 3. Sign all native .node addon files
# ---------------------------------------------------------------------------
echo "[sign] Signing .node native addons..."
NODE_COUNT=0
while IFS= read -r -d '' f; do
  codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY" "$f"
  NODE_COUNT=$((NODE_COUNT + 1))
done < <(find "$APP_PATH" -name "*.node" -print0 2>/dev/null || true)
echo "[sign]   Signed $NODE_COUNT .node file(s)"

# ---------------------------------------------------------------------------
# 4. Sign all .dylib and .so files
# ---------------------------------------------------------------------------
echo "[sign] Signing .dylib and .so files..."
DYLIB_COUNT=0
while IFS= read -r -d '' f; do
  codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY" "$f"
  DYLIB_COUNT=$((DYLIB_COUNT + 1))
done < <(find "$APP_PATH" \( -name "*.dylib" -o -name "*.so" \) -print0 2>/dev/null || true)
echo "[sign]   Signed $DYLIB_COUNT .dylib/.so file(s)"

# ---------------------------------------------------------------------------
# 5. Sign standalone executables in node_modules
# ---------------------------------------------------------------------------
echo "[sign] Signing standalone executables..."
EXEC_COUNT=0
while IFS= read -r -d '' f; do
  codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY" "$f"
  EXEC_COUNT=$((EXEC_COUNT + 1))
done < <(find "$APP_PATH" -type f \( -name "esbuild" -o -name "spawn-helper" -o -name "tsgolint" -o -name "ggml-metal" -o -name "llama-*" \) -print0 2>/dev/null || true)
echo "[sign]   Signed $EXEC_COUNT executable(s)"

# ---------------------------------------------------------------------------
# 6. Sign the bundled Node.js binary WITH JIT entitlements
# ---------------------------------------------------------------------------
NODE_BINARY="$CONTENTS/Resources/resources/node/node"
if [ -f "$NODE_BINARY" ]; then
  echo "[sign] Signing Node.js binary (with JIT entitlements): $NODE_BINARY"
  codesign --force --options runtime --timestamp \
    --entitlements "$NODE_ENTITLEMENTS" \
    --sign "$SIGN_IDENTITY" \
    "$NODE_BINARY"
else
  echo "WARNING: Bundled Node.js binary not found at $NODE_BINARY" >&2
fi

# ---------------------------------------------------------------------------
# 7. Sign the main Knapsack binary
# ---------------------------------------------------------------------------
MAIN_BINARY="$CONTENTS/MacOS/Knapsack"
if [ ! -f "$MAIN_BINARY" ]; then
  echo "ERROR: Main binary not found at $MAIN_BINARY" >&2
  exit 1
fi

echo "[sign] Signing main binary: $MAIN_BINARY"
codesign --force --options runtime --timestamp \
  --entitlements "$APP_ENTITLEMENTS" \
  --sign "$SIGN_IDENTITY" \
  "$MAIN_BINARY"

# ---------------------------------------------------------------------------
# 8. Sign the .app bundle (must come last — inside-out signing order)
# ---------------------------------------------------------------------------
echo "[sign] Signing app bundle: $APP_PATH"
codesign --force --options runtime --timestamp \
  --entitlements "$APP_ENTITLEMENTS" \
  --sign "$SIGN_IDENTITY" \
  "$APP_PATH"

# ---------------------------------------------------------------------------
# 9. Verify the signature
# ---------------------------------------------------------------------------
echo "[sign] Verifying signature..."
codesign --verify --deep --strict --verbose=2 "$APP_PATH"
echo "[sign] Signature verification passed."

# ---------------------------------------------------------------------------
# 10. Notarize (if requested)
# ---------------------------------------------------------------------------
if [ "$DO_NOTARIZE" = true ]; then
  # Validate required env vars
  for var in APPLE_ID APPLE_TEAM_ID APPLE_APP_PASSWORD; do
    if [ -z "${!var:-}" ]; then
      echo "ERROR: $var is required for notarization." >&2
      echo "       Set it in .env.signing or export it before running." >&2
      exit 1
    fi
  done

  APP_NAME="$(basename "$APP_PATH" .app)"
  ZIP_PATH="$BUNDLE_DIR/${APP_NAME}.zip"

  echo "[notarize] Creating zip: $ZIP_PATH"
  ditto -c -k --keepParent "$APP_PATH" "$ZIP_PATH"

  echo "[notarize] Submitting to Apple (this may take a few minutes)..."
  SUBMIT_OUTPUT=$(xcrun notarytool submit "$ZIP_PATH" \
    --apple-id "$APPLE_ID" \
    --team-id "$APPLE_TEAM_ID" \
    --password "$APPLE_APP_PASSWORD" \
    --wait 2>&1) || true
  echo "$SUBMIT_OUTPUT"

  # Extract submission ID and status
  SUBMISSION_ID=$(echo "$SUBMIT_OUTPUT" | grep -E '^\s*id:' | head -1 | awk '{print $2}')
  NOTARY_STATUS=$(echo "$SUBMIT_OUTPUT" | grep -E '^\s*status:' | tail -1 | awk '{print $2}')

  if [ "$NOTARY_STATUS" != "Accepted" ]; then
    echo "[notarize] ERROR: Notarization failed with status: $NOTARY_STATUS" >&2
    if [ -n "$SUBMISSION_ID" ]; then
      echo "[notarize] Fetching rejection log..." >&2
      xcrun notarytool log "$SUBMISSION_ID" \
        --apple-id "$APPLE_ID" \
        --team-id "$APPLE_TEAM_ID" \
        --password "$APPLE_APP_PASSWORD" || true
    fi
    exit 1
  fi

  echo "[notarize] Stapling notarization ticket to .app..."
  xcrun stapler staple "$APP_PATH"

  # Recreate DMG with the stapled .app, then notarize & staple the DMG
  DMG_DIR="$BUNDLE_DIR/../dmg"
  if [ -d "$DMG_DIR" ]; then
    # Find the architecture suffix from the existing DMG filename
    EXISTING_DMG=$(find "$DMG_DIR" -name "*.dmg" -print -quit 2>/dev/null || true)
    if [ -n "$EXISTING_DMG" ]; then
      DMG_PATH="$EXISTING_DMG"
      echo "[notarize] Recreating DMG with stapled .app: $DMG_PATH"

      # Create a fresh DMG containing the signed+stapled .app
      DMG_TEMP="$(mktemp -d /tmp/knapsack-dmg.XXXXXX)"
      cp -R "$APP_PATH" "$DMG_TEMP/"
      ln -s /Applications "$DMG_TEMP/Applications"
      rm -f "$DMG_PATH"
      hdiutil create -volname "$APP_NAME" -srcfolder "$DMG_TEMP" \
        -ov -format UDZO "$DMG_PATH"
      rm -rf "$DMG_TEMP"

      # Sign the DMG
      echo "[notarize] Signing DMG..."
      codesign --force --timestamp --sign "$SIGN_IDENTITY" "$DMG_PATH"

      # Notarize the DMG
      echo "[notarize] Submitting DMG to Apple for notarization..."
      DMG_SUBMIT_OUTPUT=$(xcrun notarytool submit "$DMG_PATH" \
        --apple-id "$APPLE_ID" \
        --team-id "$APPLE_TEAM_ID" \
        --password "$APPLE_APP_PASSWORD" \
        --wait 2>&1) || true
      echo "$DMG_SUBMIT_OUTPUT"

      DMG_STATUS=$(echo "$DMG_SUBMIT_OUTPUT" | grep -E '^\s*status:' | tail -1 | awk '{print $2}')
      if [ "$DMG_STATUS" = "Accepted" ]; then
        echo "[notarize] Stapling DMG..."
        xcrun stapler staple "$DMG_PATH"
      else
        echo "[notarize] ERROR: DMG notarization failed with status: $DMG_STATUS" >&2
        echo "[notarize]        An unnotarized DMG will show 'damaged' on user machines." >&2
        echo "[notarize]        Fix the issue and re-run, or users cannot open the app." >&2
        exit 1
      fi
    fi
  fi

  echo "[notarize] Verifying Gatekeeper approval..."
  spctl --assess --type execute --verbose=2 "$APP_PATH"

  echo "[notarize] Done! App is signed, notarized, and stapled."
else
  cat <<EOF

================================================================================
  SIGNING COMPLETE — Next Steps
================================================================================

To notarize, either:

  A) Re-run with --notarize flag (requires APPLE_ID, APPLE_TEAM_ID,
     APPLE_APP_PASSWORD in .env.signing or environment):

     bash scripts/sign-and-notarize.sh --notarize

  B) Or manually:

     cd "$BUNDLE_DIR"
     ditto -c -k --keepParent "$(basename "$APP_PATH")" "$(basename "$APP_PATH" .app).zip"
     xcrun notarytool submit *.zip \\
       --apple-id "\$APPLE_ID" --team-id "\$APPLE_TEAM_ID" \\
       --password "\$APPLE_APP_PASSWORD" --wait
     xcrun stapler staple "$(basename "$APP_PATH")"

================================================================================
EOF
fi
